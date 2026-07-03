import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const DEFAULT_COLORS = [
  "#00dcc5",
  "#38bdf8",
  "#d7ff00",
  "#94a3b8",
  "#020617",
  "#f97316",
  "#22c55e",
  "#a855f7",
  "#ef4444",
  "#facc15",
];

const CHART_TYPES = [
  { value: "bar", label: "BAR" },
  { value: "horizontal_bar", label: "HORIZONTAL BAR" },
  { value: "line", label: "LINE" },
  { value: "area", label: "AREA" },
  { value: "pie", label: "PIE" },
  { value: "donut", label: "DONUT" },
  { value: "radial", label: "RADIAL" },
  { value: "composed", label: "COMPOSED" },
];

const ENTRY_LIMITS = [
  { value: "auto", label: "AUTO" },
  { value: "all", label: "ALL" },
  { value: "10", label: "TOP 10" },
  { value: "20", label: "TOP 20" },
  { value: "50", label: "TOP 50" },
];

const LAYOUT_MODES = [
  { value: "auto", label: "AUTO WIDTH" },
  { value: "half", label: "HALF" },
  { value: "full", label: "FULL" },
];

function makeChartId(title = "") {
  return String(title)
    .trim()
    .toLowerCase()
    .replace(/[^\w]+/g, "_")
    .replace(/^_|_$/g, "");
}

function readLocalObject(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
}

function saveLocalObject(key, value) {
  localStorage.setItem(key, JSON.stringify(value || {}));
}

function formatAxisLabel(value = "") {
  const text = String(value || "");

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const [, month, day] = text.split("-");
    return `${day}/${month}`;
  }

  if (/^\d{4}-\d{2}$/.test(text)) {
    const [year, month] = text.split("-");
    return `${month}/${year.slice(2)}`;
  }

  if (text.length > 22) {
    return `${text.slice(0, 22)}…`;
  }

  return text;
}

function formatPieLabel(value = "") {
  const text = String(value || "");

  if (text.length > 16) {
    return `${text.slice(0, 16)}…`;
  }

  return text;
}

function averageLabelLength(rows = []) {
  if (!rows.length) return 0;

  return (
    rows.reduce((sum, item) => sum + String(item?.name || "").length, 0) /
    rows.length
  );
}

function isDateChart(title = "", rows = []) {
  const clean = String(title || "").toLowerCase();

  return (
    clean.includes("date") ||
    clean.includes("daily") ||
    clean.includes("month") ||
    clean.includes("trend") ||
    rows.some((item) =>
      /^\d{4}-\d{2}(-\d{2})?$/.test(String(item?.name || ""))
    )
  );
}

function normalizeRows(data = [], xKey = "name", yKey = "count") {
  return (Array.isArray(data) ? data : []).map((row) => ({
    ...row,
    name: row.name ?? row[xKey] ?? "-",
    value: Number(row.value ?? row[yKey] ?? row.count ?? 0),
  }));
}

function limitRows(rows, limit, type, title) {
  const sorted = isDateChart(title, rows)
    ? [...rows].sort((a, b) => String(a.name).localeCompare(String(b.name)))
    : [...rows];

  if (limit === "all") return sorted;
  if (limit === "10") return sorted.slice(0, 10);
  if (limit === "20") return sorted.slice(0, 20);
  if (limit === "50") return sorted.slice(0, 50);

  if (isDateChart(title, rows)) return sorted;

  if (["pie", "donut", "radial"].includes(type)) return sorted.slice(0, 12);
  if (["line", "area", "composed"].includes(type)) return sorted.slice(0, 50);

  return sorted.slice(0, 20);
}

function getAutoHeight({ count, type, isFullWidth, isHorizontal }) {
  if (!count) return 380;

  if (isHorizontal) {
    return Math.max(430, Math.min(980, count * 34 + 145));
  }

  if (["pie", "donut"].includes(type)) {
    return isFullWidth ? 540 : 460;
  }

  if (type === "radial") {
    return isFullWidth ? 530 : 430;
  }

  if (["line", "area", "composed"].includes(type)) {
    if (count > 25) return isFullWidth ? 530 : 470;
    if (count > 12) return isFullWidth ? 490 : 440;
    return isFullWidth ? 450 : 400;
  }

  if (count > 24) return isFullWidth ? 540 : 470;
  if (count > 14) return isFullWidth ? 500 : 430;

  return isFullWidth ? 450 : 400;
}

function CustomTooltip({ active, payload, label, title }) {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  const row = item?.payload || {};
  const name = row.name || label || "Item";
  const value = Number(row.value ?? item?.value ?? 0);

  return (
    <div className="min-w-[220px] rounded-2xl border border-zinc-700 bg-black p-4 shadow-2xl">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00dcc5]">
        {title}
      </p>

      <p className="mt-2 max-w-[260px] break-words text-sm font-black text-white">
        {name}
      </p>

      <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950 p-3">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
          Count
        </p>

        <p className="mt-1 text-2xl font-black text-[#00dcc5]">
          {value}
        </p>
      </div>
    </div>
  );
}

