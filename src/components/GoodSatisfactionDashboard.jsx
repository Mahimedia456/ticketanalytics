import ChartCard from "./ChartCard";

export default function GoodSatisfactionDashboard({ title, analytics = {}, color = "#4fd1a5" }) {
  return (
    <div className="space-y-5 pb-10">
      <div className="rounded-3xl p-10 text-center shadow-sm" style={{ backgroundColor: color }}>
        <h1 className="text-4xl font-black text-slate-900">{title}</h1>
        <p className="mt-2 text-slate-800 font-medium">
          Good satisfaction tickets with comment and without comment analysis.
        </p>
      </div>

      <Kpis analytics={analytics} color={color} />

      <div className="grid xl:grid-cols-2 gap-5">
        <ChartCard title="Good Comment Status" data={analytics.commentStatus || []} defaultType="pie" defaultColor={color} />
        <ChartCard title="Good Comment Percentage" data={analytics.percentage || []} defaultType="bar" defaultColor={color} />
      </div>

      <Table title="Good Satisfaction Ticket Details" rows={analytics.rows || []} />
    </div>
  );
}

function Kpis({ analytics, color }) {
  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {(analytics.kpis || []).map((kpi) => (
        <div key={kpi.title} className="dashboard-card p-6">
          <p className="text-slate-500 text-sm font-semibold">{kpi.title}</p>
          <h3 className="text-4xl font-black mt-2">{kpi.value}</h3>
          <div className="w-14 h-1.5 rounded-full mt-4" style={{ backgroundColor: color }} />
        </div>
      ))}
    </div>
  );
}

function Table({ title, rows }) {
  return (
    <div className="dashboard-card p-5">
      <h3 className="font-black text-lg mb-4">{title}</h3>

      <div className="overflow-auto max-h-[700px] rounded-xl border border-slate-100">
        <table className="soft-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Ticket ID</th>
              <th>Comment Status</th>
              <th>Comment</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.ticketId}-${index}`}>
                <td>{index + 1}</td>
                <td className="font-bold">{row.ticketId}</td>
                <td>{row.withComment ? "With Comment" : "Without Comment"}</td>
                <td>{row.comment || "No comment"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}