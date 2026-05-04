const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const authHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`
});


export async function getProfile() {
    const response = await fetch(`${BASE_URL}/api/v1/profile/`, {
        headers: authHeaders()
    });
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
    if (!response.ok) throw new Error(data.detail || "Failed to create profile");
    return data;
}


export async function updateProfile(profileData) {
    const response = await fetch(`${BASE_URL}/api/v1/profile/`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(profileData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Failed to update profile");
    return data;
}