export default function ChartCard({
  title,
  subtitle,
  data = [],
  defaultType = "bar",
  xKey = "name",
  yKey = "count",
  defaultColor = "#00dcc5",
  className = "",
  horizontal = false,
  limit = "auto",
}) {
  const chartId = makeChartId(title);
  const storagePrefix = `atomos_chart_${chartId}`;
  const saved = readLocalObject(storagePrefix);

  const [selectedType, setSelectedType] = useState(
    saved.type || (horizontal ? "horizontal_bar" : defaultType)
  );

  const [entryLimit, setEntryLimit] = useState(
    saved.limit || String(limit || "auto")
  );

  const [layoutMode, setLayoutMode] = useState(saved.layout || "auto");

  const [colors, setColors] = useState(
    saved.colors || [
      defaultColor || "#00dcc5",
      ...DEFAULT_COLORS.filter((color) => color !== defaultColor),
    ]
  );

  function saveNext(next) {
    saveLocalObject(storagePrefix, {
      type: selectedType,
      limit: entryLimit,
      layout: layoutMode,
      colors,
      ...next,
    });
  }

  const originalData = useMemo(
    () => normalizeRows(data, xKey, yKey),
    [data, xKey, yKey]
  );

  const safeData = useMemo(
    () => limitRows(originalData, entryLimit, selectedType, title),
    [originalData, entryLimit, selectedType, title]
  );

  const isHorizontal = selectedType === "horizontal_bar";

  const isFullWidth =
    layoutMode === "full" ||
    (layoutMode === "auto" &&
      (safeData.length > 16 ||
        averageLabelLength(safeData) > 16 ||
        isDateChart(title, safeData)));

  const chartHeight = getAutoHeight({
    count: safeData.length,
    type: selectedType,
    isFullWidth,
    isHorizontal,
  });

  const primary = colors[0] || "#00dcc5";

  const total = safeData.reduce(
    (sum, item) => sum + Number(item.value || 0),
    0
  );

  const originalTotal = originalData.reduce(
    (sum, item) => sum + Number(item.value || 0),
    0
  );

  const hiddenCount = Math.max(originalData.length - safeData.length, 0);

  const shouldRotateAxis =
    ["line", "area", "composed"].includes(selectedType) ||
    safeData.length > 8 ||
    averageLabelLength(safeData) > 12;

  const xAxisProps = {
    dataKey: "name",
    tick: {
      fontSize: safeData.length > 40 ? 8 : safeData.length > 25 ? 9 : 10,
      fill: "#a1a1aa",
    },
    tickFormatter: formatAxisLabel,
    interval: 0,
    minTickGap: 0,
    angle: shouldRotateAxis ? -42 : 0,
    textAnchor: shouldRotateAxis ? "end" : "middle",
    height: shouldRotateAxis ? 96 : 42,
    stroke: "#71717a",
  };

  function updateType(value) {
    setSelectedType(value);
    saveNext({ type: value });
  }

  function updateLimit(value) {
    setEntryLimit(value);
    saveNext({ limit: value });
  }

  function updateLayout(value) {
    setLayoutMode(value);
    saveNext({ layout: value });
  }

  function updateColor(index, value) {
    const next = [...colors];
    next[index] = value;

    setColors(next);
    saveNext({ colors: next });
  }

  function addColor() {
    const next = [...colors, "#64748b"];

    setColors(next);
    saveNext({ colors: next });
  }

  function resetColors() {
    setColors(DEFAULT_COLORS);
    saveNext({ colors: DEFAULT_COLORS });
  }

  return (
    <div
      className={[
        "dashboard-card overflow-hidden pdf-section",
        isFullWidth ? "xl:col-span-2" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="border-b border-zinc-800 px-5 py-4">
        <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-start 2xl:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#00dcc5]">
              Chart
            </p>

            <h3 className="mt-1 text-lg font-black text-white">
              {title}
            </h3>

            <p className="mt-2 max-w-2xl text-xs leading-5 text-zinc-500">
              {safeData.length
                ? `${safeData.length} shown from ${
                    originalData.length
                  } records · ${total} visible count${
                    hiddenCount ? ` · ${hiddenCount} hidden` : ""
                  }${
                    originalTotal !== total
                      ? ` · ${originalTotal} total count`
                      : ""
                  }`
                : subtitle || "No chart data available"}
            </p>
          </div>

          <div className="no-print no-export flex flex-wrap items-center gap-2 2xl:justify-end">
            <select
              value={selectedType}
              onChange={(event) => updateType(event.target.value)}
              className="h-11 min-w-[170px] rounded-2xl border border-zinc-800 bg-black px-4 text-xs font-black uppercase text-white outline-none transition focus:border-[#00dcc5]"
            >
              {CHART_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={entryLimit}
              onChange={(event) => updateLimit(event.target.value)}
              className="h-11 min-w-[125px] rounded-2xl border border-zinc-800 bg-black px-4 text-xs font-black uppercase text-white outline-none transition focus:border-[#00dcc5]"
            >
              {ENTRY_LIMITS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={layoutMode}
              onChange={(event) => updateLayout(event.target.value)}
              className="h-11 min-w-[145px] rounded-2xl border border-zinc-800 bg-black px-4 text-xs font-black uppercase text-white outline-none transition focus:border-[#00dcc5]"
            >
              {LAYOUT_MODES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <div className="flex flex-wrap items-center gap-2">
              {colors.slice(0, 6).map((color, index) => (
                <input
                  key={`${color}-${index}`}
                  type="color"
                  value={color}
                  onChange={(event) => updateColor(index, event.target.value)}
                  className="h-11 w-11 cursor-pointer rounded-2xl border border-zinc-800 bg-black p-1.5"
                />
              ))}

              <button
                type="button"
                onClick={addColor}
                className="h-11 rounded-2xl border border-zinc-800 px-4 text-xs font-black text-zinc-400 hover:border-[#00dcc5]/60 hover:text-[#00dcc5]"
              >
                +
              </button>

              <button
                type="button"
                onClick={resetColors}
                className="h-11 rounded-2xl border border-zinc-800 px-4 text-xs font-black text-zinc-400 hover:border-[#00dcc5]/60 hover:text-[#00dcc5]"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5" style={{ height: `${chartHeight}px` }}>
        {!safeData.length ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-zinc-800 bg-black text-sm text-zinc-500">
            No data found.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {selectedType === "line" ? (
              <LineChart
                data={safeData}
                margin={{ top: 10, right: 28, bottom: 28, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis {...xAxisProps} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#a1a1aa" }}
                  stroke="#71717a"
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip title={title} />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={primary}
                  strokeWidth={3}
                  dot={{ r: safeData.length > 45 ? 2 : 4 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            ) : selectedType === "area" ? (
              <AreaChart
                data={safeData}
                margin={{ top: 10, right: 28, bottom: 28, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis {...xAxisProps} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#a1a1aa" }}
                  stroke="#71717a"
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip title={title} />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={primary}
                  fill={colors[1] || primary}
                  fillOpacity={0.28}
                  strokeWidth={3}
                />
              </AreaChart>
            ) : selectedType === "pie" || selectedType === "donut" ? (
              <PieChart margin={{ top: 25, right: 90, bottom: 25, left: 90 }}>
                <Tooltip content={<CustomTooltip title={title} />} />
                <Pie
                  data={safeData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={isFullWidth ? 150 : 122}
                  innerRadius={
                    selectedType === "donut" ? (isFullWidth ? 82 : 62) : 0
                  }
                  label={({ name, value }) =>
                    `${formatPieLabel(name)}: ${value}`
                  }
                >
                  {safeData.map((entry, index) => (
                    <Cell
                      key={`${entry.name}-${index}`}
                      fill={colors[index % colors.length] || primary}
                    />
                  ))}
                </Pie>

                {isFullWidth ? (
                  <Legend
                    iconSize={10}
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                  />
                ) : null}
              </PieChart>
            ) : selectedType === "radial" ? (
              <RadialBarChart
                data={safeData.map((item, index) => ({
                  ...item,
                  fill: colors[index % colors.length] || primary,
                }))}
                innerRadius="15%"
                outerRadius="95%"
                startAngle={90}
                endAngle={-270}
              >
                <Tooltip content={<CustomTooltip title={title} />} />
                <Legend
                  iconSize={10}
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                />
                <RadialBar dataKey="value" background cornerRadius={12} />
              </RadialBarChart>
            ) : selectedType === "composed" ? (
              <ComposedChart
                data={safeData}
                margin={{ top: 10, right: 28, bottom: 28, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis {...xAxisProps} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#a1a1aa" }}
                  stroke="#71717a"
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip title={title} />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {safeData.map((entry, index) => (
                    <Cell
                      key={`${entry.name}-${index}`}
                      fill={colors[index % colors.length] || primary}
                    />
                  ))}
                </Bar>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={colors[1] || "#38bdf8"}
                  strokeWidth={3}
                  dot={{ r: safeData.length > 45 ? 2 : 4 }}
                />
              </ComposedChart>
            ) : selectedType === "horizontal_bar" ? (
              <BarChart
                data={safeData}
                layout="vertical"
                margin={{
                  top: 10,
                  right: 28,
                  bottom: 12,
                  left: isFullWidth ? 110 : 65,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#a1a1aa" }}
                  stroke="#71717a"
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#a1a1aa" }}
                  stroke="#71717a"
                  width={isFullWidth ? 230 : 150}
                  tickFormatter={formatAxisLabel}
                  interval={0}
                />
                <Tooltip content={<CustomTooltip title={title} />} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                  {safeData.map((entry, index) => (
                    <Cell
                      key={`${entry.name}-${index}`}
                      fill={colors[index % colors.length] || primary}
                    />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <BarChart
                data={safeData}
                margin={{ top: 10, right: 28, bottom: 28, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis {...xAxisProps} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#a1a1aa" }}
                  stroke="#71717a"
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip title={title} />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {safeData.map((entry, index) => (
                    <Cell
                      key={`${entry.name}-${index}`}
                      fill={colors[index % colors.length] || primary}
                    />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}