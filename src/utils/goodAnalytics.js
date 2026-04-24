function cleanText(value) {
  return String(value || "").replace(/\u00a0/g, " ").trim();
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

function normalizeRows(rows = []) {
  return rows.filter((row) =>
    Object.values(row).some((value) => cleanText(value) !== "")
  );
}

function topWords(rows, commentCol) {
  const stop = new Set([
    "the", "and", "you", "your", "was", "were", "with", "for", "that",
    "this", "very", "thank", "thanks", "support", "service", "customer",
    "atomos", "issue", "product", "great", "good",
  ]);

  const map = {};

  rows.forEach((row) => {
    cleanText(row[commentCol])
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stop.has(word))
      .forEach((word) => {
        map[word] = (map[word] || 0) + 1;
      });
  });

  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);
}

export function buildGoodAnalytics(inputRows = []) {
  const rows = normalizeRows(inputRows);
  const columnsList = rows.length ? Object.keys(rows[0]) : [];

  const ticketCol = findColumn(columnsList, ["ticket id", "ticketid", "ticket"]);
  const commentCol = findColumn(columnsList, [
    "good satisfaction tickets comment",
    "satisfaction comments",
    "comment",
  ]);

  const withComment = rows.filter((row) => cleanText(row[commentCol]) !== "");
  const withoutComment = rows.filter((row) => cleanText(row[commentCol]) === "");

  return {
    type: "good",
    rows,
    columns: { ticketCol, commentCol },

    kpis: [
      { title: "Good Satisfaction Tickets", value: rows.length },
      { title: "With Comment", value: withComment.length },
      { title: "Without Comment", value: withoutComment.length },
      { title: "Positive Keywords", value: topWords(withComment, commentCol).length },
    ],

    commentStatus: [
      { name: "With Comment", count: withComment.length },
      { name: "Without Comment", count: withoutComment.length },
    ],

    topWords: topWords(withComment, commentCol),
    withComment,
    withoutComment,
  };
}