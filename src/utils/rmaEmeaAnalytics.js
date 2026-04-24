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

function findColumn(columns, names, occurrence = 1) {
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

function promoteHeaderRow(inputRows) {
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

function validRows(rows, monthCol, productCol) {
  return rows.filter((row) => {
    const month = cleanText(row[monthCol]);
    const product = cleanText(row[productCol]);

    return month && product && !month.toLowerCase().includes("rush sent");
  });
}

function sumColumn(rows, col) {
  if (!col) return 0;
  return rows.reduce((sum, row) => sum + cleanNumber(row[col]), 0);
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

function sumBySkuProduct(rows, skuCol, productCol, valueCol) {
  if (!skuCol || !productCol || !valueCol) return [];

  const map = {};

  rows.forEach((row) => {
    const sku = cleanText(row[skuCol]);
    const product = cleanText(row[productCol]);
    const name = sku ? `${sku} — ${product}` : product || "Unknown";

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
  const skuCol = findColumn(columns, ["product sku", "productsku", "sku"]);
  const productCol = findColumn(columns, ["product"]);
  const returnsCol = findColumn(columns, [
    "actual rma returns replacement",
    "actual rma returns",
    "rma returns",
  ]);
  const receivedCol = findColumn(columns, [
    "d stock units received",
    "stock units received",
    "units received",
  ]);
  const rushCol = findColumn(columns, ["rush sent out"]);
  const rmaUnitsCol = findColumn(columns, ["rma units"]);
  const rushBStockCol = findColumn(columns, ["replacement sent rush", "b stock"], 1);
  const dStockCol = findColumn(columns, ["d stock"]);
  const receiveBStockCol = findColumn(columns, ["b stock"], 2);
  const aStockCol = findColumn(columns, ["a stock"]);
  const pendingShipCol = findColumn(columns, ["pending to ship"]);
  const pendingReceiveCol = findColumn(columns, ["pending to receive"]);
  const driveCasesCol = findColumn(columns, [
    "google drive rma case total",
    "drive rma case",
    "rma case total",
  ]);

  const rows = validRows(rowsWithHeaders, monthCol, productCol);

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
  const totalReceived = totalReceivedStock + totalDStock + totalReceiveBStock + totalAStock;
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

    productReturns: sumBySkuProduct(rows, skuCol, productCol, returnsCol),
    skuReturns: sumBySkuProduct(rows, skuCol, productCol, returnsCol),

    receivedByProduct: sumBySkuProduct(rows, skuCol, productCol, receivedCol),
    rushByProduct: sumBySkuProduct(rows, skuCol, productCol, rushCol),
    replacementUnits: sumBySkuProduct(rows, skuCol, productCol, rmaUnitsCol),
    bStockByProduct: sumBySkuProduct(rows, skuCol, productCol, rushBStockCol),
    dStockByProduct: sumBySkuProduct(rows, skuCol, productCol, dStockCol),
    receiveOnlyByProduct: sumBySkuProduct(rows, skuCol, productCol, receiveBStockCol),
    aStockByProduct: sumBySkuProduct(rows, skuCol, productCol, aStockCol),
    driveCases: sumBySkuProduct(rows, skuCol, productCol, driveCasesCol),

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