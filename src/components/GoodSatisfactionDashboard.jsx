import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ChartCard from "./ChartCard";
import { exportDashboardExcel } from "../utils/exportExcel";

const DARK = "#0f172a";

export default function GoodSatisfactionDashboard({
  title = "Good Satisfaction",
  rows = [],
  analytics = {},
  color = DARK,
}) {
  const themeColor = color || DARK;

  async function exportPDF() {
    const element = document.getElementById("good-satisfaction-export");
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

    pdf.save(`${title}.pdf`);
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

      <div id="good-satisfaction-export" className="space-y-5 pb-10">
        <div
          className="rounded-3xl p-10 text-center shadow-sm"
          style={{ backgroundColor: themeColor }}
        >
          <h1 className="text-4xl font-black text-white">{title}</h1>
          <p className="mt-2 text-white/90 font-medium">
            Good satisfaction tickets with comment and without comment analysis.
          </p>
        </div>

        <Kpis analytics={analytics} color={themeColor} />

        <div className="grid xl:grid-cols-2 gap-5">
          <ChartCard title="Good Comment Status" data={analytics.commentStatus || []} defaultType="pie" defaultColor={themeColor} />
          <ChartCard title="Good Comment Percentage" data={analytics.percentage || []} defaultType="bar" defaultColor={themeColor} />
        </div>

        <TicketTable title="Good Satisfaction Ticket Table" rows={analytics.rows || []} />
      </div>
    </div>
  );
}

function Kpis({ analytics, color }) {
  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {(analytics.kpis || []).map((kpi) => (
        <div key={kpi.title} className="dashboard-card p-6">
          <p className="text-slate-500 text-sm font-semibold">{kpi.title}</p>
          <h3 className="text-4xl font-black mt-2">{kpi.value}</h3>
          <div className="w-14 h-1.5 rounded-full mt-4" style={{ backgroundColor: color }} />
        </div>
      ))}
    </div>
  );
}

function TicketTable({ title, rows = [] }) {
  return (
    <div className="dashboard-card p-5">
      <h3 className="font-black text-lg mb-4">{title}</h3>

      <div className="overflow-auto max-h-[720px] rounded-xl border border-slate-100">
        <table className="soft-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Ticket ID</th>
              <th>Status</th>
              <th>Comment</th>
            </tr>
          </thead>

          <tbody>
            {rows.length ? (
              rows.map((row, index) => (
                <tr key={`${row.ticketId}-${index}`}>
                  <td>{index + 1}</td>
                  <td className="font-bold">{row.ticketId}</td>
                  <td>{row.withComment ? "With Comment" : "Without Comment"}</td>
                  <td>{row.comment || "No comment"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-slate-400 py-6">
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