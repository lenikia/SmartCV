import anthropic
from app.core.config import settings

# Initialise the Anthropic client once at module level
# This is intentional — creating a new client per request
# is wasteful. One client instance handles all requests.
client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

# ── Prompt templates per section ────────────────────────────
# Each section gets a tailored system prompt that tells Claude
# exactly what role it's playing and what output is expected.
# The user message contains the actual content to enhance.

SECTION_PROMPTS = {
    "profile": {
        "system": """You are a professional CV writer specialising in tech roles.
Your task is to rewrite a candidate's profile/summary section to be compelling,
concise, and tailored to the target job title or description.
- Write in first person
- Keep it to 3-4 sentences maximum
- Lead with the candidate's strongest relevant qualities
- End with what they bring to the role
- Do not invent skills or experience not mentioned
- Return only the rewritten profile text, nothing else""",

        "user": lambda content, job_title, job_description: f"""
Job Title: {job_title or 'Not specified'}
Job Description: {job_description or 'Not specified'}

Current Profile:
{content}

Rewrite this profile section tailored to the job above.
"""
    },

    "experience": {
        "system": """You are a professional CV writer specialising in tech roles.
Your task is to enhance job experience bullet points to be achievement-focused,
quantified where possible, and aligned with the target role.
- Use strong action verbs
- Focus on impact and outcomes not just responsibilities
- Keep each bullet point to one line
- Preserve all factual information — do not invent metrics
- Return only the enhanced bullet points, one per line""",

        "user": lambda content, job_title, job_description: f"""
Job Title: {job_title or 'Not specified'}
Job Description: {job_description or 'Not specified'}

Current Experience:
{content}

Enhance these experience bullet points for the job above.
"""
    },

    "skills": {
        "system": """You are a professional CV writer specialising in tech roles.
Your task is to organise and prioritise a candidate's skills list
to be most relevant to the target job title or description.
- Group related skills together
- Put most relevant skills first
- Do not add skills not mentioned by the candidate
- Return as a clean comma-separated list or grouped list
- Return only the skills content, nothing else""",

        "user": lambda content, job_title, job_description: f"""
Job Title: {job_title or 'Not specified'}
Job Description: {job_description or 'Not specified'}

Current Skills:
{content}

Reorganise and prioritise these skills for the job above.
"""
    },

    "education": {
        "system": """You are a professional CV writer specialising in tech roles.
Your task is to format and enhance education entries to be clear,
professional, and relevant to the target role.
- Format dates consistently
- Highlight relevant coursework or achievements if mentioned
- Keep it factual — do not invent grades or courses
- Return only the formatted education content, nothing else""",

        "user": lambda content, job_title, job_description: f"""
Job Title: {job_title or 'Not specified'}
Job Description: {job_description or 'Not specified'}

Current Education:
{content}

Format and enhance this education section for the job above.
"""
    },

    "projects": {
        "system": """You are a professional CV writer specialising in tech roles.
Your task is to enhance project descriptions to highlight technical
depth, impact, and relevance to the target role.
- Lead with what the project does and its impact
- Mention key technologies used
- Keep each project description to 2-3 sentences
- Do not invent technical details not mentioned
- Return only the enhanced project descriptions, nothing else""",

        "user": lambda content, job_title, job_description: f"""
Job Title: {job_title or 'Not specified'}
Job Description: {job_description or 'Not specified'}

Current Projects:
{content}

Enhance these project descriptions for the job above.
"""
    },

    "certifications": {
        "system": """You are a professional CV writer specialising in tech roles.
Your task is to format certification entries clearly and highlight
their relevance to the target role.
- Format consistently: Certification Name — Issuer (Year)
- Add a brief note on relevance if it strengthens the application
- Do not invent certifications or dates
- Return only the formatted certifications, nothing else""",

        "user": lambda content, job_title, job_description: f"""
Job Title: {job_title or 'Not specified'}
Job Description: {job_description or 'Not specified'}

Current Certifications:
{content}

Format and highlight these certifications for the job above.
"""
    },

    # Default prompt for any custom section the user names themselves
    "default": {
        "system": """You are a professional CV writer specialising in tech roles.
Your task is to enhance the provided CV section to be clear,
professional, and relevant to the target job title or description.
- Improve language and structure
- Highlight what's most relevant to the role
- Do not invent information not provided
- Return only the enhanced section content, nothing else""",

        "user": lambda content, job_title, job_description: f"""
Job Title: {job_title or 'Not specified'}
Job Description: {job_description or 'Not specified'}

Current Content:
{content}

Enhance this section for the job above.
"""
    }
}


