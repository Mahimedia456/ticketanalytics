import { useMemo } from "react";
import { HotTable } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";

registerAllModules();

export default function SheetEditor({ rows, setRows }) {
  const columns = useMemo(() => {
    if (!rows.length) return [];
    return Object.keys(rows[0]);
  }, [rows]);

  const data = useMemo(
    () => rows.map((row) => columns.map((col) => row[col] ?? "")),
    [rows, columns]
  );

  function handleChange(changes, source) {
    if (!changes || source === "loadData") return;

    setRows((prev) => {
      const updated = [...prev];

      changes.forEach(([rowIndex, colIndex, oldValue, newValue]) => {
        const colName = columns[colIndex];

        if (!updated[rowIndex]) {
          updated[rowIndex] = {};
          columns.forEach((col) => {
            updated[rowIndex][col] = "";
          });
        }

        updated[rowIndex] = {
          ...updated[rowIndex],
          [colName]: newValue,
        };
      });

      return updated;
    });
  }

  function addColumn() {
    const name = prompt("New column name?");
    if (!name) return;

    setRows((prev) => {
      if (!prev.length) return [{ [name]: "" }];

      return prev.map((row) => ({
        ...row,
        [name]: "",
      }));
    });
  }

  function addRow() {
    setRows((prev) => {
      const empty = {};
      columns.forEach((col) => {
        empty[col] = "";
      });
      return [...prev, empty];
    });
  }

  return (
    <div className="dashboard-card p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-black text-xl">Editable Sheet</h2>

        <div className="flex gap-2">
          <button onClick={addRow} className="btn bg-slate-100">
            Add Row
          </button>
          <button onClick={addColumn} className="btn bg-slate-900 text-white">
            Add Column
          </button>
        </div>
      </div>

      <div className="h-[calc(100vh-230px)] min-h-[650px]">
        <HotTable
          data={data}
          colHeaders={columns}
          rowHeaders={true}
          width="100%"
          height="100%"
          licenseKey="non-commercial-and-evaluation"
          stretchH="all"
          manualColumnResize={true}
          manualRowResize={true}
          filters={true}
          dropdownMenu={true}
          contextMenu={true}
          minSpareRows={5}
          afterChange={handleChange}
        />
      </div>
    </div>
  );
}