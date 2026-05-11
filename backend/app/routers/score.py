from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import anthropic
import json
from app.database import get_db
from app.models.cv import CV
from app.models.user import User
from app.utils.dependencies import get_current_user
from app.core.config import settings

router = APIRouter(prefix="/score", tags=["Score"])

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

class ScoreRequest(BaseModel):
    job_description: str
    job_title: Optional[str] = None

class ScoreResponse(BaseModel):
    score: int
    grade: str
    matched_keywords: list[str]
    missing_keywords: list[str]
    suggestions: list[str]
    summary: str

def get_grade(score: int) -> str:
    if score >= 90: return "A+"
    if score >= 85: return "A"
    if score >= 80: return "A-"
    if score >= 75: return "B+"
    if score >= 70: return "B"
    if score >= 65: return "B-"
    if score >= 60: return "C+"
    if score >= 55: return "C"
    if score >= 50: return "C-"
    if score >= 40: return "D"
    return "F"

@router.post("/{cv_id}", response_model=ScoreResponse)
def score_cv(
    cv_id: int,
    request: ScoreRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Score a CV against a job description using Claude AI.
    Returns a 0-100 score, matched/missing keywords, and improvement suggestions.
    """
    cv = db.query(CV).filter(CV.id == cv_id, CV.user_id == current_user.id).first()
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")

    cv_text = f"""
Name: {cv.personal_info.get('fullName', '')}
Title: {cv.personal_info.get('professionalTitle', '')}
Summary: {cv.summary or ''}
Skills: {', '.join(cv.skills or [])}
Experience: {json.dumps(cv.experience or [], indent=2)}
Projects: {json.dumps(cv.projects or [], indent=2)}
Education: {json.dumps(cv.education or {}, indent=2)}
""".strip()

    prompt = f"""You are an expert ATS (Applicant Tracking System) and CV analyser.

Analyse the following CV against the job description and return a JSON object with exactly these fields:
- score: integer 0-100
- matched_keywords: list of up to 10 keyword strings found in both CV and JD
- missing_keywords: list of up to 10 important keywords from the JD missing from the CV
- suggestions: list of 3-5 specific, actionable improvement tips as strings
- summary: one sentence describing the overall fit

Return ONLY valid JSON, no markdown, no explanation.

JOB DESCRIPTION:
{request.job_description}

CV:
{cv_text}
"""

    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}]
        )
        result = json.loads(message.content[0].text)
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="AI returned an unexpected response format")
    except anthropic.APIError as e:
        raise HTTPException(status_code=502, detail=f"AI service error: {str(e)}")

    score = max(0, min(100, int(result.get("score", 0))))

    return ScoreResponse(
        score=score,
        grade=get_grade(score),
        matched_keywords=result.get("matched_keywords", []),
        missing_keywords=result.get("missing_keywords", []),
        suggestions=result.get("suggestions", []),
        summary=result.get("summary", ""),
    )