export default function ModuleHeader({ title, description, actions }) {
  return (
    <div className="dashboard-card flex flex-wrap items-center justify-between gap-4 p-5">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#00dcc5]">
          Atomos Analytics
        </p>

        <h2 className="mt-2 text-2xl font-black text-white">{title}</h2>

        {description ? (
          <p className="mt-1 text-sm leading-6 text-zinc-500">{description}</p>
        ) : null}
      </div>

      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}