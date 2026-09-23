export type TransactionType = 'expense' | 'income';
export type PaymentMethod = 'cash' | 'credit_card' | 'bank_transfer' | 'promptpay' | 'transfer';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  merchant?: string;
  notes?: string;
  receiptImage?: string; // base64 or preview url
  syncedToSheet?: boolean;
  createdAt: number;
}

export interface BudgetConfig {
  monthlyBudget: number; // e.g. 15000 THB
  warningThresholdPercent: number; // e.g. 80%
  alertThresholdPercent: number; // e.g. 100%
  enableChatAlert: boolean;
}

export interface SheetConfig {
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  sheetName: string;
  lastSyncedAt: string | null;
  autoSync: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface ScannedReceiptResult {
  merchant?: string;
  date?: string;
  time?: string;
  totalAmount?: number;
  amount?: number;
  category?: string;
  paymentMethod?: 'cash' | 'credit_card' | 'bank_transfer' | 'promptpay' | 'transfer';
  items?: Array<{ name: string; price?: number }>;
  notes?: string;
}

export interface LineChatMessage {
  id: string;
  sender: 'user' | 'bot';
  timestamp: string;
  text?: string;
  imageUrl?: string;
  transaction?: Transaction;
  isAlert?: boolean;
  alertType?: 'warning' | 'danger';
}

export const DEFAULT_EXPENSE_CATEGORIES = [
  'อาหารและเครื่องดื่ม',
  'ช้อปปิ้ง',
  'ของใช้ในบ้าน',
  'การเดินทาง',
  'ค่าบริการ/บิล',
  'บันเทิง/พักผ่อน',
  'สุขภาพ',
  'อื่นๆ',
];

export const DEFAULT_INCOME_CATEGORIES = [
  'เงินเดือน',
  'ธุรกิจ/การค้า',
  'ฟรีแลนซ์/งานเสริม',
  'โบนัส/ปันผล',
  'อื่นๆ',
];
