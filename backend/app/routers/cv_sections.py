from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.cv import CV
from app.models.cv_section import CVSection
from app.models.user import User
from app.schemas.cv_section import CVSectionCreate, CVSectionUpdate, CVSectionResponse
from app.utils.dependencies import get_current_user

router = APIRouter(tags=["CV Sections"])


@router.get("/cv/{cv_id}/sections", response_model=List[CVSectionResponse])
def get_sections(
    cv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify CV belongs to current user before returning sections
    # Never return another user's CV sections
    cv = db.query(CV).filter(
        CV.id == cv_id,
        CV.user_id == current_user.id
    ).first()

    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found"
        )

    return db.query(CVSection).filter(
        CVSection.cv_id == cv_id
    ).order_by(CVSection.order_index).all()


@router.post("/cv/{cv_id}/sections",
             response_model=CVSectionResponse,
             status_code=status.HTTP_201_CREATED)
def create_section(
    cv_id: int,
    section_data: CVSectionCreate,
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

    section = CVSection(
        cv_id=cv_id,
        name=section_data.name,
        type=section_data.type,
        content=section_data.content,
        order_index=section_data.order_index,
        ai_enhanced=False
    )

    db.add(section)
    db.commit()
    db.refresh(section)
    return section


@router.put("/cv/{cv_id}/sections/{section_id}",
            response_model=CVSectionResponse)
def update_section(
    cv_id: int,
    section_id: int,
    section_data: CVSectionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify CV ownership first
    cv = db.query(CV).filter(
        CV.id == cv_id,
        CV.user_id == current_user.id
    ).first()

    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found"
        )

    section = db.query(CVSection).filter(
        CVSection.id == section_id,
        CVSection.cv_id == cv_id
    ).first()

    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )

    # Only update fields that were sent — preserve everything else
    update_data = section_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(section, field, value)

    db.commit()
    db.refresh(section)
    return section


@router.delete("/cv/{cv_id}/sections/{section_id}",
               status_code=status.HTTP_204_NO_CONTENT)
def delete_section(
    cv_id: int,
    section_id: int,
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

    section = db.query(CVSection).filter(
        CVSection.id == section_id,
        CVSection.cv_id == cv_id
    ).first()

    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Section not found"
        )

    db.delete(section)
    db.commit()


@router.post("/cv/{cv_id}/sections/reorder")
def reorder_sections(
    cv_id: int,
    order: List[int],  # list of section IDs in new order
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Accepts a list of section IDs in the desired order.
    Updates order_index for each section accordingly.
    Example: [3, 1, 2] means section 3 first, then 1, then 2.
    """
    cv = db.query(CV).filter(
        CV.id == cv_id,
        CV.user_id == current_user.id
    ).first()

    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found"
        )

    for index, section_id in enumerate(order):
        section = db.query(CVSection).filter(
            CVSection.id == section_id,
            CVSection.cv_id == cv_id
        ).first()
        if section:
            section.order_index = index

    db.commit()
    return {"message": "Sections reordered successfully"}