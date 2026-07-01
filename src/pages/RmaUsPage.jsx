import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";

import ChartCard from "../components/ChartCard";
import DashboardActions from "../components/DashboardActions";
import DashboardHero from "../components/DashboardHero";
import KpiCard from "../components/KpiCard";

import { buildRmaUsAnalytics } from "../utils/rmaUsAnalytics";
import { exportDashboardExcel } from "../utils/exportExcel";
import { exportDashboardPDF } from "../utils/exportPdf";
import { getSelectedPeriodLabel } from "../utils/homeUploads";
import { fetchRmaUsDashboard } from "../services/rmaUsApi";

const DEFAULT_COLOR = "#00dcc5";

function getReportMonth() {
  try {
    const saved = JSON.parse(localStorage.getItem("atomos_home_uploads") || "{}");
    return saved.period || new Date().toISOString().slice(0, 7);
  } catch {
    return new Date().toISOString().slice(0, 7);
  }
}

export default function RmaUsPage() {
  const [rows, setRows] = useState([]);
  const [upload, setUpload] = useState(null);
  const [reportMonth, setReportMonth] = useState(getReportMonth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const period = getSelectedPeriodLabel();

  const analytics = useMemo(() => buildRmaUsAnalytics(rows), [rows]);

  async function loadRmaUsDashboard() {
    setLoading(true);
    setError("");

    try {
      const data = await fetchRmaUsDashboard(reportMonth);
      setRows(data.rows || []);
      setUpload(data.upload || null);
    } catch (err) {
      setError(err.message || "Unable to load RMA US dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRmaUsDashboard();
  }, [reportMonth]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DashboardActions
          onExportPDF={() =>
            exportDashboardPDF("rma-us-dashboard-export", "RMA US Dashboard")
          }
          onExportExcel={() =>
            exportDashboardExcel({
              rows,
              analytics,
              title: "RMA US Dashboard",
            })
          }
        />

        <button
          type="button"
          onClick={loadRmaUsDashboard}
          disabled={loading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-zinc-800 bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.08em] text-zinc-300 hover:border-[#00dcc5]/70 hover:text-[#00dcc5] disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <RefreshCw size={16} />
          )}
          Refresh
        </button>
      </div>

      <div id="rma-us-dashboard-export" className="space-y-6 pb-10">
        <DashboardHero
          title="RMA US Dashboard"
          description={`Showing RMA US data for ${period}. Data is loaded from backend for ${reportMonth}.`}
        />

        <div className="dashboard-card flex flex-wrap items-center justify-between gap-4 p-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#00dcc5]">
              Backend Source
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              {upload?.original_filename
                ? `Loaded from: ${upload.original_filename}`
                : "No uploaded RMA US file found for this month."}
            </p>
          </div>

          <div className="min-w-[180px]">
            <label className="mb-2 block text-xs font-bold text-zinc-400">
              Report Month
            </label>
            <input
              type="month"
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
              className="input"
            />
          </div>
        </div>

        {error ? (
          <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-black">Unable to load RMA US dashboard</p>
              <p className="mt-1 text-sm leading-6">{error}</p>
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(analytics.kpis || []).map((kpi) => (
            <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} />
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <ChartCard
            title="Monthly RMA Returns"
            data={analytics.monthlyReturns || []}
            defaultType="bar"
            defaultColor={DEFAULT_COLOR}
            limit={25}
          />

          <ChartCard
            title="US RMA Flow Comparison"
            data={analytics.flowComparison || []}
            defaultType="bar"
            defaultColor={DEFAULT_COLOR}
            limit={25}
          />

          <div className="xl:col-span-2">
            <ChartCard
              title="All Product / SKU RMA Returns"
              data={analytics.skuReturns || []}
              defaultType="horizontalBar"
              defaultColor={DEFAULT_COLOR}
              horizontal
              limit={50}
            />
          </div>

          <ChartCard
            title="Rush Sent Out by Product"
            data={analytics.rushSent || []}
            defaultType="horizontalBar"
            defaultColor={DEFAULT_COLOR}
            horizontal
            limit={25}
          />

          <ChartCard
            title="RMA Units by Product"
            data={analytics.rmaUnits || []}
            defaultType="horizontalBar"
            defaultColor={DEFAULT_COLOR}
            horizontal
            limit={25}
          />

          <ChartCard
            title="Receive D-Stock by Product"
            data={analytics.receiveDStock || []}
            defaultType="horizontalBar"
            defaultColor={DEFAULT_COLOR}
            horizontal
            limit={25}
          />

          <ChartCard
            title="Pending Ship / Receive"
            data={analytics.pendingComparison || []}
            defaultType="bar"
            defaultColor={DEFAULT_COLOR}
            limit={10}
          />

          <div className="xl:col-span-2">
            <ChartCard
              title="Google Drive RMA Cases by Product"
              data={analytics.driveCases || []}
              defaultType="horizontalBar"
              defaultColor={DEFAULT_COLOR}
              horizontal
              limit={50}
            />
          </div>
        </div>
      </div>
    </div>
  );
}