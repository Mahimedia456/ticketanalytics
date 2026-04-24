import ChartCard from "./ChartCard";

export default function ComparisonDashboard({
  title = "Satisfaction Comparison",
  analytics = {},
}) {
  const hasData = analytics.good?.rows?.length || analytics.bad?.rows?.length;

  if (!hasData) {
    return (
      <div className="dashboard-card p-10 text-center">
        <h2 className="text-2xl font-black mb-2">Upload Good and Bad Satisfaction first</h2>
        <p className="text-slate-500">
          Upload Good Satisfaction Excel on Good page and Bad Satisfaction Excel on Bad page.
          Then open Comparison.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-10">
      <div className="rounded-3xl p-10 text-center shadow-sm bg-slate-900">
        <h1 className="text-4xl font-black text-white">{title}</h1>
        <p className="mt-2 text-slate-300 font-medium">
          Comparison generated from uploaded Good Satisfaction and Bad Satisfaction Excel files.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {(analytics.kpis || []).map((kpi) => (
          <div key={kpi.title} className="dashboard-card p-6">
            <p className="text-slate-500 text-sm font-semibold">{kpi.title}</p>
            <h3 className="text-4xl font-black mt-2">{kpi.value}</h3>
          </div>
        ))}
      </div>

      <ChartCard
        title="Good vs Bad Satisfaction"
        data={analytics.comparison || []}
        defaultType="bar"
        defaultColor="#4fd1a5"
        horizontal
        limit={20}
      />

      <div className="grid xl:grid-cols-2 gap-5">
        <ChartCard
          title="Good Satisfaction Keywords"
          data={analytics.good?.topWords || []}
          defaultType="bar"
          defaultColor="#4fd1a5"
          horizontal
          limit={30}
        />

        <ChartCard
          title="Bad Satisfaction Keywords"
          data={analytics.bad?.topWords || []}
          defaultType="bar"
          defaultColor="#fb7185"
          horizontal
          limit={30}
        />
      </div>
    </div>
  );
}