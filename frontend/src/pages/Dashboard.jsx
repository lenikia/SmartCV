import { Link } from "react-router-dom";

function Dashboard() {
  const savedProfile = JSON.parse(localStorage.getItem("userProfile") || "null");
  const userName = savedProfile?.personalInfo?.fullName || localStorage.getItem("mockUserName") || "User";
  const profilePhoto = savedProfile?.personalInfo?.photoUrl || "";

  // Get user's created CVs from localStorage (empty by default for new users)
  const userResumes = JSON.parse(localStorage.getItem("userResumes") || "[]");

  // Calculate stats based on actual resume data
  const totalResumes = userResumes.length;
  const averageScore = totalResumes > 0
    ? Math.round(userResumes.reduce((sum, resume) => sum + (resume.score || 0), 0) / totalResumes)
    : 0;
  const jobMatchReady = totalResumes > 0 ? Math.round((userResumes.filter(r => r.score >= 80).length / totalResumes) * 100) : 0;

  return (
    <div className="dashboard-page">
      <header className="dashboard-topbar">
        <div className="container dashboard-topbar-content">
          <Link to="/dashboard" className="brand auth-brand">
            <div className="brand-mark">S</div>
            <span className="brand-text"><span className="brand-text-main">Re</span><span className="brand-text-accent">SUME</span><span className="brand-text-main">ai</span></span>
          </Link>

          <div className="dashboard-topbar-actions">
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
            <button
              className="secondary-btn"
              onClick={() => {
                localStorage.removeItem("mockAuth");
                localStorage.removeItem("mockUserName");
                localStorage.removeItem("mockUserEmail");
                window.location.href = "/";
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="container">
          <section className="dashboard-hero">
            <div>
              <span className="eyebrow">Dashboard</span>
              <h1>Welcome back, {userName}</h1>
              <p>
                Manage your career profile, generate tailored CVs from job
                descriptions, and track ATS performance in one place.
              </p>
            </div>
          </section>

          <section className="dashboard-stats centered-stats">
            <div className="dashboard-stat-card">
              <p>Total Resumes</p>
              <h3>{totalResumes}</h3>
              <span>{totalResumes === 0 ? "Start by creating your first resume" : `${totalResumes} resume${totalResumes > 1 ? 's' : ''} created`}</span>
            </div>

            <div className="dashboard-stat-card">
              <p>Average ATS Score</p>
              <h3>{totalResumes > 0 ? `${averageScore}%` : "-"}</h3>
              <span>{totalResumes > 0 ? "Based on your resume quality" : "Create a resume to see your score"}</span>
            </div>

            <div className="dashboard-stat-card">
              <p>Suggested Improvements</p>
              <h3>{totalResumes > 0 ? "12" : "-"}</h3>
              <span>{totalResumes > 0 ? "Across summaries, keywords, and structure" : "Improvements will appear after creating CVs"}</span>
            </div>
          </section>

          <section className="dashboard-grid">
            <div className="dashboard-panel large-panel">
              <div className="dashboard-panel-header">
                <div>
                  <h2>My Resumes</h2>
                  <p>{totalResumes > 0 ? "Track your current resume versions and their performance." : "You haven't created any resumes yet."}</p>
                </div>
                {totalResumes > 0 && (
                  <Link to="/resume-checker" className="ghost-btn nav-link-btn">
                    View All
                  </Link>
                )}
              </div>

              {totalResumes > 0 ? (
                <div className="resume-list">
                  {userResumes.map((resume) => (
                    <div className="resume-row" key={resume.id}>
                      <div className="resume-row-main">
                        <h3>{resume.title}</h3>
                        <p>Last updated: {resume.lastUpdated}</p>
                      </div>

                      <div className="resume-row-meta">
                        <span className="score-badge">{resume.score}%</span>
                        <span className="status-text">{resume.status}</span>
                        <Link to={`/resume-checker/${resume.id}`} className="secondary-btn small-btn">
                        Open
                      </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-content">
                    <h3>Ready to complete your career profile?</h3>
                    <p>
                      Start by saving your personal and professional details,
                      then upload a job description to generate a tailored CV.
                    </p>
                    <div className="empty-state-actions">
                      <Link to="/profile" className="primary-btn nav-link-btn">
                        Complete Profile
                      </Link>
                      <Link to="/job-application" className="secondary-btn nav-link-btn">
                        New Job Application
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {totalResumes > 0 && (
              <div className="dashboard-panel side-panel">
                <div className="dashboard-panel-header">
                  <div>
                    <h2>Quick Actions</h2>
                    <p>Move faster through your workflow.</p>
                  </div>
                </div>

                <div className="quick-actions">
                  <Link to="/job-application" className="primary-btn nav-link-btn">
                    New Job Application
                  </Link>
                  <Link to="/resume-checker" className="secondary-btn nav-link-btn">
                    Check ATS Score
                  </Link>
                </div>
              </div>
            )}
          </section>

          <section className="dashboard-grid lower-grid">
            {totalResumes > 0 ? (
              <>
                <div className="dashboard-panel">
                  <div className="dashboard-panel-header">
                    <div>
                      <h2>Recent Suggestions</h2>
                      <p>Priority recommendations for improvement.</p>
                    </div>
                  </div>

                  <div className="suggestion-list">
                    <div className="suggestion-item">
                      <strong>Improve summary clarity</strong>
                      <p>
                        Make your professional summary more role-specific and
                        results-oriented.
                      </p>
                    </div>

                    <div className="suggestion-item">
                      <strong>Add missing backend keywords</strong>
                      <p>
                        Include terms such as REST API, testing, and database design
                        for better alignment.
                      </p>
                    </div>

                    <div className="suggestion-item">
                      <strong>Strengthen project descriptions</strong>
                      <p>
                        Focus more on impact, technologies used, and concrete
                        outcomes.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="dashboard-panel">
                  <div className="dashboard-panel-header">
                    <div>
                      <h2>Application Readiness</h2>
                      <p>Current snapshot of your profile quality.</p>
                    </div>
                  </div>

                  <div className="readiness-list">
                    <div className="readiness-row">
                      <span>Formatting</span>
                      <strong>Strong</strong>
                    </div>
                    <div className="readiness-row">
                      <span>Keywords</span>
                      <strong>Moderate</strong>
                    </div>
                    <div className="readiness-row">
                      <span>Readability</span>
                      <strong>Strong</strong>
                    </div>
                    <div className="readiness-row">
                      <span>Role Alignment</span>
                      <strong>Improving</strong>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="dashboard-panel full-width">
                <div className="dashboard-panel-header">
                  <div>
                    <h2>Get Started with SmartCV</h2>
                    <p>Here's what you can do to build a standout resume.</p>
                  </div>
                </div>

                <div className="getting-started-grid">
                  <div className="getting-started-card">
                    <h3>📝 Create Your Resume</h3>
                    <p>Use our CV builder to create a professional resume with real-time preview and ATS optimization.</p>
                    <Link to="/cv-builder" className="primary-btn nav-link-btn">Start Building</Link>
                  </div>

                  <div className="getting-started-card">
                    <h3>🎯 Check ATS Score</h3>
                    <p>Upload your existing resume or use our builder to get an ATS compatibility score.</p>
                    <Link to="/resume-checker" className="secondary-btn nav-link-btn">Check Score</Link>
                  </div>

                  <div className="getting-started-card">
                    <h3>📊 Track Progress</h3>
                    <p>Monitor your resume's performance and get personalized suggestions for improvement.</p>
                    <span className="coming-soon">Coming Soon</span>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;