import { apiClient } from "./apiClient";

export function loginApi({ email, password }) {
  return apiClient("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}