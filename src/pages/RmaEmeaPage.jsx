import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";

import ChartCard from "../components/ChartCard";
import DashboardActions from "../components/DashboardActions";
import DashboardHero from "../components/DashboardHero";
import KpiCard from "../components/KpiCard";

import { buildRmaEmeaAnalytics } from "../utils/rmaEmeaAnalytics";
import { exportDashboardExcel } from "../utils/exportExcel";
import { exportDashboardPDF } from "../utils/exportPdf";
import { getSelectedPeriodLabel } from "../utils/homeUploads";
import { fetchRmaEmeaDashboard } from "../services/rmaEmeaApi";

const DEFAULT_COLOR = "#00dcc5";

function getReportMonth() {
  try {
    const home = JSON.parse(localStorage.getItem("atomos_home_uploads") || "{}");
    return home.period || new Date().toISOString().slice(0, 7);
  } catch {
    return new Date().toISOString().slice(0, 7);
  }
}

export default function RmaEmeaPage() {
  const period = getSelectedPeriodLabel();

  const [rows, setRows] = useState([]);
  const [upload, setUpload] = useState(null);
  const [moduleKey, setModuleKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [reportMonth, setReportMonth] = useState(getReportMonth());
  const [error, setError] = useState("");

  const analytics = useMemo(() => buildRmaEmeaAnalytics(rows), [rows]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const data = await fetchRmaEmeaDashboard(reportMonth);

      setRows(data.rows || []);
      setUpload(data.upload || null);
      setModuleKey(data.moduleKey || "");
    } catch (err) {
      setError(err.message || "Unable to load RMA EMEA dashboard.");
      setRows([]);
      setUpload(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [reportMonth]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DashboardActions
          onExportPDF={() =>
            exportDashboardPDF("rma-emea-dashboard-export", "RMA EMEA Dashboard")
          }
          onExportExcel={() =>
            exportDashboardExcel({
              rows,
              analytics,
              title: "RMA EMEA Dashboard",
            })
          }
        />

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="btn"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <RefreshCw size={18} />
          )}
          Refresh
        </button>
      </div>

      <div id="rma-emea-dashboard-export" className="space-y-6 pb-10">
        <DashboardHero
          title="RMA EMEA Dashboard"
          description={`Showing RMA EMEA data for ${period}.`}
        />

       

        {error ? (
          <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />

            <div>
              <p className="font-black">Unable to load RMA EMEA dashboard</p>
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
          {/* <ChartCard
            title="Monthly RMA Returns"
            data={analytics.monthlyReturns || []}
            defaultType="bar"
            defaultColor={DEFAULT_COLOR}
            limit={25}
          /> */}

          <ChartCard
            title="RMA Flow Comparison"
            data={analytics.flowComparison || []}
            defaultType="bar"
            defaultColor={DEFAULT_COLOR}
            limit={25}
          />

          <ChartCard
            title="All Product RMA Returns"
            data={analytics.productReturns || []}
            defaultType="horizontal_bar"
            defaultColor={DEFAULT_COLOR}
            horizontal
            limit={50}
            className="xl:col-span-2"
          />

          <ChartCard
            title="Replacement Units"
            data={analytics.replacementUnits || []}
            defaultType="horizontal_bar"
            defaultColor={DEFAULT_COLOR}
            horizontal
            limit={25}
          />

          <ChartCard
            title="Rush Sent Out"
            data={analytics.rushByProduct || []}
            defaultType="horizontal_bar"
            defaultColor={DEFAULT_COLOR}
            horizontal
            limit={25}
          />

          <ChartCard
            title="Stock Received"
            data={analytics.receivedByProduct || []}
            defaultType="horizontal_bar"
            defaultColor={DEFAULT_COLOR}
            horizontal
            limit={25}
          />

          <ChartCard
            title="A Stock"
            data={analytics.aStockByProduct || []}
            defaultType="horizontal_bar"
            defaultColor={DEFAULT_COLOR}
            horizontal
            limit={25}
          />

          <ChartCard
            title="Pending"
            data={analytics.pendingComparison || []}
            defaultType="bar"
            defaultColor={DEFAULT_COLOR}
            limit={10}
          />

          <ChartCard
            title="Drive Cases"
            data={analytics.driveCases || []}
            defaultType="horizontal_bar"
            defaultColor={DEFAULT_COLOR}
            horizontal
            limit={25}
          />
        </div>
      </div>
    </div>
  );
}