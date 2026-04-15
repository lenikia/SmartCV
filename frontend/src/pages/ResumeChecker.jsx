import { Link } from "react-router-dom";
import { useState } from "react";

function ResumeChecker() {
  const [selectedFile, setSelectedFile] = useState(null);

  const checks = [
    { label: "Formatting", status: "Strong" },
    { label: "Keyword Relevance", status: "Needs Improvement" },
    { label: "Readability", status: "Good" },
    { label: "Section Structure", status: "Strong" },
    { label: "Professional Summary", status: "Moderate" },
    { label: "Role Alignment", status: "Improving" },
  ];

  const suggestions = [
    "Add more job-specific keywords related to your target role.",
    "Rewrite some experience bullets to show stronger outcomes and results.",
    "Make your summary more focused on the exact role you are targeting.",
    "Include more technical terms when relevant to improve ATS matching.",
  ];

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file.name);
    }
  };

  return (
    <div className="checker-page">
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
            <Link to="/cv-builder" className="secondary-btn nav-link-btn">
              CV Builder
            </Link>
          </div>
        </div>
      </header>

      <main className="checker-main">
        <div className="container">
          <section className="checker-hero">
            <div>
              <span className="eyebrow">Resume Checker</span>
              <h1>Review your CV before you apply</h1>
              <p>
                Upload your resume and simulate how SmartCV could assess
                structure, readability, keyword relevance, and ATS readiness.
              </p>
            </div>

            <div className="checker-hero-actions">
              <Link to="/ats-score" className="primary-btn nav-link-btn">
              Run Resume Check
              </Link>
              <button className="secondary-btn">Compare to Job</button>
            </div>
          </section>

          <section className="checker-layout">
            <div className="checker-left-panel">
              <div className="checker-panel">
                <div className="checker-panel-header">
                  <h2>Upload Resume</h2>
                  <p>
                    Start with your current CV in PDF or DOCX format and review
                    its readiness.
                  </p>
                </div>

                <label className="upload-box">
                  <input type="file" hidden onChange={handleFileChange} />
                  <div className="upload-box-inner">
                    <h3>Drop your resume here or choose a file</h3>
                    <p>Supported formats: PDF, DOCX</p>
                    <span className="primary-btn upload-btn">Upload Resume</span>
                  </div>
                </label>

                {selectedFile && (
                  <div className="selected-file-box">
                    <strong>Selected file:</strong>
                    <span>{selectedFile}</span>
                  </div>
                )}
              </div>

              <div className="checker-panel">
                <div className="checker-panel-header">
                  <h2>Improvement Suggestions</h2>
                  <p>
                    Practical ideas to strengthen your resume before submission.
                  </p>
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
            </div>

            <div className="checker-right-panel">
              <div className="checker-score-card">
                <div className="checker-score-top">
                  <div>
                    <p className="card-label">Resume Score</p>
                    <h2>82 / 100</h2>
                  </div>
                  <div className="score-pill">Strong</div>
                </div>

                <p className="checker-score-text">
                  Your resume has a strong structure, but it could improve in
                  keyword relevance and role-specific positioning.
                </p>

                <div className="progress-group">
                  <div className="progress-row">
                    <span>ATS Compatibility</span>
                    <strong>86%</strong>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill fill-86"></div>
                  </div>
                </div>

                <div className="progress-group">
                  <div className="progress-row">
                    <span>Keyword Alignment</span>
                    <strong>74%</strong>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill fill-74"></div>
                  </div>
                </div>

                <div className="progress-group">
                  <div className="progress-row">
                    <span>Readability</span>
                    <strong>89%</strong>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill fill-89"></div>
                  </div>
                </div>
              </div>

              <div className="checker-panel">
                <div className="checker-panel-header">
                  <h2>Check Breakdown</h2>
                  <p>Key dimensions reviewed in your resume analysis.</p>
                </div>

                <div className="checker-breakdown-list">
                  {checks.map((item) => (
                    <div className="checker-breakdown-row" key={item.label}>
                      <span>{item.label}</span>
                      <strong>{item.status}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="checker-panel">
                <div className="checker-panel-header">
                  <h2>Missing or Weak Keywords</h2>
                  <p>
                    Areas that may need more role-specific terminology and
                    stronger alignment.
                  </p>
                </div>

                <div className="checker-keyword-list">
                  <span>REST API</span>
                  <span>Testing</span>
                  <span>Problem Solving</span>
                  <span>Backend Development</span>
                  <span>Documentation</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default ResumeChecker;