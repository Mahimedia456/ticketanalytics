import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";

import ChartCard from "../components/ChartCard";
import DashboardActions from "../components/DashboardActions";
import DashboardHero from "../components/DashboardHero";
import KpiCard from "../components/KpiCard";

import { buildComparisonAnalytics } from "../utils/comparisonAnalytics";
import { exportDashboardExcel } from "../utils/exportExcel";
import { exportDashboardPDF } from "../utils/exportPdf";
import { getSelectedPeriodLabel } from "../utils/homeUploads";
import {
  fetchBadSatisfactionDashboard,
  fetchGoodSatisfactionDashboard,
} from "../services/satisfactionApi";

const DEFAULT_COLOR = "#00dcc5";

function getReportMonth() {
  try {
    const saved = JSON.parse(localStorage.getItem("atomos_home_uploads") || "{}");
    return saved.period || new Date().toISOString().slice(0, 7);
  } catch {
    return new Date().toISOString().slice(0, 7);
  }
}

export default function SatisfactionComparisonPage() {
  const [goodRows, setGoodRows] = useState([]);
  const [badRows, setBadRows] = useState([]);
  const [goodUpload, setGoodUpload] = useState(null);
  const [badUpload, setBadUpload] = useState(null);
  const [reportMonth, setReportMonth] = useState(getReportMonth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const period = getSelectedPeriodLabel();

  const analytics = useMemo(
    () => buildComparisonAnalytics(goodRows, badRows),
    [goodRows, badRows]
  );

  const hasData = goodRows.length || badRows.length;

  async function loadComparisonDashboard() {
    setLoading(true);
    setError("");

    try {
      const [goodData, badData] = await Promise.all([
        fetchGoodSatisfactionDashboard(reportMonth),
        fetchBadSatisfactionDashboard(reportMonth),
      ]);

      setGoodRows(goodData.rows || []);
      setBadRows(badData.rows || []);
      setGoodUpload(goodData.upload || null);
      setBadUpload(badData.upload || null);
    } catch (err) {
      setError(err.message || "Unable to load Satisfaction Comparison dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComparisonDashboard();
  }, [reportMonth]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DashboardActions
          onExportPDF={() =>
            exportDashboardPDF("comparison-dashboard-export", "Satisfaction Comparison")
          }
          onExportExcel={() =>
            exportDashboardExcel({
              rows: [
                ...goodRows.map((row) => ({
                  type: "Good Satisfaction",
                  ...row,
                })),
                ...badRows.map((row) => ({
                  type: "Bad Satisfaction",
                  ...row,
                })),
              ],
              analytics,
              title: "Satisfaction Comparison",
            })
          }
        />

        <button
          type="button"
          onClick={loadComparisonDashboard}
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

      <div id="comparison-dashboard-export" className="space-y-6 pb-10">
        <DashboardHero
          title="Satisfaction Comparison"
          description={`Showing Good vs Bad Satisfaction comparison for ${period}. Data is loaded from backend for ${reportMonth}.`}
        />

        <div className="dashboard-card flex flex-wrap items-center justify-between gap-4 p-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#00dcc5]">
              Backend Source
            </p>

            <div className="mt-1 space-y-1 text-sm text-zinc-400">
              <p>
                Good:{" "}
                {goodUpload?.original_filename
                  ? goodUpload.original_filename
                  : "No Good Satisfaction file found."}
              </p>

              <p>
                Bad:{" "}
                {badUpload?.original_filename
                  ? badUpload.original_filename
                  : "No Bad Satisfaction file found."}
              </p>
            </div>
          </div>

          <div className="min-w-[180px]">
            <label className="mb-2 block text-xs font-bold text-zinc-400">
              Report Month
            </label>
            <input
              type="month"
              value={reportMonth}
              onChange={(event) => setReportMonth(event.target.value)}
              className="input"
            />
          </div>
        </div>

        {error ? (
          <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-black">
                Unable to load Satisfaction Comparison dashboard
              </p>
              <p className="mt-1 text-sm leading-6">{error}</p>
            </div>
          </div>
        ) : null}

        {!hasData ? (
          <div className="dashboard-card p-10 text-center">
            <h2 className="text-2xl font-black text-white">
              No satisfaction data found
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Upload Good Satisfaction and Bad Satisfaction files from Home page.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {(analytics.kpis || []).map((kpi) => (
                <KpiCard key={kpi.title} title={kpi.title} value={kpi.value} />
              ))}
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              <ChartCard
                title="Good vs Bad Satisfaction"
                data={analytics.comparison || []}
                defaultType="pie"
                defaultColor={DEFAULT_COLOR}
                limit={10}
              />

              <ChartCard
                title="Good vs Bad Percentage"
                data={analytics.percentage || []}
                defaultType="bar"
                defaultColor={DEFAULT_COLOR}
                limit={10}
              />

              <div className="xl:col-span-2">
                <ChartCard
                  title="Comment Comparison"
                  data={analytics.commentsComparison || []}
                  defaultType="horizontalBar"
                  defaultColor={DEFAULT_COLOR}
                  horizontal
                  limit={10}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}