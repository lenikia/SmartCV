# SmartCV

## Description

SmartCV is a web application that lets users create, manage, and export tailored CVs based on a job title or job description. The platform uses AI to score CVs against job descriptions or job positions, analysing keywords and sentence quality, returning actionable improvement suggestions. An additional feature takes a LinkedIn job post URL and generates a tailored CV from scratch based on the user's profile.

Users also get a job application tracker dashboard, allowing them to monitor applications across different stages and view live job postings from multiple platforms in one place.

---

## Core user flow

1. User signs up and builds their base profile (name, contact info, preferred job title)
2. User fills in CV sections dynamically — skills, experience, education, projects, certifications, and any custom section they name themselves
3. User creates a CV — either from scratch via the builder, or by uploading an existing file
4. User pastes a job description or enters a job title
5. AI analyses the CV against the JD: returns a score (0–100), matched keywords, missing keywords, and sentence improvement tips
6. User refines their CV based on suggestions and exports as PDF or shares via link
7. User saves multiple CV versions per role (e.g. "ML Engineer v2", "Backend Dev v1")
8. User tracks all job applications in the built-in tracker (status, salary, notes, timeline)

---

## Key screens

1. **Home / landing** — hero with app overview, profile setup form for new users
2. **Dashboard** — tabbed layout: CV Management tab + Job Tracker tab
3. **CV builder** — multi-section form with live preview panel and AI generation per section
4. **Score dashboard** — keyword match list, sentence quality scores, improvement tips
5. **Job tracker** — table view (Company / Role / Location / Salary / Status), chart view, calendar view
6. **Document manager** — list of uploaded CVs and cover letters with Primary badge

---

## Features

- User authentication with JWT
- Professional profile management (base identity data stored once, reused across CVs)
- Dynamic CV section creation — users name and build their own sections
- AI-powered CV generation and improvement per section
- Job description URL → tailored CV generation
- ATS score analysis with keyword matching
- Job application tracker
- PDF export and shareable CV links
- Smart suggestions for CV improvement

---

## Tech Stack

### Frontend
- React 19 (Vite)
- React Router v7
- Fetch API (native — no Axios dependency)

### Backend
- Python 3.12
- FastAPI 0.136+
- SQLAlchemy 2.0
- Pydantic v2
- Anthropic SDK (AI generation)
- HTTPx (job URL fetching)

### Database
- SQLite (development)
- PostgreSQL (production — planned)

### Authentication
- JWT (JSON Web Tokens) via python-jose
- Bcrypt (password hashing)

### Infrastructure
- Docker + Docker Compose (cross-platform dev environment)

---

## Architecture

```
Frontend (React + Vite)
        ↓
API (FastAPI — Python)
        ↓
Database (SQLite → PostgreSQL)
```

---

## Database (Main Tables)

| Table | Purpose |
|---|---|
| `users` | Auth — email, hashed password |
| `user_profiles` | Base identity — name, contact, preferred job title |
| `cvs` | CV records — title, template, slug, user reference |
| `cv_sections` | Dynamic sections per CV — user-named, JSON content |
| `jobs` | Job application tracker entries |

---

## API Endpoints

```
POST   /api/v1/auth/signup
POST   /api/v1/auth/login
GET    /api/v1/auth/me

GET    /api/v1/profile/
POST   /api/v1/profile/
PUT    /api/v1/profile/

GET    /api/v1/cv/
POST   /api/v1/cv/
GET    /api/v1/cv/{id}
PUT    /api/v1/cv/{id}
DELETE /api/v1/cv/{id}

POST   /api/v1/ai/generate
POST   /api/v1/ai/generate-from-url

GET    /api/v1/cv/{id}/sections
POST   /api/v1/cv/{id}/sections
PUT    /api/v1/cv/{id}/sections/{section_id}
DELETE /api/v1/cv/{id}/sections/{section_id}
PUT    /api/v1/cv/{id}/sections/reorder

GET    /api/v1/jobs/
GET    /api/v1/jobs/preferences

GET    /api/v1/applications/
POST   /api/v1/applications/
PUT    /api/v1/applications/{id}
DELETE /api/v1/applications/{id}

POST   /api/v1/score/
POST   /api/v1/upload/
```

---

## Running the project (Docker — recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop) (Mac, Windows, Linux)
- Git

### Setup

```bash
# Clone the repo
git clone https://github.com/lenikia/SmartCV.git
cd SmartCV

# Copy environment files and fill in values
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp .env.example .env
```

Fill in `backend/.env`:
```
SECRET_KEY=any-long-random-string
DATABASE_URL=sqlite:///./smartcv.db
ANTHROPIC_API_KEY=your-key-here
ADZUNA_APP_ID=your_app_id_here
ADZUNA_APP_KEY=your_app_key_here
```

Fill in root `.env`:
```
SECRET_KEY=any-long-random-string
DATABASE_URL=sqlite:///./smartcv.db
ANTHROPIC_API_KEY=your-key-here
VITE_API_URL=http://localhost:8000
```

### Run

```bash
# First run — builds images (takes 2–5 minutes)
docker-compose up --build

# Subsequent runs
docker-compose up
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

### Stop

```bash
docker-compose down
```

---

## Running without Docker (manual setup)

**Windows users:** Run all commands in Git Bash, not Command Prompt or PowerShell.

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate.bat       # Windows (Git Bash)
pip install -r requirements.txt
python -m uvicorn main:app --reload --reload-exclude "venv/*"
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Common issues

**`make: command not found` on Windows**
Use Git Bash instead of Command Prompt or PowerShell.

**Port already in use**
```bash
lsof -ti :8000 | xargs kill -9   # kill backend
lsof -ti :5173 | xargs kill -9   # kill frontend
```

**`pip install` fails on `psycopg2-binary`**
Comment out that line in `backend/requirements.txt` — it's only needed when switching to PostgreSQL.

**CORS error in browser**
Check what port Vite is running on (5173 or 5174) and make sure it matches `allow_origins` in `backend/app/main.py`.

---

## Team Roles

- Project Manager
- Backend Developer
- Frontend Developer
- Database Specialist
- QA & Documentation

---

## Roadmap

- [ ] AI section generation (in progress)
- [ ] Dashboard CV management tab
- [ ] Job application tracker tab
- [ ] Job URL → tailored CV generation
- [ ] PDF export
- [ ] Shareable CV links
- [ ] PostgreSQL migration
- [ ] Multi-language support
- [ ] Dark mode

---

## Conclusion

SmartCV is more than a digital resume builder — it is a smart career management tool that helps users organise, adapt, and optimise their professional profiles for different opportunities in a modern and efficient way.
