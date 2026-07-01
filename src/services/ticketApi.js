import { apiClient } from "./apiClient";

export async function fetchTicketDashboard(reportMonth) {
  const query = reportMonth
    ? `?reportMonth=${encodeURIComponent(reportMonth)}`
    : "";

  const response = await apiClient(`/tickets/dashboard${query}`);
  return response.data;
}