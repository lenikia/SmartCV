import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProfile } from "../api/profile";
import { getCVs, deleteCV, createCV, generateCVFromUrl } from "../api/cv";
import { createSection } from "../api/cv_sections";

function Dashboard() {
    const navigate = useNavigate();

    // ── State ─────────────────────────────────────────────
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState("cvs");

    // CV tab state
    const [cvs, setCVs] = useState([]);
    const [cvsLoading, setCvsLoading] = useState(true);
    const [cvsError, setCvsError] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState(null); // cv_id to confirm delete

    // Template picker modal state
    const [showTemplatePicker, setShowTemplatePicker] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState("minimal");

    // Quick CV state
    const [jobUrl, setJobUrl] = useState("");
    const [quickCVLoading, setQuickCVLoading] = useState(false);
    const [quickCVError, setQuickCVError] = useState("");

    // ── Auth + profile guard ───────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/signin");
            return;
        }

        getProfile()
            .then(profile => {
                if (!profile) {
                    navigate("/");
                } else {
                    setUser(profile);
                }
            })
            .catch(() => {
                localStorage.removeItem("token");
                navigate("/signin");
            });
    }, [navigate]);

    // ── Fetch CVs when user is loaded ─────────────────────
    useEffect(() => {
        if (!user) return;

        setCvsLoading(true);
        getCVs()
            .then(data => setCVs(data))
            .catch(err => setCvsError(err.message))
            .finally(() => setCvsLoading(false));
    }, [user]);

    // ── Handlers ──────────────────────────────────────────
    const handleDelete = async (cvId) => {
        try {
            await deleteCV(cvId);
            // Remove from local state — no need to refetch
            setCVs(prev => prev.filter(cv => cv.id !== cvId));
            setDeleteConfirm(null);
        } catch (err) {
            setCvsError(err.message);
        }
    };

    const handleCreateCV = async () => {
    console.log("Create CV clicked, user:", user);

    if (!user) {
        setCvsError("Profile not loaded.");
        setShowTemplatePicker(false);
        return;
    }

    // Define sections BEFORE the try block so they're in scope
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

    const defaultSections = selectedTemplate === "modern"
        ? template2Sections
        : template1Sections;

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
                location: user.address
                    ? `${user.address}, ${user.country}`
                    : user.country || ""
            },
            summary: "",
            education: {},
            skills: [],
            experience: [],
            projects: []
        });

        console.log("CV created:", newCV);
        console.log("Creating sections:", defaultSections.length);

        await Promise.all(
            defaultSections.map(section => createSection(newCV.id, section))
        );

        console.log("Sections created successfully");
        navigate(`/cv-builder?id=${newCV.id}`);
    } catch (err) {
        console.log("Error:", err.message);
        setCvsError(err.message);
    }
};

    const handleQuickCV = async () => {
    if (!jobUrl.trim()) {
        setQuickCVError("Please paste a job posting URL.");
        return;
    }

    if (!jobUrl.startsWith("http")) {
        setQuickCVError("Please enter a valid URL starting with http or https.");
        return;
    }

    setQuickCVError("");
    setQuickCVLoading(true);

    try {
        // Generate tailored content from job URL
        const result = await generateCVFromUrl(jobUrl, {});
        const ai = result.enhanced_sections;

        if (ai.error) {
            setQuickCVError("AI could not parse the job posting. Try a different URL.");
            setQuickCVLoading(false);
            return;
        }

        // Create the CV shell
        const newCV = await createCV({
            title: `Quick CV — ${new Date().toLocaleDateString()}`,
            template: "minimal",
            personal_info: {
                full_name: `${user.first_name} ${user.last_name}`,
                email: user.email,
                phone: user.phone || "",
                professional_title: user.preferred_job_title || "",
                location: user.address
                    ? `${user.address}, ${user.country}`
                    : user.country || "",
                linkedin: "",
                github: ""
            },
            summary: ai.about_me || "",
            education: {},
            skills: [],
            experience: [],
            projects: []
        });

        // Build sections from AI response — matching Template 1 structure
        const sectionsToCreate = [
            {
                name: "About Me",
                type: "text",
                content: { value: ai.about_me || "" },
                order_index: 0
            },
            {
                name: "Skills",
                type: "subsections",
                content: {
                    entries: [
                        {
                            title: "Programming Languages",
                            subtitle: "", date: "",
                            bullets: ai.skills?.programming || []
                        },
                        {
                            title: "Tools & Platforms",
                            subtitle: "", date: "",
                            bullets: ai.skills?.tools || []
                        },
                        ...(ai.skills?.other?.length ? [{
                            title: "Other",
                            subtitle: "", date: "",
                            bullets: ai.skills.other
                        }] : [])
                    ]
                },
                order_index: 1
            },
            {
                name: "Experience",
                type: "subsections",
                content: {
                    entries: (ai.experience || []).map(e => ({
                        title: e.title || e.role || "",
                        subtitle: e.subtitle || e.company || "",
                        date: e.date || "",
                        bullets: e.bullets || []
                    }))
                },
                order_index: 2
            },
            {
                name: "Soft Skills",
                type: "bullets",
                content: { items: ai.soft_skills || [] },
                order_index: 3
            },
            {
                name: "University Projects",
                type: "subsections",
                content: {
                    entries: (ai.university_projects || []).map(p => ({
                        title: p.title || p.name || "",
                        subtitle: p.subtitle || p.duration || "",
                        date: p.date || "",
                        bullets: p.bullets || []
                    }))
                },
                order_index: 4
            },
            {
                name: "Personal Projects",
                type: "subsections",
                content: {
                    entries: (ai.personal_projects || []).map(p => ({
                        title: p.title || p.name || "",
                        subtitle: p.subtitle || p.duration || "",
                        date: p.date || "",
                        bullets: p.bullets || []
                    }))
                },
                order_index: 5
            },
            {
                name: "Interests",
                type: "bullets",
                content: { items: ai.interests || [] },
                order_index: 6
            },
            {
                name: "Education",
                type: "subsections",
                content: {
                    entries: (ai.education || []).map(e => ({
                        title: e.title || e.institution || "",
                        subtitle: e.subtitle || e.degree || "",
                        date: e.date || e.year || "",
                        bullets: e.bullets || []
                    }))
                },
                order_index: 7
            }
        ];

        // Create all sections in parallel
        await Promise.all(
            sectionsToCreate.map(section => createSection(newCV.id, section))
        );

        // Add to local CV list and navigate to builder
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
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString();
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
                        <button
                            className="secondary-btn"
                            onClick={() => {
                                localStorage.removeItem("token");
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

                    {/* ── Hero ── */}
                    <section className="dashboard-hero">
                        <div>
                            <span className="eyebrow">Dashboard</span>
                            <h1>Welcome back, {user?.first_name || "..."}</h1>
                            <p>Manage your CVs, track applications, and generate tailored resumes.</p>
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
                            Job Tracker
                        </button>
                    </div>

                    {/* ── CVs Tab ── */}
                    {activeTab === "cvs" && (
                        <div className="dashboard-cvs-tab">

                            {/* Quick CV zone */}
                            <div className="quick-cv-zone">
                                <div className="quick-cv-header">
                                    <div>
                                        <h2>Quick CV</h2>
                                        <p>
                                            Paste a job posting URL and SmartCV will generate
                                            a tailored CV from your profile instantly.
                                        </p>
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
                                    <button
                                        className="primary-btn"
                                        onClick={handleQuickCV}
                                        disabled={quickCVLoading}
                                    >
                                        {quickCVLoading ? "Generating..." : "Generate CV"}
                                    </button>
                                </div>

                                {quickCVError && (
                                    <p className="auth-error">{quickCVError}</p>
                                )}

                                {quickCVLoading && (
                                    <p className="quick-cv-loading">
                                        Fetching job posting and generating your CV...
                                        this takes about 10 seconds.
                                    </p>
                                )}
                            </div>

                            {/* Create new CV button */}
                            <div className="cvs-list-header">
                                <h2>My CVs ({cvs.length})</h2>
                                <button
                                    className="primary-btn"
                                    onClick={() => setShowTemplatePicker(true)}
                                >
                                    + Create New CV
                                </button>
                            </div>

                            {/* Error */}
                            {cvsError && <p className="auth-error">{cvsError}</p>}

                            {/* Loading */}
                            {cvsLoading && (
                                <p className="cvs-loading">Loading your CVs...</p>
                            )}

                            {/* Empty state */}
                            {!cvsLoading && cvs.length === 0 && (
                                <div className="cvs-empty">
                                    <p>No CVs yet. Create your first one or use Quick CV above.</p>
                                </div>
                            )}

                            {/* CV list */}
                            {!cvsLoading && cvs.length > 0 && (
                                <div className="resume-list">
                                    {cvs.map(cv => (
                                        <div className="resume-row" key={cv.id}>
                                            <div className="resume-row-main">
                                                <h3>{cv.title}</h3>
                                                <p>
                                                    Template: {cv.template || "minimal"} ·
                                                    Last updated: {formatDate(cv.updated_at || cv.created_at)}
                                                </p>
                                            </div>

                                            <div className="resume-row-meta">
                                                <button
                                                    className="primary-btn small-btn"
                                                    onClick={() => navigate(`/cv-builder?id=${cv.id}`)}
                                                >
                                                    Open
                                                </button>

                                                {deleteConfirm === cv.id ? (
                                                    <>
                                                        <span className="delete-confirm-text">
                                                            Are you sure?
                                                        </span>
                                                        <button
                                                            className="danger-btn small-btn"
                                                            onClick={() => handleDelete(cv.id)}
                                                        >
                                                            Yes, delete
                                                        </button>
                                                        <button
                                                            className="secondary-btn small-btn"
                                                            onClick={() => setDeleteConfirm(null)}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        className="secondary-btn small-btn"
                                                        onClick={() => setDeleteConfirm(cv.id)}
                                                    >
                                                        Delete
                                                    </button>
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
                            <div className="cvs-empty">
                                <p>Job tracker coming soon — Task 3.</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ── Template picker modal ── */}
            {showTemplatePicker && (
                <div className="modal-overlay" onClick={() => setShowTemplatePicker(false)}>
                    {console.log("Modal rendering, showTemplatePicker:", showTemplatePicker)}
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Choose a template</h2>
                            <button
                                className="modal-close"
                                onClick={() => setShowTemplatePicker(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="template-grid">
                            {[
                                {
                                    id: "minimal",
                                    name: "Minimal",
                                    description: "Clean single column, lots of whitespace"
                                },
                                {
                                    id: "modern",
                                    name: "Modern",
                                    description: "Sidebar layout with accent colours"
                                },
                                {
                                    id: "classic",
                                    name: "Classic",
                                    description: "Traditional professional layout"
                                }
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
                            <button
                                className="secondary-btn"
                                onClick={() => setShowTemplatePicker(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="primary-btn"
                                onClick={handleCreateCV}
                            >
                                Create CV
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;