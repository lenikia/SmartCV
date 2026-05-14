import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function ResumeChecker() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [profile, setProfile] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);
  const [editData, setEditData] = useState({
    title: "",
    jobTitle: "",
    jobDescription: "",
    template: "without-photo",
  });

  const userName = profile?.personalInfo?.fullName || localStorage.getItem("mockUserName") || "User";
  const profilePhoto = profile?.personalInfo?.photoUrl || "";

  const suggestions = [
    "Add more job-specific keywords related to your target role.",
    "Rewrite some experience bullets to show stronger outcomes and results.",
    "Make your summary more focused on the exact role you are targeting.",
    "Include more technical terms when relevant to improve ATS matching.",
  ];

  useEffect(() => {
    const storedResumes = JSON.parse(localStorage.getItem("userResumes") || "[]");
    const storedProfile = JSON.parse(localStorage.getItem("userProfile") || "null");

    setResumes(storedResumes);
    setProfile(storedProfile);

    if (resumeId) {
      const foundResume = storedResumes.find((resume) => String(resume.id) === resumeId);
      if (foundResume) {
        setSelectedResume(foundResume);
        setEditData({
          title: foundResume.title || "",
          jobTitle: foundResume.jobTitle || "",
          jobDescription: foundResume.jobDescription || "",
          template: foundResume.template || "without-photo",
        });
      }
    }
  }, [resumeId]);

  useEffect(() => {
    if (selectedResume) {
      setEditData({
        title: selectedResume.title || "",
        jobTitle: selectedResume.jobTitle || "",
        jobDescription: selectedResume.jobDescription || "",
        template: selectedResume.template || "without-photo",
      });
    }
  }, [selectedResume]);

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = () => {
    if (!selectedResume) {
      alert("Select a resume first to save changes.");
      return;
    }

    const updatedResume = {
      ...selectedResume,
      title: editData.title,
      jobTitle: editData.jobTitle,
      jobDescription: editData.jobDescription,
      template: editData.template,
      lastUpdated: "Just now",
    };

    const updatedResumes = resumes.map((resume) =>
      resume.id === selectedResume.id ? updatedResume : resume
    );

    localStorage.setItem("userResumes", JSON.stringify(updatedResumes));
    setResumes(updatedResumes);
    setSelectedResume(updatedResume);
    alert("Resume updated successfully.");
  };

  const handleDownloadPdf = () => {
    alert("Download PDF is not implemented yet, but this is where it would start.");
  };

  const getDisplayProfile = () => selectedResume?.profile || profile || {};

  const renderResumeSelection = () => {
    if (resumes.length === 0) {
      return (
        <div className="checker-panel">
          <div className="checker-panel-header">
            <h2>No resumes yet</h2>
            <p>Generate a tailored resume first from the Job Application page.</p>
          </div>
          <Link to="/job-application" className="primary-btn nav-link-btn">
            New Job Application
          </Link>
        </div>
      );
    }

    return (
      <div className="checker-panel">
        <div className="checker-panel-header">
          <h2>Select a Resume</h2>
          <p>Choose one of your saved resumes to review, edit, and improve.</p>
        </div>

        <div className="resume-list">
          {resumes.map((resume) => (
            <div className="resume-row" key={resume.id}>
              <div className="resume-row-main">
                <h3>{resume.title}</h3>
                <p>Last updated: {resume.lastUpdated || "Unknown"}</p>
              </div>
              <Link to={`/resume-checker/${resume.id}`} className="secondary-btn small-btn">
                Open
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const resumeProfile = getDisplayProfile();
  const displayLanguages = resumeProfile.personalInfo?.languages || [];
  const resumeScore = selectedResume?.score ?? 82;
  const scoreLabel = resumeScore >= 80 ? "Strong" : "Needs Improvement";

  return (
    <div className="checker-page">
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

      <main className="checker-main">
        <div className="container">
          <section className="checker-hero">
            <div>
              <span className="eyebrow">Resume Checker</span>
              <h1>Review and edit your saved resume</h1>
              <p>
                Select a resume from your account, see a live preview, update the job title or template, and save changes.
              </p>
            </div>

            <div className="checker-hero-actions">
              <Link to="/job-application" className="primary-btn nav-link-btn">
                New Job Application
              </Link>
              <button className="secondary-btn" onClick={() => navigate(-1)}>
                Back
              </button>
            </div>
          </section>

          <section className="checker-layout">
            <div className="checker-left-panel">
              {selectedResume ? (
                <>
                  <div className="checker-panel">
                    <div className="checker-panel-header">
                      <h2>Resume Preview</h2>
                      <p>Preview how your saved resume looks with the selected template.</p>
                    </div>

                    <div className="resume-preview-card">
                    <div className={`resume-template ${selectedResume.template}`}>
                      {selectedResume.template === "with-photo" ? (
                        resumeProfile.personalInfo?.photoUrl ? (
                          <img src={resumeProfile.personalInfo?.photoUrl} alt="Profile" className="cv-photo" />
                        ) : (
                          <div className="cv-photo-placeholder">
                            <span>Photo</span>
                          </div>
                        )
                      ) : null}

                      <div className="resume-header-block">
                        <p className="resume-role-title">{selectedResume.jobTitle || selectedResume.title}</p>
                        <h3>{resumeProfile.personalInfo?.fullName || "Your Name"}</h3>
                        <p className="resume-tagline">{resumeProfile.personalInfo?.professionalTitle || "Professional Title"}</p>
                      </div>

                      <div className="resume-contact-row">
                        <span>{resumeProfile.personalInfo?.email}</span>
                        <span>{resumeProfile.personalInfo?.phone}</span>
                        <span>{resumeProfile.personalInfo?.location}</span>
                      </div>

                      {displayLanguages.length > 0 && (
                        <div className="resume-section">
                          <strong>Languages</strong>
                          <div className="language-list">
                            {displayLanguages.map((language) => (
                              <span key={language}>{language}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="resume-section">
                        <strong>Summary</strong>
                        <p>{resumeProfile.summary || "Add your summary in the profile page."}</p>
                      </div>

                      <div className="resume-section">
                        <strong>Job Description</strong>
                        <p>{selectedResume.jobDescription || "No job description saved."}</p>
                      </div>
                    </div>
                  </div>

                  <div className="resume-detail-actions">
                    <button className="secondary-btn" onClick={handleDownloadPdf}>
                      Download PDF
                    </button>
                    <button className="primary-btn" onClick={handleSaveChanges}>
                      Save Changes
                    </button>
                  </div>
                </div>

                <div className="checker-panel">
                  <div className="checker-panel-header">
                    <h2>Resume Score</h2>
                    <p>See how this resume performs and what to improve.</p>
                  </div>

                  <div className="checker-score-card">
                    <div className="checker-score-top">
                      <div>
                        <p className="card-label">Resume Score</p>
                        <h2>{selectedResume ? `${resumeScore} / 100` : "-- / 100"}</h2>
                      </div>
                      <div className="score-pill">
                        {selectedResume ? scoreLabel : "Pending"}
                      </div>
                    </div>

                    <p className="checker-score-text">
                      {selectedResume
                        ? "This score is based on your saved resume data and profile review."
                        : "Select a resume to see the score and suggestions."}
                    </p>

                    <div className="resume-snapshot-grid">
                      <div>
                        <span className="snapshot-label">Status</span>
                        <strong>{selectedResume.status || "Draft"}</strong>
                      </div>
                      <div>
                        <span className="snapshot-label">Updated</span>
                        <strong>{selectedResume.lastUpdated || "Just now"}</strong>
                      </div>
                    </div>
                  </div>
                </div>
                </>
              ) : (
                renderResumeSelection()
              )}
            </div>

            <div className="checker-right-panel">
              {selectedResume ? (
                <>
                  <div className="checker-panel">
                    <div className="checker-panel-header">
                      <h2>Edit Resume</h2>
                      <p>Update the title, template, and job details for this saved resume.</p>
                    </div>

                    <div className="builder-form-block">
                      <div className="input-group">
                        <label>Resume Title</label>
                        <input
                          type="text"
                          value={editData.title}
                          onChange={(e) => handleEditChange("title", e.target.value)}
                        />
                      </div>

                      <div className="input-group">
                        <label>Job Title</label>
                        <input
                          type="text"
                          value={editData.jobTitle}
                          onChange={(e) => handleEditChange("jobTitle", e.target.value)}
                        />
                      </div>

                      <div className="input-group">
                        <label>Job Description</label>
                        <textarea
                          rows="5"
                          value={editData.jobDescription}
                          onChange={(e) => handleEditChange("jobDescription", e.target.value)}
                        />
                      </div>

                      <div className="input-group">
                        <label>Template</label>
                        <div className="template-options">
                          {[
                            { id: "with-photo", label: "With Photo" },
                            { id: "without-photo", label: "Without Photo" },
                          ].map((option) => (
                            <button
                              key={option.id}
                              type="button"
                              className={`template-option ${editData.template === option.id ? "active" : ""}`}
                              onClick={() => handleEditChange("template", option.id)}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="checker-panel">
                    <div className="checker-panel-header">
                      <h2>Improvement Suggestions</h2>
                      <p>Practical ideas to strengthen this resume before submission.</p>
                    </div>

                    <div className="checker-suggestion-list">
                      {suggestions.map((item, index) => (
                        <div className="checker-suggestion-item" key={index}>
                          <strong>Suggestion {index + 1}</strong>
                          <p>{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="checker-panel checker-stats-panel">
                  <div className="checker-panel-header">
                    <h2>Resume Summary</h2>
                    <p>Key metrics for your resume library.</p>
                  </div>

                  <div className="stats-list">
                    <div className="stats-card">
                      <p>Total Resumes</p>
                      <h3>{resumes.length}</h3>
                    </div>
                    <div className="stats-card">
                      <p>Average ATS Score</p>
                      <h3>{resumes.length > 0 ? `${Math.round(resumes.reduce((sum, resume) => sum + (resume.score || 0), 0) / resumes.length)}%` : "-"}</h3>
                    </div>
                    <div className="stats-card">
                      <p>Suggested Improvements</p>
                      <h3>{resumes.length > 0 ? Math.max(3, Math.round(resumes.length * 2)) : "-"}</h3>
                    </div>
                  </div>

                  <div className="checker-panel-footer">
                    <p>Choose a saved resume from the left to edit and preview it here.</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default ResumeChecker;