
const API_BASE_URL =
  import.meta.env.VITE_API_BASE || "http://localhost:8080";
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

export async function getRepositoryFile(repoId, filePath) {
  const params = new URLSearchParams({
    path: filePath,
    start: "1",
    end: "200",
  });

  return apiRequest(
    `/repository/${repoId}/file?${params.toString()}`
  );
}

export async function searchRepository(repoId, query, topK = 10) {
  return apiRequest("/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      repo_id: repoId,
      query: query,
      top_k: topK,
    }),
  });
}
