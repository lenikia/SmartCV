import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProfile, createProfile, updateProfile } from "../api/profile";

function Profile() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState("");
    const [isNew, setIsNew] = useState(false);

    // ── Form state ─────────────────────────────────────────
    const [form, setForm] = useState({
        // Contact & Identity
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address: "",
        country: "",
        preferred_job_title: "",

        // Career narrative
        brief_intro: "",
        about_me: "",

        // Structured data
        skills: { programming: [], tools: [], other: [] },
        experience: [],
        university_projects: [],
        personal_projects: [],
        soft_skills: [],
        interests: [],
        education: [],
        languages: []
    });

    // Input helpers for flat lists
    const [inputs, setInputs] = useState({
        programming: "",
        tools: "",
        other_skill: "",
        soft_skill: "",
        interest: "",
        language: ""
    });

    // ── Load profile on mount ──────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/signin"); return; }

        getProfile()
            .then(profile => {
                if (!profile) {
                    setIsNew(true);
                } else {
                    setForm({
                        first_name: profile.first_name || "",
                        last_name: profile.last_name || "",
                        email: profile.email || "",
                        phone: profile.phone || "",
                        address: profile.address || "",
                        country: profile.country || "",
                        preferred_job_title: profile.preferred_job_title || "",
                        brief_intro: profile.brief_intro || "",
                        about_me: profile.about_me || "",
                        skills: profile.skills || { programming: [], tools: [], other: [] },
                        experience: profile.experience || [],
                        university_projects: profile.university_projects || [],
                        personal_projects: profile.personal_projects || [],
                        soft_skills: profile.soft_skills || [],
                        interests: profile.interests || [],
                        education: profile.education || [],
                        languages: profile.languages || []
                    });
                }
            })
            .catch(() => {
                localStorage.removeItem("token");
                navigate("/signin");
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    // ── Save handler ───────────────────────────────────────
    const handleSave = async () => {
        if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim()) {
            setError("First name, last name and email are required.");
            return;
        }

        setError("");
        setSaving(true);

        try {
            if (isNew) {
                await createProfile(form);
                setIsNew(false);
            } else {
                await updateProfile(form);
            }
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // ── Field helpers ──────────────────────────────────────
    const setField = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const setSkillField = (category, value) => {
        setForm(prev => ({
            ...prev,
            skills: { ...prev.skills, [category]: value }
        }));
    };

    const addToList = (field, value) => {
        const trimmed = value.trim();
        if (!trimmed) return;
        setForm(prev => ({
            ...prev,
            [field]: [...(prev[field] || []), trimmed]
        }));
    };

    const removeFromList = (field, index) => {
        setForm(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const addToSkills = (category, value) => {
        const trimmed = value.trim();
        if (!trimmed) return;
        setForm(prev => ({
            ...prev,
            skills: {
                ...prev.skills,
                [category]: [...(prev.skills?.[category] || []), trimmed]
            }
        }));
    };

    const removeFromSkills = (category, index) => {
        setForm(prev => ({
            ...prev,
            skills: {
                ...prev.skills,
                [category]: prev.skills[category].filter((_, i) => i !== index)
            }
        }));
    };

    // ── Entry handlers (experience, projects, education) ──
    const addEntry = (field, template) => {
        setForm(prev => ({
            ...prev,
            [field]: [...(prev[field] || []), { ...template, id: Date.now() }]
        }));
    };

    const updateEntry = (field, index, key, value) => {
        setForm(prev => {
            const updated = [...prev[field]];
            updated[index] = { ...updated[index], [key]: value };
            return { ...prev, [field]: updated };
        });
    };

    const removeEntry = (field, index) => {
        setForm(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const addBulletToEntry = (field, index) => {
        setForm(prev => {
            const updated = [...prev[field]];
            updated[index] = {
                ...updated[index],
                bullets: [...(updated[index].bullets || []), ""]
            };
            return { ...prev, [field]: updated };
        });
    };

    const updateBullet = (field, entryIndex, bulletIndex, value) => {
        setForm(prev => {
            const updated = [...prev[field]];
            const bullets = [...(updated[entryIndex].bullets || [])];
            bullets[bulletIndex] = value;
            updated[entryIndex] = { ...updated[entryIndex], bullets };
            return { ...prev, [field]: updated };
        });
    };

    const removeBullet = (field, entryIndex, bulletIndex) => {
        setForm(prev => {
            const updated = [...prev[field]];
            updated[entryIndex] = {
                ...updated[entryIndex],
                bullets: updated[entryIndex].bullets.filter((_, i) => i !== bulletIndex)
            };
            return { ...prev, [field]: updated };
        });
    };

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <header className="dashboard-topbar">
                <div className="container dashboard-topbar-content">
                    <Link to="/" className="brand auth-brand">
                        <div className="brand-mark">S</div>
                        <span>SmartCV</span>
                    </Link>
                    <div className="dashboard-topbar-actions">
                        <Link to="/dashboard" className="ghost-btn nav-link-btn">Dashboard</Link>
                        {saveSuccess && (
                            <span style={{ color: "#166534", fontWeight: 600, fontSize: "0.92rem" }}>
                                ✓ Saved
                            </span>
                        )}
                        <button className="primary-btn" onClick={handleSave} disabled={saving}>
                            {saving ? "Saving..." : "Save Profile"}
                        </button>
                    </div>
                </div>
            </header>

            <main className="dashboard-main">
                <div className="container" style={{ maxWidth: "760px" }}>
                    <section className="dashboard-hero">
                        <div>
                            <span className="eyebrow">Master Profile</span>
                            <h1>Your Career Data</h1>
                            <p>
                                This is the foundation of every CV you generate. Fill it in
                                thoroughly — the AI uses this data to create tailored CVs for
                                specific job applications.
                            </p>
                        </div>
                    </section>

                    {error && <p className="auth-error" style={{ marginBottom: "1rem" }}>{error}</p>}

                    {/* ── 1. Contact & Identity ── */}
                    <div className="builder-form-block">
                        <h3>Contact & Identity</h3>
                        <div className="builder-form-grid">
                            <div className="input-group">
                                <label>First Name *</label>
                                <input type="text" value={form.first_name}
                                    onChange={e => setField("first_name", e.target.value)}
                                    placeholder="Rafael" />
                            </div>
                            <div className="input-group">
                                <label>Last Name *</label>
                                <input type="text" value={form.last_name}
                                    onChange={e => setField("last_name", e.target.value)}
                                    placeholder="Escrivao" />
                            </div>
                            <div className="input-group">
                                <label>Email *</label>
                                <input type="email" value={form.email}
                                    onChange={e => setField("email", e.target.value)}
                                    placeholder="you@example.com" />
                            </div>
                            <div className="input-group">
                                <label>Phone</label>
                                <input type="text" value={form.phone}
                                    onChange={e => setField("phone", e.target.value)}
                                    placeholder="+48 576 212 501" />
                            </div>
                            <div className="input-group">
                                <label>Address</label>
                                <input type="text" value={form.address}
                                    onChange={e => setField("address", e.target.value)}
                                    placeholder="Krzemieniecka 10/134" />
                            </div>
                            <div className="input-group">
                                <label>Country</label>
                                <input type="text" value={form.country}
                                    onChange={e => setField("country", e.target.value)}
                                    placeholder="Poland" />
                            </div>
                            <div className="input-group builder-full-width">
                                <label>Preferred Job Title</label>
                                <input type="text" value={form.preferred_job_title}
                                    onChange={e => setField("preferred_job_title", e.target.value)}
                                    placeholder="Software Engineer" />
                            </div>
                        </div>
                    </div>

                    {/* ── 2. Career Narrative ── */}
                    <div className="builder-form-block">
                        <h3>Career Narrative</h3>
                        <p style={{ color: "#64748b", marginBottom: "1rem", fontSize: "0.92rem" }}>
                            Write in your own words. The AI will polish this for each job application
                            but will never change the facts.
                        </p>
                        <div className="input-group" style={{ marginBottom: "1rem" }}>
                            <label>Brief Intro (one-liner shown under your name)</label>
                            <input type="text" value={form.brief_intro}
                                onChange={e => setField("brief_intro", e.target.value)}
                                placeholder="CS student with interest in human behaviour & building creative projects" />
                        </div>
                        <div className="input-group">
                            <label>About Me (full profile paragraph)</label>
                            <textarea rows="6" value={form.about_me}
                                onChange={e => setField("about_me", e.target.value)}
                                placeholder="I am a motivated computer science student... Write your full profile here in your own words." />
                        </div>
                    </div>

                    {/* ── 3. Skills ── */}
                    <div className="builder-form-block">
                        <h3>Skills</h3>

                        {[
                            { key: "programming", label: "Programming Languages", placeholder: "Java, Python, TypeScript..." },
                            { key: "tools", label: "Tools & Platforms", placeholder: "Docker, Git, PostgreSQL..." },
                            { key: "other", label: "Other Skills", placeholder: "Excel, Figma..." }
                        ].map(({ key, label, placeholder }) => (
                            <div key={key} style={{ marginBottom: "1.2rem" }}>
                                <label style={{ fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>
                                    {label}
                                </label>
                                <div className="builder-skill-input-row">
                                    <input
                                        type="text"
                                        placeholder={placeholder}
                                        value={inputs[key === "other" ? "other_skill" : key]}
                                        onChange={e => setInputs(prev => ({
                                            ...prev,
                                            [key === "other" ? "other_skill" : key]: e.target.value
                                        }))}
                                        onKeyDown={e => {
                                            if (e.key === "Enter") {
                                                addToSkills(key, inputs[key === "other" ? "other_skill" : key]);
                                                setInputs(prev => ({
                                                    ...prev,
                                                    [key === "other" ? "other_skill" : key]: ""
                                                }));
                                            }
                                        }}
                                    />
                                    <button className="primary-btn" onClick={() => {
                                        addToSkills(key, inputs[key === "other" ? "other_skill" : key]);
                                        setInputs(prev => ({
                                            ...prev,
                                            [key === "other" ? "other_skill" : key]: ""
                                        }));
                                    }}>Add</button>
                                </div>
                                <div className="builder-skill-list" style={{ marginTop: "0.5rem" }}>
                                    {(form.skills?.[key] || []).map((skill, i) => (
                                        <div className="builder-skill-chip" key={i}>
                                            <span>{skill}</span>
                                            <button onClick={() => removeFromSkills(key, i)}>×</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── 4. Experience ── */}
                    <div className="builder-form-block">
                        <div className="builder-section-title-row">
                            <h3>Experience</h3>
                            <button className="primary-btn small-btn" onClick={() =>
                                addEntry("experience", { role: "", company: "", date: "", bullets: [""] })
                            }>+ Add</button>
                        </div>
                        {form.experience.map((entry, i) => (
                            <div key={entry.id || i} className="builder-card-block" style={{ marginTop: "1rem" }}>
                                <div className="builder-card-header">
                                    <h4>Experience {i + 1}</h4>
                                    <button className="danger-btn small-btn" onClick={() => removeEntry("experience", i)}>Remove</button>
                                </div>
                                <div className="builder-form-grid">
                                    <div className="input-group">
                                        <label>Role</label>
                                        <input type="text" value={entry.role || ""}
                                            onChange={e => updateEntry("experience", i, "role", e.target.value)}
                                            placeholder="Software Engineer Intern" />
                                    </div>
                                    <div className="input-group">
                                        <label>Company</label>
                                        <input type="text" value={entry.company || ""}
                                            onChange={e => updateEntry("experience", i, "company", e.target.value)}
                                            placeholder="Accenture" />
                                    </div>
                                    <div className="input-group builder-full-width">
                                        <label>Date</label>
                                        <input type="text" value={entry.date || ""}
                                            onChange={e => updateEntry("experience", i, "date", e.target.value)}
                                            placeholder="2023 – 2024" />
                                    </div>
                                </div>
                                <div style={{ marginTop: "0.75rem" }}>
                                    <label style={{ fontWeight: 600, fontSize: "0.92rem" }}>What you did</label>
                                    <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.5rem" }}>
                                        {(entry.bullets || []).map((bullet, j) => (
                                            <div key={j} style={{ display: "flex", gap: "0.5rem" }}>
                                                <input type="text" value={bullet}
                                                    onChange={e => updateBullet("experience", i, j, e.target.value)}
                                                    placeholder={`What you did or achieved`}
                                                    style={{ flex: 1, border: "1px solid #d9e2ef", borderRadius: "0.95rem", padding: "0.65rem 1rem", font: "inherit" }} />
                                                <button className="danger-btn small-btn" onClick={() => removeBullet("experience", i, j)}>×</button>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="secondary-btn small-btn" style={{ marginTop: "0.5rem" }}
                                        onClick={() => addBulletToEntry("experience", i)}>+ Bullet</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── 5. University Projects ── */}
                    <div className="builder-form-block">
                        <div className="builder-section-title-row">
                            <h3>University Projects</h3>
                            <button className="primary-btn small-btn" onClick={() =>
                                addEntry("university_projects", { name: "", duration: "", bullets: [""] })
                            }>+ Add</button>
                        </div>
                        {form.university_projects.map((entry, i) => (
                            <div key={entry.id || i} className="builder-card-block" style={{ marginTop: "1rem" }}>
                                <div className="builder-card-header">
                                    <h4>Project {i + 1}</h4>
                                    <button className="danger-btn small-btn" onClick={() => removeEntry("university_projects", i)}>Remove</button>
                                </div>
                                <div className="builder-form-grid">
                                    <div className="input-group">
                                        <label>Project Name</label>
                                        <input type="text" value={entry.name || ""}
                                            onChange={e => updateEntry("university_projects", i, "name", e.target.value)}
                                            placeholder="Online Auction System" />
                                    </div>
                                    <div className="input-group">
                                        <label>Duration</label>
                                        <input type="text" value={entry.duration || ""}
                                            onChange={e => updateEntry("university_projects", i, "duration", e.target.value)}
                                            placeholder="5 weeks" />
                                    </div>
                                </div>
                                <div style={{ marginTop: "0.75rem" }}>
                                    <label style={{ fontWeight: 600, fontSize: "0.92rem" }}>What you built</label>
                                    <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.5rem" }}>
                                        {(entry.bullets || []).map((bullet, j) => (
                                            <div key={j} style={{ display: "flex", gap: "0.5rem" }}>
                                                <input type="text" value={bullet}
                                                    onChange={e => updateBullet("university_projects", i, j, e.target.value)}
                                                    placeholder="Built using React & Node.js..."
                                                    style={{ flex: 1, border: "1px solid #d9e2ef", borderRadius: "0.95rem", padding: "0.65rem 1rem", font: "inherit" }} />
                                                <button className="danger-btn small-btn" onClick={() => removeBullet("university_projects", i, j)}>×</button>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="secondary-btn small-btn" style={{ marginTop: "0.5rem" }}
                                        onClick={() => addBulletToEntry("university_projects", i)}>+ Bullet</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── 6. Personal Projects ── */}
                    <div className="builder-form-block">
                        <div className="builder-section-title-row">
                            <h3>Personal Projects</h3>
                            <button className="primary-btn small-btn" onClick={() =>
                                addEntry("personal_projects", { name: "", duration: "", bullets: [""] })
                            }>+ Add</button>
                        </div>
                        {form.personal_projects.map((entry, i) => (
                            <div key={entry.id || i} className="builder-card-block" style={{ marginTop: "1rem" }}>
                                <div className="builder-card-header">
                                    <h4>Project {i + 1}</h4>
                                    <button className="danger-btn small-btn" onClick={() => removeEntry("personal_projects", i)}>Remove</button>
                                </div>
                                <div className="builder-form-grid">
                                    <div className="input-group">
                                        <label>Project Name</label>
                                        <input type="text" value={entry.name || ""}
                                            onChange={e => updateEntry("personal_projects", i, "name", e.target.value)}
                                            placeholder="Morning Messenger Bot" />
                                    </div>
                                    <div className="input-group">
                                        <label>Duration</label>
                                        <input type="text" value={entry.duration || ""}
                                            onChange={e => updateEntry("personal_projects", i, "duration", e.target.value)}
                                            placeholder="5 days" />
                                    </div>
                                </div>
                                <div style={{ marginTop: "0.75rem" }}>
                                    <label style={{ fontWeight: 600, fontSize: "0.92rem" }}>What you built</label>
                                    <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.5rem" }}>
                                        {(entry.bullets || []).map((bullet, j) => (
                                            <div key={j} style={{ display: "flex", gap: "0.5rem" }}>
                                                <input type="text" value={bullet}
                                                    onChange={e => updateBullet("personal_projects", i, j, e.target.value)}
                                                    placeholder="A Telegram bot that sends..."
                                                    style={{ flex: 1, border: "1px solid #d9e2ef", borderRadius: "0.95rem", padding: "0.65rem 1rem", font: "inherit" }} />
                                                <button className="danger-btn small-btn" onClick={() => removeBullet("personal_projects", i, j)}>×</button>
                                            </div>
                                        ))}
                                    </div>
                                    <button className="secondary-btn small-btn" style={{ marginTop: "0.5rem" }}
                                        onClick={() => addBulletToEntry("personal_projects", i)}>+ Bullet</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── 7. Soft Skills ── */}
                    <div className="builder-form-block">
                        <h3>Soft Skills</h3>
                        <div className="builder-skill-input-row">
                            <input type="text" placeholder="Problem solving, Teamwork..."
                                value={inputs.soft_skill}
                                onChange={e => setInputs(prev => ({ ...prev, soft_skill: e.target.value }))}
                                onKeyDown={e => {
                                    if (e.key === "Enter") {
                                        addToList("soft_skills", inputs.soft_skill);
                                        setInputs(prev => ({ ...prev, soft_skill: "" }));
                                    }
                                }} />
                            <button className="primary-btn" onClick={() => {
                                addToList("soft_skills", inputs.soft_skill);
                                setInputs(prev => ({ ...prev, soft_skill: "" }));
                            }}>Add</button>
                        </div>
                        <div className="builder-skill-list" style={{ marginTop: "0.75rem" }}>
                            {form.soft_skills.map((skill, i) => (
                                <div className="builder-skill-chip" key={i}>
                                    <span>{skill}</span>
                                    <button onClick={() => removeFromList("soft_skills", i)}>×</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── 8. Interests ── */}
                    <div className="builder-form-block">
                        <h3>Interests</h3>
                        <div className="builder-skill-input-row">
                            <input type="text" placeholder="Reading, Basketball, Gaming..."
                                value={inputs.interest}
                                onChange={e => setInputs(prev => ({ ...prev, interest: e.target.value }))}
                                onKeyDown={e => {
                                    if (e.key === "Enter") {
                                        addToList("interests", inputs.interest);
                                        setInputs(prev => ({ ...prev, interest: "" }));
                                    }
                                }} />
                            <button className="primary-btn" onClick={() => {
                                addToList("interests", inputs.interest);
                                setInputs(prev => ({ ...prev, interest: "" }));
                            }}>Add</button>
                        </div>
                        <div className="builder-skill-list" style={{ marginTop: "0.75rem" }}>
                            {form.interests.map((item, i) => (
                                <div className="builder-skill-chip" key={i}>
                                    <span>{item}</span>
                                    <button onClick={() => removeFromList("interests", i)}>×</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── 9. Education ── */}
                    <div className="builder-form-block">
                        <div className="builder-section-title-row">
                            <h3>Education</h3>
                            <button className="primary-btn small-btn" onClick={() =>
                                addEntry("education", { institution: "", degree: "", year: "", field: "" })
                            }>+ Add</button>
                        </div>
                        {form.education.map((entry, i) => (
                            <div key={entry.id || i} className="builder-card-block" style={{ marginTop: "1rem" }}>
                                <div className="builder-card-header">
                                    <h4>Education {i + 1}</h4>
                                    <button className="danger-btn small-btn" onClick={() => removeEntry("education", i)}>Remove</button>
                                </div>
                                <div className="builder-form-grid">
                                    <div className="input-group builder-full-width">
                                        <label>Institution</label>
                                        <input type="text" value={entry.institution || ""}
                                            onChange={e => updateEntry("education", i, "institution", e.target.value)}
                                            placeholder="University of Economics and Human Sciences in Warsaw" />
                                    </div>
                                    <div className="input-group">
                                        <label>Degree</label>
                                        <input type="text" value={entry.degree || ""}
                                            onChange={e => updateEntry("education", i, "degree", e.target.value)}
                                            placeholder="Bachelor of Computer Science" />
                                    </div>
                                    <div className="input-group">
                                        <label>Year / Status</label>
                                        <input type="text" value={entry.year || ""}
                                            onChange={e => updateEntry("education", i, "year", e.target.value)}
                                            placeholder="3rd year" />
                                    </div>
                                    <div className="input-group builder-full-width">
                                        <label>Field / Specialisation</label>
                                        <input type="text" value={entry.field || ""}
                                            onChange={e => updateEntry("education", i, "field", e.target.value)}
                                            placeholder="Artificial Intelligence" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── 10. Languages ── */}
                    <div className="builder-form-block">
                        <h3>Languages</h3>
                        <div className="builder-skill-input-row">
                            <input type="text" placeholder="English (C2), Portuguese (Native)..."
                                value={inputs.language}
                                onChange={e => setInputs(prev => ({ ...prev, language: e.target.value }))}
                                onKeyDown={e => {
                                    if (e.key === "Enter") {
                                        addToList("languages", inputs.language);
                                        setInputs(prev => ({ ...prev, language: "" }));
                                    }
                                }} />
                            <button className="primary-btn" onClick={() => {
                                addToList("languages", inputs.language);
                                setInputs(prev => ({ ...prev, language: "" }));
                            }}>Add</button>
                        </div>
                        <div className="builder-skill-list" style={{ marginTop: "0.75rem" }}>
                            {form.languages.map((lang, i) => (
                                <div className="builder-skill-chip" key={i}>
                                    <span>{lang}</span>
                                    <button onClick={() => removeFromList("languages", i)}>×</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Save button at bottom ── */}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "2rem", paddingBottom: "4rem" }}>
                        <Link to="/dashboard" className="secondary-btn nav-link-btn">
                            Back to Dashboard
                        </Link>
                        <button className="primary-btn" onClick={handleSave} disabled={saving}>
                            {saving ? "Saving..." : "Save Profile"}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Profile;