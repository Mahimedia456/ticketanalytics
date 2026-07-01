import api from "./apiClient";

export async function fetchRmaEmeaDashboard(reportMonth) {
  const { data } = await api.get(
    `/rma-emea/dashboard?reportMonth=${reportMonth}`
  );

  return data.data;
}