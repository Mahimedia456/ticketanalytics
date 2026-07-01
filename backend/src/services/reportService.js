import { supabaseAdmin } from "../config/supabase.js";

const MODULES = {
  tickets: "ticket-dashboard",
  rmaEmea: "rma-emea",
  rmaUs: "rma-us",
  good: "good-satisfaction",
  bad: "bad-satisfaction",
};

async function getModuleRows(moduleKey, reportMonth) {
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
    upload,
    rows: (rows || []).map((item) => item.row_data || {}),
    rowCount: rows?.length || 0,
  };
}

export async function getReportsData({ reportMonth }) {
  if (!reportMonth) {
    throw new Error("reportMonth is required");
  }

  const [tickets, rmaEmea, rmaUs, good, bad] = await Promise.all([
    getModuleRows(MODULES.tickets, reportMonth),
    getModuleRows(MODULES.rmaEmea, reportMonth),
    getModuleRows(MODULES.rmaUs, reportMonth),
    getModuleRows(MODULES.good, reportMonth),
    getModuleRows(MODULES.bad, reportMonth),
  ]);

  const totalRows =
    tickets.rowCount + rmaEmea.rowCount + rmaUs.rowCount + good.rowCount + bad.rowCount;

  return {
    reportMonth,
    summary: {
      totalRows,
      tickets: tickets.rowCount,
      rmaEmea: rmaEmea.rowCount,
      rmaUs: rmaUs.rowCount,
      good: good.rowCount,
      bad: bad.rowCount,
      rmaTotal: rmaEmea.rowCount + rmaUs.rowCount,
      satisfactionTotal: good.rowCount + bad.rowCount,
    },
    datasets: {
      tickets,
      rmaEmea,
      rmaUs,
      good,
      bad,
    },
  };
}