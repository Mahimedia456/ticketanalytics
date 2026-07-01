import { getTicketDashboardData } from "../services/ticketService.js";

export async function getTicketDashboard(req, res) {
  try {
    const data = await getTicketDashboardData({
      reportMonth: req.query.reportMonth,
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to load ticket dashboard",
    });
  }
}