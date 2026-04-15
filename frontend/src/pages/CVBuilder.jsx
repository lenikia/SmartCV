import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const initialCvData = {
  personalInfo: {
    fullName: "Maria Ouana",
    professionalTitle: "Computer Science Student | AI Enthusiast",
    email: "Mariaa@example.com",
    phone: "+48 000 000 000",
    location: "Warsaw, Poland",
    linkedin: "linkedin.com/in/Maria",
    github: "github.com/Maria",
  },
  summary:
    "Motivated Computer Science student with a strong interest in Artificial Intelligence, Machine Learning, and software development. Passionate about building meaningful digital solutions and continuously improving both technical and problem-solving skills.",
  education: {
    institution: "Vizja University",
    degree: "BSc in Computer Science",
    period: "2020 - 2024",
  },
  skills: [
    "Python",
    "React",
    "JavaScript",
    "Machine Learning",
    "Git",
    "SQL",
  ],
  experience: [
    {
      id: 1,
      role: "Python Tester",
      company: "SmartCV",
      period: "2024",
      description:
        "Worked on software testing activities, validation of application behavior, and quality assurance processes.",
    },
  ],
  projects: [
    {
      id: 1,
      name: "SmartCV",
      technologies: "React, Vite, CSS",
      description:
        "A dynamic web application for creating, organizing, and customizing CVs for different professional profiles.",
    },
  ],
};

function CVBuilder() {
  const [cvData, setCvData] = useState(initialCvData);
  const [newSkill, setNewSkill] = useState("");

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
  };

  return (
    <div className="builder-page">
      <header className="dashboard-topbar">
        <div className="container dashboard-topbar-content">
          <Link to="/" className="brand auth-brand">
            <div className="brand-mark">S</div>
            <span>SmartCV</span>
          </Link>

          <div className="dashboard-topbar-actions">
            <Link to="/dashboard" className="ghost-btn nav-link-btn">
              Dashboard
            </Link>
            <button className="secondary-btn" onClick={resetForm}>
              Reset CV
            </button>
          </div>
        </div>
      </header>

      <main className="builder-main">
        <div className="container">
          <section className="builder-hero">
            <div>
              <span className="eyebrow">CV Builder</span>
              <h1>Create and refine your professional CV</h1>
              <p>
                Build, edit, and preview your resume in real time with a cleaner
                structure for future export, ATS review, and job matching.
              </p>
            </div>

            <div className="builder-hero-actions">
              <button className="primary-btn">Save Draft</button>
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
                    <input
                      type="text"
                      value={cvData.personalInfo.fullName}
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
                      onChange={(e) =>
                        handlePersonalInfoChange("github", e.target.value)
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
            </div>

            <div className="builder-preview-panel">
              <div className="builder-panel-header">
                <h2>Live CV Preview</h2>
                <p>Professional preview of the resume you are building.</p>
              </div>

              <article className="cv-preview">
                <header className="cv-header">
                  <h1>{cvData.personalInfo.fullName || "Your Name"}</h1>
                  <h2>
                    {cvData.personalInfo.professionalTitle ||
                      "Professional Title"}
                  </h2>
                  <p>{fullContactLine}</p>
                  <p>{cvData.personalInfo.linkedin}</p>
                  <p>{cvData.personalInfo.github}</p>
                </header>

                <section className="cv-section">
                  <h3>Professional Summary</h3>
                  <p>{cvData.summary}</p>
                </section>

                <section className="cv-section">
                  <h3>Education</h3>
                  <p>
                    <strong>{cvData.education.degree}</strong>
                  </p>
                  <p>{cvData.education.institution}</p>
                  <p>{cvData.education.period}</p>
                </section>

                <section className="cv-section">
                  <h3>Skills</h3>
                  <div className="preview-skill-list">
                    {cvData.skills.map((skill) => (
                      <span className="preview-skill-chip" key={skill}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>

                <section className="cv-section">
                  <h3>Experience</h3>
                  {cvData.experience.map((item) => (
                    <div className="preview-entry" key={item.id}>
                      <h4>
                        {item.role} {item.company ? `- ${item.company}` : ""}
                      </h4>
                      <p className="entry-period">{item.period}</p>
                      <p>{item.description}</p>
                    </div>
                  ))}
                </section>

                <section className="cv-section">
                  <h3>Projects</h3>
                  {cvData.projects.map((item) => (
                    <div className="preview-entry" key={item.id}>
                      <h4>{item.name}</h4>
                      <p className="entry-period">{item.technologies}</p>
                      <p>{item.description}</p>
                    </div>
                  ))}
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