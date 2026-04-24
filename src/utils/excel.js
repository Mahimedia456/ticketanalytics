import * as XLSX from "xlsx";

export async function parseExcelFile(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, {
    cellDates: false,
    raw: false,
  });

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json(worksheet, {
    defval: "",
    raw: false,
  });

  return rows;
}