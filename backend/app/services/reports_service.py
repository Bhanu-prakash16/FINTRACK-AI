import io
import csv
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import Transaction, Budget, Category, RecurringPayment, User

def generate_csv_report(db: Session, user_id: int) -> str:
    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow(["Date", "Type", "Category", "Description", "Amount (INR)", "Payment Method", "Notes"])

    transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id
    ).order_by(Transaction.date.desc()).all()

    for t in transactions:
        cat_name = t.category.name if t.category else "Uncategorized"
        writer.writerow([
            t.date.strftime("%Y-%m-%d"),
            t.type.capitalize(),
            cat_name,
            t.description,
            f"{t.amount:.2f}",
            t.payment_method or "UPI",
            t.notes or ""
        ])

    return output.getvalue()


def generate_pdf_report(db: Session, user_id: int) -> bytes:
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.lib import colors
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        elements = []
        styles = getSampleStyleSheet()

        user = db.query(User).filter(User.id == user_id).first()
        user_name = user.full_name if user else "Valued User"
        today_str = date.today().strftime("%B %d, %Y")

        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#059669'),
            spaceAfter=6
        )

        subtitle_style = ParagraphStyle(
            'SubTitleStyle',
            parent=styles['Normal'],
            fontSize=11,
            textColor=colors.HexColor('#4b5563'),
            spaceAfter=15
        )

        elements.append(Paragraph("FinTrack AI — Personal Financial Summary Report", title_style))
        elements.append(Paragraph(f"Prepared for: <b>{user_name}</b> | Date: <b>{today_str}</b>", subtitle_style))
        elements.append(Spacer(1, 10))

        # Financial Summary Table
        start_of_month = date(date.today().year, date.today().month, 1)
        income = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.type == "income",
            Transaction.date >= start_of_month
        ).scalar() or 0.0

        expense = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
            Transaction.date >= start_of_month
        ).scalar() or 0.0

        savings = income - expense
        savings_rate = (savings / income * 100) if income > 0 else 0.0

        data_summary = [
            ["Metric", "Amount (INR)"],
            ["Total Monthly Income", f"₹{income:,.2f}"],
            ["Total Monthly Expenses", f"₹{expense:,.2f}"],
            ["Net Monthly Savings", f"₹{savings:,.2f}"],
            ["Savings Rate", f"{savings_rate:.1f}%"]
        ]

        t_summary = Table(data_summary, colWidths=[250, 250])
        t_summary.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#059669')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,0), 8),
            ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#f9fafb')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e5e7eb')),
        ]))
        elements.append(t_summary)
        elements.append(Spacer(1, 20))

        # Recent Transactions
        elements.append(Paragraph("<b>Recent Transactions</b>", styles['Heading2']))
        elements.append(Spacer(1, 8))

        recent_txs = db.query(Transaction).filter(
            Transaction.user_id == user_id
        ).order_by(Transaction.date.desc()).limit(15).all()

        tx_data = [["Date", "Type", "Category", "Description", "Amount"]]
        for t in recent_txs:
            cat = t.category.name if t.category else "Other"
            tx_data.append([
                t.date.strftime("%Y-%m-%d"),
                t.type.capitalize(),
                cat,
                t.description[:25],
                f"₹{t.amount:,.2f}"
            ])

        t_tx = Table(tx_data, colWidths=[75, 65, 100, 160, 100])
        t_tx.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1f2937')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e5e7eb')),
            ('FONTSIZE', (0,0), (-1,-1), 9),
        ]))
        elements.append(t_tx)

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()

    except Exception:
        # Fallback text buffer if ReportLab has any font rendering issue
        fallback_text = f"FINTRACK AI REPORT\nGenerated for User #{user_id}\nDate: {date.today()}\n"
        return fallback_text.encode('utf-8')
