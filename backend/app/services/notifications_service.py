from sqlalchemy.orm import Session
from datetime import date, timedelta
from app.models.models import Notification, Budget, Transaction, RecurringPayment, SavingsGoal
from sqlalchemy import func

def check_and_generate_notifications(db: Session, user_id: int):
    today = date.today()
    start_of_month = date(today.year, today.month, 1)

    # 1. Check Budgets
    budgets = db.query(Budget).filter(
        Budget.user_id == user_id,
        Budget.period_month == today.month,
        Budget.period_year == today.year
    ).all()

    for b in budgets:
        spent = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.category_id == b.category_id,
            Transaction.type == "expense",
            Transaction.date >= start_of_month
        ).scalar() or 0.0

        pct = (spent / b.amount * 100) if b.amount > 0 else 0
        cat_name = b.category.name if b.category else "Category"

        if pct >= 100:
            existing = db.query(Notification).filter(
                Notification.user_id == user_id,
                Notification.type == "budget_exceeded",
                Notification.title.contains(cat_name)
            ).first()
            if not existing:
                db.add(Notification(
                    user_id=user_id,
                    type="budget_exceeded",
                    title=f"⚠️ {cat_name} Budget Exceeded!",
                    message=f"You spent ₹{spent:,.0f} of your ₹{b.amount:,.0f} limit ({pct:.0f}%)."
                ))

        elif pct >= 85:
            existing = db.query(Notification).filter(
                Notification.user_id == user_id,
                Notification.type == "budget_warning",
                Notification.title.contains(cat_name)
            ).first()
            if not existing:
                db.add(Notification(
                    user_id=user_id,
                    type="budget_warning",
                    title=f"🔔 {cat_name} Nearing Budget Limit",
                    message=f"You've used {pct:.0f}% (₹{spent:,.0f}) of your ₹{b.amount:,.0f} limit."
                ))

    # 2. Check Upcoming Recurring Payments (Due within 7 days)
    upcoming = db.query(RecurringPayment).filter(
        RecurringPayment.user_id == user_id,
        RecurringPayment.is_active == True,
        RecurringPayment.next_due_date >= today,
        RecurringPayment.next_due_date <= today + timedelta(days=7)
    ).all()

    for rec in upcoming:
        days = (rec.next_due_date - today).days
        due_str = "today" if days == 0 else f"in {days} day(s)"
        existing = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.type == "recurring_due",
            Notification.title.contains(rec.title)
        ).first()

        if not existing:
            db.add(Notification(
                user_id=user_id,
                type="recurring_due",
                title=f"🔔 {rec.title} Payment Due",
                message=f"₹{rec.amount:,.0f} payment is due {due_str} ({rec.next_due_date.strftime('%b %d')})."
            ))

    db.commit()
