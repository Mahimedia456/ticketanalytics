const themes = [
  { name: "Dark", color: "#0f172a" },
  { name: "Mint", color: "#4fd1a5" },
  { name: "Ocean", color: "#38bdf8" },
  { name: "Purple", color: "#818cf8" },
  { name: "Amber", color: "#f59e0b" },
  { name: "Rose", color: "#fb7185" },
];

export default function ThemePanel({
  color,
  setColor,
  analytics,
  mapping,
  setMapping,
}) {
  const columns = analytics.availableColumns || [];

  function SelectMap({ label, value, field }) {
    return (
      <div>
        <label className="text-xs font-bold block mb-1">{label}</label>
        <select
          value={value || ""}
          onChange={(e) =>
            setMapping((prev) => ({ ...prev, [field]: e.target.value }))
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
    <div className="dashboard-card p-4 space-y-4">
      <div className="flex flex-wrap gap-5 items-center justify-between">
        <div>
          <h2 className="font-black text-slate-900">Design & Column Controls</h2>
          <p className="text-xs text-slate-500">
            Select correct columns if any chart is empty.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {themes.map((theme) => (
            <button
              key={theme.name}
              onClick={() => setColor(theme.color)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border ${
                color === theme.color ? "border-slate-900" : "border-slate-200"
              }`}
            >
              <span
                className="inline-block w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: theme.color }}
              />
              {theme.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-3">
        <SelectMap label="Date Column" value={mapping.dateCol} field="dateCol" />
        <SelectMap label="Category Column" value={mapping.categoryCol} field="categoryCol" />
        <SelectMap label="Region Column" value={mapping.regionCol} field="regionCol" />
        <SelectMap label="Product / Model Column" value={mapping.productCol} field="productCol" />
      </div>
    </div>
  );
}