import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { getCV } from "../api/cv";
import { getSections } from "../api/cv_sections";

// ── Shared section content renderer ───────────────────────────
function renderSectionContent(section) {
    const { type, content } = section;

    if (type === "text") {
        return <p className="cv-section-text">{content.value || ""}</p>;
    }

    if (type === "bullets") {
        const items = content.items || [];
        if (items.length === 0) return null;
        return (
            <ul className="cv-bullet-list">
                {items.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
        );
    }

    if (type === "subsections") {
        const entries = content.entries || [];
        return (
            <div className="cv-subsections">
                {entries.map((entry, i) => (
                    <div key={i} className="cv-subsection-entry">
                        <div className="cv-subsection-header">
                            <strong>{entry.title}</strong>
                            {entry.subtitle && <span> | {entry.subtitle}</span>}
                            {entry.date && (
                                <span className="cv-entry-date"> ({entry.date})</span>
                            )}
                        </div>
                        {entry.bullets && entry.bullets.length > 0 && (
                            <ul className="cv-bullet-list">
                                {entry.bullets.map((b, j) => <li key={j}>{b}</li>)}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        );
    }

    return null;
}

// ── Template 1 — Single column ─────────────────────────────────
function TemplateOne({ cv, sections }) {
    const pi = cv?.personal_info || {};
    return (
        <div className="cvp-page cvp-template-one">
            <header className="cvp-header">
                <h1>{pi.full_name || "Your Name"}</h1>
                {pi.professional_title && (
                    <p className="cvp-title">{pi.professional_title}</p>
                )}
                {cv?.brief_intro && (
                    <p className="cvp-intro">{cv.brief_intro}</p>
                )}
                <div className="cvp-contact">
                    {pi.email && <span>{pi.email}</span>}
                    {pi.phone && <span>{pi.phone}</span>}
                    {pi.location && <span>{pi.location}</span>}
                    {pi.linkedin && <span>{pi.linkedin}</span>}
                    {pi.github && <span>{pi.github}</span>}
                </div>
            </header>

            <div className="cvp-body">
                {sections.map(section => (
                    <section key={section.id} className="cvp-section">
                        <h2 className="cvp-section-title">{section.name}</h2>
                        {renderSectionContent(section)}
                    </section>
                ))}
            </div>
        </div>
    );
}

// ── Template 2 — Two column ────────────────────────────────────
function TemplateTwo({ cv, sections }) {
    const pi = cv?.personal_info || {};
    const leftSections = sections.filter((_, i) => i % 2 === 0);
    const rightSections = sections.filter((_, i) => i % 2 !== 0);

    return (
        <div className="cvp-page cvp-template-two">
            <header className="cvp-header">
                <h1>{pi.full_name || "Your Name"}</h1>
                {pi.professional_title && (
                    <p className="cvp-title">{pi.professional_title}</p>
                )}
                {cv?.brief_intro && (
                    <p className="cvp-intro">{cv.brief_intro}</p>
                )}
                <div className="cvp-contact">
                    {pi.email && <span>{pi.email}</span>}
                    {pi.phone && <span>{pi.phone}</span>}
                    {pi.location && <span>{pi.location}</span>}
                    {pi.linkedin && <span>{pi.linkedin}</span>}
                    {pi.github && <span>{pi.github}</span>}
                </div>
            </header>

            <div className="cvp-two-col">
                <div className="cvp-col-main">
                    {leftSections.map(section => (
                        <section key={section.id} className="cvp-section">
                            <h2 className="cvp-section-title">{section.name}</h2>
                            {renderSectionContent(section)}
                        </section>
                    ))}
                </div>
                <div className="cvp-col-side">
                    {rightSections.map(section => (
                        <section key={section.id} className="cvp-section">
                            <h2 className="cvp-section-title">{section.name}</h2>
                            {renderSectionContent(section)}
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── Main Preview Page ──────────────────────────────────────────
function CVPreview() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const cvId = searchParams.get("id");

    const [cv, setCv] = useState(null);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/signin"); return; }
        if (!cvId) { setLoading(false); return; }

        Promise.all([getCV(cvId), getSections(cvId)])
            .then(([cvData, sectionsData]) => {
                setCv(cvData);
                setSections(sectionsData);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [cvId, navigate]);

    if (loading) {
        return (
            <div className="cvp-loading">
                <p>Loading preview...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="cvp-loading">
                <p style={{ color: "#b91c1c" }}>{error}</p>
            </div>
        );
    }

    return (
        <div className="cvp-shell">
            {/* Toolbar */}
            <div className="cvp-toolbar">
                <div className="cvp-toolbar-left">
                    <Link to="/" className="brand" style={{ textDecoration: "none" }}>
                        <div className="brand-mark">S</div>
                        <span>SmartCV</span>
                    </Link>
                    <span className="cvp-cv-title">{cv?.title || "CV Preview"}</span>
                </div>
                <div className="cvp-toolbar-right">
                    <button
                        className="ghost-btn"
                        onClick={() => navigate(`/cv-builder?id=${cvId}`)}
                    >
                        ← Edit CV
                    </button>
                    <button
                        className="secondary-btn"
                        onClick={() => window.print()}
                    >
                        Print / Save PDF
                    </button>
                    <Link to="/dashboard" className="primary-btn nav-link-btn">
                        Dashboard
                    </Link>
                </div>
            </div>

            {/* CV Document */}
            <div className="cvp-canvas">
                {cv?.template === "modern" ? (
                    <TemplateTwo cv={cv} sections={sections} />
                ) : (
                    <TemplateOne cv={cv} sections={sections} />
                )}
            </div>
        </div>
    );
}

export default CVPreview;