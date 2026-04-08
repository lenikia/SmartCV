from fastapi import APIRouter, HTTPException, UploadFile, File, Query, Form
from typing import List, Optional
from datetime import datetime
from app.schemas.cv import CVData, PersonalInfo, Experience, Project, Education, ATSAnalysis, ATSStatus, RoleType
from app.utils.cv_parser import (
    extract_text_from_pdf, extract_text_from_docx, parse_cv_text,
    calculate_ats_score, match_positions_to_cv, get_cv_grade
)

router = APIRouter(prefix="/api/cv", tags=["CV Management"])

# In-memory storage (replace with database later)
cv_storage = {}
cv_id_counter = 1
user_cvs = {1: []}  # Default user_id 1

def save_cv_to_storage(cv_data: CVData) -> int:
    global cv_id_counter
    cv_data.id = cv_id_counter
    cv_data.created_at = datetime.now()
    cv_data.updated_at = datetime.now()
    cv_storage[cv_id_counter] = cv_data
    user_cvs[1].append(cv_id_counter)
    cv_id_counter += 1
    return cv_data.id

# 1. Upload CV file
@router.post("/upload")
async def upload_cv(file: UploadFile = File(...)):
    """Upload CV file (PDF, DOCX, or TXT) and analyze it"""
    
    # Validate file type
    allowed_types = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain"
    ]
    
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOCX, or TXT files allowed"
        )
    
    # Read file
    contents = await file.read()
    
    # Extract text based on file type
    text = ""
    if file.content_type == "application/pdf":
        text = extract_text_from_pdf(contents)
    elif file.content_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        text = extract_text_from_docx(contents)
    else:
        text = contents.decode("utf-8")
    
    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from file")
    
    # Parse CV text
    parsed_data = parse_cv_text(text)
    
    # Calculate ATS score
    ats_result = calculate_ats_score(parsed_data)
    
    # Match positions
    matched_positions = match_positions_to_cv(parsed_data, ats_result["score"])
    
    # Create CV object
    cv_data = CVData(
        version_name="Uploaded CV",
        role_type=RoleType.GENERAL,
        personalInfo=PersonalInfo(**parsed_data["personalInfo"]),
        summary=parsed_data["summary"],
        skills=parsed_data["skills"],
        education=[],
        experience=[],
        projects=[],
        ats_analysis=ATSAnalysis(
            status=ATSStatus.PASSED if ats_result["score"] >= 60 else ATSStatus.FAILED,
            score=ats_result["score"],
            keywords_matched=ats_result["keywords_matched"],
            keywords_missing=ats_result["keywords_missing"],
            suggestions=ats_result["suggestions"],
            analyzed_at=datetime.now()
        )
    )
    
    # Save to storage
    cv_id = save_cv_to_storage(cv_data)
    
    return {
        "message": "CV uploaded and analyzed successfully",
        "cv_id": cv_id,
        "ats_score": ats_result["score"],
        "grade": get_cv_grade(ats_result["score"]),
        "matched_positions": matched_positions,
        "suggestions": ats_result["suggestions"],
        "keywords_matched": ats_result["keywords_matched"],
        "keywords_missing": ats_result["keywords_missing"],
        "redirect_url": f"/cv/{cv_id}/edit"
    }

# 2. Create blank CV
@router.post("/create-blank")
async def create_blank_cv():
    """Create a new blank CV"""
    blank_cv = CVData(
        version_name="My New CV",
        personalInfo=PersonalInfo(
            fullName="Your Name",
            email="your@email.com"
        ),
        summary="Write your professional summary here...",
        skills=[],
        education=[],
        experience=[],
        projects=[]
    )
    
    cv_id = save_cv_to_storage(blank_cv)
    
    return {
        "message": "New blank CV created",
        "cv_id": cv_id,
        "redirect_url": f"/cv/{cv_id}/edit"
    }

# 3. Get CV for viewing
@router.get("/{cv_id}/view")
async def view_cv(cv_id: int):
    """Get CV data formatted for CV page"""
    if cv_id not in cv_storage:
        raise HTTPException(status_code=404, detail="CV not found")
    
    cv = cv_storage[cv_id]
    cv.view_count += 1
    
    return {
        "cv_id": cv_id,
        "view_mode": "view",
        "cv_data": cv,
        "page_title": f"{cv.personalInfo.fullName} - CV",
        "sections": {
            "personal_info": cv.personalInfo,
            "summary": cv.summary,
            "skills": cv.skills,
            "experience": cv.experience,
            "education": cv.education,
            "projects": cv.projects
        },
        "ats_status": cv.ats_analysis.status if cv.ats_analysis else "pending",
        "ats_score": cv.ats_analysis.score if cv.ats_analysis else None
    }

