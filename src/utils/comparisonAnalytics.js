import { buildGoodAnalytics } from "./goodAnalytics";
import { buildBadAnalytics } from "./badAnalytics";

export function buildComparisonAnalytics(goodRows = [], badRows = []) {
  const good = buildGoodAnalytics(goodRows);
  const bad = buildBadAnalytics(badRows);

  return {
    good,
    bad,

    kpis: [
      { title: "Good Satisfaction", value: good.rows.length },
      { title: "Bad Satisfaction", value: bad.rows.length },
      { title: "Good With Comment", value: good.withComment.length },
      { title: "Bad With Comment", value: bad.withComment.length },
    ],

    comparison: [
      { name: "Good Total", count: good.rows.length },
      { name: "Bad Total", count: bad.rows.length },
      { name: "Good With Comment", count: good.withComment.length },
      { name: "Bad With Comment", count: bad.withComment.length },
      { name: "Good Without Comment", count: good.withoutComment.length },
      { name: "Bad Without Comment", count: bad.withoutComment.length },
    ],
  };
}