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
    const found = normalized.find((col) => col.key === target);
    if (found) return found.original;
  }

  for (const name of names) {
    const target = normalizeKey(name);
    const found = normalized.find((col) => col.key.includes(target));
    if (found) return found.original;
  }

  return "";
}

function findProductSkuColumn(columns) {
  return findColumn(columns, [
    "product sku",
    "productsku",
    "sku",
    "item sku",
    "product code",
  ]);
}

function findProductNameColumn(columns, skuCol) {
  const normalized = columns.map((col) => ({
    original: col,
    key: normalizeKey(col),
  }));

  const excludeSku = normalized.filter((col) => col.original !== skuCol);

  const exactNames = [
    "product",
    "productname",
    "productdescription",
    "description",
    "item",
    "model",
  ];

  for (const name of exactNames) {
    const target = normalizeKey(name);
    const found = excludeSku.find((col) => col.key === target);
    if (found) return found.original;
  }

  const found = excludeSku.find(
    (col) =>
      col.key.includes("product") ||
      col.key.includes("description") ||
      col.key.includes("model")
  );

  return found?.original || "";
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
    values.includes("month") &&
    values.some((v) => v.includes("product")) &&
    values.some((v) => v.includes("actualrmareturns") || v.includes("returns"))
  );
}

function promoteHeaderRow(inputRows = []) {
  if (!inputRows.length) return [];

  const headerIndex = inputRows.findIndex(looksLikeHeaderRow);
  if (headerIndex === -1) return inputRows;

  const headerRow = inputRows[headerIndex];
  const oldKeys = Object.keys(headerRow);

  const headers = oldKeys.map((key, index) => {
    const header = cleanText(headerRow[key]);
    return header || `Column ${index + 1}`;
  });

  return inputRows.slice(headerIndex + 1).map((row) => {
    const next = {};

    oldKeys.forEach((oldKey, index) => {
      next[headers[index]] = row[oldKey];
    });

    return next;
  });
}

function validRows(rows, monthCol, skuCol, productCol) {
  return rows.filter((row) => {
    const month = cleanText(row[monthCol]);
    const sku = cleanText(row[skuCol]);
    const product = cleanText(row[productCol]);

    return month && (sku || product) && !month.toLowerCase().includes("rush sent");
  });
}

function sumColumn(rows, col) {
  if (!col) return 0;
  return rows.reduce((sum, row) => sum + cleanNumber(row[col]), 0);
}

function buildProductSkuName(row, skuCol, productCol) {
  const sku = cleanText(row[skuCol]);
  const product = cleanText(row[productCol]);

  if (sku && product) return `${sku} — ${product}`;
  if (sku) return sku;
  if (product) return product;

  return "Unknown";
}

function sumByProductSku(rows, skuCol, productCol, valueCol) {
  if (!valueCol) return [];

  const map = {};

  rows.forEach((row) => {
    const name = buildProductSkuName(row, skuCol, productCol);
    map[name] = (map[name] || 0) + cleanNumber(row[valueCol]);
  });

  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count);
}

function sumBy(rows, groupCol, valueCol) {
  if (!groupCol || !valueCol) return [];

  const map = {};

  rows.forEach((row) => {
    const name = cleanText(row[groupCol]) || "Unknown";
    map[name] = (map[name] || 0) + cleanNumber(row[valueCol]);
  });

  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count);
}

