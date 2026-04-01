from pydantic import BaseModel
from typing import List, Optional

# Personal Information Schema
class PersonalInfo(BaseModel):
    fullName: str
    professionalTitle: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None

# Experience Schema
class Experience(BaseModel):
    id: Optional[int] = None
    role: str
    company: Optional[str] = None
    period: Optional[str] = None
    description: Optional[str] = None

# Project Schema
class Project(BaseModel):
    id: Optional[int] = None
    name: str
    technologies: Optional[str] = None
    description: Optional[str] = None

# Main CV Schema - This matches your frontend
class CVData(BaseModel):
    personalInfo: PersonalInfo
    summary: Optional[str] = None
    education: Optional[dict] = None
    skills: List[str] = []
    experience: List[Experience] = []
    projects: List[Project] = []

# Response schema (when we return data)
class CVResponse(CVData):
    id: Optional[int] = None
    user_id: Optional[int] = None