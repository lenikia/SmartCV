from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models.cv import CV
from app.models.user import User
from app.schemas.cv import CVCreate, CVResponse
from app.utils.dependencies import get_current_user
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib import colors
import io

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


@router.get("/{cv_id}/export")
def export_cv(
    cv_id: int,
    format: str = "pdf",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cv = db.query(CV).filter(CV.id == cv_id, CV.user_id == current_user.id).first()
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")

    if format != "pdf":
        raise HTTPException(status_code=400, detail="Only 'pdf' format is supported currently")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=2*cm, leftMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm
    )

    styles = getSampleStyleSheet()
    name_style = ParagraphStyle("Name", fontSize=20, fontName="Helvetica-Bold", spaceAfter=4)
    title_style = ParagraphStyle("Title", fontSize=12, textColor=colors.HexColor("#555555"), spaceAfter=2)
    section_style = ParagraphStyle("Section", fontSize=12, fontName="Helvetica-Bold", spaceBefore=12, spaceAfter=4, textColor=colors.HexColor("#1a1a2e"))
    body_style = styles["Normal"]

    story = []
    info = cv.personal_info or {}

    # Header
    story.append(Paragraph(info.get("fullName", ""), name_style))
    if info.get("professionalTitle"):
        story.append(Paragraph(info["professionalTitle"], title_style))

    contact_parts = [p for p in [info.get("email"), info.get("phone"), info.get("location")] if p]
    if contact_parts:
        story.append(Paragraph(" · ".join(contact_parts), body_style))

    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#1a1a2e"), spaceAfter=8))

    # Summary
    if cv.summary:
        story.append(Paragraph("PROFILE", section_style))
        story.append(Paragraph(cv.summary, body_style))

    # Experience
    if cv.experience:
        story.append(Paragraph("EXPERIENCE", section_style))
        for exp in cv.experience:
            story.append(Paragraph(f"<b>{exp.get('position', '')}</b> — {exp.get('company', '')}", body_style))
            date_range = f"{exp.get('startDate', '')} – {exp.get('endDate', 'Present')}"
            story.append(Paragraph(date_range, ParagraphStyle("Date", fontSize=9, textColor=colors.grey)))
            if exp.get("description"):
                story.append(Paragraph(exp["description"], body_style))
            story.append(Spacer(1, 6))

    # Education
    if cv.education:
        story.append(Paragraph("EDUCATION", section_style))
        ed = cv.education if isinstance(cv.education, dict) else {}
        line = f"<b>{ed.get('degree', '')}</b> — {ed.get('institution', '')}"
        story.append(Paragraph(line, body_style))
        if ed.get("graduationYear"):
            story.append(Paragraph(str(ed["graduationYear"]), body_style))
        story.append(Spacer(1, 6))

    # Skills
    if cv.skills:
        story.append(Paragraph("SKILLS", section_style))
        story.append(Paragraph(", ".join(cv.skills), body_style))

    doc.build(story)
    buffer.seek(0)

    filename = f"cv_{cv.title.replace(' ', '_') if cv.title else cv_id}.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )