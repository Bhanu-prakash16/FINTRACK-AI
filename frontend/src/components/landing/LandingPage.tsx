import React, { useState } from 'react';
import { 
  Sparkles, ArrowRight, ShieldCheck, CheckCircle2, TrendingUp, 
  PieChart, Repeat, Lock, HelpCircle, ChevronDown, Zap, HeartPulse
} from 'lucide-react';
import { useAuth } from '../../lib/authContext';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const { demoLogin } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const features = [
    {
      icon: TrendingUp,
      title: "Smart Spending Analytics",
      description: "Visualize cashflow patterns with interactive charts, month-over-month growth stats, and category rankings."
    },
    {
      icon: PieChart,
      title: "Category Budgets & Alerts",
      description: "Set monthly spending limits by category with real-time percentage progress and instant overspending warnings."
    },
    {
      icon: Sparkles,
      title: "AI Financial Assistant",
      description: "Ask natural language questions like 'Can I afford a ₹10,000 purchase?' grounded in your actual ledger records."
    },
    {
      icon: HeartPulse,
      title: "Financial Health Score",
      description: "Get a comprehensive 0–100 score based on savings rate, budget adherence, and fixed subscription burdens."
    },
    {
      icon: Repeat,
      title: "Subscription Manager",
      description: "Track Netflix, JioFiber, and recurring bills with due-date countdowns and expensive subscription alerts."
    },
    {
      icon: Lock,
      title: "Bank-Grade Privacy",
      description: "JWT session tokens, password hashing, and user-level isolation guarantee your financial data stays private."
    }
  ];

  const faqs = [
    {
      q: "How does FinTrack AI calculate my Financial Health Score?",
      a: "Our algorithm evaluates 5 weighted factors: Savings Rate (30%), Budget Adherence (25%), Expense Control (15%), Fixed Subscription Burden (15%), and Spending Stability (15%)."
    },
    {
      q: "Is my financial data secure?",
      a: "Yes. All sessions use encrypted JWT authentication with bcrypt password hashing. Your data is isolated and never shared or sold."
    },
    {
      q: "Can I use Indian Rupees (₹)?",
      a: "FinTrack AI is built natively with Indian Rupee (₹) formatting by default, with complete modularity for international currencies."
    },
    {
      q: "Does the AI assistant make up fake numbers?",
      a: "No! Our AI Assistant executes deterministic queries directly against your actual SQLite/PostgreSQL database records, eliminating hallucinations."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Background Glow Overlay */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-brand-500/15 via-teal-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-950/80 border border-brand-800/60 text-brand-400 text-xs font-semibold mb-6 animate-pulse">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Next-Generation Personal Finance Tracker</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight mb-6">
          Know Where Your <span className="bg-gradient-to-r from-brand-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">Money Goes.</span>
        </h1>

        <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal mb-8 leading-relaxed">
          Track spending, control budgets, and make smarter financial decisions with AI-powered insights.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-500 to-teal-500 hover:from-brand-600 hover:to-teal-600 text-white shadow-glow transition-all active:scale-95 flex items-center justify-center space-x-2"
          >
            <span>Get Started Free</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={demoLogin}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition-colors flex items-center justify-center space-x-2"
          >
            <Zap className="h-4 w-4 text-amber-400" />
            <span>Try Live Demo</span>
          </button>
        </div>
      </section>

      {/* Dashboard Interactive Showcase Preview */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto mb-24">
        <div className="relative rounded-3xl p-3 bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/60 shadow-2xl overflow-hidden">
          <div className="bg-dark-bg rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-rose-500" />
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono text-slate-500 ml-2">fintrack.ai/dashboard</span>
              </div>
              <span className="text-xs text-emerald-400 font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800">
                Live Mockup
              </span>
            </div>

            {/* Dashboard Sample Row Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-xs text-slate-400">Total Balance</span>
                <p className="text-xl font-bold text-white mt-1">₹82,450</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-xs text-emerald-400">Income This Month</span>
                <p className="text-xl font-bold text-white mt-1">₹45,000</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-xs text-rose-400">Expenses This Month</span>
                <p className="text-xl font-bold text-white mt-1">₹27,350</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-xs text-brand-400">Monthly Savings</span>
                <p className="text-xl font-bold text-white mt-1">₹17,650</p>
              </div>
            </div>

            {/* AI Insight Badge */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-brand-950/80 to-slate-900 border border-brand-800/60 flex items-start space-x-3">
              <Sparkles className="h-5 w-5 text-brand-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-brand-300">💡 FinTrack AI Insight</p>
                <p className="text-xs text-slate-300 mt-0.5">
                  "Your savings rate improved to 39.2% this month! Food expenses are at 78% of budget limits."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-4 sm:px-6 max-w-6xl mx-auto mb-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Built for Smart Money Management
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2">
            Everything you need to track, budget, save, and grow your financial health.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div key={idx} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-brand-500/50 transition-all group">
                <div className="h-10 w-10 rounded-xl bg-brand-950 border border-brand-800 text-brand-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it Works */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto mb-24 py-12 rounded-3xl bg-slate-900/40 border border-slate-800">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-white mb-12">
          How FinTrack AI Works
        </h2>
        <div className="grid sm:grid-cols-3 gap-8 text-center">
          <div>
            <div className="h-12 w-12 rounded-full bg-brand-500 text-white font-black text-lg flex items-center justify-center mx-auto mb-4">
              1
            </div>
            <h4 className="font-bold text-white mb-2">Track Income & Expenses</h4>
            <p className="text-xs text-slate-400">Log transactions with custom categories, payment methods, and notes in seconds.</p>
          </div>
          <div>
            <div className="h-12 w-12 rounded-full bg-teal-500 text-white font-black text-lg flex items-center justify-center mx-auto mb-4">
              2
            </div>
            <h4 className="font-bold text-white mb-2">Instant Health Score</h4>
            <p className="text-xs text-slate-400">Get automatic savings rate calculations, anomaly alerts, and budget progress.</p>
          </div>
          <div>
            <div className="h-12 w-12 rounded-full bg-indigo-500 text-white font-black text-lg flex items-center justify-center mx-auto mb-4">
              3
            </div>
            <h4 className="font-bold text-white mb-2">Ask AI Anything</h4>
            <p className="text-xs text-slate-400">Query your real data to get actionable financial insights and reach your goals.</p>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="px-4 sm:px-6 max-w-4xl mx-auto mb-24 text-center">
        <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800">
          <ShieldCheck className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">256-bit Security & Strict Data Isolation</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Your financial data is encrypted and isolated to your user account. We never sell your personal information or store unhashed passwords.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 sm:px-6 max-w-3xl mx-auto mb-24">
        <h2 className="text-2xl font-extrabold text-center text-white mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">{faq.q}</h4>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`} />
              </div>
              {activeFaq === idx && (
                <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800 leading-relaxed">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 px-4 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Sparkles className="h-4 w-4 text-brand-400" />
          <span className="font-bold text-slate-300">FinTrack AI</span>
        </div>
        <p>© 2026 FinTrack AI. Educational & Personal Finance Management Software.</p>
      </footer>
    </div>
  );
};
