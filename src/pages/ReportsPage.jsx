import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Download, FileText, Loader2, RefreshCw } from "lucide-react";

import ChartCard from "../components/ChartCard";
import KpiCard from "../components/KpiCard";

import { fetchReports } from "../services/reportApi";
import { buildTicketAnalytics } from "../utils/ticketAnalytics";
import { buildRmaEmeaAnalytics } from "../utils/rmaEmeaAnalytics";
import { buildRmaUsAnalytics } from "../utils/rmaUsAnalytics";
import { buildGoodAnalytics } from "../utils/goodAnalytics";
import { buildBadAnalytics } from "../utils/badAnalytics";
import { buildComparisonAnalytics } from "../utils/comparisonAnalytics";
import { exportDashboardExcel } from "../utils/exportExcel";
import { exportDashboardPDF } from "../utils/exportPdf";

const DEFAULT_COLOR = "#00dcc5";

function getReportMonth() {
  try {
    const saved = JSON.parse(localStorage.getItem("atomos_home_uploads") || "{}");
    return saved.period || new Date().toISOString().slice(0, 7);
  } catch {
    return new Date().toISOString().slice(0, 7);
  }
}

export default function ReportsPage() {
  const [reportMonth, setReportMonth] = useState(getReportMonth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const rows = {
    tickets: data?.datasets?.tickets?.rows || [],
    rmaEmea: data?.datasets?.rmaEmea?.rows || [],
    rmaUs: data?.datasets?.rmaUs?.rows || [],
    good: data?.datasets?.good?.rows || [],
    bad: data?.datasets?.bad?.rows || [],
  };

  const analytics = useMemo(
    () => ({
      tickets: buildTicketAnalytics(rows.tickets),
      rmaEmea: buildRmaEmeaAnalytics(rows.rmaEmea),
      rmaUs: buildRmaUsAnalytics(rows.rmaUs),
      good: buildGoodAnalytics(rows.good),
      bad: buildBadAnalytics(rows.bad),
      comparison: buildComparisonAnalytics(rows.good, rows.bad),
    }),
    [data]
  );

  async function loadReports() {
    setLoading(true);
    setError("");

    try {
      const result = await fetchReports(reportMonth);
      setData(result);
    } catch (err) {
      setError(err.message || "Unable to load reports.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, [reportMonth]);

  const summary = data?.summary || {};

  const allRows = [
    ...rows.tickets.map((row) => ({ module: "Tickets", ...row })),
    ...rows.rmaEmea.map((row) => ({ module: "RMA EMEA", ...row })),
    ...rows.rmaUs.map((row) => ({ module: "RMA US", ...row })),
    ...rows.good.map((row) => ({ module: "Good Satisfaction", ...row })),
    ...rows.bad.map((row) => ({ module: "Bad Satisfaction", ...row })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#00dcc5]">
            Atomos Reports
          </p>
          <h1 className="mt-2 text-3xl font-black text-white">
            Executive Report
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Consolidated report for {reportMonth}.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            type="month"
            value={reportMonth}
            onChange={(event) => setReportMonth(event.target.value)}
            className="input max-w-[180px]"
          />

          <button
            type="button"
            onClick={loadReports}
            disabled={loading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-zinc-800 bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-zinc-300 hover:border-[#00dcc5]/70 hover:text-[#00dcc5] disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Refresh
          </button>

          <button
            type="button"
            onClick={() => exportDashboardPDF("atomos-executive-report", "Atomos Executive Report")}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-zinc-800 bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-zinc-300 hover:border-[#00dcc5]/70 hover:text-[#00dcc5]"
          >
            <FileText size={16} />
            PDF
          </button>

          <button
            type="button"
            onClick={() =>
              exportDashboardExcel({
                rows: allRows,
                analytics: {
                  kpis: [
                    { title: "Total Rows", value: summary.totalRows || 0 },
                    { title: "Tickets", value: summary.tickets || 0 },
                    { title: "RMA Total", value: summary.rmaTotal || 0 },
                    { title: "Satisfaction Total", value: summary.satisfactionTotal || 0 },
                  ],
                },
                title: "Atomos Executive Report",
              })
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#00dcc5] px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-black"
          >
            <Download size={16} />
            Excel
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-black">Unable to load reports</p>
            <p className="mt-1 text-sm leading-6">{error}</p>
          </div>
        </div>
      ) : null}

      <div id="atomos-executive-report" className="space-y-6 pb-10">
        <section className="dashboard-card p-8">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#00dcc5]">
            Reporting Month
          </p>

          <h2 className="mt-3 text-4xl font-black text-white">
            {reportMonth}
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">
            This page combines Ticket, RMA EMEA, RMA US, Good Satisfaction, Bad Satisfaction and Comparison insights.
          </p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard title="Total Rows" value={summary.totalRows || 0} />
          <KpiCard title="Ticket Rows" value={summary.tickets || 0} />
          <KpiCard title="RMA Total Rows" value={summary.rmaTotal || 0} />
          <KpiCard title="Satisfaction Rows" value={summary.satisfactionTotal || 0} />
          <KpiCard title="RMA EMEA Rows" value={summary.rmaEmea || 0} />
          <KpiCard title="RMA US Rows" value={summary.rmaUs || 0} />
          <KpiCard title="Good Satisfaction Rows" value={summary.good || 0} />
          <KpiCard title="Bad Satisfaction Rows" value={summary.bad || 0} />
        </div>

        <section className="grid gap-5 xl:grid-cols-2">
          <ChartCard
            title="Tickets by Region"
            data={analytics.tickets.region || []}
            defaultType="pie"
            defaultColor={DEFAULT_COLOR}
            limit={25}
          />

          <ChartCard
            title="Tickets by Category"
            data={analytics.tickets.category || []}
            defaultType="horizontalBar"
            defaultColor={DEFAULT_COLOR}
            horizontal
            limit={25}
          />

          <ChartCard
            title="RMA EMEA Flow"
            data={analytics.rmaEmea.flowComparison || []}
            defaultType="bar"
            defaultColor={DEFAULT_COLOR}
            limit={25}
          />

          <ChartCard
            title="RMA US Flow"
            data={analytics.rmaUs.flowComparison || []}
            defaultType="bar"
            defaultColor={DEFAULT_COLOR}
            limit={25}
          />

          <ChartCard
            title="Good vs Bad Satisfaction"
            data={analytics.comparison.comparison || []}
            defaultType="pie"
            defaultColor={DEFAULT_COLOR}
            limit={10}
          />

          <ChartCard
            title="Satisfaction Comment Comparison"
            data={analytics.comparison.commentsComparison || []}
            defaultType="horizontalBar"
            defaultColor={DEFAULT_COLOR}
            horizontal
            limit={10}
          />
        </section>
      </div>
    </div>
  );
}