import { apiClient } from "./apiClient";

export async function fetchRmaUsDashboard(reportMonth) {
  const query = reportMonth
    ? `?reportMonth=${encodeURIComponent(reportMonth)}`
    : "";

  const response = await apiClient(`/rma-us/dashboard${query}`);
  return response.data;
}