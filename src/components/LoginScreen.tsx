import React from 'react';
import { ShieldCheck, Cloud, Sparkles, FileSpreadsheet, Lock, ArrowRight, Wallet, CheckCircle2 } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
  isLoggingIn: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, isLoggingIn }) => {
  return (
    <div className="min-h-screen bg-linear-to-b from-stone-900 via-stone-900 to-stone-950 text-white flex flex-col justify-between selection:bg-red-500 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-red-600 to-red-500 flex items-center justify-center shadow-lg shadow-red-600/30 border border-red-400/20">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              Expense Tracker All-in-One
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-400">
                Cloud Sync
              </span>
            </h1>
            <p className="text-[11px] text-stone-400">ระบบบันทึกรายรับ-รายจ่าย เชื่อมโยง Firebase Realtime</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-stone-400 bg-stone-800/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-700/60">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>ระบบปลอดภัย ต้องยืนยันตัวตนก่อนเข้าใช้งาน</span>
        </div>
      </header>

      {/* Hero & Login Box */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-6 py-8 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left column: App Value Props */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-800/80 border border-stone-700/80 text-xs font-medium text-stone-300 shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>จัดการเงินส่วนตัว ครบจบในที่เดียว</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight sm:leading-tight">
            บันทึกรายรับ-รายจ่าย <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-red-400 via-amber-300 to-red-400">
              ปลอดภัยบน Firebase Cloud
            </span>
          </h2>

          <p className="text-sm sm:text-base text-stone-300 max-w-xl leading-relaxed">
            เข้าสู่ระบบด้วย Google Account ของคุณ เพื่อปกป้องข้อมูลทางการเงินส่วนตัว 
            ข้อมูลทั้งหมดจะถูกบันทึกและซิงก์ตรงกับ Firebase Firestore ทันทีที่ล็อกอิน
          </p>

          {/* Feature Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-lg pt-2">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-800/40 border border-stone-800 backdrop-blur-xs text-left">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-400 shrink-0 mt-0.5">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">ซิงก์ Firebase Realtime</div>
                <div className="text-[11px] text-stone-400 mt-0.5">ข้อมูลปลอดภัย บันทึกขึ้นคลาวด์แยกตามบัญชีของคุณ</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-800/40 border border-stone-800 backdrop-blur-xs text-left">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">เชื่อม Google Sheets</div>
                <div className="text-[11px] text-stone-400 mt-0.5">ส่งออกและบันทึกลงสเปรดชีตอัตโนมัติ</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-800/40 border border-stone-800 backdrop-blur-xs text-left">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">AI สแกนสลิป & ใบเสร็จ</div>
                <div className="text-[11px] text-stone-400 mt-0.5">อ่านยอดเงิน หมวดหมู่ ร้านค้า ให้พร้อมใช้</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-stone-800/40 border border-stone-800 backdrop-blur-xs text-left">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">LINE Chat Simulator</div>
                <div className="text-[11px] text-stone-400 mt-0.5">แจ้งเตือนงบเกินและบันทึกด่วนผ่านแชท</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Login Card */}
        <div className="w-full max-w-md">
          <div className="bg-stone-800/70 border border-stone-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
            <div className="w-12 h-12 rounded-2xl bg-stone-900 border border-stone-700 flex items-center justify-center mb-6 shadow-inner">
              <Lock className="w-6 h-6 text-red-400" />
            </div>

            <h3 className="text-xl font-bold text-white tracking-tight">เข้าสู่ระบบเพื่อเริ่มใช้งาน</h3>
            <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
              กรุณาเข้าสู่ระบบด้วย Google Account เพื่อปลดล็อกการใช้งานและโหลดข้อมูลจาก Firebase ของคุณ
            </p>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={onLogin}
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-stone-100 text-stone-900 font-semibold py-3.5 px-5 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoggingIn ? (
                  <>
                    <div className="w-5 h-5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                    <span>กำลังเชื่อมต่อบัญชี Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>เข้าสู่ระบบด้วย Google</span>
                    <ArrowRight className="w-4 h-4 ml-auto text-stone-500" />
                  </>
                )}
              </button>
            </div>

            {/* Guarantees */}
            <div className="mt-6 pt-5 border-t border-stone-700/60 space-y-2">
              <div className="flex items-center gap-2 text-[11px] text-stone-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>บันทึกข้อมูลแบบเรียลไทม์ลง Firebase Firestore</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-stone-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>แยกฐานข้อมูลส่วนบุคคล 1 บัญชีต่อ 1 ผู้ใช้ ปลอดภัย 100%</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-stone-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>ซิงก์ข้อมูลอัตโนมัติเมื่อเปิดใช้งานผ่านมือถือหรือคอมพิวเตอร์</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Note */}
      <footer className="relative z-10 w-full text-center py-6 px-4 text-xs text-stone-500 border-t border-stone-800/60">
        Personal Expense Tracker All-in-One • Powered by Firebase Firestore & Authentication
      </footer>
    </div>
  );
};
