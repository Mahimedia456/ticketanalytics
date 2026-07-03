import { analyzeSatisfactionWithAI } from "../services/aiSatisfaction.service.js";

export async function analyzeSatisfaction(request, response, next) {
  try {
    const analysis = await analyzeSatisfactionWithAI(request.body || {});

    return response.status(200).json({
      success: true,
      message: "Satisfaction response analyzed successfully.",
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
}