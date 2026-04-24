import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const DARK = "#0f172a";

const DEFAULT_PIE_COLORS = [
  "#0f172a",
  "#38bdf8",
  "#4fd1a5",
  "#818cf8",
  "#f59e0b",
  "#fb7185",
  "#64748b",
  "#14b8a6",
  "#a855f7",
  "#ef4444",
];

export default function ChartCard({
  title,
  subtitle,
  data = [],
  defaultType = "bar",
  xKey = "name",
  yKey = "count",
  defaultColor = DARK,
  defaultTextColor = DARK,
  showTable = true,
  horizontal = false,
  limit = 20,
}) {
  const initialType = horizontal ? "horizontalBar" : defaultType;

  const [type, setType] = useState(initialType);
  const [color, setColor] = useState(defaultColor || DARK);
  const [textColor, setTextColor] = useState(defaultTextColor || DARK);
  const [pieColors, setPieColors] = useState(DEFAULT_PIE_COLORS);

  const chartData = data.slice(0, limit);
  const isHorizontal = type === "horizontalBar";
  const chartHeight = isHorizontal
    ? Math.max(420, chartData.length * 34)
    : 320;

  function updatePieColor(index, value) {
    setPieColors((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  return (
    <div className="dashboard-card overflow-hidden pdf-section">
      <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap justify-between gap-3">
        <div>
          <h3 className="font-black" style={{ color: textColor }}>
            {title}
          </h3>

          {subtitle && (
            <p className="text-xs mt-1" style={{ color: textColor, opacity: 0.65 }}>
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex gap-2 items-center flex-wrap justify-end">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="input"
          >
            <option value="bar">Bar</option>
            <option value="horizontalBar">Horizontal Bar</option>
            <option value="line">Line</option>
            <option value="pie">Pie</option>
          </select>

          {type === "pie" ? (
            chartData.map((_, index) => (
              <input
                key={`pie-color-${index}`}
                type="color"
                value={pieColors[index] || DARK}
                onChange={(e) => updatePieColor(index, e.target.value)}
                title={`Pie color ${index + 1}`}
              />
            ))
          ) : (
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          )}

          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
          />
        </div>
      </div>

      {!chartData.length ? (
        <div className="p-10 text-center text-slate-400">
          No data found. Select correct column from Design & Column Controls.
        </div>
      ) : (
        <div className="grid xl:grid-cols-[1.7fr_1fr] gap-4 p-5 pdf-expand">
          <div style={{ height: chartHeight }} className="pdf-expand">
            <ResponsiveContainer width="100%" height="100%">
              {type === "line" ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey={xKey} fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey={yKey}
                    stroke={color || DARK}
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              ) : type === "pie" ? (
                <PieChart>
                  <Tooltip />
                  <Pie
                    data={chartData}
                    dataKey={yKey}
                    nameKey={xKey}
                    outerRadius={110}
                    innerRadius={55}
                    paddingAngle={2}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                  >
                    {chartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          pieColors[index] ||
                          DEFAULT_PIE_COLORS[index % DEFAULT_PIE_COLORS.length]
                        }
                      />
                    ))}
                  </Pie>
                </PieChart>
              ) : isHorizontal ? (
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 10, right: 35, left: 170, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" fontSize={11} />
                  <YAxis
                    type="category"
                    dataKey={xKey}
                    fontSize={11}
                    width={165}
                    interval={0}
                  />
                  <Tooltip />
                  <Bar dataKey={yKey} fill={color || DARK} radius={[0, 8, 8, 0]} />
                </BarChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey={xKey}
                    fontSize={11}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Bar dataKey={yKey} fill={color || DARK} radius={[8, 8, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {showTable && (
            <div className="rounded-xl border border-slate-100 pdf-expand">
              <table className="soft-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{xKey === "date" ? "Date" : "Name"}</th>
                    <th>Count</th>
                  </tr>
                </thead>

                <tbody>
                  {data.map((row, index) => (
                    <tr key={`${row[xKey]}-${index}`}>
                      <td>{index + 1}</td>
                      <td>{row[xKey]}</td>
                      <td className="font-bold">{row[yKey]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}