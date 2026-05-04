import { useMemo, useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getCV, updateCV } from "../api/cv";
import { getSections, createSection, updateSection, deleteSection } from "../api/cv_sections";

// ── Template 1 — Single column, left-aligned ──────────────────
function TemplateOne({ personalInfo, sections }) {
    const pi = personalInfo || {};
    return (
        <article className="cv-preview cv-template-one">
            <header className="cv-header">
                <h1>{pi.full_name || "Your Name"}</h1>
                {pi.professional_title && <h2>{pi.professional_title}</h2>}
                <div className="cv-contact-row">
                    {pi.phone && <span>{pi.phone}</span>}
                    {pi.email && <span>{pi.email}</span>}
                    {pi.location && <span>{pi.location}</span>}
                </div>
                <div className="cv-links-row">
                    {pi.linkedin && <span>{pi.linkedin}</span>}
                    {pi.github && <span>{pi.github}</span>}
                </div>
            </header>

            {sections.map(section => (
                <section key={section.id} className="cv-section">
                    <h3 className="cv-section-title">{section.name}</h3>
                    {renderSectionContent(section)}
                </section>
            ))}
        </article>
    );
}

// ── Template 2 — Two column: content left, info right ─────────
function TemplateTwo({ personalInfo, sections }) {
    const pi = personalInfo || {};
    return (
        <article className="cv-preview cv-template-two">
            {/* Header always on the left — same as Template 1 */}
            <header className="cv-header">
                <h1>{pi.full_name || "Your Name"}</h1>
                {pi.professional_title && <h2>{pi.professional_title}</h2>}
                <div className="cv-contact-row">
                    {pi.phone && <span>{pi.phone}</span>}
                    {pi.email && <span>{pi.email}</span>}
                    {pi.location && <span>{pi.location}</span>}
                </div>
                <div className="cv-links-row">
                    {pi.linkedin && <span>{pi.linkedin}</span>}
                    {pi.github && <span>{pi.github}</span>}
                </div>
            </header>

            {/* Two-column layout applies only to the sections below */}
            <div className="cv-t2-layout">
                <div className="cv-t2-main">
                    {sections.filter((_, i) => i % 2 === 0).map(section => (
                        <section key={section.id} className="cv-section">
                            <h3 className="cv-section-title">{section.name}</h3>
                            {renderSectionContent(section)}
                        </section>
                    ))}
                </div>
                <div className="cv-t2-sidebar">
                    {sections.filter((_, i) => i % 2 !== 0).map(section => (
                        <section key={section.id} className="cv-section">
                            <h3 className="cv-section-title">{section.name}</h3>
                            {renderSectionContent(section)}
                        </section>
                    ))}
                </div>
            </div>
        </article>
    );
}

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
                            {entry.date && <span className="cv-entry-date"> ({entry.date})</span>}
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

// ── Section editor components ──────────────────────────────────
function TextSectionEditor({ content, onChange }) {
    return (
        <div className="input-group">
            <label>Content</label>
            <textarea
                rows="5"
                value={content.value || ""}
                onChange={e => onChange({ value: e.target.value })}
                placeholder="Write your content here..."
            />
        </div>
    );
}

