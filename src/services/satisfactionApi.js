import { apiClient } from "./apiClient";

export async function fetchGoodSatisfactionDashboard(reportMonth) {
  const query = reportMonth
    ? `?reportMonth=${encodeURIComponent(reportMonth)}`
    : "";

  const response = await apiClient(`/satisfaction/good/dashboard${query}`);
  return response.data;
}

export async function fetchBadSatisfactionDashboard(reportMonth) {
  const query = reportMonth
    ? `?reportMonth=${encodeURIComponent(reportMonth)}`
    : "";

  const response = await apiClient(`/satisfaction/bad/dashboard${query}`);
  return response.data;
}