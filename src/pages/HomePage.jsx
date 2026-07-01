import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Database,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  ShieldCheck,
  SmilePlus,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Link } from "react-router-dom";

import HomeUploadCard from "../components/HomeUploadCard";
import { fetchHomeOverview } from "../services/homeApi";
import { importMonthlyDataset } from "../services/importsApi";
import { isAdmin } from "../utils/auth";

const STORAGE_KEY = "atomos_home_uploads";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const featureCards = [
  {
    title: "Ticket Analytics",
    description: "Analyze support volume, products, regions and categories.",
    icon: FileSpreadsheet,
    link: "/ticket-dashboard",
  },
  {
    title: "RMA Reporting",
    description: "Review EMEA and US RMA flow, returns, pending and drive cases.",
    icon: Database,
    link: "/rma-emea-dashboard",
  },
  {
    title: "Customer Satisfaction",
    description: "Compare good and bad satisfaction tickets with comments.",
    icon: SmilePlus,
    link: "/comparison",
  },
  {
    title: "Reports",
    description: "Generate month-based operational reports and exports.",
    icon: BarChart3,
    link: "/reports",
  },
];

const moduleMap = {
  tickets: "ticket-dashboard",
  rmaEmea: "rma-emea",
  rmaUs: "rma-us",
  good: "good-satisfaction",
  bad: "bad-satisfaction",
};

function getSavedUploads() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveUploads(next) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function CompactStat({ label, value, description }) {
  return (
    <article className="rounded-[22px] border border-zinc-800 bg-[#080808] p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
        {label}
      </p>
      <p className="mt-3 text-3xl font-black text-white">
        {Number(value || 0).toLocaleString()}
      </p>
      <p className="mt-2 text-xs leading-5 text-zinc-500">{description}</p>
    </article>
  );
}

