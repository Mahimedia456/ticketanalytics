import { Upload } from "lucide-react";
import { parseExcelFile } from "../utils/excel";

export default function FileUpload({ onData }) {
  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const rows = await parseExcelFile(file);
    onData(rows);
  }

  return (
    <div className="dashboard-card p-8 text-center">
      <Upload className="mx-auto mb-4" size={40} />
      <h2 className="text-2xl font-bold mb-2">Upload Excel or CSV</h2>
      <p className="text-slate-500 mb-5">
        Upload Zendesk, sales, support, or ticketing data.
      </p>

      <label className="btn bg-slate-900 text-white cursor-pointer inline-block">
        Choose File
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFile}
          className="hidden"
        />
      </label>
    </div>
  );
}