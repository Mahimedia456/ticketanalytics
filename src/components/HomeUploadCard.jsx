import { UploadCloud } from "lucide-react";
import { parseExcelFile } from "../utils/excel";

export default function HomeUploadCard({
  eyebrow,
  title,
  description,
  buttonLabel = "Upload File",
  disabled = false,
  onUpload,
}) {
  async function handleFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const rows = await parseExcelFile(file);
    onUpload?.({ file, rows });
    event.target.value = "";
  }

  return (
    <article className="dashboard-card flex h-full flex-col p-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00dcc5]/10 text-[#00dcc5]">
        <UploadCloud size={22} />
      </div>

      <p className="mt-5 text-[11px] font-black uppercase tracking-[0.18em] text-[#00dcc5]">
        {eyebrow}
      </p>

      <h3 className="mt-2 text-xl font-black text-white">{title}</h3>

      <p className="mt-3 flex-1 text-sm leading-6 text-zinc-500">
        {description}
      </p>

      <label
        className={`mt-5 inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full px-5 py-3 text-sm font-black transition ${
          disabled
            ? "cursor-not-allowed bg-zinc-800 text-zinc-500"
            : "bg-[#00dcc5] text-black hover:shadow-[0_0_25px_rgba(0,220,197,0.25)]"
        }`}
      >
        {buttonLabel}
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFile}
          disabled={disabled}
          className="hidden"
        />
      </label>
    </article>
  );
}