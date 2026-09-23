/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { AddTransactionModal } from './components/AddTransactionModal';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';
import { LineChatSimulator } from './components/LineChatSimulator';
import { BudgetModal } from './components/BudgetModal';
import { GoogleSheetModal } from './components/GoogleSheetModal';
import {
  signInWithGoogle,
  signOutUser,
  initFirebaseAuthListener,
  getGoogleAccessToken,
  getCurrentUser,
} from './services/auth';
import {
  createExpenseSpreadsheet,
  appendTransactionRow,
  batchAppendTransactions,
} from './services/sheets';
import {
  loadTransactions,
  saveTransactions,
  loadBudgetConfig,
  saveBudgetConfig,
  loadSheetConfig,
  saveSheetConfig,
  loadLineMessages,
  saveLineMessages,
} from './services/storage';
import {
  Transaction,
  BudgetConfig,
  SheetConfig,
  UserProfile,
  LineChatMessage,
  ScannedReceiptResult,
  PaymentMethod,
} from './types';
import {
  Plus,
  Camera,
  MessageCircle,
  FileSpreadsheet,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

export default function App() {
  // Authentication state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // App core states
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudget] = useState<BudgetConfig>(loadBudgetConfig());
  const [sheetConfig, setSheetConfig] = useState<SheetConfig>(loadSheetConfig());
  const [lineMessages, setLineMessages] = useState<LineChatMessage[]>(loadLineMessages());

  // Date filter state (YYYY-MM)
  const currentYM = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentYM);

  // Modals state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isLineChatOpen, setIsLineChatOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);

  // Draft transaction to pass to AddTransactionModal (e.g. from AI scan)
  const [txDraft, setTxDraft] = useState<Partial<Transaction> | null>(null);
  const [isSyncingId, setIsSyncingId] = useState<string | null>(null);

  // Delete confirmation modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Initialize data and Firebase Auth
  useEffect(() => {
    setTransactions(loadTransactions());

    // Listen to Firebase auth changes
    const unsubscribe = initFirebaseAuthListener((currentUser) => {
      setUser(currentUser);
      const token = getGoogleAccessToken();
      setAuthToken(token);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Sync state changes to storage
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveBudgetConfig(budget);
  }, [budget]);

  useEffect(() => {
    saveSheetConfig(sheetConfig);
  }, [sheetConfig]);

  useEffect(() => {
    saveLineMessages(lineMessages);
  }, [lineMessages]);

  // Auth actions
  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      const profile = await signInWithGoogle();
      setUser(profile);
      const token = getGoogleAccessToken();
      setAuthToken(token);
      showToast(`เข้าสู่ระบบสำเร็จ: ${profile.displayName || profile.email}`);
    } catch (err: any) {
      console.error('Login error:', err);
      showToast(err?.message || 'ไม่สามารถเข้าสู่ระบบด้วย Google ได้', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
      setUser(null);
      setAuthToken(null);
      showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  // Check budget status and trigger LINE alert if budget is exceeded
  const checkBudgetAndAlert = (updatedTransactions: Transaction[]) => {
    const monthlyExpenses = updatedTransactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(selectedMonth))
      .reduce((sum, t) => sum + t.amount, 0);

    const limit = budget.monthlyBudget;
    if (budget.enableChatAlert && limit > 0 && monthlyExpenses > limit) {
      const overAmount = monthlyExpenses - limit;
      const alertMsg: LineChatMessage = {
        id: `alert-${Date.now()}`,
        sender: 'bot',
        text: `⚠️ [แจ้งเตือนด่วน: ใช้จ่ายเกินงบประมาณ!]\nยอดใช้จ่ายเดือนนี้ทะลุ ฿${monthlyExpenses.toLocaleString('th-TH', { maximumFractionDigits: 2 })}\nเกินงบที่ตั้งไว้ (฿${limit.toLocaleString('th-TH')}) ไปแล้ว +฿${overAmount.toLocaleString('th-TH', { maximumFractionDigits: 2 })}!\n\nกรุณาระมัดระวังการใช้จ่ายเพื่อสุขภาพทางการเงินที่ดีครับ`,
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        isAlert: true,
      };

      setLineMessages((prev) => [...prev, alertMsg]);
      showToast(`⚠️ ยอดใช้จ่ายเกินงบประมาณรายเดือนแล้ว +฿${overAmount.toLocaleString('th-TH', { maximumFractionDigits: 0 })}`, 'error');
    }
  };

  // Add a new transaction (manual or from AI scan)
  const handleSaveTransaction = async (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...data,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
    };

    // If Google Sheet is connected and sync requested, attempt direct write
    let synced = false;
    const token = authToken || getGoogleAccessToken();
    if (token && sheetConfig.spreadsheetId && data.syncedToSheet !== false) {
      try {
        await appendTransactionRow(token, sheetConfig.spreadsheetId, newTx, sheetConfig.sheetName);
        synced = true;
      } catch (err: any) {
        console.error('Sheet append error:', err);
      }
    }

    const finalTx: Transaction = { ...newTx, syncedToSheet: synced };
    const updated = [finalTx, ...transactions];
    setTransactions(updated);
    setTxDraft(null);

    // Budget check & LINE OA alert
    checkBudgetAndAlert(updated);

    showToast(`บันทึกรายการ "${finalTx.description}" ฿${finalTx.amount.toLocaleString()} เรียบร้อยแล้ว`);
  };

  // Google Sheet Sync for individual item
  const handleSyncToSheet = async (tx: Transaction) => {
    const token = authToken || getGoogleAccessToken();
    if (!token) {
      showToast('กรุณาเข้าสู่ระบบ Google Account ก่อนเพื่อซิงก์ชีต', 'error');
      setIsSheetModalOpen(true);
      return;
    }
    if (!sheetConfig.spreadsheetId) {
      showToast('กรุณาเชื่อมต่อ Google Sheet ก่อน', 'error');
      setIsSheetModalOpen(true);
      return;
    }

    try {
      setIsSyncingId(tx.id);
      await appendTransactionRow(token, sheetConfig.spreadsheetId, tx, sheetConfig.sheetName);
      setTransactions((prev) =>
        prev.map((t) => (t.id === tx.id ? { ...t, syncedToSheet: true } : t))
      );
      showToast(`ซิงก์รายการ "${tx.description}" ไปที่ Google Sheet แล้ว`);
    } catch (err: any) {
      console.error('Sync item error:', err);
      showToast('ไม่สามารถซิงก์ไปยัง Google Sheet ได้: ' + (err?.message || ''), 'error');
    } finally {
      setIsSyncingId(null);
    }
  };

  // Sync all pending transactions to Google Sheet
  const handleSyncAllToSheet = async () => {
    const token = authToken || getGoogleAccessToken();
    if (!token || !sheetConfig.spreadsheetId) {
      throw new Error('จำเป็นต้องเข้าสู่ระบบและเชื่อมต่อ Google Sheet ก่อน');
    }

    const pending = transactions.filter((t) => !t.syncedToSheet);
    if (pending.length === 0) return;

    await batchAppendTransactions(token, sheetConfig.spreadsheetId, sheetConfig.sheetName, pending);
    setTransactions((prev) => prev.map((t) => ({ ...t, syncedToSheet: true })));
    showToast(`ซิงก์ข้อมูล ${pending.length} รายการลง Google Sheet สำเร็จแล้ว`);
  };

  // Create brand new Google Sheet
  const handleCreateNewSheet = async () => {
    const token = authToken || getGoogleAccessToken();
    if (!token) {
      throw new Error('กรุณาเข้าสู่ระบบ Google Account ก่อน');
    }

    const title = `รายรับรายจ่ายส่วนตัว (${new Date().toLocaleDateString('th-TH')})`;
    const created = await createExpenseSpreadsheet(token, title);
    const newConfig: SheetConfig = {
      spreadsheetId: created.spreadsheetId,
      spreadsheetUrl: created.spreadsheetUrl,
      sheetName: 'รายรับรายจ่าย',
      lastSyncedAt: new Date().toISOString(),
      autoSync: true,
    };
    setSheetConfig(newConfig);

    // Automatically batch sync all existing transactions to this brand new sheet!
    if (transactions.length > 0) {
      try {
        await batchAppendTransactions(token, created.spreadsheetId, 'รายรับรายจ่าย', transactions);
        setTransactions((prev) => prev.map((t) => ({ ...t, syncedToSheet: true })));
      } catch (e) {
        console.warn('Initial sync to new sheet failed:', e);
      }
    }
    showToast(`สร้าง Google Sheet ใหม่ "${title}" สำเร็จแล้ว!`);
  };

  // Connect existing Google Sheet
  const handleConnectExistingSheet = async (idOrUrl: string) => {
    let sheetId = idOrUrl.trim();
    const match = sheetId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      sheetId = match[1];
    }

    if (!sheetId) {
      throw new Error('รูปแบบ Spreadsheet ID ไม่ถูกต้อง');
    }

    const updated: SheetConfig = {
      spreadsheetId: sheetId,
      sheetName: 'Transactions',
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/edit`,
      autoSync: true,
      lastSyncedAt: new Date().toISOString(),
    };

    setSheetConfig(updated);
    showToast('เชื่อมต่อ Google Sheet สำเร็จแล้ว');
  };

  // AI Receipt Scanned Handler
  const handleParsedReceipt = (result: ScannedReceiptResult, imageBase64: string) => {
    const parsedAmount = result.totalAmount || result.amount || 0;
    const parsedDate = result.date || new Date().toISOString().split('T')[0];
    const parsedTime = result.time || new Date().toTimeString().slice(0, 5);
    const parsedPayment = result.paymentMethod || 'credit_card';

    // Populate draft for confirmation modal
    setTxDraft({
      amount: parsedAmount,
      description: result.items?.length
        ? `${result.merchant || 'บิล'} (${result.items[0].name}${result.items.length > 1 ? ' ฯลฯ' : ''})`
        : result.merchant || 'ซื้อของ',
      category: result.category || 'อาหารและเครื่องดื่ม',
      paymentMethod: parsedPayment,
      date: parsedDate,
      time: parsedTime,
      merchant: result.merchant,
      notes: result.notes || (result.items?.map((i) => `${i.name}: ฿${i.price}`).join(', ') || undefined),
      receiptImage: imageBase64,
      type: 'expense',
    });

    // Also push message to LINE chat simulator
    const lineTxMessage: LineChatMessage = {
      id: `line-${Date.now()}`,
      sender: 'bot',
      text: `ตรวจพบใบเสร็จจาก ${result.merchant || 'ร้านค้า'} ยอดรวม ฿${parsedAmount.toLocaleString()} ชำระด้วย ${parsedPayment === 'cash' ? 'เงินสด' : 'บัตรเครดิต'}`,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      imageUrl: imageBase64,
      transaction: {
        id: 'preview',
        date: parsedDate,
        time: parsedTime,
        type: 'expense',
        category: result.category || 'อาหารและเครื่องดื่ม',
        description: result.merchant || 'ค่าใช้จ่าย',
        amount: parsedAmount,
        paymentMethod: parsedPayment,
        merchant: result.merchant,
        createdAt: Date.now(),
      },
    };
    setLineMessages((prev) => [...prev, lineTxMessage]);

    // Open add transaction modal to review and confirm
    setIsAddTxOpen(true);
  };

  // Delete transaction with confirmation dialog
  const handleDeleteTransaction = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (!deletingId) return;
    setTransactions((prev) => prev.filter((t) => t.id !== deletingId));
    setDeletingId(null);
    showToast('ลบรายการเรียบร้อยแล้ว');
  };

  // LINE Chat Simulator Interactions
  const handleLineSendMessage = (text: string) => {
    const userMsg: LineChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    setLineMessages((prev) => [...prev, userMsg]);

    // Compute monthly numbers
    const monthlyTxs = transactions.filter((t) => t.date.startsWith(selectedMonth));
    const totalExp = monthlyTxs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const cashExp = monthlyTxs.filter((t) => t.type === 'expense' && t.paymentMethod === 'cash').reduce((s, t) => s + t.amount, 0);
    const ccExp = monthlyTxs.filter((t) => t.type === 'expense' && t.paymentMethod === 'credit_card').reduce((s, t) => s + t.amount, 0);
    const transferExp = monthlyTxs.filter((t) => t.type === 'expense' && (t.paymentMethod === 'transfer' || t.paymentMethod === 'bank_transfer' || t.paymentMethod === 'promptpay')).reduce((s, t) => s + t.amount, 0);

    // Bot response generator based on Thai commands
    setTimeout(() => {
      let replyText = '';
      let isAlert = false;

      if (text.includes('สรุป') || text.includes('รายงาน')) {
        replyText = `📊 สรุปยอดค่าใช้จ่ายเดือนนี้:\n• รายจ่ายรวม: ฿${totalExp.toLocaleString('th-TH', { minimumFractionDigits: 2 })}\n• 💵 เงินสด: ฿${cashExp.toLocaleString('th-TH')}\n• 💳 บัตรเครดิต: ฿${ccExp.toLocaleString('th-TH')}\n• 📲 โอนเงิน / พร้อมเพย์: ฿${transferExp.toLocaleString('th-TH')}\n• งบประมาณคงเหลือ: ฿${Math.max(0, budget.monthlyBudget - totalExp).toLocaleString('th-TH')}`;
      } else if (text.includes('งบ') || text.includes('budget')) {
        const percent = budget.monthlyBudget > 0 ? (totalExp / budget.monthlyBudget) * 100 : 0;
        replyText = `💰 สถานะงบประมาณรายเดือน:\n• งบที่ตั้งไว้: ฿${budget.monthlyBudget.toLocaleString('th-TH')}\n• ใช้ไปแล้ว: ฿${totalExp.toLocaleString('th-TH')} (${percent.toFixed(1)}%)\n• สถานะ: ${totalExp > budget.monthlyBudget ? '⚠️ เกินงบแล้ว!' : 'ปกติ เรียบร้อยดี'}`;
        if (totalExp > budget.monthlyBudget) isAlert = true;
      } else if (text.includes('บัตรเครดิต') || text.includes('รูดบัตร')) {
        replyText = `💳 ยอดใช้จ่ายผ่านบัตรเครดิตเดือนนี้:\nรวมทั้งหมด ฿${ccExp.toLocaleString('th-TH', { minimumFractionDigits: 2 })}\n(คิดเป็น ${totalExp > 0 ? ((ccExp / totalExp) * 100).toFixed(1) : 0}% ของค่าใช้จ่ายทั้งหมด)`;
      } else if (text.includes('เงินสด')) {
        replyText = `💵 ยอดใช้จ่ายเงินสดเดือนนี้:\nรวมทั้งหมด ฿${cashExp.toLocaleString('th-TH', { minimumFractionDigits: 2 })}\n(คิดเป็น ${totalExp > 0 ? ((cashExp / totalExp) * 100).toFixed(1) : 0}% ของค่าใช้จ่ายทั้งหมด)`;
      } else if (text.includes('โอน') || text.includes('พร้อมเพย์') || text.toLowerCase().includes('promptpay') || text.includes('ธนาคาร')) {
        replyText = `📲 ยอดโอนเงินและพร้อมเพย์เดือนนี้:\nรวมทั้งหมด ฿${transferExp.toLocaleString('th-TH', { minimumFractionDigits: 2 })}\n(คิดเป็น ${totalExp > 0 ? ((transferExp / totalExp) * 100).toFixed(1) : 0}% ของค่าใช้จ่ายทั้งหมด)`;
      } else {
        // Try to parse quick text like "ข้าวมันไก่ 60 เงินสด" or "ค่าหอ 4500 โอนเงิน" or "ชาบู 399 พร้อมเพย์"
        const numbers = text.match(/\d+(\.\d+)?/);
        if (numbers) {
          const amt = parseFloat(numbers[0]);
          const isTransfer = text.includes('โอน') || text.includes('พร้อมเพย์') || text.toLowerCase().includes('promptpay') || text.includes('qr') || text.includes('ธนาคาร');
          const isCC = text.includes('บัตร') || text.includes('เครดิต');
          const pMethod: PaymentMethod = isTransfer ? 'transfer' : isCC ? 'credit_card' : 'cash';
          
          const desc = text
            .replace(numbers[0], '')
            .replace(/บาท/g, '')
            .replace(/เงินสด/g, '')
            .replace(/บัตรเครดิต/g, '')
            .replace(/บัตร/g, '')
            .replace(/โอนธนาคาร/g, '')
            .replace(/โอนเงิน/g, '')
            .replace(/โอน/g, '')
            .replace(/พร้อมเพย์/g, '')
            .trim() || 'รายการค่าใช้จ่าย';

          const quickTx: Omit<Transaction, 'id' | 'createdAt'> = {
            date: new Date().toISOString().split('T')[0],
            time: new Date().toTimeString().slice(0, 5),
            type: 'expense',
            category: 'อาหารและเครื่องดื่ม',
            description: desc,
            amount: amt,
            paymentMethod: pMethod,
            syncedToSheet: Boolean(sheetConfig.spreadsheetId),
          };

          handleSaveTransaction(quickTx);
          const methodLabel = pMethod === 'cash' ? '💵 เงินสด' : pMethod === 'credit_card' ? '💳 บัตรเครดิต' : '📲 โอนเงิน/พร้อมเพย์';
          replyText = `✅ บันทึกรายการ "${desc}" จำนวน ฿${amt.toLocaleString()} (${methodLabel}) เรียบร้อยแล้วครับ!`;
        } else {
          replyText = `สวัสดีครับ! คุณสามารถ:\n1. 📸 กดส่งรูปภาพใบเสร็จ/สลิป AI จะอ่านและกรอกข้อมูลให้อัตโนมัติ\n2. พิมพ์รายการ เช่น "กาแฟ 65 เงินสด", "ค่าไฟ 1500 โอนเงิน", หรือ "ชาบู 399 พร้อมเพย์"\n3. กดปุ่มลัดด้านล่างเพื่อดูสรุปยอดหรือเช็คงบประมาณครับ`;
        }
      }

      const botReply: LineChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        isAlert,
      };

      setLineMessages((prev) => [...prev, botReply]);
    }, 400);
  };

  // Test budget alert trigger button
  const handleTriggerTestAlert = () => {
    const monthlyExpenses = transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(selectedMonth))
      .reduce((sum, t) => sum + t.amount, 0);

    const testAlertMsg: LineChatMessage = {
      id: `test-alert-${Date.now()}`,
      sender: 'bot',
      text: `⚠️ [ทดสอบระบบแจ้งเตือนงบเกิน]\nงบประมาณรายเดือน: ฿${budget.monthlyBudget.toLocaleString('th-TH')}\nยอดใช้จ่ายปัจจุบัน: ฿${monthlyExpenses.toLocaleString('th-TH')}\n\nระบบจะส่งข้อความแจ้งเตือนเช่นนี้อัตโนมัติเมื่อมีการบันทึกบิลที่ทำให้ยอดเกินงบครับ!`,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      isAlert: true,
    };

    setLineMessages((prev) => [...prev, testAlertMsg]);
    setIsLineChatOpen(true);
    showToast('ส่งข้อความทดสอบแจ้งเตือนไปยังแชท LINE OA เรียบร้อยแล้ว');
  };

  const pendingSyncCount = transactions.filter((t) => !t.syncedToSheet).length;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`px-4 py-3 rounded-2xl shadow-lg border text-xs sm:text-sm font-semibold flex items-center gap-2 ${
              toast.type === 'error'
                ? 'bg-red-600 text-white border-red-700'
                : toast.type === 'info'
                ? 'bg-stone-800 text-white border-stone-900'
                : 'bg-emerald-600 text-white border-emerald-700'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
        sheetConfig={sheetConfig}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenLineChat={() => setIsLineChatOpen(true)}
        onOpenSheetModal={() => setIsSheetModalOpen(true)}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        unreadChatCount={lineMessages.filter((m) => m.isAlert).length}
      />

      {/* Main Content Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Quick Action Ribbon for easy accessibility */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-2xl text-white shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base sm:text-lg">
                ระบบจัดการรายรับ-รายจ่ายส่วนตัว
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 text-white backdrop-blur-xs">
                Minimal Red
              </span>
            </div>
            <p className="text-xs text-red-100 mt-0.5">
              แยกเงินสดและบัตรเครดิต • บันทึกอัตโนมัติด้วย AI ใบเสร็จ • ซิงก์ Google Sheets • เตือนงบเกินใน LINE
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-red-700 hover:bg-red-50 text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4 text-red-600" />
              <span>ถ่ายบิลด้วย AI</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </button>

            <button
              onClick={() => {
                setTxDraft(null);
                setIsAddTxOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-800/80 hover:bg-red-800 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มรายการ</span>
            </button>
          </div>
        </div>

        {/* Monthly Dashboard with Pie Chart & Cash vs Credit Card Breakdowns */}
        <Dashboard
          transactions={transactions}
          budget={budget}
          selectedMonth={selectedMonth}
          onChangeMonth={setSelectedMonth}
          onOpenLineChat={() => setIsLineChatOpen(true)}
          onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        />

        {/* Transactions Table & History */}
        <TransactionList
          transactions={transactions}
          onAddTransaction={() => {
            setTxDraft(null);
            setIsAddTxOpen(true);
          }}
          onDeleteTransaction={handleDeleteTransaction}
          onSyncToSheet={handleSyncToSheet}
          isSyncingId={isSyncingId}
          hasGoogleSheet={Boolean(sheetConfig.spreadsheetId)}
        />

      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/80 bg-white py-4 px-4 text-center text-xs text-stone-400">
        <p>
          ระบบรายรับรายจ่ายส่วนตัว (Minimal Red) • เชื่อมต่อ Google Sheets & LINE Official Account พร้อม AI Gemini
        </p>
      </footer>

      {/* Floating Action Buttons for quick Mobile Access */}
      <div className="fixed bottom-5 right-5 z-20 flex flex-col gap-2.5 sm:hidden">
        <button
          onClick={() => setIsLineChatOpen(true)}
          className="w-12 h-12 rounded-full bg-emerald-500 text-white shadow-lg flex items-center justify-center cursor-pointer"
          title="แชท LINE OA"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
        <button
          onClick={() => setIsScannerOpen(true)}
          className="w-12 h-12 rounded-full bg-red-600 text-white shadow-lg flex items-center justify-center cursor-pointer"
          title="ถ่ายบิล AI"
        >
          <Camera className="w-6 h-6" />
        </button>
      </div>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => {
          setIsAddTxOpen(false);
          setTxDraft(null);
        }}
        onSave={handleSaveTransaction}
        hasGoogleSheet={Boolean(sheetConfig.spreadsheetId)}
        initialData={txDraft}
      />

      <ReceiptScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onParsedResult={handleParsedReceipt}
      />

      <LineChatSimulator
        isOpen={isLineChatOpen}
        onClose={() => setIsLineChatOpen(false)}
        messages={lineMessages}
        onSendMessage={handleLineSendMessage}
        onSimulateReceiptUpload={() => {
          setIsLineChatOpen(false);
          setIsScannerOpen(true);
        }}
        transactions={transactions}
        budget={budget}
        selectedMonth={selectedMonth}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        budget={budget}
        onSave={(newCfg) => {
          setBudget(newCfg);
          showToast('บันทึกการตั้งค่างบประมาณและการแจ้งเตือนเรียบร้อยแล้ว');
        }}
        onTriggerTestAlert={handleTriggerTestAlert}
        currentExpense={transactions
          .filter((t) => t.type === 'expense' && t.date.startsWith(selectedMonth))
          .reduce((sum, t) => sum + t.amount, 0)}
      />

      <GoogleSheetModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        sheetConfig={sheetConfig}
        hasAuthToken={Boolean(authToken || getGoogleAccessToken())}
        onLogin={handleLogin}
        onCreateNewSheet={handleCreateNewSheet}
        onConnectExistingSheet={handleConnectExistingSheet}
        onSyncAllToSheet={handleSyncAllToSheet}
        pendingCount={pendingSyncCount}
      />

      {/* Destructive Action Confirmation Dialog (Delete Transaction) */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2 rounded-xl bg-red-50">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-stone-900 text-sm">ยืนยันการลบรายการ</h4>
            </div>
            <p className="text-xs text-stone-600 mt-2">
              คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้? การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
