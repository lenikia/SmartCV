import { Link } from "react-router-dom";
import { useState } from "react";

function Contact() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.subject.trim() ||
      !formData.message.trim()
    ) {
      return;
    }

    setSubmitted(true);

    setFormData({
      fullName: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="contact-page">
      <header className="dashboard-topbar">
        <div className="container dashboard-topbar-content">
          <Link to="/dashboard" className="brand auth-brand">
            <div className="brand-mark">S</div>
            <span className="brand-text"><span className="brand-text-main">Re</span><span className="brand-text-accent">SUME</span><span className="brand-text-main">ai</span></span>
          </Link>

          <div className="dashboard-topbar-actions">
            <Link to="/" className="ghost-btn nav-link-btn">
              Home
            </Link>
            <Link to="/about" className="secondary-btn nav-link-btn">
              About
            </Link>
          </div>
        </div>
      </header>

      <main className="contact-main">
        <div className="container">
          <section className="contact-hero">
            <span className="eyebrow">Contact</span>
            <h1>We would love to hear from you</h1>
            <p>
              Whether you have a question, feedback, or want to discuss how
              SmartCV can better support resume preparation, feel free to reach
              out.
            </p>
          </section>

          <section className="contact-layout">
            <div className="contact-form-card">
              <div className="contact-section-header">
                <h2>Send us a message</h2>
                <p>
                  Fill in the form below and we will get back to you as soon as
                  possible.
                </p>
              </div>

              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="input-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    id="subject"
                    type="text"
                    placeholder="What is your message about?"
                    value={formData.subject}
                    onChange={(e) => handleChange("subject", e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    rows="6"
                    placeholder="Write your message here..."
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                  />
                </div>

                <button type="submit" className="primary-btn contact-submit-btn">
                  Send Message
                </button>
              </form>

              {submitted && (
                <div className="contact-success-box">
                  Your message has been submitted successfully.
                </div>
              )}
            </div>

            <div className="contact-info-column">
              <div className="contact-info-card">
                <h3>General Contact</h3>
                <p>
                  Reach out for platform questions, feedback, collaboration
                  ideas, or project-related support.
                </p>

                <div className="contact-info-list">
                  <div>
                    <strong>Email</strong>
                    <span>support@smartcv.com</span>
                  </div>
                  <div>
                    <strong>Location</strong>
                    <span>Warsaw, Poland</span>
                  </div>
                  <div>
                    <strong>Availability</strong>
                    <span>Monday – Friday</span>
                  </div>
                </div>
              </div>

              <div className="contact-info-card">
                <h3>What can you contact us about?</h3>
                <ul className="contact-topic-list">
                  <li>Questions about resume building</li>
                  <li>Feedback about ATS score interpretation</li>
                  <li>Suggestions for new features</li>
                  <li>Support regarding your SmartCV workflow</li>
                </ul>
              </div>

              <div className="contact-info-card">
                <h3>SmartCV Focus</h3>
                <p>
                  SmartCV is built to support clearer resumes, stronger ATS
                  readiness, better job alignment, and more confident
                  applications.
                </p>
              </div>
            </div>
          </section>

          <section className="contact-final-cta">
            <div className="contact-final-card">
              <div>
                <span className="eyebrow">Keep Exploring</span>
                <h2>Continue building your SmartCV experience</h2>
                <p>
                  Explore templates, refine your resume, and move toward a more
                  complete professional profile.
                </p>
              </div>

              <div className="contact-final-actions">
                <Link to="/templates" className="secondary-btn nav-link-btn">
                  View Templates
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

export default Contact;