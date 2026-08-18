# FinTrack AI — Smart Expense & Personal Finance Tracker

**FinTrack AI** is a production-quality, real-world personal finance management web application designed to help users track income and expenses, manage category budgets, monitor recurring subscription payments, calculate a 0–100 Financial Health Score, and receive AI-powered financial insights grounded strictly in actual transaction data.

---

## 🚀 Key Features

1. **SaaS Landing Page**: Premium hero section ("Know Where Your Money Goes"), dashboard preview, feature cards, security details, FAQ, and call-to-action.
2. **Secure JWT Authentication**: Sign up, Login, Logout, Forgot Password UI, protected routes, bcrypt password hashing, and user-level data isolation.
3. **Main Dashboard**: High-level KPI summaries (Total Balance ₹82,450, Income ₹45,000, Expenses ₹27,350, Savings ₹17,650), weekly cashflow trend chart, category allocation donut pie, budget progress bars, Financial Health Score gauge (82/100), AI Insights widget, and date range filters (This week, This month, Last 3 months, This year).
4. **Expense & Income Management**: Full CRUD operations for transactions with categories (Food, Shopping, Transport, Entertainment, Bills, Education, Health, Travel, Subscriptions, Investments), payment methods (UPI, Credit Card, Debit Card, Net Banking, Cash), notes, tags, search, and custom category builder.
5. **Smart Anomaly Detection**: Automatically flags unusual transaction spikes (>2.2x historical category average) with in-app notification alerts.
6. **Category Budget Management**: Monthly category target limits, real-time percentage progress bars, overspending indicators (⚠️), and automated limit warning notifications (at 85% and 100%).
7. **Spending Analytics**: Interactive Recharts graphs showing monthly income vs expense bar charts, category donut allocations, top spending categories ranking, and percentage change comparisons (+18%, -12%).
8. **Recurring Payments & Subscriptions**: Subscription tracker for Netflix, JioFiber, Rent, and Spotify with due-day countdowns, monthly/yearly total calculations, and upcoming bill notifications.
9. **AI Financial Assistant**: Interactive conversational assistant called **FinTrack AI** that answers queries ("Where am I spending the most?", "Can I afford a ₹10,000 purchase?") grounded directly in live SQL database records without hallucinations.
10. **Financial Health Score (0-100)**: Calculated score based on 5 weighted metrics: Savings Rate (30%), Budget Adherence (25%), Expense Control (15%), Fixed Subscription Burden (15%), and Spending Stability (15%).
11. **Savings Goals Tracker**: Goal cards with progress bars, contribution logging, and calculated recommended monthly contribution targets.
12. **Downloadable Reports**: Export complete raw transaction ledgers in **CSV** format and executive financial summaries in **PDF** format.

---

## 🛠️ Tech Stack & Architecture

```text
fintrack-ai/
├── frontend/                 # React 18 + TypeScript + Vite + Tailwind CSS + Lucide Icons + Recharts
│   ├── src/
│   │   ├── app/              # Navigation & Main App Layout
│   │   ├── components/       # Dashboard, Transactions, Budgets, Analytics, Subscriptions, Goals, AI, Reports
│   │   ├── lib/              # API Client & Auth Context
│   │   └── types/            # TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # FastAPI + Python 3.12 + SQLAlchemy ORM + Pydantic v2
│   ├── app/
│   │   ├── api/              # REST API Routers (/auth, /transactions, /budgets, /analytics, /ai, /reports)
│   │   ├── core/             # Database session, Config, Security (JWT, bcrypt)
│   │   ├── models/           # SQLAlchemy ORM Models
│   │   ├── schemas/          # Pydantic validation schemas
│   │   └── services/         # Health Score, Anomaly Detection, AI Engine, Report Generator
│   ├── seed.py               # Multi-month INR demo database seeder
│   └── requirements.txt
├── database/                 # Database migrations & schemas
├── docs/                     # Architecture documentation
└── tests/                    # Pytest test suite
```

---

## 💻 Setup & Installation Instructions

### Prerequisites
- Node.js v18+ and npm
- Python 3.10+ (or `uv` package manager)

### 1. Backend Setup

```bash
# Navigate to project root
cd "FINTRACK AI"

# Create Python virtual environment
uv venv backend/venv --python 3.12

# Install dependencies
uv pip install -r backend/requirements.txt --python backend/venv

# Run database seeder script to populate demo financial data
backend/venv/Scripts/python backend/seed.py

# Start FastAPI Backend Server
backend/venv/Scripts/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend API documentation will be available at [http://127.0.0.1:8000/api/docs](http://127.0.0.1:8000/api/docs).

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev
```

Frontend application will open at [http://localhost:3000](http://localhost:3000).

---

## 🔑 Demo Account Credentials

Click **"Try Live Demo"** or login with:
- **Email**: `demo@fintrack.ai`
- **Password**: `Demo@123456`

---

## 🧪 Running Automated Tests

```bash
# Run pytest backend test suite
backend/venv/Scripts/pytest tests/test_backend.py
```

---

## 🛡️ Safety Disclaimer
*FinTrack AI is built for tracking, organizational budgeting, and educational insights. It does not provide certified professional financial advice.*
