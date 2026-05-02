import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getCV, updateCV } from "../api/cv";

function CVBuilder() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const cvId = searchParams.get("id");

    const [cvData, setCvData] = useState({
        title: "My CV",
        template: "minimal",
        personalInfo: {
            fullName: "",
            professional_title: "",
            email: "",
            phone: "",
            location: "",
            linkedin: "",
            github: "",
        },
        summary: "",
        education: {
            institution: "",
            degree: "",
            period: "",
        },
        skills: [],
        experience: [],
        projects: [],
    });

    const [newSkill, setNewSkill] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/signin");
            return;
        }

        if (!cvId) {
            setLoading(false);
            return;
        }

        getCV(cvId)
            .then(cv => {
                const personal = cv.personal_info || {};
                setCvData({
                    title: cv.title || "My CV",
                    template: cv.template || "minimal",
                    personalInfo: {
                        fullName: personal.full_name || "",
                        professionalTitle: personal.professional_title || "",
                        email: personal.email || "",
                        phone: personal.phone || "",
                        location: personal.location || "",
                        linkedin: personal.linkedin || "",
                        github: personal.github || "",
                    },
                    summary: cv.summary || "",
                    education: cv.education || { institution: "", degree: "", period: "" },
                    skills: cv.skills || [],
                    experience: cv.experience || [],
                    projects: cv.projects || [],
                });
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [cvId, navigate]);

    const fullContactLine = useMemo(() => {
        const { email, phone, location } = cvData.personalInfo;
        return [email, phone, location].filter(Boolean).join(" | ");
    }, [cvData.personalInfo]);

    const handlePersonalInfoChange = (field, value) => {
        setCvData(prev => ({ ...prev, personalInfo: { ...prev.personalInfo, [field]: value } }));
    };

    const handleEducationChange = (field, value) => {
        setCvData(prev => ({ ...prev, education: { ...prev.education, [field]: value } }));
    };

    const handleExperienceChange = (id, field, value) => {
        setCvData(prev => ({
            ...prev,
            experience: prev.experience.map(item => item.id === id ? { ...item, [field]: value } : item)
        }));
    };

    const handleProjectChange = (id, field, value) => {
        setCvData(prev => ({
            ...prev,
            projects: prev.projects.map(item => item.id === id ? { ...item, [field]: value } : item)
        }));
    };

    const addSkill = () => {
        const trimmed = newSkill.trim();
        if (!trimmed || cvData.skills.includes(trimmed)) return;
        setCvData(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
        setNewSkill("");
    };

    const removeSkill = (skill) => {
        setCvData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
    };

    const addExperience = () => {
        setCvData(prev => ({
            ...prev,
            experience: [...prev.experience, { id: Date.now(), role: "", company: "", period: "", description: "" }]
        }));
    };

    const removeExperience = (id) => {
        setCvData(prev => ({ ...prev, experience: prev.experience.filter(item => item.id !== id) }));
    };

    const addProject = () => {
        setCvData(prev => ({
            ...prev,
            projects: [...prev.projects, { id: Date.now(), name: "", technologies: "", description: "" }]
        }));
    };

    const removeProject = (id) => {
        setCvData(prev => ({ ...prev, projects: prev.projects.filter(item => item.id !== id) }));
    };

    const handleSave = async () => {
        if (!cvId) return;
        setSaving(true);
        setSaveSuccess(false);
        try {
            await updateCV(cvId, cvData);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="builder-page">
                <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
                    <p>Loading CV...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="builder-page">
            <header className="dashboard-topbar">
                <div className="container dashboard-topbar-content">
                    <Link to="/" className="brand auth-brand">
                        <div className="brand-mark">S</div>
                        <span>SmartCV</span>
                    </Link>
                    <div className="dashboard-topbar-actions">
                        <Link to="/dashboard" className="ghost-btn nav-link-btn">Dashboard</Link>
                        {saveSuccess && (
                            <span style={{ color: "#166534", fontWeight: 600, fontSize: "0.92rem" }}>✓ Saved</span>
                        )}
                        <button className="primary-btn" onClick={handleSave} disabled={saving || !cvId}>
                            {saving ? "Saving..." : "Save Draft"}
                        </button>
                    </div>
                </div>
            </header>

            <main className="builder-main">
                <div className="container">
                    {error && <p className="auth-error" style={{ marginBottom: "1rem" }}>{error}</p>}

                    <section className="builder-hero">
                        <div>
                            <span className="eyebrow">CV Builder</span>
                            <h1>{cvData.title}</h1>
                            <p>Edit your CV in real time. Changes are saved when you click Save Draft.</p>
                        </div>
                        <div className="builder-hero-actions">
                            <button className="secondary-btn">Generate PDF</button>
                        </div>
                    </section>

                    <section className="builder-layout">
                        <div className="builder-editor-panel">
                            <div className="builder-panel-header">
                                <h2>CV Editor</h2>
                                <p>Update your information and see the preview instantly.</p>
                            </div>

                            <div className="builder-form-block">
                                <h3>Personal Information</h3>
                                <div className="builder-form-grid">
                                    <div className="input-group">
                                        <label>Full Name</label>
                                        <input type="text" value={cvData.personalInfo.fullName}
                                            onChange={e => handlePersonalInfoChange("fullName", e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label>Professional Title</label>
                                        <input type="text" value={cvData.personalInfo.professionalTitle}
                                            onChange={e => handlePersonalInfoChange("professionalTitle", e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label>Email</label>
                                        <input type="email" value={cvData.personalInfo.email}
                                            onChange={e => handlePersonalInfoChange("email", e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label>Phone</label>
                                        <input type="text" value={cvData.personalInfo.phone}
                                            onChange={e => handlePersonalInfoChange("phone", e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label>Location</label>
                                        <input type="text" value={cvData.personalInfo.location}
                                            onChange={e => handlePersonalInfoChange("location", e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label>LinkedIn</label>
                                        <input type="text" value={cvData.personalInfo.linkedin}
                                            onChange={e => handlePersonalInfoChange("linkedin", e.target.value)} />
                                    </div>
                                    <div className="input-group builder-full-width">
                                        <label>GitHub</label>
                                        <input type="text" value={cvData.personalInfo.github}
                                            onChange={e => handlePersonalInfoChange("github", e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <div className="builder-form-block">
                                <h3>Professional Summary</h3>
                                <div className="input-group">
                                    <label>Summary</label>
                                    <textarea rows="5" value={cvData.summary}
                                        onChange={e => setCvData(prev => ({ ...prev, summary: e.target.value }))} />
                                </div>
                            </div>

                            <div className="builder-form-block">
                                <h3>Education</h3>
                                <div className="builder-form-grid">
                                    <div className="input-group">
                                        <label>Institution</label>
                                        <input type="text" value={cvData.education?.institution || ""}
                                            onChange={e => handleEducationChange("institution", e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label>Degree</label>
                                        <input type="text" value={cvData.education?.degree || ""}
                                            onChange={e => handleEducationChange("degree", e.target.value)} />
                                    </div>
                                    <div className="input-group builder-full-width">
                                        <label>Period</label>
                                        <input type="text" value={cvData.education?.period || ""}
                                            onChange={e => handleEducationChange("period", e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <div className="builder-form-block">
                                <h3>Skills</h3>
                                <div className="builder-skill-input-row">
                                    <input type="text" placeholder="Add a skill" value={newSkill}
                                        onChange={e => setNewSkill(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && addSkill()} />
                                    <button className="primary-btn" onClick={addSkill}>Add</button>
                                </div>
                                <div className="builder-skill-list">
                                    {cvData.skills.map(skill => (
                                        <div className="builder-skill-chip" key={skill}>
                                            <span>{skill}</span>
                                            <button onClick={() => removeSkill(skill)}>×</button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="builder-form-block">
                                <div className="builder-section-title-row">
                                    <h3>Experience</h3>
                                    <button className="primary-btn" onClick={addExperience}>Add</button>
                                </div>
                                {cvData.experience.map(item => (
                                    <div className="builder-card-block" key={item.id}>
                                        <div className="builder-card-header">
                                            <h4>Experience Entry</h4>
                                            <button className="danger-btn" onClick={() => removeExperience(item.id)}>Remove</button>
                                        </div>
                                        <div className="builder-form-grid">
                                            <div className="input-group">
                                                <label>Role</label>
                                                <input type="text" value={item.role}
                                                    onChange={e => handleExperienceChange(item.id, "role", e.target.value)} />
                                            </div>
                                            <div className="input-group">
                                                <label>Company</label>
                                                <input type="text" value={item.company}
                                                    onChange={e => handleExperienceChange(item.id, "company", e.target.value)} />
                                            </div>
                                            <div className="input-group builder-full-width">
                                                <label>Period</label>
                                                <input type="text" value={item.period}
                                                    onChange={e => handleExperienceChange(item.id, "period", e.target.value)} />
                                            </div>
                                            <div className="input-group builder-full-width">
                                                <label>Description</label>
                                                <textarea rows="4" value={item.description}
                                                    onChange={e => handleExperienceChange(item.id, "description", e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="builder-form-block">
                                <div className="builder-section-title-row">
                                    <h3>Projects</h3>
                                    <button className="primary-btn" onClick={addProject}>Add</button>
                                </div>
                                {cvData.projects.map(item => (
                                    <div className="builder-card-block" key={item.id}>
                                        <div className="builder-card-header">
                                            <h4>Project Entry</h4>
                                            <button className="danger-btn" onClick={() => removeProject(item.id)}>Remove</button>
                                        </div>
                                        <div className="builder-form-grid">
                                            <div className="input-group">
                                                <label>Project Name</label>
                                                <input type="text" value={item.name}
                                                    onChange={e => handleProjectChange(item.id, "name", e.target.value)} />
                                            </div>
                                            <div className="input-group">
                                                <label>Technologies</label>
                                                <input type="text" value={item.technologies}
                                                    onChange={e => handleProjectChange(item.id, "technologies", e.target.value)} />
                                            </div>
                                            <div className="input-group builder-full-width">
                                                <label>Description</label>
                                                <textarea rows="4" value={item.description}
                                                    onChange={e => handleProjectChange(item.id, "description", e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="builder-preview-panel">
                            <div className="builder-panel-header">
                                <h2>Live CV Preview</h2>
                                <p>Professional preview of the resume you are building.</p>
                            </div>

                            <article className="cv-preview">
                                <header className="cv-header">
                                    <h1>{cvData.personalInfo.fullName || "Your Name"}</h1>
                                    <h2>{cvData.personalInfo.professionalTitle || "Professional Title"}</h2>
                                    <p>{fullContactLine}</p>
                                    {cvData.personalInfo.linkedin && <p>{cvData.personalInfo.linkedin}</p>}
                                    {cvData.personalInfo.github && <p>{cvData.personalInfo.github}</p>}
                                </header>

                                {cvData.summary && (
                                    <section className="cv-section">
                                        <h3>Professional Summary</h3>
                                        <p>{cvData.summary}</p>
                                    </section>
                                )}

                                {(cvData.education?.institution || cvData.education?.degree) && (
                                    <section className="cv-section">
                                        <h3>Education</h3>
                                        <p><strong>{cvData.education.degree}</strong></p>
                                        <p>{cvData.education.institution}</p>
                                        <p>{cvData.education.period}</p>
                                    </section>
                                )}

                                {cvData.skills.length > 0 && (
                                    <section className="cv-section">
                                        <h3>Skills</h3>
                                        <div className="preview-skill-list">
                                            {cvData.skills.map(skill => (
                                                <span className="preview-skill-chip" key={skill}>{skill}</span>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {cvData.experience.length > 0 && (
                                    <section className="cv-section">
                                        <h3>Experience</h3>
                                        {cvData.experience.map(item => (
                                            <div className="preview-entry" key={item.id}>
                                                <h4>{item.role}{item.company ? ` — ${item.company}` : ""}</h4>
                                                <p className="entry-period">{item.period}</p>
                                                <p>{item.description}</p>
                                            </div>
                                        ))}
                                    </section>
                                )}

                                {cvData.projects.length > 0 && (
                                    <section className="cv-section">
                                        <h3>Projects</h3>
                                        {cvData.projects.map(item => (
                                            <div className="preview-entry" key={item.id}>
                                                <h4>{item.name}</h4>
                                                <p className="entry-period">{item.technologies}</p>
                                                <p>{item.description}</p>
                                            </div>
                                        ))}
                                    </section>
                                )}
                            </article>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default CVBuilder;