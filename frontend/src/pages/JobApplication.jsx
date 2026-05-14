import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const templates = [
  { id: "with-photo", label: "Template A: With Photo" },
  { id: "without-photo", label: "Template B: Without Photo" },
];

function JobApplication() {
  const savedProfile = JSON.parse(localStorage.getItem("userProfile") || "null");
  const userName = savedProfile?.personalInfo?.fullName || localStorage.getItem("mockUserName") || "Profile";
  const profilePhoto = savedProfile?.personalInfo?.photoUrl || "";
  const [roleTitle, setRoleTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("without-photo");
  const [generated, setGenerated] = useState(false);
  const [savedResumeId, setSavedResumeId] = useState(null);
  const navigate = useNavigate();

  const handleGenerate = () => {
    if (!savedProfile) {
      alert("Please save your career profile first in the Profile page.");
      return;
    }

    if (!roleTitle.trim() || !jobDescription.trim()) {
      alert("Please add a role title and job description before generating.");
      return;
    }

    setGenerated(true);
    setSavedResumeId(null);
  };

  const handleSaveResume = () => {
    if (!generated) {
      alert("Generate a tailored CV first before saving.");
      return;
    }

    const userResumes = JSON.parse(localStorage.getItem("userResumes") || "[]");
    const newResume = {
      id: Date.now(),
      title: roleTitle || "Tailored Resume",
      jobTitle: roleTitle,
      jobDescription,
      template: selectedTemplate,
      profile: savedProfile,
      createdAt: new Date().toISOString(),
      lastUpdated: "Just now",
      score: Math.floor(Math.random() * 16) + 78,
      status: "Draft",
    };

    userResumes.unshift(newResume);
    localStorage.setItem("userResumes", JSON.stringify(userResumes));
    setSavedResumeId(newResume.id);
    alert("Resume saved to your dashboard.");
  };

  const openSavedResume = () => {
    if (!savedResumeId) {
      alert("Save the generated resume first before opening it.");
      return;
    }
    navigate(`/resume-checker/${savedResumeId}`);
  };

  return (
    <div className="job-application-page">
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
            <Link to="/profile" className="primary-btn nav-link-btn profile-button">
              <span className="profile-button-avatar">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" />
                ) : (
                  <span className="profile-avatar-placeholder-icon">U</span>
                )}
              </span>
              {userName}
            </Link>
          </div>
        </div>
      </header>

      <main className="builder-main">
        <div className="container">
          <section className="builder-hero">
            <div>
              <span className="eyebrow">New Job Application</span>
              <h1>Generate a tailored CV from a job description</h1>
              <p>
                Enter the role title, paste the job requirements, and choose the template that matches your next application.
              </p>
            </div>
          </section>

          <section className="builder-layout">
            <div className="builder-editor-panel">
              <div className="builder-panel-header">
                <h2>Job Details</h2>
                <p>Customize the title and role description for this application.</p>
              </div>

              <div className="builder-form-block">
                <div className="input-group">
                  <label>Role Title</label>
                  <input
                    type="text"
                    value={roleTitle}
                    placeholder="e.g. Product Manager"
                    onChange={(e) => setRoleTitle(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>Job Description</label>
                  <textarea
                    rows="8"
                    value={jobDescription}
                    placeholder="Paste the full job description or requirements here."
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>Template</label>
                  <div className="template-options">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        className={`template-option ${selectedTemplate === template.id ? "active" : ""}`}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <div className="template-card-top">
                          <span>{template.label}</span>
                          <span className="template-badge">{template.id === "with-photo" ? "Photo" : "No Photo"}</span>
                        </div>
                        <div className="template-card-preview">
                          {template.id === "with-photo" ? (
                            <div className="template-avatar-preview">
                              <div className="template-avatar-circle" />
                              <div className="template-line long-line" />
                              <div className="template-line medium-line" />
                            </div>
                          ) : (
                            <div className="template-sheet">
                              <div className="template-line long-line" />
                              <div className="template-line medium-line" />
                              <div className="template-section-block" />
                              <div className="template-section-block" />
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button className="primary-btn" onClick={handleGenerate}>
                  Generate Tailored CV
                </button>
              </div>
            </div>

            <div className="builder-preview-panel">
              <div className="builder-panel-header">
                <h2>Preview</h2>
                <p>The selected template appears here with your saved profile information.</p>
              </div>

              {generated ? (
                <div className="builder-card-block">
                  <div className="resume-summary">
                    <div>
                      <h3>{roleTitle || "Generated Role"}</h3>
                      <p className="resume-meta">Template: {selectedTemplate === "with-photo" ? "With Photo" : "Without Photo"}</p>
                    </div>
                    <span className="status-badge">Preview</span>
                  </div>

                  <div className="generated-preview-card">
                    <div className={`resume-template ${selectedTemplate}`}>
                      {selectedTemplate === "with-photo" ? (
                        savedProfile?.personalInfo?.photoUrl ? (
                          <img src={savedProfile.personalInfo.photoUrl} alt="Profile" className="cv-photo" />
                        ) : (
                          <div className="cv-photo-placeholder">
                            <span>Photo</span>
                          </div>
                        )
                      ) : null}

                      <div className="resume-header-block">
                        <p className="resume-role-title">{roleTitle || "Target Role"}</p>
                        <h3>{savedProfile?.personalInfo?.fullName || "Your Name"}</h3>
                        <p className="resume-tagline">{savedProfile?.personalInfo?.professionalTitle || "Professional Title"}</p>
                      </div>

                      <div className="resume-contact-row">
                        <span>{savedProfile?.personalInfo?.email}</span>
                        <span>{savedProfile?.personalInfo?.phone}</span>
                        <span>{savedProfile?.personalInfo?.location}</span>
                      </div>

                      {savedProfile?.personalInfo?.languages?.length > 0 && (
                        <div className="resume-section">
                          <strong>Languages</strong>
                          <div className="language-list">
                            {savedProfile.personalInfo.languages.map((language) => (
                              <span key={language}>{language}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="resume-section">
                        <strong>Summary</strong>
                        <p>{savedProfile?.summary || "Add your professional summary in the profile page."}</p>
                      </div>

                      <div className="resume-section">
                        <strong>Experience</strong>
                        <p>{savedProfile?.experience?.length > 0 ? "Use the experience entries saved in your profile." : "Add experience entries in your profile to populate this section."}</p>
                      </div>
                    </div>
                  </div>

                  <div className="preview-action-row">
                    <button className="secondary-btn" onClick={handleSaveResume}>
                      Save Resume
                    </button>
                    <button className="primary-btn" onClick={openSavedResume}>
                      Open Saved Resume
                    </button>
                  </div>
                </div>
              ) : (
                <div className="builder-card-block">
                  <h3>No CV generated yet</h3>
                  <p>Fill in the job details and click generate to see a tailored CV preview.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default JobApplication;
