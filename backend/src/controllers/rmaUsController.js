import { getRmaUsDashboardData } from "../services/rmaUsService.js";

export async function getRmaUsDashboard(req, res) {
  try {
    const data = await getRmaUsDashboardData({
      reportMonth: req.query.reportMonth,
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to load RMA US dashboard",
    });
  }
}