import os
import sys
from datetime import date, timedelta, datetime

# Ensure app is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.models import User, Category, Transaction, Budget, RecurringPayment, SavingsGoal, GoalContribution, Notification, AIInsight

def seed_database():
    print("[INIT] Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing demo data
    existing_user = db.query(User).filter(User.email == "demo@fintrack.ai").first()
    if existing_user:
        print("Refreshing demo account data...")
        db.delete(existing_user)
        db.commit()

    print("[USER] Creating demo user: demo@fintrack.ai / Demo@123456")
    user = User(
        email="demo@fintrack.ai",
        hashed_password=get_password_hash("Demo@123456"),
        full_name="Alex Morgan",
        currency="INR"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Categories
    cat_defs = [
        {"name": "Food & Dining", "type": "expense", "color": "#ef4444", "icon": "utensils"},
        {"name": "Shopping", "type": "expense", "color": "#ec4899", "icon": "shopping-bag"},
        {"name": "Transport", "type": "expense", "color": "#f59e0b", "icon": "car"},
        {"name": "Entertainment", "type": "expense", "color": "#8b5cf6", "icon": "film"},
        {"name": "Bills & Utilities", "type": "expense", "color": "#3b82f6", "icon": "receipt"},
        {"name": "Education", "type": "expense", "color": "#06b6d4", "icon": "graduation-cap"},
        {"name": "Health & Fitness", "type": "expense", "color": "#10b981", "icon": "heart-pulse"},
        {"name": "Travel", "type": "expense", "color": "#14b8a6", "icon": "plane"},
        {"name": "Subscriptions", "type": "expense", "color": "#6366f1", "icon": "tv"},
        {"name": "Investments", "type": "expense", "color": "#84cc16", "icon": "trending-up"},
        {"name": "Salary", "type": "income", "color": "#22c55e", "icon": "wallet"},
        {"name": "Freelance / Business", "type": "income", "color": "#10b981", "icon": "briefcase"},
    ]

    cat_map = {}
    for c in cat_defs:
        cat_obj = Category(
            user_id=user.id,
            name=c["name"],
            type=c["type"],
            color=c["color"],
            icon=c["icon"],
            is_custom=False
        )
        db.add(cat_obj)
        db.commit()
        db.refresh(cat_obj)
        cat_map[c["name"]] = cat_obj.id

    today = date.today()
    curr_month = today.month
    curr_year = today.year

    print("[DATA] Populating multi-month income and expense transactions...")
    
    # Historical Income & Expenses (All-time accumulated balance setup)
    historical_txs = [
        # Previous Month (30 days ago)
        {"date": today - timedelta(days=40), "type": "income", "cat": "Salary", "amount": 45000, "desc": "Monthly Salary Credit", "method": "Net Banking"},
        {"date": today - timedelta(days=35), "type": "income", "cat": "Freelance / Business", "amount": 15000, "desc": "UI Design Client Project", "method": "UPI"},
        {"date": today - timedelta(days=38), "type": "expense", "cat": "Bills & Utilities", "amount": 15000, "desc": "Apartment Rent", "method": "Net Banking"},
        {"date": today - timedelta(days=34), "type": "expense", "cat": "Food & Dining", "amount": 5400, "desc": "Monthly Groceries Supermarket", "method": "Credit Card"},
        {"date": today - timedelta(days=32), "type": "expense", "cat": "Transport", "amount": 2800, "desc": "Fuel & Metro Pass", "method": "UPI"},

        # Current Month (Matching dashboard totals)
        {"date": today - timedelta(days=15), "type": "income", "cat": "Salary", "amount": 45000, "desc": "Monthly Tech Salary", "method": "Net Banking"},
        
        # Expenses this month (Total ₹27,350)
        {"date": today - timedelta(days=14), "type": "expense", "cat": "Bills & Utilities", "amount": 7500, "desc": "Apartment Maintenance & Electricity", "method": "Net Banking"},
        {"date": today - timedelta(days=12), "type": "expense", "cat": "Food & Dining", "amount": 6250, "desc": "Groceries & Swiggy/Zomato Dining", "method": "Credit Card"},
        {"date": today - timedelta(days=10), "type": "expense", "cat": "Shopping", "amount": 5500, "desc": "Casual Wear & Shoes", "method": "UPI"},
        {"date": today - timedelta(days=8), "type": "expense", "cat": "Entertainment", "amount": 3250, "desc": "Movie Tickets & Concert Pass", "method": "Credit Card"},
        {"date": today - timedelta(days=5), "type": "expense", "cat": "Transport", "amount": 3100, "desc": "Uber Cabs & Petrol Refill", "method": "UPI"},
        {"date": today - timedelta(days=2), "type": "expense", "cat": "Subscriptions", "amount": 1648, "desc": "Netflix 4K & JioFiber Broadband", "method": "Credit Card"},
        
        # Anomaly Transaction (Unusual spending test)
        {"date": today - timedelta(days=1), "type": "expense", "cat": "Shopping", "amount": 7800, "desc": "Electronics Gadget Purchase", "method": "Credit Card", "is_anomaly": True},
    ]

    for tx in historical_txs:
        cat_id = cat_map.get(tx["cat"])
        t_obj = Transaction(
            user_id=user.id,
            category_id=cat_id,
            type=tx["type"],
            amount=float(tx["amount"]),
            date=tx["date"],
            payment_method=tx.get("method", "UPI"),
            description=tx["desc"],
            notes=tx.get("notes", ""),
            is_anomaly=tx.get("is_anomaly", False)
        )
        db.add(t_obj)

    print("[BUDGETS] Creating Monthly Budgets...")
    budgets = [
        {"cat": "Food & Dining", "amount": 8000},
        {"cat": "Transport", "amount": 5000},
        {"cat": "Entertainment", "amount": 3000}, # Overbudget test (₹3,250 spent)
        {"cat": "Shopping", "amount": 10000},
        {"cat": "Subscriptions", "amount": 3000},
    ]

    for b in budgets:
        b_obj = Budget(
            user_id=user.id,
            category_id=cat_map[b["cat"]],
            period_month=curr_month,
            period_year=curr_year,
            amount=float(b["amount"])
        )
        db.add(b_obj)

    print("[RECURRING] Setting up Recurring Subscriptions...")
    subscriptions = [
        {"title": "Netflix Premium", "amount": 649, "cat": "Subscriptions", "due_day": today.day + 3, "due_date": today + timedelta(days=3), "provider": "Netflix Inc."},
        {"title": "JioFiber 1Gbps Internet", "amount": 999, "cat": "Bills & Utilities", "due_day": today.day + 8, "due_date": today + timedelta(days=8), "provider": "Reliance Jio"},
        {"title": "Spotify Family Plan", "amount": 179, "cat": "Subscriptions", "due_day": today.day + 12, "due_date": today + timedelta(days=12), "provider": "Spotify AB"},
        {"title": "House Rent", "amount": 15000, "cat": "Bills & Utilities", "due_day": today.day + 15, "due_date": today + timedelta(days=15), "provider": "Landlord Transfer"},
    ]

    for s in subscriptions:
        r_obj = RecurringPayment(
            user_id=user.id,
            category_id=cat_map.get(s["cat"]),
            title=s["title"],
            amount=float(s["amount"]),
            frequency="monthly",
            due_day=s["due_day"],
            next_due_date=s["due_date"],
            payment_method="Credit Card",
            provider=s["provider"],
            is_active=True
        )
        db.add(r_obj)

    print("[GOALS] Creating Savings Goals...")
    laptop_goal = SavingsGoal(
        user_id=user.id,
        title="Gaming Laptop",
        target_amount=80000,
        current_amount=52000,
        target_date=today + timedelta(days=120)
    )
    db.add(laptop_goal)

    emergency_goal = SavingsGoal(
        user_id=user.id,
        title="Emergency Fund",
        target_amount=150000,
        current_amount=110000,
        target_date=today + timedelta(days=180)
    )
    db.add(emergency_goal)
    db.commit()

    db.refresh(laptop_goal)
    db.refresh(emergency_goal)

    # Goal Contributions
    db.add(GoalContribution(goal_id=laptop_goal.id, user_id=user.id, amount=12000, date=today - timedelta(days=25), note="Monthly allocation"))
    db.add(GoalContribution(goal_id=laptop_goal.id, user_id=user.id, amount=10000, date=today - timedelta(days=10), note="Freelance bonus contribution"))

    print("[NOTIFS] Adding initial Notifications & Insights...")
    notifs = [
        {"type": "budget_exceeded", "title": "Entertainment Budget Exceeded", "msg": "Entertainment spending (INR 3,250) has exceeded your monthly target of INR 3,000 (108%)."},
        {"type": "recurring_due", "title": "Netflix Payment Due", "msg": "Netflix INR 649 renewal payment is due in 3 days."},
        {"type": "unusual_spending", "title": "Unusual Spending Detected", "msg": "INR 7,800 spent on Shopping. This is approx 2.4x higher than your typical average."},
        {"type": "goal_milestone", "title": "Savings Milestone Reached", "msg": "You've reached 65% of your Gaming Laptop goal!"}
    ]

    for n in notifs:
        db.add(Notification(
            user_id=user.id,
            type=n["type"],
            title=n["title"],
            message=n["msg"],
            is_read=False
        ))

    db.commit()
    db.close()
    print("[SUCCESS] Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
