import { useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";

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
    const home = JSON.parse(
      localStorage.getItem("atomos_home_uploads") || "{}"
    );

    return home.period || new Date().toISOString().slice(0, 7);
  } catch {
    return new Date().toISOString().slice(0, 7);
  }
}

export default function RmaEmeaPage() {
  const period = getSelectedPeriodLabel();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportMonth, setReportMonth] = useState(getReportMonth());

  const analytics = useMemo(
    () => buildRmaEmeaAnalytics(rows),
    [rows]
  );

  async function loadData() {
    setLoading(true);

    try {
      const data = await fetchRmaEmeaDashboard(reportMonth);

      setRows(data.rows || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [reportMonth]);

  return (
    <div className="space-y-6">

      <div className="flex justify-between">

        <DashboardActions
          onExportPDF={() =>
            exportDashboardPDF(
              "rma-emea-dashboard-export",
              "RMA EMEA Dashboard"
            )
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
          onClick={loadData}
          className="btn"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin"/>
          ) : (
            <RefreshCw size={18}/>
          )}

          Refresh
        </button>

      </div>

      <div
        id="rma-emea-dashboard-export"
        className="space-y-6 pb-10"
      >

        <DashboardHero
          title="RMA EMEA Dashboard"
          description={`Showing RMA EMEA data for ${period}.`}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {(analytics.kpis || []).map((kpi) => (
            <KpiCard
              key={kpi.title}
              title={kpi.title}
              value={kpi.value}
            />
          ))}

        </div>

        <div className="grid gap-5 xl:grid-cols-2">

          <ChartCard
            title="Monthly RMA Returns"
            data={analytics.monthlyReturns}
            defaultType="bar"
            defaultColor={DEFAULT_COLOR}
            limit={25}
          />

          <ChartCard
            title="RMA Flow Comparison"
            data={analytics.flowComparison}
            defaultType="bar"
            defaultColor={DEFAULT_COLOR}
            limit={25}
          />

          <div className="xl:col-span-2">

            <ChartCard
              title="All Product RMA Returns"
              data={analytics.productReturns}
              defaultType="horizontalBar"
              defaultColor={DEFAULT_COLOR}
              horizontal
              limit={50}
            />

          </div>

          <ChartCard
            title="Replacement Units"
            data={analytics.replacementUnits}
            defaultType="horizontalBar"
            defaultColor={DEFAULT_COLOR}
            horizontal
            limit={25}
          />

          <ChartCard
            title="Rush Sent Out"
            data={analytics.rushByProduct}
            defaultType="horizontalBar"
            defaultColor={DEFAULT_COLOR}
            horizontal
            limit={25}
          />

          <ChartCard
            title="Stock Received"
            data={analytics.receivedByProduct}
            defaultType="horizontalBar"
            defaultColor={DEFAULT_COLOR}
            horizontal
            limit={25}
          />

          <ChartCard
            title="A Stock"
            data={analytics.aStockByProduct}
            defaultType="horizontalBar"
            defaultColor={DEFAULT_COLOR}
            horizontal
            limit={25}
          />

          <ChartCard
            title="Pending"
            data={analytics.pendingComparison}
            defaultType="bar"
            defaultColor={DEFAULT_COLOR}
            limit={10}
          />

          <ChartCard
            title="Drive Cases"
            data={analytics.driveCases}
            defaultType="horizontalBar"
            defaultColor={DEFAULT_COLOR}
            horizontal
            limit={25}
          />

        </div>

      </div>

    </div>
  );
}