function normalizeKey(key = "") {
  return String(key).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findColumn(columns, names) {
  const normalized = columns.map((c) => ({
    original: c,
    key: normalizeKey(c),
  }));

  for (const name of names) {
    const target = normalizeKey(name);
    const found = normalized.find((c) => c.key.includes(target));
    if (found) return found.original;
  }

  return null;
}

function groupCount(rows, key) {
  if (!key) return [];

  const map = {};

  rows.forEach((row) => {
    const value = String(row[key] || "").trim() || "Unknown";
    map[value] = (map[value] || 0) + 1;
  });

  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function parseDateValue(value) {
  if (!value) return null;

  const parsed = new Date(value);
  if (!isNaN(parsed)) return parsed;

  const parts = String(value).split("-");
  if (parts.length === 3) {
    const d = Number(parts[0]);
    const m = parts[1].toLowerCase();
    const y = Number(`20${parts[2]}`);

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

    if (months[m.slice(0, 3)] !== undefined) {
      return new Date(y, months[m.slice(0, 3)], d);
    }
  }

  return null;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function getWeekLabel(date) {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date - firstDay) / 86400000);
  const week = Math.ceil((days + firstDay.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function getMonthLabel(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function groupDate(rows, key, mode = "daily") {
  if (!key) return [];

  const map = {};

  rows.forEach((row) => {
    const date = parseDateValue(row[key]);
    if (!date) return;

    const label =
      mode === "weekly"
        ? getWeekLabel(date)
        : mode === "monthly"
          ? getMonthLabel(date)
          : formatDate(date);

    map[label] = (map[label] || 0) + 1;
  });

  return Object.entries(map)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

export function autoDetectColumns(rows) {
  if (!rows?.length) return {};

  const columns = Object.keys(rows[0]);

  return {
    dateCol: findColumn(columns, ["date", "created", "submitted", "day"]),
    categoryCol: findColumn(columns, ["category", "category1", "type", "reason"]),
    regionCol: findColumn(columns, ["empty", "region", "area", "market", "country", "geo"]),
    productCol: findColumn(columns, ["product", "product1", "tool", "model", "sku"]),
    statusCol: findColumn(columns, ["status", "submissionstatus", "state"]),
  };
}

export function buildAnalytics(rows, mapping = {}) {
  if (!rows?.length) {
    return {
      availableColumns: [],
      columns: {},
      kpis: [],
      daily: [],
      weekly: [],
      monthly: [],
      category: [],
      region: [],
      product: [],
      status: [],
    };
  }

  const availableColumns = Object.keys(rows[0]);
  const detected = autoDetectColumns(rows);

  const columns = {
    dateCol: mapping.dateCol || detected.dateCol,
    categoryCol: mapping.categoryCol || detected.categoryCol,
    regionCol: mapping.regionCol || detected.regionCol,
    productCol: mapping.productCol || detected.productCol,
    statusCol: mapping.statusCol || detected.statusCol,
  };

  const daily = groupDate(rows, columns.dateCol, "daily");
  const weekly = groupDate(rows, columns.dateCol, "weekly");
  const monthly = groupDate(rows, columns.dateCol, "monthly");
  const category = groupCount(rows, columns.categoryCol);
  const region = groupCount(rows, columns.regionCol);
  const product = groupCount(rows, columns.productCol);
  const status = groupCount(rows, columns.statusCol);

  return {
    availableColumns,
    columns,
    kpis: [
      { title: "Total Rows / Tickets", value: rows.length },
      { title: "Categories", value: category.length },
      { title: "Regions", value: region.length },
      { title: "Products / Models", value: product.length },
    ],
    daily,
    weekly,
    monthly,
    category: category.slice(0, 20),
    region: region.slice(0, 20),
    product: product.slice(0, 20),
    status,
  };
}