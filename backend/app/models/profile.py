from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    # ── Contact & Identity ─────────────────────────────────
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    country = Column(String, nullable=True)
    preferred_job_title = Column(String, nullable=True)

    # ── Career narrative ───────────────────────────────────
    # One-liner shown directly under the name on the CV
    # e.g. "CS student with interest in human behaviour & building creative projects"
    brief_intro = Column(Text, nullable=True)

    # Full profile paragraph in the user's own words
    # AI will polish this against the job description but never replace it entirely
    about_me = Column(Text, nullable=True)

    # ── Structured career data ─────────────────────────────
    # Each stored as JSON — shape matches the CV section types
    # so they map directly to cv_sections content on generation

    # {"programming": ["Java", "Python"], "tools": ["Docker", "Git"], "other": []}
    skills = Column(JSON, nullable=True)

    # [{"role": "Intern", "company": "X", "date": "2023", "bullets": ["Did A", "Built B"]}]
    experience = Column(JSON, nullable=True)

    # [{"name": "Auction System", "duration": "5 weeks", "bullets": ["Built with React..."]}]
    university_projects = Column(JSON, nullable=True)

    # [{"name": "Morning Messenger", "duration": "5 days", "bullets": ["Telegram bot..."]}]
    personal_projects = Column(JSON, nullable=True)

    # ["Problem solving", "Teamwork", "Time management"]
    soft_skills = Column(JSON, nullable=True)

    # ["Reading", "Basketball", "Gaming"]
    interests = Column(JSON, nullable=True)

    # [{"institution": "University of X", "degree": "BSc CS", "year": "3rd year"}]
    education = Column(JSON, nullable=True)

    # ["English (C2)", "Portuguese (Native)"]
    languages = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="profile")