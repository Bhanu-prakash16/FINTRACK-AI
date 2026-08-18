import { 
  User, Transaction, Budget, Category, RecurringPayment, SavingsGoal, 
  NotificationItem, AIInsight, DashboardSummary 
} from '../types';

const API_BASE_URL = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('fintrack_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export const api = {
  // Auth
  async signup(data: any) {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Signup failed');
    }
    return res.json();
  },

  async login(data: any) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    }
    return res.json();
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch user profile');
    return res.json();
  },

  // Dashboard & Analytics
  async getDashboardSummary(rangeType = 'this_month'): Promise<DashboardSummary> {
    const res = await fetch(`${API_BASE_URL}/analytics/dashboard-summary?range_type=${rangeType}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard summary');
    return res.json();
  },

  async getSpendingAnalytics(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/analytics/spending-analytics`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch analytics');
    return res.json();
  },

  // Transactions
  async getTransactions(params?: Record<string, string>): Promise<Transaction[]> {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/transactions?${query}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  async createTransaction(tx: any): Promise<Transaction> {
    const res = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(tx)
    });
    if (!res.ok) throw new Error('Failed to create transaction');
    return res.json();
  },

  async updateTransaction(id: number, tx: any): Promise<Transaction> {
    const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(tx)
    });
    if (!res.ok) throw new Error('Failed to update transaction');
    return res.json();
  },

  async deleteTransaction(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete transaction');
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async createCategory(cat: any): Promise<Category> {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(cat)
    });
    if (!res.ok) throw new Error('Failed to create category');
    return res.json();
  },

  // Budgets
  async getBudgets(): Promise<Budget[]> {
    const res = await fetch(`${API_BASE_URL}/budgets`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch budgets');
    return res.json();
  },

  async setBudget(budget: any): Promise<Budget> {
    const res = await fetch(`${API_BASE_URL}/budgets`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(budget)
    });
    if (!res.ok) throw new Error('Failed to set budget');
    return res.json();
  },

  // Recurring Payments
  async getRecurringPayments(): Promise<RecurringPayment[]> {
    const res = await fetch(`${API_BASE_URL}/recurring-payments`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch recurring payments');
    return res.json();
  },

  async createRecurringPayment(data: any): Promise<RecurringPayment> {
    const res = await fetch(`${API_BASE_URL}/recurring-payments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create recurring payment');
    return res.json();
  },

  async deleteRecurringPayment(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/recurring-payments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete recurring payment');
  },

  // Savings Goals
  async getSavingsGoals(): Promise<SavingsGoal[]> {
    const res = await fetch(`${API_BASE_URL}/savings-goals`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch savings goals');
    return res.json();
  },

  async createSavingsGoal(data: any): Promise<SavingsGoal> {
    const res = await fetch(`${API_BASE_URL}/savings-goals`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create savings goal');
    return res.json();
  },

  async contributeToGoal(goalId: number, data: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/savings-goals/${goalId}/contribute`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to add contribution');
    return res.json();
  },

  // Notifications & Insights
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await fetch(`${API_BASE_URL}/notifications`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markNotificationRead(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to mark notification read');
  },

  async getAIInsights(): Promise<AIInsight[]> {
    const res = await fetch(`${API_BASE_URL}/ai/insights`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch AI insights');
    return res.json();
  },

  async askAIAssistant(question: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/ai/assistant`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ question })
    });
    if (!res.ok) throw new Error('Failed to get response from AI assistant');
    return res.json();
  },

  // Reports
  downloadCSVReport() {
    const token = localStorage.getItem('fintrack_token');
    window.open(`${API_BASE_URL}/reports/csv?token=${token}`, '_blank');
  },

  downloadPDFReport() {
    const token = localStorage.getItem('fintrack_token');
    window.open(`${API_BASE_URL}/reports/pdf?token=${token}`, '_blank');
  }
};
