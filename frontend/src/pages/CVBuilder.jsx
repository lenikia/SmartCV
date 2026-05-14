import { useMemo, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

const initialCvData = {
  personalInfo: {
    fullName: "",
    professionalTitle: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    portfolio: "",
    photoUrl: "",
    languages: [],
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
};

function CVBuilder() {
  const [cvData, setCvData] = useState(() => {
    const savedProfile = localStorage.getItem("userProfile");
    return savedProfile ? JSON.parse(savedProfile) : initialCvData;
  });
  const [newSkill, setNewSkill] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (saveMessage) {
      const timer = setTimeout(() => setSaveMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage]);

  const fullContactLine = useMemo(() => {
    const { email, phone, location } = cvData.personalInfo;
    return [email, phone, location].filter(Boolean).join(" | ");
  }, [cvData.personalInfo]);

  const handlePersonalInfoChange = (field, value) => {
    setCvData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        handlePersonalInfoChange("photoUrl", dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerPhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSummaryChange = (value) => {
    setCvData((prev) => ({
      ...prev,
      summary: value,
    }));
  };

  const handleEducationChange = (field, value) => {
    setCvData((prev) => ({
      ...prev,
      education: {
        ...prev.education,
        [field]: value,
      },
    }));
  };

  const handleExperienceChange = (id, field, value) => {
    setCvData((prev) => ({
      ...prev,
      experience: prev.experience.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleProjectChange = (id, field, value) => {
    setCvData((prev) => ({
      ...prev,
      projects: prev.projects.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addSkill = () => {
    const trimmedSkill = newSkill.trim();

    if (!trimmedSkill || cvData.skills.includes(trimmedSkill)) {
      return;
    }

    setCvData((prev) => ({
      ...prev,
      skills: [...prev.skills, trimmedSkill],
    }));

    setNewSkill("");
  };

  const removeSkill = (skillToRemove) => {
    setCvData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const addLanguage = () => {
    const trimmedLanguage = newLanguage.trim();

    if (!trimmedLanguage || cvData.personalInfo.languages.includes(trimmedLanguage)) {
      return;
    }

    setCvData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        languages: [...prev.personalInfo.languages, trimmedLanguage],
      },
    }));

    setNewLanguage("");
  };

  const removeLanguage = (languageToRemove) => {
    setCvData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        languages: prev.personalInfo.languages.filter((lang) => lang !== languageToRemove),
      },
    }));
  };

  const addExperience = () => {
    const newExperience = {
      id: Date.now(),
      role: "",
      company: "",
      period: "",
      description: "",
    };

    setCvData((prev) => ({
      ...prev,
      experience: [...prev.experience, newExperience],
    }));
  };

  const removeExperience = (id) => {
    setCvData((prev) => ({
      ...prev,
      experience: prev.experience.filter((item) => item.id !== id),
    }));
  };

  const addProject = () => {
    const newProject = {
      id: Date.now(),
      name: "",
      technologies: "",
      description: "",
    };

    setCvData((prev) => ({
      ...prev,
      projects: [...prev.projects, newProject],
    }));
  };

  const removeProject = (id) => {
    setCvData((prev) => ({
      ...prev,
      projects: prev.projects.filter((item) => item.id !== id),
    }));
  };

  const resetForm = () => {
    setCvData(initialCvData);
    setNewSkill("");
    setNewLanguage("");
  };

  const saveProfile = () => {
    if (!cvData.personalInfo.fullName.trim()) {
      setSaveMessage("error");
      alert("Please enter your full name before saving.");
      return;
    }

    localStorage.setItem("userProfile", JSON.stringify(cvData));
    
    // Verify save was successful
    const saved = JSON.parse(localStorage.getItem("userProfile") || "null");
    if (saved && saved.personalInfo.fullName === cvData.personalInfo.fullName) {
      setSaveMessage("success");
      console.log("✓ Profile saved successfully to localStorage:", saved);
      alert("Profile saved successfully!");
    } else {
      setSaveMessage("error");
      alert("Error: Profile failed to save. Please try again.");
      console.error("✗ Profile save verification failed");
    }
  };

  return (
    <div className="builder-page">
      <header className="dashboard-topbar">
        <div className="container dashboard-topbar-content">
          <Link to="/dashboard" className="brand auth-brand">
            <div className="brand-mark">S</div>
            <span className="brand-text"><span className="brand-text-main">Re</span><span className="brand-text-accent">SUME</span><span className="brand-text-main">ai</span></span>
          </Link>

          <div className="dashboard-topbar-actions">
            <Link to="/dashboard" className="ghost-btn nav-link-btn">
              Dashboard
            </Link>
            <button className="secondary-btn" onClick={resetForm}>
              Reset Profile
            </button>
          </div>
        </div>
      </header>

      <main className="builder-main">
        <div className="container">
          <section className="builder-hero">
            <div>
              <span className="eyebrow">Career Profile</span>
              <h1>Build your career profile once</h1>
              <p>
                Save your personal details, skills, experience, and portfolio so
                SmartCV can generate job-specific resumes automatically.
              </p>
            </div>

            <div className="builder-hero-actions">
              <button className="primary-btn" onClick={saveProfile}>Save Profile</button>
              {saveMessage === "success" && (
                <span className="save-status save-status-success">✓ Saved!</span>
              )}
              {saveMessage === "error" && (
                <span className="save-status save-status-error">✗ Please add your name</span>
              )}
            </div>
          </section>

          <section className="builder-layout">
            <div className="builder-editor-panel">
              <div className="builder-panel-header">
                <h2>Profile Editor</h2>
                <p>Update your career information and see the preview instantly.</p>
              </div>

              <div className="builder-form-block">
                <h3>Personal Information</h3>

                <div className="profile-avatar-container">
                  <div className="profile-avatar">
                    {cvData.personalInfo.photoUrl ? (
                      <img src={cvData.personalInfo.photoUrl} alt="Profile" />
                    ) : (
                      <div className="profile-avatar-placeholder">
                        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="50" cy="30" r="20" fill="#9ca3af" />
                          <path d="M 30 60 Q 30 45 50 45 Q 70 45 70 60 L 70 85 Q 70 95 60 95 L 40 95 Q 30 95 30 85 Z" fill="#9ca3af" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={triggerPhotoUpload}
                  >
                    Upload Photo
                  </button>
                </div>

                <div className="builder-form-grid">
                  <div className="input-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={cvData.personalInfo.fullName}
                      placeholder="e.g. Maria Ouana"
                      onChange={(e) =>
                        handlePersonalInfoChange("fullName", e.target.value)
                      }
                    />
                  </div>

                  <div className="input-group">
                    <label>Professional Title</label>
                    <input
                      type="text"
                      value={cvData.personalInfo.professionalTitle}
                      placeholder="e.g. Computer Science Student | AI Enthusiast"
                      onChange={(e) =>
                        handlePersonalInfoChange(
                          "professionalTitle",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="input-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={cvData.personalInfo.email}
                      placeholder="e.g. maria@example.com"
                      onChange={(e) =>
                        handlePersonalInfoChange("email", e.target.value)
                      }
                    />
                  </div>

                  <div className="input-group">
                    <label>Phone</label>
                    <input
                      type="text"
                      value={cvData.personalInfo.phone}
                      placeholder="e.g. +48 123 456 789"
                      onChange={(e) =>
                        handlePersonalInfoChange("phone", e.target.value)
                      }
                    />
                  </div>

                  <div className="input-group">
                    <label>Location</label>
                    <input
                      type="text"
                      value={cvData.personalInfo.location}
                      placeholder="e.g. Warsaw, Poland"
                      onChange={(e) =>
                        handlePersonalInfoChange("location", e.target.value)
                      }
                    />
                  </div>

                  <div className="input-group">
                    <label>LinkedIn</label>
                    <input
                      type="text"
                      value={cvData.personalInfo.linkedin}
                      placeholder="e.g. linkedin.com/in/maria"
                      onChange={(e) =>
                        handlePersonalInfoChange("linkedin", e.target.value)
                      }
                    />
                  </div>

                    <div className="input-group builder-full-width">
                    <label>GitHub</label>
                    <input
                      type="text"
                      value={cvData.personalInfo.github}
                      placeholder="e.g. github.com/maria"
                      onChange={(e) =>
                        handlePersonalInfoChange("github", e.target.value)
                      }
                    />
                  </div>

                  <div className="input-group">
                    <label>My Portfolio</label>
                    <input
                      type="text"
                      value={cvData.personalInfo.portfolio}
                      placeholder="e.g. portfolio.example.com"
                      onChange={(e) =>
                        handlePersonalInfoChange("portfolio", e.target.value)
                      }
                    />
                  </div>

                </div>
              </div>

              <div className="builder-form-block">
                <h3>Professional Summary</h3>

                <div className="input-group">
                  <label>Summary</label>
                  <textarea
                    rows="5"
                    value={cvData.summary}
                    placeholder="e.g. Motivated Computer Science student interested in AI, machine learning, and building practical software solutions."
                    onChange={(e) => handleSummaryChange(e.target.value)}
                  />
                </div>
              </div>

              <div className="builder-form-block">
                <h3>Education</h3>

                <div className="builder-form-grid">
                  <div className="input-group">
                    <label>Institution</label>
                    <input
                      type="text"
                      value={cvData.education.institution}
                      placeholder="e.g. Vizja University"
                      onChange={(e) =>
                        handleEducationChange("institution", e.target.value)
                      }
                    />
                  </div>

                  <div className="input-group">
                    <label>Degree</label>
                    <input
                      type="text"
                      value={cvData.education.degree}
                      placeholder="e.g. BSc in Computer Science"
                      onChange={(e) =>
                        handleEducationChange("degree", e.target.value)
                      }
                    />
                  </div>

                  <div className="input-group builder-full-width">
                    <label>Period</label>
                    <input
                      type="text"
                      value={cvData.education.period}
                      placeholder="e.g. 2020 - 2024"
                      onChange={(e) =>
                        handleEducationChange("period", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="builder-form-block">
                <h3>Skills</h3>

                <div className="builder-skill-input-row">
                  <input
                    type="text"
                    placeholder="Add a skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                  />
                  <button className="primary-btn" onClick={addSkill}>
                    Add Skill
                  </button>
                </div>

                <div className="builder-skill-list">
                  {cvData.skills.map((skill) => (
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
                  <button className="primary-btn" onClick={addExperience}>
                    Add Experience
                  </button>
                </div>

                {cvData.experience.map((item) => (
                  <div className="builder-card-block" key={item.id}>
                    <div className="builder-card-header">
                      <h4>Experience Entry</h4>
                      <button
                        className="danger-btn"
                        onClick={() => removeExperience(item.id)}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="builder-form-grid">
                      <div className="input-group">
                        <label>Role</label>
                        <input
                          type="text"
                          value={item.role}
                          placeholder="e.g. QA Tester"
                          onChange={(e) =>
                            handleExperienceChange(
                              item.id,
                              "role",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="input-group">
                        <label>Company</label>
                        <input
                          type="text"
                          value={item.company}
                          placeholder="e.g. SmartCV"
                          onChange={(e) =>
                            handleExperienceChange(
                              item.id,
                              "company",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="input-group builder-full-width">
                        <label>Period</label>
                        <input
                          type="text"
                          value={item.period}
                          placeholder="e.g. 2024"
                          onChange={(e) =>
                            handleExperienceChange(
                              item.id,
                              "period",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="input-group builder-full-width">
                        <label>Description</label>
                        <textarea
                          rows="4"
                          value={item.description}
                          placeholder="e.g. Worked on testing and quality assurance for a web application."
                          onChange={(e) =>
                            handleExperienceChange(
                              item.id,
                              "description",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="builder-form-block">
                <div className="builder-section-title-row">
                  <h3>Projects</h3>
                  <button className="primary-btn" onClick={addProject}>
                    Add Project
                  </button>
                </div>

                {cvData.projects.map((item) => (
                  <div className="builder-card-block" key={item.id}>
                    <div className="builder-card-header">
                      <h4>Project Entry</h4>
                      <button
                        className="danger-btn"
                        onClick={() => removeProject(item.id)}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="builder-form-grid">
                      <div className="input-group">
                        <label>Project Name</label>
                        <input
                          type="text"
                          value={item.name}
                          placeholder="e.g. SmartCV Resume Builder"
                          onChange={(e) =>
                            handleProjectChange(item.id, "name", e.target.value)
                          }
                        />
                      </div>

                      <div className="input-group">
                        <label>Technologies</label>
                        <input
                          type="text"
                          value={item.technologies}
                          placeholder="e.g. React, Vite, CSS"
                          onChange={(e) =>
                            handleProjectChange(
                              item.id,
                              "technologies",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="input-group builder-full-width">
                        <label>Description</label>
                        <textarea
                          rows="4"
                          value={item.description}
                          onChange={(e) =>
                            handleProjectChange(
                              item.id,
                              "description",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="builder-form-block">
                <h3>Languages</h3>

                <div className="builder-skill-input-row">
                  <input
                    type="text"
                    placeholder="Add a language"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                  />
                  <button className="primary-btn" onClick={addLanguage}>
                    Add Language
                  </button>
                </div>

                <div className="builder-skill-list">
                  {cvData.personalInfo.languages.map((language) => (
                    <div className="builder-skill-chip" key={language}>
                      <span>{language}</span>
                      <button onClick={() => removeLanguage(language)}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* PREVIEW SECTION - COMMENTED OUT FOR NOW (Can be re-enabled later) */}
            <div className="builder-preview-panel">
              <div className="builder-panel-header">
                <h2>Live CV Preview</h2>
                <p>Professional preview of the resume you are building.</p>
              </div>

              <article className="cv-preview">
                <header className="cv-header">
                  {cvData.personalInfo.photoUrl && (
                    <img
                      src={cvData.personalInfo.photoUrl}
                      alt="Profile"
                      className="cv-photo"
                    />
                  )}
                  <h1>{cvData.personalInfo.fullName || "Your Name"}</h1>
                  <h2>
                    {cvData.personalInfo.professionalTitle ||
                      "Professional Title"}
                  </h2>
                  <p>{fullContactLine}</p>
                  <p>{cvData.personalInfo.linkedin}</p>
                  <p>{cvData.personalInfo.github}</p>
                  <p>{cvData.personalInfo.portfolio}</p>
                </header>

                <section className="cv-section">
                  <h3>Professional Summary</h3>
                  <p>
                    {cvData.summary ||
                      "Add a short summary about your strengths, experience, and career goals."
                  }</p>
                </section>

                <section className="cv-section">
                  <h3>Education</h3>
                  <p>
                    <strong>{cvData.education.degree || "Degree or certification"}</strong>
                  </p>
                  <p>{cvData.education.institution || "School or university name"}</p>
                  <p>{cvData.education.period || "Year - Year"}</p>
                </section>

                <section className="cv-section">
                  <h3>Skills</h3>
                  <div className="preview-skill-list">
                    {cvData.skills.length > 0 ? (
                      cvData.skills.map((skill) => (
                        <span className="preview-skill-chip" key={skill}>
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="preview-empty">Add your skills on the left to see them here.</p>
                    )}
                  </div>
                </section>

                <section className="cv-section">
                  <h3>Languages</h3>
                  <div className="preview-skill-list">
                    {cvData.personalInfo.languages.length > 0 ? (
                      cvData.personalInfo.languages.map((language) => (
                        <span className="preview-skill-chip" key={language}>
                          {language}
                        </span>
                      ))
                    ) : (
                      <p className="preview-empty">Add languages on the left to see them here.</p>
                    )}
                  </div>
                </section>

                <section className="cv-section">
                  <h3>Experience</h3>
                  {cvData.experience.length > 0 ? (
                    cvData.experience.map((item) => (
                      <div className="preview-entry" key={item.id}>
                        <h4>
                          {item.role} {item.company ? `- ${item.company}` : ""}
                        </h4>
                        <p className="entry-period">{item.period}</p>
                        <p>{item.description}</p>
                      </div>
                    ))
                  ) : (
                    <p className="preview-empty">
                      Add experience entries on the left to see them here.
                    </p>
                  )}
                </section>

                <section className="cv-section">
                  <h3>Projects</h3>
                  {cvData.projects.length > 0 ? (
                    cvData.projects.map((item) => (
                      <div className="preview-entry" key={item.id}>
                        <h4>{item.name}</h4>
                        <p className="entry-period">{item.technologies}</p>
                        <p>{item.description}</p>
                      </div>
                    ))
                  ) : (
                    <p className="preview-empty">
                      Add projects on the left to see them here.
                    </p>
                  )}
                </section>
              </article>
            </div>
            
          </section>
        </div>
      </main>
    </div>
  );
}

export default CVBuilder;