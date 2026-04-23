const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Helper that reads the token from localStorage and builds
// the Authorization header — used by every profile API call
const authHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`
});


export async function getProfile() {
    const response = await fetch(`${BASE_URL}/api/v1/profile/`, {
        headers: authHeaders()
    });

    // 404 means no profile yet — this is expected for new users
    // We return null instead of throwing so the caller can
    // distinguish between "no profile" and "something broke"
    if (response.status === 404) return null;

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to fetch profile");
    }

    return await response.json();
}


export async function createProfile(profileData) {
    const response = await fetch(`${BASE_URL}/api/v1/profile/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(profileData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to create profile");
    }

    return data;
}


export async function updateProfile(profileData) {
    const response = await fetch(`${BASE_URL}/api/v1/profile/`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(profileData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to update profile");
    }

    return data;
}