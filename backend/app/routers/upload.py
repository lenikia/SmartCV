from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session
import os
from datetime import datetime
from app.database import get_db
from app.models.user import User
from app.utils.dependencies import get_current_user
from app.utils.cv_parser import (
    extract_text_from_pdf,
    extract_text_from_docx,
    parse_cv_text,
    calculate_ats_score
)

router = APIRouter(prefix="/upload", tags=["Upload"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain"
}

@router.post("/resume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Upload a resume file (PDF, DOCX, TXT).
    Saves the file to disk and returns parsed CV data + ATS score.
    """
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, and TXT files are allowed")

    content = await file.read()

    # Save file to disk
    user_dir = os.path.join(UPLOAD_DIR, str(current_user.id))
    os.makedirs(user_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    ext = os.path.splitext(file.filename)[1]
    saved_filename = f"resume_{timestamp}{ext}"
    file_path = os.path.join(user_dir, saved_filename)

    with open(file_path, "wb") as f:
        f.write(content)

    # Extract text based on file type
    if file.content_type == "application/pdf":
        text = extract_text_from_pdf(content)
    elif file.content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        text = extract_text_from_docx(content)
    else:
        text = content.decode("utf-8", errors="ignore")

    if not text.strip():
        raise HTTPException(status_code=422, detail="Could not extract text from the uploaded file")

    # Parse extracted text into structured CV data
    parsed_cv = parse_cv_text(text)
    ats_result = calculate_ats_score(parsed_cv)

    return {
        "message": "Resume uploaded and parsed successfully",
        "filename": saved_filename,
        "parsed_cv": parsed_cv,
        "ats_score": ats_result,
    }