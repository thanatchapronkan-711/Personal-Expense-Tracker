import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Image as ImageIcon,
  Camera,
  AlertTriangle,
  FileSpreadsheet,
  Banknote,
  CreditCard,
  Sparkles,
  Bot,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { Transaction, BudgetConfig, LineChatMessage } from '../types';

interface LineChatSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  messages: LineChatMessage[];
  onSendMessage: (text: string, imageBase64?: string) => void;
  onSimulateReceiptUpload: () => void;
  transactions: Transaction[];
  budget: BudgetConfig;
  selectedMonth: string;
}

export const LineChatSimulator: React.FC<LineChatSimulatorProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  onSimulateReceiptUpload,
  transactions,
  budget,
  selectedMonth,
}) => {
  const [inputText, setInputText] = useState('');
  const [showWebhookGuide, setShowWebhookGuide] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  // Quick commands
  const handleQuickCommand = (cmd: string) => {
    onSendMessage(cmd);
  };

  // Calculate current month statistics for summary cards
  const monthlyTransactions = transactions.filter((t) => t.date.startsWith(selectedMonth));
  const totalExpense = monthlyTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const budgetLimit = budget.monthlyBudget;
  const isOverBudget = totalExpense > budgetLimit;
  const overAmount = totalExpense - budgetLimit;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#8C9DAE] rounded-3xl max-w-md w-full h-[90vh] max-h-[700px] flex flex-col shadow-2xl overflow-hidden border border-stone-300 animate-in fade-in zoom-in-95 duration-200">
        
        {/* LINE Chat Header */}
        <div className="bg-[#24303E] text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#24303E]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight">AI บันทึกรายจ่าย</span>
                <span className="px-1.5 py-0.2 rounded-xs bg-emerald-600 text-[10px] font-semibold text-white">
                  LINE OA
                </span>
              </div>
              <p className="text-[11px] text-emerald-300">
                พร้อมใช้งาน • ตรวจจับบิล & แจ้งเตือนงบเกิน
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowWebhookGuide(!showWebhookGuide)}
              className="text-[11px] px-2 py-1 rounded-lg bg-stone-700/60 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer"
              title="ดูการเชื่อมต่อ Webhook จริง"
            >
              Webhook จริง
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-700/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Webhook Setup Guide Overlay */}
        {showWebhookGuide && (
          <div className="bg-white p-4 border-b border-stone-200 text-xs text-stone-700 space-y-2 max-h-56 overflow-y-auto shrink-0 shadow-md">
            <div className="flex items-center justify-between font-bold text-stone-900">
              <span>การเชื่อมต่อ LINE Official Account (Webhook จริง)</span>
              <button
                onClick={() => setShowWebhookGuide(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-stone-600">
              ระบบนี้มี Webhook Endpoint พร้อมรองรับ LINE Messaging API:
            </p>
            <div className="p-2 rounded-lg bg-stone-100 font-mono text-[11px] break-all border border-stone-200">
              {window.location.origin}/api/line/webhook
            </div>
            <ol className="list-decimal list-inside space-y-1 text-stone-600 text-[11px]">
              <li>ไปที่ LINE Developers Console แล้วเปิดใช้งาน Webhook</li>
              <li>ใส่ URL ข้างต้นลงในช่อง Webhook URL แล้วกด Verify</li>
              <li>กำหนดค่า Channel Access Token ใน .env ของโปรเจกต์</li>
            </ol>
          </div>
        )}

        {/* Chat Message Scroll Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
          
          {/* Date pill */}
          <div className="flex justify-center">
            <span className="px-3 py-1 rounded-full bg-black/20 text-white text-[10px] font-medium backdrop-blur-xs">
              วันนี้
            </span>
          </div>

          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                  
                  {/* Alert Flex Message Style */}
                  {msg.isAlert ? (
                    <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-3.5 shadow-sm text-stone-900 space-y-2">
                      <div className="flex items-center gap-2 text-red-700 font-bold text-xs">
                        <AlertTriangle className="w-4 h-4 text-red-600 animate-bounce" />
                        <span>แจ้งเตือนงบประมาณเกิน! ⚠️</span>
                      </div>
                      <p className="text-xs text-stone-800 whitespace-pre-wrap leading-relaxed">
                        {msg.text}
                      </p>
                      <div className="pt-2 border-t border-red-200/80 flex items-center justify-between text-[11px]">
                        <span className="text-red-700 font-semibold">
                          งบที่ตั้ง: ฿{budgetLimit.toLocaleString('th-TH')}
                        </span>
                        <span className="text-red-900 font-bold">
                          ใช้ไป: ฿{totalExpense.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                  ) : msg.transaction ? (
                    /* Auto-parsed Transaction Card (LINE Flex Message Style) */
                    <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-stone-100 text-stone-900 space-y-2">
                      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>บันทึกสำเร็จด้วย AI 📸</span>
                        </div>
                        <span className="text-[10px] text-stone-400">
                          {msg.transaction.time || '12:00'}
                        </span>
                      </div>

                      {/* Receipt thumbnail if present */}
                      {msg.imageUrl && (
                        <div className="rounded-lg overflow-hidden max-h-32 bg-stone-900 flex items-center justify-center">
                          <img
                            src={msg.imageUrl}
                            alt="Receipt"
                            className="max-h-32 object-contain"
                          />
                        </div>
                      )}

                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-stone-500">รายการ:</span>
                          <span className="font-semibold text-stone-800">
                            {msg.transaction.description}
                          </span>
                        </div>
                        {msg.transaction.merchant && (
                          <div className="flex justify-between">
                            <span className="text-stone-500">ร้านค้า:</span>
                            <span className="text-stone-700">{msg.transaction.merchant}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-stone-500">หมวดหมู่:</span>
                          <span className="text-stone-700">{msg.transaction.category}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-stone-500">ชำระด้วย:</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                              msg.transaction.paymentMethod === 'cash'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : msg.transaction.paymentMethod === 'credit_card'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
                                : 'bg-sky-50 text-sky-800 border-sky-200'
                            }`}
                          >
                            {msg.transaction.paymentMethod === 'cash'
                              ? '💵 เงินสด'
                              : msg.transaction.paymentMethod === 'credit_card'
                              ? '💳 บัตรเครดิต'
                              : '📲 โอนเงิน/พร้อมเพย์'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                        <span className="text-xs text-stone-500 font-medium">ยอดเงินสุทธิ:</span>
                        <span className="font-bold text-base text-red-600">
                          -฿{msg.transaction.amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="pt-1.5 flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
                        <FileSpreadsheet className="w-3 h-3" />
                        <span>ส่งข้อมูลไปยัง Google Sheet เรียบร้อยแล้ว</span>
                      </div>
                    </div>
                  ) : (
                    /* Standard Message Bubble */
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-xs shadow-xs whitespace-pre-wrap leading-relaxed ${
                        isUser
                          ? 'bg-[#58D86A] text-stone-900 rounded-br-xs font-medium'
                          : 'bg-white text-stone-800 rounded-bl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  )}

                  <span className={`text-[9px] text-stone-600 block mt-0.5 ${isUser ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </span>

                </div>

              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Reply Bar (LINE Quick Replies) */}
        <div className="bg-[#24303E]/95 px-3 py-2 border-t border-stone-600/40 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={onSimulateReceiptUpload}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-xs whitespace-nowrap shadow-xs cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>ถ่าย/ส่งรูปบิล</span>
            <Sparkles className="w-3 h-3 text-amber-200" />
          </button>

          <button
            onClick={() => handleQuickCommand('สรุปเดือนนี้')}
            className="px-3 py-1.5 rounded-full bg-stone-700 hover:bg-stone-600 text-stone-200 text-xs whitespace-nowrap cursor-pointer"
          >
            📊 สรุปเดือนนี้
          </button>

          <button
            onClick={() => handleQuickCommand('เช็คสถานะงบประมาณ')}
            className="px-3 py-1.5 rounded-full bg-stone-700 hover:bg-stone-600 text-stone-200 text-xs whitespace-nowrap cursor-pointer"
          >
            💰 เช็คงบ
          </button>

          <button
            onClick={() => handleQuickCommand('ยอดเงินสด')}
            className="px-3 py-1.5 rounded-full bg-stone-700 hover:bg-stone-600 text-stone-200 text-xs whitespace-nowrap cursor-pointer"
          >
            💵 ยอดเงินสด
          </button>

          <button
            onClick={() => handleQuickCommand('ยอดบัตรเครดิต')}
            className="px-3 py-1.5 rounded-full bg-stone-700 hover:bg-stone-600 text-stone-200 text-xs whitespace-nowrap cursor-pointer"
          >
            💳 ยอดบัตรเครดิต
          </button>

          <button
            onClick={() => handleQuickCommand('ยอดโอน/พร้อมเพย์')}
            className="px-3 py-1.5 rounded-full bg-stone-700 hover:bg-stone-600 text-stone-200 text-xs whitespace-nowrap cursor-pointer"
          >
            📲 ยอดโอน/พร้อมเพย์
          </button>
        </div>

        {/* Bottom Input Bar */}
        <form
          onSubmit={handleSend}
          className="bg-white p-2.5 flex items-center gap-2 border-t border-stone-200 shrink-0"
        >
          <button
            type="button"
            onClick={onSimulateReceiptUpload}
            className="p-2 rounded-full text-stone-500 hover:text-emerald-600 hover:bg-stone-100 transition-colors cursor-pointer"
            title="อัปโหลดภาพบิลใบเสร็จ"
          >
            <Camera className="w-5 h-5" />
          </button>

          <input
            type="text"
            placeholder="พิมพ์ข้อความ เช่น 'ชาบู 500 เงินสด' หรือกดถ่ายบิล..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 px-3.5 py-2 text-xs rounded-full border border-stone-300 focus:outline-none focus:border-emerald-500 bg-stone-50 text-stone-900"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-40 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
