from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
import httpx

from app.database import get_db
from app.models.user import User
from app.models.profile import UserProfile
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/jobs", tags=["Jobs"])


class JobListing(BaseModel):
    id: str
    title: str
    company: str
    location: str
    url: str
    description: str
    salary: Optional[str] = None
    job_type: Optional[str] = None
    posted_at: Optional[str] = None
    source: str
    tags: List[str] = []


class JobsResponse(BaseModel):
    jobs: List[JobListing]
    total: int
    sources: List[str]


async def fetch_remotive_jobs(keyword: str, limit: int = 20) -> List[JobListing]:
    url = "https://remotive.com/api/remote-jobs"
    params = {"search": keyword, "limit": limit}

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(
                url,
                params=params,
                headers={"Accept": "application/json", "User-Agent": "SmartCV/1.0"}
            )
            resp.raise_for_status()
            data = resp.json()
        except Exception as e:
            print(f"Remotive error: {e}")
            return []

    jobs = []
    for job in data.get("jobs", []):
        jobs.append(JobListing(
            id=f"remotive-{job.get('id', '')}",
            title=job.get("title", ""),
            company=job.get("company_name", ""),
            location=job.get("candidate_required_location", "Remote"),
            url=job.get("url", ""),
            description=_strip_html(job.get("description", ""))[:500],
            salary=job.get("salary") or None,
            job_type=job.get("job_type", ""),
            posted_at=job.get("publication_date", ""),
            source="remotive",
            tags=job.get("tags", []),
        ))
    return jobs


async def fetch_adzuna_jobs(
    keyword: str,
    location: str = "",
    app_id: str = "",
    app_key: str = "",
    limit: int = 20
) -> List[JobListing]:
    if not app_id or not app_key:
        return []

    country = "gb"
    loc_lower = location.lower()
    if any(x in loc_lower for x in ["us", "usa", "united states", "new york", "california"]):
        country = "us"
    elif any(x in loc_lower for x in ["de", "germany", "berlin", "munich"]):
        country = "de"
    elif any(x in loc_lower for x in ["pl", "poland", "warsaw", "krakow", "szczecin"]):
        country = "pl"

    url = f"https://api.adzuna.com/v1/api/jobs/{country}/search/1"
    params = {
        "app_id": app_id,
        "app_key": app_key,
        "results_per_page": limit,
        "what": keyword,
    }
    if location:
        params["where"] = location

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(
                url,
                params=params,
                headers={"Accept": "application/json"}
            )
            resp.raise_for_status()
            data = resp.json()
        except Exception as e:
            print(f"Adzuna error: {e}")
            return []

    jobs = []
    for job in data.get("results", []):
        salary = None
        sal_min = job.get("salary_min")
        sal_max = job.get("salary_max")
        if sal_min and sal_max:
            salary = f"{int(sal_min):,} – {int(sal_max):,}"
        elif sal_min:
            salary = f"from {int(sal_min):,}"

        jobs.append(JobListing(
            id=f"adzuna-{job.get('id', '')}",
            title=job.get("title", ""),
            company=job.get("company", {}).get("display_name", ""),
            location=job.get("location", {}).get("display_name", location or ""),
            url=job.get("redirect_url", ""),
            description=job.get("description", "")[:500],
            salary=salary,
            job_type=job.get("contract_type", ""),
            posted_at=job.get("created", ""),
            source="adzuna",
            tags=job.get("category", {}).get("tag", "").split(",") if job.get("category") else [],
        ))
    return jobs


def _filter_jobs(
    jobs: List[JobListing],
    keywords: Optional[str],
    job_type: Optional[str],
    location: Optional[str],
) -> List[JobListing]:
    filtered = jobs

    if keywords:
        kw_lower = keywords.lower()
        filtered = [
            j for j in filtered
            if kw_lower in j.title.lower()
            or kw_lower in j.company.lower()
            or kw_lower in j.description.lower()
            or any(kw_lower in t.lower() for t in j.tags)
        ]

    if job_type:
        filtered = [j for j in filtered if j.job_type and job_type.lower() in j.job_type.lower()]

    return filtered


def _strip_html(text: str) -> str:
    import re
    return re.sub(r"<[^>]+>", " ", text).strip()


@router.get("/", response_model=JobsResponse)
async def get_jobs(
    keyword: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    job_type: Optional[str] = Query(None),
    use_profile: bool = Query(True),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.core.config import settings
    import asyncio

    search_keyword = keyword
    search_location = location

    if use_profile and (not search_keyword or not search_location):
        profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
        if profile:
            if not search_keyword and profile.preferred_job_title:
                search_keyword = profile.preferred_job_title
            if not search_location and profile.country:
                search_location = profile.country

    if not search_keyword:
        raise HTTPException(
            status_code=400,
            detail="Provide a keyword or complete your profile with a preferred_job_title"
        )

    remotive_task = fetch_remotive_jobs(search_keyword, limit=limit)
    adzuna_task = fetch_adzuna_jobs(
        keyword=search_keyword,
        location=search_location or "",
        app_id=getattr(settings, "ADZUNA_APP_ID", ""),
        app_key=getattr(settings, "ADZUNA_APP_KEY", ""),
        limit=limit,
    )

    remotive_jobs, adzuna_jobs = await asyncio.gather(remotive_task, adzuna_task)
    all_jobs = remotive_jobs + adzuna_jobs
    
    filtered = _filter_jobs(all_jobs, keyword, job_type, location)
   
    return JobsResponse(
        jobs=filtered[:limit],
        total=len(filtered),
        sources=list({j.source for j in filtered}),
    )


@router.get("/preferences")
async def get_job_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        return {"preferred_job_title": None, "location": None, "country": None}
    return {
        "preferred_job_title": profile.preferred_job_title,
        "location": profile.address,
        "country": profile.country,
    }