# 4. Get CV for editing
@router.get("/{cv_id}/edit")
async def edit_cv(cv_id: int):
    """Get CV data for editing"""
    if cv_id not in cv_storage:
        raise HTTPException(status_code=404, detail="CV not found")
    
    cv = cv_storage[cv_id]
    
    return {
        "cv_id": cv_id,
        "edit_mode": True,
        "cv_data": cv,
        "suggestions": cv.ats_analysis.suggestions if cv.ats_analysis else []
    }

# 5. Update CV
@router.put("/{cv_id}")
async def update_cv(cv_id: int, cv_data: CVData):
    """Update entire CV"""
    if cv_id not in cv_storage:
        raise HTTPException(status_code=404, detail="CV not found")
    
    cv_data.id = cv_id
    cv_data.updated_at = datetime.now()
    cv_data.created_at = cv_storage[cv_id].created_at
    
    # Recalculate ATS score
    ats_result = calculate_ats_score(cv_data.dict())
    cv_data.ats_analysis = ATSAnalysis(
        status=ATSStatus.PASSED if ats_result["score"] >= 60 else ATSStatus.FAILED,
        score=ats_result["score"],
        keywords_matched=ats_result["keywords_matched"],
        keywords_missing=ats_result["keywords_missing"],
        suggestions=ats_result["suggestions"],
        analyzed_at=datetime.now()
    )
    
    cv_storage[cv_id] = cv_data
    
    return {"message": "CV updated successfully", "cv_data": cv_data}

# 6. Update personal info across all CVs
@router.put("/personal-info/update-all")
async def update_all_cvs_personal_info(personal_info: PersonalInfo, user_id: int = 1):
    """Update personal information in ALL CVs"""
    updated_cvs = []
    for cv_id in user_cvs.get(user_id, []):
        if cv_id in cv_storage:
            cv_storage[cv_id].personalInfo = personal_info
            cv_storage[cv_id].updated_at = datetime.now()
            updated_cvs.append(cv_id)
    
    return {
        "message": f"Updated {len(updated_cvs)} CVs",
        "updated_cvs": updated_cvs
    }

# 7. Update skills across all CVs
@router.put("/skills/update-all")
async def update_all_cvs_skills(skills: List[str], user_id: int = 1):
    """Update skills in ALL CVs"""
    updated_cvs = []
    for cv_id in user_cvs.get(user_id, []):
        if cv_id in cv_storage:
            cv_storage[cv_id].skills = skills
            cv_storage[cv_id].updated_at = datetime.now()
            
            # Recalculate ATS
            ats_result = calculate_ats_score(cv_storage[cv_id].dict())
            cv_storage[cv_id].ats_analysis.score = ats_result["score"]
            updated_cvs.append(cv_id)
    
    return {
        "message": f"Updated skills in {len(updated_cvs)} CVs",
        "updated_cvs": updated_cvs
    }

# 8. Get all CVs
@router.get("/all")
async def get_all_cvs(user_id: int = 1):
    """Get all CVs for a user"""
    user_cv_list = []
    for cv_id in user_cvs.get(user_id, []):
        if cv_id in cv_storage:
            user_cv_list.append(cv_storage[cv_id])
    
    return {
        "total": len(user_cv_list),
        "cvs": user_cv_list
    }

# 9. Delete CV
@router.delete("/{cv_id}")
async def delete_cv(cv_id: int, user_id: int = 1):
    """Delete a CV"""
    if cv_id not in cv_storage:
        raise HTTPException(status_code=404, detail="CV not found")
    
    del cv_storage[cv_id]
    if cv_id in user_cvs[user_id]:
        user_cvs[user_id].remove(cv_id)
    
    return {"message": f"CV {cv_id} deleted successfully"}

# 10. Quick start options for homepage
@router.get("/quick-start/options")
async def get_quick_start_options():
    """Get options for homepage quick start"""
    return {
        "options": [
            {
                "id": "create_new",
                "label": "Create from Scratch",
                "description": "Build your CV step by step",
                "icon": "plus",
                "endpoint": "/api/cv/create-blank",
                "method": "POST"
            },
            {
                "id": "upload_existing",
                "label": "Upload Existing CV",
                "description": "Upload PDF/DOCX and optimize",
                "icon": "upload",
                "endpoint": "/api/cv/upload",
                "method": "POST",
                "accepts_file": True
            }
        ],
        "featured_roles": ["Frontend Developer", "Backend Developer", "Data Scientist", "DevOps Engineer"]
    }