def generate_section(
    section_name: str,
    content: str,
    job_title: str = None,
    job_description: str = None
) -> str:
    """
    Generate AI-enhanced content for a single CV section.

    Selects the appropriate prompt template for the section name.
    Falls back to the default prompt for custom/unknown sections.
    This is intentional — users can name sections anything they want
    and the AI will still attempt a sensible enhancement.
    """

    # Normalise section name — lowercase, strip whitespace
    # so "Skills", "SKILLS", "skills" all match the same prompt
    section_key = section_name.lower().strip()

    # Select prompt — fall back to default for unknown sections
    prompt_config = SECTION_PROMPTS.get(section_key, SECTION_PROMPTS["default"])

    # Build the user message using the lambda for this section
    user_message = prompt_config["user"](content, job_title, job_description)

    # Make the API call
    # max_tokens=1000 is sufficient for any single CV section
    # We use claude-sonnet-4-20250514 — best balance of quality and cost
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        system=prompt_config["system"],
        messages=[
            {"role": "user", "content": user_message}
        ]
    )

    # Extract the text from the response
    # content[0].text is the standard structure for a non-streaming
    # single message response from the Anthropic API
    return message.content[0].text


async def generate_from_url(job_url: str, profile: dict, sections: dict) -> dict:
    import httpx
    import json

    # Fetch the job posting page
    job_page_text = ""
    async with httpx.AsyncClient() as http_client:
        try:
            response = await http_client.get(
                job_url,
                timeout=10.0,
                follow_redirects=True,
                headers={"User-Agent": "Mozilla/5.0"}
            )
            job_page_text = response.text[:4000]
        except Exception:
            job_page_text = "Could not fetch job posting."

    profile_context = f"""
CANDIDATE PROFILE:
Name: {profile.get('first_name')} {profile.get('last_name')}
Email: {profile.get('email')}
Phone: {profile.get('phone', 'Not provided')}
Location: {profile.get('address', '')} {profile.get('country', '')}
Preferred Job Title: {profile.get('preferred_job_title', 'Not provided')}

BRIEF INTRO: {profile.get('brief_intro', 'Not provided')}

ABOUT ME (candidate own words):
{profile.get('about_me', 'Not provided')}

SKILLS: {json.dumps(profile.get('skills', {}), indent=2)}

EXPERIENCE: {json.dumps(profile.get('experience', []), indent=2)}

UNIVERSITY PROJECTS: {json.dumps(profile.get('university_projects', []), indent=2)}

PERSONAL PROJECTS: {json.dumps(profile.get('personal_projects', []), indent=2)}

SOFT SKILLS: {json.dumps(profile.get('soft_skills', []), indent=2)}

INTERESTS: {json.dumps(profile.get('interests', []), indent=2)}

EDUCATION: {json.dumps(profile.get('education', []), indent=2)}

LANGUAGES: {json.dumps(profile.get('languages', []), indent=2)}
"""

    prompt = f"""You are a professional CV writer. Using ONLY the candidate profile data below,
generate a complete tailored CV for the job posting provided.

RULES:
1. Use ONLY facts from the candidate profile — never invent experience or skills
2. If a section has no profile data, return empty array or empty string
3. Tailor language and emphasis to match job description keywords
4. Write achievement-focused bullet points with strong action verbs
5. Return ONLY valid JSON — no markdown fences, no explanation, no extra text

{profile_context}

JOB POSTING:
{job_page_text}

Return ONLY this exact JSON structure:
{{
  "brief_intro": "one-liner tailored to this role",
  "about_me": "polished profile paragraph preserving candidate voice with job keywords",
  "skills": {{
    "programming": ["languages ranked by job relevance"],
    "tools": ["tools ranked by job relevance"],
    "other": ["other relevant skills"]
  }},
  "experience": [
    {{
      "title": "role title",
      "subtitle": "company",
      "date": "date range",
      "bullets": ["achievement 1", "achievement 2"]
    }}
  ],
  "university_projects": [
    {{
      "title": "project name",
      "subtitle": "duration",
      "date": "",
      "bullets": ["what was built", "tech used", "outcome"]
    }}
  ],
  "personal_projects": [
    {{
      "title": "project name",
      "subtitle": "duration",
      "date": "",
      "bullets": ["what was built", "tech used"]
    }}
  ],
  "soft_skills": ["skill 1", "skill 2"],
  "interests": ["interest 1", "interest 2"],
  "education": [
    {{
      "title": "institution",
      "subtitle": "degree",
      "date": "year/status",
      "bullets": ["field of study"]
    }}
  ]
}}"""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4000,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = message.content[0].text.strip()

    # Strip markdown fences if Claude wrapped the response
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"raw": raw, "error": "Could not parse AI response"}