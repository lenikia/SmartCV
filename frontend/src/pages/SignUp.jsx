import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { signup } from "../api/auth";

function SignUp() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.fullName.trim() || !formData.email.trim() ||
            !formData.password.trim() || !formData.confirmPassword.trim()) {
            setError("Please fill in all fields.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setError("");
        setLoading(true);

        try {
            // Call the real API — throws if the server returns an error
            await signup(formData.fullName, formData.email, formData.password);
            // On success, redirect to signin — user must now log in to get a token
            // We don't auto-login after signup because the login endpoint needs
            navigate("/signin");

        } catch (err) {
            //err.message comes from the throw in api/auth.js
            setError(err.message);
        } finally {
            setLoading(false);
        }
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
                        <span className="eyebrow">Get Started</span>
                        <h1>Create your SmartCV account</h1>
                        <p>
                            Start building stronger resumes, improve ATS readiness, and
                            manage your career documents in one place.
                        </p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
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
                            <label htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={(e) => handleChange("password", e.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                            />
                        </div>

                        {error && <p className="auth-error">{error}</p>}

                        <button
                            type="submit"
                            className="primary-btn auth-submit-btn"
                            disabled={loading}
                        >
                            {loading ? "Creating account..." : "Create Account"}
                        </button>
                    </form>

                    <div className="auth-divider"><span>or</span></div>

                    <button className="secondary-btn auth-submit-btn">
                        Continue with Google
                    </button>

                    <div className="auth-footer">
                        <p>
                            Already have an account?{" "}
                            <Link to="/signin" className="auth-inline-link">Sign In</Link>
                        </p>
                        <Link to="/" className="back-home-link">← Back to Home</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUp;