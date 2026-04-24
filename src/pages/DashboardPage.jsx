import { useEffect, useMemo, useState } from "react";
import FileUpload from "../components/FileUpload";
import SheetEditor from "../components/SheetEditor";
import ThemePanel from "../components/ThemePanel";
import RmaThemePanel from "../components/RmaThemePanel";
import Dashboard from "../components/Dashboard";
import RmaEmeaDashboard from "../components/RmaEmeaDashboard";
import { autoDetectColumns, buildAnalytics } from "../utils/analytics";
import { buildRmaEmeaAnalytics } from "../utils/rmaEmeaAnalytics";

export default function DashboardPage({ pageTitle, storageKey, pageType = "ticket" }) {
  const [rows, setRows] = useState([]);
  const [view, setView] = useState("dashboard");
  const [color, setColor] = useState("#4fd1a5");
  const [mapping, setMapping] = useState({});

  const isRmaEmeaPage = pageType === "rma-emea";

  useEffect(() => {
    const saved = localStorage.getItem(`dashboard:${storageKey}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setRows(parsed.rows || []);
      setMapping(parsed.mapping || {});
      setColor(parsed.color || "#4fd1a5");
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
    setMapping(autoDetectColumns(data));
  }

  const ticketAnalytics = useMemo(
    () => buildAnalytics(rows, mapping),
    [rows, mapping]
  );

  const rmaEmeaAnalytics = useMemo(
    () => buildRmaEmeaAnalytics(rows),
    [rows]
  );

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

          <button
            onClick={() => setView("sheet")}
            className={`btn ${
              view === "sheet" ? "bg-slate-900 text-white" : "bg-slate-100"
            }`}
          >
            Sheet
          </button>

          <button
            onClick={() => {
              setRows([]);
              setMapping({});
              localStorage.removeItem(`dashboard:${storageKey}`);
            }}
            className="btn bg-red-50 text-red-600"
          >
            Clear
          </button>
        </div>
      </div>

      {!rows.length ? (
        <FileUpload onData={handleData} />
      ) : (
        <>
          {isRmaEmeaPage ? (
            <RmaThemePanel color={color} setColor={setColor} />
          ) : (
            <ThemePanel
              color={color}
              setColor={setColor}
              analytics={ticketAnalytics}
              mapping={mapping}
              setMapping={setMapping}
            />
          )}

          {view === "sheet" ? (
            <SheetEditor rows={rows} setRows={setRows} />
          ) : isRmaEmeaPage ? (
            <RmaEmeaDashboard
              title={pageTitle}
              rows={rows}
              analytics={rmaEmeaAnalytics}
              color={color}
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