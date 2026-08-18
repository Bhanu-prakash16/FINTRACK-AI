import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/authContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { AuthModal } from './components/auth/AuthModal';
import { MainDashboard } from './components/dashboard/MainDashboard';
import { TransactionManager } from './components/transactions/TransactionManager';
import { BudgetManager } from './components/budgets/BudgetManager';
import { AnalyticsPage } from './components/analytics/AnalyticsPage';
import { SubscriptionsManager } from './components/subscriptions/SubscriptionsManager';
import { SavingsGoalsManager } from './components/goals/SavingsGoalsManager';
import { ReportsPage } from './components/reports/ReportsPage';
import { AIAssistantModal } from './components/ai/AIAssistantModal';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-gray-100 font-sans transition-colors selection:bg-brand-500 selection:text-white">
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenAIAssistant={() => setShowAIModal(true)}
        onOpenAuthModal={() => setShowAuthModal(true)}
      />

      {!user ? (
        <LandingPage onGetStarted={() => setShowAuthModal(true)} />
      ) : (
        <div className="flex">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto min-w-0">
            {activeTab === 'dashboard' && (
              <MainDashboard
                onNavigateTab={setActiveTab}
                onOpenAIAssistant={() => setShowAIModal(true)}
              />
            )}
            {activeTab === 'transactions' && <TransactionManager />}
            {activeTab === 'budgets' && <BudgetManager />}
            {activeTab === 'analytics' && <AnalyticsPage />}
            {activeTab === 'subscriptions' && <SubscriptionsManager />}
            {activeTab === 'goals' && <SavingsGoalsManager />}
            {activeTab === 'reports' && <ReportsPage />}
          </main>
        </div>
      )}

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <AIAssistantModal isOpen={showAIModal} onClose={() => setShowAIModal(false)} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
