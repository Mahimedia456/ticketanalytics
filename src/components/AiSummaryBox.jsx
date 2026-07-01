export default function AiSummaryBox({ summary }) {
  return (
    <div className="dashboard-card border-[#00dcc5]/30 bg-[#00dcc5]/10 p-5">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#00dcc5]">
        AI Summary
      </p>
      <p className="mt-3 text-sm leading-6 text-zinc-200">
        {summary || "AI summary will appear here after backend integration."}
      </p>
    </div>
  );
}