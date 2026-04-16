from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartCV"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"  # Change this later!
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database (we'll use SQLite for now, later PostgreSQL)
    DATABASE_URL: str = "sqlite:///./smartcv.db"

    class Config:
        env_file = ".env"

settings = Settings()