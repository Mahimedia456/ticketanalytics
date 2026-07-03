import { apiClient } from "./apiClient";

export async function fetchRmaEmeaDashboard(reportMonth) {
  const query = reportMonth
    ? `?reportMonth=${encodeURIComponent(reportMonth)}`
    : "";

  const response = await apiClient(`/rma-emea/dashboard${query}`);

  return response.data || response;
}