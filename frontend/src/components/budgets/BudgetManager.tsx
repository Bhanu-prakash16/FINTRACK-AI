import React, { useState, useEffect } from 'react';
import { Plus, AlertTriangle, CheckCircle2, PieChart as PieIcon, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';
import { Budget, Category } from '../../types';

export const BudgetManager: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [amount, setAmount] = useState('');

  const loadBudgets = async () => {
    try {
      const [bList, cList] = await Promise.all([
        api.getBudgets(),
        api.getCategories()
      ]);
      setBudgets(bList);
      setCategories(cList.filter(c => c.type === 'expense'));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !amount) return;

    try {
      const now = new Date();
      await api.setBudget({
        category_id: parseInt(selectedCategory),
        amount: parseFloat(amount),
        period_month: now.getMonth() + 1,
        period_year: now.getFullYear()
      });
      setShowAddModal(false);
      setAmount('');
      loadBudgets();
    } catch (err) {
      alert('Failed to set budget');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Budget Management</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Set monthly targets, prevent overspending, and track limits</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-700 shadow-glow flex items-center space-x-2 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Set Category Budget</span>
        </button>
      </div>

      {/* Budget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((b) => {
          const pct = b.percentage ?? 0;
          const isExceeded = b.is_exceeded;
          const remaining = b.amount - (b.spent_amount ?? 0);

          return (
            <div
              key={b.id}
              className={`p-6 rounded-3xl bg-white dark:bg-dark-card border transition-all ${
                isExceeded
                  ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                  : 'border-gray-200 dark:border-gray-800'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-sm text-brand-600 dark:text-brand-400">
                    <PieIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">{b.category?.name || 'Category'}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Monthly Budget</p>
                  </div>
                </div>

                {isExceeded ? (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-950 text-rose-600 border border-rose-300 dark:border-rose-800 flex items-center space-x-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>{pct}% ⚠️</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                    {pct}% Used
                  </span>
                )}
              </div>

              {/* Amount Breakdown */}
              <div className="grid grid-cols-2 gap-2 my-4 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-hover">
                  <span className="text-gray-400">Spent So Far</span>
                  <p className="font-bold text-gray-900 dark:text-white text-sm mt-0.5">
                    ₹{(b.spent_amount ?? 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-hover">
                  <span className="text-gray-400">{remaining >= 0 ? 'Remaining' : 'Over Limit By'}</span>
                  <p className={`font-bold text-sm mt-0.5 ${remaining < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    ₹{Math.abs(remaining).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isExceeded ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-brand-500'
                  }`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Set Budget Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Set Category Monthly Budget</h3>
            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Expense Category</label>
                <select
                  required
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg text-xs outline-none"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Monthly Target Limit (₹)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 8000"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg text-xs outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 text-xs font-bold text-white shadow-glow"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
