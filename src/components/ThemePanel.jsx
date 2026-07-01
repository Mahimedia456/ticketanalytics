const themes = [
  { name: "Atomos Cyan", color: "#00dcc5" },
  { name: "Ocean", color: "#38bdf8" },
  { name: "Teal", color: "#14b8a6" },
  { name: "Sky", color: "#0ea5e9" },
  { name: "Mint", color: "#5eead4" },
];

export default function ThemePanel({ color = "#00dcc5", setColor, analytics, mapping, setMapping }) {
  const columns = analytics?.availableColumns || [];

  function SelectMap({ label, value, field }) {
    return (
      <div>
        <label className="mb-1 block text-xs font-bold text-zinc-400">{label}</label>
        <select
          value={value || ""}
          onChange={(e) =>
            setMapping?.((prev) => ({ ...prev, [field]: e.target.value }))
          }
          className="input min-w-44"
        >
          <option value="">Select column</option>
          {columns.map((col) => (
            <option key={col} value={col}>
              {col}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="dashboard-card space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#00dcc5]">
            Design Controls
          </p>
          <h2 className="mt-1 text-xl font-black text-white">Theme & Columns</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Change chart color and map columns when chart data is empty.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {themes.map((theme) => (
            <button
              key={theme.name}
              onClick={() => setColor?.(theme.color)}
              className={`rounded-full border px-3 py-2 text-xs font-bold transition ${
                color === theme.color
                  ? "border-[#00dcc5] bg-[#00dcc5] text-black"
                  : "border-zinc-800 bg-black text-zinc-400 hover:border-[#00dcc5]/60"
              }`}
            >
              <span
                className="mr-2 inline-block h-3 w-3 rounded-full align-middle"
                style={{ backgroundColor: theme.color }}
              />
              {theme.name}
            </button>
          ))}
        </div>
      </div>

      {columns.length ? (
        <div className="grid gap-3 md:grid-cols-4">
          <SelectMap label="Date Column" value={mapping?.dateCol} field="dateCol" />
          <SelectMap label="Category Column" value={mapping?.categoryCol} field="categoryCol" />
          <SelectMap label="Region Column" value={mapping?.regionCol} field="regionCol" />
          <SelectMap label="Product Column" value={mapping?.productCol} field="productCol" />
        </div>
      ) : null}
    </div>
  );
}