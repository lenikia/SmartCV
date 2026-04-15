import { Link } from "react-router-dom";

function Dashboard() {
  const userName = localStorage.getItem("mockUserName") || "User";

  const mockResumes = [
    {
      id: 1,
      title: "Software Engineer Resume",
      lastUpdated: "2 days ago",
      score: 82,
      status: "Strong",
    },
    {
      id: 2,
      title: "Data Analyst Resume",
      lastUpdated: "5 days ago",
      score: 74,
      status: "Needs Improvement",
    },
    {
      id: 3,
      title: "Machine Learning Resume",
      lastUpdated: "1 week ago",
      score: 89,
      status: "Excellent",
    },
  ];

  return (
    <div className="dashboard-page">
      <header className="dashboard-topbar">
        <div className="container dashboard-topbar-content">
          <Link to="/" className="brand auth-brand">
            <div className="brand-mark">S</div>
            <span>SmartCV</span>
          </Link>

          <div className="dashboard-topbar-actions">
            <Link to="/" className="ghost-btn nav-link-btn">
              Home
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
                Manage your resumes, track ATS performance, and continue
                improving your job application materials.
              </p>
            </div>

            <div className="dashboard-hero-actions">
              <Link to="/cv-builder" className="primary-btn nav-link-btn">
              Create New Resume
              </Link>
              <Link to="/resume-checker" className="secondary-btn nav-link-btn">
              Run ATS Check
              </Link>
            </div>
          </section>

          <section className="dashboard-stats">
            <div className="dashboard-stat-card">
              <p>Total Resumes</p>
              <h3>3</h3>
              <span>Across multiple target roles</span>
            </div>

            <div className="dashboard-stat-card">
              <p>Average ATS Score</p>
              <h3>81%</h3>
              <span>Good overall resume quality</span>
            </div>

            <div className="dashboard-stat-card">
              <p>Suggested Improvements</p>
              <h3>12</h3>
              <span>Across summaries, keywords, and structure</span>
            </div>

            <div className="dashboard-stat-card">
              <p>Job Match Ready</p>
              <h3>2</h3>
              <span>Resumes ready for role targeting</span>
            </div>
          </section>

          <section className="dashboard-grid">
            <div className="dashboard-panel large-panel">
              <div className="dashboard-panel-header">
                <div>
                  <h2>My Resumes</h2>
                  <p>Track your current resume versions and their performance.</p>
                </div>
                <button className="ghost-btn">View All</button>
              </div>

              <div className="resume-list">
                {mockResumes.map((resume) => (
                  <div className="resume-row" key={resume.id}>
                    <div className="resume-row-main">
                      <h3>{resume.title}</h3>
                      <p>Last updated: {resume.lastUpdated}</p>
                    </div>

                    <div className="resume-row-meta">
                      <span className="score-badge">{resume.score}%</span>
                      <span className="status-text">{resume.status}</span>
                      <button className="secondary-btn small-btn">Open</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-panel side-panel">
              <div className="dashboard-panel-header">
                <div>
                  <h2>Quick Actions</h2>
                  <p>Move faster through your workflow.</p>
                </div>
              </div>

              <div className="quick-actions">
                <button className="primary-btn">Create Resume</button>
                <Link to="/resume-checker" className="secondary-btn nav-link-btn">
                Check ATS Score
                </Link>
                <button className="secondary-btn">Match to Job</button>
                <button className="secondary-btn">View Suggestions</button>
              </div>
            </div>
          </section>

          <section className="dashboard-grid lower-grid">
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
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;