from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import Transaction, Notification, Category

def check_transaction_anomaly(db: Session, user_id: int, amount: float, category_id: int, description: str) -> bool:
    if not category_id or amount < 1500:
        return False

    # Get average for this category
    avg_amount = db.query(func.avg(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.category_id == category_id,
        Transaction.type == "expense"
    ).scalar()

    if avg_amount and avg_amount > 0:
        if amount >= 2.2 * avg_amount:
            cat_obj = db.query(Category).filter(Category.id == category_id).first()
            cat_name = cat_obj.name if cat_obj else "Expense"
            
            # Create automated anomaly notification
            notif = Notification(
                user_id=user_id,
                type="unusual_spending",
                title="Unusual Spending Detected",
                message=f"₹{amount:,.0f} spent on '{description}' ({cat_name}). This is approx {amount/avg_amount:.1f}x higher than your typical average."
            )
            db.add(notif)
            db.commit()
            return True

    return False
