import React, { useState, useEffect } from 'react';
import { 
  Wallet, ArrowUpRight, ArrowDownRight, PiggyBank, Sparkles, 
  TrendingUp, PieChart as PieIcon, AlertTriangle, Calendar, ChevronRight, Plus
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { api } from '../../lib/api';
import { DashboardSummary, Transaction, Budget, RecurringPayment, AIInsight } from '../../types';

interface MainDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenAIAssistant: () => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ onNavigateTab, onOpenAIAssistant }) => {
  const [rangeType, setRangeType] = useState('this_month');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [recurring, setRecurring] = useState<RecurringPayment[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [sumData, txData, bData, rData, iData] = await Promise.all([
          api.getDashboardSummary(rangeType),
          api.getTransactions({ limit: '6' }),
          api.getBudgets(),
          api.getRecurringPayments(),
          api.getAIInsights()
        ]);
        setSummary(sumData);
        setTransactions(txData);
        setBudgets(bData);
        setRecurring(rData);
        setInsights(iData);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [rangeType]);

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#64748b'];

  const trendData = [
    { name: 'Week 1', income: 45000, expense: 7500 },
    { name: 'Week 2', income: 0, expense: 6250 },
    { name: 'Week 3', income: 0, expense: 5500 },
    { name: 'Week 4', income: 0, expense: 8100 },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Date Range Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Financial Dashboard</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Overview of cashflow, budgets, and financial health</p>
        </div>

        <div className="flex items-center space-x-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 p-1 rounded-2xl">
          {[
            { id: 'this_week', label: 'This Week' },
            { id: 'this_month', label: 'This Month' },
            { id: 'last_3_months', label: 'Last 3 Months' },
            { id: 'this_year', label: 'This Year' },
          ].map((r) => (
            <button
              key={r.id}
              onClick={() => setRangeType(r.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                rangeType === r.id
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance */}
        <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-400">Total Balance</span>
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-2">
            ₹{summary?.total_balance.toLocaleString() ?? '82,450'}
          </p>
          <span className="inline-block text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            ↑ +12.4% vs last month
          </span>
        </div>

        {/* Income This Month */}
        <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-400">Income This Month</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            ₹{summary?.income.toLocaleString() ?? '45,000'}
          </p>
          <span className="inline-block text-[11px] text-gray-500 dark:text-gray-400 mt-1">Salary & Client payouts</span>
        </div>

        {/* Expenses This Month */}
        <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-400">Expenses This Month</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <ArrowDownRight className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
            ₹{summary?.expenses.toLocaleString() ?? '27,350'}
          </p>
          <span className="inline-block text-[11px] text-rose-500 font-semibold mt-1">
            60.7% of monthly income
          </span>
        </div>

        {/* Savings */}
        <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-400">Monthly Savings</span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <PiggyBank className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
            ₹{summary?.savings.toLocaleString() ?? '17,650'}
          </p>
          <span className="inline-block text-[11px] text-indigo-500 font-semibold mt-1">
            39.2% Savings Rate
          </span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Spending Trend & Category Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Spending Trend Area Chart */}
          <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Spending & Income Trend</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Weekly cashflow trajectory</p>
              </div>
              <button
                onClick={() => onNavigateTab('analytics')}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center space-x-1"
              >
                <span>View Full Analytics</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip formatter={(val: number) => [`₹${val.toLocaleString()}`, '']} />
                  <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#incomeGradient)" />
                  <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#expenseGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Budget Progress Overview */}
          <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Budget Progress</h3>
              <button
                onClick={() => onNavigateTab('budgets')}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                Manage Budgets
              </button>
            </div>

            <div className="space-y-4">
              {budgets.slice(0, 4).map((b) => (
                <div key={b.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {b.category?.name || 'Category'}
                    </span>
                    <span className={`font-bold ${b.is_exceeded ? 'text-rose-500' : 'text-gray-900 dark:text-gray-100'}`}>
                      ₹{b.spent_amount?.toLocaleString() ?? 0} / ₹{b.amount.toLocaleString()} ({b.percentage}%)
                      {b.is_exceeded && ' ⚠️'}
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        b.is_exceeded
                          ? 'bg-rose-500'
                          : (b.percentage ?? 0) > 80
                          ? 'bg-amber-500'
                          : 'bg-brand-500'
                      }`}
                      style={{ width: `${Math.min(100, b.percentage ?? 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Health Score, AI Insights & Subscriptions */}
        <div className="space-y-6">
          {/* Financial Health Score Widget */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-dark-card border border-gray-800 text-white shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400">Financial Health</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-800">
                {summary?.health_score?.rating || 'Good'}
              </span>
            </div>
            <div className="flex items-baseline space-x-2 my-2">
              <span className="text-4xl font-black">{summary?.health_score?.overall_score ?? 82}</span>
              <span className="text-slate-400 text-sm">/ 100</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden my-3">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-teal-400 rounded-full"
                style={{ width: `${summary?.health_score?.overall_score ?? 82}%` }}
              />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {summary?.health_score?.recommendations?.[0] || 'Strong savings rate and good budget control.'}
            </p>
          </div>

          {/* AI Insights Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-brand-950/50 to-slate-900 border border-brand-800/60 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-brand-400 font-bold text-xs">
                <Sparkles className="h-4 w-4" />
                <span>AI Financial Insight</span>
              </div>
              <button
                onClick={onOpenAIAssistant}
                className="text-[11px] font-bold text-brand-300 hover:underline"
              >
                Ask Assistant
              </button>
            </div>
            {insights.length > 0 ? (
              <div>
                <p className="text-xs font-bold text-white mb-1">{insights[0].title}</p>
                <p className="text-xs text-slate-300 leading-relaxed">{insights[0].body}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-300">
                💡 You spent 23% more on food this month. Consider setting a weekly dining cap.
              </p>
            )}
          </div>

          {/* Upcoming Subscriptions */}
          <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Upcoming Subscriptions</h3>
              <button
                onClick={() => onNavigateTab('subscriptions')}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {recurring.slice(0, 3).map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-dark-hover">
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">{r.title}</p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">Due in {r.days_until_due ?? 3} days</p>
                  </div>
                  <span className="text-xs font-extrabold text-gray-900 dark:text-white">
                    ₹{r.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
