import { getRmaEmeaDashboard } from "../services/rmaEmeaService.js";

export async function getDashboard(req, res) {
  try {
    const data = await getRmaEmeaDashboard({
      reportMonth: req.query.reportMonth,
    });

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}