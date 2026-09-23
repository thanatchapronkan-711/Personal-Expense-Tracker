import { Transaction } from '../types';

export interface GoogleSpreadsheetInfo {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
}

const DEFAULT_HEADERS = [
  'รหัสรายการ (ID)',
  'วันที่ (Date)',
  'เวลา (Time)',
  'ประเภท (Type)',
  'หมวดหมู่ (Category)',
  'รายการ (Description)',
  'จำนวนเงิน (THB)',
  'ช่องทางชำระเงิน (Payment)',
  'ร้านค้า (Merchant)',
  'บันทึก (Notes)',
];

/**
 * Creates a new Google Spreadsheet formatted for personal expenses.
 */
export async function createExpenseSpreadsheet(
  accessToken: string,
  customTitle?: string
): Promise<GoogleSpreadsheetInfo> {
  const title = customTitle || `รายรับรายจ่ายส่วนตัว - ${new Date().getFullYear()}`;
  
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: 'รายรับรายจ่าย',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Failed to create spreadsheet (${response.status})`);
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Write default header row
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'รายรับรายจ่าย'!A1:J1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [DEFAULT_HEADERS],
      }),
    }
  );

  return {
    spreadsheetId,
    spreadsheetUrl,
    title,
  };
}

/**
 * Validates access to an existing Google Spreadsheet
 */
export async function getSpreadsheetDetails(
  accessToken: string,
  spreadsheetId: string
): Promise<GoogleSpreadsheetInfo> {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}?fields=spreadsheetId,properties.title,sheets.properties.title`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Cannot access Google Sheet. Please check ID and permissions.');
  }

  const data = await response.json();
  return {
    spreadsheetId: data.spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
    title: data.properties?.title || 'Google Sheet',
  };
}

export function formatPaymentMethodThai(method: string): string {
  switch (method) {
    case 'cash':
      return 'เงินสด';
    case 'credit_card':
      return 'บัตรเครดิต';
    case 'transfer':
    case 'bank_transfer':
    case 'promptpay':
      return 'โอนเงิน / พร้อมเพย์';
    default:
      return method;
  }
}

/**
 * Append one transaction to the connected Google Sheet
 */
export async function appendTransactionToSheet(
  accessToken: string,
  spreadsheetId: string,
  transaction: Transaction,
  sheetTabName = 'รายรับรายจ่าย'
): Promise<void> {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  const paymentLabel = formatPaymentMethodThai(transaction.paymentMethod);

  const typeLabel = transaction.type === 'expense' ? 'รายจ่าย' : 'รายรับ';

  const row = [
    transaction.id,
    transaction.date,
    transaction.time || '',
    typeLabel,
    transaction.category,
    transaction.description,
    transaction.amount,
    paymentLabel,
    transaction.merchant || '-',
    transaction.notes || '-',
  ];

  // First try with custom tab name, fallback to Sheet1 if needed
  let range = encodeURIComponent(`'${sheetTabName}'!A:J`);
  let res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${range}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    }
  );

  if (!res.ok) {
    // Retry with Sheet1
    range = encodeURIComponent('Sheet1!A:J');
    res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${range}:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [row],
        }),
      }
    );
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to append row to Google Sheets');
  }
}

export const appendTransactionRow = appendTransactionToSheet;

/**
 * Batch append multiple transactions to the connected Google Sheet
 */
export async function batchAppendTransactions(
  accessToken: string,
  spreadsheetId: string,
  sheetTabName = 'รายรับรายจ่าย',
  transactions: Transaction[]
): Promise<void> {
  if (transactions.length === 0) return;
  const cleanId = extractSpreadsheetId(spreadsheetId);
  
  const rows = transactions.map((transaction) => {
    const paymentLabel = formatPaymentMethodThai(transaction.paymentMethod);

    const typeLabel = transaction.type === 'expense' ? 'รายจ่าย' : 'รายรับ';

    return [
      transaction.id,
      transaction.date,
      transaction.time || '',
      typeLabel,
      transaction.category,
      transaction.description,
      transaction.amount,
      paymentLabel,
      transaction.merchant || '-',
      transaction.notes || '-',
    ];
  });

  let range = encodeURIComponent(`'${sheetTabName}'!A:J`);
  let res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${range}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: rows,
      }),
    }
  );

  if (!res.ok) {
    range = encodeURIComponent('Sheet1!A:J');
    res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${range}:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: rows,
        }),
      }
    );
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Failed to batch append rows to Google Sheets');
  }
}

/**
 * Helper to extract spreadsheet ID from either a raw ID or full Google Sheet URL
 */
export function extractSpreadsheetId(input: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (urlMatch && urlMatch[1]) {
    return urlMatch[1];
  }
  return trimmed;
}
