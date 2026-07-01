export default function DashboardHero({ title, description }) {
  return (
    <div className="rounded-[30px] border border-[#00dcc5]/30 bg-[#00dcc5]/10 p-8 text-center shadow-[0_0_35px_rgba(0,220,197,0.08)] pdf-section">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#00dcc5]">
        Atomos Reporting
      </p>

      <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white md:text-4xl">
        {title}
      </h1>

      {description ? (
        <p className="mx-auto mt-3 max-w-3xl text-sm font-medium leading-6 text-zinc-400">
          {description}
        </p>
      ) : null}
    </div>
  );
}