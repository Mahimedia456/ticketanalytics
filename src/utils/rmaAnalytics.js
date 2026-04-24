function cleanNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
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

function sumBy(rows, groupCol, valueCol) {
  const map = {};

  rows.forEach((row) => {
    const name = String(row[groupCol] || "Unknown").trim() || "Unknown";
    map[name] = (map[name] || 0) + cleanNumber(row[valueCol]);
  });

  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function sumColumns(rows, columns) {
  return columns.reduce((total, col) => {
    return total + rows.reduce((sum, row) => sum + cleanNumber(row[col]), 0);
  }, 0);
}

export function buildRmaAnalytics(rows = []) {
  if (!rows.length) {
    return {
      columns: {},
      kpis: [],
      monthly: [],
      products: [],
      rushSent: [],
      rmaUnits: [],
      bStock: [],
      dStock: [],
      receiveOnly: [],
      pending: [],
      driveCases: [],
      comparison: [],
    };
  }

  const columns = Object.keys(rows[0]);

  const monthCol = findColumn(columns, ["month"]);
  const skuCol = findColumn(columns, ["productsku", "sku"]);
  const productCol = findColumn(columns, ["product"]);
  const returnsCol = findColumn(columns, ["returns"]);
  const receivedCol = findColumn(columns, ["stockunitsreceived", "received"]);
  const rushCol = findColumn(columns, ["rushsentout", "rush"]);
  const rmaUnitsCol = findColumn(columns, ["rmaunits"]);
  const bStockCol = findColumn(columns, ["bstock"]);
  const dStockCol = findColumn(columns, ["dstock"]);
  const receiveOnlyCol = findColumn(columns, ["receiveonly"]);
  const pendingShipCol = findColumn(columns, ["pendingtoship"]);
  const pendingReceiveCol = findColumn(columns, ["pendingtoreceive"]);
  const driveCasesCol = findColumn(columns, ["driverma"]);

  const totalReturns = sumColumns(rows, [returnsCol]);
  const totalReceived = sumColumns(rows, [receivedCol]);
  const totalRush = sumColumns(rows, [rushCol]);
  const totalRmaUnits = sumColumns(rows, [rmaUnitsCol]);
  const totalBStock = sumColumns(rows, [bStockCol]);
  const totalDStock = sumColumns(rows, [dStockCol]);
  const totalReceiveOnly = sumColumns(rows, [receiveOnlyCol]);
  const totalPendingShip = sumColumns(rows, [pendingShipCol]);
  const totalPendingReceive = sumColumns(rows, [pendingReceiveCol]);
  const totalDriveCases = sumColumns(rows, [driveCasesCol]);

  return {
    columns: {
      monthCol,
      skuCol,
      productCol,
      returnsCol,
      receivedCol,
      rushCol,
      rmaUnitsCol,
      bStockCol,
      dStockCol,
      receiveOnlyCol,
      pendingShipCol,
      pendingReceiveCol,
      driveCasesCol,
    },

    kpis: [
      { title: "Total RMA Returns", value: totalReturns },
      { title: "Stock Units Received", value: totalReceived },
      { title: "Rush Sent Out", value: totalRush },
      { title: "RMA Units", value: totalRmaUnits },
      { title: "B-Stock", value: totalBStock },
      { title: "D-Stock", value: totalDStock },
      { title: "Receive Only", value: totalReceiveOnly },
      { title: "Drive RMA Cases", value: totalDriveCases },
    ],

    monthly: monthCol && returnsCol ? sumBy(rows, monthCol, returnsCol) : [],
    products: productCol && returnsCol ? sumBy(rows, productCol, returnsCol) : [],
    rushSent: productCol && rushCol ? sumBy(rows, productCol, rushCol) : [],
    rmaUnits: productCol && rmaUnitsCol ? sumBy(rows, productCol, rmaUnitsCol) : [],
    bStock: productCol && bStockCol ? sumBy(rows, productCol, bStockCol) : [],
    dStock: productCol && dStockCol ? sumBy(rows, productCol, dStockCol) : [],
    receiveOnly: productCol && receiveOnlyCol ? sumBy(rows, productCol, receiveOnlyCol) : [],
    pending: [
      { name: "Pending to Ship", count: totalPendingShip },
      { name: "Pending to Receive", count: totalPendingReceive },
    ],
    driveCases: productCol && driveCasesCol ? sumBy(rows, productCol, driveCasesCol) : [],
    comparison: [
      { name: "RMA Returns", count: totalReturns },
      { name: "Stock Received", count: totalReceived },
      { name: "Rush Sent", count: totalRush },
      { name: "RMA Units", count: totalRmaUnits },
      { name: "B-Stock", count: totalBStock },
      { name: "D-Stock", count: totalDStock },
      { name: "Receive Only", count: totalReceiveOnly },
    ],
  };
}