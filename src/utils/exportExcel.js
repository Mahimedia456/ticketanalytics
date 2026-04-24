import * as XLSX from "xlsx";

function safeSheetName(name = "Sheet") {
  return String(name).slice(0, 31).replace(/[\\/?*[\]:]/g, "");
}

function appendSheet(wb, name, rows) {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, safeSheetName(name));
}

function rawDataRows(rows = []) {
  const headers = Object.keys(rows[0] || {});

  return [
    headers,
    ...rows.map((row) => headers.map((header) => row[header] ?? "")),
  ];
}

function kpiRows(analytics = {}, title = "Dashboard") {
  return [
    [title],
    [],
    ["Metric", "Value"],
    ...(analytics.kpis || []).map((kpi) => [kpi.title, kpi.value]),
  ];
}

function summaryRows(data = [], label = "Name") {
  return [
    [label, "Count"],
    ...data.map((row) => [row.name || row.date || "", row.count || 0]),
    [],
    ["Total", data.reduce((sum, row) => sum + Number(row.count || 0), 0)],
  ];
}

function satisfactionRows(analytics = {}, title = "Satisfaction Dashboard") {
  return {
    summary: kpiRows(analytics, title),
    sheets: [
      ["Comment Status", summaryRows(analytics.commentStatus || [], "Status")],
      ["Percentage", summaryRows(analytics.percentage || [], "Metric")],
      [
        "Ticket Details",
        [
          ["Ticket ID", "Comments", "Reason Notes"],
          ...(analytics.rows || []).map((row) => [
            row.ticketId || "",
            row.comment || "",
            row.reasonNotes || "",
          ]),
        ],
      ],
    ],
  };
}

function comparisonRows(analytics = {}, title = "Satisfaction Comparison") {
  return {
    summary: kpiRows(analytics, title),
    sheets: [
      ["Good vs Bad", summaryRows(analytics.comparison || [], "Type")],
      ["Percentage", summaryRows(analytics.percentage || [], "Metric")],
      ["Comment Comparison", summaryRows(analytics.commentsComparison || [], "Metric")],
      [
        "Good Tickets",
        [
          ["Ticket ID", "Comments", "Reason Notes"],
          ...(analytics.good?.rows || []).map((row) => [
            row.ticketId || "",
            row.comment || "",
            row.reasonNotes || "",
          ]),
        ],
      ],
      [
        "Bad Tickets",
        [
          ["Ticket ID", "Comments", "Reason Notes"],
          ...(analytics.bad?.rows || []).map((row) => [
            row.ticketId || "",
            row.comment || "",
            row.reasonNotes || "",
          ]),
        ],
      ],
    ],
  };
}

function ticketRows(analytics = {}, title = "Ticket Dashboard") {
  return {
    summary: [
      ...kpiRows(analytics, title),
      [],
      ["Detected Date Column", analytics.columns?.dateCol || ""],
      ["Detected Region Column", analytics.columns?.regionCol || ""],
      ["Detected Category Column", analytics.columns?.categoryCol || ""],
      ["Detected Product Column", analytics.columns?.productCol || ""],
      ["Detected Status Column", analytics.columns?.statusCol || ""],
    ],
    sheets: [
      ["Monthly Trend", summaryRows(analytics.monthly || [], "Month")],
      ["Categories", summaryRows(analytics.category || [], "Category")],
      ["Regions", summaryRows(analytics.region || [], "Region")],
      ["Products", summaryRows(analytics.productAll || analytics.product || [], "Product")],
      ["Status", summaryRows(analytics.status || [], "Status")],
    ],
  };
}

function rmaRows(analytics = {}, title = "RMA Dashboard") {
  return {
    summary: [
      ...kpiRows(analytics, title),
      [],
      ["Month Column", analytics.columns?.monthCol || ""],
      ["SKU Column", analytics.columns?.skuCol || ""],
      ["Product Column", analytics.columns?.productCol || ""],
      ["Returns Column", analytics.columns?.returnsCol || ""],
      ["Drive Cases Column", analytics.columns?.driveCasesCol || ""],
    ],
    sheets: [
      ["Monthly Returns", summaryRows(analytics.monthlyReturns || [], "Month")],
      ["Flow Comparison", summaryRows(analytics.flowComparison || [], "Metric")],
      ["Product Returns", summaryRows(analytics.productReturns || analytics.skuReturns || [], "Product / SKU")],
      ["Rush Sent", summaryRows(analytics.rushByProduct || analytics.rushSent || [], "Product / SKU")],
      ["RMA Units", summaryRows(analytics.replacementUnits || analytics.rmaUnits || [], "Product / SKU")],
      ["B Stock", summaryRows(analytics.bStockByProduct || analytics.rushBStock || [], "Product / SKU")],
      ["D Stock", summaryRows(analytics.dStockByProduct || analytics.receiveDStock || [], "Product / SKU")],
      ["Drive Cases", summaryRows(analytics.driveCases || [], "Product / SKU")],
      ["Pending", summaryRows(analytics.pendingComparison || [], "Metric")],
    ],
  };
}

function detectExportType(analytics = {}) {
  if (analytics.good && analytics.bad) return "comparison";
  if (analytics.type === "good" || analytics.type === "bad") return "satisfaction";
  if (analytics.flowComparison || analytics.monthlyReturns || analytics.driveCases) return "rma";
  return "ticket";
}

export function exportDashboardExcel({ rows = [], analytics = {}, title = "Dashboard" }) {
  const wb = XLSX.utils.book_new();

  appendSheet(wb, "Raw Data", rawDataRows(rows));

  const type = detectExportType(analytics);

  let exportData;

  if (type === "comparison") {
    exportData = comparisonRows(analytics, title);
  } else if (type === "satisfaction") {
    exportData = satisfactionRows(analytics, title);
  } else if (type === "rma") {
    exportData = rmaRows(analytics, title);
  } else {
    exportData = ticketRows(analytics, title);
  }

  appendSheet(wb, "Dashboard Summary", exportData.summary);

  exportData.sheets.forEach(([sheetName, sheetRows]) => {
    appendSheet(wb, sheetName, sheetRows);
  });

  appendSheet(wb, "Chart Data Guide", [
    ["Excel Chart Note"],
    [],
    ["This file exports workbook data and summary sheets."],
    ["For visual Excel charts, select summary sheet data and use Insert Chart in Excel."],
  ]);

  XLSX.writeFile(wb, `${title}-dashboard.xlsx`);
}