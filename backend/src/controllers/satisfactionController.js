import { getSatisfactionDashboardData } from "../services/satisfactionService.js";

export async function getGoodSatisfactionDashboard(req, res) {
  try {
    const data = await getSatisfactionDashboardData({
      moduleKey: "good-satisfaction",
      reportMonth: req.query.reportMonth,
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to load Good Satisfaction dashboard",
    });
  }
}

export async function getBadSatisfactionDashboard(req, res) {
  try {
    const data = await getSatisfactionDashboardData({
      moduleKey: "bad-satisfaction",
      reportMonth: req.query.reportMonth,
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to load Bad Satisfaction dashboard",
    });
  }
}