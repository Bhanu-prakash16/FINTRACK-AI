import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User as UserIcon, ShieldAlert } from 'lucide-react';
import { api } from '../../lib/api';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  context?: any;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: "Hello! I'm your FinTrack AI Financial Assistant. Ask me anything about your current spending, budget status, or affordability calculations based on your real transactions!"
    }
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await api.askAIAssistant(userText);
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: res.answer, context: res.data_context }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: "Sorry, I ran into an error connecting to your financial ledger." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    "Where am I spending the most?",
    "How much did I spend on food this month?",
    "Can I afford a ₹10,000 purchase?",
    "Why are my expenses higher this month?",
    "How can I reduce my monthly spending?"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-dark-card rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-dark-hover/50">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 text-white flex items-center justify-center shadow-glow">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <span>FinTrack AI Assistant</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-300 dark:border-brand-800">
                  Grounded Engine
                </span>
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Strictly answers using your live transaction data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div
                className={`h-8 w-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold ${
                  m.sender === 'user'
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-900 text-brand-400 border border-slate-700'
                }`}
              >
                {m.sender === 'user' ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-none'
                    : 'bg-gray-100 dark:bg-dark-hover text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-200 dark:border-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap font-sans">{m.text}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <Sparkles className="h-4 w-4 animate-spin text-brand-500" />
              <span>Analyzing database ledger...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-6 py-2 border-t border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-dark-bg/50 flex flex-wrap gap-2">
          {sampleQuestions.slice(0, 3).map((q, idx) => (
            <button
              key={idx}
              onClick={() => setInput(q)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-brand-500 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-card flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI about your money, food spending, or budgets..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-bg text-xs text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold disabled:opacity-50 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

        {/* Safety Disclaimer Footer */}
        <div className="px-4 py-1.5 bg-slate-900 text-[10px] text-slate-400 text-center border-t border-slate-800">
          🛡️ Educational insight engine based on actual ledger records. Not certified financial advice.
        </div>
      </div>
    </div>
  );
};
