from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from app.utils.cv_parser import extract_text_from_pdf, extract_text_from_docx
import anthropic
import json
from app.core.config import settings
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.profile import UserProfile
from app.models.user import User
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileResponse
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/profile", tags=["Profile"])

@router.post("/extract-from-cv")
async def extract_profile_from_cv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a CV file and extract structured profile data using AI.
    Returns profile data for user review before saving.
    Does NOT automatically save — user reviews first.
    """
    allowed_types = {
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    }

    print(f"DEBUG: file={file}, filename={file.filename}, content_type={file.content_type}", flush=True)
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and DOCX files are allowed"
        )

    content = await file.read()

    # Extract raw text
    if file.content_type == "application/pdf":
        text = extract_text_from_pdf(content)
    else:
        text = extract_text_from_docx(content)

    if not text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not extract text from the uploaded file"
        )

    # Use Claude to parse the CV into structured profile data
    ai_client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    prompt = f"""You are a CV parser. Extract structured data from this CV text and return it as JSON.

CV TEXT:
{text[:6000]}

Extract and return ONLY this JSON structure with no markdown, no explanation:
{{
  "first_name": "first name only",
  "last_name": "last name only",
  "email": "email address",
  "phone": "phone number",
  "address": "street address if present",
  "country": "country if present",
  "preferred_job_title": "their current/target job title",
  "brief_intro": "one-liner summary if present under name",
  "about_me": "full profile/about me paragraph",
  "skills": {{
    "programming": ["programming languages listed"],
    "tools": ["tools and platforms listed"],
    "other": ["other technical skills"]
  }},
  "experience": [
    {{
      "role": "job title",
      "company": "company name",
      "date": "date range",
      "bullets": ["responsibility or achievement 1", "responsibility 2"]
    }}
  ],
  "university_projects": [
    {{
      "name": "project name",
      "duration": "duration if mentioned",
      "bullets": ["what was built", "technologies used"]
    }}
  ],
  "personal_projects": [
    {{
      "name": "project name",
      "duration": "duration if mentioned",
      "bullets": ["what was built", "technologies used"]
    }}
  ],
  "soft_skills": ["soft skill 1", "soft skill 2"],
  "interests": ["interest 1", "interest 2"],
  "education": [
    {{
      "institution": "university or school name",
      "degree": "degree title",
      "year": "graduation year or current year",
      "field": "field of study"
    }}
  ],
  "languages": ["language and level"]
}}

Rules:
- Extract ONLY what is explicitly in the CV — never invent data
- If a field has no data in the CV, use empty string "" or empty array []
- Split full name into first_name and last_name correctly"""

    message = ai_client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=3000,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = message.content[0].text.strip()

    # Strip markdown fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    try:
        extracted = json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI could not parse the CV structure"
        )

    return extracted

@router.post("/", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
def create_profile(
    profile_data: ProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists. Use PUT to update it."
        )

    profile = UserProfile(
        user_id=current_user.id,
        first_name=profile_data.first_name,
        last_name=profile_data.last_name,
        email=profile_data.email,
        phone=profile_data.phone,
        address=profile_data.address,
        country=profile_data.country,
        preferred_job_title=profile_data.preferred_job_title
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.get("/", response_model=ProfileResponse)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )

    return profile


@router.put("/", response_model=ProfileResponse)
def update_profile(
    profile_data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Use POST to create it first."
        )

    update_data = profile_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile