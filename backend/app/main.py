from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings
from app.routers import auth, cv, profile, upload

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="SmartCV Backend API - Dynamic CV Builder",
    version="1.0.0",
    openapi_tags=[
        {"name": "Authentication", "description": "User authentication endpoints"},
        {"name": "CV", "description": "CV management endpoints"}
    ]
)

app.add_middleware(
    CORSMiddleware,
    # In development, allow both 5173 and 5174 since Vite bumps the port
    # when one is already taken. In production this becomes your real domain.
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,  # required for Authorization headers to pass through
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(cv.router, prefix=settings.API_V1_STR)
app.include_router(profile.router, prefix=settings.API_V1_STR)
app.include_router(upload.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "message": "🚀 SmartCV Backend is running successfully!",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}