from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models.cv import CV
from app.models.user import User
from app.schemas.cv import CVCreate, CVResponse
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/cv", tags=["CV"])


@router.post("/", response_model=CVResponse)
def create_cv(
    cv_data: CVCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_cv = CV(
    user_id=current_user.id,
    title=cv_data.title or f"My CV - {datetime.now().strftime('%Y-%m-%d %H:%M')}",
    personal_info=cv_data.personal_info,
    summary=cv_data.summary,
    education=cv_data.education,
    skills=cv_data.skills,
    experience=cv_data.experience,
    projects=cv_data.projects,
    template=cv_data.template or "minimal",
)

    db.add(new_cv)
    db.commit()
    db.refresh(new_cv)
    return new_cv


@router.get("/", response_model=List[CVResponse])
def get_my_cvs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(CV).filter(
        CV.user_id == current_user.id
    ).order_by(CV.created_at.desc()).all()


@router.get("/{cv_id}", response_model=CVResponse)
def get_cv(
    cv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cv = db.query(CV).filter(
        CV.id == cv_id,
        CV.user_id == current_user.id
    ).first()

    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found"
        )
    return cv


@router.put("/{cv_id}", response_model=CVResponse)
def update_cv(
    cv_id: int,
    cv_data: CVCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cv = db.query(CV).filter(
        CV.id == cv_id,
        CV.user_id == current_user.id
    ).first()

    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found"
        )

    cv.title = cv_data.title or cv.title
    cv.personal_info = cv_data.personalInfo.dict()
    cv.summary = cv_data.summary
    cv.education = cv_data.education
    cv.skills = cv_data.skills
    cv.experience = [exp.dict() for exp in cv_data.experience]
    cv.projects = [proj.dict() for proj in cv_data.projects]
    cv.template = cv_data.template or cv.template
    cv.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(cv)
    return cv


@router.delete("/{cv_id}")
def delete_cv(
    cv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cv = db.query(CV).filter(
        CV.id == cv_id,
        CV.user_id == current_user.id
    ).first()

    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found"
        )

    db.delete(cv)
    db.commit()
    return {"message": "CV deleted successfully"}


@router.get("/{cv_id}/export", response_model=CVResponse)
def export_cv(
    cv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cv = db.query(CV).filter(
        CV.id == cv_id,
        CV.user_id == current_user.id
    ).first()

    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found"
        )
    return cv