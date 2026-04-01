from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Create FastAPI app
app = FastAPI(
    title="SmartCV Backend",
    description="Backend API for SmartCV - Dynamic CV Builder",
    version="1.0.0"
)

# CORS settings - Allow your React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite default
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "🚀 SmartCV Backend is running!",
        "docs": "/docs",
        "health": "/health"
    }

# Health check
@app.get("/health")
async def health():
    return {"status": "healthy", "service": "SmartCV Backend"}