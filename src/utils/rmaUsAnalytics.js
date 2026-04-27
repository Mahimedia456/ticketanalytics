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

function findColumnOccurrence(columns, names, occurrence = 1) {
  const normalized = columns.map((col) => ({
    original: col,
    key: normalizeKey(col),
  }));

  for (const name of names) {
    const target = normalizeKey(name);
    const matches = normalized.filter((col) => col.key.includes(target));
    if (matches[occurrence - 1]) return matches[occurrence - 1].original;
  }

  return "";
}

function looksLikeHeaderRow(row) {
  const values = Object.values(row).map((v) => normalizeKey(v));

  return (
    values.some((v) => v === "product") &&
    values.some((v) => v.includes("description")) &&
    values.some((v) => v.includes("actualrmareturns") || v.includes("rma"))
  );
}

function promoteHeaderRow(inputRows = []) {
  if (!inputRows.length) return [];

  const keys = Object.keys(inputRows[0] || {}).map(normalizeKey);
  const hasRealHeaders =
    keys.some((key) => key === "product") &&
    keys.some((key) => key.includes("description"));

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
    const sku = cleanText(row[productCol]);
    const desc = cleanText(row[descCol]);
    return sku || desc;
  });
}

function sumColumn(rows, col) {
  if (!col) return 0;
  return rows.reduce((sum, row) => sum + cleanNumber(row[col]), 0);
}

function productName(row, productCol, descCol) {
  const sku = cleanText(row[productCol]);
  const desc = cleanText(row[descCol]);

  if (sku && desc) return `${sku} — ${desc}`;
  if (sku) return sku;
  if (desc) return desc;
  return "Unknown";
}

function sumBySku(rows, productCol, descCol, valueCol) {
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

  const productCol = findColumn(columns, ["product"]);
  const descCol = findColumn(columns, ["description"]);

  const returnsCol = findColumn(columns, [
    "actual rma returns replacement",
    "actual rma returns",
    "rma returns",
  ]);

  const receivedCol = findColumn(columns, [
    "d stock units received",
    "dstockunitsreceived",
    "stock units received",
  ]);

  const aStockSentCol = findColumn(columns, [
    "a stock sent out",
    "astock sent out",
    "astocksentout",
  ]);

  const rmaUnitsCol = findColumn(columns, [
    "rma units sent out",
    "rma units",
    "rmaunitssentout",
  ]);

  const bStockSentCol = findColumn(columns, [
    "b stock sent out",
    "bstock sent out",
    "bstocksentout",
    "b - stock sent out",
  ]);

  const receiveDStockCol =
    findColumn(columns, ["d stock", "d - stock"]) ||
    findColumnOccurrence(columns, ["d stock"], 1);

  const receiveBStockCol =
    findColumn(columns, ["b stock", "b - stock"]) ||
    findColumnOccurrence(columns, ["b stock"], 1);

  const receiveAStockCol =
    findColumn(columns, ["a stock", "a - stock"]) ||
    findColumnOccurrence(columns, ["a stock"], 2);

  const pendingShipCol = findColumn(columns, ["pending to ship"]);
  const pendingReceiveCol = findColumn(columns, ["pending to receive"]);

  const driveCasesCol = findColumn(columns, [
    "google drive rma case total",
    "drive rma case",
    "rma case total",
  ]);

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
    },

    kpis: [
      { title: "Google Drive RMA Cases", value: totalDriveCases },
      { title: "Actual RMA Returns", value: totalReturns },
      { title: "Total Sent Out", value: totalSentOut },
      { title: "Total Received", value: totalReceived },
      { title: "A-Stock Sent Out", value: totalAStockSent },
      { title: "RMA Units Sent Out", value: totalRmaUnits },
      { title: "B-Stock Sent Out", value: totalBStockSent },
      { title: "Total Pending", value: totalPending },
    ],

    monthlyReturns: [{ name: "Current Sheet", count: totalReturns }],

    productReturns: sumBySku(rows, productCol, descCol, returnsCol),
    skuReturns: sumBySku(rows, productCol, descCol, returnsCol),

    aStockSent: sumBySku(rows, productCol, descCol, aStockSentCol),
    rushSent: sumBySku(rows, productCol, descCol, aStockSentCol),

    rmaUnits: sumBySku(rows, productCol, descCol, rmaUnitsCol),
    bStockSent: sumBySku(rows, productCol, descCol, bStockSentCol),
    rushBStock: sumBySku(rows, productCol, descCol, bStockSentCol),

    receiveDStock: sumBySku(rows, productCol, descCol, receiveDStockCol),
    receiveBStock: sumBySku(rows, productCol, descCol, receiveBStockCol),
    receiveAStock: sumBySku(rows, productCol, descCol, receiveAStockCol),
    driveCases: sumBySku(rows, productCol, descCol, driveCasesCol),

    pendingComparison: [
      { name: "Pending to Ship", count: totalPendingShip },
      { name: "Pending to Receive", count: totalPendingReceive },
    ],

    flowComparison: [
      { name: "Actual RMA Returns", count: totalReturns },
      { name: "D Stock Units Received", count: totalReceivedStock },
      { name: "A-Stock Sent Out", count: totalAStockSent },
      { name: "RMA Units Sent Out", count: totalRmaUnits },
      { name: "B-Stock Sent Out", count: totalBStockSent },
      { name: "Receive D-Stock", count: totalReceiveDStock },
      { name: "Receive B-Stock", count: totalReceiveBStock },
      { name: "Receive A-Stock", count: totalReceiveAStock },
      { name: "Pending to Ship", count: totalPendingShip },
      { name: "Pending to Receive", count: totalPendingReceive },
      { name: "Google Drive RMA Cases", count: totalDriveCases },
    ],
  };
}