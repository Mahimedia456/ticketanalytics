import { useEffect, useState } from "react";
import {
  AlertCircle,
  BrainCircuit,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";

import { analyzeSatisfactionResponse } from "../services/aiSatisfactionApi";

function getTeamBadgeClass(team) {
  if (team === "Support Team") return "border-sky-400/40 bg-sky-400/10 text-sky-200";
  if (team === "RMA Team") return "border-orange-400/40 bg-orange-400/10 text-orange-200";
  if (team === "Product / Hardware Team") return "border-amber-400/40 bg-amber-400/10 text-amber-200";
  if (team === "Firmware / Software Team") return "border-violet-400/40 bg-violet-400/10 text-violet-200";
  if (team === "Customer Feedback") return "border-[#00dcc5]/40 bg-[#00dcc5]/10 text-[#00dcc5]";
  return "border-zinc-700 bg-zinc-900 text-zinc-300";
}

function getSentimentClass(sentiment) {
  if (sentiment === "Positive") return "border-emerald-400/40 bg-emerald-400/10 text-emerald-200";
  if (sentiment === "Negative") return "border-red-400/40 bg-red-400/10 text-red-200";
  if (sentiment === "Mixed") return "border-amber-400/40 bg-amber-400/10 text-amber-200";
  return "border-zinc-700 bg-zinc-900 text-zinc-300";
}

export default function SatisfactionAiModal({
  row,
  rating,
  onClose,
}) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const ticketId = row?.ticketId || row?.ticket_id || row?.ticketNumber || "-";
  const comment = row?.comment || row?.comments || "";
  const reason = row?.reasonNotes || row?.reason || row?.ratingReason || "";

  async function runAnalysis() {
    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const result = await analyzeSatisfactionResponse({
        ticketId,
        rating,
        comment,
        reason,
      });

      setAnalysis(result);
    } catch (err) {
      setError(err.message || "Unable to analyze this satisfaction response.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    runAnalysis();
  }, [row]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close AI analysis"
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      <section className="relative z-10 max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-zinc-800 bg-[#080808] shadow-2xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-5 border-b border-zinc-800 bg-[#080808]/95 p-5 backdrop-blur lg:p-7">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#00dcc5] text-black">
              <BrainCircuit size={23} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#00dcc5]">
                AI Satisfaction Analysis
              </p>

              <h2 className="mt-2 break-words text-2xl font-black tracking-[-0.04em] text-white">
                Ticket {ticketId}
              </h2>

              <p className="mt-1 text-sm text-zinc-400">
                Atomos support feedback is analyzed by AI backend.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-800 text-zinc-400 transition hover:border-[#00dcc5]/50 hover:text-[#00dcc5]"
          >
            <X size={18} />
          </button>
        </header>

        <div className="space-y-6 p-5 lg:p-7">
          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-black p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                Rating
              </p>
              <p className="mt-2 font-black text-white">{rating}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                Ticket ID
              </p>
              <p className="mt-2 font-black text-white">{ticketId}</p>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-black p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                Customer Comment
              </p>

              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-zinc-300">
                {comment || "No comment provided."}
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                Reason Notes
              </p>

              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-zinc-300">
                {reason || "No reason notes provided."}
              </p>
            </div>
          </section>

          {loading ? (
            <section className="flex min-h-[240px] items-center justify-center rounded-[24px] border border-[#00dcc5]/30 bg-[#00dcc5]/10 p-8">
              <div className="text-center text-[#00dcc5]">
                <Loader2 size={36} className="mx-auto animate-spin" />
                <p className="mt-4 font-black">
                  Mahimedia System analyzing the response
                </p>
                <p className="mt-2 text-sm text-zinc-300">
                  Evaluating team ownership, sentiment and recommended action.
                </p>
              </div>
            </section>
          ) : null}

          {!loading && error ? (
            <section className="rounded-[24px] border border-red-500/30 bg-red-500/10 p-5 text-red-200">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-black">AI analysis failed</p>
                  <p className="mt-1 text-sm leading-6">{error}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={runAnalysis}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </section>
          ) : null}

          {!loading && analysis ? (
            <section className="space-y-5 rounded-[26px] border border-zinc-800 bg-black p-5 lg:p-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`inline-flex rounded-full border px-3 py-2 text-xs font-black ${getTeamBadgeClass(analysis.team)}`}>
                  {analysis.team}
                </span>

                <span className={`inline-flex rounded-full border px-3 py-2 text-xs font-black ${getSentimentClass(analysis.sentiment)}`}>
                  {analysis.sentiment}
                </span>

                <span className="inline-flex rounded-full border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-black text-zinc-300">
                  Confidence: {Math.round(Number(analysis.confidence || 0) * 100)}%
                </span>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-[#080808] p-5">
                <div className="flex items-center gap-2">
                  <Sparkles size={17} className="text-[#00dcc5]" />
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                    AI Summary
                  </p>
                </div>

                <p className="mt-3 text-base font-bold leading-7 text-white">
                  {analysis.summary}
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-zinc-800 bg-[#080808] p-5">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                    Classification Explanation
                  </p>

                  <p className="mt-3 text-sm leading-7 text-zinc-300">
                    {analysis.explanation}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-[#080808] p-5">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                    Recommended Action
                  </p>

                  <p className="mt-3 text-sm leading-7 text-zinc-300">
                    {analysis.recommendedAction}
                  </p>
                </div>
              </div>

              {analysis.evidence?.length ? (
                <div className="rounded-2xl border border-zinc-800 bg-[#080808] p-5">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                    Evidence Used
                  </p>

                  <div className="mt-3 space-y-2">
                    {analysis.evidence.map((item, index) => (
                      <div
                        key={`${item}-${index}`}
                        className="flex items-start gap-2 text-sm leading-6 text-zinc-300"
                      >
                        <CheckCircle2
                          size={16}
                          className="mt-1 shrink-0 text-[#00dcc5]"
                        />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          ) : null}
        </div>
      </section>
    </div>
  );
}