from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import cv

app = FastAPI(
    title="CV Controller App",
    description="AI-powered CV management and optimization platform",
    version="2.0.0"
)

# CORS - Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(cv.router)

@app.get("/")
async def root():
    return {
        "message": "🚀 CV Controller App Backend is running!",
        "version": "2.0.0",
        "features": [
            "CV Upload & Parsing",
            "ATS Compatibility Checking",
            "Multi-CV Management",
            "Bulk Updates Across All CVs",
            "Position Matching",
            "CV Dashboard"
        ],
        "docs_url": "/docs",
        "endpoints": {
            "upload_cv": "POST /api/cv/upload",
            "create_blank": "POST /api/cv/create-blank",
            "view_cv": "GET /api/cv/{id}/view",
            "edit_cv": "GET /api/cv/{id}/edit",
            "update_cv": "PUT /api/cv/{id}",
            "all_cvs": "GET /api/cv/all",
            "quick_start": "GET /api/cv/quick-start/options"
        }
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "CV Controller App"}