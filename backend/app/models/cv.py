from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class CV(Base):
    __tablename__ = "cvs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    title = Column(String, default="My CV")
    template = Column(String, default="minimal")
    slug = Column(String, unique=True, index=True, nullable=True)

    personal_info = Column(JSON, nullable=True)
    summary = Column(Text, nullable=True)
    education = Column(JSON, nullable=True)
    skills = Column(JSON, nullable=True)
    experience = Column(JSON, nullable=True)
    projects = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="cvs")

    # One CV has many sections — delete sections when CV is deleted
    sections = relationship(
        "CVSection",
        back_populates="cv",
        cascade="all, delete-orphan",
        order_by="CVSection.order_index"
    )