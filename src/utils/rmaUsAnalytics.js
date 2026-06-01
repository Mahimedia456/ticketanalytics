function cleanNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  const num = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(num) ? num : 0;
}

function cleanText(value) {
  return String(value || "").trim().replace(/^"+|"+$/g, "").trim();
}

function normalizeKey(key = "") {
  return String(key).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findColumn(columns, names) {
  const normalized = columns.map((col) => ({
    original: col,
    key: normalizeKey(col),
  }));

  for (const name of names) {
    const target = normalizeKey(name);
    const exact = normalized.find((col) => col.key === target);
    if (exact) return exact.original;
  }

  for (const name of names) {
    const target = normalizeKey(name);
    const found = normalized.find((col) => col.key.includes(target));
    if (found) return found.original;
  }

  return "";
}

function looksLikeHeaderRow(row) {
  const values = Object.values(row).map((v) => normalizeKey(v));

  return (
    values.some((v) => v === "month" || v.includes("product")) &&
    values.some((v) => v.includes("actualrma") || v.includes("replacement"))
  );
}

function promoteHeaderRow(inputRows = []) {
  if (!inputRows.length) return [];

  const keys = Object.keys(inputRows[0] || {}).map(normalizeKey);

  const hasRealHeaders =
    keys.some((key) => key === "month" || key.includes("product")) &&
    keys.some((key) => key.includes("actualrma") || key.includes("replacement"));

  if (hasRealHeaders) return inputRows;

  const headerIndex = inputRows.findIndex(looksLikeHeaderRow);
  if (headerIndex === -1) return inputRows;

  const headerRow = inputRows[headerIndex];
  const oldKeys = Object.keys(headerRow);

  const newHeaders = oldKeys.map((key, index) => {
    const header = cleanText(headerRow[key]);
    return header || `Column ${index + 1}`;
  });

  return inputRows.slice(headerIndex + 1).map((row) => {
    const next = {};
    oldKeys.forEach((oldKey, index) => {
      next[newHeaders[index]] = row[oldKey];
    });
    return next;
  });
}

function validRows(rows, productCol, descCol) {
  return rows.filter((row) => {
    const product = cleanText(row[productCol]);
    const desc = cleanText(row[descCol]);
    return product || desc;
  });
}

function sumColumn(rows, col) {
  if (!col) return 0;
  return rows.reduce((sum, row) => sum + cleanNumber(row[col]), 0);
}

function productName(row, productCol, descCol) {
  const product = cleanText(row[productCol]);
  const desc = cleanText(row[descCol]);

  if (product && desc) return `${product} — ${desc}`;
  if (product) return product;
  if (desc) return desc;
  return "Unknown";
}

function sumByProduct(rows, productCol, descCol, valueCol) {
  if (!valueCol) return [];

  const map = {};

  rows.forEach((row) => {
    const name = productName(row, productCol, descCol);
    map[name] = (map[name] || 0) + cleanNumber(row[valueCol]);
  });

  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count);
}

function sumByMonth(rows, monthCol, valueCol) {
  if (!monthCol || !valueCol) return [];

  const map = {};

  rows.forEach((row) => {
    const month = cleanText(row[monthCol]) || "Unknown";
    map[month] = (map[month] || 0) + cleanNumber(row[valueCol]);
  });

  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .filter((row) => row.count > 0);
}

