import { supabaseAdmin } from "../config/supabase.js";

export async function getRmaEmeaDashboard({ reportMonth }) {
  if (!reportMonth) {
    throw new Error("reportMonth is required");
  }

  const { data: upload, error: uploadError } = await supabaseAdmin
    .from("excel_uploads")
    .select("*")
    .eq("module_key", "rma-emea")
    .eq("report_month", reportMonth)
    .maybeSingle();

  if (uploadError) throw uploadError;

  const { data: rows, error: rowsError } = await supabaseAdmin
    .from("report_rows")
    .select("row_data")
    .eq("module_key", "rma-emea")
    .eq("report_month", reportMonth)
    .order("created_at");

  if (rowsError) throw rowsError;

  return {
    upload,
    reportMonth,
    rows: (rows || []).map(r => r.row_data || {}),
    rowCount: rows?.length || 0,
  };
}