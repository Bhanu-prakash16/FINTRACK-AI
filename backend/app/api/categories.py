from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from app.core.database import get_db
from app.models.models import User, Category
from app.schemas.schemas import CategoryCreate, CategoryOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("", response_model=List[CategoryOut])
def get_categories(
    type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Category).filter(
        or_(Category.user_id == current_user.id, Category.user_id.is_(None))
    )
    if type:
        query = query.filter(Category.type == type)

    return query.order_by(Category.name.asc()).all()


@router.post("", response_model=CategoryOut)
def create_custom_category(
    cat_in: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    category = Category(
        user_id=current_user.id,
        name=cat_in.name,
        type=cat_in.type,
        color=cat_in.color or "#6366f1",
        icon=cat_in.icon or "tag",
        is_custom=True
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category
