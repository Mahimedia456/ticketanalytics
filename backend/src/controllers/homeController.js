import { getHomeOverview } from "../services/homeService.js";

export async function homeOverview(req, res) {
  try {
    const overview = await getHomeOverview({
      reportMonth: req.query.reportMonth,
    });

    return res.json({
      success: true,
      overview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to load home overview",
    });
  }
}