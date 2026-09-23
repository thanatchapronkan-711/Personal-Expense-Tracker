import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  ExternalLink,
  Plus,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Link,
  Sparkles,
} from 'lucide-react';
import { SheetConfig, Transaction } from '../types';

interface GoogleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheetConfig: SheetConfig;
  hasAuthToken: boolean;
  onLogin: () => void;
  onCreateNewSheet: () => Promise<void>;
  onConnectExistingSheet: (idOrUrl: string) => Promise<void>;
  onSyncAllToSheet: () => Promise<void>;
  pendingCount: number;
}

export const GoogleSheetModal: React.FC<GoogleSheetModalProps> = ({
  isOpen,
  onClose,
  sheetConfig,
  hasAuthToken,
  onLogin,
  onCreateNewSheet,
  onConnectExistingSheet,
  onSyncAllToSheet,
  pendingCount,
}) => {
  const [existingInput, setExistingInput] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = async () => {
    try {
      setIsBusy(true);
      setError(null);
      await onCreateNewSheet();
      setSuccessMsg('สร้าง Google Sheet ใหม่และเชื่อมต่อเรียบร้อยแล้ว!');
    } catch (err: any) {
      setError(err?.message || 'ไม่สามารถสร้าง Google Sheet ได้');
    } finally {
      setIsBusy(false);
    }
  };

  const handleConnectExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!existingInput.trim()) return;
    try {
      setIsBusy(true);
      setError(null);
      await onConnectExistingSheet(existingInput.trim());
      setSuccessMsg('เชื่อมต่อกับ Google Sheet สำเร็จแล้ว!');
      setExistingInput('');
    } catch (err: any) {
      setError(err?.message || 'ไม่สามารถเชื่อมต่อ Google Sheet นี้ได้');
    } finally {
      setIsBusy(false);
    }
  };

  const handleSyncAll = async () => {
    try {
      setIsBusy(true);
      setError(null);
      await onSyncAllToSheet();
      setSuccessMsg(`ซิงก์ข้อมูล ${pendingCount} รายการลง Google Sheet เรียบร้อยแล้ว!`);
    } catch (err: any) {
      setError(err?.message || 'เกิดข้อผิดพลาดในการซิงก์ข้อมูล');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-base sm:text-lg">
                เชื่อมต่อ Google Sheets
              </h3>
              <p className="text-xs text-stone-500">
                เก็บข้อมูลรายรับรายจ่ายลงบนสเปรดชีตของคุณแบบเรียลไทม์
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

        {/* Auth prompt if not signed in */}
        {!hasAuthToken ? (
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-xs sm:text-sm">
                  จำเป็นต้องเข้าสู่ระบบ Google Account ก่อน
                </p>
                <p className="text-xs text-amber-800 mt-1">
                  เพื่ออนุญาตให้แอปพลิเคชันสร้างหรือเขียนข้อมูลลงใน Google Sheet ของคุณ
                </p>
              </div>
            </div>
            <button
              onClick={onLogin}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              เข้าสู่ระบบด้วย Google Account ทันที
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            
            {/* Status alerts */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Currently Connected Sheet Card */}
            {sheetConfig.spreadsheetId ? (
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-stone-900 text-xs sm:text-sm">
                      เชื่อมต่อ Google Sheet แล้ว
                    </span>
                  </div>
                  {sheetConfig.spreadsheetUrl && (
                    <a
                      href={sheetConfig.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                    >
                      <span>เปิด Sheet</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-emerald-100 text-xs space-y-1">
                  <div className="flex justify-between text-stone-500 text-[11px]">
                    <span>Spreadsheet ID:</span>
                    <span className="font-mono text-stone-700 truncate max-w-[200px]">
                      {sheetConfig.spreadsheetId}
                    </span>
                  </div>
                  <div className="flex justify-between text-stone-500 text-[11px]">
                    <span>ชื่อแท็บชีต:</span>
                    <span className="font-semibold text-stone-700">
                      {sheetConfig.sheetName}
                    </span>
                  </div>
                </div>

                {/* Sync All Button if pending items */}
                {pendingCount > 0 ? (
                  <div className="pt-1">
                    <button
                      onClick={handleSyncAll}
                      disabled={isBusy}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isBusy ? 'animate-spin' : ''}`} />
                      <span>ซิงก์ข้อมูลที่ค้างอยู่ {pendingCount} รายการลง Sheet ทันที</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-emerald-700 text-center font-medium">
                    ✓ ข้อมูลทั้งหมดซิงก์เป็นปัจจุบันเรียบร้อยแล้ว
                  </p>
                )}

              </div>
            ) : (
              /* No sheet connected yet -> Quick Create or Connect */
              <div className="space-y-4">
                
                {/* Option 1: Create New */}
                <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition-all text-center space-y-2.5">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-900 text-sm">
                      สร้าง Google Sheet บันทึกรายจ่ายใหม่ทันที
                    </h4>
                    <p className="text-xs text-stone-500">
                      ระบบจะสร้างสเปรดชีตพร้อมหัวตาราง 10 คอลัมน์ให้อัตโนมัติบน Google Drive ของคุณ
                    </p>
                  </div>
                  <button
                    onClick={handleCreate}
                    disabled={isBusy}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isBusy ? 'กำลังสร้าง Google Sheet...' : 'กดสร้าง Google Sheet ใหม่ (1 คลิก)'}
                  </button>
                </div>

                {/* Option 2: Connect Existing Sheet */}
                <form onSubmit={handleConnectExisting} className="space-y-2 pt-2 border-t border-stone-100">
                  <label className="block text-xs font-semibold text-stone-700">
                    หรือเชื่อมต่อ Google Sheet เดิมที่คุณมีอยู่:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="วาง URL หรือ Spreadsheet ID..."
                      value={existingInput}
                      onChange={(e) => setExistingInput(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={isBusy || !existingInput.trim()}
                      className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      เชื่อมต่อ
                    </button>
                  </div>
                </form>

              </div>
            )}

            {/* Columns Explainer */}
            <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500 space-y-1">
              <p className="font-semibold text-stone-700">คอลัมน์ที่บันทึกลงในชีต:</p>
              <p>
                รหัสรายการ, วันที่, เวลา, ประเภท, หมวดหมู่, รายการ, จำนวนเงิน (บาท), ช่องทางชำระเงิน (เงินสด/บัตรเครดิต), ร้านค้า, บันทึก
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
