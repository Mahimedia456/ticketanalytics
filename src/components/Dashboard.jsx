import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ChartCard from "./ChartCard";
import { exportDashboardExcel } from "../utils/exportExcel";

export default function Dashboard({ title, rows = [], analytics = {}, color = "#4fd1a5" }) {
  async function exportPDF() {
    const element = document.getElementById("dashboard-export");
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#f4f7fb",
      useCORS: true,
    });

    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(img, "PNG", 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(img, "PNG", 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${title || "dashboard"}.pdf`);
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

      <div id="dashboard-export" className="space-y-5 pb-10">
        <div
          className="rounded-3xl p-10 text-center shadow-sm"
          style={{ backgroundColor: color }}
        >
          <h1 className="text-4xl font-black text-slate-900">
            {title || "Analytics Dashboard"}
          </h1>
          <p className="mt-2 text-slate-800 font-medium">
            Live Excel dashboard with daily, weekly, monthly, category, region, product, and status analysis.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {(analytics.kpis || []).map((kpi) => (
            <div key={kpi.title} className="dashboard-card p-6">
              <p className="text-slate-500 text-sm font-semibold">{kpi.title}</p>
              <h3 className="text-4xl font-black mt-2">{kpi.value}</h3>
              <div className="w-14 h-1.5 rounded-full mt-4" style={{ backgroundColor: color }} />
            </div>
          ))}
        </div>

        <div className="grid 2xl:grid-cols-3 gap-5">
          <ChartCard title="Daily Trend" data={analytics.daily || []} defaultType="line" xKey="date" yKey="count" defaultColor={color} />
          <ChartCard title="Weekly Trend" data={analytics.weekly || []} defaultType="bar" xKey="date" yKey="count" defaultColor={color} />
          <ChartCard title="Monthly Trend" data={analytics.monthly || []} defaultType="bar" xKey="date" yKey="count" defaultColor={color} />
        </div>

        <div className="grid 2xl:grid-cols-2 gap-5">
          <ChartCard title="Top Categories" data={analytics.category || []} defaultType="bar" defaultColor={color} />
          <ChartCard title="Tickets by Region" data={analytics.region || []} defaultType="bar" defaultColor={color} />
          <ChartCard title="Top Products / Models" data={analytics.product || []} defaultType="bar" defaultColor={color} />
          <ChartCard title="Status Mix" data={analytics.status || []} defaultType="pie" defaultColor={color} />
        </div>

        <div className="dashboard-card p-5">
          <h3 className="font-black text-lg mb-4">Summary Tables</h3>

          <div className="grid xl:grid-cols-3 gap-5">
            <MiniTable title="Monthly Summary" data={analytics.monthly || []} dateMode />
            <MiniTable title="Weekly Summary" data={analytics.weekly || []} dateMode />
            <MiniTable title="Top Regions" data={analytics.region || []} />
            <MiniTable title="Top Categories" data={analytics.category || []} />
            <MiniTable title="Top Products / Models" data={analytics.product || []} />
            <MiniTable title="Status Summary" data={analytics.status || []} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniTable({ title, data = [], dateMode = false }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
      <div className="bg-slate-50 px-4 py-3 font-black">{title}</div>
      <table className="soft-table">
        <thead>
          <tr>
            <th>#</th>
            <th>{dateMode ? "Period" : "Name"}</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          {data.length ? (
            data.slice(0, 12).map((row, index) => (
              <tr key={`${title}-${index}`}>
                <td>{index + 1}</td>
                <td>{dateMode ? row.date : row.name}</td>
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
  );
}