export default function KpiCard({ title, value, hint }) {
  return (
    <div className="dashboard-card p-5">
      <p className="text-sm font-bold text-zinc-500">{title}</p>
      <h3 className="mt-2 text-3xl font-black text-white">{value}</h3>
      {hint ? <p className="mt-2 text-xs text-zinc-500">{hint}</p> : null}
      <div className="mt-4 h-1.5 w-14 rounded-full bg-[#00dcc5]" />
    </div>
  );
}