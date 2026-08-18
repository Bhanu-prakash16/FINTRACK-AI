import React, { useState } from 'react';
import { Sparkles, Bell, Sun, Moon, LogOut, User as UserIcon, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import { NotificationDrawer } from '../notifications/NotificationDrawer';

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenAIAssistant: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  setDarkMode,
  onOpenAIAssistant,
  onOpenAuthModal
}) => {
  const { user, logout, demoLogin } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md transition-colors">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 text-white shadow-glow">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-brand-500 to-teal-400 bg-clip-text text-transparent">
              FinTrack AI
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-300 dark:border-brand-800">
              PRO
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {/* AI Assistant Button */}
          <button
            onClick={onOpenAIAssistant}
            className="flex items-center space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium rounded-xl text-white bg-gradient-to-r from-brand-600 via-teal-600 to-indigo-600 hover:opacity-95 shadow-glow transition-all active:scale-95"
          >
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span className="hidden xs:inline font-semibold">AI Assistant</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-700" />}
          </button>

          {user ? (
            <>
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors relative"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />
                </button>
                {showNotifications && (
                  <NotificationDrawer onClose={() => setShowNotifications(false)} />
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors"
                >
                  <div className="h-7 w-7 rounded-lg bg-brand-500 text-white font-bold text-xs flex items-center justify-center">
                    {user.full_name.charAt(0)}
                  </div>
                  <span className="hidden md:inline-block text-xs font-semibold text-gray-700 dark:text-gray-200">
                    {user.full_name}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-dark-card border border-gray-100 dark:border-gray-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user.full_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center space-x-2 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={demoLogin}
                className="px-3 py-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/40 rounded-xl transition-colors"
              >
                Demo Login
              </button>
              <button
                onClick={onOpenAuthModal}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-glow transition-colors"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
