from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse
from app.core.config import settings
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/profile", tags=["Profile"])

@router.get("/", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile"""
    return current_user


@router.put("/", response_model=UserResponse)
def update_profile(
    full_name: str = None, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """Update current user's profile"""
    if full_name:
        current_user.full_name = full_name
    
    db.commit()
    db.refresh(current_user)
    return current_user