import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BrainCircuit,
  Loader2,
  RefreshCw,
} from "lucide-react";

import ChartCard from "../components/ChartCard";
import DashboardActions from "../components/DashboardActions";
import DashboardHero from "../components/DashboardHero";
import KpiCard from "../components/KpiCard";
import SatisfactionAiModal from "../components/SatisfactionAiModal";

import { buildBadAnalytics } from "../utils/badAnalytics";
import { exportDashboardExcel } from "../utils/exportExcel";
import { exportDashboardPDF } from "../utils/exportPdf";
import { getSelectedPeriodLabel } from "../utils/homeUploads";
import { fetchBadSatisfactionDashboard } from "../services/satisfactionApi";

const DEFAULT_COLOR = "#00dcc5";

function getReportMonth() {
  try {
    const saved = JSON.parse(localStorage.getItem("atomos_home_uploads") || "{}");
    return saved.period || new Date().toISOString().slice(0, 7);
  } catch {
    return new Date().toISOString().slice(0, 7);
  }
}

function BadSatisfactionAiTable({ rows = [] }) {
  const [selectedRow, setSelectedRow] = useState(null);

  return (
    <>
      <section className="dashboard-card overflow-hidden">
        <div className="border-b border-zinc-800 p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#00dcc5]">
            Bad Satisfaction Data
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-white">
            Bad Satisfaction Records
          </h2>

          <p className="mt-2 text-sm text-zinc-400">
            Showing {rows.length} bad satisfaction records.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
            <thead className="border-b border-zinc-800 bg-black/60 text-xs uppercase tracking-[0.14em] text-zinc-500">
              <tr>
                <th className="min-w-[140px] px-4 py-4 font-black">
                  Ticket ID
                </th>
                <th className="min-w-[380px] px-4 py-4 font-black">
                  Comments
                </th>
                <th className="min-w-[320px] px-4 py-4 font-black">
                  Reason Notes
                </th>
                <th className="min-w-[180px] px-4 py-4 font-black">
                  AI Summary
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-900">
              {rows.length ? (
                rows.map((row, index) => {
                  const comment = row.comment || row.comments || "";
                  const reason = row.reasonNotes || row.reason || "";
                  const disabled = !comment && !reason;

                  return (
                    <tr
                      key={`${row.ticketId || "ticket"}-${index}`}
                      className="align-top transition hover:bg-[#00dcc5]/5"
                    >
                      <td className="px-4 py-4 font-bold text-white">
                        {row.ticketId || "-"}
                      </td>

                      <td className="px-4 py-4 text-zinc-300">
                        <span className="block whitespace-normal break-words leading-6">
                          {comment || "-"}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-zinc-300">
                        <span className="block whitespace-normal break-words leading-6">
                          {reason || "-"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => setSelectedRow(row)}
                          disabled={disabled}
                          className="no-print no-export inline-flex items-center gap-2 rounded-xl bg-[#00dcc5] px-4 py-2.5 text-xs font-black text-black transition hover:bg-[#44fff0] disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500"
                        >
                          <BrainCircuit size={16} />
                          View Summary
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-sm font-bold text-zinc-500"
                  >
                    No bad satisfaction records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedRow ? (
        <SatisfactionAiModal
          row={selectedRow}
          rating="Bad"
          onClose={() => setSelectedRow(null)}
        />
      ) : null}
    </>
  );
}

export default function BadSatisfactionPage() {
  const [rows, setRows] = useState([]);
  const [upload, setUpload] = useState(null);
  const [reportMonth, setReportMonth] = useState(getReportMonth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const period = getSelectedPeriodLabel();

  const analytics = useMemo(() => buildBadAnalytics(rows), [rows]);

  async function loadBadSatisfactionDashboard() {
    setLoading(true);
    setError("");

    try {
      const data = await fetchBadSatisfactionDashboard(reportMonth);
      setRows(data.rows || []);
      setUpload(data.upload || null);
    } catch (err) {
      setError(err.message || "Unable to load Bad Satisfaction dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBadSatisfactionDashboard();
  }, [reportMonth]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DashboardActions
          onExportPDF={() =>
            exportDashboardPDF("bad-satisfaction-export", "Bad Satisfaction")
          }
          onExportExcel={() =>
            exportDashboardExcel({
              rows,
              analytics,
              title: "Bad Satisfaction",
            })
          }
        />

        <button
          type="button"
          onClick={loadBadSatisfactionDashboard}
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

      <div id="bad-satisfaction-export" className="space-y-6 pb-10">
        <DashboardHero
          title="Bad Satisfaction"
          description={`Showing Bad Satisfaction data for ${period}. Data is loaded from backend for ${reportMonth}.`}
        />

        <div className="dashboard-card flex flex-wrap items-center justify-between gap-4 p-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#00dcc5]">
              Backend Source
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              {upload?.original_filename
                ? `Loaded from: ${upload.original_filename}`
                : "No uploaded Bad Satisfaction file found for this month."}
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
              <p className="font-black">
                Unable to load Bad Satisfaction dashboard
              </p>
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
            title="Bad Comment Status"
            data={analytics.commentStatus || []}
            defaultType="pie"
            defaultColor={DEFAULT_COLOR}
            limit={10}
          />

          <ChartCard
            title="Bad Comment Percentage"
            data={analytics.percentage || []}
            defaultType="bar"
            defaultColor={DEFAULT_COLOR}
            limit={10}
          />
        </div>

        <BadSatisfactionAiTable rows={analytics.rows || []} />
      </div>
    </div>
  );
}