export function buildRmaUsAnalytics(inputRows = []) {
  const rowsWithHeaders = promoteHeaderRow(inputRows);

  if (!rowsWithHeaders.length) {
    return {
      columns: {},
      kpis: [],
      monthlyReturns: [],
      productReturns: [],
      skuReturns: [],
      aStockSent: [],
      rmaUnits: [],
      bStockSent: [],
      receiveDStock: [],
      receiveBStock: [],
      receiveAStock: [],
      pendingComparison: [],
      driveCases: [],
      flowComparison: [],
    };
  }

  const columns = Object.keys(rowsWithHeaders[0]);

  const monthCol = findColumn(columns, ["month"]);

  const productCol = findColumn(columns, [
    "product",
    "product sku",
    "productsku",
    "sku",
  ]);

  const descCol = findColumn(columns, [
    "description",
    "products",
    "product name",
    "productname",
  ]);

  const returnsCol = findColumn(columns, [
    "actual rma replacement",
    "actual rma - replacement",
    "actualrmareplacement",
    "actual rma returns replacement",
    "actual rma returns",
    "actual rma",
    "rma replacement",
    "replacement",
  ]);

  const receivedCol = findColumn(columns, [
    "d stock units received",
    "dstockunitsreceived",
    "stock units received",
    "units received",
  ]);

  const aStockSentCol = findColumn(columns, [
    "a stock sent out",
    "a-stock sent out",
    "astock sent out",
    "astocksentout",
  ]);

  const rmaUnitsCol = findColumn(columns, [
    "rma units sent out",
    "rma units sent out",
    "rmaunitssentout",
    "rma units",
  ]);

  const bStockSentCol = findColumn(columns, [
    "b stock sent out",
    "b - stock sent out",
    "b-stock sent out",
    "bstocksentout",
  ]);

  const receiveDStockCol = findColumn(columns, [
    "d stock",
    "d - stock",
    "d-stock",
  ]);

  const receiveBStockCol = findColumn(columns, [
    "b stock",
    "b - stock",
    "b-stock",
  ]);

  const receiveAStockCol = findColumn(columns, [
    "a stock",
    "a - stock",
    "a-stock",
  ]);

  const pendingShipCol = findColumn(columns, ["pending to ship"]);
  const pendingReceiveCol = findColumn(columns, ["pending to receive"]);

  const driveCasesCol = findColumn(columns, [
    "google drive rma cases",
    "google drive rma case total",
    "googledrivermacases",
    "googledrivermacasetotal",
    "drive rma case",
    "rma case total",
  ]);

  const commentsCol = findColumn(columns, ["comments", "comment", "notes"]);

  const rows = validRows(rowsWithHeaders, productCol, descCol);

  const totalReturns = sumColumn(rows, returnsCol);
  const totalReceivedStock = sumColumn(rows, receivedCol);
  const totalAStockSent = sumColumn(rows, aStockSentCol);
  const totalRmaUnits = sumColumn(rows, rmaUnitsCol);
  const totalBStockSent = sumColumn(rows, bStockSentCol);
  const totalReceiveDStock = sumColumn(rows, receiveDStockCol);
  const totalReceiveBStock = sumColumn(rows, receiveBStockCol);
  const totalReceiveAStock = sumColumn(rows, receiveAStockCol);
  const totalPendingShip = sumColumn(rows, pendingShipCol);
  const totalPendingReceive = sumColumn(rows, pendingReceiveCol);
  const totalDriveCases = sumColumn(rows, driveCasesCol);

  const totalSentOut = totalAStockSent + totalRmaUnits + totalBStockSent;
  const totalReceived =
    totalReceivedStock + totalReceiveDStock + totalReceiveBStock + totalReceiveAStock;
  const totalPending = totalPendingShip + totalPendingReceive;

  return {
    columns: {
      monthCol,
      productCol,
      descCol,
      returnsCol,
      receivedCol,
      aStockSentCol,
      rmaUnitsCol,
      bStockSentCol,
      receiveDStockCol,
      receiveBStockCol,
      receiveAStockCol,
      pendingShipCol,
      pendingReceiveCol,
      driveCasesCol,
      commentsCol,
    },

    kpis: [
      { title: "Google Drive RMA Cases", value: totalDriveCases },
      { title: "Actual RMA Replacement", value: totalReturns },
      { title: "Total Sent Out", value: totalSentOut },
      { title: "Total Received", value: totalReceived },
      { title: "A-Stock Sent Out", value: totalAStockSent },
      { title: "RMA Units Sent Out", value: totalRmaUnits },
      { title: "B-Stock Sent Out", value: totalBStockSent },
      { title: "Total Pending", value: totalPending },
    ],

    monthlyReturns: monthCol
      ? sumByMonth(rows, monthCol, returnsCol)
      : [{ name: "Current Sheet", count: totalReturns }],

    productReturns: sumByProduct(rows, productCol, descCol, returnsCol),
    skuReturns: sumByProduct(rows, productCol, descCol, returnsCol),

    aStockSent: sumByProduct(rows, productCol, descCol, aStockSentCol),
    rushSent: sumByProduct(rows, productCol, descCol, aStockSentCol),

    rmaUnits: sumByProduct(rows, productCol, descCol, rmaUnitsCol),

    bStockSent: sumByProduct(rows, productCol, descCol, bStockSentCol),
    rushBStock: sumByProduct(rows, productCol, descCol, bStockSentCol),

    receiveDStock: sumByProduct(rows, productCol, descCol, receiveDStockCol),
    receiveBStock: sumByProduct(rows, productCol, descCol, receiveBStockCol),
    receiveAStock: sumByProduct(rows, productCol, descCol, receiveAStockCol),
    driveCases: sumByProduct(rows, productCol, descCol, driveCasesCol),

    pendingComparison: [
      { name: "Pending to Ship", count: totalPendingShip },
      { name: "Pending to Receive", count: totalPendingReceive },
    ],

    flowComparison: [
      { name: "Actual RMA Replacement", count: totalReturns },
      { name: "D Stock Units Received", count: totalReceivedStock },
      { name: "A-Stock Sent Out", count: totalAStockSent },
      { name: "RMA Units Sent Out", count: totalRmaUnits },
      { name: "B-Stock Sent Out", count: totalBStockSent },
      { name: "D-Stock", count: totalReceiveDStock },
      { name: "B-Stock", count: totalReceiveBStock },
      { name: "A-Stock", count: totalReceiveAStock },
      { name: "Pending to Ship", count: totalPendingShip },
      { name: "Pending to Receive", count: totalPendingReceive },
      { name: "Google Drive RMA Cases", count: totalDriveCases },
    ],
  };
}