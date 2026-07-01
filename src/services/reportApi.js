import { apiClient } from "./apiClient";

export async function fetchReports(reportMonth) {
  const query = reportMonth
    ? `?reportMonth=${encodeURIComponent(reportMonth)}`
    : "";

  const response = await apiClient(`/reports${query}`);
  return response.data;
}