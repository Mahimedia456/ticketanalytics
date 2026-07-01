import { apiClient } from "./apiClient";

export async function importMonthlyDataset({
  moduleKey,
  reportMonth,
  file,
  rows,
}) {
  const formData = new FormData();

  formData.append("moduleKey", moduleKey);
  formData.append("reportMonth", reportMonth);
  formData.append("rows", JSON.stringify(rows || []));

  if (file) {
    formData.append("file", file);
  }

  return apiClient("/imports/monthly", {
    method: "POST",
    body: formData,
  });
}