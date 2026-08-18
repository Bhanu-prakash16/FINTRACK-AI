from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.core.database import get_db
from app.models.models import User, SavingsGoal, GoalContribution
from app.schemas.schemas import SavingsGoalCreate, SavingsGoalOut, GoalContributionCreate, GoalContributionOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/savings-goals", tags=["Savings Goals"])

@router.get("", response_model=List[SavingsGoalOut])
def get_savings_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goals = db.query(SavingsGoal).filter(
        SavingsGoal.user_id == current_user.id
    ).all()

    today = date.today()
    result = []
    for g in goals:
        g_out = SavingsGoalOut.model_validate(g)
        pct = (g.current_amount / g.target_amount * 100) if g.target_amount > 0 else 0.0
        g_out.percentage = round(min(100.0, pct), 1)

        # Calculate recommended monthly contribution based on remaining months
        remaining_months = max(1, (g.target_date.year - today.year) * 12 + (g.target_date.month - today.month))
        remaining_amount = max(0.0, g.target_amount - g.current_amount)
        g_out.recommended_monthly_contribution = round(remaining_amount / remaining_months, 2)
        result.append(g_out)

    return result


@router.post("", response_model=SavingsGoalOut)
def create_savings_goal(
    goal_in: SavingsGoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = SavingsGoal(
        user_id=current_user.id,
        title=goal_in.title,
        target_amount=goal_in.target_amount,
        current_amount=goal_in.current_amount or 0.0,
        target_date=goal_in.target_date
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)

    g_out = SavingsGoalOut.model_validate(goal)
    g_out.percentage = round(min(100.0, (goal.current_amount / goal.target_amount * 100)), 1)
    g_out.recommended_monthly_contribution = round(max(0.0, goal.target_amount - goal.current_amount), 2)
    return g_out


@router.post("/{goal_id}/contribute", response_model=GoalContributionOut)
def add_goal_contribution(
    goal_id: int,
    contrib_in: GoalContributionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(SavingsGoal).filter(
        SavingsGoal.id == goal_id,
        SavingsGoal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(status_code=404, detail="Savings goal not found")

    contrib = GoalContribution(
        goal_id=goal.id,
        user_id=current_user.id,
        amount=contrib_in.amount,
        date=contrib_in.date or date.today(),
        note=contrib_in.note
    )
    db.add(contrib)

    # Update goal current amount
    goal.current_amount += contrib_in.amount
    db.commit()
    db.refresh(contrib)
    return contrib


@router.delete("/{goal_id}")
def delete_savings_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(SavingsGoal).filter(
        SavingsGoal.id == goal_id,
        SavingsGoal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(status_code=404, detail="Savings goal not found")

    db.delete(goal)
    db.commit()
    return {"message": "Goal deleted successfully"}
