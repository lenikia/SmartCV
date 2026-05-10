import { Link } from "react-router-dom";

function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "€0",
      period: "/month",
      description:
        "A good starting point for users who want to build and review a resume with essential features.",
      features: [
        "Basic CV builder",
        "Single resume version",
        "Basic ATS overview",
        "Template browsing",
        "Basic improvement suggestions",
      ],
      buttonText: "Start Free",
      buttonClass: "secondary-btn",
      highlight: false,
    },
    {
      name: "Pro",
      price: "€9",
      period: "/month",
      description:
        "Ideal for active job seekers who want stronger ATS analysis, role targeting, and better resume refinement.",
      features: [
        "Advanced CV builder",
        "Multiple resume versions",
        "Detailed ATS score breakdown",
        "Job-specific resume tailoring",
        "Expanded improvement suggestions",
        "Priority access to future tools",
      ],
      buttonText: "Choose Pro",
      buttonClass: "primary-btn",
      highlight: true,
    },
    {
      name: "Career Plus",
      price: "€19",
      period: "/month",
      description:
        "Designed for users who want a more complete workflow for resume optimization, targeting, and profile growth.",
      features: [
        "Everything in Pro",
        "Advanced role alignment insights",
        "Enhanced keyword guidance",
        "Priority support",
        "Future export and profile tools",
        "Expanded personalization options",
      ],
      buttonText: "Go Premium",
      buttonClass: "secondary-btn",
      highlight: false,
    },
  ];

  return (
    <div className="pricing-page">
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
            <Link to="/templates" className="secondary-btn nav-link-btn">
              Templates
            </Link>
          </div>
        </div>
      </header>

      <main className="pricing-main">
        <div className="container">
          <section className="pricing-hero">
            <span className="eyebrow">Pricing</span>
            <h1>Choose a plan that matches your career goals</h1>
            <p>
              SmartCV pricing is designed to support different stages of resume
              building, ATS readiness, and job application preparation. Start
              simple or unlock more advanced tools as your needs grow.
            </p>
          </section>

          <section className="pricing-grid">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`pricing-card ${plan.highlight ? "highlight-plan" : ""}`}
              >
                <div className="pricing-card-top">
                  <div>
                    <p className="pricing-plan-name">{plan.name}</p>
                    <div className="pricing-price-row">
                      <h2>{plan.price}</h2>
                      <span>{plan.period}</span>
                    </div>
                  </div>

                  {plan.highlight && <span className="pricing-badge">Most Popular</span>}
                </div>

                <p className="pricing-description">{plan.description}</p>

                <div className="pricing-feature-list">
                  {plan.features.map((feature) => (
                    <div key={feature} className="pricing-feature-item">
                      <span className="pricing-check">✓</span>
                      <p>{feature}</p>
                    </div>
                  ))}
                </div>

                <Link to="/signup" className={`${plan.buttonClass} pricing-btn nav-link-btn`}>
                  {plan.buttonText}
                </Link>
              </article>
            ))}
          </section>

          <section className="pricing-comparison">
            <div className="pricing-comparison-card">
              <div className="pricing-comparison-header">
                <span className="eyebrow">Why upgrade?</span>
                <h2>More than just resume editing</h2>
                <p>
                  SmartCV becomes more valuable when users need better targeting,
                  deeper ATS-oriented insights, and stronger support for real job
                  applications.
                </p>
              </div>

              <div className="pricing-benefits-grid">
                <div className="pricing-benefit-box">
                  <h3>Better ATS visibility</h3>
                  <p>
                    Understand where your resume is strong and where it needs
                    keyword, formatting, or structure improvement.
                  </p>
                </div>

                <div className="pricing-benefit-box">
                  <h3>Role-specific alignment</h3>
                  <p>
                    Prepare more targeted resumes instead of relying on one
                    generic version for every application.
                  </p>
                </div>

                <div className="pricing-benefit-box">
                  <h3>More polished applications</h3>
                  <p>
                    Improve readability, summaries, bullet points, and project
                    presentation with more focused suggestions.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="pricing-final-cta">
            <div className="pricing-final-card">
              <div>
                <span className="eyebrow">Get Started</span>
                <h2>Start free and upgrade when you are ready</h2>
                <p>
                  Explore the platform, build your first resume, and unlock more
                  advanced tools as your application strategy becomes stronger.
                </p>
              </div>

              <div className="pricing-final-actions">
                <Link to="/signup" className="primary-btn nav-link-btn">
                  Start Free
                </Link>
                <Link to="/contact" className="secondary-btn nav-link-btn">
                  Contact Us
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Pricing;