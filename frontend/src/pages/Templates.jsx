import { Link } from "react-router-dom";

function Templates() {
  const templates = [
    {
      id: 1,
      name: "Modern Professional",
      category: "General",
      description:
        "A clean and balanced template for students, graduates, and professionals applying to modern companies.",
      tags: ["ATS-Friendly", "Clean Layout", "Versatile"],
    },
    {
      id: 2,
      name: "Tech Minimal",
      category: "Technology",
      description:
        "A focused template designed for software, data, and engineering roles with strong readability and structure.",
      tags: ["Tech Roles", "Structured", "Minimal"],
    },
    {
      id: 3,
      name: "Graduate Starter",
      category: "Entry-Level",
      description:
        "A simple and effective template for recent graduates who want to highlight education, projects, and skills.",
      tags: ["Student", "Projects", "Beginner Friendly"],
    },
    {
      id: 4,
      name: "Executive Focus",
      category: "Leadership",
      description:
        "A more formal template for experienced professionals who need a stronger emphasis on impact and leadership.",
      tags: ["Senior Level", "Formal", "Leadership"],
    },
    {
      id: 5,
      name: "Creative Edge",
      category: "Creative",
      description:
        "A polished design for users who want a slightly more visual presentation while keeping content professional.",
      tags: ["Design", "Creative", "Modern"],
    },
    {
      id: 6,
      name: "Compact ATS",
      category: "ATS",
      description:
        "A highly readable and efficient template optimized for strong ATS compatibility and concise communication.",
      tags: ["ATS First", "Compact", "Readable"],
    },
  ];

  return (
    <div className="templates-page">
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

      <main className="templates-main">
        <div className="container">
          <section className="templates-hero">
            <div>
              <span className="eyebrow">Resume Templates</span>
              <h1>Choose a template that fits your professional story</h1>
              <p>
                Explore polished resume layouts designed for different goals,
                industries, and professional stages. SmartCV templates aim to
                balance clarity, readability, and strong presentation.
              </p>
            </div>

            <div className="templates-hero-actions">
              <Link to="/cv-builder" className="primary-btn nav-link-btn">
                Start Building
              </Link>
              <Link to="/resume-checker" className="secondary-btn nav-link-btn">
                Check Existing Resume
              </Link>
            </div>
          </section>

          <section className="templates-filter-bar">
            <div className="template-filter-chip active-chip">All Templates</div>
            <div className="template-filter-chip">ATS-Friendly</div>
            <div className="template-filter-chip">Tech</div>
            <div className="template-filter-chip">Students</div>
            <div className="template-filter-chip">Creative</div>
            <div className="template-filter-chip">Executive</div>
          </section>

          <section className="templates-grid">
            {templates.map((template) => (
              <article className="template-card" key={template.id}>
                <div className="template-preview">
                  <div className="template-sheet">
                    <div className="template-sheet-header"></div>
                    <div className="template-line long-line"></div>
                    <div className="template-line medium-line"></div>
                    <div className="template-section-block"></div>
                    <div className="template-line short-line"></div>
                    <div className="template-section-block"></div>
                  </div>
                </div>

                <div className="template-card-body">
                  <div className="template-card-top">
                    <div>
                      <p className="template-category">{template.category}</p>
                      <h2>{template.name}</h2>
                    </div>
                    <span className="template-badge">Template</span>
                  </div>

                  <p className="template-description">{template.description}</p>

                  <div className="template-tags">
                    {template.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>

                  <div className="template-card-actions">
                    <button className="primary-btn">Use Template</button>
                    <button className="secondary-btn">Preview</button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <section className="templates-info-grid">
            <div className="templates-info-card">
              <h3>Why templates matter</h3>
              <p>
                The right template helps your resume feel clearer, more
                structured, and more aligned with the expectations of recruiters
                and ATS systems.
              </p>
            </div>

            <div className="templates-info-card">
              <h3>ATS-first design</h3>
              <p>
                SmartCV templates prioritize readability, clean hierarchy, and
                strong layout foundations to support better automated parsing.
              </p>
            </div>

            <div className="templates-info-card">
              <h3>Choose based on your goal</h3>
              <p>
                Students, developers, analysts, creatives, and experienced
                professionals often benefit from different visual priorities.
              </p>
            </div>
          </section>

          <section className="templates-final-cta">
            <div className="templates-final-card">
              <div>
                <span className="eyebrow">Next Step</span>
                <h2>Pick a template and start refining your CV</h2>
                <p>
                  Once you choose a layout, you can continue building your
                  resume, improving content quality, and preparing for ATS
                  analysis.
                </p>
              </div>

              <div className="templates-final-actions">
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

export default Templates;