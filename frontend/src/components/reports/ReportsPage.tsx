import React from 'react';
import { FileText, Download, FileSpreadsheet, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api';

export const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Download Financial Reports</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Export comprehensive financial summaries, transaction ledgers, and budget compliance reports</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* CSV Report Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">CSV Transaction Ledger</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              Complete raw transaction history including amounts, dates, custom categories, payment methods, and notes. Compatible with Excel, Google Sheets, and accounting tools.
            </p>
          </div>

          <button
            onClick={() => api.downloadCSVReport()}
            className="mt-6 w-full py-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 shadow-glow flex items-center justify-center space-x-2 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download CSV Statement</span>
          </button>
        </div>

        {/* PDF Report Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Executive PDF Summary</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
              Formatted PDF report containing key performance indicators, savings rates, category budget compliance, and top spending breakdowns.
            </p>
          </div>

          <button
            onClick={() => api.downloadPDFReport()}
            className="mt-6 w-full py-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-glow flex items-center justify-center space-x-2 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
