import { apiClient } from "./apiClient";

export async function analyzeSatisfactionResponse({
  ticketId,
  rating,
  comment,
  reason,
}) {
  const response = await apiClient("/ai/satisfaction/analyze", {
    method: "POST",
    body: {
      ticketId,
      rating,
      comment,
      reason,
    },
  });

  return response.data || response;
}