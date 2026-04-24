import * as XLSX from "xlsx";

function tableToSheetRows(title, headers, rows) {
  return [[title], [], headers, ...rows];
}

function appendSheet(wb, name, rows) {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
}

function summaryRows(data, label = "Name") {
  return [
    [label, "Count", "Share"],
    ...data.map((row, index) => [
      row.name || row.date,
      row.count,
      { f: `B${index + 2}/SUM(B2:B${data.length + 1})` },
    ]),
    [],
    ["Total", { f: `SUM(B2:B${data.length + 1})` }],
  ];
}

export function exportDashboardExcel({ rows, analytics, title = "Dashboard" }) {
  const wb = XLSX.utils.book_new();

  appendSheet(wb, "Raw Data", [
    Object.keys(rows[0] || {}),
    ...rows.map((row) => Object.values(row)),
  ]);

  appendSheet(wb, "Dashboard Summary", [
    [title],
    [],
    ["Metric", "Value"],
    ...(analytics.kpis || []).map((kpi) => [kpi.title, kpi.value]),
    [],
    ["Detected Date Column", analytics.columns?.dateCol || ""],
    ["Detected Region Column", analytics.columns?.regionCol || ""],
    ["Detected Category Column", analytics.columns?.categoryCol || ""],
    ["Detected Product Column", analytics.columns?.productCol || ""],
    ["Detected Status Column", analytics.columns?.statusCol || ""],
  ]);

  appendSheet(wb, "Daily Trend", summaryRows(analytics.daily || [], "Date"));
  appendSheet(wb, "Weekly Trend", summaryRows(analytics.weekly || [], "Week"));
  appendSheet(wb, "Monthly Trend", summaryRows(analytics.monthly || [], "Month"));
  appendSheet(wb, "Categories", summaryRows(analytics.category || [], "Category"));
  appendSheet(wb, "Regions", summaryRows(analytics.region || [], "Region"));
  appendSheet(wb, "Products Models", summaryRows(analytics.product || [], "Product / Model"));
  appendSheet(wb, "Status", summaryRows(analytics.status || [], "Status"));

  appendSheet(wb, "Chart Data Guide", [
    ["Excel Chart Note"],
    [],
    ["Browser SheetJS export creates workbook data and formulas."],
    ["To create visual Excel chart objects, select any summary sheet data and Insert Chart in Excel."],
    ["For automatic real Excel chart objects, use a backend report generator or Office Script later."],
  ]);

  XLSX.writeFile(wb, `${title}-dashboard.xlsx`);
}