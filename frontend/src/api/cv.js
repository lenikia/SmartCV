const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const authHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`
});


export async function getCVs() {
    const response = await fetch(`${BASE_URL}/api/v1/cv/`, {
        headers: authHeaders()
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to fetch CVs");
    }

    return await response.json();
}


export async function getCV(id) {
    const response = await fetch(`${BASE_URL}/api/v1/cv/${id}`, {
        headers: authHeaders()
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to fetch CV");
    }

    return await response.json();
}


export async function createCV(cvData) {
    const response = await fetch(`${BASE_URL}/api/v1/cv/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(cvData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to create CV");
    }

    return data;
}


export async function updateCV(id, cvData) {
    const response = await fetch(`${BASE_URL}/api/v1/cv/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(cvData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to update CV");
    }

    return data;
}


export async function deleteCV(id) {
    const response = await fetch(`${BASE_URL}/api/v1/cv/${id}`, {
        method: "DELETE",
        headers: authHeaders()
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to delete CV");
    }

    return await response.json();
}


export async function generateCVFromUrl(jobUrl, sections) {
    const response = await fetch(`${BASE_URL}/api/v1/ai/generate-from-url`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
            job_url: jobUrl,
            sections: sections
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.detail || "Failed to generate CV from URL");
    }

    return data;
}