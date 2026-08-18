from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.core.database import get_db
from app.models.models import User, RecurringPayment
from app.schemas.schemas import RecurringPaymentCreate, RecurringPaymentOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/recurring-payments", tags=["Recurring Payments"])

@router.get("", response_model=List[RecurringPaymentOut])
def get_recurring_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    payments = db.query(RecurringPayment).filter(
        RecurringPayment.user_id == current_user.id
    ).all()

    today = date.today()
    res = []
    for p in payments:
        p_out = RecurringPaymentOut.model_validate(p)
        days = (p.next_due_date - today).days
        p_out.days_until_due = max(0, days)
        res.append(p_out)

    return res


@router.post("", response_model=RecurringPaymentOut)
def create_recurring_payment(
    rec_in: RecurringPaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    payment = RecurringPayment(
        user_id=current_user.id,
        category_id=rec_in.category_id,
        title=rec_in.title,
        amount=rec_in.amount,
        frequency=rec_in.frequency or "monthly",
        due_day=rec_in.due_day,
        next_due_date=rec_in.next_due_date,
        payment_method=rec_in.payment_method or "Credit Card",
        provider=rec_in.provider,
        is_active=True
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    p_out = RecurringPaymentOut.model_validate(payment)
    p_out.days_until_due = max(0, (payment.next_due_date - date.today()).days)
    return p_out


@router.delete("/{rec_id}")
def delete_recurring_payment(
    rec_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    payment = db.query(RecurringPayment).filter(
        RecurringPayment.id == rec_id,
        RecurringPayment.user_id == current_user.id
    ).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Recurring payment not found")

    db.delete(payment)
    db.commit()
    return {"message": "Recurring payment deleted"}
