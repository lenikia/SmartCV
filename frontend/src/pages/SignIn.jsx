import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function SignIn() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setError("");

    // Temporary simulation while the backend is not ready 
    localStorage.setItem("mockAuth", "true");
    localStorage.setItem("mockUserEmail", formData.email);

    // then we switch to /dashboard;
    navigate("/dashboard");
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper">
        <div className="auth-brand-row">
          <Link to="/" className="brand auth-brand">
            <div className="brand-mark">S</div>
            <span>SmartCV</span>
          </Link>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <span className="eyebrow">Welcome Back</span>
            <h1>Sign in to your SmartCV account</h1>
            <p>
              Access your resumes, continue improving your CV, and manage your
              professional documents in one place.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
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
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button type="submit" className="primary-btn auth-submit-btn">
              Sign In
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button className="secondary-btn auth-submit-btn">
            Continue with Google
          </button>

          <div className="auth-footer">
            <p>
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="auth-inline-link">
                Start Free
              </Link>
            </p>

            <Link to="/" className="back-home-link">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;