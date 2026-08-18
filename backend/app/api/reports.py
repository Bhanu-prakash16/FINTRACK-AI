from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import User
from app.api.deps import get_current_user
from app.services.reports_service import generate_csv_report, generate_pdf_report

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/csv")
def download_csv_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    csv_content = generate_csv_report(db, current_user.id)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=fintrack_report_{current_user.id}.csv"
        }
    )


@router.get("/pdf")
def download_pdf_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    pdf_bytes = generate_pdf_report(db, current_user.id)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=fintrack_summary_{current_user.id}.pdf"
        }
    )
