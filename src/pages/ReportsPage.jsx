import { getHomeRows, getSelectedPeriodLabel } from "../utils/homeUploads";
import KpiCard from "../components/KpiCard";

export default function ReportsPage() {
  const period = getSelectedPeriodLabel();

  const tickets = getHomeRows("tickets");
  const rmaEmea = getHomeRows("rmaEmea");
  const rmaUs = getHomeRows("rmaUs");
  const good = getHomeRows("good");
  const bad = getHomeRows("bad");

  const totalRows =
    tickets.length + rmaEmea.length + rmaUs.length + good.length + bad.length;

  return (
    <div className="space-y-6">
      <section className="dashboard-card p-8">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#00dcc5]">
          Atomos Reports
        </p>

        <h1 className="mt-3 text-3xl font-black text-white">
          Reports
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">
          Showing report summary for {period}. Full report generation will connect with backend month-wise data.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Ticket Rows" value={tickets.length} />
        <KpiCard title="RMA EMEA Rows" value={rmaEmea.length} />
        <KpiCard title="RMA US Rows" value={rmaUs.length} />
        <KpiCard title="Total Rows" value={totalRows} />
        <KpiCard title="Good Satisfaction Rows" value={good.length} />
        <KpiCard title="Bad Satisfaction Rows" value={bad.length} />
      </div>
    </div>
  );
}