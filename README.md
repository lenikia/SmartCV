# SmartCV

## Description

SmartCV is a web application that transforms the traditional static CV into a dynamic and customizable career management platform. Instead of manually rewriting resumes for different job applications, users can organize their experience, projects, and skills in one place and generate tailored CV versions for specific roles such as Machine Learning, Backend Development, or Data Science. The platform also integrates a professional portfolio, application tracking, and contact management, making it a complete tool for personal branding and career growth.

---

## Objectives

- Simplify CV customization for different job roles  
- Centralize professional information (projects, skills, experience)  
- Improve online professional presence  
- Enable tracking of job applications  
- Provide a scalable and reusable portfolio platform  

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
