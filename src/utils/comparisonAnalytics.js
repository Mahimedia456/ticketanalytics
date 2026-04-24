import { buildGoodAnalytics } from "./goodAnalytics";
import { buildBadAnalytics } from "./badAnalytics";

export function buildComparisonAnalytics(goodRows = [], badRows = []) {
  const good = buildGoodAnalytics(goodRows);
  const bad = buildBadAnalytics(badRows);

  const goodTotal = good.rows.reduce((sum, row) => sum + row.total, 0);
  const badTotal = bad.rows.reduce((sum, row) => sum + row.total, 0);
  const grandTotal = goodTotal + badTotal;

  const goodPercent = grandTotal ? Math.round((goodTotal / grandTotal) * 100) : 0;
  const badPercent = grandTotal ? Math.round((badTotal / grandTotal) * 100) : 0;

  return {
    good,
    bad,

    kpis: [
      { title: "Total Satisfaction Tickets", value: grandTotal },
      { title: "Good Satisfaction", value: goodTotal },
      { title: "Bad Satisfaction", value: badTotal },
      { title: "Good Satisfaction %", value: `${goodPercent}%` },
    ],

    comparison: [
      { name: "Good Satisfaction", count: goodTotal },
      { name: "Bad Satisfaction", count: badTotal },
    ],

    percentage: [
      { name: "Good %", count: goodPercent },
      { name: "Bad %", count: badPercent },
    ],

    commentsComparison: [
      { name: "Good With Comment", count: good.commentStatus?.[0]?.count || 0 },
      { name: "Good Without Comment", count: good.commentStatus?.[1]?.count || 0 },
      { name: "Bad With Comment", count: bad.commentStatus?.[0]?.count || 0 },
      { name: "Bad Without Comment", count: bad.commentStatus?.[1]?.count || 0 },
    ],
  };
}