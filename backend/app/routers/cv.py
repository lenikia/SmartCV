from fastapi import APIRouter, HTTPException
from app.schemas.cv import CVData, CVResponse
from typing import Optional

router = APIRouter(prefix="/api/cv", tags=["CV"])

# Temporary storage (in memory) - will be replaced by database later
cv_storage = None

@router.post("/", response_model=CVResponse)
async def save_cv(cv_data: CVData):
    global cv_storage
    cv_storage = cv_data
    return CVResponse(
        **cv_data.model_dump(),
        id=1,
        user_id=1
    )

@router.get("/", response_model=CVResponse)
async def get_cv():
    if cv_storage is None:
        raise HTTPException(status_code=404, detail="No CV data found yet")
    return CVResponse(
        **cv_storage.model_dump(),
        id=1,
        user_id=1
    )

@router.get("/health")
async def cv_health():
    return {"status": "CV module is working"}