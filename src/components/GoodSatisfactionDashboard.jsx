import ChartCard from "./ChartCard";
import { exportDashboardExcel } from "../utils/exportExcel";

export default function GoodSatisfactionDashboard({
  title = "Good Satisfaction",
  rows = [],
  analytics = {},
  color = "#4fd1a5",
}) {
  return (
    <div className="space-y-5 pb-10">
      <div className="flex justify-end">
        <button
          onClick={() => exportDashboardExcel({ rows, analytics, title })}
          className="btn bg-emerald-500 text-white"
        >
          Export Excel
        </button>
      </div>

      <div className="rounded-3xl p-10 text-center shadow-sm" style={{ backgroundColor: color }}>
        <h1 className="text-4xl font-black text-slate-900">{title}</h1>
        <p className="mt-2 text-slate-800 font-medium">
          Positive satisfaction tickets with comment and without comment breakdown.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {(analytics.kpis || []).map((kpi) => (
          <div key={kpi.title} className="dashboard-card p-6">
            <p className="text-slate-500 text-sm font-semibold">{kpi.title}</p>
            <h3 className="text-4xl font-black mt-2">{kpi.value}</h3>
            <div className="w-14 h-1.5 rounded-full mt-4" style={{ backgroundColor: color }} />
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-2 gap-5">
        <ChartCard title="Comment / No Comment" data={analytics.commentStatus || []} defaultType="pie" defaultColor={color} />
        <ChartCard title="Positive Comment Keywords" data={analytics.topWords || []} defaultType="bar" defaultColor={color} horizontal limit={30} />
      </div>

      <div className="grid xl:grid-cols-2 gap-5">
        <CommentTable title="Good Tickets With Comment" data={analytics.withComment || []} columns={analytics.columns || {}} />
        <CommentTable title="Good Tickets Without Comment" data={analytics.withoutComment || []} columns={analytics.columns || {}} />
      </div>
    </div>
  );
}

function CommentTable({ title, data = [], columns = {} }) {
  return (
    <div className="dashboard-card p-5">
      <h3 className="font-black text-lg mb-4">{title}</h3>
      <div className="overflow-auto max-h-[650px] rounded-xl border border-slate-100">
        <table className="soft-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Ticket ID</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {data.length ? (
              data.map((row, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td className="font-bold">{row[columns.ticketCol]}</td>
                  <td>{row[columns.commentCol] || "No comment"}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="3" className="text-center text-slate-400 py-6">No data found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}