export interface User {
  id: number;
  email: string;
  full_name: string;
  currency: string;
  created_at: string;
}

export interface Category {
  id: number;
  user_id?: number | null;
  name: string;
  type: 'expense' | 'income';
  color: string;
  icon: string;
  is_custom: boolean;
}

export interface Transaction {
  id: number;
  user_id: number;
  category_id?: number | null;
  type: 'expense' | 'income';
  amount: number;
  date: string;
  payment_method: string;
  description: string;
  notes?: string | null;
  tags?: string | null;
  is_recurring?: boolean;
  recurring_frequency?: string | null;
  is_anomaly?: boolean;
  created_at: string;
  category?: Category | null;
}

export interface Budget {
  id: number;
  user_id: number;
  category_id: number;
  period_month: number;
  period_year: number;
  amount: number;
  created_at: string;
  category?: Category | null;
  spent_amount?: number;
  percentage?: number;
  is_exceeded?: boolean;
}

export interface RecurringPayment {
  id: number;
  user_id: number;
  category_id?: number | null;
  title: string;
  amount: number;
  frequency: string;
  due_day: number;
  next_due_date: string;
  is_active: boolean;
  payment_method: string;
  provider?: string | null;
  created_at: string;
  category?: Category | null;
  days_until_due?: number;
}

export interface GoalContribution {
  id: number;
  goal_id: number;
  amount: number;
  date: string;
  note?: string | null;
  created_at: string;
}

export interface SavingsGoal {
  id: number;
  user_id: number;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  created_at: string;
  percentage?: number;
  recommended_monthly_contribution?: number;
  contributions?: GoalContribution[];
}

export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface AIInsight {
  id: number;
  type: 'positive' | 'warning' | 'recommendation' | 'trend';
  title: string;
  body: string;
  is_dismissed: boolean;
  created_at: string;
}

export interface HealthScore {
  overall_score: number;
  rating: string;
  breakdown: Record<string, { score: number; max: number; [key: string]: any }>;
  recommendations: string[];
  disclaimer: string;
}

export interface DashboardSummary {
  range_type: string;
  total_balance: number;
  income: number;
  expenses: number;
  savings: number;
  category_breakdown: Array<{ name: string; color: string; value: number }>;
  health_score: HealthScore;
}
