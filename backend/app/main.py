from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import the CV router
from app.routers.cv import router as cv_router

app = FastAPI(
    title="SmartCV Backend",
    description="Backend API for SmartCV - Dynamic CV Builder",
    version="1.0.0"
)

# CORS - Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the CV router
app.include_router(cv_router)

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "🚀 SmartCV Backend is running!",
        "docs_url": "/docs",
        "cv_endpoints": "/api/cv"
    }

# Health check
@app.get("/health")
async def health():
    return {"status": "healthy", "service": "SmartCV Backend"}