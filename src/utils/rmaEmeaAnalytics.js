function cleanNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  const num = Number(String(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(num) ? num : 0;
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

function validRows(rows, monthCol, productCol) {
  return rows.filter((row) => {
    const month = String(row[monthCol] || "").trim();
    const product = String(row[productCol] || "").trim();

    return (
      month &&
      product &&
      !month.toLowerCase().includes("rush sent") &&
      !month.toLowerCase().includes("actual rma") &&
      !product.toLowerCase().includes("units that were")
    );
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
    const name = String(row[groupCol] || "Unknown").trim() || "Unknown";
    map[name] = (map[name] || 0) + cleanNumber(row[valueCol]);
  });

  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count);
}

function sumBySku(rows, skuCol, productCol, valueCol) {
  if (!skuCol || !productCol || !valueCol) return [];

  const map = {};

  rows.forEach((row) => {
    const sku = String(row[skuCol] || "").trim();
    const product = String(row[productCol] || "").trim();
    const name = `${sku} — ${product}`.trim();

    map[name] = (map[name] || 0) + cleanNumber(row[valueCol]);
  });

  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count);
}

export function buildRmaEmeaAnalytics(inputRows = []) {
  if (!inputRows.length) {
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

  const columns = Object.keys(inputRows[0]);

  const monthCol = findColumn(columns, ["month"]);
  const skuCol = findColumn(columns, ["product sku", "productsku", "sku"]);
  const productCol = findColumn(columns, ["product"]);
  const returnsCol = findColumn(columns, [
    "actual rma returns",
    "rma returns",
    "returns replacement",
    "replacement",
  ]);
  const receivedCol = findColumn(columns, [
    "d stock units received",
    "stock units received",
    "units received",
    "received",
  ]);
  const rushCol = findColumn(columns, ["rush sent out", "rush"]);
  const rmaUnitsCol = findColumn(columns, ["rma units"]);
  const replacementBStockCol = findColumn(columns, ["b stock"], 1);
  const dStockCol = findColumn(columns, ["d stock"]);
  const receiveOnlyBStockCol = findColumn(columns, ["b stock"], 2);
  const aStockCol = findColumn(columns, ["a stock"]);
  const pendingShipCol = findColumn(columns, ["pending to ship"]);
  const pendingReceiveCol = findColumn(columns, ["pending to receive"]);
  const driveCasesCol = findColumn(columns, [
    "google drive rma case total",
    "drive rma case",
    "rma case total",
  ]);

  const rows = validRows(inputRows, monthCol, productCol);

  const totalReturns = sumColumn(rows, returnsCol);
  const totalReceived = sumColumn(rows, receivedCol);
  const totalRush = sumColumn(rows, rushCol);
  const totalReplacement = sumColumn(rows, rmaUnitsCol);
  const totalBStock = sumColumn(rows, replacementBStockCol);
  const totalDStock = sumColumn(rows, dStockCol);
  const totalReceiveOnlyB = sumColumn(rows, receiveOnlyBStockCol);
  const totalAStock = sumColumn(rows, aStockCol);
  const totalReceiveOnly = totalReceiveOnlyB + totalAStock;
  const totalPendingShip = sumColumn(rows, pendingShipCol);
  const totalPendingReceive = sumColumn(rows, pendingReceiveCol);
  const totalDriveCases = sumColumn(rows, driveCasesCol);

  const totalSentOut = totalRush + totalReplacement;
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
      replacementBStockCol,
      dStockCol,
      receiveOnlyBStockCol,
      aStockCol,
      pendingShipCol,
      pendingReceiveCol,
      driveCasesCol,
    },

    kpis: [
      { title: "Google Drive RMA Cases", value: totalDriveCases },
      { title: "Actual RMA Returns", value: totalReturns },
      { title: "Total Sent Out", value: totalSentOut },
      { title: "Total Received", value: totalReceived + totalReceiveOnly },
      { title: "Rush Sent Out", value: totalRush },
      { title: "Replacement / RMA Units", value: totalReplacement },
      { title: "D-Stock Units Received", value: totalDStock },
      { title: "Total Pending", value: totalPending },
    ],

    monthlyReturns: sumBy(rows, monthCol, returnsCol),
    productReturns: sumBy(rows, productCol, returnsCol),
    skuReturns: sumBySku(rows, skuCol, productCol, returnsCol),
    receivedByProduct: sumBy(rows, productCol, receivedCol),
    rushByProduct: sumBy(rows, productCol, rushCol),
    replacementUnits: sumBy(rows, productCol, rmaUnitsCol),
    bStockByProduct: sumBy(rows, productCol, replacementBStockCol),
    dStockByProduct: sumBy(rows, productCol, dStockCol),
    receiveOnlyByProduct: sumBy(rows, productCol, receiveOnlyBStockCol),
    aStockByProduct: sumBy(rows, productCol, aStockCol),
    driveCases: sumBy(rows, productCol, driveCasesCol),

    pendingComparison: [
      { name: "Pending to Ship", count: totalPendingShip },
      { name: "Pending to Receive", count: totalPendingReceive },
    ],

    flowComparison: [
      { name: "Actual RMA Returns", count: totalReturns },
      { name: "D Stock Units Received", count: totalReceived },
      { name: "Rush Sent Out", count: totalRush },
      { name: "RMA Units", count: totalReplacement },
      { name: "Replacement B-Stock", count: totalBStock },
      { name: "D-Stock", count: totalDStock },
      { name: "Receive Only B-Stock", count: totalReceiveOnlyB },
      { name: "A-Stock", count: totalAStock },
      { name: "Pending to Ship", count: totalPendingShip },
      { name: "Pending to Receive", count: totalPendingReceive },
      { name: "Google Drive RMA Cases", count: totalDriveCases },
    ],
  };
}