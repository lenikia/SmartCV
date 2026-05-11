const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const authHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`
});

export async function getApplications() {
    const response = await fetch(`${BASE_URL}/api/v1/applications/`, {
        headers: authHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Failed to fetch applications");
    return data;
}

export async function createApplication(payload) {
    const response = await fetch(`${BASE_URL}/api/v1/applications/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Failed to create application");
    return data;
}

export async function updateApplication(id, payload) {
    const response = await fetch(`${BASE_URL}/api/v1/applications/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Failed to update application");
    return data;
}

export async function deleteApplication(id) {
    const response = await fetch(`${BASE_URL}/api/v1/applications/${id}`, {
        method: "DELETE",
        headers: authHeaders()
    });
    if (!response.ok) throw new Error("Failed to delete application");
}