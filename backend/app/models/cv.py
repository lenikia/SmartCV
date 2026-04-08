from sqlalchemy import Column, Integer, String, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class CVVersion(Base):
    __tablename__ = "cv_versions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    version_name = Column(String)  # e.g., "Machine Learning CV", "Backend CV"
    role_type = Column(String)  # ML, Backend, Data Science
    personal_info = Column(JSON)
    summary = Column(String)
    education = Column(JSON)
    skills = Column(JSON)
    experience = Column(JSON)
    projects = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User", back_populates="cv_versions")