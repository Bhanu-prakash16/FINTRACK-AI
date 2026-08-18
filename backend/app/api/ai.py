from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import User, AIInsight
from app.schemas.schemas import AIQueryInput, AIQueryResponse, AIInsightOut
from app.api.deps import get_current_user
from app.services.ai_service import process_ai_query, generate_auto_insights

router = APIRouter(prefix="/ai", tags=["AI Engine"])

@router.post("/assistant", response_model=AIQueryResponse)
def ask_ai_assistant(
    query_in: AIQueryInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not query_in.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    return process_ai_query(db=db, user_id=current_user.id, question=query_in.question)


@router.get("/insights", response_model=List[AIInsightOut])
def get_ai_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    auto_insights = generate_auto_insights(db=db, user_id=current_user.id)
    return auto_insights
