import { useEffect, useMemo, useState } from "react";
import FileUpload from "../components/FileUpload";
import SheetEditor from "../components/SheetEditor";
import ThemePanel from "../components/ThemePanel";
import RmaThemePanel from "../components/RmaThemePanel";
import Dashboard from "../components/Dashboard";
import RmaEmeaDashboard from "../components/RmaEmeaDashboard";
import RmaUsDashboard from "../components/RmaUsDashboard";
import GoodSatisfactionDashboard from "../components/GoodSatisfactionDashboard";
import BadSatisfactionDashboard from "../components/BadSatisfactionDashboard";
import ComparisonDashboard from "../components/ComparisonDashboard";
import {
  autoDetectTicketColumns,
  buildTicketAnalytics,
} from "../utils/ticketAnalytics";
import { buildRmaEmeaAnalytics } from "../utils/rmaEmeaAnalytics";
import { buildRmaUsAnalytics } from "../utils/rmaUsAnalytics";
import { buildGoodAnalytics } from "../utils/goodAnalytics";
import { buildBadAnalytics } from "../utils/badAnalytics";
import { buildComparisonAnalytics } from "../utils/comparisonAnalytics";

export default function DashboardPage({
  pageTitle,
  storageKey,
  pageType = "ticket",
}) {
  const [rows, setRows] = useState([]);
  const [view, setView] = useState("dashboard");
  const [color, setColor] = useState("#4fd1a5");
  const [mapping, setMapping] = useState({});

  const isRmaEmeaPage = pageType === "rma-emea";
  const isRmaUsPage = pageType === "rma-us";
  const isRmaPage = isRmaEmeaPage || isRmaUsPage;
  const isGoodPage = pageType === "good-satisfaction";
  const isBadPage = pageType === "bad-satisfaction";
  const isComparisonPage = pageType === "comparison";
  const isSatisfactionPage = isGoodPage || isBadPage;

  useEffect(() => {
    const saved = localStorage.getItem(`dashboard:${storageKey}`);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRows(parsed.rows || []);
        setMapping(parsed.mapping || {});
        setColor(parsed.color || "#4fd1a5");
      } catch {
        localStorage.removeItem(`dashboard:${storageKey}`);
      }
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(
      `dashboard:${storageKey}`,
      JSON.stringify({ rows, mapping, color })
    );
  }, [rows, mapping, color, storageKey]);

  function handleData(data) {
    setRows(data);
    setMapping(isRmaPage || isSatisfactionPage ? {} : autoDetectTicketColumns(data));
    setView("dashboard");
  }

  function clearPage() {
    setRows([]);
    setMapping({});
    setView("dashboard");
    localStorage.removeItem(`dashboard:${storageKey}`);
  }

  const ticketAnalytics = useMemo(
    () => buildTicketAnalytics(rows, mapping),
    [rows, mapping]
  );

  const rmaEmeaAnalytics = useMemo(() => buildRmaEmeaAnalytics(rows), [rows]);
  const rmaUsAnalytics = useMemo(() => buildRmaUsAnalytics(rows), [rows]);
  const goodAnalytics = useMemo(() => buildGoodAnalytics(rows), [rows]);
  const badAnalytics = useMemo(() => buildBadAnalytics(rows), [rows]);

  const comparisonAnalytics = useMemo(() => {
    const goodSaved = localStorage.getItem("dashboard:/good-satisfaction");
    const badSaved = localStorage.getItem("dashboard:/bad-satisfaction");

    let goodRows = [];
    let badRows = [];

    try {
      goodRows = goodSaved ? JSON.parse(goodSaved).rows || [] : [];
    } catch {
      goodRows = [];
    }

    try {
      badRows = badSaved ? JSON.parse(badSaved).rows || [] : [];
    } catch {
      badRows = [];
    }

    return buildComparisonAnalytics(goodRows, badRows);
  }, [rows, storageKey]);

  const showUpload = !rows.length && !isComparisonPage;

  return (
    <div className="space-y-6">
      <div className="dashboard-card p-5 flex flex-wrap justify-between gap-4 items-center">
        <div>
          <h2 className="text-2xl font-black">{pageTitle}</h2>
          <p className="text-sm text-slate-500">
            Upload separate sheet for this page.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setView("dashboard")}
            className={`btn ${
              view === "dashboard" ? "bg-slate-900 text-white" : "bg-slate-100"
            }`}
          >
            Dashboard
          </button>

          {!isComparisonPage && (
            <button
              onClick={() => setView("sheet")}
              className={`btn ${
                view === "sheet" ? "bg-slate-900 text-white" : "bg-slate-100"
              }`}
            >
              Sheet
            </button>
          )}

          {!isComparisonPage && (
            <button onClick={clearPage} className="btn bg-red-50 text-red-600">
              Clear
            </button>
          )}
        </div>
      </div>

      {showUpload ? (
        <FileUpload onData={handleData} />
      ) : (
        <>
          {!isComparisonPage &&
            (isRmaPage || isSatisfactionPage ? (
              <RmaThemePanel color={color} setColor={setColor} />
            ) : (
              <ThemePanel
                color={color}
                setColor={setColor}
                analytics={ticketAnalytics}
                mapping={mapping}
                setMapping={setMapping}
              />
            ))}

          {view === "sheet" && !isComparisonPage ? (
            <SheetEditor rows={rows} setRows={setRows} />
          ) : isRmaEmeaPage ? (
            <RmaEmeaDashboard
              title={pageTitle}
              rows={rows}
              analytics={rmaEmeaAnalytics}
              color={color}
            />
          ) : isRmaUsPage ? (
            <RmaUsDashboard
              title={pageTitle}
              rows={rows}
              analytics={rmaUsAnalytics}
              color={color}
            />
          ) : isGoodPage ? (
            <GoodSatisfactionDashboard
              title={pageTitle}
              rows={rows}
              analytics={goodAnalytics}
              color={color}
            />
          ) : isBadPage ? (
            <BadSatisfactionDashboard
              title={pageTitle}
              rows={rows}
              analytics={badAnalytics}
            />
          ) : isComparisonPage ? (
            <ComparisonDashboard
              title={pageTitle}
              analytics={comparisonAnalytics}
            />
          ) : (
            <Dashboard
              title={pageTitle}
              rows={rows}
              analytics={ticketAnalytics}
              color={color}
            />
          )}
        </>
      )}
    </div>
  );
}