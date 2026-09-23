import { Transaction, BudgetConfig, SheetConfig, LineChatMessage } from '../types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'pet_transactions_v1',
  BUDGET: 'pet_budget_v1',
  SHEET: 'pet_sheet_v1',
  LINE_MESSAGES: 'pet_line_chat_v1',
};

export const DEFAULT_BUDGET: BudgetConfig = {
  monthlyBudget: 15000,
  warningThresholdPercent: 80,
  alertThresholdPercent: 100,
  enableChatAlert: true,
};

export const DEFAULT_SHEET_CONFIG: SheetConfig = {
  spreadsheetId: null,
  spreadsheetUrl: null,
  sheetName: 'รายรับรายจ่าย',
  lastSyncedAt: null,
  autoSync: true,
};

// Seed realistic sample transactions for the current month if storage is empty
export const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-001',
    date: '2026-09-01',
    time: '09:00',
    type: 'income',
    category: 'เงินเดือน',
    description: 'เงินเดือนประจำเดือนกันยายน',
    amount: 38000,
    paymentMethod: 'transfer',
    merchant: 'บริษัท เทคโซลูชั่น จำกัด',
    createdAt: Date.now() - 21 * 86400000,
    syncedToSheet: true,
  },
  {
    id: 'tx-002',
    date: '2026-09-03',
    time: '12:30',
    type: 'expense',
    category: 'อาหารและเครื่องดื่ม',
    description: 'ข้าวกะเพราหมูกรอบไข่ดาว + ชานม',
    amount: 140,
    paymentMethod: 'cash',
    merchant: 'ร้านป้าศรี อาหารตามสั่ง',
    createdAt: Date.now() - 19 * 86400000,
    syncedToSheet: true,
  },
  {
    id: 'tx-003',
    date: '2026-09-05',
    time: '18:45',
    type: 'expense',
    category: 'ช้อปปิ้ง',
    description: 'เสื้อเชิ้ตทำงาน Uniqlo',
    amount: 990,
    paymentMethod: 'credit_card',
    merchant: 'Uniqlo Central Rama 9',
    notes: 'โปรโมชั่นบัตรเครดิต KBank ได้แต้ม x2',
    createdAt: Date.now() - 17 * 86400000,
    syncedToSheet: true,
  },
  {
    id: 'tx-004',
    date: '2026-09-08',
    time: '19:20',
    type: 'expense',
    category: 'ของใช้ในบ้าน',
    description: 'ของใช้เข้าบ้าน ซุปเปอร์มาร์เก็ต',
    amount: 1850,
    paymentMethod: 'credit_card',
    merchant: 'Lotus Supermarket',
    notes: 'น้ำยาซักผ้า ข้าวสาร ของสด',
    createdAt: Date.now() - 14 * 86400000,
    syncedToSheet: true,
  },
  {
    id: 'tx-005',
    date: '2026-09-11',
    time: '08:15',
    type: 'expense',
    category: 'การเดินทาง',
    description: 'เติมเงินบัตร BTS รถไฟฟ้า',
    amount: 500,
    paymentMethod: 'cash',
    merchant: 'BTS อโศก',
    createdAt: Date.now() - 11 * 86400000,
    syncedToSheet: true,
  },
  {
    id: 'tx-006',
    date: '2026-09-14',
    time: '14:10',
    type: 'expense',
    category: 'อาหารและเครื่องดื่ม',
    description: 'Iced Americano + Croissant',
    amount: 235,
    paymentMethod: 'credit_card',
    merchant: 'Starbucks Coffee',
    createdAt: Date.now() - 8 * 86400000,
    syncedToSheet: true,
  },
  {
    id: 'tx-007',
    date: '2026-09-17',
    time: '19:50',
    type: 'expense',
    category: 'อาหารและเครื่องดื่ม',
    description: 'ทานบุฟเฟต์สุกี้ตี๋น้อยกับเพื่อน',
    amount: 552,
    paymentMethod: 'cash',
    merchant: 'สุกี้ตี๋น้อย สาขาเดอะมอลล์',
    createdAt: Date.now() - 5 * 86400000,
    syncedToSheet: true,
  },
  {
    id: 'tx-008',
    date: '2026-09-20',
    time: '11:00',
    type: 'expense',
    category: 'ค่าบริการ/บิล',
    description: 'ค่าบริการอินเทอร์เน็ตบ้าน AIS Fibre',
    amount: 640.93,
    paymentMethod: 'credit_card',
    merchant: 'AIS Telewiz',
    createdAt: Date.now() - 2 * 86400000,
    syncedToSheet: false,
  },
  {
    id: 'tx-009',
    date: '2026-09-21',
    time: '09:30',
    type: 'expense',
    category: 'ของใช้ในบ้าน',
    description: 'โอนชำระค่าเช่าห้อง / ค่าส่วนกลางคอนโด',
    amount: 5500,
    paymentMethod: 'transfer',
    merchant: 'นิติบุคคลคอนโดมิเนียม (KBANK)',
    notes: 'โอนผ่านบัญชีธนาคารกสิกรไทย',
    createdAt: Date.now() - 1 * 86400000,
    syncedToSheet: true,
  },
  {
    id: 'tx-010',
    date: '2026-09-22',
    time: '12:15',
    type: 'expense',
    category: 'อาหารและเครื่องดื่ม',
    description: 'สแกนจ่าย QR พร้อมเพย์ ก๋วยเตี๋ยวเรือเนื้อพิเศษ',
    amount: 95,
    paymentMethod: 'transfer',
    merchant: 'ร้านก๋วยเตี๋ยวเรืออยุธยา (พร้อมเพย์)',
    notes: 'สแกน QR Code พร้อมเพย์ PromptPay',
    createdAt: Date.now() - 5 * 3600000,
    syncedToSheet: true,
  },
  {
    id: 'tx-011',
    date: '2026-09-22',
    time: '15:30',
    type: 'expense',
    category: 'ค่าบริการ/บิล',
    description: 'โอนเงินค่าไฟฟ้า MEA Smart Life',
    amount: 1250,
    paymentMethod: 'transfer',
    merchant: 'การไฟฟ้านครหลวง',
    notes: 'โอนผ่าน SCB Mobile Banking',
    createdAt: Date.now() - 2 * 3600000,
    syncedToSheet: true,
  },
  {
    id: 'tx-012',
    date: '2026-09-22',
    time: '18:10',
    type: 'expense',
    category: 'ช้อปปิ้ง',
    description: 'สแกน PromptPay ซื้อชานมไข่มุก & เบเกอรี่',
    amount: 165,
    paymentMethod: 'transfer',
    merchant: 'ร้านเบเกอรี่โฮมเมด (PromptPay QR)',
    notes: 'สแกนจ่าย PromptPay ป้ายหน้าร้าน',
    createdAt: Date.now() - 1800000,
    syncedToSheet: false,
  },
  // Sample transactions from earlier months of 2026 for Yearly summary
  {
    id: 'tx-013',
    date: '2026-08-01',
    time: '09:00',
    type: 'income',
    category: 'เงินเดือน',
    description: 'เงินเดือนประจำเดือนสิงหาคม',
    amount: 38000,
    paymentMethod: 'transfer',
    merchant: 'บริษัท เทคโซลูชั่น จำกัด',
    createdAt: Date.now() - 52 * 86400000,
    syncedToSheet: true,
  },
  {
    id: 'tx-014',
    date: '2026-08-10',
    time: '19:30',
    type: 'expense',
    category: 'อาหารและเครื่องดื่ม',
    description: 'ดินเนอร์วันเกิดครอบครัว',
    amount: 2850,
    paymentMethod: 'credit_card',
    merchant: 'MK Restaurants',
    createdAt: Date.now() - 43 * 86400000,
    syncedToSheet: true,
  },
  {
    id: 'tx-015',
    date: '2026-08-15',
    time: '11:20',
    type: 'expense',
    category: 'ของใช้ในบ้าน',
    description: 'ซื้อเฟอร์นิเจอร์โต๊ะทำงาน Index',
    amount: 4200,
    paymentMethod: 'credit_card',
    merchant: 'Index Living Mall',
    createdAt: Date.now() - 38 * 86400000,
    syncedToSheet: true,
  },
  {
    id: 'tx-016',
    date: '2026-08-25',
    time: '14:00',
    type: 'expense',
    category: 'การเดินทาง',
    description: 'เติมน้ำมันรถยนต์ PTT Station',
    amount: 1400,
    paymentMethod: 'transfer',
    merchant: 'PTT Station รัชดา',
    createdAt: Date.now() - 28 * 86400000,
    syncedToSheet: true,
  },
  {
    id: 'tx-017',
    date: '2026-07-01',
    time: '09:00',
    type: 'income',
    category: 'เงินเดือน',
    description: 'เงินเดือนประจำเดือนกรกฎาคม',
    amount: 38000,
    paymentMethod: 'transfer',
    merchant: 'บริษัท เทคโซลูชั่น จำกัด',
    createdAt: Date.now() - 83 * 86400000,
    syncedToSheet: true,
  },
  {
    id: 'tx-018',
    date: '2026-07-12',
    time: '16:00',
    type: 'expense',
    category: 'ท่องเที่ยว',
    description: 'ตั๋วเครื่องบินไปกลับเชียงใหม่',
    amount: 3600,
    paymentMethod: 'credit_card',
    merchant: 'AirAsia Thailand',
    createdAt: Date.now() - 72 * 86400000,
    syncedToSheet: true,
  },
  {
    id: 'tx-019',
    date: '2026-07-20',
    time: '13:30',
    type: 'expense',
    category: 'ของใช้ในบ้าน',
    description: 'โอนค่าเช่าคอนโดประจำเดือน',
    amount: 5500,
    paymentMethod: 'transfer',
    merchant: 'นิติบุคคลคอนโดมิเนียม',
    createdAt: Date.now() - 64 * 86400000,
    syncedToSheet: true,
  },
  {
    id: 'tx-020',
    date: '2026-06-01',
    time: '09:00',
    type: 'income',
    category: 'เงินเดือน',
    description: 'เงินเดือนประจำเดือนมิถุนายน',
    amount: 38000,
    paymentMethod: 'transfer',
    merchant: 'บริษัท เทคโซลูชั่น จำกัด',
    createdAt: Date.now() - 113 * 86400000,
    syncedToSheet: true,
  },
  {
    id: 'tx-021',
    date: '2026-06-18',
    time: '15:20',
    type: 'expense',
    category: 'สุขภาพ',
    description: 'ตรวจสุขภาพประจำปี รพ.กรุงเทพ',
    amount: 3200,
    paymentMethod: 'credit_card',
    merchant: 'โรงพยาบาลกรุงเทพ',
    createdAt: Date.now() - 96 * 86400000,
    syncedToSheet: true,
  },
];

