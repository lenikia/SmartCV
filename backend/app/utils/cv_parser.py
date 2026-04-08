import re
import PyPDF2
import docx
from io import BytesIO
from typing import List, Dict, Any

def extract_text_from_pdf(file_content: bytes) -> str:
    """Extract text from PDF file"""
    text = ""
    try:
        pdf_reader = PyPDF2.PdfReader(BytesIO(file_content))
        for page in pdf_reader.pages:
            text += page.extract_text() or ""
    except Exception as e:
        print(f"Error extracting PDF: {e}")
    return text

def extract_text_from_docx(file_content: bytes) -> str:
    """Extract text from DOCX file"""
    text = ""
    try:
        doc = docx.Document(BytesIO(file_content))
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
    except Exception as e:
        print(f"Error extracting DOCX: {e}")
    return text

def extract_email(text: str) -> str:
    """Extract email from text"""
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, text)
    return emails[0] if emails else ""

def extract_phone(text: str) -> str:
    """Extract phone number from text"""
    phone_pattern = r'\+?[\d\s-]{10,15}'
    phones = re.findall(phone_pattern, text)
    return phones[0] if phones else ""

def extract_name(text: str) -> str:
    """Extract likely name from first few lines"""
    lines = text.split('\n')[:5]
    for line in lines:
        if len(line.split()) <= 4 and len(line) < 50 and line.strip():
            return line.strip()
    return ""

def extract_skills(text: str) -> List[str]:
    """Extract technical skills from text"""
    common_skills = [
        "Python", "JavaScript", "React", "Angular", "Vue", "Node.js",
        "Java", "C++", "C#", "Ruby", "Go", "Rust", "Swift", "Kotlin",
        "SQL", "MongoDB", "PostgreSQL", "MySQL", "Redis",
        "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Jenkins",
        "Machine Learning", "AI", "Data Science", "TensorFlow", "PyTorch",
        "Git", "CI/CD", "Agile", "Scrum", "REST API", "GraphQL"
    ]
    
    found_skills = []
    text_lower = text.lower()
    for skill in common_skills:
        if skill.lower() in text_lower:
            found_skills.append(skill)
    
    return found_skills[:15]  # Return top 15 skills

def extract_summary(text: str) -> str:
    """Extract professional summary (first 2-3 sentences after name)"""
    lines = text.split('\n')
    # Find first substantial paragraph
    for line in lines:
        if len(line) > 100 and not any(x in line.lower() for x in ['email', 'phone', 'linkedin']):
            return line[:500]
    return "Experienced professional with strong technical skills."

def parse_cv_text(text: str) -> Dict[str, Any]:
    """Parse extracted text into structured CV data"""
    return {
        "personalInfo": {
            "fullName": extract_name(text),
            "email": extract_email(text),
            "phone": extract_phone(text),
            "location": "",
            "linkedin": "",
            "github": "",
            "professionalTitle": ""
        },
        "summary": extract_summary(text),
        "skills": extract_skills(text),
        "education": [],
        "experience": [],
        "projects": []
    }

def calculate_ats_score(cv_data: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate ATS compatibility score"""
    common_keywords = [
        "leadership", "team management", "project management",
        "agile", "scrum", "communication", "problem solving",
        "analytical", "organized", "detail-oriented"
    ]
    
    cv_text = str(cv_data).lower()
    keywords_matched = []
    keywords_missing = []
    
    for keyword in common_keywords:
        if keyword in cv_text:
            keywords_matched.append(keyword)
        else:
            keywords_missing.append(keyword)
    
    score = int((len(keywords_matched) / len(common_keywords)) * 100)
    
    suggestions = []
    if score < 50:
        suggestions.append("Add more industry-specific keywords")
        suggestions.append("Improve your professional summary")
    elif score < 75:
        suggestions.append("Consider adding quantifiable achievements")
        suggestions.append("Highlight technical skills more prominently")
    else:
        suggestions.append("Your CV is well optimized for ATS!")
    
    if len(cv_data.get("skills", [])) < 5:
        suggestions.append("Add more relevant technical skills")
    
    return {
        "score": score,
        "keywords_matched": keywords_matched[:10],
        "keywords_missing": keywords_missing[:10],
        "suggestions": suggestions[:5]
    }

def match_positions_to_cv(cv_data: Dict[str, Any], ats_score: int) -> List[str]:
    """Determine which job positions this CV matches"""
    matched = []
    skills_lower = [s.lower() for s in cv_data.get("skills", [])]
    
    # Role matching logic
    if any(skill in skills_lower for skill in ["react", "angular", "vue", "html", "css"]):
        matched.append("Frontend Developer")
    
    if any(skill in skills_lower for skill in ["python", "java", "go", "node.js", "sql"]):
        matched.append("Backend Developer")
    
    if any(skill in skills_lower for skill in ["tensorflow", "pytorch", "machine learning", "ai"]):
        matched.append("Machine Learning Engineer")
    
    if any(skill in skills_lower for skill in ["pandas", "numpy", "data analysis", "statistics"]):
        matched.append("Data Scientist")
    
    if any(skill in skills_lower for skill in ["docker", "kubernetes", "aws", "ci/cd"]):
        matched.append("DevOps Engineer")
    
    # Add general roles based on ATS score
    if ats_score >= 70:
        matched.append("Software Engineer")
    
    if ats_score >= 80:
        matched.append("Senior Developer")
    
    # Remove duplicates and limit to 5
    return list(dict.fromkeys(matched))[:5]

def get_cv_grade(score: int) -> str:
    """Convert ATS score to letter grade"""
    if score >= 90: return "A+"
    if score >= 85: return "A"
    if score >= 80: return "A-"
    if score >= 75: return "B+"
    if score >= 70: return "B"
    if score >= 65: return "B-"
    if score >= 60: return "C+"
    if score >= 55: return "C"
    if score >= 50: return "C-"
    if score >= 40: return "D"
    return "F"