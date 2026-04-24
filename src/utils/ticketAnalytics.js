function cleanText(value) {
  return String(value || "").trim();
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

function groupCount(rows, col) {
  if (!col) return [];

  const map = {};

  rows.forEach((row) => {
    const value = cleanText(row[col]) || "Unknown";
    map[value] = (map[value] || 0) + 1;
  });

  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function parseDate(value) {
  if (!value) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "number") {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    return new Date(excelEpoch.getTime() + value * 86400000);
  }

  const text = cleanText(value);

  const direct = new Date(text);
  if (!Number.isNaN(direct.getTime())) return direct;

  const parts = text.split("-");
  if (parts.length === 3) {
    const day = Number(parts[0]);
    const mon = parts[1].toLowerCase();
    const yearRaw = Number(parts[2]);

    const months = {
      jan: 0,
      feb: 1,
      mar: 2,
      apr: 3,
      may: 4,
      jun: 5,
      jul: 6,
      aug: 7,
      sep: 8,
      oct: 9,
      nov: 10,
      dec: 11,
    };

    const month = months[mon.slice(0, 3)];
    const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;

    if (day && month !== undefined && year) {
      return new Date(year, month, day);
    }
  }

  return null;
}

function monthLabel(date) {
  return date.toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function groupByMonth(rows, dateCol) {
  if (!dateCol) return [];

  const map = {};

  rows.forEach((row) => {
    const date = parseDate(row[dateCol]);
    if (!date) return;

    const label = monthLabel(date);
    map[label] = (map[label] || 0) + 1;
  });

  return Object.entries(map).map(([name, count]) => ({ name, count }));
}

function normalizeRows(rows = []) {
  return rows
    .filter((row) => Object.values(row).some((v) => cleanText(v) !== ""))
    .map((row) => {
      const next = {};

      Object.entries(row).forEach(([key, value]) => {
        next[cleanText(key)] = typeof value === "string" ? value.trim() : value;
      });

      return next;
    });
}

export function autoDetectTicketColumns(inputRows = []) {
  const rows = normalizeRows(inputRows);
  if (!rows.length) return {};

  const columns = Object.keys(rows[0]);

  return {
    ticketNumberCol: findColumn(columns, [
      "ticket number",
      "ticket no",
      "ticket id",
      "ticket",
      "id",
    ]),
    regionCol: findColumn(columns, [
      "region",
      "market",
      "country",
      "area",
      "geo",
    ]),
    dateCol: findColumn(columns, [
      "date",
      "created",
      "created at",
      "submitted",
      "ticket date",
    ]),
    productCol: findColumn(columns, [
      "product",
      "product name",
      "model",
      "sku",
      "device",
    ]),
    categoryCol: findColumn(columns, [
      "category",
      "type",
      "reason",
      "issue",
      "request type",
    ]),
  };
}

export function buildTicketAnalytics(inputRows = [], mapping = {}) {
  const rows = normalizeRows(inputRows);

  if (!rows.length) {
    return {
      availableColumns: [],
      columns: {},
      kpis: [],
      monthly: [],
      region: [],
      product: [],
      productAll: [],
      category: [],
      tickets: [],
    };
  }

  const availableColumns = Object.keys(rows[0]);
  const detected = autoDetectTicketColumns(rows);

  const columns = {
    ticketNumberCol: mapping.ticketNumberCol || detected.ticketNumberCol,
    regionCol: mapping.regionCol || detected.regionCol,
    dateCol: mapping.dateCol || detected.dateCol,
    productCol: mapping.productCol || detected.productCol,
    categoryCol: mapping.categoryCol || detected.categoryCol,
  };

  const region = groupCount(rows, columns.regionCol);
  const productAll = groupCount(rows, columns.productCol);
  const category = groupCount(rows, columns.categoryCol);
  const monthly = groupByMonth(rows, columns.dateCol);

  return {
    availableColumns,
    columns,

    kpis: [
      { title: "Total Tickets", value: rows.length },
      { title: "Regions", value: region.length },
      { title: "Products", value: productAll.length },
      { title: "Categories", value: category.length },
    ],

    monthly,
    region,
    product: productAll.slice(0, 20),
    productAll,
    category,
    tickets: rows,
  };
}