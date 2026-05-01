from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.models.profile import UserProfile
from app.utils.dependencies import get_current_user
from app.services.ai_service import generate_section, generate_from_url

router = APIRouter(prefix="/ai", tags=["AI"])


# ── Request / Response schemas ───────────────────────────────
# Defined here rather than in schemas/ because they're
# tightly coupled to this router and not reused elsewhere

class GenerateSectionRequest(BaseModel):
    section_name: str
    content: str
    job_title: Optional[str] = None
    job_description: Optional[str] = None


class GenerateSectionResponse(BaseModel):
    section_name: str
    original_content: str
    enhanced_content: str


class GenerateFromUrlRequest(BaseModel):
    job_url: str
    # sections is a dict of section_name -> current content
    # e.g. {"skills": "Python, JS", "experience": "..."}
    sections: dict


class GenerateFromUrlResponse(BaseModel):
    enhanced_sections: dict


# ── Endpoints ────────────────────────────────────────────────

@router.post("/generate", response_model=GenerateSectionResponse)
def generate_cv_section(
    request: GenerateSectionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate AI-enhanced content for a single CV section.

    The frontend calls this once per section the user wants
    to enhance. Each call is independent — enhancing "skills"
    does not affect "experience" and vice versa.

    This is a synchronous endpoint because the Anthropic SDK's
    default client is synchronous. The request takes 2-5 seconds
    — acceptable for a single section enhancement.
    """

    # Validate section name is not empty
    if not request.section_name.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="section_name cannot be empty"
        )

    # Validate content is not empty — nothing to enhance
    if not request.content.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="content cannot be empty — provide the section text to enhance"
        )

    try:
        enhanced = generate_section(
            section_name=request.section_name,
            content=request.content,
            job_title=request.job_title,
            job_description=request.job_description
        )

        return GenerateSectionResponse(
            section_name=request.section_name,
            original_content=request.content,
            enhanced_content=enhanced
        )

    except Exception as e:
        # Catch any Anthropic API errors — rate limits, invalid key,
        # network issues — and return a clean 503 instead of a 500
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI service error: {str(e)}"
        )


@router.post("/generate-from-url", response_model=GenerateFromUrlResponse)
async def generate_from_job_url(
    request: GenerateFromUrlRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetch a job posting URL and generate a complete tailored CV.

    This endpoint is async because fetching the URL uses httpx
    async client — we don't want to block the server while
    waiting for the external HTTP request to complete.

    The user's profile is pulled from the DB here so the AI
    has full context about the candidate without the frontend
    needing to send it all manually.
    """

    # Validate URL format minimally
    if not request.job_url.startswith("http"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="job_url must be a valid URL starting with http or https"
        )

    # Pull the user's profile from DB
    # The AI needs this to generate personalised content
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Complete your profile before generating from a job URL"
        )

    # Convert profile ORM object to dict for the service layer
    profile_dict = {
        "first_name": profile.first_name,
        "last_name": profile.last_name,
        "email": profile.email,
        "phone": profile.phone,
        "country": profile.country,
        "preferred_job_title": profile.preferred_job_title
    }

    try:
        enhanced_sections = await generate_from_url(
            job_url=request.job_url,
            profile=profile_dict,
            sections=request.sections
        )

        return GenerateFromUrlResponse(enhanced_sections=enhanced_sections)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"AI service error: {str(e)}"
        )