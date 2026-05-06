import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { getProfile } from "../api/profile";
import { getCVs, deleteCV, createCV, generateCVFromUrl } from "../api/cv";
import { createSection } from "../api/cv_sections";
import { getJobs, getJobPreferences } from "../api/jobs";

function Dashboard() {
    const navigate = useNavigate();

    // ── State ─────────────────────────────────────────────
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState("cvs");

    // CV tab state
    const [cvs, setCVs] = useState([]);
    const [cvsLoading, setCvsLoading] = useState(true);
    const [cvsError, setCvsError] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [showTemplatePicker, setShowTemplatePicker] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState("minimal");
    const [jobUrl, setJobUrl] = useState("");
    const [quickCVLoading, setQuickCVLoading] = useState(false);
    const [quickCVError, setQuickCVError] = useState("");

    // Jobs tab state
    const [jobs, setJobs] = useState([]);
    const [jobsLoading, setJobsLoading] = useState(false);
    const [jobsError, setJobsError] = useState("");
    const [jobsFetched, setJobsFetched] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [location, setLocation] = useState("");
    const [jobType, setJobType] = useState("");

    // ── Auth + profile guard ───────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/signin"); return; }

        getProfile()
            .then(profile => {
                if (!profile) { navigate("/"); }
                else { setUser(profile); }
            })
            .catch(() => {
                localStorage.removeItem("token");
                navigate("/signin");
            });
    }, [navigate]);

    // ── Fetch CVs ─────────────────────────────────────────
    useEffect(() => {
        if (!user) return;
        setCvsLoading(true);
        getCVs()
            .then(data => setCVs(data))
            .catch(err => setCvsError(err.message))
            .finally(() => setCvsLoading(false));
    }, [user]);

    // ── Pre-fill job search from profile when jobs tab opens ──
    useEffect(() => {
        if (activeTab !== "jobs" || jobsFetched) return;

        getJobPreferences()
            .then(prefs => {
                if (prefs.preferred_job_title) setKeyword(prefs.preferred_job_title);
                if (prefs.country) setLocation(prefs.country);
            })
            .catch(() => {});
    }, [activeTab, jobsFetched]);

    // ── Fetch jobs ────────────────────────────────────────
    const fetchJobs = useCallback(async () => {
        setJobsLoading(true);
        setJobsError("");
        try {
            const data = await getJobs({ keyword, location, jobType });
            setJobs(data.jobs);
            setJobsFetched(true);
        } catch (err) {
            setJobsError(err.message);
        } finally {
            setJobsLoading(false);
        }
    }, [keyword, location, jobType]);

    // ── CV Handlers ───────────────────────────────────────
    const handleDelete = async (cvId) => {
        try {
            await deleteCV(cvId);
            setCVs(prev => prev.filter(cv => cv.id !== cvId));
            setDeleteConfirm(null);
        } catch (err) {
            setCvsError(err.message);
        }
    };

    const handleCreateCV = async () => {
        if (!user) { setCvsError("Profile not loaded."); setShowTemplatePicker(false); return; }

        const template1Sections = [
            { name: "About Me", type: "text", content: { value: "" }, order_index: 0 },
            { name: "Skills", type: "subsections", content: { entries: [
                { title: "Programming Languages", subtitle: "", date: "", bullets: [""] },
                { title: "Libraries & Frameworks", subtitle: "", date: "", bullets: [""] },
                { title: "Tools & Platforms", subtitle: "", date: "", bullets: [""] },
            ]}, order_index: 1 },
            { name: "Experience", type: "subsections", content: { entries: [] }, order_index: 2 },
            { name: "Soft Skills", type: "bullets", content: { items: [] }, order_index: 3 },
            { name: "Personal Projects", type: "subsections", content: { entries: [] }, order_index: 4 },
            { name: "Other Experience", type: "subsections", content: { entries: [] }, order_index: 5 },
            { name: "Interests", type: "bullets", content: { items: [] }, order_index: 6 },
            { name: "Education", type: "subsections", content: { entries: [] }, order_index: 7 },
        ];

        const template2Sections = [
            { name: "Experience", type: "subsections", content: { entries: [] }, order_index: 0 },
            { name: "Personal Projects", type: "subsections", content: { entries: [] }, order_index: 1 },
            { name: "Skills", type: "subsections", content: { entries: [
                { title: "Technical", subtitle: "", date: "", bullets: [""] },
                { title: "Soft", subtitle: "", date: "", bullets: [""] },
            ]}, order_index: 2 },
            { name: "Education", type: "subsections", content: { entries: [] }, order_index: 3 },
            { name: "About Me", type: "text", content: { value: "" }, order_index: 4 },
        ];

        const defaultSections = selectedTemplate === "modern" ? template2Sections : template1Sections;
        setShowTemplatePicker(false);

        try {
            const newCV = await createCV({
                title: "Untitled CV",
                template: selectedTemplate,
                personal_info: {
                    full_name: `${user.first_name} ${user.last_name}`,
                    email: user.email,
                    phone: user.phone || "",
                    professional_title: user.preferred_job_title || "",
                    location: user.address ? `${user.address}, ${user.country}` : user.country || ""
                },
                summary: "", education: {}, skills: [], experience: [], projects: []
            });
            await Promise.all(defaultSections.map(section => createSection(newCV.id, section)));
            navigate(`/cv-builder?id=${newCV.id}`);
        } catch (err) {
            setCvsError(err.message);
        }
    };

    const handleQuickCV = async () => {
        if (!jobUrl.trim()) { setQuickCVError("Please paste a job posting URL."); return; }
        if (!jobUrl.startsWith("http")) { setQuickCVError("Please enter a valid URL starting with http or https."); return; }

        setQuickCVError("");
        setQuickCVLoading(true);

        try {
            const result = await generateCVFromUrl(jobUrl, {});
            const ai = result.enhanced_sections;

            if (ai.error) { setQuickCVError("AI could not parse the job posting. Try a different URL."); return; }

            const newCV = await createCV({
                title: `Quick CV — ${new Date().toLocaleDateString()}`,
                template: "minimal",
                personal_info: {
                    full_name: `${user.first_name} ${user.last_name}`,
                    email: user.email,
                    phone: user.phone || "",
                    professional_title: user.preferred_job_title || "",
                    location: user.address ? `${user.address}, ${user.country}` : user.country || "",
                    linkedin: "", github: ""
                },
                summary: ai.about_me || "", education: {}, skills: [], experience: [], projects: []
            });

            const sectionsToCreate = [
                { name: "About Me", type: "text", content: { value: ai.about_me || "" }, order_index: 0 },
                { name: "Skills", type: "subsections", content: { entries: [
                    { title: "Programming Languages", subtitle: "", date: "", bullets: ai.skills?.programming || [] },
                    { title: "Tools & Platforms", subtitle: "", date: "", bullets: ai.skills?.tools || [] },
                    ...(ai.skills?.other?.length ? [{ title: "Other", subtitle: "", date: "", bullets: ai.skills.other }] : [])
                ]}, order_index: 1 },
                { name: "Experience", type: "subsections", content: { entries: (ai.experience || []).map(e => ({ title: e.title || e.role || "", subtitle: e.subtitle || e.company || "", date: e.date || "", bullets: e.bullets || [] })) }, order_index: 2 },
                { name: "Soft Skills", type: "bullets", content: { items: ai.soft_skills || [] }, order_index: 3 },
                { name: "University Projects", type: "subsections", content: { entries: (ai.university_projects || []).map(p => ({ title: p.title || p.name || "", subtitle: p.subtitle || p.duration || "", date: p.date || "", bullets: p.bullets || [] })) }, order_index: 4 },
                { name: "Personal Projects", type: "subsections", content: { entries: (ai.personal_projects || []).map(p => ({ title: p.title || p.name || "", subtitle: p.subtitle || p.duration || "", date: p.date || "", bullets: p.bullets || [] })) }, order_index: 5 },
                { name: "Interests", type: "bullets", content: { items: ai.interests || [] }, order_index: 6 },
                { name: "Education", type: "subsections", content: { entries: (ai.education || []).map(e => ({ title: e.title || e.institution || "", subtitle: e.subtitle || e.degree || "", date: e.date || e.year || "", bullets: e.bullets || [] })) }, order_index: 7 },
            ];

            await Promise.all(sectionsToCreate.map(section => createSection(newCV.id, section)));
            setCVs(prev => [newCV, ...prev]);
            setJobUrl("");
            navigate(`/cv-builder?id=${newCV.id}`);
        } catch (err) {
            setQuickCVError(err.message);
        } finally {
            setQuickCVLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Never updated";
        const date = new Date(dateString);
        const diffDays = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString();
    };

    const formatSalary = (salary, location) => {
        if (!salary) return null;
        const isPolish = location?.toLowerCase().includes("pol") ||
                         location?.toLowerCase().includes("warszawa") ||
                         location?.toLowerCase().includes("kraków") ||
                         location?.toLowerCase().includes("wrocław");
        return isPolish ? `${salary} PLN/yr` : `${salary}`;
    };

    // ── Render ────────────────────────────────────────────
    return (
        <div className="dashboard-page">
            <header className="dashboard-topbar">
                <div className="container dashboard-topbar-content">
                    <Link to="/" className="brand auth-brand">
                        <div className="brand-mark">S</div>
                        <span>SmartCV</span>
                    </Link>
                    <div className="dashboard-topbar-actions">
                        <Link to="/" className="ghost-btn nav-link-btn">Home</Link>
                        <Link to="/profile" className="ghost-btn nav-link-btn">My Profile</Link>
                        <button
                            className="secondary-btn"
                            onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="dashboard-main">
                <div className="container">

                    {/* ── Hero ── */}
                    <section className="dashboard-hero">
                        <div>
                            <span className="eyebrow">Dashboard</span>
                            <h1>Welcome back, {user?.first_name || "..."}</h1>
                            <p>Manage your CVs, track applications, and find live job listings.</p>
                        </div>
                    </section>

                    {/* ── Tabs ── */}
                    <div className="dashboard-tabs">
                        <button
                            className={`dashboard-tab ${activeTab === "cvs" ? "active" : ""}`}
                            onClick={() => setActiveTab("cvs")}
                        >
                            My CVs
                        </button>
                        <button
                            className={`dashboard-tab ${activeTab === "jobs" ? "active" : ""}`}
                            onClick={() => setActiveTab("jobs")}
                        >
                            Job Listings
                        </button>
                    </div>

                    {/* ── CVs Tab ── */}
                    {activeTab === "cvs" && (
                        <div className="dashboard-cvs-tab">
                            <div className="quick-cv-zone">
                                <div className="quick-cv-header">
                                    <div>
                                        <h2>Quick CV</h2>
                                        <p>Paste a job posting URL and SmartCV will generate a tailored CV from your profile instantly.</p>
                                    </div>
                                    <span className="eyebrow">AI Powered</span>
                                </div>
                                <div className="quick-cv-input-row">
                                    <input
                                        type="url"
                                        placeholder="https://linkedin.com/jobs/view/..."
                                        value={jobUrl}
                                        onChange={e => setJobUrl(e.target.value)}
                                        className="quick-cv-input"
                                        onKeyDown={e => e.key === "Enter" && handleQuickCV()}
                                    />
                                    <button className="primary-btn" onClick={handleQuickCV} disabled={quickCVLoading}>
                                        {quickCVLoading ? "Generating..." : "Generate CV"}
                                    </button>
                                </div>
                                {quickCVError && <p className="auth-error">{quickCVError}</p>}
                                {quickCVLoading && <p className="quick-cv-loading">Fetching job posting and generating your CV... this takes about 10 seconds.</p>}
                            </div>

                            <div className="cvs-list-header">
                                <h2>My CVs ({cvs.length})</h2>
                                <button className="primary-btn" onClick={() => setShowTemplatePicker(true)}>
                                    + Create New CV
                                </button>
                            </div>

                            {cvsError && <p className="auth-error">{cvsError}</p>}
                            {cvsLoading && <p className="cvs-loading">Loading your CVs...</p>}
                            {!cvsLoading && cvs.length === 0 && (
                                <div className="cvs-empty">
                                    <p>No CVs yet. Create your first one or use Quick CV above.</p>
                                </div>
                            )}
                            {!cvsLoading && cvs.length > 0 && (
                                <div className="resume-list">
                                    {cvs.map(cv => (
                                        <div className="resume-row" key={cv.id}>
                                            <div className="resume-row-main">
                                                <h3>{cv.title}</h3>
                                                <p>Template: {cv.template || "minimal"} · Last updated: {formatDate(cv.updated_at || cv.created_at)}</p>
                                            </div>
                                            <div className="resume-row-meta">
                                                <button className="primary-btn small-btn" onClick={() => navigate(`/cv-builder?id=${cv.id}`)}>Open</button>
                                                {deleteConfirm === cv.id ? (
                                                    <>
                                                        <span className="delete-confirm-text">Are you sure?</span>
                                                        <button className="danger-btn small-btn" onClick={() => handleDelete(cv.id)}>Yes, delete</button>
                                                        <button className="secondary-btn small-btn" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                                                    </>
                                                ) : (
                                                    <button className="secondary-btn small-btn" onClick={() => setDeleteConfirm(cv.id)}>Delete</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Jobs Tab ── */}
                    {activeTab === "jobs" && (
                        <div className="dashboard-jobs-tab">

                            {/* Search filters */}
                            <div className="quick-cv-zone">
                                <div className="quick-cv-header">
                                    <div>
                                        <h2>Live Job Listings</h2>
                                        <p>Jobs fetched live from Remotive and Adzuna, filtered to match your preferences.</p>
                                    </div>
                                    <span className="eyebrow">Live</span>
                                </div>

                                <div className="jobs-filters">
                                    <input
                                        type="text"
                                        placeholder="Job title or keyword"
                                        value={keyword}
                                        onChange={e => setKeyword(e.target.value)}
                                        className="quick-cv-input"
                                        onKeyDown={e => e.key === "Enter" && fetchJobs()}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Location (e.g. Poland)"
                                        value={location}
                                        onChange={e => setLocation(e.target.value)}
                                        className="quick-cv-input"
                                        onKeyDown={e => e.key === "Enter" && fetchJobs()}
                                    />
                                    <select
                                        value={jobType}
                                        onChange={e => setJobType(e.target.value)}
                                        className="quick-cv-input"
                                    >
                                        <option value="">Any type</option>
                                        <option value="full_time">Full time</option>
                                        <option value="contract">Contract</option>
                                        <option value="part_time">Part time</option>
                                    </select>
                                    <button className="primary-btn" onClick={fetchJobs} disabled={jobsLoading}>
                                        {jobsLoading ? "Searching..." : "Search Jobs"}
                                    </button>
                                </div>
                            </div>

                            {/* Error */}
                            {jobsError && <p className="auth-error">{jobsError}</p>}

                            {/* Loading */}
                            {jobsLoading && (
                                <div className="cvs-empty">
                                    <p>Fetching live jobs...</p>
                                </div>
                            )}

                            {/* Empty state before first search */}
                            {!jobsLoading && !jobsFetched && (
                                <div className="cvs-empty">
                                    <p>Enter a keyword and click Search Jobs to see live listings.</p>
                                </div>
                            )}

                            {/* No results */}
                            {!jobsLoading && jobsFetched && jobs.length === 0 && (
                                <div className="cvs-empty">
                                    <p>No jobs found. Try a different keyword or location.</p>
                                </div>
                            )}

                            {/* Job listings */}
                            {!jobsLoading && jobs.length > 0 && (
                                <>
                                    <p style={{ marginBottom: "1rem", color: "var(--text-muted, #888)", fontSize: "14px" }}>
                                        {jobs.length} jobs found
                                    </p>
                                    <div className="resume-list">
                                        {jobs.map(job => (
                                            <div className="resume-row" key={job.id}>
                                                <div className="resume-row-main">
                                                    <h3>{job.title}</h3>
                                                    <p>
                                                        <strong>{job.company}</strong>
                                                        {" · "}{job.location}
                                                        {job.salary && ` · ${formatSalary(job.salary, job.location)}`}
                                                        {" · "}<span style={{ textTransform: "capitalize", opacity: 0.7 }}>{job.source}</span>
                                                    </p>
                                                    {job.description && (
                                                        <p style={{ marginTop: "0.4rem", fontSize: "13px", opacity: 0.75, lineHeight: "1.5" }}>
                                                            {job.description.slice(0, 180)}...
                                                        </p>
                                                    )}
                                                    {job.tags?.length > 0 && (
                                                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "0.5rem" }}>
                                                            {job.tags.slice(0, 5).map((tag, i) => (
                                                                <span key={i} style={{
                                                                    fontSize: "11px",
                                                                    padding: "2px 8px",
                                                                    borderRadius: "999px",
                                                                    background: "var(--tag-bg, #f0f0f0)",
                                                                    color: "var(--tag-text, #555)"
                                                                }}>{tag}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="resume-row-meta">
                                                    <a
                                                        href={job.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="primary-btn small-btn"
                                                        style={{ textDecoration: "none" }}
                                                    >
                                                        Apply
                                                    </a>
                                                    <button
                                                        className="secondary-btn small-btn"
                                                        onClick={() => { setJobUrl(job.url); setActiveTab("cvs"); }}
                                                        title="Generate a tailored CV for this job"
                                                    >
                                                        Quick CV
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* ── Template picker modal ── */}
            {showTemplatePicker && (
                <div className="modal-overlay" onClick={() => setShowTemplatePicker(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Choose a template</h2>
                            <button className="modal-close" onClick={() => setShowTemplatePicker(false)}>✕</button>
                        </div>
                        <div className="template-grid">
                            {[
                                { id: "minimal", name: "Minimal", description: "Clean single column, lots of whitespace" },
                                { id: "modern", name: "Modern", description: "Sidebar layout with accent colours" },
                                { id: "classic", name: "Classic", description: "Traditional professional layout" }
                            ].map(template => (
                                <div
                                    key={template.id}
                                    className={`template-card ${selectedTemplate === template.id ? "selected" : ""}`}
                                    onClick={() => setSelectedTemplate(template.id)}
                                >
                                    <div className="template-preview">
                                        <div className="template-preview-lines">
                                            <div className="tpl-line tpl-line-title" />
                                            <div className="tpl-line tpl-line-sub" />
                                            <div className="tpl-line" />
                                            <div className="tpl-line tpl-line-short" />
                                        </div>
                                    </div>
                                    <h3>{template.name}</h3>
                                    <p>{template.description}</p>
                                </div>
                            ))}
                        </div>
                        <div className="modal-footer">
                            <button className="secondary-btn" onClick={() => setShowTemplatePicker(false)}>Cancel</button>
                            <button className="primary-btn" onClick={handleCreateCV}>Create CV</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;