export function buildRmaEmeaAnalytics(inputRows = []) {
  const rowsWithHeaders = promoteHeaderRow(inputRows);

  if (!rowsWithHeaders.length) {
    return {
      columns: {},
      kpis: [],
      monthlyReturns: [],
      productReturns: [],
      skuReturns: [],
      receivedByProduct: [],
      rushByProduct: [],
      replacementUnits: [],
      bStockByProduct: [],
      dStockByProduct: [],
      receiveOnlyByProduct: [],
      pendingComparison: [],
      driveCases: [],
      flowComparison: [],
    };
  }

  const columns = Object.keys(rowsWithHeaders[0]);

  const monthCol = findColumn(columns, ["month"]);
  const skuCol = findProductSkuColumn(columns);
  const productCol = findProductNameColumn(columns, skuCol);

  const returnsCol = findColumn(columns, [
    "actual rma returns replacement",
    "actual rma returns",
    "rma returns",
    "returns",
  ]);

  const receivedCol = findColumn(columns, [
    "d stock units received",
    "stock units received",
    "units received",
  ]);

  const rushCol = findColumn(columns, ["rush sent out"]);
  const rmaUnitsCol = findColumn(columns, ["rma units"]);

  const rushBStockCol = findColumn(columns, [
    "replacement sent rush",
    "rush sent b stock",
    "rush b stock",
  ]) || findColumnOccurrence(columns, ["b stock"], 1);

  const dStockCol = findColumn(columns, [
    "d stock",
    "receive d stock",
  ]);

  const receiveBStockCol = findColumn(columns, [
    "receive b stock",
    "received b stock",
  ]) || findColumnOccurrence(columns, ["b stock"], 2);

  const aStockCol = findColumn(columns, [
    "receive a stock",
    "received a stock",
    "a stock",
  ]);

  const pendingShipCol = findColumn(columns, ["pending to ship"]);
  const pendingReceiveCol = findColumn(columns, ["pending to receive"]);

  const driveCasesCol = findColumn(columns, [
    "google drive rma case total",
    "drive rma case",
    "rma case total",
  ]);

  const rows = validRows(rowsWithHeaders, monthCol, skuCol, productCol);

  const totalReturns = sumColumn(rows, returnsCol);
  const totalReceivedStock = sumColumn(rows, receivedCol);
  const totalRush = sumColumn(rows, rushCol);
  const totalRmaUnits = sumColumn(rows, rmaUnitsCol);
  const totalRushBStock = sumColumn(rows, rushBStockCol);
  const totalDStock = sumColumn(rows, dStockCol);
  const totalReceiveBStock = sumColumn(rows, receiveBStockCol);
  const totalAStock = sumColumn(rows, aStockCol);
  const totalPendingShip = sumColumn(rows, pendingShipCol);
  const totalPendingReceive = sumColumn(rows, pendingReceiveCol);
  const totalDriveCases = sumColumn(rows, driveCasesCol);

  const totalSentOut = totalRush + totalRmaUnits + totalRushBStock;
  const totalReceived =
    totalReceivedStock + totalDStock + totalReceiveBStock + totalAStock;
  const totalPending = totalPendingShip + totalPendingReceive;

  return {
    columns: {
      monthCol,
      skuCol,
      productCol,
      returnsCol,
      receivedCol,
      rushCol,
      rmaUnitsCol,
      rushBStockCol,
      dStockCol,
      receiveBStockCol,
      aStockCol,
      pendingShipCol,
      pendingReceiveCol,
      driveCasesCol,
    },

    kpis: [
      { title: "Google Drive RMA Cases", value: totalDriveCases },
      { title: "Actual RMA Returns", value: totalReturns },
      { title: "Total Sent Out", value: totalSentOut },
      { title: "Total Received", value: totalReceived },
      { title: "Rush Sent Out", value: totalRush },
      { title: "RMA Units", value: totalRmaUnits },
      { title: "Rush / B-Stock Sent", value: totalRushBStock },
      { title: "Total Pending", value: totalPending },
    ],

    monthlyReturns: sumBy(rows, monthCol, returnsCol),

    productReturns: sumByProductSku(rows, skuCol, productCol, returnsCol),
    skuReturns: sumByProductSku(rows, skuCol, productCol, returnsCol),

    receivedByProduct: sumByProductSku(rows, skuCol, productCol, receivedCol),
    rushByProduct: sumByProductSku(rows, skuCol, productCol, rushCol),
    replacementUnits: sumByProductSku(rows, skuCol, productCol, rmaUnitsCol),
    bStockByProduct: sumByProductSku(rows, skuCol, productCol, rushBStockCol),
    dStockByProduct: sumByProductSku(rows, skuCol, productCol, dStockCol),
    receiveOnlyByProduct: sumByProductSku(rows, skuCol, productCol, receiveBStockCol),
    aStockByProduct: sumByProductSku(rows, skuCol, productCol, aStockCol),
    driveCases: sumByProductSku(rows, skuCol, productCol, driveCasesCol),

    pendingComparison: [
      { name: "Pending to Ship", count: totalPendingShip },
      { name: "Pending to Receive", count: totalPendingReceive },
    ],

    flowComparison: [
      { name: "Actual RMA Returns", count: totalReturns },
      { name: "D Stock Units Received", count: totalReceivedStock },
      { name: "Rush Sent Out", count: totalRush },
      { name: "RMA Units", count: totalRmaUnits },
      { name: "Rush / B-Stock Sent", count: totalRushBStock },
      { name: "D-Stock", count: totalDStock },
      { name: "Receive B-Stock", count: totalReceiveBStock },
      { name: "Receive A-Stock", count: totalAStock },
      { name: "Pending to Ship", count: totalPendingShip },
      { name: "Pending to Receive", count: totalPendingReceive },
      { name: "Google Drive RMA Cases", count: totalDriveCases },
    ],
  };
}