import React, { useState } from 'react';
import {
  X,
  CreditCard,
  Banknote,
  Smartphone,
  Landmark,
  QrCode,
  Calendar,
  Clock,
  Store,
  FileSpreadsheet,
} from 'lucide-react';
import {
  Transaction,
  TransactionType,
  PaymentMethod,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from '../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  hasGoogleSheet: boolean;
  initialData?: Partial<Transaction> | null;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  hasGoogleSheet,
  initialData,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toTimeString().slice(0, 5);

  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [amount, setAmount] = useState<string>(
    initialData?.amount ? String(initialData.amount) : ''
  );
  const [description, setDescription] = useState<string>(initialData?.description || '');
  const [category, setCategory] = useState<string>(
    initialData?.category || DEFAULT_EXPENSE_CATEGORIES[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initialData?.paymentMethod || 'credit_card'
  );
  const [date, setDate] = useState<string>(initialData?.date || today);
  const [time, setTime] = useState<string>(initialData?.time || currentTime);
  const [merchant, setMerchant] = useState<string>(initialData?.merchant || '');
  const [notes, setNotes] = useState<string>(initialData?.notes || '');
  const [syncToSheet, setSyncToSheet] = useState<boolean>(hasGoogleSheet);

  if (!isOpen) return null;

  const categories = type === 'expense' ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_INCOME_CATEGORIES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('กรุณากรอกจำนวนเงินที่ถูกต้อง');
      return;
    }
    if (!description.trim()) {
      alert('กรุณากรอกชื่อรายการ');
      return;
    }

    onSave({
      date,
      time,
      type,
      category,
      description: description.trim(),
      amount: parsedAmount,
      paymentMethod,
      merchant: merchant.trim() || undefined,
      notes: notes.trim() || undefined,
      receiptImage: initialData?.receiptImage,
      syncedToSheet: syncToSheet && hasGoogleSheet,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h3 className="font-bold text-stone-900 text-lg">
              {initialData ? 'ตรวจสอบและบันทึกรายการ' : 'เพิ่มรายการใหม่'}
            </h3>
            <p className="text-xs text-stone-500">
              บันทึกรายรับหรือรายจ่าย พร้อมแยกช่องทางชำระเงิน
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Type Toggle: Expense vs Income */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType('expense');
                if (!DEFAULT_EXPENSE_CATEGORIES.includes(category)) {
                  setCategory(DEFAULT_EXPENSE_CATEGORIES[0]);
                }
              }}
              className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              รายจ่าย (Expense)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('income');
                if (!DEFAULT_INCOME_CATEGORIES.includes(category)) {
                  setCategory(DEFAULT_INCOME_CATEGORIES[0]);
                }
              }}
              className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              รายรับ (Income)
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              จำนวนเงิน (บาท) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-lg">
                ฿
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xl font-bold rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-stone-900"
              />
            </div>
          </div>

          {/* Payment Method Selector (เงินสด, บัตรเครดิต, โอนเงิน/พร้อมเพย์) */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">
              ช่องทางการชำระเงิน *
            </label>
            <div className="grid grid-cols-3 gap-2">
              
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold ring-2 ring-emerald-500/20'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-600 mb-1" />
                <span>เงินสด</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('credit_card')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  paymentMethod === 'credit_card'
                    ? 'border-rose-600 bg-rose-50 text-rose-900 font-semibold ring-2 ring-rose-500/20'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <CreditCard className="w-5 h-5 text-rose-600 mb-1" />
                <span>บัตรเครดิต</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                  paymentMethod === 'transfer' || paymentMethod === 'bank_transfer' || paymentMethod === 'promptpay'
                    ? 'border-sky-600 bg-sky-50 text-sky-900 font-semibold ring-2 ring-sky-500/20'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Landmark className="w-5 h-5 text-sky-600 mb-1" />
                <span>โอนเงิน/พร้อมเพย์</span>
              </button>

            </div>
          </div>

          {/* Description & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                ชื่อรายการ *
              </label>
              <input
                type="text"
                required
                placeholder="เช่น ข้าวกะเพรา, ค่าน้ำมัน, ช้อปปิ้ง"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                หมวดหมู่ *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-stone-900 bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date, Time & Merchant */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-stone-600 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-stone-400" />
                <span>วันที่</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-stone-600 mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-stone-400" />
                <span>เวลา</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-stone-600 mb-1 flex items-center gap-1">
                <Store className="w-3 h-3 text-stone-400" />
                <span>ร้านค้า / สถานที่</span>
              </label>
              <input
                type="text"
                placeholder="เช่น เซเว่น, โลตัส"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              บันทึกช่วยจำ (ไม่บังคับ)
            </label>
            <input
              type="text"
              placeholder="หมายเหตุเพิ่มเติม..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Sync to Google Sheets Checkbox */}
          {hasGoogleSheet && (
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="text-xs text-emerald-900 font-medium">
                  ซิงก์บันทึกลง Google Sheet ทันที
                </span>
              </div>
              <input
                type="checkbox"
                checked={syncToSheet}
                onChange={(e) => setSyncToSheet(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              บันทึกรายการ
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
