import { Link } from "react-router-dom";

function Privacy() {
  return (
    <div className="privacy-page">
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
            <Link to="/contact" className="secondary-btn nav-link-btn">
              Contact
            </Link>
          </div>
        </div>
      </header>

      <main className="privacy-main">
        <div className="container">
          <section className="privacy-hero">
            <span className="eyebrow">Privacy Policy</span>
            <h1>Your information matters</h1>
            <p>
              SmartCV is designed to support resume creation, improvement, and
              professional preparation. This page explains the type of data that
              may be handled by the platform and how it is intended to be used.
            </p>
          </section>

          <section className="privacy-content">
            <article className="privacy-card">
              <h2>1. Information We May Collect</h2>
              <p>
                SmartCV may handle information that users provide directly, such
                as name, email address, resume content, professional summary,
                education history, skills, projects, and other career-related
                data entered into the platform.
              </p>
            </article>

            <article className="privacy-card">
              <h2>2. How Information Is Used</h2>
              <p>
                The data entered into SmartCV is intended to support resume
                building, ATS-oriented analysis, content improvement, and job
                application preparation. Information may also be used to improve
                user experience, navigation flow, and product design.
              </p>
            </article>

            <article className="privacy-card">
              <h2>3. Resume and Profile Content</h2>
              <p>
                Resume content is considered sensitive professional information.
                SmartCV is designed with the expectation that such content should
                be handled carefully and only in ways relevant to resume
                optimization, storage, and presentation.
              </p>
            </article>

            <article className="privacy-card">
              <h2>4. Data Protection Intent</h2>
              <p>
                As a product concept and development project, SmartCV aims to
                follow good practices regarding data handling, secure access, and
                responsible use of personal information. In a production
                environment, stronger technical safeguards would be required.
              </p>
            </article>

            <article className="privacy-card">
              <h2>5. Authentication and Access</h2>
              <p>
                User-specific areas such as dashboards, resume collections, and
                saved analysis results are intended to be accessible only to the
                corresponding authenticated user. Until backend integration is
                fully implemented, some authentication behavior may be simulated
                in the frontend for development purposes.
              </p>
            </article>

            <article className="privacy-card">
              <h2>6. Third-Party Services</h2>
              <p>
                In a more complete version of the platform, SmartCV may
                integrate with third-party tools or services related to hosting,
                analytics, authentication, or document processing. Such
                integrations would require additional privacy review and user
                transparency.
              </p>
            </article>

            <article className="privacy-card">
              <h2>7. User Responsibility</h2>
              <p>
                Users should avoid submitting unnecessary highly sensitive
                information into resumes or forms unless required for their
                professional use case. SmartCV is intended to support career
                preparation, not the storage of unrelated personal data.
              </p>
            </article>

            <article className="privacy-card">
              <h2>8. Project and Demonstration Notice</h2>
              <p>
                This version of SmartCV may include prototype or academic
                project-level features. Some flows, storage mechanisms, and
                security protections may still be under development and should be
                interpreted within that context.
              </p>
            </article>

            <article className="privacy-card">
              <h2>9. Future Policy Updates</h2>
              <p>
                As SmartCV evolves, this privacy policy may be updated to better
                reflect new technical implementations, integrations, and product
                capabilities.
              </p>
            </article>
          </section>

          <section className="privacy-final-cta">
            <div className="privacy-final-card">
              <div>
                <span className="eyebrow">Need More Information?</span>
                <h2>Questions about privacy or data handling?</h2>
                <p>
                  If you want clarification about how SmartCV is designed to
                  handle user information, please reach out through the contact
                  page.
                </p>
              </div>

              <div className="privacy-final-actions">
                <Link to="/contact" className="secondary-btn nav-link-btn">
                  Contact Us
                </Link>
                <Link to="/signup" className="primary-btn nav-link-btn">
                  Start Free
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Privacy;