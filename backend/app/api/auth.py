from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models.models import User, Category
from app.schemas.schemas import UserCreate, UserLogin, UserOut, Token
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

DEFAULT_CATEGORIES = [
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
    {"name": "Investments Income", "type": "income", "color": "#14b8a6", "icon": "piggy-bank"},
    {"name": "Other Income", "type": "income", "color": "#a855f7", "icon": "plus-circle"},
]

@router.post("/signup", response_model=Token)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")

    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        currency=user_in.currency or "INR"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Populate default categories for user
    for cat in DEFAULT_CATEGORIES:
        c = Category(
            user_id=user.id,
            name=cat["name"],
            type=cat["type"],
            color=cat["color"],
            icon=cat["icon"],
            is_custom=False
        )
        db.add(c)
    db.commit()

    token = create_access_token(subject=user.id)
    return Token(access_token=token, token_type="bearer", user=UserOut.model_validate(user))


@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    token = create_access_token(subject=user.id)
    return Token(access_token=token, token_type="bearer", user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)
