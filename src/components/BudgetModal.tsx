import React, { useState } from 'react';
import {
  X,
  Sliders,
  Bell,
  AlertTriangle,
  CheckCircle,
  MessageCircle,
} from 'lucide-react';
import { BudgetConfig } from '../types';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: BudgetConfig;
  onSave: (config: BudgetConfig) => void;
  onTriggerTestAlert: () => void;
  currentExpense: number;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  budget,
  onSave,
  onTriggerTestAlert,
  currentExpense,
}) => {
  const [monthlyBudget, setMonthlyBudget] = useState(String(budget.monthlyBudget));
  const [warningThreshold, setWarningThreshold] = useState(budget.warningThresholdPercent);
  const [enableChatAlert, setEnableChatAlert] = useState(budget.enableChatAlert);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(monthlyBudget);
    if (isNaN(val) || val <= 0) {
      alert('กรุณากรอกงบประมาณที่เป็นตัวเลขมากกว่า 0');
      return;
    }
    onSave({
      monthlyBudget: val,
      warningThresholdPercent: Number(warningThreshold),
      alertThresholdPercent: 100,
      enableChatAlert,
    });
    onClose();
  };

  const parsedBudget = parseFloat(monthlyBudget) || 1;
  const currentPercent = (currentExpense / parsedBudget) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base">
                ตั้งค่างบประมาณและการแจ้งเตือน
              </h3>
              <p className="text-xs text-stone-500">
                ควบคุมเพดานค่าใช้จ่ายรายเดือน และส่งเตือนผ่านแชท
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Monthly Budget Input */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              งบประมาณรายเดือน (บาท) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-lg">
                ฿
              </span>
              <input
                type="number"
                min="100"
                step="500"
                required
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-lg font-bold rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-stone-900"
              />
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              ปัจจุบันใช้ไปแล้ว ฿{currentExpense.toLocaleString('th-TH', { maximumFractionDigits: 0 })} ({currentPercent.toFixed(1)}%)
            </p>
          </div>

          {/* Warning Threshold Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-1">
              <span>เริ่มแจ้งเตือนล่วงหน้าเมื่อถึง</span>
              <span className="text-red-600 font-bold">{warningThreshold}% ของงบ</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={warningThreshold}
              onChange={(e) => setWarningThreshold(Number(e.target.value))}
              className="w-full accent-red-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
              <span>50%</span>
              <span>75%</span>
              <span>90%</span>
            </div>
          </div>

          {/* Toggle Alert via Chat */}
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-xs font-semibold text-stone-800">
                  แจ้งเตือนผ่านแชทเมื่อเกินงบ
                </p>
                <p className="text-[11px] text-stone-500">
                  ส่งข้อความเตือนอัตโนมัติไปยัง LINE OA ทันที
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={enableChatAlert}
              onChange={(e) => setEnableChatAlert(e.target.checked)}
              className="w-4 h-4 text-red-600 rounded-sm focus:ring-red-500 cursor-pointer"
            />
          </div>

          {/* Test Alert Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                onTriggerTestAlert();
                onClose();
              }}
              className="w-full py-2 px-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-red-600" />
              <span>ทดสอบส่งข้อความแจ้งเตือนงบเกินในแชท LINE ตอนนี้</span>
            </button>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
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
              บันทึกการตั้งค่า
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
