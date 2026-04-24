import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ChartCard from "./ChartCard";
import { exportDashboardExcel } from "../utils/exportExcel";
import { exportDashboardPDF } from "../utils/exportPdf";

const DARK = "#0f172a";

export default function RmaEmeaDashboard({
  title = "RMA EMEA Dashboard",
  rows = [],
  analytics = {},
  color = DARK,
}) {
  const themeColor = color || DARK;

 function exportPDF() {
  exportDashboardPDF("rma-emea-dashboard-export", title);
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

      <div id="rma-emea-dashboard-export" className="space-y-5 pb-10">
        <div
          className="rounded-3xl p-10 text-center shadow-sm"
          style={{ backgroundColor: themeColor }}
        >
          <h1 className="text-4xl font-black text-white">{title}</h1>
          <p className="mt-2 text-white/90 font-medium">
            EMEA RMA analysis for returns, replacement sent, rush sent out,
            received stock, B-stock, D-stock, receive-only, pending and drive cases.
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
          <ChartCard title="RMA Flow Comparison" data={analytics.flowComparison || []} defaultType="bar" defaultColor={themeColor} />

          <div className="xl:col-span-2">
            <ChartCard title="All Product RMA Returns" data={analytics.productReturns || []} defaultType="bar" defaultColor={themeColor} horizontal limit={80} />
          </div>

          <ChartCard title="Replacement / RMA Units by Product" data={analytics.replacementUnits || []} defaultType="bar" defaultColor={themeColor} horizontal limit={50} />
          <ChartCard title="Rush Sent Out by Product" data={analytics.rushByProduct || []} defaultType="bar" defaultColor={themeColor} horizontal limit={50} />
          <ChartCard title="Stock Units Received by Product" data={analytics.receivedByProduct || []} defaultType="bar" defaultColor={themeColor} horizontal limit={50} />
          <ChartCard title="Receive Only by Product" data={analytics.receiveOnlyByProduct || []} defaultType="bar" defaultColor={themeColor} horizontal limit={50} />
          <ChartCard title="B-Stock by Product" data={analytics.bStockByProduct || []} defaultType="bar" defaultColor={themeColor} horizontal limit={50} />
          <ChartCard title="D-Stock by Product" data={analytics.dStockByProduct || []} defaultType="bar" defaultColor={themeColor} horizontal limit={50} />
          <ChartCard title="Pending Ship / Receive" data={analytics.pendingComparison || []} defaultType="bar" defaultColor={themeColor} />
          <ChartCard title="Drive RMA Cases by Product" data={analytics.driveCases || []} defaultType="bar" defaultColor={themeColor} horizontal limit={50} />
        </div>

        <div className="dashboard-card p-5">
          <h3 className="font-black text-lg mb-4">RMA EMEA Summary Tables</h3>

          <div className="grid xl:grid-cols-3 gap-5">
            <MiniTable title="All Product RMA Returns" data={analytics.productReturns || []} />
            <MiniTable title="Replacement / RMA Units" data={analytics.replacementUnits || []} />
            <MiniTable title="Rush Sent Out" data={analytics.rushByProduct || []} />
            <MiniTable title="Stock Units Received" data={analytics.receivedByProduct || []} />
            <MiniTable title="Receive Only" data={analytics.receiveOnlyByProduct || []} />
            <MiniTable title="B-Stock" data={analytics.bStockByProduct || []} />
            <MiniTable title="D-Stock" data={analytics.dStockByProduct || []} />
            <MiniTable title="Drive RMA Cases" data={analytics.driveCases || []} />
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
              <th>Product</th>
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