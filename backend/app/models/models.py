from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    currency = Column(String, default="INR")
    created_at = Column(DateTime, default=datetime.utcnow)

    categories = relationship("Category", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="user", cascade="all, delete-orphan")
    recurring_payments = relationship("RecurringPayment", back_populates="user", cascade="all, delete-orphan")
    savings_goals = relationship("SavingsGoal", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    ai_insights = relationship("AIInsight", back_populates="user", cascade="all, delete-orphan")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True) # Nullable for system default categories
    name = Column(String, nullable=False)
    type = Column(String, nullable=False) # 'expense' or 'income'
    color = Column(String, default="#6366f1")
    icon = Column(String, default="tag")
    is_custom = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="categories")
    transactions = relationship("Transaction", back_populates="category")
    budgets = relationship("Budget", back_populates="category")
    recurring_payments = relationship("RecurringPayment", back_populates="category")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    type = Column(String, nullable=False) # 'expense' or 'income'
    amount = Column(Float, nullable=False)
    date = Column(Date, nullable=False, default=date.today)
    payment_method = Column(String, default="UPI") # 'UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash'
    description = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    tags = Column(String, nullable=True) # Comma-separated tags
    is_recurring = Column(Boolean, default=False)
    recurring_frequency = Column(String, nullable=True) # 'monthly', 'weekly', etc.
    is_anomaly = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False)
    period_month = Column(Integer, nullable=False)
    period_year = Column(Integer, nullable=False)
    amount = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="budgets")
    category = relationship("Category", back_populates="budgets")


class RecurringPayment(Base):
    __tablename__ = "recurring_payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    title = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    frequency = Column(String, default="monthly") # 'monthly', 'yearly'
    due_day = Column(Integer, nullable=False, default=1)
    next_due_date = Column(Date, nullable=False)
    is_active = Column(Boolean, default=True)
    payment_method = Column(String, default="Credit Card")
    provider = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="recurring_payments")
    category = relationship("Category", back_populates="recurring_payments")


class SavingsGoal(Base):
    __tablename__ = "savings_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    target_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="savings_goals")
    contributions = relationship("GoalContribution", back_populates="goal", cascade="all, delete-orphan")


class GoalContribution(Base):
    __tablename__ = "goal_contributions"

    id = Column(Integer, primary_key=True, index=True)
    goal_id = Column(Integer, ForeignKey("savings_goals.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(Date, nullable=False, default=date.today)
    note = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    goal = relationship("SavingsGoal", back_populates="contributions")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False) # 'budget_warning', 'budget_exceeded', 'recurring_due', 'unusual_spending', 'goal_milestone'
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class AIInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False) # 'positive', 'warning', 'recommendation', 'trend'
    title = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    is_dismissed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="ai_insights")
