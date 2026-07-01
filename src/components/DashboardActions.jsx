import { Download, FileText } from "lucide-react";

export default function DashboardActions({ onExportPDF, onExportExcel }) {
  return (
    <div className="mb-4 flex flex-wrap justify-end gap-3">
      <button
        onClick={onExportPDF}
        className="btn border border-zinc-800 bg-zinc-950 text-white hover:border-[#00dcc5]/60 hover:text-[#00dcc5]"
      >
        <FileText size={16} />
        Export PDF
      </button>

      <button onClick={onExportExcel} className="btn btn-primary text-black">
        <Download size={16} />
        Export Excel
      </button>
    </div>
  );
}