import { Upload } from "lucide-react";
import { parseExcelFile } from "../utils/excel";

export default function FileUpload({ onData }) {
  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const rows = await parseExcelFile(file);
    onData?.(rows, file);
  }

  return (
    <div className="dashboard-card border-dashed border-[#00dcc5]/40 p-8 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#00dcc5]/10 text-[#00dcc5]">
        <Upload size={28} />
      </div>

      <h2 className="text-2xl font-black text-white">Upload Excel or CSV</h2>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-500">
        Upload Zendesk ticket, RMA, good satisfaction, or bad satisfaction sheet.
      </p>

      <label className="btn btn-primary mt-5 inline-flex cursor-pointer items-center justify-center">
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