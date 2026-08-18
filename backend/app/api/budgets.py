from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date
from app.core.database import get_db
from app.models.models import User, Budget, Transaction, Category
from app.schemas.schemas import BudgetCreate, BudgetOut
from app.api.deps import get_current_user
from app.services.notifications_service import check_and_generate_notifications

router = APIRouter(prefix="/budgets", tags=["Budgets"])

@router.get("", response_model=List[BudgetOut])
def get_budgets(
    month: Optional[int] = None,
    year: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = date.today()
    req_month = month or today.month
    req_year = year or today.year

    budgets = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.period_month == req_month,
        Budget.period_year == req_year
    ).all()

    start_of_month = date(req_year, req_month, 1)
    if req_month == 12:
        end_of_month = date(req_year + 1, 1, 1)
    else:
        end_of_month = date(req_year, req_month + 1, 1)

    result = []
    for b in budgets:
        spent = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == current_user.id,
            Transaction.category_id == b.category_id,
            Transaction.type == "expense",
            Transaction.date >= start_of_month,
            Transaction.date < end_of_month
        ).scalar() or 0.0

        pct = (spent / b.amount * 100) if b.amount > 0 else 0.0
        
        b_out = BudgetOut.model_validate(b)
        b_out.spent_amount = spent
        b_out.percentage = round(pct, 1)
        b_out.is_exceeded = spent > b.amount
        result.append(b_out)

    return result


@router.post("", response_model=BudgetOut)
def set_budget(
    b_in: BudgetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Upsert logic
    existing = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.category_id == b_in.category_id,
        Budget.period_month == b_in.period_month,
        Budget.period_year == b_in.period_year
    ).first()

    if existing:
        existing.amount = b_in.amount
        db.commit()
        db.refresh(existing)
        b_target = existing
    else:
        b_target = Budget(
            user_id=current_user.id,
            category_id=b_in.category_id,
            period_month=b_in.period_month,
            period_year=b_in.period_year,
            amount=b_in.amount
        )
        db.add(b_target)
        db.commit()
        db.refresh(b_target)

    # Trigger notification check
    check_and_generate_notifications(db, current_user.id)

    b_out = BudgetOut.model_validate(b_target)
    b_out.spent_amount = 0.0
    b_out.percentage = 0.0
    b_out.is_exceeded = False
    return b_out


@router.delete("/{budget_id}")
def delete_budget(
    budget_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    budget = db.query(Budget).filter(
        Budget.id == budget_id,
        Budget.user_id == current_user.id
    ).first()
    if not budget:
        raise HTTPException(status_code=404, detail="Budget not found")
    db.delete(budget)
    db.commit()
    return {"message": "Budget deleted"}
