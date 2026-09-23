import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Wallet,
  CreditCard,
  Banknote,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  BellRing,
  Landmark,
  QrCode,
} from 'lucide-react';
import { Transaction, BudgetConfig } from '../types';

interface DashboardProps {
  transactions: Transaction[];
  budget: BudgetConfig;
  selectedMonth: string; // YYYY-MM
  onChangeMonth: (month: string) => void;
  onOpenLineChat: () => void;
  onOpenBudgetModal: () => void;
}

// Minimalist Red & Warm Neutral Color Palette for the Pie Chart
const CATEGORY_COLORS = [
  '#DC2626', // Red 600
  '#E11D48', // Rose 600
  '#F43F5E', // Rose 500
  '#EA580C', // Orange 600
  '#BE123C', // Rose 700
  '#991B1B', // Red 800
  '#FB7185', // Rose 400
  '#78716C', // Stone 500
  '#A8A29E', // Stone 400
];

export const Dashboard: React.FC<DashboardProps> = ({
  transactions,
  budget,
  selectedMonth,
  onChangeMonth,
  onOpenLineChat,
  onOpenBudgetModal,
}) => {
  // Filter transactions for selected month
  const monthlyTransactions = transactions.filter((t) => t.date.startsWith(selectedMonth));

  // Compute key totals
  const totalExpense = monthlyTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = monthlyTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Breakdown by payment methods for Expenses: Cash, Credit Card, Transfer / PromptPay
  const cashExpenses = monthlyTransactions
    .filter((t) => t.type === 'expense' && t.paymentMethod === 'cash')
    .reduce((sum, t) => sum + t.amount, 0);

  const creditCardExpenses = monthlyTransactions
    .filter((t) => t.type === 'expense' && t.paymentMethod === 'credit_card')
    .reduce((sum, t) => sum + t.amount, 0);

  const transferExpenses = monthlyTransactions
    .filter((t) => t.type === 'expense' && (t.paymentMethod === 'transfer' || t.paymentMethod === 'bank_transfer' || t.paymentMethod === 'promptpay'))
    .reduce((sum, t) => sum + t.amount, 0);

  // Group expenses by category for Pie Chart
  const categoryMap: { [cat: string]: number } = {};
  monthlyTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

  const pieData = Object.entries(categoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Budget calculations
  const budgetLimit = budget.monthlyBudget;
  const budgetPercent = budgetLimit > 0 ? (totalExpense / budgetLimit) * 100 : 0;
  const isOverBudget = totalExpense > budgetLimit;
  const isNearBudget = !isOverBudget && budgetPercent >= budget.warningThresholdPercent;
  const overAmount = totalExpense - budgetLimit;
  const remainingBudget = Math.max(0, budgetLimit - totalExpense);

  // Month navigation helpers
  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const date = new Date(y, m - 2, 1);
    const nextY = date.getFullYear();
    const nextM = String(date.getMonth() + 1).padStart(2, '0');
    onChangeMonth(`${nextY}-${nextM}`);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const date = new Date(y, m, 1);
    const nextY = date.getFullYear();
    const nextM = String(date.getMonth() + 1).padStart(2, '0');
    onChangeMonth(`${nextY}-${nextM}`);
  };

  // Format Month in Thai
  const formatMonthThai = (ym: string) => {
    const [year, month] = ym.split('-');
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
    ];
    const mIndex = parseInt(month, 10) - 1;
    const thaiYear = parseInt(year, 10) + 543;
    return `${months[mIndex] || month} ${thaiYear}`;
  };

  // Payment method percentages
  const totalTrackedPayment = cashExpenses + creditCardExpenses + transferExpenses;
  const cashPercent = totalTrackedPayment > 0 ? (cashExpenses / totalTrackedPayment) * 100 : 0;
  const creditCardPercent = totalTrackedPayment > 0 ? (creditCardExpenses / totalTrackedPayment) * 100 : 0;
  const transferPercent = totalTrackedPayment > 0 ? (transferExpenses / totalTrackedPayment) * 100 : 0;

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Month Selector & Budget Alert Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs">
        
        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <button
            id="dash-prev-month-btn"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors cursor-pointer"
            title="เดือนก่อนหน้า"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="min-w-[170px] text-center">
            <span className="text-base sm:text-lg font-bold text-stone-900">
              {formatMonthThai(selectedMonth)}
            </span>
          </div>
          <button
            id="dash-next-month-btn"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors cursor-pointer"
            title="เดือนถัดไป"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Over Budget Immediate Alert Notification Banner */}
        {isOverBudget ? (
          <div
            id="budget-over-alert-banner"
            onClick={onOpenLineChat}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm cursor-pointer hover:bg-red-100/70 transition-colors"
          >
            <div className="p-1.5 rounded-lg bg-red-600 text-white shrink-0">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <p className="font-semibold text-red-900">
                ⚠️ ใช้จ่ายเกินงบแล้ว +฿{overAmount.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}!
              </p>
              <p className="text-[11px] text-red-700">
                แตะเพื่อเปิดดูการแจ้งเตือนทางแชท LINE OA
              </p>
            </div>
            <BellRing className="w-4 h-4 text-red-600 shrink-0 ml-auto" />
          </div>
        ) : isNearBudget ? (
          <div
            onClick={onOpenBudgetModal}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              ระวัง: ใช้จ่ายไปแล้ว <strong>{budgetPercent.toFixed(0)}%</strong> ของงบประมาณ
            </span>
          </div>
        ) : (
          <div className="text-xs text-stone-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>งบประมาณปกติ (คงเหลือ ฿{remainingBudget.toLocaleString('th-TH', { maximumFractionDigits: 0 })})</span>
          </div>
        )}

      </div>

      {/* Primary KPI Cards Grid: 4 Columns for Total, Cash, Credit Card, Transfer/PromptPay */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Expense */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -z-0 opacity-60" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500">รายจ่ายรวมเดือนนี้</span>
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight text-red-600">
              ฿{totalExpense.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="mt-1 text-[11px] text-stone-400">
              {monthlyTransactions.filter((t) => t.type === 'expense').length} รายการ
            </p>
          </div>
        </div>

        {/* Cash Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">เงินสด (Cash)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-stone-900">
            ฿{cashExpenses.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-stone-500">
            <span className="font-semibold text-emerald-700">{cashPercent.toFixed(0)}%</span> ของรายจ่าย
          </div>
        </div>

        {/* Credit Card Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">บัตรเครดิต</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-stone-900">
            ฿{creditCardExpenses.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-stone-500">
            <span className="font-semibold text-rose-600">{creditCardPercent.toFixed(0)}%</span> ของรายจ่าย
          </div>
        </div>

        {/* Transfer / PromptPay Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">โอนเงิน / พร้อมเพย์</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-stone-900">
            ฿{transferExpenses.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-stone-500">
            <span className="font-semibold text-sky-600">{transferPercent.toFixed(0)}%</span> ของรายจ่าย
          </div>
        </div>

      </div>

      {/* Income & Net Balance Ribbon */}
      <div className="bg-stone-100/70 border border-stone-200/70 px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <span className="text-stone-500">
            รายรับรวมเดือนนี้: <strong className="text-emerald-700 font-semibold">฿{totalIncome.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</strong>
          </span>
          <span className="text-stone-300">•</span>
          <span className="text-stone-500">
            ยอดคงเหลือสุทธิ: <strong className={`font-semibold ${netBalance >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{netBalance < 0 ? '-' : '+'}฿{Math.abs(netBalance).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</strong>
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-stone-400">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          <span>สถานะการเงินเดือน {formatMonthThai(selectedMonth)}</span>
        </div>
      </div>

      {/* Main Visuals: Pie Chart & Cash vs Credit vs Transfer vs PromptPay Breakdown + Budget Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 Cols): Monthly Pie Chart Summary */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-bold text-stone-900 text-base">
                สรุปยอดรายเดือนตามหมวดหมู่
              </h3>
              <p className="text-xs text-stone-500">
                กราฟวงกลมแสดงสัดส่วนค่าใช้จ่ายประจำเดือน {formatMonthThai(selectedMonth)}
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 font-medium">
              {pieData.length} หมวดหมู่
            </span>
          </div>

          {pieData.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center flex-1">
              
              {/* Donut Chart */}
              <div className="md:col-span-7 h-64 sm:h-72 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {pieData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                          stroke="#ffffff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [
                        `฿${Number(val || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}`,
                        'ยอดรวม',
                      ]}
                      contentStyle={{
                        backgroundColor: '#1C1917',
                        color: '#FFFFFF',
                        borderRadius: '12px',
                        border: 'none',
                        fontSize: '12px',
                        padding: '8px 12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Categorical Breakdown Legend List */}
              <div className="md:col-span-5 space-y-2 max-h-64 overflow-y-auto pr-1">
                {pieData.map((item, idx) => {
                  const percent = totalExpense > 0 ? (item.value / totalExpense) * 100 : 0;
                  const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between text-xs p-1.5 rounded-lg hover:bg-stone-50 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-stone-700 truncate font-medium">
                          {item.name}
                        </span>
                      </div>
                      <div className="text-right shrink-0 pl-2">
                        <span className="font-semibold text-stone-900 block">
                          ฿{item.value.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {percent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-stone-400">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-2">
                <Wallet className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-stone-600">ยังไม่มีรายการค่าใช้จ่ายในเดือนนี้</p>
              <p className="text-xs text-stone-400 mt-1">กดถ่ายบิลด้วย AI หรือเพิ่มรายการใหม่เพื่อดูสรุป</p>
            </div>
          )}
        </div>

        {/* Right Column (5 Cols): Cash vs Credit Card Separation & Budget Monitor */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card: Cash vs Credit Card vs Transfer/PromptPay Detailed Separation */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs">
            <h3 className="font-bold text-stone-900 text-base">
              การแยกค่าใช้จ่ายตามช่องทางชำระเงิน
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              เปรียบเทียบสัดส่วน: เงินสด, บัตรเครดิต และโอนเงิน / พร้อมเพย์
            </p>

            {/* Split Progress Bar */}
            <div className="mt-4">
              <div className="h-3 w-full rounded-full bg-stone-100 overflow-hidden flex">
                <div
                  style={{ width: `${cashPercent}%` }}
                  className="bg-emerald-500 transition-all duration-500"
                  title={`เงินสด: ${cashPercent.toFixed(1)}%`}
                />
                <div
                  style={{ width: `${creditCardPercent}%` }}
                  className="bg-rose-600 transition-all duration-500"
                  title={`บัตรเครดิต: ${creditCardPercent.toFixed(1)}%`}
                />
                <div
                  style={{ width: `${transferPercent}%` }}
                  className="bg-sky-500 transition-all duration-500"
                  title={`โอนเงิน/พร้อมเพย์: ${transferPercent.toFixed(1)}%`}
                />
              </div>

              {/* Legend Badges: 3-way Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4">
                
                {/* Cash Badge */}
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                    <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                    <span>เงินสด (Cash)</span>
                  </div>
                  <p className="mt-1 text-base font-bold text-emerald-900">
                    ฿{cashExpenses.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-[10px] text-emerald-700">
                    {cashPercent.toFixed(1)}% ของค่าใช้จ่าย
                  </p>
                </div>

                {/* Credit Card Badge */}
                <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-800">
                    <CreditCard className="w-3.5 h-3.5 text-rose-600" />
                    <span>บัตรเครดิต</span>
                  </div>
                  <p className="mt-1 text-base font-bold text-rose-900">
                    ฿{creditCardExpenses.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-[10px] text-rose-700">
                    {creditCardPercent.toFixed(1)}% ของค่าใช้จ่าย
                  </p>
                </div>

                {/* Transfer / PromptPay Badge */}
                <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-800">
                    <Landmark className="w-3.5 h-3.5 text-sky-600" />
                    <span>โอนเงิน / พร้อมเพย์</span>
                  </div>
                  <p className="mt-1 text-base font-bold text-sky-900">
                    ฿{transferExpenses.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-[10px] text-sky-700">
                    {transferPercent.toFixed(1)}% ของค่าใช้จ่าย
                  </p>
                </div>

              </div>

            </div>
          </div>

          {/* Card: Budget Tracking & LINE Alert Controller */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-stone-900 text-base">
                  งบประมาณรายเดือน (Budget)
                </h3>
                <p className="text-xs text-stone-500">
                  ตั้งไว้ ฿{budgetLimit.toLocaleString('th-TH')} ต่อเดือน
                </p>
              </div>
              <button
                onClick={onOpenBudgetModal}
                className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline cursor-pointer"
              >
                ปรับเปลี่ยน
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                <span className="text-stone-600">
                  ใช้ไปแล้ว ฿{totalExpense.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                </span>
                <span className={isOverBudget ? 'text-red-600 font-bold' : isNearBudget ? 'text-amber-600 font-bold' : 'text-stone-700'}>
                  {budgetPercent.toFixed(1)}%
                </span>
              </div>
              
              <div className="h-3.5 w-full rounded-full bg-stone-100 overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, budgetPercent)}%` }}
                  className={`h-full transition-all duration-500 ${
                    isOverBudget
                      ? 'bg-red-600'
                      : isNearBudget
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
              </div>
            </div>

            {/* Over Budget Callout with LINE OA Button */}
            {isOverBudget ? (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <p className="font-bold text-red-900">
                    เตือน: ใช้จ่ายเกินงบ ฿{overAmount.toLocaleString('th-TH', { maximumFractionDigits: 2 })}!
                  </p>
                  <p className="text-red-700 text-[11px] mt-0.5">
                    ระบบได้ส่งข้อความแจ้งเตือนผ่านแชท LINE OA ให้คุณระวังค่าใช้จ่ายเรียบร้อยแล้ว
                  </p>
                  <button
                    onClick={onOpenLineChat}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-xs shadow-2xs transition-colors cursor-pointer"
                  >
                    <span>ดูข้อความแจ้งเตือนใน LINE</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs text-stone-600">
                <span>คงเหลือใช้ได้อีก:</span>
                <span className="font-bold text-emerald-600 text-sm">
                  ฿{remainingBudget.toLocaleString('th-TH', { maximumFractionDigits: 2 })}
                </span>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
