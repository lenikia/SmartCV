import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getProfile, createProfile } from "../api/profile";

function Home() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [profileExists, setProfileExists] = useState(false);
    const [profileSubmitted, setProfileSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checkingProfile, setCheckingProfile] = useState(true);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address: "",
        country: "",
        preferred_job_title: ""
    });

    // On mount, if the user is logged in check whether they
    // already have a profile. This drives what the form section shows.
    // We don't redirect here — the Home page is always accessible.
    // The profile form simply appears or is replaced by the success
    // buttons depending on what the API returns.
    useEffect(() => {
        if (!token) {
            setCheckingProfile(false);
            return;
        }

        getProfile()
            .then(profile => {
                if (profile) setProfileExists(true);
            })
            .catch(() => {})
            .finally(() => setCheckingProfile(false));
    }, [token]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim()) {
            setError("First name, last name and email are required.");
            return;
        }

        setError("");
        setLoading(true);

        try {
            await createProfile(formData);
            setProfileSubmitted(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // What to show in the profile form section based on state
    const renderProfileSection = () => {

        // Not logged in — show a prompt to sign up instead of the form
        if (!token) {
            return (
                <div className="profile-form-prompt">
                    <p>Create a free account to build and save your profile.</p>
                    <Link to="/signup" className="primary-btn nav-link-btn">
                        Get Started Free
                    </Link>
                </div>
            );
        }

        // Still checking whether a profile exists
        if (checkingProfile) {
            return <p className="profile-form-checking">Loading your profile...</p>;
        }

        // Profile already exists or was just submitted — show action buttons
        if (profileExists || profileSubmitted) {
            return (
                <div className="profile-success">
                    <p className="profile-success-message">
                        Your profile is set up. What would you like to do?
                    </p>
                    <div className="profile-success-actions">
                        <button
                            className="primary-btn"
                            onClick={() => navigate("/dashboard")}
                        >
                            Go to Dashboard
                        </button>
                        <button
                            className="secondary-btn"
                            onClick={() => navigate("/resume-checker")}
                        >
                            Upload Existing CV
                        </button>
                    </div>
                </div>
            );
        }

        // Logged in, no profile yet — show the form
        return (
            <form className="profile-setup-form" onSubmit={handleSubmit}>
                <div className="builder-form-grid">
                    <div className="input-group">
                        <label>First Name *</label>
                        <input
                            type="text"
                            placeholder="Enter your first name"
                            value={formData.first_name}
                            onChange={e => handleChange("first_name", e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>Last Name *</label>
                        <input
                            type="text"
                            placeholder="Enter your last name"
                            value={formData.last_name}
                            onChange={e => handleChange("last_name", e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>Email *</label>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={e => handleChange("email", e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>Phone</label>
                        <input
                            type="text"
                            placeholder="Enter your phone number"
                            value={formData.phone}
                            onChange={e => handleChange("phone", e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>Address</label>
                        <input
                            type="text"
                            placeholder="Enter your address"
                            value={formData.address}
                            onChange={e => handleChange("address", e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>Country</label>
                        <input
                            type="text"
                            placeholder="Enter your country"
                            value={formData.country}
                            onChange={e => handleChange("country", e.target.value)}
                        />
                    </div>

                    <div className="input-group builder-full-width">
                        <label>Preferred Job Title</label>
                        <input
                            type="text"
                            placeholder="e.g. Software Engineer, Data Analyst"
                            value={formData.preferred_job_title}
                            onChange={e => handleChange("preferred_job_title", e.target.value)}
                        />
                    </div>
                </div>

                {error && <p className="auth-error">{error}</p>}

                <button
                    type="submit"
                    className="primary-btn auth-submit-btn"
                    disabled={loading}
                >
                    {loading ? "Saving..." : "Save Profile"}
                </button>
            </form>
        );
    };

    return (
        <div className="site-shell">
            <div className="top-banner">
                Improve your CV, strengthen ATS compatibility, and apply with more confidence.
            </div>

            <header className="navbar">
                <div className="container navbar-content">
                    <div className="brand">
                        <div className="brand-mark">S</div>
                        <span>SmartCV</span>
                    </div>

                    <nav className="nav-links">
                        <a href="#features">Features</a>
                        <a href="#how-it-works">How It Works</a>
                        <a href="#ats">ATS Score</a>
                        <a href="#faq">FAQ</a>
                    </nav>

                    <div className="nav-actions">
                        {token ? (
                            // Logged in — show dashboard link and logout
                            <>
                                <Link to="/dashboard" className="ghost-btn nav-link-btn">
                                    Dashboard
                                </Link>
                                <button
                                    className="secondary-btn"
                                    onClick={() => {
                                        localStorage.removeItem("token");
                                        window.location.reload();
                                    }}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            // Not logged in — show sign in and start free
                            <>
                                <Link to="/signin" className="ghost-btn nav-link-btn">
                                    Sign In
                                </Link>
                                <Link to="/signup" className="primary-btn nav-link-btn">
                                    Start Free
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main>
                {/* ── All your existing sections unchanged ── */}

                <section className="hero-section">
                    <div className="container hero-grid">
                        <div className="hero-copy">
                            <span className="eyebrow">CV Optimization Platform</span>
                            <h1>
                                Build a stronger CV, improve ATS readiness, and tailor every
                                application with purpose.
                            </h1>
                            <p className="hero-text">
                                SmartCV helps students and professionals create better resumes,
                                identify weak points, improve structure and keywords, and adapt
                                their CV to real job opportunities.
                            </p>

                            <div className="hero-actions">
                                <Link to="/signup" className="primary-btn large-btn nav-link-btn">
                                    Start Free
                                </Link>
                                <a href="#features" className="secondary-btn large-btn nav-link-btn">
                                    Explore Features
                                </a>
                            </div>

                            <div className="hero-mini-proof">
                                <span>ATS-focused guidance</span>
                                <span>Resume tailoring support</span>
                                <span>Cleaner professional presentation</span>
                            </div>
                        </div>

                        <div className="hero-visual">
                            <div className="main-dashboard">
                                <div className="dashboard-header">
                                    <div>
                                        <p className="card-label">Resume Analysis</p>
                                        <h3>Software Engineer Resume</h3>
                                    </div>
                                    <div className="score-pill">82%</div>
                                </div>

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

                                <div className="keyword-box">
                                    <p className="keyword-title">Suggested keywords</p>
                                    <div className="keyword-list">
                                        <span>Python</span>
                                        <span>API Design</span>
                                        <span>SQL</span>
                                        <span>FastAPI</span>
                                        <span>Testing</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="trust-strip">
                    <div className="container trust-grid">
                        <div>
                            <h3>Built for modern career preparation</h3>
                            <p>Designed for students, graduates, and professionals.</p>
                        </div>

                        <div className="trust-stats">
                            <div className="trust-card">
                                <strong>ATS-ready</strong>
                                <span>Resume review focus</span>
                            </div>
                            <div className="trust-card">
                                <strong>Role-targeted</strong>
                                <span>Job match guidance</span>
                            </div>
                            <div className="trust-card">
                                <strong>Clearer CVs</strong>
                                <span>Better structure and readability</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="how-it-works" className="section">
                    <div className="container">
                        <div className="section-heading">
                            <span className="eyebrow">How it works</span>
                            <h2>A guided workflow for stronger applications</h2>
                            <p>
                                SmartCV helps users move from a basic resume to a stronger,
                                clearer, and more targeted professional profile.
                            </p>
                        </div>

                        <div className="steps-grid">
                            <div className="step-card">
                                <span className="step-number">01</span>
                                <h3>Create or upload your CV</h3>
                                <p>Start with your current resume or build a new one from scratch.</p>
                            </div>
                            <div className="step-card">
                                <span className="step-number">02</span>
                                <h3>Check ATS readiness</h3>
                                <p>Review structure, readability, and keyword alignment.</p>
                            </div>
                            <div className="step-card">
                                <span className="step-number">03</span>
                                <h3>Match it to a job</h3>
                                <p>Compare your profile against a target opportunity.</p>
                            </div>
                            <div className="step-card">
                                <span className="step-number">04</span>
                                <h3>Improve before applying</h3>
                                <p>Use practical suggestions to strengthen your final version.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="features" className="section soft-section">
                    <div className="container">
                        <div className="section-heading">
                            <span className="eyebrow">Why SmartCV</span>
                            <h2>More than a basic CV editor</h2>
                            <p>
                                SmartCV is designed to support resume building, ATS analysis,
                                job targeting, and professional positioning in one place.
                            </p>
                        </div>

                        <div className="feature-grid">
                            <div className="feature-card">
                                <div className="feature-icon"></div>
                                <h3>ATS Score Analysis</h3>
                                <p>Understand how applicant tracking systems may interpret your CV.</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon"></div>
                                <h3>Job-Specific Tailoring</h3>
                                <p>Adapt your resume to the role you actually want, not just any role.</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon"></div>
                                <h3>Resume Improvement Tips</h3>
                                <p>Improve summaries, projects, bullet points, and professional language.</p>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon"></div>
                                <h3>Professional CV Builder</h3>
                                <p>Organize personal info, education, skills, experience, and projects.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="ats" className="section">
                    <div className="container split-section">
                        <div className="split-copy">
                            <span className="eyebrow">ATS & Analysis</span>
                            <h2>Understand how your CV performs before recruiters see it</h2>
                            <p>
                                SmartCV helps you review formatting quality, keyword placement,
                                structure, and readability to strengthen your chances in ATS-based hiring flows.
                            </p>
                            <ul className="check-list">
                                <li>Detect weak formatting and structure</li>
                                <li>Highlight missing keywords</li>
                                <li>Review readability and clarity</li>
                                <li>Support stronger role alignment</li>
                            </ul>
                        </div>

                        <div className="analysis-card">
                            <h3>ATS Breakdown</h3>
                            <div className="analysis-row">
                                <span>Formatting</span>
                                <strong>Strong</strong>
                            </div>
                            <div className="analysis-row">
                                <span>Keywords</span>
                                <strong>Needs Improvement</strong>
                            </div>
                            <div className="analysis-row">
                                <span>Structure</span>
                                <strong>Strong</strong>
                            </div>
                            <div className="analysis-row">
                                <span>Readability</span>
                                <strong>Good</strong>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="faq" className="section soft-section">
                    <div className="container">
                        <div className="section-heading">
                            <span className="eyebrow">FAQ</span>
                            <h2>Frequently asked questions</h2>
                            <p>Answers to common questions about SmartCV and resume optimization.</p>
                        </div>

                        <div className="faq-list">
                            <div className="faq-item">
                                <h3>What does SmartCV help me do?</h3>
                                <p>
                                    SmartCV helps users build, improve, and tailor their CVs with a stronger
                                    focus on ATS readiness and professional presentation.
                                </p>
                            </div>
                            <div className="faq-item">
                                <h3>Is SmartCV only for students?</h3>
                                <p>No. It can also be useful for graduates, job seekers, and professionals.</p>
                            </div>
                            <div className="faq-item">
                                <h3>Can I tailor my CV to a job description?</h3>
                                <p>Yes. The product is designed to support job-specific CV improvement.</p>
                            </div>
                            <div className="faq-item">
                                <h3>Do I need an account to start?</h3>
                                <p>
                                    You can explore the platform first, but creating an account gives access
                                    to your personal workspace.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Profile setup section — new ── */}
                <section id="profile-setup" className="section">
                    <div className="container">
                        <div className="section-heading">
                            <span className="eyebrow">Your Profile</span>
                            <h2>Set up your base profile</h2>
                            <p>
                                This information will be used across every CV you generate.
                                Fill it in once and SmartCV will use it as the foundation
                                for all your applications.
                            </p>
                        </div>

                        {renderProfileSection()}
                    </div>
                </section>

                <section className="final-cta-section">
                    <div className="container final-cta-card">
                        <div>
                            <span className="eyebrow">Ready to improve your next application?</span>
                            <h2>Start building a stronger, smarter CV today.</h2>
                            <p>
                                Create better resumes, improve ATS compatibility, and prepare
                                more confidently for the roles you want.
                            </p>
                        </div>
                        <div className="final-cta-actions">
                            <Link to="/signup" className="primary-btn large-btn nav-link-btn">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="footer">
                <div className="container footer-grid">
                    <div className="footer-brand">
                        <div className="brand">
                            <div className="brand-mark">S</div>
                            <span>SmartCV</span>
                        </div>
                        <p>
                            A modern CV platform focused on ATS readiness, better job alignment,
                            and stronger professional presentation.
                        </p>
                    </div>

                    <div>
                        <h4>Product</h4>
                        <ul>
                            <li><Link to="/resume-checker" className="footer-link">Resume Checker</Link></li>
                            <li><Link to="/ats-score" className="footer-link">ATS Score</Link></li>
                            <li><Link to="/cv-builder" className="footer-link">CV Builder</Link></li>
                            <li><Link to="/templates" className="footer-link">Templates</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4>Resources</h4>
                        <ul>
                            <li>FAQ</li>
                            <li>Guides</li>
                            <li>Career Tips</li>
                            <li>Support</li>
                        </ul>
                    </div>

                    <div>
                        <h4>Company</h4>
                        <ul>
                            <li><Link to="/about" className="footer-link">About</Link></li>
                            <li><Link to="/contact" className="footer-link">Contact</Link></li>
                            <li><Link to="/pricing" className="footer-link">Pricing</Link></li>
                            <li><Link to="/privacy" className="footer-link">Privacy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="container footer-bottom">
                    <p>© 2026 SmartCV. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

export default Home;