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

export default function ChartCard({
  title,
  subtitle,
  data = [],
  defaultType = "bar",
  xKey = "name",
  yKey = "count",
  defaultColor = "#4fd1a5",
  defaultTextColor = "#0f172a",
  showTable = true,
}) {
  const [type, setType] = useState(defaultType);
  const [color, setColor] = useState(defaultColor);
  const [textColor, setTextColor] = useState(defaultTextColor);

  const colors = [color, "#38bdf8", "#818cf8", "#f59e0b", "#fb7185", "#94a3b8"];

  return (
    <div className="dashboard-card overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap justify-between gap-3">
        <div>
          <h3 className="font-black" style={{ color: textColor }}>{title}</h3>
          {subtitle && <p className="text-xs mt-1" style={{ color: textColor, opacity: 0.65 }}>{subtitle}</p>}
        </div>

        <div className="flex gap-2 items-center">
          <select value={type} onChange={(e) => setType(e.target.value)} className="input">
            <option value="bar">Bar</option>
            <option value="line">Line</option>
            <option value="pie">Pie</option>
          </select>

          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
        </div>
      </div>

      {!data.length ? (
        <div className="p-10 text-center text-slate-400">
          No data found. Select correct column from Design & Column Controls.
        </div>
      ) : (
        <div className="grid xl:grid-cols-[1.4fr_1fr] gap-4 p-5">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {type === "line" ? (
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey={xKey} fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              ) : type === "pie" ? (
                <PieChart>
                  <Tooltip />
                  <Pie data={data} dataKey={yKey} nameKey={xKey} outerRadius={110} innerRadius={55} paddingAngle={2}>
                    {data.map((_, i) => (
                      <Cell key={i} fill={colors[i % colors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              ) : (
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey={xKey} fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Bar dataKey={yKey} fill={color} radius={[8, 8, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {showTable && (
            <div className="overflow-auto rounded-xl border border-slate-100">
              <table className="soft-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{xKey === "date" ? "Date" : "Name"}</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 10).map((row, index) => (
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