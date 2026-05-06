from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartCV"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DATABASE_URL: str
    ANTHROPIC_API_KEY: str
    ADZUNA_APP_ID: Optional[str] = ""
    ADZUNA_APP_KEY: Optional[str] = ""

    class Config:
        env_file = ".env"

settings = Settings()