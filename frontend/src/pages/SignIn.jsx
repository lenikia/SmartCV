import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { login } from "../api/auth";
import { getProfile } from "../api/profile";

function SignIn() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email.trim() || !formData.password.trim()) {
            setError("Please enter your email and password.");
            return;
        }

        setError("");
        setLoading(true);

        try {
            // Step 1 — authenticate and store token
            const data = await login(formData.email, formData.password);
            localStorage.setItem("token", data.access_token);

            // Step 2 — check if profile exists
            // getProfile returns null on 404, object on 200
            const profile = await getProfile();

            // Step 3 — route based on profile state
            if (profile) {
                navigate("/dashboard");
            } else {
                // No profile yet — send to home page where
                // the profile setup form is waiting for them
                navigate("/");
            }

        } catch (err) {
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
                        <span className="eyebrow">Welcome Back</span>
                        <h1>Sign in to your SmartCV account</h1>
                        <p>
                            Access your resumes, continue improving your CV, and manage
                            your professional documents in one place.
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

                        <button
                            type="submit"
                            className="primary-btn auth-submit-btn"
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>

                    <div className="auth-divider"><span>or</span></div>

                    <button className="secondary-btn auth-submit-btn">
                        Continue with Google
                    </button>

                    <div className="auth-footer">
                        <p>
                            Don&apos;t have an account?{" "}
                            <Link to="/signup" className="auth-inline-link">Start Free</Link>
                        </p>
                        <Link to="/" className="back-home-link">← Back to Home</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignIn;