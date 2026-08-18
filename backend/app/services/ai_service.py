from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from typing import List, Dict, Any
from app.models.models import Transaction, Budget, Category, RecurringPayment, AIInsight, SavingsGoal
from app.schemas.schemas import AIQueryResponse, AIInsightOut

def generate_user_financial_context(db: Session, user_id: int) -> Dict[str, Any]:
    today = date.today()
    start_of_month = date(today.year, today.month, 1)

    # Monthly totals
    total_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.type == "income",
        Transaction.date >= start_of_month
    ).scalar() or 0.0

    total_expense = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.date >= start_of_month
    ).scalar() or 0.0

    net_savings = total_income - total_expense
    savings_rate = (net_savings / total_income * 100) if total_income > 0 else 0.0

    # Expenses by Category
    cat_expenses = db.query(
        Category.name,
        func.sum(Transaction.amount).label("total")
    ).join(Transaction, Transaction.category_id == Category.id).filter(
        Transaction.user_id == user_id,
        Transaction.type == "expense",
        Transaction.date >= start_of_month
    ).group_by(Category.name).order_by(func.sum(Transaction.amount).desc()).all()

    top_categories = [{"category": cat, "amount": float(amt)} for cat, amt in cat_expenses]

    # Budgets
    budgets = db.query(Budget).filter(
        Budget.user_id == user_id,
        Budget.period_month == today.month,
        Budget.period_year == today.year
    ).all()

    budget_status = []
    for b in budgets:
        cat_name = b.category.name if b.category else "Uncategorized"
        spent = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.category_id == b.category_id,
            Transaction.type == "expense",
            Transaction.date >= start_of_month
        ).scalar() or 0.0
        budget_status.append({
            "category": cat_name,
            "budget": b.amount,
            "spent": spent,
            "pct": round((spent / b.amount * 100), 1) if b.amount > 0 else 0.0
        })

    # Recurring Subscriptions
    recurring = db.query(RecurringPayment).filter(
        RecurringPayment.user_id == user_id,
        RecurringPayment.is_active == True
    ).all()

    recurring_total = sum(r.amount if r.frequency == "monthly" else r.amount / 12 for r in recurring)

    return {
        "period": f"{today.strftime('%B %Y')}",
        "total_income": total_income,
        "total_expense": total_expense,
        "net_savings": net_savings,
        "savings_rate_pct": round(savings_rate, 1),
        "top_spending_categories": top_categories,
        "budgets": budget_status,
        "recurring_monthly_total": recurring_total,
        "recurring_count": len(recurring)
    }


def process_ai_query(db: Session, user_id: int, question: str) -> AIQueryResponse:
    ctx = generate_user_financial_context(db, user_id)
    q_lower = question.lower()

    # Rule-based precision grounding
    if "spending the most" in q_lower or "top spending" in q_lower or "where am i spending" in q_lower:
        if ctx["top_spending_categories"]:
            top = ctx["top_spending_categories"][0]
            sec = ctx["top_spending_categories"][1] if len(ctx["top_spending_categories"]) > 1 else None
            answer = f"Your highest expense category this month is **{top['category']}** with a total of **₹{top['amount']:,.0f}**."
            if sec:
                answer += f" Followed by **{sec['category']}** at **₹{sec['amount']:,.0f}**."
            answer += f" Overall, you have spent ₹{ctx['total_expense']:,.0f} across all categories."
        else:
            answer = "You haven't recorded any expenses yet for this month."

    elif "food" in q_lower:
        food_item = next((c for c in ctx["top_spending_categories"] if "food" in c["category"].lower() or "dining" in c["category"].lower() or "restaurant" in c["category"].lower()), None)
        if food_item:
            answer = f"You have spent **₹{food_item['amount']:,.0f}** on **{food_item['category']}** so far this month."
        else:
            answer = "You have ₹0 recorded spending on Food for this month."

    elif "afford" in q_lower or "purchase" in q_lower:
        import re
        amounts = re.findall(r'₹?\s*(\d[\d,.]*)', question)
        target = float(amounts[0].replace(',', '')) if amounts else 10000.0
        
        current_savings = ctx["net_savings"]
        if current_savings >= target:
            answer = f"Yes, based on your current net monthly savings of **₹{current_savings:,.0f}**, you can comfortably afford a **₹{target:,.0f}** purchase while keeping a positive surplus of **₹{current_savings - target:,.0f}**."
        elif current_savings > 0:
            answer = f"A **₹{target:,.0f}** purchase exceeds your current net savings surplus of **₹{current_savings:,.0f}** for this month. Making this purchase now would lower your net savings balance into the negative by **₹{target - current_savings:,.0f}**."
        else:
            answer = f"Your current expenses (₹{ctx['total_expense']:,.0f}) currently equal or exceed your income (₹{ctx['total_income']:,.0f}). It is recommended to postpone a ₹{target:,.0f} purchase until your monthly savings rate recovers."

    elif "higher" in q_lower or "why" in q_lower or "increase" in q_lower:
        if ctx["top_spending_categories"]:
            top = ctx["top_spending_categories"][0]
            answer = f"Your expenses this month total **₹{ctx['total_expense']:,.0f}**. The main driver is **{top['category']}**, which accounts for **₹{top['amount']:,.0f}** (about {round(top['amount']/ctx['total_expense']*100 if ctx['total_expense']>0 else 0)}% of your total spending)."
            if ctx["recurring_monthly_total"] > 0:
                answer += f" Additionally, you have **₹{ctx['recurring_monthly_total']:,.0f}** in recurring subscription payments."
        else:
            answer = "Your expenses are well within normal baseline limits."

    elif "reduce" in q_lower or "cut" in q_lower or "save money" in q_lower:
        over_budgets = [b for b in ctx["budgets"] if b["pct"] > 90]
        if over_budgets:
            cat_list = ", ".join([f"**{b['category']}** ({b['pct']}% of budget)" for b in over_budgets])
            answer = f"To reduce spending, start by targeting your highest/over-budget categories: {cat_list}."
        else:
            answer = f"Your top 2 expenditure areas are {', '.join([c['category'] for c in ctx['top_spending_categories'][:2]])}. Reducing discretionary spending in these categories by 15% would save approximately **₹{sum(c['amount'] for c in ctx['top_spending_categories'][:2])*0.15:,.0f}** monthly."

    else:
        answer = f"Here is your current financial summary for {ctx['period']}: Total Income **₹{ctx['total_income']:,.0f}**, Total Expenses **₹{ctx['total_expense']:,.0f}**, Net Savings **₹{ctx['net_savings']:,.0f}** (Savings Rate: {ctx['savings_rate_pct']}%). Your top spending category is {ctx['top_spending_categories'][0]['category'] if ctx['top_spending_categories'] else 'N/A'}."

    return AIQueryResponse(answer=answer, data_context=ctx)


def generate_auto_insights(db: Session, user_id: int) -> List[AIInsightOut]:
    today = date.today()
    start_of_month = date(today.year, today.month, 1)

    ctx = generate_user_financial_context(db, user_id)
    insights = []

    # 1. Budget Warnings
    over_budgets = [b for b in ctx["budgets"] if b["pct"] > 100]
    near_budgets = [b for b in ctx["budgets"] if 85 <= b["pct"] <= 100]

    for b in over_budgets:
        insights.append(AIInsightOut(
            id=100 + len(insights),
            type="warning",
            title=f"⚠️ {b['category']} Budget Exceeded",
            body=f"Your {b['category']} spending has reached ₹{b['spent']:,.0f} ({b['pct']}% of ₹{b['budget']:,.0f} budget).",
            is_dismissed=False,
            created_at=datetime.utcnow()
        ))

    for b in near_budgets:
        insights.append(AIInsightOut(
            id=200 + len(insights),
            type="recommendation",
            title=f"🔔 {b['category']} Budget Limit Approaching",
            body=f"You've used {b['pct']}% of your ₹{b['budget']:,.0f} budget for {b['category']}.",
            is_dismissed=False,
            created_at=datetime.utcnow()
        ))

    # 2. Positive Savings Rate
    if ctx["savings_rate_pct"] >= 25:
        insights.append(AIInsightOut(
            id=300 + len(insights),
            type="positive",
            title="📈 Strong Savings Rate",
            body=f"Your current savings rate is {ctx['savings_rate_pct']}%, exceeding the recommended 20% healthy threshold!",
            is_dismissed=False,
            created_at=datetime.utcnow()
        ))

    # 3. Recurring Payments Alert
    if ctx["recurring_monthly_total"] > 0:
        insights.append(AIInsightOut(
            id=400 + len(insights),
            type="trend",
            title="🔔 Recurring Payment Burden",
            body=f"You have ₹{ctx['recurring_monthly_total']:,.0f} in active recurring subscriptions this month across {ctx['recurring_count']} service(s).",
            is_dismissed=False,
            created_at=datetime.utcnow()
        ))

    return insights
