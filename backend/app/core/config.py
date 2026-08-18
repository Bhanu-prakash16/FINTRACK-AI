import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "FinTrack AI"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "fintrack_super_secret_jwt_key_2026_change_in_production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./fintrack.db")
    
    # Financial defaults
    DEFAULT_CURRENCY: str = "INR"
    CURRENCY_SYMBOL: str = "₹"
    
    # AI Engine settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    AI_MODEL: str = os.getenv("AI_MODEL", "gpt-4o-mini")

    class Config:
        case_sensitive = True

settings = Settings()
