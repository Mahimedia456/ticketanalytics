    const STORAGE_KEY = "atomos_home_uploads";

export function getHomeUploads() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function getHomeRows(key) {
  const data = getHomeUploads();
  return Array.isArray(data[key]) ? data[key] : [];
}

export function getSelectedPeriodLabel() {
  const data = getHomeUploads();
  return data.period || "No month selected";
}