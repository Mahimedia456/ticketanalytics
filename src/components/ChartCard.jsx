import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ATOMOS_CYAN = "#00dcc5";

const PIE_COLORS = [
  "#00dcc5",
  "#38bdf8",
  "#22d3ee",
  "#14b8a6",
  "#2dd4bf",
  "#67e8f9",
  "#0ea5e9",
  "#06b6d4",
  "#5eead4",
  "#99f6e4",
];

const limitOptions = [
  { label: "Top 10", value: 10 },
  { label: "Top 25", value: 25 },
  { label: "Top 50", value: 50 },
  { label: "All", value: "all" },
];

export default function ChartCard({
  title,
  subtitle,
  data = [],
  defaultType = "bar",
  xKey = "name",
  yKey = "count",
  defaultColor = ATOMOS_CYAN,
  showTable = true,
  horizontal = false,
  limit = 10,
}) {
  const [type, setType] = useState(horizontal ? "horizontalBar" : defaultType);
  const [color, setColor] = useState(defaultColor || ATOMOS_CYAN);
  const [chartLimit, setChartLimit] = useState(limit);

  const chartData = useMemo(() => {
    if (chartLimit === "all") return data;
    return data.slice(0, Number(chartLimit));
  }, [data, chartLimit]);

  const isHorizontal = type === "horizontalBar";
  const chartHeight = isHorizontal
    ? Math.max(380, chartData.length * 34)
    : 330;

  return (
    <div className="dashboard-card overflow-hidden pdf-section">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-800 px-5 py-4">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#00dcc5]">
            Chart
          </p>
          <h3 className="mt-1 text-lg font-black text-white">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="input h-10 max-w-[150px] py-0"
          >
            <option value="bar">Bar</option>
            <option value="horizontalBar">Horizontal</option>
            <option value="line">Line</option>
            <option value="pie">Pie</option>
          </select>

          <select
            value={chartLimit}
            onChange={(e) =>
              setChartLimit(e.target.value === "all" ? "all" : Number(e.target.value))
            }
            className="input h-10 max-w-[120px] py-0"
          >
            {limitOptions.map((item) => (
              <option key={item.label} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-12 cursor-pointer rounded-xl border border-zinc-800 bg-black p-1"
          />
        </div>
      </div>

      {!chartData.length ? (
        <div className="p-10 text-center text-sm font-semibold text-zinc-500">
          No data found.
        </div>
      ) : (
        <div className="grid gap-5 p-5 xl:grid-cols-[1.7fr_1fr]">
          <div className="pdf-expand" style={{ height: chartHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              {type === "line" ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey={xKey} fontSize={11} stroke="#a1a1aa" />
                  <YAxis fontSize={11} stroke="#a1a1aa" />
                  <Tooltip
                    contentStyle={{
                      background: "#050505",
                      border: "1px solid #27272a",
                      borderRadius: 14,
                      color: "#fff",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey={yKey}
                    stroke={color}
                    strokeWidth={3}
                    dot={{ r: 4, fill: color }}
                  />
                </LineChart>
              ) : type === "pie" ? (
                <PieChart>
                  <Tooltip
                    contentStyle={{
                      background: "#050505",
                      border: "1px solid #27272a",
                      borderRadius: 14,
                      color: "#fff",
                    }}
                  />
                  <Pie
                    data={chartData}
                    dataKey={yKey}
                    nameKey={xKey}
                    outerRadius={115}
                    innerRadius={58}
                    paddingAngle={2}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {chartData.map((_, index) => (
                      <Cell
                        key={index}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              ) : isHorizontal ? (
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 10, right: 35, left: 165, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis type="number" fontSize={11} stroke="#a1a1aa" />
                  <YAxis
                    type="category"
                    dataKey={xKey}
                    fontSize={11}
                    stroke="#a1a1aa"
                    width={160}
                    interval={0}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#050505",
                      border: "1px solid #27272a",
                      borderRadius: 14,
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey={yKey} fill={color} radius={[0, 10, 10, 0]} />
                </BarChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey={xKey}
                    fontSize={11}
                    stroke="#a1a1aa"
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={75}
                  />
                  <YAxis fontSize={11} stroke="#a1a1aa" />
                  <Tooltip
                    contentStyle={{
                      background: "#050505",
                      border: "1px solid #27272a",
                      borderRadius: 14,
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey={yKey} fill={color} radius={[10, 10, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {showTable ? (
            <div className="max-h-[420px] overflow-auto rounded-2xl border border-zinc-800 pdf-expand">
              <table className="soft-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row, index) => (
                    <tr key={`${row[xKey]}-${index}`}>
                      <td>{index + 1}</td>
                      <td>{row[xKey]}</td>
                      <td className="font-black text-white">{row[yKey]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}