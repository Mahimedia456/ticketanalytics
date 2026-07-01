import { getReportsData } from "../services/reportService.js";

export async function getReports(req, res) {
  try {
    const data = await getReportsData({
      reportMonth: req.query.reportMonth,
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to load reports",
    });
  }
}