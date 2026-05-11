const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const authHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`
});


export async function getSections(cvId) {
    const response = await fetch(`${BASE_URL}/api/v1/cv/${cvId}/sections`, {
        headers: authHeaders()
    });
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to fetch sections");
    }
    return await response.json();
}


export async function createSection(cvId, sectionData) {
    const response = await fetch(`${BASE_URL}/api/v1/cv/${cvId}/sections`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(sectionData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Failed to create section");
    return data;
}


export async function updateSection(cvId, sectionId, sectionData) {
    const response = await fetch(
        `${BASE_URL}/api/v1/cv/${cvId}/sections/${sectionId}`,
        {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify(sectionData)
        }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Failed to update section");
    return data;
}


export async function deleteSection(cvId, sectionId) {
    const response = await fetch(
        `${BASE_URL}/api/v1/cv/${cvId}/sections/${sectionId}`,
        {
            method: "DELETE",
            headers: authHeaders()
        }
    );
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to delete section");
    }
}


export async function reorderSections(cvId, sectionIds) {
    const response = await fetch(
        `${BASE_URL}/api/v1/cv/${cvId}/sections/reorder`,
        {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(sectionIds)
        }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Failed to reorder sections");
    return data;
}