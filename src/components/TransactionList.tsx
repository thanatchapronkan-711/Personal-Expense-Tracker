import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  CreditCard,
  Banknote,
  Landmark,
  QrCode,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Trash2,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';
import { Transaction, PaymentMethod } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onAddTransaction: () => void;
  onDeleteTransaction: (id: string) => void;
  onSyncToSheet: (transaction: Transaction) => void;
  isSyncingId?: string | null;
  hasGoogleSheet: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  onSyncToSheet,
  isSyncingId,
  hasGoogleSheet,
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [filterPayment, setFilterPayment] = useState<'all' | PaymentMethod>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Filter transactions
  const filtered = transactions.filter((t) => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterPayment !== 'all') {
      if (filterPayment === 'transfer') {
        if (t.paymentMethod !== 'transfer' && t.paymentMethod !== 'bank_transfer' && t.paymentMethod !== 'promptpay') return false;
      } else if (t.paymentMethod !== filterPayment) {
        return false;
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchMerchant = (t.merchant || '').toLowerCase().includes(q);
      const matchCat = t.category.toLowerCase().includes(q);
      if (!matchDesc && !matchMerchant && !matchCat) return false;
    }
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
      
      {/* Header and Controls */}
      <div className="p-4 sm:p-6 border-b border-stone-100 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-stone-900 text-base sm:text-lg">
              รายการบันทึกรายรับ-รายจ่าย
            </h3>
            <p className="text-xs text-stone-500">
              แยกตามเงินสด/บัตรเครดิต และซิงก์ข้อมูลไปที่ Google Sheet อัตโนมัติ
            </p>
          </div>

          <button
            id="list-add-transaction-btn"
            onClick={onAddTransaction}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มรายการใหม่</span>
          </button>
        </div>

        {/* Filters & Search Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหารายการ, ร้านค้า, หมวดหมู่..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-stone-50/50"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Type Filter */}
            <div className="flex items-center rounded-xl bg-stone-100 p-0.5 text-xs font-medium text-stone-600">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterType === 'all' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'hover:text-stone-900'
                }`}
              >
                ทั้งหมด
              </button>
              <button
                onClick={() => setFilterType('expense')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterType === 'expense' ? 'bg-red-600 text-white font-semibold' : 'hover:text-stone-900'
                }`}
              >
                รายจ่าย
              </button>
              <button
                onClick={() => setFilterType('income')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterType === 'income' ? 'bg-emerald-600 text-white font-semibold' : 'hover:text-stone-900'
                }`}
              >
                รายรับ
              </button>
            </div>

            {/* Payment Method Filter */}
            <div className="flex flex-wrap items-center rounded-xl bg-stone-100 p-0.5 text-xs font-medium text-stone-600">
              <button
                onClick={() => setFilterPayment('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterPayment === 'all' ? 'bg-white text-stone-900 shadow-2xs font-semibold' : 'hover:text-stone-900'
                }`}
              >
                ทุกช่องทาง
              </button>
              <button
                onClick={() => setFilterPayment('cash')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterPayment === 'cash' ? 'bg-emerald-700 text-white font-semibold' : 'hover:text-stone-900'
                }`}
              >
                <Banknote className="w-3 h-3" />
                <span>เงินสด</span>
              </button>
              <button
                onClick={() => setFilterPayment('credit_card')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterPayment === 'credit_card' ? 'bg-red-700 text-white font-semibold' : 'hover:text-stone-900'
                }`}
              >
                <CreditCard className="w-3 h-3" />
                <span>บัตรเครดิต</span>
              </button>
              <button
                onClick={() => setFilterPayment('transfer')}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  filterPayment === 'transfer' ? 'bg-sky-700 text-white font-semibold' : 'hover:text-stone-900'
                }`}
              >
                <Landmark className="w-3 h-3" />
                <span>โอนเงิน/พร้อมเพย์</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Transaction Records Table / List */}
      {filtered.length > 0 ? (
        <div className="divide-y divide-stone-100">
          {filtered.map((item) => {
            const isExpense = item.type === 'expense';
            return (
              <div
                key={item.id}
                className="p-4 sm:px-6 hover:bg-stone-50/70 transition-colors flex items-center justify-between gap-3"
              >
                {/* Left: Icon, Description, Category, Date */}
                <div className="flex items-center gap-3 min-w-0">
                  
                  {/* Category / Type Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isExpense ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    {isExpense ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>

                  {/* Text details */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-stone-900 text-xs sm:text-sm truncate">
                        {item.description}
                      </p>
                      
                      {/* Payment Method Badge */}
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                          item.paymentMethod === 'cash'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : item.paymentMethod === 'credit_card'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-sky-50 text-sky-800 border-sky-200'
                        }`}
                      >
                        {item.paymentMethod === 'cash' && <Banknote className="w-3 h-3 text-emerald-600" />}
                        {item.paymentMethod === 'credit_card' && <CreditCard className="w-3 h-3 text-rose-600" />}
                        {(item.paymentMethod === 'transfer' || item.paymentMethod === 'bank_transfer' || item.paymentMethod === 'promptpay') && (
                          <Landmark className="w-3 h-3 text-sky-600" />
                        )}
                        <span>
                          {item.paymentMethod === 'cash'
                            ? 'เงินสด'
                            : item.paymentMethod === 'credit_card'
                            ? 'บัตรเครดิต'
                            : 'โอนเงิน / พร้อมเพย์'}
                        </span>
                      </span>

                      {/* Receipt Photo Badge */}
                      {item.receiptImage && (
                        <button
                          onClick={() => setSelectedImage(item.receiptImage || null)}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] hover:bg-amber-100 cursor-pointer"
                          title="ดูรูปภาพใบเสร็จ"
                        >
                          <Receipt className="w-3 h-3 text-amber-700" />
                          <span>มีรูปบิล</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-400">
                      <span>{item.date} {item.time && `• ${item.time}`}</span>
                      <span>•</span>
                      <span className="text-stone-600 font-medium">{item.category}</span>
                      {item.merchant && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[140px] text-stone-500">
                            {item.merchant}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                </div>

                {/* Right: Amount, Google Sheet Sync status, Delete */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p
                      className={`font-bold text-sm sm:text-base tracking-tight ${
                        isExpense ? 'text-red-600' : 'text-emerald-600'
                      }`}
                    >
                      {isExpense ? '-' : '+'}฿{item.amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    
                    {/* Google Sheet Sync Tag */}
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      {item.syncedToSheet ? (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-medium">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>ซิงก์ Sheet แล้ว</span>
                        </span>
                      ) : hasGoogleSheet ? (
                        <button
                          onClick={() => onSyncToSheet(item)}
                          disabled={isSyncingId === item.id}
                          className="text-[10px] text-stone-400 hover:text-emerald-700 hover:underline cursor-pointer flex items-center gap-0.5"
                          title="กดเพื่อส่งแถวนี้ไปที่ Google Sheet ทันที"
                        >
                          <FileSpreadsheet className="w-3 h-3" />
                          <span>{isSyncingId === item.id ? 'กำลังส่ง...' : 'ซิงก์ลง Sheet'}</span>
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => onDeleteTransaction(item.id)}
                    className="p-1.5 rounded-lg text-stone-300 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="ลบรายการนี้"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center text-stone-400">
          <p className="text-sm font-medium text-stone-600">ไม่พบรายการที่ตรงกับเงื่อนไข</p>
          <p className="text-xs text-stone-400 mt-1">ลองล้างการค้นหาหรือเปลี่ยนตัวกรอง</p>
        </div>
      )}

      {/* Lightbox Modal for Receipt Image */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 relative shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="font-semibold text-stone-900 text-sm">ภาพใบเสร็จ / สลิปที่บันทึกไว้</span>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-stone-400 hover:text-stone-600 text-sm font-bold p-1 cursor-pointer"
              >
                ✕ ปิด
              </button>
            </div>
            <div className="mt-3 max-h-[75vh] overflow-auto flex items-center justify-center bg-stone-900 rounded-xl p-2">
              <img
                src={selectedImage}
                alt="Receipt"
                className="max-h-[65vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
