from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from datetime import date
from app.core.database import get_db
from app.models.models import User, Transaction, Category
from app.schemas.schemas import TransactionCreate, TransactionUpdate, TransactionOut
from app.api.deps import get_current_user
from app.services.smart_detection import check_transaction_anomaly

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("", response_model=List[TransactionOut])
def get_transactions(
    type: Optional[str] = None,
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    payment_method: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)

    if type:
        query = query.filter(Transaction.type == type)
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    if payment_method:
        query = query.filter(Transaction.payment_method == payment_method)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Transaction.description.ilike(search_pattern),
                Transaction.notes.ilike(search_pattern),
                Transaction.tags.ilike(search_pattern)
            )
        )

    transactions = query.order_by(Transaction.date.desc(), Transaction.id.desc()).offset(offset).limit(limit).all()
    return transactions


@router.post("", response_model=TransactionOut)
def create_transaction(
    tx_in: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Smart Anomaly Detection check for expenses
    is_anomaly = False
    if tx_in.type == "expense" and tx_in.category_id:
        is_anomaly = check_transaction_anomaly(
            db=db,
            user_id=current_user.id,
            amount=tx_in.amount,
            category_id=tx_in.category_id,
            description=tx_in.description
        )

    tx = Transaction(
        user_id=current_user.id,
        category_id=tx_in.category_id,
        type=tx_in.type,
        amount=tx_in.amount,
        date=tx_in.date,
        payment_method=tx_in.payment_method or "UPI",
        description=tx_in.description,
        notes=tx_in.notes,
        tags=tx_in.tags,
        is_recurring=tx_in.is_recurring or False,
        recurring_frequency=tx_in.recurring_frequency,
        is_anomaly=is_anomaly
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx


@router.put("/{tx_id}", response_model=TransactionOut)
def update_transaction(
    tx_id: int,
    tx_in: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tx = db.query(Transaction).filter(
        Transaction.id == tx_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    update_data = tx_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(tx, field, val)

    db.commit()
    db.refresh(tx)
    return tx


@router.delete("/{tx_id}")
def delete_transaction(
    tx_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tx = db.query(Transaction).filter(
        Transaction.id == tx_id,
        Transaction.user_id == current_user.id
    ).first()
    
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    db.delete(tx)
    db.commit()
    return {"message": "Transaction deleted successfully"}
