from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class ProfileCreate(BaseModel):
    # Contact & Identity
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    country: Optional[str] = None
    preferred_job_title: Optional[str] = None

    # Career narrative
    brief_intro: Optional[str] = None
    about_me: Optional[str] = None

    # Structured career data
    skills: Optional[dict] = None
    experience: Optional[List[dict]] = None
    university_projects: Optional[List[dict]] = None
    personal_projects: Optional[List[dict]] = None
    soft_skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    education: Optional[List[dict]] = None
    languages: Optional[List[str]] = None


class ProfileUpdate(BaseModel):
    # Every field optional on update
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    country: Optional[str] = None
    preferred_job_title: Optional[str] = None

    brief_intro: Optional[str] = None
    about_me: Optional[str] = None

    skills: Optional[dict] = None
    experience: Optional[List[dict]] = None
    university_projects: Optional[List[dict]] = None
    personal_projects: Optional[List[dict]] = None
    soft_skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    education: Optional[List[dict]] = None
    languages: Optional[List[str]] = None


class ProfileResponse(BaseModel):
    id: int
    user_id: int
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    country: Optional[str] = None
    preferred_job_title: Optional[str] = None

    brief_intro: Optional[str] = None
    about_me: Optional[str] = None

    skills: Optional[dict] = None
    experience: Optional[List[dict]] = None
    university_projects: Optional[List[dict]] = None
    personal_projects: Optional[List[dict]] = None
    soft_skills: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    education: Optional[List[dict]] = None
    languages: Optional[List[str]] = None

    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}