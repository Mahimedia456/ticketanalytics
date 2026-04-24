import ChartCard from "./ChartCard";
import { exportDashboardExcel } from "../utils/exportExcel";
import { exportDashboardPDF } from "../utils/exportPdf";

const DARK = "#0f172a";

export default function Dashboard({
  title = "Ticket Analysis",
  rows = [],
  analytics = {},
  color = DARK,
}) {
  const themeColor = color || DARK;

  function exportPDF() {
    exportDashboardPDF("ticket-dashboard-export", title);
  }

  return (
    <div className="w-full">
      {/* ACTION BUTTONS */}
      <div className="flex justify-end gap-3 mb-4">
        <button onClick={exportPDF} className="btn bg-slate-900 text-white">
          Export PDF
        </button>

        <button
          onClick={() => exportDashboardExcel({ rows, analytics, title })}
          className="btn bg-emerald-500 text-white"
        >
          Export Excel
        </button>
      </div>

      {/* DASHBOARD CONTENT */}
      <div id="ticket-dashboard-export" className="space-y-5 pb-10">
        
        {/* HEADER */}
        <div className="pdf-section">
          <div
            className="rounded-3xl p-10 text-center shadow-sm"
            style={{ backgroundColor: themeColor }}
          >
            <h1 className="text-4xl font-black text-white">{title}</h1>
            <p className="mt-2 text-white/90 font-medium">
              Ticket analysis by region, product, category, and monthly volume.
            </p>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="pdf-section">
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {(analytics.kpis || []).map((kpi) => (
              <div key={kpi.title} className="dashboard-card p-6">
                <p className="text-slate-500 text-sm font-semibold">
                  {kpi.title}
                </p>

                <h3 className="text-4xl font-black mt-2">
                  {kpi.value}
                </h3>

                <div
                  className="w-14 h-1.5 rounded-full mt-4"
                  style={{ backgroundColor: themeColor }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* CHARTS GRID */}
        <div className="grid xl:grid-cols-2 gap-5">

          {/* MONTH */}
          <ChartCard
            title="Tickets by Month"
            data={analytics.monthly || []}
            defaultType="bar"
            defaultColor={themeColor}
          />

          {/* REGION */}
          <ChartCard
            title="Tickets by Region"
            data={analytics.region || []}
            defaultType="pie"
            defaultColor={themeColor}
          />

          {/* CATEGORY FULL WIDTH */}
          <div className="xl:col-span-2">
            <ChartCard
              title="Tickets by Category"
              data={analytics.category || []}
              defaultType="horizontalBar"
              defaultColor={themeColor}
              horizontal
              limit={200}
            />
          </div>

          {/* TOP PRODUCTS FULL WIDTH */}
          
          {/* ALL PRODUCTS FULL WIDTH */}
          <div className="xl:col-span-2">
            <ChartCard
              title="All Products"
              subtitle="Complete product list from uploaded ticket sheet"
              data={analytics.productAll || []}
              defaultType="horizontalBar"
              defaultColor={themeColor}
              horizontal
              limit={500}
            />
          </div>

        </div>
      </div>
    </div>
  );
}