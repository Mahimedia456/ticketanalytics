import { apiClient } from "./apiClient";

export async function fetchHomeOverview(reportMonth) {
  const query = reportMonth
    ? `?reportMonth=${encodeURIComponent(reportMonth)}`
    : "";

  const data = await apiClient(`/home/overview${query}`);
  return data.overview;
}

export async function deleteHomeMonthData(reportMonth) {
  const data = await apiClient("/home/month", {
    method: "DELETE",
    body: JSON.stringify({ reportMonth }),
  });

  return data.result;
}