export const loadTransactions = (): Transaction[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      saveTransactions(SAMPLE_TRANSACTIONS);
      return SAMPLE_TRANSACTIONS;
    }
    const parsed: Transaction[] = JSON.parse(raw);
    // Normalize any legacy 'bank_transfer' or 'promptpay' to unified 'transfer'
    return parsed.map((t) => {
      if ((t.paymentMethod as any) === 'bank_transfer' || (t.paymentMethod as any) === 'promptpay') {
        return { ...t, paymentMethod: 'transfer' };
      }
      return t;
    });
  } catch {
    return SAMPLE_TRANSACTIONS;
  }
};

export const saveTransactions = (transactions: Transaction[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed to save transactions to localStorage', e);
  }
};

export const loadBudgetConfig = (): BudgetConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUDGET);
    if (!raw) return DEFAULT_BUDGET;
    return { ...DEFAULT_BUDGET, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_BUDGET;
  }
};

export const saveBudgetConfig = (config: BudgetConfig) => {
  try {
    localStorage.setItem(STORAGE_KEYS.BUDGET, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save budget config to localStorage', e);
  }
};

export const loadSheetConfig = (): SheetConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SHEET);
    if (!raw) return DEFAULT_SHEET_CONFIG;
    return { ...DEFAULT_SHEET_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SHEET_CONFIG;
  }
};

export const saveSheetConfig = (config: SheetConfig) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SHEET, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save sheet config to localStorage', e);
  }
};

export const loadLineMessages = (): LineChatMessage[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LINE_MESSAGES);
    if (!raw) {
      const initial: LineChatMessage[] = [
        {
          id: 'msg-welcome',
          sender: 'bot',
          timestamp: '10:00',
          text: 'สวัสดีครับ! ยินดีต้อนรับสู่ระบบผู้ช่วยบันทึกรายรับรายจ่ายอัตโนมัติ 🔴\n\n📸 คุณสามารถส่งรูปถ่ายใบเสร็จหรือสลิปมาที่นี่ได้เลย AI จะช่วยอ่านยอดเงินและบันทึกลง Google Sheet พร้อมแจ้งเตือนเมื่อใช้จ่ายเกินงบครับ!',
        },
      ];
      saveLineMessages(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveLineMessages = (messages: LineChatMessage[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.LINE_MESSAGES, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save line messages', e);
  }
};
