import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ChartCard from "./ChartCard";
import { exportDashboardExcel } from "../utils/exportExcel";
import { exportDashboardPDF } from "../utils/exportPdf";

const DARK = "#0f172a";

export default function RmaUsDashboard({
  title = "RMA US Dashboard",
  rows = [],
  analytics = {},
  color = DARK,
}) {
  const themeColor = color || DARK;

function exportPDF() {
  exportDashboardPDF("rma-us-dashboard-export", title);
}

  return (
    <div className="w-full">
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

      <div id="rma-us-dashboard-export" className="space-y-5 pb-10">
        <div
          className="rounded-3xl p-10 text-center shadow-sm"
          style={{ backgroundColor: themeColor }}
        >
          <h1 className="text-4xl font-black text-white">{title}</h1>
          <p className="mt-2 text-white/90 font-medium">
            US RMA analysis for actual returns, rush sent out, RMA units,
            rush sent B-stock, received D/B/A stock, pending items, and drive cases.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {(analytics.kpis || []).map((kpi) => (
            <div key={kpi.title} className="dashboard-card p-6">
              <p className="text-slate-500 text-sm font-semibold">{kpi.title}</p>
              <h3 className="text-4xl font-black mt-2">{kpi.value}</h3>
              <div
                className="w-14 h-1.5 rounded-full mt-4"
                style={{ backgroundColor: themeColor }}
              />
            </div>
          ))}
        </div>

        <div className="grid xl:grid-cols-2 gap-5">
          <ChartCard title="Monthly RMA Returns" data={analytics.monthlyReturns || []} defaultType="bar" defaultColor={themeColor} />
          <ChartCard title="US RMA Flow Comparison" data={analytics.flowComparison || []} defaultType="bar" defaultColor={themeColor} />

          <div className="xl:col-span-2">
            <ChartCard title="All Product / SKU RMA Returns" data={analytics.skuReturns || []} defaultType="bar" defaultColor={themeColor} horizontal limit={100} />
          </div>

          <ChartCard title="Rush Sent Out by Product" data={analytics.rushSent || []} defaultType="bar" defaultColor={themeColor} horizontal limit={60} />
          <ChartCard title="RMA Units by Product" data={analytics.rmaUnits || []} defaultType="bar" defaultColor={themeColor} horizontal limit={60} />
          <ChartCard title="Rush Sent B-Stock by Product" data={analytics.rushBStock || []} defaultType="bar" defaultColor={themeColor} horizontal limit={60} />
          <ChartCard title="Receive D-Stock by Product" data={analytics.receiveDStock || []} defaultType="bar" defaultColor={themeColor} horizontal limit={60} />
          <ChartCard title="Receive B-Stock by Product" data={analytics.receiveBStock || []} defaultType="bar" defaultColor={themeColor} horizontal limit={60} />
          <ChartCard title="Receive A-Stock by Product" data={analytics.receiveAStock || []} defaultType="bar" defaultColor={themeColor} horizontal limit={60} />
          <ChartCard title="Pending Ship / Receive" data={analytics.pendingComparison || []} defaultType="bar" defaultColor={themeColor} />
          <ChartCard title="Google Drive RMA Cases by Product" data={analytics.driveCases || []} defaultType="bar" defaultColor={themeColor} horizontal limit={60} />
        </div>

        <div className="dashboard-card p-5">
          <h3 className="font-black text-lg mb-4">RMA US Summary Tables</h3>

          <div className="grid xl:grid-cols-3 gap-5">
            <MiniTable title="All Product / SKU RMA Returns" data={analytics.skuReturns || []} />
            <MiniTable title="Rush Sent Out" data={analytics.rushSent || []} />
            <MiniTable title="RMA Units" data={analytics.rmaUnits || []} />
            <MiniTable title="Rush Sent B-Stock" data={analytics.rushBStock || []} />
            <MiniTable title="Receive D-Stock" data={analytics.receiveDStock || []} />
            <MiniTable title="Receive B-Stock" data={analytics.receiveBStock || []} />
            <MiniTable title="Receive A-Stock" data={analytics.receiveAStock || []} />
            <MiniTable title="Google Drive RMA Cases" data={analytics.driveCases || []} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniTable({ title, data = [] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
      <div className="bg-slate-50 px-4 py-3 font-black">{title}</div>

      <div className="max-h-[520px] overflow-auto">
        <table className="soft-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product / SKU</th>
              <th>Total</th>
            </tr>
          </thead>

          <tbody>
            {data.length ? (
              data.map((row, index) => (
                <tr key={`${title}-${index}`}>
                  <td>{index + 1}</td>
                  <td>{row.name}</td>
                  <td className="font-bold">{row.count}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center text-slate-400 py-6">
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