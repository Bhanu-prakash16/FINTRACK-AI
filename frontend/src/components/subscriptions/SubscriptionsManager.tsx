import React, { useState, useEffect } from 'react';
import { Plus, Repeat, AlertCircle, Calendar, CreditCard, Trash2, ShieldAlert } from 'lucide-react';
import { api } from '../../lib/api';
import { RecurringPayment } from '../../types';

export const SubscriptionsManager: React.FC = () => {
  const [payments, setPayments] = useState<RecurringPayment[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('monthly');
  const [dueDay, setDueDay] = useState('15');
  const [provider, setProvider] = useState('');

  const loadPayments = async () => {
    try {
      const data = await api.getRecurringPayments();
      setPayments(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const today = new Date();
      const nextDue = new Date(today.getFullYear(), today.getMonth(), parseInt(dueDay));

      await api.createRecurringPayment({
        title,
        amount: parseFloat(amount),
        frequency,
        due_day: parseInt(dueDay),
        next_due_date: nextDue.toISOString().split('T')[0],
        provider
      });
      setShowModal(false);
      setTitle('');
      setAmount('');
      loadPayments();
    } catch (err) {
      alert('Failed to save subscription');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this recurring payment?')) {
      await api.deleteRecurringPayment(id);
      loadPayments();
    }
  };

  const monthlyTotal = payments.reduce((acc, p) => acc + (p.frequency === 'monthly' ? p.amount : p.amount / 12), 0);
  const yearlyTotal = monthlyTotal * 12;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recurring Payments & Subscriptions</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Track Netflix, JioFiber, Rent, and recurring bill due dates</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-700 shadow-glow flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Subscription</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase">Monthly Recurring Cost</span>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">₹{monthlyTotal.toLocaleString()}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase">Yearly Recurring Burden</span>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">₹{yearlyTotal.toLocaleString()}</p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase">Active Subscriptions</span>
          <p className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-1">{payments.length} Services</p>
        </div>
      </div>

      {/* Subscriptions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {payments.map((p) => (
          <div key={p.id} className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
                    <Repeat className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">{p.title}</h3>
                    <p className="text-xs text-gray-400">{p.provider || 'Subscription Service'}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="my-4">
                <span className="text-2xl font-black text-gray-900 dark:text-white">
                  ₹{p.amount.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 ml-1">/ {p.frequency}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
              <span className="text-gray-500">Due in {p.days_until_due ?? 3} day(s)</span>
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900">
                {p.next_due_date}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Subscription Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add Subscription</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Netflix Premium"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 649"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg text-xs outline-none"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Due Day of Month (1-31)</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  required
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg text-xs outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 text-xs font-bold text-white shadow-glow"
                >
                  Save Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
