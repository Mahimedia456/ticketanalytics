const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function getToken() {
  return localStorage.getItem("atomos_auth_token") || "";
}

export async function apiClient(path, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;
  const isJsonBody =
    options.body &&
    !isFormData &&
    typeof options.body === "object";

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    body: isJsonBody ? JSON.stringify(options.body) : options.body,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error("API ERROR:", {
      url: `${API_URL}${path}`,
      status: response.status,
      data,
    });

    throw new Error(
      data?.message ||
        data?.error ||
        `API request failed with status ${response.status}`
    );
  }

  return data;
}

export default apiClient;