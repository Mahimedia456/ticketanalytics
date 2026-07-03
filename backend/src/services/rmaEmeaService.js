import { supabaseAdmin } from "../config/supabase.js";

const MODULE_KEYS = [
  "rma-emea",
  "rma_emea",
  "rmaemea",
  "rma-emea-dashboard",
];

async function findUpload(reportMonth) {
  for (const moduleKey of MODULE_KEYS) {
    const { data, error } = await supabaseAdmin
      .from("excel_uploads")
      .select("*")
      .eq("module_key", moduleKey)
      .eq("report_month", reportMonth)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      return {
        upload: data,
        moduleKey,
      };
    }
  }

  return {
    upload: null,
    moduleKey: MODULE_KEYS[0],
  };
}

export async function getRmaEmeaDashboard({ reportMonth }) {
  if (!reportMonth) {
    throw new Error("reportMonth is required");
  }

  const { upload, moduleKey } = await findUpload(reportMonth);

  const { data: rows, error: rowsError } = await supabaseAdmin
    .from("report_rows")
    .select("id,row_data,created_at")
    .eq("module_key", moduleKey)
    .eq("report_month", reportMonth)
    .order("created_at", { ascending: true });

  if (rowsError) throw rowsError;

  return {
    upload,
    moduleKey,
    reportMonth,
    rows: (rows || []).map((item) => item.row_data || {}),
    rowCount: rows?.length || 0,
  };
}