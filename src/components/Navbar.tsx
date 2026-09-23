import React from 'react';
import { Camera, Sparkles, MessageCircle, FileSpreadsheet, Sliders, LogOut } from 'lucide-react';
import { UserProfile, SheetConfig } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  sheetConfig: SheetConfig;
  onOpenScanner: () => void;
  onOpenLineChat: () => void;
  onOpenSheetModal: () => void;
  onOpenBudgetModal: () => void;
  unreadChatCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogin,
  onLogout,
  isLoggingIn,
  sheetConfig,
  onOpenScanner,
  onOpenLineChat,
  onOpenSheetModal,
  onOpenBudgetModal,
  unreadChatCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-red-100/70 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-sm shadow-red-200">
              <span className="font-bold text-lg tracking-tighter">฿</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-900 tracking-tight text-base sm:text-lg">
                  Personal Expense Tracker Allin
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                  Firebase
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                Firebase Firestore • Google Sheets Sync • AI Receipt Scanner
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* AI Receipt Scan Button */}
            <button
              id="nav-scan-receipt-btn"
              onClick={onOpenScanner}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors cursor-pointer"
              title="ถ่ายรูปใบเสร็จหรือสลิปแล้วกรอกข้อมูลให้อัตโนมัติด้วย AI"
            >
              <Camera className="w-4 h-4 text-red-100" />
              <span className="hidden sm:inline">ถ่ายบิล AI</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            </button>

            {/* LINE OA Chat Button */}
            <button
              id="nav-line-chat-btn"
              onClick={onOpenLineChat}
              className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 hover:text-stone-900 transition-colors cursor-pointer"
              title="แชทบอท LINE Official Account & แจ้งเตือนงบเกิน"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">LINE OA</span>
              {unreadChatCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[10px] font-bold text-white bg-red-600 rounded-full">
                  {unreadChatCount}
                </span>
              )}
            </button>

            {/* Google Sheets Status/Settings */}
            <button
              id="nav-google-sheets-btn"
              onClick={onOpenSheetModal}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                sheetConfig.spreadsheetId
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
              title="จัดการเชื่อมต่อ Google Sheet"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden lg:inline">
                {sheetConfig.spreadsheetId ? 'Google Sheet เชื่อมแล้ว' : 'ตั้งค่า Sheet'}
              </span>
            </button>

            {/* Budget Setting Button */}
            <button
              id="nav-budget-settings-btn"
              onClick={onOpenBudgetModal}
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
              title="ตั้งค่างบประมาณรายเดือนและการแจ้งเตือน"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Auth Button / Profile */}
            <div className="h-6 w-px bg-stone-200 mx-1 hidden sm:block" />

            {user ? (
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-red-200 ring-2 ring-red-500/20"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-medium text-xs">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden xl:block text-left text-xs leading-tight">
                  <p className="font-medium text-stone-800 truncate max-w-[120px]">
                    {user.displayName || 'Google User'}
                  </p>
                  <p className="text-stone-500 text-[10px] truncate max-w-[120px]">
                    {user.email}
                  </p>
                </div>
                <button
                  id="nav-logout-btn"
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="nav-google-login-btn"
                onClick={onLogin}
                disabled={isLoggingIn}
                className="gsi-material-button inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 text-xs sm:text-sm font-medium shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isLoggingIn ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
