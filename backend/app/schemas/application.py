from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ApplicationCreate(BaseModel):
    company: str
    job_title: str
    location: Optional[str] = None
    salary: Optional[str] = None
    job_url: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = "Applied"

class ApplicationUpdate(BaseModel):
    company: Optional[str] = None
    job_title: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    job_url: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None

class ApplicationResponse(ApplicationCreate):
    id: int
    user_id: int
    applied_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}