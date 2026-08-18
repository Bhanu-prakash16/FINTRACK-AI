from datetime import datetime, date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# --- User & Auth Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    currency: Optional[str] = "INR"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: str
    currency: str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenData(BaseModel):
    user_id: Optional[int] = None


# --- Category Schemas ---
class CategoryBase(BaseModel):
    name: str
    type: str # 'expense' or 'income'
    color: Optional[str] = "#6366f1"
    icon: Optional[str] = "tag"

class CategoryCreate(CategoryBase):
    pass

class CategoryOut(CategoryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int] = None
    is_custom: bool = False


# --- Transaction Schemas ---
class TransactionBase(BaseModel):
    amount: float = Field(..., gt=0)
    category_id: Optional[int] = None
    type: str # 'expense' or 'income'
    date: date
    payment_method: Optional[str] = "UPI"
    description: str
    notes: Optional[str] = None
    tags: Optional[str] = None
    is_recurring: Optional[bool] = False
    recurring_frequency: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    amount: Optional[float] = None
    category_id: Optional[int] = None
    type: Optional[str] = None
    date: Optional[date] = None
    payment_method: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    tags: Optional[str] = None
    is_recurring: Optional[bool] = None

class TransactionOut(TransactionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    is_anomaly: bool
    created_at: datetime
    category: Optional[CategoryOut] = None


# --- Budget Schemas ---
class BudgetBase(BaseModel):
    category_id: int
    period_month: int = Field(..., ge=1, le=12)
    period_year: int = Field(..., ge=2020)
    amount: float = Field(..., gt=0)

class BudgetCreate(BudgetBase):
    pass

class BudgetOut(BudgetBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime
    category: Optional[CategoryOut] = None
    spent_amount: Optional[float] = 0.0
    percentage: Optional[float] = 0.0
    is_exceeded: Optional[bool] = False


# --- Recurring Payment Schemas ---
class RecurringPaymentBase(BaseModel):
    title: str
    amount: float = Field(..., gt=0)
    category_id: Optional[int] = None
    frequency: str = "monthly"
    due_day: int = Field(..., ge=1, le=31)
    next_due_date: date
    payment_method: Optional[str] = "Credit Card"
    provider: Optional[str] = None

class RecurringPaymentCreate(RecurringPaymentBase):
    pass

class RecurringPaymentOut(RecurringPaymentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    is_active: bool
    created_at: datetime
    category: Optional[CategoryOut] = None
    days_until_due: Optional[int] = None


# --- Savings Goal Schemas ---
class GoalContributionCreate(BaseModel):
    amount: float = Field(..., gt=0)
    date: Optional[date] = None
    note: Optional[str] = None

class GoalContributionOut(GoalContributionCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    goal_id: int
    created_at: datetime

class SavingsGoalBase(BaseModel):
    title: str
    target_amount: float = Field(..., gt=0)
    current_amount: Optional[float] = 0.0
    target_date: date

class SavingsGoalCreate(SavingsGoalBase):
    pass

class SavingsGoalOut(SavingsGoalBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime
    percentage: Optional[float] = 0.0
    recommended_monthly_contribution: Optional[float] = 0.0
    contributions: List[GoalContributionOut] = []


# --- Notification & Insight Schemas ---
class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    type: str
    title: str
    message: str
    is_read: bool
    created_at: datetime

class AIInsightOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    type: str
    title: str
    body: str
    is_dismissed: bool
    created_at: datetime


# --- Financial Health Score Schema ---
class FinancialHealthScoreOut(BaseModel):
    overall_score: int
    rating: str
    breakdown: Dict[str, Any]
    recommendations: List[str]
    disclaimer: str = "This health score is generated automatically for educational tracking purposes and does not constitute certified financial advice."


# --- AI Assistant Schemas ---
class AIQueryInput(BaseModel):
    question: str

class AIQueryResponse(BaseModel):
    answer: str
    data_context: Optional[dict] = None
    disclaimer: str = "FinTrack AI insights are for tracking & educational reference only, not professional financial advice."
