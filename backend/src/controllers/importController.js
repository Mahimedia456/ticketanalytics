import { importMonthlyDataset } from "../services/importService.js";

export async function importMonthly(req, res) {
  try {
    const { moduleKey, reportMonth } = req.body;
    const rows = JSON.parse(req.body.rows || "[]");

    const result = await importMonthlyDataset({
      moduleKey,
      reportMonth,
      rows,
      file: req.file,
      userId: req.user?.id,
    });

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to import data",
    });
  }
}