function BulletsSectionEditor({ content, onChange }) {
    const items = content.items || [];
    const [newItem, setNewItem] = useState("");

    const addItem = () => {
        const trimmed = newItem.trim();
        if (!trimmed) return;
        onChange({ items: [...items, trimmed] });
        setNewItem("");
    };

    const removeItem = (index) => {
        onChange({ items: items.filter((_, i) => i !== index) });
    };

    const updateItem = (index, value) => {
        const updated = [...items];
        updated[index] = value;
        onChange({ items: updated });
    };

    return (
        <div>
            <div className="builder-skill-input-row">
                <input
                    type="text"
                    placeholder="Add item"
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addItem()}
                />
                <button className="primary-btn" onClick={addItem}>Add</button>
            </div>
            <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.75rem" }}>
                {items.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: "0.5rem" }}>
                        <input
                            type="text"
                            value={item}
                            onChange={e => updateItem(i, e.target.value)}
                            style={{
                                flex: 1, border: "1px solid #d9e2ef",
                                borderRadius: "0.95rem", padding: "0.65rem 1rem",
                                font: "inherit"
                            }}
                        />
                        <button className="danger-btn small-btn" onClick={() => removeItem(i)}>×</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SubsectionsSectionEditor({ content, onChange }) {
    const entries = content.entries || [];

    const addEntry = () => {
        onChange({
            entries: [...entries, { title: "", subtitle: "", date: "", bullets: [""] }]
        });
    };

    const removeEntry = (index) => {
        onChange({ entries: entries.filter((_, i) => i !== index) });
    };

    const updateEntry = (index, field, value) => {
        const updated = [...entries];
        updated[index] = { ...updated[index], [field]: value };
        onChange({ entries: updated });
    };

    const addBullet = (entryIndex) => {
        const updated = [...entries];
        updated[entryIndex].bullets = [...(updated[entryIndex].bullets || []), ""];
        onChange({ entries: updated });
    };

    const updateBullet = (entryIndex, bulletIndex, value) => {
        const updated = [...entries];
        updated[entryIndex].bullets[bulletIndex] = value;
        onChange({ entries: updated });
    };

    const removeBullet = (entryIndex, bulletIndex) => {
        const updated = [...entries];
        updated[entryIndex].bullets = updated[entryIndex].bullets.filter((_, i) => i !== bulletIndex);
        onChange({ entries: updated });
    };

    return (
        <div style={{ display: "grid", gap: "1rem" }}>
            {entries.map((entry, i) => (
                <div key={i} className="builder-card-block">
                    <div className="builder-card-header">
                        <h4>Entry {i + 1}</h4>
                        <button className="danger-btn small-btn" onClick={() => removeEntry(i)}>Remove</button>
                    </div>
                    <div className="builder-form-grid">
                        <div className="input-group">
                            <label>Title</label>
                            <input type="text" value={entry.title}
                                onChange={e => updateEntry(i, "title", e.target.value)}
                                placeholder="Role / Project / Institution" />
                        </div>
                        <div className="input-group">
                            <label>Subtitle</label>
                            <input type="text" value={entry.subtitle || ""}
                                onChange={e => updateEntry(i, "subtitle", e.target.value)}
                                placeholder="Company / Organisation" />
                        </div>
                        <div className="input-group builder-full-width">
                            <label>Date</label>
                            <input type="text" value={entry.date || ""}
                                onChange={e => updateEntry(i, "date", e.target.value)}
                                placeholder="e.g. 2022 – 2024" />
                        </div>
                    </div>
                    <div style={{ marginTop: "0.75rem" }}>
                        <label style={{ fontWeight: 600, fontSize: "0.95rem" }}>Bullet points</label>
                        <div style={{ display: "grid", gap: "0.5rem", marginTop: "0.5rem" }}>
                            {(entry.bullets || []).map((bullet, j) => (
                                <div key={j} style={{ display: "flex", gap: "0.5rem" }}>
                                    <input
                                        type="text"
                                        value={bullet}
                                        onChange={e => updateBullet(i, j, e.target.value)}
                                        placeholder={`Bullet ${j + 1}`}
                                        style={{
                                            flex: 1, border: "1px solid #d9e2ef",
                                            borderRadius: "0.95rem", padding: "0.65rem 1rem",
                                            font: "inherit"
                                        }}
                                    />
                                    <button className="danger-btn small-btn"
                                        onClick={() => removeBullet(i, j)}>×</button>
                                </div>
                            ))}
                        </div>
                        <button
                            className="secondary-btn small-btn"
                            style={{ marginTop: "0.5rem" }}
                            onClick={() => addBullet(i)}
                        >
                            + Bullet
                        </button>
                    </div>
                </div>
            ))}
            <button className="primary-btn" onClick={addEntry}>+ Add Entry</button>
        </div>
    );
}

