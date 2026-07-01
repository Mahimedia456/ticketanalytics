import { supabaseAdmin } from "../config/supabase.js";

export async function getSatisfactionDashboardData({ moduleKey, reportMonth }) {
  if (!moduleKey) {
    throw new Error("moduleKey is required");
  }

  if (!reportMonth) {
    throw new Error("reportMonth is required");
  }

  const { data: upload, error: uploadError } = await supabaseAdmin
    .from("excel_uploads")
    .select("*")
    .eq("module_key", moduleKey)
    .eq("report_month", reportMonth)
    .maybeSingle();

  if (uploadError) throw uploadError;

  const { data: rows, error: rowsError } = await supabaseAdmin
    .from("report_rows")
    .select("id,row_data,created_at")
    .eq("module_key", moduleKey)
    .eq("report_month", reportMonth)
    .order("created_at", { ascending: true });

  if (rowsError) throw rowsError;

  return {
    moduleKey,
    reportMonth,
    upload,
    rows: (rows || []).map((item) => item.row_data || {}),
    rowCount: rows?.length || 0,
  };
}