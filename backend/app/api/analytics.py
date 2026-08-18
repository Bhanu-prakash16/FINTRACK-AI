from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from typing import Optional
from app.core.database import get_db
from app.models.models import User, Transaction, Category, Budget, RecurringPayment
from app.api.deps import get_current_user
from app.services.health_score import calculate_financial_health_score

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard-summary")
def get_dashboard_summary(
    range_type: str = Query("this_month", description="this_week, this_month, last_3_months, this_year"),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    
    if range_type == "this_week":
        start_d = today - timedelta(days=today.weekday())
        end_d = today
    elif range_type == "last_3_months":
        start_d = today - timedelta(days=90)
        end_d = today
    elif range_type == "this_year":
        start_d = date(today.year, 1, 1)
        end_d = today
    elif range_type == "custom" and start_date and end_date:
        start_d = start_date
        end_d = end_date
    else:  # 'this_month' default
        start_d = date(today.year, today.month, 1)
        end_d = today

    income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "income",
        Transaction.date >= start_d,
        Transaction.date <= end_d
    ).scalar() or 0.0

    expense = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "expense",
        Transaction.date >= start_d,
        Transaction.date <= end_d
    ).scalar() or 0.0

    savings = income - expense

    # Overall user balance (accumulated total all-time)
    all_time_inc = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "income"
    ).scalar() or 0.0

    all_time_exp = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "expense"
    ).scalar() or 0.0

    total_balance = all_time_inc - all_time_exp

    # Category breakdown for donut chart
    cat_breakdown = db.query(
        Category.name,
        Category.color,
        func.sum(Transaction.amount).label("value")
    ).join(Transaction, Transaction.category_id == Category.id).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "expense",
        Transaction.date >= start_d,
        Transaction.date <= end_d
    ).group_by(Category.name, Category.color).all()

    category_chart = [{"name": name, "color": color or "#6366f1", "value": float(val)} for name, color, val in cat_breakdown]

    # Calculate financial health score
    health_score = calculate_financial_health_score(db, current_user.id)

    return {
        "range_type": range_type,
        "total_balance": round(total_balance, 2),
        "income": round(income, 2),
        "expenses": round(expense, 2),
        "savings": round(savings, 2),
        "category_breakdown": category_chart,
        "health_score": health_score
    }


@router.get("/spending-analytics")
def get_spending_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    start_of_year = date(today.year, 1, 1)

    # Monthly income vs expenses for bar/line charts
    raw_monthly = db.query(
        func.strftime("%Y-%m", Transaction.date).label("month"),
        Transaction.type,
        func.sum(Transaction.amount).label("total")
    ).filter(
        Transaction.user_id == current_user.id,
        Transaction.date >= start_of_year
    ).group_by("month", Transaction.type).all()

    monthly_dict = {}
    for m, t_type, tot in raw_monthly:
        if m not in monthly_dict:
            monthly_dict[m] = {"month": m, "income": 0.0, "expenses": 0.0}
        if t_type == "income":
            monthly_dict[m]["income"] += float(tot)
        else:
            monthly_dict[m]["expenses"] += float(tot)

    monthly_trend = sorted(list(monthly_dict.values()), key=lambda x: x["month"])

    # Spending changes percentage (current month vs last month)
    curr_start = date(today.year, today.month, 1)
    if today.month == 1:
        prev_start = date(today.year - 1, 12, 1)
        prev_end = date(today.year - 1, 12, 31)
    else:
        prev_start = date(today.year, today.month - 1, 1)
        prev_end = curr_start - timedelta(days=1)

    # Current month category spending
    curr_cat = dict(db.query(Category.name, func.sum(Transaction.amount)).join(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "expense",
        Transaction.date >= curr_start
    ).group_by(Category.name).all())

    # Previous month category spending
    prev_cat = dict(db.query(Category.name, func.sum(Transaction.amount)).join(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.type == "expense",
        Transaction.date >= prev_start,
        Transaction.date <= prev_end
    ).group_by(Category.name).all())

    category_changes = []
    all_cats = set(curr_cat.keys()).union(set(prev_cat.keys()))
    for cat in all_cats:
        c_amt = float(curr_cat.get(cat, 0.0))
        p_amt = float(prev_cat.get(cat, 0.0))
        if p_amt > 0:
            change_pct = round(((c_amt - p_amt) / p_amt) * 100, 1)
        else:
            change_pct = 100.0 if c_amt > 0 else 0.0

        category_changes.append({
            "category": cat,
            "current": c_amt,
            "previous": p_amt,
            "change_pct": change_pct
        })

    category_changes.sort(key=lambda x: x["current"], reverse=True)

    return {
        "monthly_trend": monthly_trend,
        "category_changes": category_changes
    }
