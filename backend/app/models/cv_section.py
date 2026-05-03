from sqlalchemy import Column, Integer, String, JSON, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class CVSection(Base):
    __tablename__ = "cv_sections"

    id = Column(Integer, primary_key=True, index=True)

    # Which CV this section belongs to
    cv_id = Column(Integer, ForeignKey("cvs.id", ondelete="CASCADE"), nullable=False)

    # User-defined name — "About Me", "Skills", "My Projects", anything
    name = Column(String, nullable=False)

    # Three types cover all CV section patterns:
    # text       → single paragraph (About Me, Profile summary)
    # bullets    → flat list of items (Soft Skills, Interests)
    # subsections → list of entries each with title, date, bullets
    #               (Experience, Projects, Education)
    type = Column(String, nullable=False, default="text")

    # JSON content — shape varies by type:
    # text:        {"value": "I am a developer..."}
    # bullets:     {"items": ["Python", "React", "SQL"]}
    # subsections: {"entries": [
    #                 {"title": "Role", "subtitle": "Company", "date": "2024",
    #                  "bullets": ["Did X", "Built Y"]}
    #               ]}
    content = Column(JSON, nullable=False, default={})

    # Controls display order — lower number appears first
    # When user reorders, we update these values
    order_index = Column(Integer, default=0)

    # Track whether this section's content was AI-generated
    # Used by the UI to show an "AI enhanced" badge
    ai_enhanced = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship back to CV
    cv = relationship("CV", back_populates="sections")