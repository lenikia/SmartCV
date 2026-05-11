from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class CVSectionCreate(BaseModel):
    name: str
    type: str = "text"          # text | bullets | subsections
    content: dict = {}
    order_index: int = 0


class CVSectionUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    content: Optional[dict] = None
    order_index: Optional[int] = None
    ai_enhanced: Optional[bool] = None


class CVSectionResponse(BaseModel):
    id: int
    cv_id: int
    name: str
    type: str
    content: dict
    order_index: int
    ai_enhanced: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}