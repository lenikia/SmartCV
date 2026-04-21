INSERT INTO users (name, email, password)
VALUES ('Alice', 'alice@example.com', 'password123');

INSERT INTO profile (user_id, job_title_target, summary, phone, address)
VALUES (1, 'Data Analyst', 'Motivated student with analytical skills', '123-456-7890', '123 Main St');

INSERT INTO skills (profile_id, skill_name, level)
VALUES (1, 'Python', 'Intermediate');