import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { getProfile } from "../api/profile";
import { getCVs, deleteCV, createCV, generateCVFromUrl } from "../api/cv";
import { createSection } from "../api/cv_sections";
import { getJobs, getJobPreferences } from "../api/jobs";
import { getApplications, createApplication, updateApplication, deleteApplication } from "../api/applications";

// ── Status badge colours ───────────────────────────────────
const STATUS_COLOURS = {
    "Applied":   { background: "#EAF3DE", color: "#3B6D11" },
    "Interview": { background: "#E6F1FB", color: "#185FA5" },
    "Offer":     { background: "#E1F5EE", color: "#0F6E56" },
    "Rejected":  { background: "#FCEBEB", color: "#A32D2D" },
    "Withdrawn": { background: "#F5F5F5", color: "#666" },
};

const STATUSES = ["Applied", "Interview", "Offer", "Rejected", "Withdrawn"];

const emptyForm = {
    company: "", job_title: "", location: "",
    salary: "", job_url: "", notes: "", status: "Applied"
};

function Dashboard() {
    const navigate = useNavigate();

    // ── State ─────────────────────────────────────────────
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState("cvs");

    // CV tab
    const [cvs, setCVs] = useState([]);
    const [cvsLoading, setCvsLoading] = useState(true);
    const [cvsError, setCvsError] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [showTemplatePicker, setShowTemplatePicker] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState("minimal");
    const [jobUrl, setJobUrl] = useState("");
    const [quickCVLoading, setQuickCVLoading] = useState(false);
    const [quickCVError, setQuickCVError] = useState("");

    // Jobs tab
    const [jobs, setJobs] = useState([]);
    const [jobsLoading, setJobsLoading] = useState(false);
    const [jobsError, setJobsError] = useState("");
    const [jobsFetched, setJobsFetched] = useState(false);
    const [keyword, setKeyword] = useState("");
    const [location, setLocation] = useState("");
    const [jobType, setJobType] = useState("");

    // Tracker tab
    const [applications, setApplications] = useState([]);
    const [appsLoading, setAppsLoading] = useState(false);
    const [appsError, setAppsError] = useState("");
    const [showAppModal, setShowAppModal] = useState(false);
    const [editingApp, setEditingApp] = useState(null); // null = new, obj = editing
    const [appForm, setAppForm] = useState(emptyForm);
    const [appDeleteConfirm, setAppDeleteConfirm] = useState(null);
    const [appSaving, setAppSaving] = useState(false);

    // ── Auth ──────────────────────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/signin"); return; }
        getProfile()
            .then(profile => { if (!profile) navigate("/"); else setUser(profile); })
            .catch(() => { localStorage.removeItem("token"); navigate("/signin"); });
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

    // ── Fetch Applications when tab opens ─────────────────
    useEffect(() => {
        if (activeTab !== "tracker" || !user) return;
        setAppsLoading(true);
        getApplications()
            .then(data => setApplications(data))
            .catch(err => setAppsError(err.message))
            .finally(() => setAppsLoading(false));
    }, [activeTab, user]);

    // ── Pre-fill job filters from profile ─────────────────
    useEffect(() => {
        if (activeTab !== "jobs" || jobsFetched) return;
        getJobPreferences()
            .then(prefs => {
                if (prefs.preferred_job_title) setKeyword(prefs.preferred_job_title);
                if (prefs.country) setLocation(prefs.country);
            })
            .catch(() => {});
    }, [activeTab, jobsFetched]);

    // ── Fetch Jobs ────────────────────────────────────────
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
        } catch (err) { setCvsError(err.message); }
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
                title: "Untitled CV", template: selectedTemplate,
                personal_info: {
                    full_name: `${user.first_name} ${user.last_name}`,
                    email: user.email, phone: user.phone || "",
                    professional_title: user.preferred_job_title || "",
                    location: user.address ? `${user.address}, ${user.country}` : user.country || ""
                },
                summary: "", education: {}, skills: [], experience: [], projects: []
            });
            await Promise.all(defaultSections.map(s => createSection(newCV.id, s)));
            navigate(`/cv-builder?id=${newCV.id}`);
        } catch (err) { setCvsError(err.message); }
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
                title: `Quick CV — ${new Date().toLocaleDateString()}`, template: "minimal",
                personal_info: {
                    full_name: `${user.first_name} ${user.last_name}`,
                    email: user.email, phone: user.phone || "",
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
            await Promise.all(sectionsToCreate.map(s => createSection(newCV.id, s)));
            setCVs(prev => [newCV, ...prev]);
            setJobUrl("");
            navigate(`/cv-builder?id=${newCV.id}`);
        } catch (err) { setQuickCVError(err.message); }
        finally { setQuickCVLoading(false); }
    };

    // ── Application Handlers ──────────────────────────────
    const openNewApp = () => {
        setEditingApp(null);
        setAppForm(emptyForm);
        setShowAppModal(true);
    };

    const openEditApp = (app) => {
        setEditingApp(app);
        setAppForm({
            company: app.company, job_title: app.job_title,
            location: app.location || "", salary: app.salary || "",
            job_url: app.job_url || "", notes: app.notes || "",
            status: app.status || "Applied"
        });
        setShowAppModal(true);
    };

    const handleSaveApp = async () => {
        if (!appForm.company.trim() || !appForm.job_title.trim()) {
            setAppsError("Company and Job Title are required.");
            return;
        }
        setAppSaving(true);
        setAppsError("");
        try {
            if (editingApp) {
                const updated = await updateApplication(editingApp.id, appForm);
                setApplications(prev => prev.map(a => a.id === editingApp.id ? updated : a));
            } else {
                const created = await createApplication(appForm);
                setApplications(prev => [created, ...prev]);
            }
            setShowAppModal(false);
        } catch (err) { setAppsError(err.message); }
        finally { setAppSaving(false); }
    };

    const handleDeleteApp = async (id) => {
        try {
            await deleteApplication(id);
            setApplications(prev => prev.filter(a => a.id !== id));
            setAppDeleteConfirm(null);
        } catch (err) { setAppsError(err.message); }
    };

    const handleStatusChange = async (app, newStatus) => {
        try {
            const updated = await updateApplication(app.id, { ...app, status: newStatus });
            setApplications(prev => prev.map(a => a.id === app.id ? updated : a));
        } catch (err) { setAppsError(err.message); }
    };

    // ── Helpers ───────────────────────────────────────────
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

    const formatSalary = (salary, loc) => {
        if (!salary) return null;
        const isPolish = loc?.toLowerCase().includes("pol") ||
            loc?.toLowerCase().includes("warszawa") ||
            loc?.toLowerCase().includes("kraków") ||
            loc?.toLowerCase().includes("wrocław");
        return isPolish ? `${salary} PLN/yr` : salary;
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
                        <button className="secondary-btn" onClick={() => { localStorage.removeItem("token"); window.location.href = "/"; }}>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="dashboard-main">
                <div className="container">

                    {/* Hero */}
                    <section className="dashboard-hero">
                        <div>
                            <span className="eyebrow">Dashboard</span>
                            <h1>Welcome back, {user?.first_name || "..."}</h1>
                            <p>Manage your CVs, track applications, and find live job listings.</p>
                        </div>
                    </section>

                    {/* Tabs */}
                    <div className="dashboard-tabs">
                        <button className={`dashboard-tab ${activeTab === "cvs" ? "active" : ""}`} onClick={() => setActiveTab("cvs")}>My CVs</button>
                        <button className={`dashboard-tab ${activeTab === "jobs" ? "active" : ""}`} onClick={() => setActiveTab("jobs")}>Job Listings</button>
                        <button className={`dashboard-tab ${activeTab === "tracker" ? "active" : ""}`} onClick={() => setActiveTab("tracker")}>Application Tracker</button>
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
                                    <input type="url" placeholder="https://linkedin.com/jobs/view/..." value={jobUrl}
                                        onChange={e => setJobUrl(e.target.value)} className="quick-cv-input"
                                        onKeyDown={e => e.key === "Enter" && handleQuickCV()} />
                                    <button className="primary-btn" onClick={handleQuickCV} disabled={quickCVLoading}>
                                        {quickCVLoading ? "Generating..." : "Generate CV"}
                                    </button>
                                </div>
                                {quickCVError && <p className="auth-error">{quickCVError}</p>}
                                {quickCVLoading && <p className="quick-cv-loading">Fetching job posting and generating your CV... this takes about 10 seconds.</p>}
                            </div>

                            <div className="cvs-list-header">
                                <h2>My CVs ({cvs.length})</h2>
                                <button className="primary-btn" onClick={() => setShowTemplatePicker(true)}>+ Create New CV</button>
                            </div>

                            {cvsError && <p className="auth-error">{cvsError}</p>}
                            {cvsLoading && <p className="cvs-loading">Loading your CVs...</p>}
                            {!cvsLoading && cvs.length === 0 && <div className="cvs-empty"><p>No CVs yet. Create your first one or use Quick CV above.</p></div>}
                            {!cvsLoading && cvs.length > 0 && (
                                <div className="resume-list">
                                    {cvs.map(cv => (
                                        <div className="resume-row" key={cv.id}>
                                            <div className="resume-row-main">
                                                <h3>{cv.title}</h3>
                                                <p>Template: {cv.template || "minimal"} · Last updated: {formatDate(cv.updated_at || cv.created_at)}</p>
                                            </div>
                                            <div className="resume-row-meta" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
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
                            <div className="quick-cv-zone">
                                <div className="quick-cv-header">
                                    <div>
                                        <h2>Live Job Listings</h2>
                                        <p>Jobs fetched live from Remotive and Adzuna, filtered to match your preferences.</p>
                                    </div>
                                    <span className="eyebrow">Live</span>
                                </div>
                                <div className="jobs-filters" style={{ display: "flex", flexDirection: "row", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                                    <input type="text" placeholder="Job title or keyword" value={keyword}
                                        onChange={e => setKeyword(e.target.value)} className="quick-cv-input"
                                        onKeyDown={e => e.key === "Enter" && fetchJobs()} />
                                    <input type="text" placeholder="Location (e.g. Poland)" value={location}
                                        onChange={e => setLocation(e.target.value)} className="quick-cv-input"
                                        onKeyDown={e => e.key === "Enter" && fetchJobs()} />
                                    <select value={jobType} onChange={e => setJobType(e.target.value)} className="quick-cv-input">
                                        <option value="">Any type</option>
                                        <option value="full_time">Full time</option>
                                        <option value="contract">Contract</option>
                                        <option value="part_time">Part time</option>
                                    </select>
                                    <button className="primary-btn" onClick={fetchJobs} disabled={jobsLoading} style={{ whiteSpace: "nowrap" }}>
                                        {jobsLoading ? "Searching..." : "Search Jobs"}
                                    </button>
                                </div>
                            </div>

                            {jobsError && <p className="auth-error">{jobsError}</p>}
                            {jobsLoading && <div className="cvs-empty"><p>Fetching live jobs...</p></div>}
                            {!jobsLoading && !jobsFetched && <div className="cvs-empty"><p>Enter a keyword and click Search Jobs to see live listings.</p></div>}
                            {!jobsLoading && jobsFetched && jobs.length === 0 && <div className="cvs-empty"><p>No jobs found. Try a different keyword or location.</p></div>}
                            {!jobsLoading && jobs.length > 0 && (
                                <>
                                    <p style={{ marginBottom: "1rem", color: "var(--text-muted, #888)", fontSize: "14px" }}>{jobs.length} jobs found</p>
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
                                                                <span key={i} style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "999px", background: "var(--tag-bg, #f0f0f0)", color: "var(--tag-text, #555)" }}>{tag}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="resume-row-meta" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                                                    <a href={job.url} target="_blank" rel="noopener noreferrer" className="primary-btn small-btn" style={{ textDecoration: "none" }}>Apply</a>
                                                    <button className="secondary-btn small-btn" onClick={() => { setJobUrl(job.url); setActiveTab("cvs"); }} title="Generate a tailored CV for this job">Quick CV</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* ── Application Tracker Tab ── */}
                    {activeTab === "tracker" && (
                        <div className="dashboard-jobs-tab">

                            {/* Header */}
                            <div className="cvs-list-header">
                                <div>
                                    <h2>Application Tracker</h2>
                                    <p style={{ fontSize: "14px", opacity: 0.7, marginTop: "4px" }}>
                                        {applications.length} application{applications.length !== 1 ? "s" : ""} tracked
                                    </p>
                                </div>
                                <button className="primary-btn" onClick={openNewApp}>+ Add Application</button>
                            </div>

                            {/* Status summary pills */}
                            {applications.length > 0 && (
                                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                                    {STATUSES.map(s => {
                                        const count = applications.filter(a => a.status === s).length;
                                        if (!count) return null;
                                        return (
                                            <span key={s} style={{ ...STATUS_COLOURS[s], fontSize: "12px", fontWeight: 500, padding: "4px 12px", borderRadius: "999px" }}>
                                                {s}: {count}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}

                            {appsError && <p className="auth-error">{appsError}</p>}
                            {appsLoading && <div className="cvs-empty"><p>Loading applications...</p></div>}
                            {!appsLoading && applications.length === 0 && (
                                <div className="cvs-empty">
                                    <p>No applications yet. Click <strong>+ Add Application</strong> to start tracking.</p>
                                </div>
                            )}

                            {/* Applications list */}
                            {!appsLoading && applications.length > 0 && (
                                <div className="resume-list">
                                    {applications.map(app => (
                                        <div className="resume-row" key={app.id}>
                                            <div className="resume-row-main">
                                                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                                    <h3 style={{ margin: 0 }}>{app.job_title}</h3>
                                                    <span style={{ ...STATUS_COLOURS[app.status] || STATUS_COLOURS["Applied"], fontSize: "11px", fontWeight: 500, padding: "2px 10px", borderRadius: "999px" }}>
                                                        {app.status}
                                                    </span>
                                                </div>
                                                <p style={{ marginTop: "4px" }}>
                                                    <strong>{app.company}</strong>
                                                    {app.location && ` · ${app.location}`}
                                                    {app.salary && ` · ${app.salary}`}
                                                    {" · "}Applied {formatDate(app.applied_at)}
                                                </p>
                                                {app.notes && (
                                                    <p style={{ fontSize: "13px", opacity: 0.7, marginTop: "4px" }}>{app.notes}</p>
                                                )}
                                                {app.job_url && (
                                                    <a href={app.job_url} target="_blank" rel="noopener noreferrer"
                                                        style={{ fontSize: "12px", opacity: 0.6, marginTop: "4px", display: "inline-block" }}>
                                                        View job posting ↗
                                                    </a>
                                                )}

                                                {/* Inline status changer */}
                                                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                                                    {STATUSES.map(s => (
                                                        <button key={s} onClick={() => handleStatusChange(app, s)}
                                                            style={{
                                                                fontSize: "11px", padding: "2px 10px", borderRadius: "999px",
                                                                border: "1px solid", cursor: "pointer",
                                                                fontWeight: app.status === s ? 600 : 400,
                                                                ...(app.status === s ? STATUS_COLOURS[s] : { background: "transparent", color: "#888", borderColor: "#ddd" })
                                                            }}>
                                                            {s}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="resume-row-meta" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                                                <button className="secondary-btn small-btn" onClick={() => openEditApp(app)}>Edit</button>
                                                {appDeleteConfirm === app.id ? (
                                                    <>
                                                        <span className="delete-confirm-text">Sure?</span>
                                                        <button className="danger-btn small-btn" onClick={() => handleDeleteApp(app.id)}>Delete</button>
                                                        <button className="secondary-btn small-btn" onClick={() => setAppDeleteConfirm(null)}>Cancel</button>
                                                    </>
                                                ) : (
                                                    <button className="secondary-btn small-btn" onClick={() => setAppDeleteConfirm(app.id)}>Delete</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* ── Template Picker Modal ── */}
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
                                <div key={template.id} className={`template-card ${selectedTemplate === template.id ? "selected" : ""}`} onClick={() => setSelectedTemplate(template.id)}>
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

            {/* ── Add / Edit Application Modal ── */}
            {showAppModal && (
                <div className="modal-overlay" onClick={() => setShowAppModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: "520px" }}>
                        <div className="modal-header">
                            <h2>{editingApp ? "Edit Application" : "Add Application"}</h2>
                            <button className="modal-close" onClick={() => setShowAppModal(false)}>✕</button>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "0 0 1rem 0" }}>
                            {[
                                { label: "Company *", key: "company", placeholder: "e.g. Google" },
                                { label: "Job Title *", key: "job_title", placeholder: "e.g. Backend Engineer" },
                                { label: "Location", key: "location", placeholder: "e.g. Warsaw, Poland" },
                                { label: "Salary", key: "salary", placeholder: "e.g. 15,000 PLN/mo" },
                                { label: "Job URL", key: "job_url", placeholder: "https://..." },
                            ].map(({ label, key, placeholder }) => (
                                <div key={key} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                    <label style={{ fontSize: "13px", fontWeight: 500 }}>{label}</label>
                                    <input
                                        type="text" placeholder={placeholder} value={appForm[key]}
                                        onChange={e => setAppForm(prev => ({ ...prev, [key]: e.target.value }))}
                                        className="quick-cv-input" style={{ width: "100%", boxSizing: "border-box" }}
                                    />
                                </div>
                            ))}

                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <label style={{ fontSize: "13px", fontWeight: 500 }}>Status</label>
                                <select value={appForm.status} onChange={e => setAppForm(prev => ({ ...prev, status: e.target.value }))} className="quick-cv-input">
                                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                <label style={{ fontSize: "13px", fontWeight: 500 }}>Notes</label>
                                <textarea
                                    placeholder="Any notes about this application..."
                                    value={appForm.notes}
                                    onChange={e => setAppForm(prev => ({ ...prev, notes: e.target.value }))}
                                    className="quick-cv-input"
                                    rows={3}
                                    style={{ width: "100%", boxSizing: "border-box", resize: "vertical" }}
                                />
                            </div>
                        </div>

                        {appsError && <p className="auth-error">{appsError}</p>}

                        <div className="modal-footer">
                            <button className="secondary-btn" onClick={() => setShowAppModal(false)}>Cancel</button>
                            <button className="primary-btn" onClick={handleSaveApp} disabled={appSaving}>
                                {appSaving ? "Saving..." : editingApp ? "Save Changes" : "Add Application"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;