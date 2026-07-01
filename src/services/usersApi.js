import { apiClient } from "./apiClient";

export async function fetchUsers() {
  const response = await apiClient("/users");
  return response.users || [];
}

export async function createUser(payload) {
  const response = await apiClient("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.user;
}

export async function updateUser(id, payload) {
  const response = await apiClient(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return response.user;
}

export async function resetUserPassword(id, password) {
  const response = await apiClient(`/users/${id}/password`, {
    method: "PATCH",
    body: JSON.stringify({ password }),
  });

  return response.user;
}

export async function deleteUser(id) {
  return apiClient(`/users/${id}`, {
    method: "DELETE",
  });
}