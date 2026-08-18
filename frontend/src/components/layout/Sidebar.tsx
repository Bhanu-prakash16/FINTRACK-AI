import React from 'react';
import { 
  LayoutDashboard, ArrowLeftRight, PieChart, TrendingUp, 
  Repeat, Target, FileText, Settings, ShieldCheck 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'subscriptions', label: 'Subscriptions', icon: Repeat },
    { id: 'goals', label: 'Savings Goals', icon: Target },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:block border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-bg min-h-[calc(100vh-4rem)] p-4 transition-colors">
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-bold tracking-wider uppercase text-gray-400 dark:text-gray-500 mb-3">
          Main Menu
        </p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-hover hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Security Badge in sidebar bottom */}
      <div className="mt-12 p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-gray-100 dark:from-dark-card dark:to-dark-hover border border-gray-200 dark:border-gray-800 text-center">
        <div className="flex items-center justify-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs mb-1">
          <ShieldCheck className="h-4 w-4" />
          <span>256-bit Bank Grade</span>
        </div>
        <p className="text-[10px] text-gray-500 dark:text-gray-400">
          Encrypted sessions with strict user isolation.
        </p>
      </div>
    </aside>
  );
};
