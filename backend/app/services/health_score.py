from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from app.models.models import Transaction, Budget, RecurringPayment
from app.schemas.schemas import FinancialHealthScoreOut

def calculate_financial_health_score(db: Session, user_id: int) -> FinancialHealthScoreOut:
    today = date.today()
    start_of_month = date(today.year, today.month, 1)

    # 1. Income & Expenses for current month
    income_res = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.type == "income",
        Transaction.date >= start_of_month
    ).scalar() or 0.0

    expense_res = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.date >= start_of_month
    ).scalar() or 0.0

    # Savings Rate Score (Max 30 pts)
    savings_rate = 0.0
    if income_res > 0:
        savings_rate = max(0.0, (income_res - expense_res) / income_res)
    
    # 30% savings rate gives full 30 pts
    savings_score = min(30.0, (savings_rate / 0.30) * 30.0)

    # 2. Budget Adherence Score (Max 25 pts)
    user_budgets = db.query(Budget).filter(
        Budget.user_id == user_id,
        Budget.period_month == today.month,
        Budget.period_year == today.year
    ).all()

    budget_score = 25.0
    under_budget_count = 0
    total_budgets = len(user_budgets)

    if total_budgets > 0:
        for b in user_budgets:
            cat_spent = db.query(func.sum(Transaction.amount)).filter(
                Transaction.user_id == user_id,
                Transaction.category_id == b.category_id,
                Transaction.type == "expense",
                Transaction.date >= start_of_month
            ).scalar() or 0.0

            if cat_spent <= b.amount:
                under_budget_count += 1
        
        budget_score = (under_budget_count / total_budgets) * 25.0

    # 3. Expense Growth / Month-Over-Month Control (Max 15 pts)
    # Compare current month expenses to previous month
    if today.month == 1:
        prev_month = 12
        prev_year = today.year - 1
    else:
        prev_month = today.month - 1
        prev_year = today.year

    prev_start = date(prev_year, prev_month, 1)
    if prev_month == 12:
        prev_end = date(prev_year, 12, 31)
    else:
        prev_end = date(today.year, today.month, 1) - timedelta(days=1)

    prev_expense = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.date >= prev_start,
        Transaction.date <= prev_end
    ).scalar() or 0.0

    growth_score = 15.0
    if prev_expense > 0:
        growth_ratio = expense_res / prev_expense
        if growth_ratio <= 1.0:
            growth_score = 15.0
        elif growth_ratio <= 1.2:
            growth_score = 10.0
        else:
            growth_score = 5.0

    # 4. Fixed Recurring Expense Ratio (Max 15 pts)
    recurring_items = db.query(RecurringPayment).filter(
        RecurringPayment.user_id == user_id,
        RecurringPayment.is_active == True
    ).all()

    total_recurring_monthly = sum(
        r.amount if r.frequency == "monthly" else r.amount / 12.0 for r in recurring_items
    )

    recurring_score = 15.0
    if income_res > 0:
        rec_ratio = total_recurring_monthly / income_res
        if rec_ratio <= 0.20:
            recurring_score = 15.0
        elif rec_ratio <= 0.35:
            recurring_score = 10.0
        else:
            recurring_score = 5.0

    # 5. Spending Consistency & Anomaly Absence (Max 15 pts)
    anomalies_count = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.is_anomaly == True,
        Transaction.date >= start_of_month
    ).count()

    consistency_score = max(0.0, 15.0 - (anomalies_count * 5.0))

    # Overall Score (0 - 100)
    overall = int(round(savings_score + budget_score + growth_score + recurring_score + consistency_score))
    overall = max(0, min(100, overall))

    if overall >= 80:
        rating = "Excellent"
    elif overall >= 65:
        rating = "Good"
    elif overall >= 50:
        rating = "Fair"
    else:
        rating = "Needs Attention"

    recommendations = []
    if savings_rate < 0.20:
        recommendations.append("Aim to save at least 20% of your total monthly income.")
    if total_budgets == 0:
        recommendations.append("Set monthly budgets for major expense categories to keep spending in check.")
    elif under_budget_count < total_budgets:
        recommendations.append("Review categories where you exceeded budgets and adjust your target allocation.")
    if total_recurring_monthly > (0.30 * (income_res or 50000)):
        recommendations.append("Your recurring subscriptions account for over 30% of monthly income. Audit unused subscriptions.")
    if anomalies_count > 0:
        recommendations.append(f"We detected {anomalies_count} unusually large transaction(s) this month.")

    if not recommendations:
        recommendations.append("Great job! Your financial habits are well balanced and on target.")

    breakdown = {
        "Savings Rate": {"score": round(savings_score, 1), "max": 30, "ratio": f"{round(savings_rate * 100, 1)}%"},
        "Budget Adherence": {"score": round(budget_score, 1), "max": 25, "adhered": f"{under_budget_count}/{total_budgets}"},
        "Expense Control": {"score": round(growth_score, 1), "max": 15, "growth": f"Current: ₹{expense_res:,.0f} vs Prev: ₹{prev_expense:,.0f}"},
        "Recurring Expense Burden": {"score": round(recurring_score, 1), "max": 15, "monthly": f"₹{total_recurring_monthly:,.0f}"},
        "Spending Stability": {"score": round(consistency_score, 1), "max": 15, "anomalies": anomalies_count}
    }

    return FinancialHealthScoreOut(
        overall_score=overall,
        rating=rating,
        breakdown=breakdown,
        recommendations=recommendations
    )
