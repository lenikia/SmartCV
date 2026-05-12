import { Link } from "react-router-dom";

function ATSScore() {
  const strengths = [
    "Clear section structure",
    "Good readability",
    "Consistent experience formatting",
    "Relevant technical stack included",
  ];

  const weaknesses = [
    "Some role-specific keywords are missing",
    "Professional summary could be more targeted",
    "A few bullet points are too generic",
    "Job alignment is not yet strong enough",
  ];

  const missingKeywords = [
    "REST API",
    "Unit Testing",
    "Problem Solving",
    "System Design",
    "Documentation",
  ];

  const recommendations = [
    "Rewrite the professional summary to match the target role more closely.",
    "Add stronger action verbs and measurable impact to project and experience descriptions.",
    "Include missing backend and software engineering keywords where genuinely relevant.",
    "Tailor the CV to the target vacancy instead of using one generic version.",
  ];

  return (
    <div className="ats-page">
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
            <Link to="/resume-checker" className="secondary-btn nav-link-btn">
              Resume Checker
            </Link>
          </div>
        </div>
      </header>

      <main className="ats-main">
        <div className="container">
          <section className="ats-hero">
            <div>
              <span className="eyebrow">ATS Score Result</span>
              <h1>Understand how your resume performs</h1>
              <p>
                This page gives a more detailed breakdown of how your CV may
                perform in an ATS-focused review, including structure, keyword
                relevance, readability, and overall job alignment.
              </p>
            </div>

            <div className="ats-hero-actions">
              <Link to="/cv-builder" className="secondary-btn nav-link-btn">
                Edit Resume
              </Link>
              <Link to="/resume-checker" className="primary-btn nav-link-btn">
                Re-run Analysis
              </Link>
            </div>
          </section>

          <section className="ats-top-grid">
            <div className="ats-score-card">
              <p className="card-label">Overall ATS Score</p>
              <div className="ats-score-number">82</div>
              <span className="ats-score-status">Strong</span>
              <p className="ats-score-description">
                Your resume has a solid structure and good readability, but it
                can still improve in keyword alignment and role targeting.
              </p>
            </div>

            <div className="ats-summary-card">
              <h2>Score Summary</h2>

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

              <div className="progress-group">
                <div className="progress-row">
                  <span>Role Alignment</span>
                  <strong>78%</strong>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill fill-78"></div>
                </div>
              </div>
            </div>
          </section>

          <section className="ats-grid">
            <div className="ats-panel">
              <div className="ats-panel-header">
                <h2>What is working well</h2>
                <p>Strong points in your current resume.</p>
              </div>

              <div className="ats-list">
                {strengths.map((item) => (
                  <div className="ats-list-item good-item" key={item}>
                    <strong>{item}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="ats-panel">
              <div className="ats-panel-header">
                <h2>What needs improvement</h2>
                <p>Areas reducing overall ATS effectiveness.</p>
              </div>

              <div className="ats-list">
                {weaknesses.map((item) => (
                  <div className="ats-list-item weak-item" key={item}>
                    <strong>{item}</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="ats-grid lower-ats-grid">
            <div className="ats-panel">
              <div className="ats-panel-header">
                <h2>Missing or weak keywords</h2>
                <p>
                  These terms may help improve role-specific alignment when
                  genuinely relevant to your profile.
                </p>
              </div>

              <div className="ats-keyword-list">
                {missingKeywords.map((keyword) => (
                  <span key={keyword}>{keyword}</span>
                ))}
              </div>
            </div>

            <div className="ats-panel">
              <div className="ats-panel-header">
                <h2>Recommended next steps</h2>
                <p>Practical actions to improve your resume score.</p>
              </div>

              <div className="ats-recommendation-list">
                {recommendations.map((item, index) => (
                  <div className="ats-recommendation-item" key={index}>
                    <span className="ats-step-badge">{index + 1}</span>
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="ats-final-cta">
            <div className="ats-final-card">
              <div>
                <span className="eyebrow">Next Step</span>
                <h2>Refine your CV and improve your next application</h2>
                <p>
                  Use the builder to revise weak sections, add missing keywords,
                  and create a stronger version tailored to your target role.
                </p>
              </div>

              <div className="ats-final-actions">
                <Link to="/cv-builder" className="primary-btn nav-link-btn">
                  Go to CV Builder
                </Link>
                <Link to="/dashboard" className="secondary-btn nav-link-btn">
                  Back to Dashboard
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default ATSScore;