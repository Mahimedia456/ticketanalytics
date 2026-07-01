import { supabaseAdmin } from "../config/supabase.js";

export async function getRmaUsDashboardData({ reportMonth }) {
  if (!reportMonth) {
    throw new Error("reportMonth is required");
  }

  const { data: upload, error: uploadError } = await supabaseAdmin
    .from("excel_uploads")
    .select("*")
    .eq("module_key", "rma-us")
    .eq("report_month", reportMonth)
    .maybeSingle();

  if (uploadError) throw uploadError;

  const { data: rows, error: rowsError } = await supabaseAdmin
    .from("report_rows")
    .select("id,row_data,created_at")
    .eq("module_key", "rma-us")
    .eq("report_month", reportMonth)
    .order("created_at", { ascending: true });

  if (rowsError) throw rowsError;

  return {
    reportMonth,
    upload,
    rows: (rows || []).map((item) => item.row_data || {}),
    rowCount: rows?.length || 0,
  };
}