export default function HomePage() {
  const uploadAllowed = isAdmin();
  const currentYear = new Date().getFullYear();
  const saved = getSavedUploads();

  const [selectedYear, setSelectedYear] = useState(
    saved.year || String(currentYear)
  );

  const [selectedMonth, setSelectedMonth] = useState(
    saved.month || String(new Date().getMonth() + 1).padStart(2, "0")
  );

  const [ticketRows, setTicketRows] = useState(saved.tickets || []);
  const [rmaEmeaRows, setRmaEmeaRows] = useState(saved.rmaEmea || []);
  const [rmaUsRows, setRmaUsRows] = useState(saved.rmaUs || []);
  const [goodRows, setGoodRows] = useState(saved.good || []);
  const [badRows, setBadRows] = useState(saved.bad || []);

  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [uploadingKey, setUploadingKey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedPeriodKey = `${selectedYear}-${selectedMonth}`;

  const selectedPeriodName = useMemo(() => {
    const monthName = months[Number(selectedMonth) - 1] || "Month";
    return `${monthName} ${selectedYear}`;
  }, [selectedMonth, selectedYear]);

  const totalRows =
    ticketRows.length +
    rmaEmeaRows.length +
    rmaUsRows.length +
    goodRows.length +
    badRows.length;

  const dbSummary = overview?.summary || {};

  const years = useMemo(() => {
    const start = currentYear - 2;
    const end = currentYear + 2;
    return Array.from({ length: end - start + 1 }, (_, index) =>
      String(start + index)
    );
  }, [currentYear]);

  function persistLocal(next = {}) {
    const payload = {
      year: selectedYear,
      month: selectedMonth,
      period: selectedPeriodKey,
      tickets: ticketRows,
      rmaEmea: rmaEmeaRows,
      rmaUs: rmaUsRows,
      good: goodRows,
      bad: badRows,
      ...next,
    };

    saveUploads(payload);
  }

  async function loadOverview() {
    setLoadingOverview(true);
    setError("");

    try {
      const data = await fetchHomeOverview(selectedPeriodKey);
      setOverview(data);
    } catch (err) {
      setError(err.message || "Unable to load home overview.");
    } finally {
      setLoadingOverview(false);
    }
  }

  useEffect(() => {
    persistLocal({
      year: selectedYear,
      month: selectedMonth,
      period: selectedPeriodKey,
    });

    loadOverview();
  }, [selectedYear, selectedMonth]);

  async function handleUpload(localKey, rows, file) {
    if (!uploadAllowed) return;

    setUploadingKey(localKey);
    setMessage("");
    setError("");

    const nextLocal = {
      year: selectedYear,
      month: selectedMonth,
      period: selectedPeriodKey,
      tickets: ticketRows,
      rmaEmea: rmaEmeaRows,
      rmaUs: rmaUsRows,
      good: goodRows,
      bad: badRows,
      [localKey]: rows,
    };

    if (localKey === "tickets") setTicketRows(rows);
    if (localKey === "rmaEmea") setRmaEmeaRows(rows);
    if (localKey === "rmaUs") setRmaUsRows(rows);
    if (localKey === "good") setGoodRows(rows);
    if (localKey === "bad") setBadRows(rows);

    saveUploads(nextLocal);

    try {
      const result = await importMonthlyDataset({
        moduleKey: moduleMap[localKey],
        reportMonth: selectedPeriodKey,
        file,
        rows,
      });

      setMessage(
        `${result?.summary?.insertedRows || rows.length} rows saved to ${selectedPeriodName}.`
      );

      await loadOverview();
    } catch (err) {
      setError(err.message || "Unable to upload data to backend.");
    } finally {
      setUploadingKey("");
    }
  }

  function clearPreview() {
    if (!uploadAllowed) return;

    const next = {
      year: selectedYear,
      month: selectedMonth,
      period: selectedPeriodKey,
      tickets: [],
      rmaEmea: [],
      rmaUs: [],
      good: [],
      bad: [],
    };

    setTicketRows([]);
    setRmaEmeaRows([]);
    setRmaUsRows([]);
    setGoodRows([]);
    setBadRows([]);
    saveUploads(next);
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[34px] border border-zinc-800 bg-[#070707] shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
        <div className="pointer-events-none absolute inset-0 atomos-grid-bg opacity-25" />
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[#00dcc5]/20 blur-3xl" />

        <div className="relative px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0 flex-1">
              <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-zinc-800 bg-black/80 px-3 py-2">
                <ShieldCheck size={15} className="shrink-0 text-[#00dcc5]" />
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                  Atomos Analytics Workspace
                </span>
              </div>

              <h1 className="mt-5 max-w-[900px] text-[clamp(2.4rem,4.2vw,4.6rem)] font-extrabold leading-[0.98] tracking-[-0.05em] text-white">
                Year and month based operational reporting.
              </h1>

              <p className="mt-5 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base sm:leading-7">
                Select reporting year and month. Dashboards and reports load
                month-wise data from backend. Upload is available for admin
                accounts only.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  to="/ticket-dashboard"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#00dcc5] px-5 py-3 text-sm font-black text-black"
                >
                  Open Dashboard
                  <ArrowRight size={17} />
                </Link>

                <Link
                  to="/reports"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-zinc-800 bg-black px-5 py-3 text-sm font-black text-zinc-300 hover:border-[#00dcc5]/70 hover:text-[#00dcc5]"
                >
                  View Reports
                </Link>

                {uploadAllowed ? (
                  <>
                    <a
                      href="#data-import"
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-zinc-800 bg-black px-5 py-3 text-sm font-black text-zinc-300 hover:border-[#00dcc5]/70 hover:text-[#00dcc5]"
                    >
                      <UploadCloud size={17} />
                      Upload Data
                    </a>

                    <button
                      type="button"
                      onClick={clearPreview}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-black text-red-200 hover:bg-red-500/15"
                    >
                      <Trash2 size={17} />
                      Clear Preview
                    </button>
                  </>
                ) : null}
              </div>
            </div>

            <div className="w-full rounded-[26px] border border-zinc-800 bg-black/80 p-5 xl:max-w-[400px]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#00dcc5]">
                    Reporting Period
                  </p>

                  <h2 className="mt-2 text-xl font-extrabold text-white">
                    {selectedPeriodName}
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Data is loaded against {selectedPeriodKey}.
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#00dcc5] text-black">
                  <CalendarDays size={19} />
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold text-zinc-400">
                    Year
                  </label>
                  <select
                    className="input"
                    value={selectedYear}
                    onChange={(event) => setSelectedYear(event.target.value)}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-zinc-400">
                    Month
                  </label>
                  <select
                    className="input"
                    value={selectedMonth}
                    onChange={(event) => setSelectedMonth(event.target.value)}
                  >
                    {months.map((month, index) => {
                      const value = String(index + 1).padStart(2, "0");
                      return (
                        <option key={month} value={value}>
                          {month}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={loadOverview}
                disabled={loadingOverview}
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#00dcc5] px-5 py-3 text-sm font-black text-black disabled:opacity-60"
              >
                {loadingOverview ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <RefreshCw size={17} />
                )}
                Refresh Period
              </button>
            </div>
          </div>

          {!uploadAllowed ? (
            <div className="mt-6 rounded-2xl border border-zinc-800 bg-black/70 p-4 text-sm leading-6 text-zinc-400">
              Your account has read-only access. You can view dashboards and
              reports, but uploading or replacing files is disabled.
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-black">Operation failed</p>
                <p className="mt-1 text-sm leading-6">{error}</p>
              </div>
            </div>
          ) : null}

          {message ? (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#00dcc5]/30 bg-[#00dcc5]/10 p-4 text-[#00dcc5]">
              <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-black">Operation completed</p>
                <p className="mt-1 text-sm leading-6">{message}</p>
              </div>
            </div>
          ) : null}

          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <CompactStat
              label="Tickets"
              value={dbSummary.tickets || ticketRows.length}
              description={selectedPeriodName}
            />
            <CompactStat
              label="RMA Rows"
              value={
                (dbSummary.rmaEmea || rmaEmeaRows.length) +
                (dbSummary.rmaUs || rmaUsRows.length)
              }
              description={selectedPeriodName}
            />
            <CompactStat
              label="Satisfaction"
              value={
                (dbSummary.good || goodRows.length) +
                (dbSummary.bad || badRows.length)
              }
              description={selectedPeriodName}
            />
            <CompactStat
              label="Total Rows"
              value={dbSummary.totalRows || totalRows}
              description="Database / preview rows"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {featureCards.map((feature) => {
          const Icon = feature.icon;

          return (
            <Link
              key={feature.title}
              to={feature.link}
              className="dashboard-card flex min-w-0 flex-col p-5 transition duration-200 hover:-translate-y-1 hover:border-[#00dcc5]/60"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#00dcc5] text-black">
                <Icon size={22} />
              </div>

              <h2 className="mt-5 text-xl font-extrabold tracking-[-0.035em] text-white">
                {feature.title}
              </h2>

              <p className="mt-3 text-sm leading-6 text-zinc-500">
                {feature.description}
              </p>
            </Link>
          );
        })}
      </section>

      {uploadAllowed ? (
        <section id="data-import" className="scroll-mt-28 space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#00dcc5]">
                Monthly Data Import
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-white">
                Upload files for {selectedPeriodName}.
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">
                Files upload to Supabase Storage bucket csv and rows save into
                database against {selectedPeriodKey}.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-black px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-500">
                Importing Into
              </p>
              <p className="mt-1 font-extrabold text-white">
                {selectedPeriodName}
              </p>
            </div>
          </div>

          <div className="grid items-stretch gap-5 xl:grid-cols-3">
            <HomeUploadCard
              eyebrow="Ticket Data"
              title="Upload Ticket Dashboard File"
              description={`Save ticket analytics data to ${selectedPeriodName}.`}
              buttonLabel={
                uploadingKey === "tickets" ? "Uploading..." : "Upload Ticket File"
              }
              disabled={Boolean(uploadingKey)}
              onUpload={({ rows, file }) => handleUpload("tickets", rows, file)}
            />

            <HomeUploadCard
              eyebrow="RMA EMEA"
              title="Upload RMA EMEA File"
              description={`Save EMEA RMA data to ${selectedPeriodName}.`}
              buttonLabel={
                uploadingKey === "rmaEmea" ? "Uploading..." : "Upload RMA EMEA"
              }
              disabled={Boolean(uploadingKey)}
              onUpload={({ rows, file }) => handleUpload("rmaEmea", rows, file)}
            />

            <HomeUploadCard
              eyebrow="RMA US"
              title="Upload RMA US File"
              description={`Save US RMA data to ${selectedPeriodName}.`}
              buttonLabel={
                uploadingKey === "rmaUs" ? "Uploading..." : "Upload RMA US"
              }
              disabled={Boolean(uploadingKey)}
              onUpload={({ rows, file }) => handleUpload("rmaUs", rows, file)}
            />

            <HomeUploadCard
              eyebrow="Good Satisfaction"
              title="Upload Good Satisfaction File"
              description={`Save good satisfaction data to ${selectedPeriodName}.`}
              buttonLabel={
                uploadingKey === "good" ? "Uploading..." : "Upload Good File"
              }
              disabled={Boolean(uploadingKey)}
              onUpload={({ rows, file }) => handleUpload("good", rows, file)}
            />

            <HomeUploadCard
              eyebrow="Bad Satisfaction"
              title="Upload Bad Satisfaction File"
              description={`Save bad satisfaction data to ${selectedPeriodName}.`}
              buttonLabel={
                uploadingKey === "bad" ? "Uploading..." : "Upload Bad File"
              }
              disabled={Boolean(uploadingKey)}
              onUpload={({ rows, file }) => handleUpload("bad", rows, file)}
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}