import { supabaseAdmin } from "../config/supabase.js";

const MODULES = [
  { key: "ticket-dashboard", label: "Tickets" },
  { key: "rma-emea", label: "RMA EMEA" },
  { key: "rma-us", label: "RMA US" },
  { key: "good-satisfaction", label: "Good Satisfaction" },
  { key: "bad-satisfaction", label: "Bad Satisfaction" },
];

export async function getHomeOverview({ reportMonth }) {
  const month = reportMonth || new Date().toISOString().slice(0, 7);

  const { data: uploads, error: uploadError } = await supabaseAdmin
    .from("excel_uploads")
    .select("*")
    .eq("report_month", month);

  if (uploadError) throw uploadError;

  const { data: rows, error: rowsError } = await supabaseAdmin
    .from("report_rows")
    .select("module_key, report_month")
    .eq("report_month", month);

  if (rowsError) throw rowsError;

  const modules = MODULES.map((module) => {
    const uploaded = (uploads || []).find((item) => item.module_key === module.key);
    const rowCount = (rows || []).filter((item) => item.module_key === module.key).length;

    return {
      ...module,
      uploaded: Boolean(uploaded),
      rowCount,
      latestUpload: uploaded || null,
    };
  });

  return {
    reportMonth: month,
    modules,
    summary: {
      totalUploads: uploads?.length || 0,
      totalRows: rows?.length || 0,
      tickets: modules.find((m) => m.key === "ticket-dashboard")?.rowCount || 0,
      rmaEmea: modules.find((m) => m.key === "rma-emea")?.rowCount || 0,
      rmaUs: modules.find((m) => m.key === "rma-us")?.rowCount || 0,
      good: modules.find((m) => m.key === "good-satisfaction")?.rowCount || 0,
      bad: modules.find((m) => m.key === "bad-satisfaction")?.rowCount || 0,
    },
  };
}