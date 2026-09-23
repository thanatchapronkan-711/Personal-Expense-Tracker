import React, { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
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
  Calendar,
  BarChart3,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
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

// Minimalist Red & Warm Neutral Color Palette for Charts
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
  '#0284C7', // Sky 600
  '#0D9488', // Teal 600
];

const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];

const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

export const Dashboard: React.FC<DashboardProps> = ({
  transactions,
  budget,
  selectedMonth,
  onChangeMonth,
  onOpenLineChat,
  onOpenBudgetModal,
}) => {
  // Period Mode: 'monthly' vs 'yearly'
  const [periodType, setPeriodType] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedYear, setSelectedYear] = useState<string>(() => selectedMonth.slice(0, 4) || '2026');

  // Sync selectedYear if selectedMonth changes
  React.useEffect(() => {
    if (selectedMonth) {
      setSelectedYear(selectedMonth.slice(0, 4));
    }
  }, [selectedMonth]);

  // ==========================================
  // MONTHLY DATA COMPUTATIONS
  // ==========================================
  const monthlyTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const monthlyTotalExpense = monthlyTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyTotalIncome = monthlyTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyNetBalance = monthlyTotalIncome - monthlyTotalExpense;

  const monthlyCashExpenses = monthlyTransactions
    .filter((t) => t.type === 'expense' && t.paymentMethod === 'cash')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyCreditCardExpenses = monthlyTransactions
    .filter((t) => t.type === 'expense' && t.paymentMethod === 'credit_card')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyTransferExpenses = monthlyTransactions
    .filter((t) => t.type === 'expense' && (t.paymentMethod === 'transfer' || t.paymentMethod === 'bank_transfer' || t.paymentMethod === 'promptpay'))
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyTotalTracked = monthlyCashExpenses + monthlyCreditCardExpenses + monthlyTransferExpenses;
  const monthlyCashPercent = monthlyTotalTracked > 0 ? (monthlyCashExpenses / monthlyTotalTracked) * 100 : 0;
  const monthlyCreditCardPercent = monthlyTotalTracked > 0 ? (monthlyCreditCardExpenses / monthlyTotalTracked) * 100 : 0;
  const monthlyTransferPercent = monthlyTotalTracked > 0 ? (monthlyTransferExpenses / monthlyTotalTracked) * 100 : 0;

  // Monthly Categories for Pie
  const monthlyCategoryMap: { [cat: string]: number } = {};
  monthlyTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      monthlyCategoryMap[t.category] = (monthlyCategoryMap[t.category] || 0) + t.amount;
    });

  const monthlyPieData = Object.entries(monthlyCategoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Monthly Budget calculations
  const budgetLimit = budget.monthlyBudget;
  const budgetPercent = budgetLimit > 0 ? (monthlyTotalExpense / budgetLimit) * 100 : 0;
  const isOverBudget = monthlyTotalExpense > budgetLimit;
  const isNearBudget = !isOverBudget && budgetPercent >= budget.warningThresholdPercent;
  const overAmount = monthlyTotalExpense - budgetLimit;
  const remainingBudget = Math.max(0, budgetLimit - monthlyTotalExpense);

  // ==========================================
  // YEARLY DATA COMPUTATIONS
  // ==========================================
  const yearlyTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedYear));
  }, [transactions, selectedYear]);

  const yearlyTotalExpense = yearlyTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const yearlyTotalIncome = yearlyTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const yearlyNetBalance = yearlyTotalIncome - yearlyTotalExpense;

  const yearlyCashExpenses = yearlyTransactions
    .filter((t) => t.type === 'expense' && t.paymentMethod === 'cash')
    .reduce((sum, t) => sum + t.amount, 0);

  const yearlyCreditCardExpenses = yearlyTransactions
    .filter((t) => t.type === 'expense' && t.paymentMethod === 'credit_card')
    .reduce((sum, t) => sum + t.amount, 0);

  const yearlyTransferExpenses = yearlyTransactions
    .filter((t) => t.type === 'expense' && (t.paymentMethod === 'transfer' || t.paymentMethod === 'bank_transfer' || t.paymentMethod === 'promptpay'))
    .reduce((sum, t) => sum + t.amount, 0);

  const yearlyTotalTracked = yearlyCashExpenses + yearlyCreditCardExpenses + yearlyTransferExpenses;
  const yearlyCashPercent = yearlyTotalTracked > 0 ? (yearlyCashExpenses / yearlyTotalTracked) * 100 : 0;
  const yearlyCreditCardPercent = yearlyTotalTracked > 0 ? (yearlyCreditCardExpenses / yearlyTotalTracked) * 100 : 0;
  const yearlyTransferPercent = yearlyTotalTracked > 0 ? (yearlyTransferExpenses / yearlyTotalTracked) * 100 : 0;

  // Monthly average (divided by 12 months)
  const yearlyMonthlyAverage = yearlyTotalExpense / 12;

  // 12-Month trend data for BarChart and detail table
  const monthlyTrendData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const mStr = String(i + 1).padStart(2, '0');
      const ym = `${selectedYear}-${mStr}`;
      const mTransactions = yearlyTransactions.filter((t) => t.date.startsWith(ym));

      const exp = mTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const inc = mTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const cash = mTransactions
        .filter((t) => t.type === 'expense' && t.paymentMethod === 'cash')
        .reduce((sum, t) => sum + t.amount, 0);

      const card = mTransactions
        .filter((t) => t.type === 'expense' && t.paymentMethod === 'credit_card')
        .reduce((sum, t) => sum + t.amount, 0);

      const transfer = mTransactions
        .filter((t) => t.type === 'expense' && (t.paymentMethod === 'transfer' || t.paymentMethod === 'bank_transfer' || t.paymentMethod === 'promptpay'))
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        monthKey: ym,
        monthIndex: i,
        name: THAI_MONTHS_SHORT[i],
        fullName: THAI_MONTHS_FULL[i],
        expense: exp,
        income: inc,
        net: inc - exp,
        cash,
        creditCard: card,
        transfer,
        txCount: mTransactions.length,
        isOverBudget: budgetLimit > 0 && exp > budgetLimit,
      };
    });
  }, [yearlyTransactions, selectedYear, budgetLimit]);

  // Highest spending month
  const highestMonth = useMemo(() => {
    const withExpenses = monthlyTrendData.filter((m) => m.expense > 0);
    if (withExpenses.length === 0) return null;
    return [...withExpenses].sort((a, b) => b.expense - a.expense)[0];
  }, [monthlyTrendData]);

  // Annual Categories for Pie
  const yearlyCategoryMap: { [cat: string]: number } = {};
  yearlyTransactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      yearlyCategoryMap[t.category] = (yearlyCategoryMap[t.category] || 0) + t.amount;
    });

  const yearlyPieData = Object.entries(yearlyCategoryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Annual Budget comparison
  const annualBudgetLimit = budgetLimit * 12;
  const annualBudgetPercent = annualBudgetLimit > 0 ? (yearlyTotalExpense / annualBudgetLimit) * 100 : 0;
  const annualRemainingBudget = Math.max(0, annualBudgetLimit - yearlyTotalExpense);

  // ==========================================
  // NAVIGATION HELPERS
  // ==========================================
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

  const handlePrevYear = () => {
    const prev = String(parseInt(selectedYear, 10) - 1);
    setSelectedYear(prev);
    onChangeMonth(`${prev}-${selectedMonth.slice(5, 7) || '01'}`);
  };

  const handleNextYear = () => {
    const next = String(parseInt(selectedYear, 10) + 1);
    setSelectedYear(next);
    onChangeMonth(`${next}-${selectedMonth.slice(5, 7) || '01'}`);
  };

  const handleDrilldownMonth = (ym: string) => {
    onChangeMonth(ym);
    setPeriodType('monthly');
  };

  const formatMonthThai = (ym: string) => {
    const [year, month] = ym.split('-');
    const mIndex = parseInt(month, 10) - 1;
    const thaiYear = parseInt(year, 10) + 543;
    return `${THAI_MONTHS_FULL[mIndex] || month} ${thaiYear}`;
  };

  const thaiYearDisplay = parseInt(selectedYear, 10) + 543;

  return (
    <div className="space-y-6">
      
      {/* Top Header: Period Toggle (Monthly vs Yearly) & Date Navigators */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: View Mode Segmented Controls */}
        <div className="flex items-center gap-3">
          <div className="inline-flex p-1 rounded-xl bg-stone-100 border border-stone-200/80 text-xs font-semibold">
            <button
              id="period-toggle-monthly"
              onClick={() => setPeriodType('monthly')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                periodType === 'monthly'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-red-600" />
              <span>สรุปรายเดือน</span>
            </button>
            <button
              id="period-toggle-yearly"
              onClick={() => setPeriodType('yearly')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                periodType === 'yearly'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-red-600" />
              <span>สรุปรายปี</span>
            </button>
          </div>

          <span className="hidden sm:inline-block text-xs text-stone-400">
            {periodType === 'monthly' ? 'ดูข้อมูลเจาะลึกประจำเดือน' : 'ดูภาพรวม 12 เดือนและแนวโน้มทั้งปี'}
          </span>
        </div>

        {/* Center / Right: Date Navigators depending on Mode */}
        <div className="flex items-center justify-between md:justify-end gap-2.5">
          {periodType === 'monthly' ? (
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
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="dash-prev-year-btn"
                onClick={handlePrevYear}
                className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors cursor-pointer"
                title="ปีก่อนหน้า"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="min-w-[170px] text-center">
                <span className="text-base sm:text-lg font-bold text-stone-900">
                  ปี พ.ศ. {thaiYearDisplay} ({selectedYear})
                </span>
              </div>
              <button
                id="dash-next-year-btn"
                onClick={handleNextYear}
                className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors cursor-pointer"
                title="ปีถัดไป"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* YEARLY VIEW DASHBOARD */}
      {/* ========================================================================= */}
      {periodType === 'yearly' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Yearly Primary KPI Cards Grid (4 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Annual Total Expenses */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -z-0 opacity-60" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-stone-500">รายจ่ายรวมทั้งปี {thaiYearDisplay}</span>
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tight text-red-600">
                  ฿{yearlyTotalExpense.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="mt-1 text-[11px] text-stone-400">
                  {yearlyTransactions.filter((t) => t.type === 'expense').length} รายการตลอดทั้งปี
                </p>
              </div>
            </div>

            {/* Card 2: Monthly Average */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500">เฉลี่ยต่อเดือน</span>
                <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-stone-900">
                ฿{yearlyMonthlyAverage.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="mt-1 text-[11px] text-stone-500 truncate">
                {highestMonth && highestMonth.expense > 0 ? (
                  <span>
                    จ่ายสูงสุด: <strong className="text-red-600">{highestMonth.fullName}</strong> (฿{highestMonth.expense.toLocaleString('th-TH', { maximumFractionDigits: 0 })})
                  </span>
                ) : (
                  <span>คำนวณจาก 12 เดือน</span>
                )}
              </div>
            </div>

            {/* Card 3: Annual Income & Net Savings */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500">รายรับรวมทั้งปี</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-700">
                ฿{yearlyTotalIncome.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-stone-500">
                <span>ยอดออมสุทธิ:</span>
                <strong className={`font-semibold ${yearlyNetBalance >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                  {yearlyNetBalance < 0 ? '-' : '+'}฿{Math.abs(yearlyNetBalance).toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                </strong>
              </div>
            </div>

            {/* Card 4: 3 Payment Methods Overview */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-500">ช่องทางชำระเงินทั้งปี</span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-stone-500 flex items-center gap-1">
                    <Banknote className="w-3 h-3 text-emerald-600" /> เงินสด:
                  </span>
                  <span className="font-semibold text-stone-800">
                    ฿{yearlyCashExpenses.toLocaleString('th-TH', { maximumFractionDigits: 0 })} ({yearlyCashPercent.toFixed(0)}%)
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-stone-500 flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-rose-600" /> บัตรเครดิต:
                  </span>
                  <span className="font-semibold text-stone-800">
                    ฿{yearlyCreditCardExpenses.toLocaleString('th-TH', { maximumFractionDigits: 0 })} ({yearlyCreditCardPercent.toFixed(0)}%)
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-stone-500 flex items-center gap-1">
                    <Landmark className="w-3 h-3 text-sky-600" /> โอน/พร้อมเพย์:
                  </span>
                  <span className="font-semibold text-stone-800">
                    ฿{yearlyTransferExpenses.toLocaleString('th-TH', { maximumFractionDigits: 0 })} ({yearlyTransferPercent.toFixed(0)}%)
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Section: 12-Month Expense Trend Bar Chart */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div>
                <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-red-600" />
                  <span>แนวโน้มค่าใช้จ่ายรายเดือน (มกราคม - ธันวาคม {thaiYearDisplay})</span>
                </h3>
                <p className="text-xs text-stone-500">
                  กราฟแท่งเปรียบเทียบยอดใช้จ่ายจริงในแต่ละเดือนตลอดทั้งปี
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 text-stone-500">
                  <span className="w-3 h-3 rounded-sm bg-red-600" />
                  <span>รายจ่าย (฿)</span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-stone-500">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                  <span>รายรับ (฿)</span>
                </span>
              </div>
            </div>

            {/* Bar Chart Container */}
            <div className="mt-4 h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrendData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F4" />
                  <XAxis
                    dataKey="name"
                    stroke="#78716C"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#E7E5E4' }}
                  />
                  <YAxis
                    stroke="#78716C"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#E7E5E4' }}
                    tickFormatter={(val) => `฿${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    cursor={{ fill: '#FEF2F2', opacity: 0.6 }}
                    formatter={(value: any, name: any) => [
                      `฿${Number(value || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}`,
                      name === 'expense' ? 'รายจ่าย' : 'รายรับ',
                    ]}
                    labelFormatter={(label: any) => {
                      const item = monthlyTrendData.find((m) => m.name === label);
                      return item ? `${item.fullName} ${thaiYearDisplay}` : label;
                    }}
                    contentStyle={{
                      backgroundColor: '#1C1917',
                      color: '#FFFFFF',
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '12px',
                      padding: '8px 12px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    }}
                  />
                  <Bar
                    dataKey="expense"
                    name="expense"
                    fill="#DC2626"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                  >
                    {monthlyTrendData.map((entry, index) => {
                      const isPeak = highestMonth && highestMonth.monthIndex === index && entry.expense > 0;
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={isPeak ? '#991B1B' : '#E11D48'}
                        />
                      );
                    })}
                  </Bar>
                  <Bar
                    dataKey="income"
                    name="income"
                    fill="#10B981"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                    opacity={0.8}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick summary notes below Bar Chart */}
            <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>
                  เดือนที่จ่ายสูงสุด: <strong>{highestMonth ? `${highestMonth.fullName} (฿${highestMonth.expense.toLocaleString('th-TH')})` : '-'}</strong>
                </span>
              </div>
              <div className="text-[11px] text-stone-400">
                * คลิกที่แถบเดือนหรือตารางด้านล่างเพื่อสลับไปดูรายเดือนนั้นแบบละเอียด
              </div>
            </div>
          </div>

          {/* Section: Annual Category Donut Chart & Annual Payment Methods Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left (7 cols): Annual Donut Chart */}
            <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="font-bold text-stone-900 text-base">
                    สัดส่วนรายจ่ายตามหมวดหมู่ตลอดทั้งปี {thaiYearDisplay}
                  </h3>
                  <p className="text-xs text-stone-500">
                    กราฟวงกลมแสดงหมวดหมู่ที่ใช้จ่ายตลอด 12 เดือน
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 font-medium">
                  {yearlyPieData.length} หมวดหมู่
                </span>
              </div>

              {yearlyPieData.length > 0 ? (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center flex-1">
                  <div className="md:col-span-7 h-64 sm:h-72 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={yearlyPieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={3}
                        >
                          {yearlyPieData.map((_, index) => (
                            <Cell
                              key={`cell-yr-${index}`}
                              fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                              stroke="#ffffff"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val: any) => [
                            `฿${Number(val || 0).toLocaleString('th-TH', { minimumFractionDigits: 2 })}`,
                            'ยอดรวมทั้งปี',
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

                  <div className="md:col-span-5 space-y-2 max-h-64 overflow-y-auto pr-1">
                    {yearlyPieData.map((item, idx) => {
                      const percent = yearlyTotalExpense > 0 ? (item.value / yearlyTotalExpense) * 100 : 0;
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
                  <Wallet className="w-10 h-10 mb-2 text-stone-300" />
                  <p className="text-sm font-medium text-stone-600">ยังไม่มีรายการค่าใช้จ่ายในปี {thaiYearDisplay}</p>
                </div>
              )}
            </div>

            {/* Right (5 cols): Annual Payment Methods & Budget Utilization */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Payment Methods Breakdown */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs">
                <h3 className="font-bold text-stone-900 text-base">
                  สัดส่วนการชำระเงินตลอดปี {thaiYearDisplay}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  เปรียบเทียบเงินสด, บัตรเครดิต, และโอนเงิน/พร้อมเพย์ทั้งปี
                </p>

                <div className="mt-4">
                  <div className="h-3 w-full rounded-full bg-stone-100 overflow-hidden flex">
                    <div
                      style={{ width: `${yearlyCashPercent}%` }}
                      className="bg-emerald-500 transition-all duration-500"
                      title={`เงินสด: ${yearlyCashPercent.toFixed(1)}%`}
                    />
                    <div
                      style={{ width: `${yearlyCreditCardPercent}%` }}
                      className="bg-rose-600 transition-all duration-500"
                      title={`บัตรเครดิต: ${yearlyCreditCardPercent.toFixed(1)}%`}
                    />
                    <div
                      style={{ width: `${yearlyTransferPercent}%` }}
                      className="bg-sky-500 transition-all duration-500"
                      title={`โอนเงิน/พร้อมเพย์: ${yearlyTransferPercent.toFixed(1)}%`}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 truncate">
                        <Banknote className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">เงินสด</span>
                      </div>
                      <p className="mt-1 text-sm font-bold text-emerald-900 truncate">
                        ฿{yearlyCashExpenses.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-[10px] text-emerald-700">
                        {yearlyCashPercent.toFixed(0)}%
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-800 truncate">
                        <CreditCard className="w-3 h-3 text-rose-600 shrink-0" />
                        <span className="truncate">บัตรเครดิต</span>
                      </div>
                      <p className="mt-1 text-sm font-bold text-rose-900 truncate">
                        ฿{yearlyCreditCardExpenses.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-[10px] text-rose-700">
                        {yearlyCreditCardPercent.toFixed(0)}%
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-sky-800 truncate">
                        <Landmark className="w-3 h-3 text-sky-600 shrink-0" />
                        <span className="truncate">โอน/พร้อมเพย์</span>
                      </div>
                      <p className="mt-1 text-sm font-bold text-sky-900 truncate">
                        ฿{yearlyTransferExpenses.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-[10px] text-sky-700">
                        {yearlyTransferPercent.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Annual Budget Progress */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">
                      เปรียบเทียบงบประมาณรายปี
                    </h3>
                    <p className="text-xs text-stone-500">
                      คำนวณจากงบเดือนละ ฿{budgetLimit.toLocaleString('th-TH')} (รวม ฿{annualBudgetLimit.toLocaleString('th-TH')}/ปี)
                    </p>
                  </div>
                  <button
                    onClick={onOpenBudgetModal}
                    className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                  >
                    ปรับงบ
                  </button>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                    <span className="text-stone-600">
                      ใช้ไปแล้ว ฿{yearlyTotalExpense.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                    </span>
                    <span className={yearlyTotalExpense > annualBudgetLimit ? 'text-red-600 font-bold' : 'text-stone-700 font-bold'}>
                      {annualBudgetPercent.toFixed(1)}%
                    </span>
                  </div>

                  <div className="h-3.5 w-full rounded-full bg-stone-100 overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, annualBudgetPercent)}%` }}
                      className={`h-full transition-all duration-500 ${
                        yearlyTotalExpense > annualBudgetLimit
                          ? 'bg-red-600'
                          : annualBudgetPercent > 80
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                </div>

                <div className="mt-4 p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs text-stone-600">
                  <span>งบคงเหลือทั้งปี:</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    ฿{annualRemainingBudget.toLocaleString('th-TH', { maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

            </div>

          </div>

          {/* Section: Month-by-Month Detailed Table / Grid for the 12 Months */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-bold text-stone-900 text-base">
                  สรุปรายละเอียดรายจ่ายแยกรายเดือน (12 เดือน)
                </h3>
                <p className="text-xs text-stone-500">
                  แตะที่ปุ่มของเดือนที่ต้องการเพื่อสลับไปดูรายรับรายจ่ายแบบรายเดือนได้ทันที
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {monthlyTrendData.map((m) => {
                const hasData = m.expense > 0 || m.income > 0;
                return (
                  <div
                    key={m.monthKey}
                    className={`p-3.5 rounded-xl border transition-all ${
                      m.isOverBudget
                        ? 'border-red-200 bg-red-50/20'
                        : hasData
                        ? 'border-stone-200 hover:border-red-300 hover:bg-stone-50/70'
                        : 'border-stone-100 bg-stone-50/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 text-sm">
                        {m.fullName}
                      </span>
                      {m.isOverBudget && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">
                          เกินงบ
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5 space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500">รายจ่าย:</span>
                        <span className="font-bold text-red-600">
                          ฿{m.expense.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500">รายรับ:</span>
                        <span className="font-medium text-emerald-600">
                          ฿{m.income.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-[11px] text-stone-400">
                        {m.txCount} รายการ
                      </span>
                      <button
                        onClick={() => handleDrilldownMonth(m.monthKey)}
                        className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>ดูรายเดือน</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MONTHLY VIEW DASHBOARD (Existing monthly features) */}
      {/* ========================================================================= */}
      {periodType === 'monthly' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
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
            <div className="text-xs text-stone-500 flex items-center gap-1.5 px-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>งบประมาณปกติ (คงเหลือ ฿{remainingBudget.toLocaleString('th-TH', { maximumFractionDigits: 0 })})</span>
            </div>
          )}

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
                  ฿{monthlyTotalExpense.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                ฿{monthlyCashExpenses.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-stone-500">
                <span className="font-semibold text-emerald-700">{monthlyCashPercent.toFixed(0)}%</span> ของรายจ่าย
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
                ฿{monthlyCreditCardExpenses.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-stone-500">
                <span className="font-semibold text-rose-600">{monthlyCreditCardPercent.toFixed(0)}%</span> ของรายจ่าย
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
                ฿{monthlyTransferExpenses.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-stone-500">
                <span className="font-semibold text-sky-600">{monthlyTransferPercent.toFixed(0)}%</span> ของรายจ่าย
              </div>
            </div>

          </div>

          {/* Income & Net Balance Ribbon */}
          <div className="bg-stone-100/70 border border-stone-200/70 px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4">
              <span className="text-stone-500">
                รายรับรวมเดือนนี้: <strong className="text-emerald-700 font-semibold">฿{monthlyTotalIncome.toLocaleString('th-TH', { minimumFractionDigits: 2 })}</strong>
              </span>
              <span className="text-stone-300">•</span>
              <span className="text-stone-500">
                ยอดคงเหลือสุทธิ: <strong className={`font-semibold ${monthlyNetBalance >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{monthlyNetBalance < 0 ? '-' : '+'}฿{Math.abs(monthlyNetBalance).toLocaleString('th-TH', { minimumFractionDigits: 2 })}</strong>
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
                  {monthlyPieData.length} หมวดหมู่
                </span>
              </div>

              {monthlyPieData.length > 0 ? (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center flex-1">
                  
                  {/* Donut Chart */}
                  <div className="md:col-span-7 h-64 sm:h-72 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={monthlyPieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={3}
                        >
                          {monthlyPieData.map((_, index) => (
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
                    {monthlyPieData.map((item, idx) => {
                      const percent = monthlyTotalExpense > 0 ? (item.value / monthlyTotalExpense) * 100 : 0;
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
                      style={{ width: `${monthlyCashPercent}%` }}
                      className="bg-emerald-500 transition-all duration-500"
                      title={`เงินสด: ${monthlyCashPercent.toFixed(1)}%`}
                    />
                    <div
                      style={{ width: `${monthlyCreditCardPercent}%` }}
                      className="bg-rose-600 transition-all duration-500"
                      title={`บัตรเครดิต: ${monthlyCreditCardPercent.toFixed(1)}%`}
                    />
                    <div
                      style={{ width: `${monthlyTransferPercent}%` }}
                      className="bg-sky-500 transition-all duration-500"
                      title={`โอนเงิน/พร้อมเพย์: ${monthlyTransferPercent.toFixed(1)}%`}
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
                        ฿{monthlyCashExpenses.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-[10px] text-emerald-700">
                        {monthlyCashPercent.toFixed(1)}% ของค่าใช้จ่าย
                      </p>
                    </div>

                    {/* Credit Card Badge */}
                    <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-800">
                        <CreditCard className="w-3.5 h-3.5 text-rose-600" />
                        <span>บัตรเครดิต</span>
                      </div>
                      <p className="mt-1 text-base font-bold text-rose-900">
                        ฿{monthlyCreditCardExpenses.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-[10px] text-rose-700">
                        {monthlyCreditCardPercent.toFixed(1)}% ของค่าใช้จ่าย
                      </p>
                    </div>

                    {/* Transfer / PromptPay Badge */}
                    <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-800">
                        <Landmark className="w-3.5 h-3.5 text-sky-600" />
                        <span>โอนเงิน / พร้อมเพย์</span>
                      </div>
                      <p className="mt-1 text-base font-bold text-sky-900">
                        ฿{monthlyTransferExpenses.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-[10px] text-sky-700">
                        {monthlyTransferPercent.toFixed(1)}% ของค่าใช้จ่าย
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
                      ใช้ไปแล้ว ฿{monthlyTotalExpense.toLocaleString('th-TH', { maximumFractionDigits: 0 })}
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
      )}

    </div>
  );
};
