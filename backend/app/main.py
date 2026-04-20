from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings
from app.routers import auth, cv, profile, upload

# Import routers
from app.routers import auth, cv

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="SmartCV Backend API - Dynamic CV Builder",
    version="1.0.0",
    # This line helps Swagger show the Authorize button
    openapi_tags=[
        {"name": "Authentication", "description": "User authentication endpoints"},
        {"name": "CV", "description": "CV management endpoints"}
    ]
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security scheme (this makes the Authorize button appear)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# Include routers
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