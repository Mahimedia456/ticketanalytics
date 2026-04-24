import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ChartCard from "./ChartCard";
import { exportDashboardExcel } from "../utils/exportExcel";

const DARK = "#0f172a";

export default function ComparisonDashboard({
  title = "Satisfaction Comparison",
  analytics = {},
  color = DARK,
}) {
  const themeColor = color || DARK;
  const hasData = analytics.good?.rows?.length || analytics.bad?.rows?.length;

  async function exportPDF() {
    const element = document.getElementById("comparison-dashboard-export");
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

  if (!hasData) {
    return (
      <div className="dashboard-card p-10 text-center">
        <h2 className="text-2xl font-black mb-2">
          Upload Good and Bad Satisfaction first
        </h2>
        <p className="text-slate-500">
          First upload Good Satisfaction Excel and Bad Satisfaction Excel.
          Then open Comparison.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-end gap-3 mb-4">
        <button onClick={exportPDF} className="btn bg-slate-900 text-white">
          Export PDF
        </button>

        <button
          onClick={() =>
            exportDashboardExcel({
              rows: [
                ...(analytics.good?.rows || []).map((row) => ({
                  type: "Good Satisfaction",
                  ...row,
                })),
                ...(analytics.bad?.rows || []).map((row) => ({
                  type: "Bad Satisfaction",
                  ...row,
                })),
              ],
              analytics,
              title,
            })
          }
          className="btn bg-emerald-500 text-white"
        >
          Export Excel
        </button>
      </div>

      <div id="comparison-dashboard-export" className="space-y-5 pb-10">
        <div
          className="rounded-3xl p-10 text-center shadow-sm"
          style={{ backgroundColor: themeColor }}
        >
          <h1 className="text-4xl font-black text-white">{title}</h1>
          <p className="mt-2 text-white/90 font-medium">
            Comparison generated from uploaded Good Satisfaction and Bad Satisfaction Excel files.
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
          <ChartCard title="Good vs Bad Satisfaction" data={analytics.comparison || []} defaultType="pie" defaultColor={themeColor} />
          <ChartCard title="Good vs Bad Percentage" data={analytics.percentage || []} defaultType="bar" defaultColor={themeColor} />
        </div>

        <ChartCard title="Comment Comparison" data={analytics.commentsComparison || []} defaultType="bar" defaultColor={themeColor} horizontal limit={10} />
      </div>
    </div>
  );
}