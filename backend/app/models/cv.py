from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class CV(Base):
    __tablename__ = "cvs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    title = Column(String, default="My CV")
    
    # Store the entire CV data as JSON for flexibility
    personal_info = Column(JSON, nullable=False)
    summary = Column(Text, nullable=True)
    education = Column(JSON, nullable=True)
    skills = Column(JSON, nullable=True)           # list of strings
    experience = Column(JSON, nullable=True)       # list of dicts
    projects = Column(JSON, nullable=True)         # list of dicts

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship with User
    user = relationship("User", back_populates="cvs")

