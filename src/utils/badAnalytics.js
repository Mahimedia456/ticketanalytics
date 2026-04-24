function cleanText(value) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/_x000D_/g, " ")
    .trim();
}

function cleanNumber(value) {
  const num = Number(String(value || "").replace(/[^0-9.-]/g, ""));
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

export function buildBadAnalytics(inputRows = []) {
  const rows = inputRows.filter((row) =>
    Object.values(row).some((value) => cleanText(value) !== "")
  );

  const columns = rows.length ? Object.keys(rows[0]) : [];

  const ticketCol = findColumn(columns, ["ticket id", "ticketid", "ticket"]);
  const commentCol = findColumn(columns, [
    "bad satisfaction tickets comment",
    "bad satisfaction comment",
    "satisfaction comments",
    "comment",
  ]);

  const withCommentCol = findColumn(columns, [
    "bad satisfaction tickets w comment",
    "badsatisfactionticketswcomment",
    "w comment",
  ]);

  const totalCol = findColumn(columns, [
    "bad satisfaction tickets",
    "badsatisfactiontickets",
  ]);

  const normalizedRows = rows.map((row) => {
    const comment = cleanText(row[commentCol]);
    const total = totalCol ? cleanNumber(row[totalCol]) || 1 : 1;
    const withComment = withCommentCol
      ? cleanNumber(row[withCommentCol])
      : comment
        ? 1
        : 0;

    return {
      ticketId: cleanText(row[ticketCol]),
      comment,
      total,
      withComment,
      withoutComment: withComment ? 0 : 1,
    };
  });

  const totalTickets = normalizedRows.reduce((sum, row) => sum + row.total, 0);
  const withComment = normalizedRows.reduce((sum, row) => sum + row.withComment, 0);
  const withoutComment = totalTickets - withComment;
  const withCommentPercent = totalTickets
    ? Math.round((withComment / totalTickets) * 100)
    : 0;

  return {
    type: "bad",
    rows: normalizedRows,

    kpis: [
      { title: "Bad Satisfaction Tickets", value: totalTickets },
      { title: "With Comment", value: withComment },
      { title: "Without Comment", value: withoutComment },
      { title: "With Comment %", value: `${withCommentPercent}%` },
    ],

    commentStatus: [
      { name: "With Comment", count: withComment },
      { name: "Without Comment", count: withoutComment },
    ],

    percentage: [
      { name: "With Comment %", count: withCommentPercent },
      { name: "Without Comment %", count: 100 - withCommentPercent },
    ],
  };
}