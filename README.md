# SmartCV

## Description

SmartCV, a web application that lets users create, manage and export tailored CVs based on a job title or job description. The platform uses AI (Srill to be determined) to score CVs against Job Descriptions or Job Positions (Additional feature takes an linkedin job post & creates a CV from scratch), analysing keywords and sentence quality, which in turn returns actionable improvement suggestions. Users also get a job application tracker dashboard, allowing them to check out the (in discussion) real time/live job postings from different platforms in one place.

---
## Core user flow

1. User signs up and builds their base profile (experience, skills, education, projects)
2. User creates a CV — either from scratch via the builder form, or by uploading an existing file
3. User pastes a job description or enters a job title
4. AI analyses the CV against the JD: returns a score (0–100), matched keywords, missing keywords, and sentence improvement tips
5. User refines their CV based on suggestions and exports as PDF or DOCX
6. User saves multiple CV versions per role (e.g. "ML Engineer v2", "Backend Dev v1")
6. User tracks all job applications in the built-in tracker (status, salary, notes, timeline)
---
## Key screens

1. Home / landing: hero with Create CV and Upload CV CTAs
2. Dashboard: tabbed layout — CV Management tab + Job Tracker tab
3. CV builder: multi-step form with live preview panel
4. Score dashboard: keyword match list, sentence quality scores, improvement tips
5. Job tracker: table view (Company / Role / Location / Salary / Status), Chart view, Calendar view
6.Document manager: list of uploaded CVs and cover letters with Primary badge
---
## Features

- Professional profile management  
- Dynamic CV generation for different roles  
- Projects, experience, and education management  
- Basic analytics dashboard  
- Contact and messaging system  
- Job application tracker  
- Authentication and admin panel  
- Smart suggestions for CV improvement  

---

## Tech Stack

### Frontend
- React (Vite)  
- React Router  
- Axios  
- Tailwind CSS  

### Backend
- Python  
- FastAPI  
- SQLAlchemy  
- Pydantic  

### Database
- PostgreSQL  

### Authentication
- JWT (JSON Web Tokens)  
- Bcrypt (password hashing)  

---

## Architecture
Frontend (React)
↓
API (FastAPI)
↓
Database (PostgreSQL)


---

## Database (Main Tables)

- users  
- profile  
- skills  
- projects  
- experience  
- education  
- messages  
- applications  
- cv_versions  

---

## API Endpoints (Examples)
POST /auth/login
GET /profile
PUT /profile
GET /projects
POST /projects
PUT /projects/{id}
DELETE /projects/{id}
POST /messages
POST /applications
GET /applications


---

## Installation

### 1. Clone the repository
git clone https://github.com/your-username/smartcv.git

```bash
cd smartcv
```

### 2. Backend setup
```bash
cd backend
python -m venv venv
source venv/bin/activate # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

---

## Team Roles

- Project Manager  
- Backend Developer  
- Frontend Developer  
- Database Specialist  
- QA & Documentation  

---

## Future Improvements

- CV export as PDF  
- AI-based CV optimization  
- Job recommendation system  
- Email notifications  
- Multi-language support  
- Dark mode  

---

## Conclusion

SmartCV is more than just a digital resume, it is a smart career management tool that helps users organize, adapt, and optimize their professional profiles for different opportunities in a modern and efficient way.
