export default function DataTable({ columns = [], rows = [], emptyText = "No data found" }) {
  return (
    <div className="dashboard-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="soft-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key || column}>{column.label || column}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.length ? (
              rows.map((row, index) => (
                <tr key={index}>
                  {columns.map((column) => {
                    const key = column.key || column;
                    return <td key={key}>{row[key] ?? "-"}</td>;
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={Math.max(columns.length, 1)}
                  className="py-8 text-center text-zinc-500"
                >
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}