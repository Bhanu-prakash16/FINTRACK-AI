import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import sys

# Ensure backend path is in sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app.main import app
from app.core.database import Base, get_db

SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test_fintrack.db"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test_fintrack.db"):
        try:
            os.remove("./test_fintrack.db")
        except PermissionError:
            pass

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_auth_flow():
    # Signup
    signup_res = client.post("/api/auth/signup", json={
        "email": "testuser@fintrack.ai",
        "password": "Password123!",
        "full_name": "Test User",
        "currency": "INR"
    })
    assert signup_res.status_code == 200
    token = signup_res.json()["access_token"]
    assert token is not None

    # Login
    login_res = client.post("/api/auth/login", json={
        "email": "testuser@fintrack.ai",
        "password": "Password123!"
    })
    assert login_res.status_code == 200

    # Get Me
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "testuser@fintrack.ai"

def test_transactions_crud():
    # Signup user
    signup_res = client.post("/api/auth/signup", json={
        "email": "txuser@fintrack.ai",
        "password": "Password123!",
        "full_name": "Tx User"
    })
    token = signup_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Add Expense
    tx_res = client.post("/api/transactions", headers=headers, json={
        "type": "expense",
        "amount": 1500,
        "date": "2026-08-15",
        "payment_method": "UPI",
        "description": "Supermarket Grocery Shopping"
    })
    assert tx_res.status_code == 200
    tx_id = tx_res.json()["id"]

    # List Transactions
    list_res = client.get("/api/transactions", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # Delete Transaction
    del_res = client.delete(f"/api/transactions/{tx_id}", headers=headers)
    assert del_res.status_code == 200
