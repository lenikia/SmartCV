from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models.cv import CV
from app.models.user import User
from app.schemas.cv import CVCreate, CVResponse
from app.core.config import settings
from jose import jwt, JWTError

router = APIRouter(prefix="/cv", tags=["CV"])

def get_current_user(authorization: str = None, db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization[7:]
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/", response_model=CVResponse)
def create_cv(cv_data: CVCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_cv = CV(
        user_id=current_user.id,
        title=cv_data.title or f"My CV - {datetime.now().strftime('%Y-%m-%d')}",
        personal_info=cv_data.personalInfo.dict(),
        summary=cv_data.summary,
        education=cv_data.education,
        skills=cv_data.skills,
        experience=[exp.dict() for exp in cv_data.experience],
        projects=[proj.dict() for proj in cv_data.projects],
    )
    
    db.add(new_cv)
    db.commit()
    db.refresh(new_cv)
    
    return CVResponse(
        id=new_cv.id,
        user_id=new_cv.user_id,
        title=new_cv.title,
        personalInfo=new_cv.personal_info,
        summary=new_cv.summary,
        education=new_cv.education,
        skills=new_cv.skills,
        experience=new_cv.experience,
        projects=new_cv.projects,
        created_at=new_cv.created_at,
        updated_at=new_cv.updated_at,
    )


@router.get("/", response_model=List[CVResponse])
def get_my_cvs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cvs = db.query(CV).filter(CV.user_id == current_user.id).all()
    return [
        CVResponse(
            id=cv.id,
            user_id=cv.user_id,
            title=cv.title,
            personalInfo=cv.personal_info,
            summary=cv.summary,
            education=cv.education,
            skills=cv.skills,
            experience=cv.experience,
            projects=cv.projects,
            created_at=cv.created_at,
            updated_at=cv.updated_at,
        ) for cv in cvs
    ]


@router.get("/{cv_id}", response_model=CVResponse)
def get_cv(cv_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cv = db.query(CV).filter(CV.id == cv_id, CV.user_id == current_user.id).first()
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    return CVResponse(
        id=cv.id,
        user_id=cv.user_id,
        title=cv.title,
        personalInfo=cv.personal_info,
        summary=cv.summary,
        education=cv.education,
        skills=cv.skills,
        experience=cv.experience,
        projects=cv.projects,
        created_at=cv.created_at,
        updated_at=cv.updated_at,
    )


@router.put("/{cv_id}", response_model=CVResponse)
def update_cv(cv_id: int, cv_data: CVCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cv = db.query(CV).filter(CV.id == cv_id, CV.user_id == current_user.id).first()
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")

    cv.title = cv_data.title or cv.title
    cv.personal_info = cv_data.personalInfo.dict()
    cv.summary = cv_data.summary
    cv.education = cv_data.education
    cv.skills = cv_data.skills
    cv.experience = [exp.dict() for exp in cv_data.experience]
    cv.projects = [proj.dict() for proj in cv_data.projects]
    cv.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(cv)
    return CVResponse.from_orm(cv)   # or manually map like above


@router.delete("/{cv_id}")
def delete_cv(cv_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cv = db.query(CV).filter(CV.id == cv_id, CV.user_id == current_user.id).first()
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")

    db.delete(cv)
    db.commit()
    return {"message": "CV deleted successfully"}