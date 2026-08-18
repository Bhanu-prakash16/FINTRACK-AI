import React, { useState, useEffect } from 'react';
import { TrendingUp, PieChart as PieIcon, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import { api } from '../../lib/api';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await api.getSpendingAnalytics();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  const COLORS = ['#ef4444', '#ec4899', '#f59e0b', '#8b5cf6', '#3b82f6', '#06b6d4', '#10b981'];

  const categoryChanges = data?.category_changes || [
    { category: 'Food & Dining', current: 6250, previous: 5300, change_pct: 18.0 },
    { category: 'Shopping', current: 5500, previous: 6250, change_pct: -12.0 },
    { category: 'Transport', current: 3100, previous: 2900, change_pct: 7.0 },
    { category: 'Entertainment', current: 3250, previous: 2500, change_pct: 30.0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Spending Analytics</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Deep-dive financial breakdown, spending trajectory, and changes</p>
      </div>

      {/* Top Spending Changes Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categoryChanges.slice(0, 4).map((c: any, idx: number) => {
          const isIncrease = c.change_pct > 0;
          return (
            <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 shadow-sm">
              <span className="text-xs font-bold text-gray-400 uppercase">{c.category}</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-xl font-black text-gray-900 dark:text-white">₹{c.current.toLocaleString()}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                  isIncrease
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 border border-rose-200 dark:border-rose-800'
                    : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800'
                }`}>
                  {isIncrease ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  <span>{isIncrease ? '+' : ''}{c.change_pct}%</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Income vs Expenses Comparison Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Monthly Income vs Expenses</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.monthly_trend || []}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, '']} />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut */}
        <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 shadow-sm">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Expense Category Allocation</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChanges}
                  dataKey="current"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={4}
                >
                  {categoryChanges.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
