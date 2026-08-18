import React, { useState, useEffect } from 'react';
import { Plus, Target, PiggyBank, Calendar, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import { SavingsGoal } from '../../types';

export const SavingsGoalsManager: React.FC = () => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showContribModal, setShowContribModal] = useState<number | null>(null);

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [contribAmount, setContribAmount] = useState('');

  const loadGoals = async () => {
    try {
      const data = await api.getSavingsGoals();
      setGoals(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSavingsGoal({
        title,
        target_amount: parseFloat(targetAmount),
        current_amount: currentAmount ? parseFloat(currentAmount) : 0,
        target_date: targetDate
      });
      setShowGoalModal(false);
      resetForm();
      loadGoals();
    } catch (err) {
      alert('Failed to save goal');
    }
  };

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showContribModal || !contribAmount) return;

    try {
      await api.contributeToGoal(showContribModal, {
        amount: parseFloat(contribAmount),
        note: 'Manual Savings Addition'
      });
      setShowContribModal(null);
      setContribAmount('');
      loadGoals();
    } catch (err) {
      alert('Failed to add contribution');
    }
  };

  const resetForm = () => {
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setTargetDate('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Savings Goals Tracker</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Set financial milestones and receive monthly target contribution guidelines</p>
        </div>

        <button
          onClick={() => setShowGoalModal(true)}
          className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-700 shadow-glow flex items-center space-x-2 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((g) => {
          const pct = g.percentage ?? 0;
          return (
            <div key={g.id} className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-2xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">{g.title}</h3>
                      <p className="text-xs text-gray-400">Target Date: {g.target_date}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-300 dark:border-brand-800">
                    {pct}%
                  </span>
                </div>

                <div className="my-4">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs text-gray-400">Saved: ₹{g.current_amount.toLocaleString()}</span>
                    <span className="text-sm font-black text-gray-900 dark:text-white">Goal: ₹{g.target_amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-teal-400 transition-all duration-500"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px]">Recommended Monthly Contribution</span>
                  <span className="font-bold text-brand-600 dark:text-brand-400">
                    ₹{(g.recommended_monthly_contribution ?? 0).toLocaleString()} / mo
                  </span>
                </div>
                <button
                  onClick={() => setShowContribModal(g.id)}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-dark-hover hover:bg-brand-50 dark:hover:bg-brand-950 text-gray-700 dark:text-gray-200 hover:text-brand-600 dark:hover:text-brand-400 font-bold transition-colors"
                >
                  + Add Savings
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Create Savings Goal</h3>
            <form onSubmit={handleCreateGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Goal Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Gaming Laptop / Emergency Fund"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Target Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="e.g. 80000"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Already Saved (₹)</label>
                <input
                  type="number"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  placeholder="e.g. 15000 (Optional)"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Target Date</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg text-xs outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 text-xs font-bold text-white shadow-glow"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {showContribModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-dark-card rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add Savings Contribution</h3>
            <form onSubmit={handleContribute} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Contribution Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={contribAmount}
                  onChange={(e) => setContribAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg text-xs outline-none"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowContribModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 text-xs font-bold text-white shadow-glow"
                >
                  Add Savings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
