function cleanText(value) {
  return String(value ?? "").trim().replace(/^"+|"+$/g, "").trim();
}

function normalizeKey(value = "") {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function cleanProduct(value) {
  return cleanText(value).replace(/\s+/g, " ") || "Unknown";
}

function cleanRegion(value) {
  return cleanText(value).replace(/\s+/g, " ") || "Unknown";
}

function cleanCategory(value) {
  return cleanText(value).replace(/\s+/g, " ") || "Unknown";
}

function findColumn(columns, names) {
  const normalized = columns.map((col) => ({
    original: col,
    key: normalizeKey(col),
  }));

  for (const name of names) {
    const target = normalizeKey(name);
    const found = normalized.find((col) => col.key === target || col.key.includes(target));
    if (found) return found.original;
  }

  return "";
}

function parseDateValue(value) {
  if (!value) return null;

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "number") {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const date = new Date(excelEpoch.getTime() + value * 86400000);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const text = cleanText(value);

  const direct = new Date(text);
  if (!Number.isNaN(direct.getTime())) return direct;

  const dashParts = text.split("-");
  if (dashParts.length === 3) {
    const day = Number(dashParts[0]);
    const monthText = dashParts[1].slice(0, 3).toLowerCase();
    const yearRaw = Number(dashParts[2]);

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

    if (day && months[monthText] !== undefined && yearRaw) {
      const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;
      return new Date(year, months[monthText], day);
    }
  }

  return null;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function getMonthLabel(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getWeekLabel(date) {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date - firstDay) / 86400000);
  const week = Math.ceil((days + firstDay.getDay() + 1) / 7);
  return `${date.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function groupCount(rows, col, cleaner = cleanText) {
  if (!col) return [];

  const map = {};

  rows.forEach((row) => {
    const name = cleaner(row[col]);
    map[name] = (map[name] || 0) + 1;
  });

  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || String(a.name).localeCompare(String(b.name)));
}

function groupDate(rows, col, mode = "monthly") {
  if (!col) return [];

  const map = {};

  rows.forEach((row) => {
    const date = parseDateValue(row[col]);
    if (!date) return;

    const label =
      mode === "daily"
        ? formatDate(date)
        : mode === "weekly"
          ? getWeekLabel(date)
          : getMonthLabel(date);

    map[label] = (map[label] || 0) + 1;
  });

  return Object.entries(map)
    .map(([name, count]) => ({ name, count, date: name }))
    .sort((a, b) => String(a.name).localeCompare(String(b.name)));
}

function buildRegionCategory(rows, regionCol, categoryCol) {
  if (!regionCol || !categoryCol) return [];

  const map = {};

  rows.forEach((row) => {
    const region = cleanRegion(row[regionCol]);
    const category = cleanCategory(row[categoryCol]);
    const key = `${region} — ${category}`;

    map[key] = (map[key] || 0) + 1;
  });

  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function normalizeTicketRows(inputRows = []) {
  return inputRows
    .map((row) => {
      const next = {};

      Object.entries(row || {}).forEach(([key, value]) => {
        const cleanKey = cleanText(key);
        next[cleanKey] = typeof value === "string" ? cleanText(value) : value;
      });

      return next;
    })
    .filter((row) => Object.values(row).some((value) => cleanText(value) !== ""));
}

export function buildTicketAnalytics(inputRows = []) {
  const rows = normalizeTicketRows(inputRows);

  if (!rows.length) {
    return {
      availableColumns: [],
      columns: {},
      kpis: [],
      monthly: [],
      weekly: [],
      region: [],
      product: [],
      productAll: [],
      category: [],
      regionCategory: [],
      rawRows: [],
    };
  }

  const availableColumns = Object.keys(rows[0]);

  const ticketNumberCol = findColumn(availableColumns, [
    "Ticket Number",
    "Ticket Num",
    "Ticket",
    "ID",
  ]);

  const regionCol = findColumn(availableColumns, [
    "Region",
    "Market",
    "Area",
    "Country",
  ]);

  const dateCol = findColumn(availableColumns, [
    "Date",
    "Created",
    "Created At",
    "Submitted",
  ]);

  const productCol = findColumn(availableColumns, [
    "Product",
    "Product Name",
    "Model",
    "SKU",
  ]);

  const categoryCol = findColumn(availableColumns, [
    "Category",
    "Type",
    "Reason",
    "Issue",
  ]);

  const validRows = rows.filter((row) => {
    const ticket = cleanText(row[ticketNumberCol]);
    const region = cleanText(row[regionCol]);
    const date = cleanText(row[dateCol]);
    const product = cleanText(row[productCol]);
    const category = cleanText(row[categoryCol]);

    return ticket || region || date || product || category;
  });

  const monthly = groupDate(validRows, dateCol, "monthly");
  const weekly = groupDate(validRows, dateCol, "weekly");

  const region = groupCount(validRows, regionCol, cleanRegion);
  const productAll = groupCount(validRows, productCol, cleanProduct);
  const category = groupCount(validRows, categoryCol, cleanCategory);
  const regionCategory = buildRegionCategory(validRows, regionCol, categoryCol);

  return {
    availableColumns,
    columns: {
      ticketNumberCol,
      regionCol,
      dateCol,
      productCol,
      categoryCol,
    },

    kpis: [
      { title: "Total Tickets", value: validRows.length },
      { title: "Regions", value: region.length },
      { title: "Products", value: productAll.length },
      { title: "Categories", value: category.length },
    ],

    monthly,
    weekly,

    region,
    product: productAll.slice(0, 20),
    productAll,
    category,
    regionCategory,

    rawRows: validRows,
  };
}