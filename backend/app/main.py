from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from fastapi.routing import APIRouter
from app.core.config import settings
from app.database import engine, Base

# Router imports
from app.routers import auth, cv, profile, upload, ai, cv_sections, application, jobs

# Model imports — required for create_all to know about all tables
from app.models import user, cv as cv_model, profile as profile_model, cv_section as cv_section_model

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="SmartCV Backend API - Dynamic CV Builder",
    version="1.0.0",
    openapi_tags=[
        {"name": "Authentication", "description": "User authentication endpoints"},
        {"name": "CV", "description": "CV management endpoints"},
        {"name": "Profile", "description": "User profile endpoints"},
        {"name": "Applications", "description": "Job application tracker endpoints"},
        {"name": "Jobs", "description": "Live job listings endpoints"},
    ]
)

Base.metadata.create_all(bind=engine, checkfirst=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(cv.router, prefix=settings.API_V1_STR)
app.include_router(profile.router, prefix=settings.API_V1_STR)
app.include_router(upload.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(cv_sections.router, prefix=settings.API_V1_STR)
app.include_router(application.router, prefix=settings.API_V1_STR)  # was never registered
app.include_router(jobs.router, prefix=settings.API_V1_STR)          # new jobs dashboard


@app.get("/")
async def root():
    return {"message": "🚀 SmartCV Backend is running successfully!", "docs": "/docs"}

@app.get("/health")
async def health():
    return {"status": "healthy"}