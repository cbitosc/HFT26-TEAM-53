
const API_BASE_URL =
  import.meta.env.VITE_API_BASE || "http://localhost:8001";

export async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export async function uploadRepository(endpoint, file) {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest(endpoint, {
    method: "POST",
    body: formData,
  });
}

export async function importGithubRepository(url) {
  return apiRequest("/github/import", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });
}

export async function getRepository(repoId) {
  return apiRequest(`/repository/${repoId}`);
}
