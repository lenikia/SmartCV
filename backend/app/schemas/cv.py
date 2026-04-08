from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime
from enum import Enum

class RoleType(str, Enum):
    FRONTEND = "Frontend Developer"
    BACKEND = "Backend Developer"
    FULLSTACK = "Fullstack Developer"
    DATA_SCIENCE = "Data Scientist"
    ML_ENGINEER = "Machine Learning Engineer"
    DEVOPS = "DevOps Engineer"
    PRODUCT_MANAGER = "Product Manager"
    GENERAL = "General"

class ATSStatus(str, Enum):
    PENDING = "pending"
    ANALYZING = "analyzing"
    PASSED = "passed"
    FAILED = "failed"
    OPTIMIZED = "optimized"

class PersonalInfo(BaseModel):
    fullName: str
    professionalTitle: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None

class Experience(BaseModel):
    id: Optional[int] = None
    role: str
    company: str
    period: str
    description: str
    achievements: Optional[List[str]] = []
    technologies: Optional[List[str]] = []

class Education(BaseModel):
    id: Optional[int] = None
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    period: str
    gpa: Optional[float] = None

class Project(BaseModel):
    id: Optional[int] = None
    name: str
    technologies: List[str] = []
    description: str
    link: Optional[str] = None
    github_link: Optional[str] = None

class ATSAnalysis(BaseModel):
    status: ATSStatus
    score: Optional[int] = None
    keywords_matched: List[str] = []
    keywords_missing: List[str] = []
    suggestions: List[str] = []
    analyzed_at: Optional[datetime] = None

class CVData(BaseModel):
    id: Optional[int] = None
    version_name: str = "Main CV"
    role_type: RoleType = RoleType.GENERAL
    is_active: bool = True
    personalInfo: PersonalInfo
    summary: str
    education: List[Education] = []
    skills: List[str] = []
    experience: List[Experience] = []
    projects: List[Project] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    ats_analysis: Optional[ATSAnalysis] = None
    view_count: int = 0