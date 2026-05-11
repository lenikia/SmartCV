// Base URL read from a Vite environment variable
// In development this is http://localhost:8000
// In production you swap the .env file — no code changes needed
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// signup sends JSON — standard REST
export async function signup(fullName, email, password) {
    const response = await fetch(`${BASE_URL}/api/v1/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email,
            password,
            full_name: fullName,
        }),
    });

    const data = await response.json();

    // fetch() does NOT throw on non-2xx responses — it only throws
    // on network failure. So we check response.ok manually and throw
    // with the server's error message so the UI can display it
    if (!response.ok) {
        throw new Error(data.detail || "Signup failed");
    }

    return data; // returns the UserResponse object
}

// login sends x-www-form-urlencoded, NOT JSON
// This is because OAuth2PasswordRequestForm on the backend
// is a standard OAuth2 form — it expects form data
export async function login(email, password) {
    const formData = new URLSearchParams();
    formData.append("username", email); // OAuth2 spec uses "username" not "email"
    formData.append("password", password);

    const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Login failed");
    }

    return data; // returns { access_token, token_type }
}

// Validates the stored token and retrieves current user info
// Called on app load to check if the session is still valid
export async function getMe(token) {
    const response = await fetch(`${BASE_URL}/api/v1/auth/me`, {
        headers: { "Authorization": `Bearer ${token}` },
    });

    if (!response.ok) return null; // token expired or invalid

    return await response.json(); // returns UserResponse
}