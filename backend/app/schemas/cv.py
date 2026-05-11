from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class PersonalInfo(BaseModel):
    full_name: str
    professional_title: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None


class Experience(BaseModel):
    id: Optional[int] = None
    role: str
    company: Optional[str] = None
    period: Optional[str] = None
    description: Optional[str] = None


class Project(BaseModel):
    id: Optional[int] = None
    name: str
    technologies: Optional[str] = None
    description: Optional[str] = None


class CVCreate(BaseModel):
    title: Optional[str] = "My CV"
    template: Optional[str] = "minimal"
    personal_info: Optional[dict] = None
    summary: Optional[str] = None
    education: Optional[dict] = None
    skills: List[str] = []
    experience: List[dict] = []
    projects: List[dict] = []


class CVResponse(BaseModel):
    id: int
    user_id: int
    title: Optional[str] = "My CV"
    template: Optional[str] = "minimal"
    slug: Optional[str] = None
    personal_info: Optional[dict] = None
    summary: Optional[str] = None
    education: Optional[dict] = None
    skills: Optional[List[str]] = []
    experience: Optional[List[dict]] = []
    projects: Optional[List[dict]] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}