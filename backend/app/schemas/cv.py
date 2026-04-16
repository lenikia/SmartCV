from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class PersonalInfo(BaseModel):
    fullName: str
    professionalTitle: Optional[str] = None
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

class CVBase(BaseModel):
    title: Optional[str] = "My CV"
    personalInfo: PersonalInfo
    summary: Optional[str] = None
    education: Optional[dict] = None
    skills: List[str] = []
    experience: List[Experience] = []
    projects: List[Project] = []

class CVCreate(CVBase):
    pass

class CVResponse(CVBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True