import { Link } from "react-router-dom";

function About() {
  return (
    <div className="about-page">
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
            <Link to="/templates" className="secondary-btn nav-link-btn">
              Templates
            </Link>
          </div>
        </div>
      </header>

      <main className="about-main">
        <div className="container">
          <section className="about-hero">
            <span className="eyebrow">About SmartCV</span>
            <h1>A smarter way to build, improve, and present your CV</h1>
            <p>
              SmartCV is designed to help students, graduates, and professionals
              strengthen the quality of their resumes through better structure,
              clearer presentation, stronger ATS alignment, and more purposeful
              job targeting.
            </p>
          </section>

          <section className="about-grid">
            <div className="about-card">
              <h2>Our Mission</h2>
              <p>
                We want to make resume preparation more strategic, accessible,
                and confidence-building. Instead of treating a CV as a static
                document, SmartCV treats it as a professional tool that can be
                improved, adapted, and strengthened over time.
              </p>
            </div>

            <div className="about-card">
              <h2>What Problem We Address</h2>
              <p>
                Many candidates apply with generic resumes that are not tailored
                to the role, are difficult for ATS systems to interpret, or fail
                to communicate their strengths clearly. SmartCV helps users move
                from a basic CV to a stronger and more intentional professional
                profile.
              </p>
            </div>
          </section>

          <section className="about-section">
            <div className="about-section-copy">
              <span className="eyebrow">What SmartCV Offers</span>
              <h2>More than a simple resume builder</h2>
              <p>
                SmartCV combines resume creation, ATS-oriented review, keyword
                awareness, and improvement guidance into one unified experience.
                The goal is not only to help users write a CV, but to help them
                write a better one for real opportunities.
              </p>
            </div>

            <div className="about-feature-list">
              <div className="about-feature-item">
                <h3>CV Building</h3>
                <p>
                  Create and organize resumes with structured sections for
                  education, projects, skills, and experience.
                </p>
              </div>

              <div className="about-feature-item">
                <h3>ATS Readiness</h3>
                <p>
                  Review formatting, readability, and keyword presence with a
                  focus on applicant tracking systems.
                </p>
              </div>

              <div className="about-feature-item">
                <h3>Role Targeting</h3>
                <p>
                  Prepare more relevant resumes by aligning content with target
                  job descriptions and expected skills.
                </p>
              </div>

              <div className="about-feature-item">
                <h3>Improvement Guidance</h3>
                <p>
                  Receive practical suggestions that make resumes clearer,
                  stronger, and more professional.
                </p>
              </div>
            </div>
          </section>

          <section className="about-values-grid">
            <div className="about-value-card">
              <h3>Clarity</h3>
              <p>
                A resume should communicate value quickly and cleanly.
              </p>
            </div>

            <div className="about-value-card">
              <h3>Relevance</h3>
              <p>
                Each application should feel better aligned with the target role.
              </p>
            </div>

            <div className="about-value-card">
              <h3>Confidence</h3>
              <p>
                Better resumes help users apply with more certainty and direction.
              </p>
            </div>
          </section>

          <section className="about-final-cta">
            <div className="about-final-card">
              <div>
                <span className="eyebrow">Start Your Journey</span>
                <h2>Build a stronger professional profile with SmartCV</h2>
                <p>
                  Whether you are just starting out or refining an existing
                  resume, SmartCV is designed to help you present yourself more
                  effectively.
                </p>
              </div>

              <div className="about-final-actions">
                <Link to="/signup" className="primary-btn nav-link-btn">
                  Start Free
                </Link>
                <Link to="/cv-builder" className="secondary-btn nav-link-btn">
                  Go to CV Builder
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default About;