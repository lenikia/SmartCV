const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const authHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`
});

export async function getJobs({ keyword = "", location = "", jobType = "", limit = 20 } = {}) {
    const params = new URLSearchParams();
    if (keyword) params.append("keyword", keyword);
    if (location) params.append("location", location);
    if (jobType) params.append("job_type", jobType);
    params.append("limit", limit);
    params.append("use_profile", "true");

    const response = await fetch(`${BASE_URL}/api/v1/jobs/?${params}`, {
        headers: authHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Failed to fetch jobs");
    return data;
}

export async function getJobPreferences() {
    const response = await fetch(`${BASE_URL}/api/v1/jobs/preferences`, {
        headers: authHeaders()
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Failed to fetch preferences");
    return data;
}