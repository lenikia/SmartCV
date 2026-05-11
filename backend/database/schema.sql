-- USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PROFILE (CV base)
CREATE TABLE profile (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    job_title_target VARCHAR(100),
    summary TEXT,
    phone VARCHAR(20),
    address TEXT
);

-- SKILLS
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    profile_id INT REFERENCES profile(id) ON DELETE CASCADE,
    skill_name VARCHAR(100),
    level VARCHAR(50)
);

-- PROJECTS
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    profile_id INT REFERENCES profile(id) ON DELETE CASCADE,
    title VARCHAR(150),
    description TEXT,
    link TEXT
);

-- EXPERIENCE
CREATE TABLE experience (
    id SERIAL PRIMARY KEY,
    profile_id INT REFERENCES profile(id) ON DELETE CASCADE,
    company VARCHAR(100),
    role VARCHAR(100),
    description TEXT,
    start_date DATE,
    end_date DATE
);

-- EDUCATION
CREATE TABLE education (
    id SERIAL PRIMARY KEY,
    profile_id INT REFERENCES profile(id) ON DELETE CASCADE,
    school VARCHAR(150),
    degree VARCHAR(100),
    start_date DATE,
    end_date DATE
);

-- MESSAGES (for communication)
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INT REFERENCES users(id),
    receiver_id INT REFERENCES users(id),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- APPLICATIONS (jobs user applied for)
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    job_title VARCHAR(150),
    company VARCHAR(150),
    status VARCHAR(50),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CV VERSIONS (different CVs per job)
CREATE TABLE cv_versions (
    id SERIAL PRIMARY KEY,
    profile_id INT REFERENCES profile(id) ON DELETE CASCADE,
    version_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);