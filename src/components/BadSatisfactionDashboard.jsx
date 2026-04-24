import ChartCard from "./ChartCard";

export default function BadSatisfactionDashboard({ title, analytics = {} }) {
  const color = "#fb7185";

  return (
    <div className="space-y-5 pb-10">
      <div
        className="rounded-3xl p-10 text-center shadow-sm"
        style={{ backgroundColor: color }}
      >
        <h1 className="text-4xl font-black text-slate-900">{title}</h1>
        <p className="mt-2 text-slate-800 font-medium">
          Bad satisfaction analysis by ticket ID, comments, with-comment and without-comment status.
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
        <ChartCard
          title="With Comment / Without Comment"
          data={analytics.commentStatus || []}
          defaultType="pie"
          defaultColor={color}
        />

        <ChartCard
          title="Comment Percentage"
          data={analytics.percentage || []}
          defaultType="bar"
          defaultColor={color}
        />
      </div>

      <TicketTable title="Bad Satisfaction Ticket Table" rows={analytics.rows || []} />
    </div>
  );
}

function TicketTable({ title, rows = [] }) {
  return (
    <div className="dashboard-card p-5">
      <h3 className="font-black text-lg mb-4">{title}</h3>

      <div className="overflow-auto max-h-[720px] rounded-xl border border-slate-100">
        <table className="soft-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Ticket ID</th>
              <th>Status</th>
              <th>Comment</th>
            </tr>
          </thead>

          <tbody>
            {rows.length ? (
              rows.map((row, index) => (
                <tr key={`${row.ticketId}-${index}`}>
                  <td>{index + 1}</td>
                  <td className="font-bold">{row.ticketId}</td>
                  <td>{row.withComment ? "With Comment" : "Without Comment"}</td>
                  <td>{row.comment || "No comment"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-slate-400 py-6">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}