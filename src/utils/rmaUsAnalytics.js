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
    const found = normalized.find((col) => col.key.includes(target));
    if (found) return found.original;
  }

  return "";
}

function looksLikeHeaderRow(row) {
  const values = Object.values(row).map((v) => normalizeKey(v));
  return (
    values.includes("month") &&
    values.some((v) => v.includes("product")) &&
    values.some((v) => v.includes("actualrmareturns"))
  );
}

function promoteHeaderRow(inputRows) {
  if (!inputRows.length) return [];

  const firstHeaderIndex = inputRows.findIndex(looksLikeHeaderRow);
  if (firstHeaderIndex === -1) return inputRows;

  const headerRow = inputRows[firstHeaderIndex];
  const oldKeys = Object.keys(headerRow);

  const newHeaders = oldKeys.map((key, index) => {
    const header = cleanText(headerRow[key]);
    return header || `Column ${index + 1}`;
  });

  return inputRows.slice(firstHeaderIndex + 1).map((row) => {
    const next = {};
    oldKeys.forEach((oldKey, index) => {
      next[newHeaders[index]] = row[oldKey];
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

function sumBySku(rows, productCol, descCol, valueCol) {
  if (!productCol || !descCol || !valueCol) return [];

  const map = {};

  rows.forEach((row) => {
    const sku = cleanText(row[productCol]);
    const desc = cleanText(row[descCol]);
    const name = `${sku} — ${desc}`;
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
      rushSent: [],
      rmaUnits: [],
      rushBStock: [],
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
  const productCol = findColumn(columns, ["product"]);
  const descCol = findColumn(columns, ["description"]);
  const returnsCol = findColumn(columns, ["actual rma returns replacement", "actual rma returns"]);
  const receivedCol = findColumn(columns, ["d stock units received", "stock units received"]);
  const rushCol = findColumn(columns, ["rush sent out"]);
  const rmaUnitsCol = findColumn(columns, ["rma units"]);
  const rushBStockCol = findColumn(columns, ["rush sent b stock"]);
  const receiveDStockCol = findColumn(columns, ["receive d stock"]);
  const receiveBStockCol = findColumn(columns, ["receive b stock"]);
  const receiveAStockCol = findColumn(columns, ["receive a stock"]);
  const pendingShipCol = findColumn(columns, ["pending to ship"]);
  const pendingReceiveCol = findColumn(columns, ["pending to receive"]);
  const driveCasesCol = findColumn(columns, ["google drive rma case total", "drive rma case"]);

  const rows = validRows(rowsWithHeaders, monthCol, productCol);

  const totalReturns = sumColumn(rows, returnsCol);
  const totalReceivedStock = sumColumn(rows, receivedCol);
  const totalRush = sumColumn(rows, rushCol);
  const totalRmaUnits = sumColumn(rows, rmaUnitsCol);
  const totalRushBStock = sumColumn(rows, rushBStockCol);
  const totalReceiveDStock = sumColumn(rows, receiveDStockCol);
  const totalReceiveBStock = sumColumn(rows, receiveBStockCol);
  const totalReceiveAStock = sumColumn(rows, receiveAStockCol);
  const totalPendingShip = sumColumn(rows, pendingShipCol);
  const totalPendingReceive = sumColumn(rows, pendingReceiveCol);
  const totalDriveCases = sumColumn(rows, driveCasesCol);

  const totalSentOut = totalRush + totalRmaUnits + totalRushBStock;
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
      rushCol,
      rmaUnitsCol,
      rushBStockCol,
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
      { title: "Rush Sent Out", value: totalRush },
      { title: "RMA Units", value: totalRmaUnits },
      { title: "Rush Sent B-Stock", value: totalRushBStock },
      { title: "Total Pending", value: totalPending },
    ],

    monthlyReturns: sumBy(rows, monthCol, returnsCol),
    productReturns: sumBy(rows, descCol, returnsCol),
    skuReturns: sumBySku(rows, productCol, descCol, returnsCol),
    rushSent: sumBy(rows, descCol, rushCol),
    rmaUnits: sumBy(rows, descCol, rmaUnitsCol),
    rushBStock: sumBy(rows, descCol, rushBStockCol),
    receiveDStock: sumBy(rows, descCol, receiveDStockCol),
    receiveBStock: sumBy(rows, descCol, receiveBStockCol),
    receiveAStock: sumBy(rows, descCol, receiveAStockCol),
    driveCases: sumBy(rows, descCol, driveCasesCol),

    pendingComparison: [
      { name: "Pending to Ship", count: totalPendingShip },
      { name: "Pending to Receive", count: totalPendingReceive },
    ],

    flowComparison: [
      { name: "Actual RMA Returns", count: totalReturns },
      { name: "D Stock Units Received", count: totalReceivedStock },
      { name: "Rush Sent Out", count: totalRush },
      { name: "RMA Units", count: totalRmaUnits },
      { name: "Rush Sent B-Stock", count: totalRushBStock },
      { name: "Receive D-Stock", count: totalReceiveDStock },
      { name: "Receive B-Stock", count: totalReceiveBStock },
      { name: "Receive A-Stock", count: totalReceiveAStock },
      { name: "Pending to Ship", count: totalPendingShip },
      { name: "Pending to Receive", count: totalPendingReceive },
      { name: "Google Drive RMA Cases", count: totalDriveCases },
    ],
  };
}