// ── Main CVBuilder component ───────────────────────────────────
function CVBuilder() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const cvId = searchParams.get("id");

    const [cv, setCv] = useState(null);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [error, setError] = useState("");

    // New section form state
    const [newSectionName, setNewSectionName] = useState("");
    const [newSectionType, setNewSectionType] = useState("text");
    const [showAddSection, setShowAddSection] = useState(false);

    // Which section is expanded in the editor
    const [expandedSection, setExpandedSection] = useState(null);

    // ── Load CV and sections ───────────────────────────────────
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

    // ── Save CV personal info ──────────────────────────────────
    const handleSaveCV = async () => {
        if (!cvId || !cv) return;
        setSaving(true);
        try {
            await updateCV(cvId, cv);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // ── Personal info change ───────────────────────────────────
    const handlePersonalInfoChange = (field, value) => {
        setCv(prev => ({
            ...prev,
            personal_info: { ...prev.personal_info, [field]: value }
        }));
    };

    // ── Section handlers ───────────────────────────────────────
    const handleAddSection = async () => {
        if (!newSectionName.trim()) return;

        const defaultContent = {
            text: { value: "" },
            bullets: { items: [] },
            subsections: { entries: [] }
        };

        try {
            const newSection = await createSection(cvId, {
                name: newSectionName.trim(),
                type: newSectionType,
                content: defaultContent[newSectionType],
                order_index: sections.length
            });
            setSections(prev => [...prev, newSection]);
            setNewSectionName("");
            setNewSectionType("text");
            setShowAddSection(false);
            setExpandedSection(newSection.id);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpdateSectionName = async (sectionId, newName) => {
        try {
            const updated = await updateSection(cvId, sectionId, { name: newName });
            setSections(prev => prev.map(s => s.id === sectionId ? updated : s));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpdateSectionContent = useCallback(async (sectionId, newContent) => {
        // Update local state immediately for responsive UI
        setSections(prev => prev.map(s =>
            s.id === sectionId ? { ...s, content: newContent } : s
        ));
        // Debounce the API call — save after user stops typing
        try {
            await updateSection(cvId, sectionId, { content: newContent });
        } catch (err) {
            setError(err.message);
        }
    }, [cvId]);

    const handleDeleteSection = async (sectionId) => {
        try {
            await deleteSection(cvId, sectionId);
            setSections(prev => prev.filter(s => s.id !== sectionId));
            if (expandedSection === sectionId) setExpandedSection(null);
        } catch (err) {
            setError(err.message);
        }
    };

    // ── Loading state ──────────────────────────────────────────
    if (loading) {
        return (
            <div className="builder-page">
                <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
                    <p>Loading CV...</p>
                </div>
            </div>
        );
    }

    const pi = cv?.personal_info || {};

    // ── Render ─────────────────────────────────────────────────
    return (
        <div className="builder-page">
            <header className="dashboard-topbar">
                <div className="container dashboard-topbar-content">
                    <Link to="/" className="brand auth-brand">
                        <div className="brand-mark">S</div>
                        <span>SmartCV</span>
                    </Link>
                    <div className="dashboard-topbar-actions">
                        <Link to="/dashboard" className="ghost-btn nav-link-btn">Dashboard</Link>
                        <Link to="/profile" className="ghost-btn nav-link-btn">My Profile</Link>
                        {saveSuccess && (
                            <span style={{ color: "#166534", fontWeight: 600, fontSize: "0.92rem" }}>✓ Saved</span>
                        )}
                        <button className="primary-btn" onClick={handleSaveCV} disabled={saving || !cvId}>
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>
            </header>

            <main className="builder-main">
                <div className="container">
                    {error && <p className="auth-error" style={{ marginBottom: "1rem" }}>{error}</p>}

                    <section className="builder-hero">
                        <div>
                            <span className="eyebrow">CV Builder</span>
                            <h1>{cv?.title || "My CV"}</h1>
                            <p>Template: <strong>{cv?.template || "minimal"}</strong></p>
                        </div>
                        <div className="builder-hero-actions">
                            <button className="secondary-btn">Generate PDF</button>
                        </div>
                    </section>

                    <section className="builder-layout">
                        {/* ── Editor Panel ── */}
                        <div className="builder-editor-panel">
                            <div className="builder-panel-header">
                                <h2>CV Editor</h2>
                                <p>Edit sections and personal info. Preview updates live.</p>
                            </div>

                            {/* Personal Info */}
                            <div className="builder-form-block">
                                <h3>Personal Information</h3>
                                <div className="builder-form-grid">
                                    <div className="input-group">
                                        <label>Full Name</label>
                                        <input type="text" value={pi.full_name || ""}
                                            onChange={e => handlePersonalInfoChange("full_name", e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label>Professional Title</label>
                                        <input type="text" value={pi.professional_title || ""}
                                            onChange={e => handlePersonalInfoChange("professional_title", e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label>Email</label>
                                        <input type="email" value={pi.email || ""}
                                            onChange={e => handlePersonalInfoChange("email", e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label>Phone</label>
                                        <input type="text" value={pi.phone || ""}
                                            onChange={e => handlePersonalInfoChange("phone", e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label>Location</label>
                                        <input type="text" value={pi.location || ""}
                                            onChange={e => handlePersonalInfoChange("location", e.target.value)} />
                                    </div>
                                    <div className="input-group">
                                        <label>LinkedIn</label>
                                        <input type="text" value={pi.linkedin || ""}
                                            onChange={e => handlePersonalInfoChange("linkedin", e.target.value)} />
                                    </div>
                                    <div className="input-group builder-full-width">
                                        <label>GitHub</label>
                                        <input type="text" value={pi.github || ""}
                                            onChange={e => handlePersonalInfoChange("github", e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            {/* Dynamic Sections */}
                            <div className="builder-form-block">
                                <div className="builder-section-title-row">
                                    <h3>CV Sections</h3>
                                    <button
                                        className="primary-btn small-btn"
                                        onClick={() => setShowAddSection(true)}
                                    >
                                        + Add Section
                                    </button>
                                </div>

                                {/* Add section form */}
                                {showAddSection && (
                                    <div className="builder-card-block" style={{ marginTop: "1rem" }}>
                                        <h4>New Section</h4>
                                        <div className="builder-form-grid">
                                            <div className="input-group">
                                                <label>Section Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. About Me, Skills, Experience"
                                                    value={newSectionName}
                                                    onChange={e => setNewSectionName(e.target.value)}
                                                    onKeyDown={e => e.key === "Enter" && handleAddSection()}
                                                />
                                            </div>
                                            <div className="input-group">
                                                <label>Section Type</label>
                                                <select
                                                    value={newSectionType}
                                                    onChange={e => setNewSectionType(e.target.value)}
                                                    style={{
                                                        border: "1px solid #d9e2ef",
                                                        borderRadius: "0.95rem",
                                                        padding: "0.95rem 1rem",
                                                        font: "inherit",
                                                        background: "white"
                                                    }}
                                                >
                                                    <option value="text">Text — paragraph (About Me, Summary)</option>
                                                    <option value="bullets">Bullets — flat list (Skills, Interests)</option>
                                                    <option value="subsections">Subsections — entries with bullets (Experience, Projects)</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem" }}>
                                            <button className="primary-btn" onClick={handleAddSection}>
                                                Create Section
                                            </button>
                                            <button className="secondary-btn" onClick={() => setShowAddSection(false)}>
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {sections.length === 0 && !showAddSection && (
                                    <p style={{ color: "#64748b", marginTop: "1rem" }}>
                                        No sections yet. Click "+ Add Section" to start building your CV.
                                    </p>
                                )}

                                {/* Section list */}
                                {sections.map(section => (
                                    <div key={section.id} className="builder-card-block" style={{ marginTop: "1rem" }}>
                                        <div className="builder-card-header">
                                            {/* Editable section name */}
                                            <input
                                                type="text"
                                                value={section.name}
                                                onChange={e => {
                                                    // Update local state immediately
                                                    setSections(prev => prev.map(s =>
                                                        s.id === section.id ? { ...s, name: e.target.value } : s
                                                    ));
                                                }}
                                                onBlur={e => handleUpdateSectionName(section.id, e.target.value)}
                                                style={{
                                                    fontWeight: 700,
                                                    fontSize: "1rem",
                                                    border: "1px solid transparent",
                                                    borderRadius: "0.5rem",
                                                    padding: "0.25rem 0.5rem",
                                                    background: "transparent",
                                                    font: "inherit",
                                                    cursor: "text"
                                                }}
                                                onFocus={e => e.target.style.borderColor = "#6366f1"}
                                            />
                                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                                <button
                                                    className="secondary-btn small-btn"
                                                    onClick={() => setExpandedSection(
                                                        expandedSection === section.id ? null : section.id
                                                    )}
                                                >
                                                    {expandedSection === section.id ? "Collapse" : "Edit"}
                                                </button>
                                                <button
                                                    className="danger-btn small-btn"
                                                    onClick={() => handleDeleteSection(section.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>

                                        {/* Section type badge */}
                                        <span style={{
                                            fontSize: "0.82rem",
                                            color: "#64748b",
                                            background: "#f1f5f9",
                                            borderRadius: "999px",
                                            padding: "0.2rem 0.6rem",
                                            display: "inline-block",
                                            marginBottom: expandedSection === section.id ? "1rem" : 0
                                        }}>
                                            {section.type}
                                            {section.ai_enhanced && " · ✨ AI enhanced"}
                                        </span>

                                        {/* Section content editor — only shown when expanded */}
                                        {expandedSection === section.id && (
                                            <div style={{ marginTop: "0.75rem" }}>
                                                {section.type === "text" && (
                                                    <TextSectionEditor
                                                        content={section.content}
                                                        onChange={content => handleUpdateSectionContent(section.id, content)}
                                                    />
                                                )}
                                                {section.type === "bullets" && (
                                                    <BulletsSectionEditor
                                                        content={section.content}
                                                        onChange={content => handleUpdateSectionContent(section.id, content)}
                                                    />
                                                )}
                                                {section.type === "subsections" && (
                                                    <SubsectionsSectionEditor
                                                        content={section.content}
                                                        onChange={content => handleUpdateSectionContent(section.id, content)}
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Preview Panel ── */}
                        <div className="builder-preview-panel">
                            <div className="builder-panel-header">
                                <h2>Live Preview</h2>
                                <p>
                                    {cv?.template === "modern" ? "Template 2 — Two column" : "Template 1 — Single column"}
                                </p>
                            </div>

                            {cv?.template === "modern" ? (
                                <TemplateTwo personalInfo={cv?.personal_info} sections={sections} />
                            ) : (
                                <TemplateOne personalInfo={cv?.personal_info} sections={sections} />
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default CVBuilder;