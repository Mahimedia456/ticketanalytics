import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ChartCard from "./ChartCard";
import { exportDashboardExcel } from "../utils/exportExcel";

const DARK = "#0f172a";

export default function Dashboard({
  title = "Ticket Analysis",
  rows = [],
  analytics = {},
  color = DARK,
}) {
  const themeColor = color || DARK;

  async function exportPDF() {
    const element = document.getElementById("ticket-dashboard-export");
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

      <div id="ticket-dashboard-export" className="space-y-5 pb-10">
        <div
          className="rounded-3xl p-10 text-center shadow-sm"
          style={{ backgroundColor: themeColor }}
        >
          <h1 className="text-4xl font-black text-white">{title}</h1>
          <p className="mt-2 text-white/90 font-medium">
            Ticket analysis by region, product, category, and monthly volume.
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
          <ChartCard title="Tickets by Month" data={analytics.monthly || []} defaultType="bar" defaultColor={themeColor} />
          <ChartCard title="Tickets by Region" data={analytics.region || []} defaultType="pie" defaultColor={themeColor} />
          <ChartCard title="Tickets by Category" data={analytics.category || []} defaultType="bar" defaultColor={themeColor} horizontal limit={80} />
          <ChartCard title="Top 20 Products" data={analytics.product || []} defaultType="bar" defaultColor={themeColor} horizontal limit={20} />

          <div className="xl:col-span-2">
            <ChartCard
              title="All Products"
              subtitle="Complete product list from uploaded ticket sheet"
              data={analytics.productAll || []}
              defaultType="bar"
              defaultColor={themeColor}
              horizontal
              limit={500}
            />
          </div>
        </div>

        <div className="dashboard-card p-5">
          <h3 className="font-black text-lg mb-4">Ticket Summary Tables</h3>

          <div className="grid xl:grid-cols-3 gap-5">
            <MiniTable title="Regions" data={analytics.region || []} />
            <MiniTable title="Categories" data={analytics.category || []} />
            <MiniTable title="All Products" data={analytics.productAll || []} />
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
              <th>Name</th>
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