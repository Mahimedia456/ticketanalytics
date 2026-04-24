const themes = [
  { name: "Mint", color: "#4fd1a5" },
  { name: "Ocean", color: "#38bdf8" },
  { name: "Purple", color: "#818cf8" },
  { name: "Amber", color: "#f59e0b" },
  { name: "Rose", color: "#fb7185" },
  { name: "Dark", color: "#0f172a" },
];

export default function RmaThemePanel({ color, setColor }) {
  return (
    <div className="dashboard-card p-4 flex flex-wrap gap-5 items-center justify-between">
      <div>
        <h2 className="font-black text-slate-900">RMA EMEA Design Controls</h2>
        <p className="text-xs text-slate-500">
          RMA EMEA columns are detected automatically from the uploaded sheet.
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
  );
}