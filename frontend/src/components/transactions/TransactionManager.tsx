import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, ArrowUpRight, ArrowDownRight, Edit2, 
  Trash2, Calendar, Tag, CreditCard, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { api } from '../../lib/api';
import { Transaction, Category } from '../../types';

export const TransactionManager: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [txType, setTxType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (typeFilter) params.type = typeFilter;
      if (categoryFilter) params.category_id = categoryFilter;

      const [tList, cList] = await Promise.all([
        api.getTransactions(params),
        api.getCategories()
      ]);
      setTransactions(tList);
      setCategories(cList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [search, typeFilter, categoryFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createTransaction({
        type: txType,
        amount: parseFloat(amount),
        category_id: categoryId ? parseInt(categoryId) : null,
        description,
        payment_method: paymentMethod,
        notes,
        tags,
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddModal(false);
      resetForm();
      loadTransactions();
    } catch (err) {
      alert('Failed to save transaction');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this transaction?')) {
      await api.deleteTransaction(id);
      loadTransactions();
    }
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setNotes('');
    setTags('');
    setCategoryId('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Transaction Management</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Track every rupee spent or earned with smart anomaly checks</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-700 shadow-glow flex items-center space-x-2 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search description, notes, tags..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg text-xs text-gray-900 dark:text-white outline-none"
        >
          <option value="">All Types</option>
          <option value="expense">Expenses Only</option>
          <option value="income">Income Only</option>
        </select>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg text-xs text-gray-900 dark:text-white outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Transaction Table */}
      <div className="rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-dark-hover border-b border-gray-200 dark:border-gray-800 text-gray-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Description</th>
                <th className="p-4">Category</th>
                <th className="p-4">Payment</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-hover/50 transition-colors">
                    <td className="p-4 font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">{tx.date}</td>
                    <td className="p-4 font-semibold text-gray-900 dark:text-white">
                      <div className="flex items-center space-x-2">
                        <span>{tx.description}</span>
                        {tx.is_anomaly && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-600 border border-amber-300 dark:border-amber-800">
                            ⚠️ Anomaly
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 font-medium text-gray-700 dark:text-gray-300">
                        {tx.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500 dark:text-gray-400">{tx.payment_method}</td>
                    <td className={`p-4 text-right font-black ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    No transactions found. Click "Add Transaction" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-dark-card rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add Transaction</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="flex rounded-xl bg-gray-100 dark:bg-dark-bg p-1">
                <button
                  type="button"
                  onClick={() => setTxType('expense')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    txType === 'expense' ? 'bg-rose-500 text-white shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('income')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    txType === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500'
                  }`}
                >
                  Income
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg text-xs outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Weekly Grocery Shopping"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg text-xs outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg text-xs outline-none"
                >
                  <option value="">Select Category</option>
                  {categories.filter(c => c.type === txType).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg text-xs outline-none"
                >
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Cash">Cash</option>
                </select>
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
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
