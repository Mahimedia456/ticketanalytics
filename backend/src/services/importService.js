import { randomUUID } from "crypto";
import { supabaseAdmin } from "../config/supabase.js";

function safeFileName(name = "upload.xlsx") {
  return String(name).replace(/[^\w.\-]+/g, "-");
}

export async function importMonthlyDataset({
  moduleKey,
  reportMonth,
  file,
  rows,
  userId,
}) {
  if (!moduleKey) throw new Error("moduleKey is required");
  if (!reportMonth) throw new Error("reportMonth is required");
  if (!Array.isArray(rows)) throw new Error("rows must be an array");

  const cleanRows = rows.filter((row) =>
    Object.values(row || {}).some((value) => String(value ?? "").trim() !== "")
  );

  const fileName = safeFileName(file?.originalname || `${moduleKey}.xlsx`);
  const storagePath = `${moduleKey}/${reportMonth}/${Date.now()}-${fileName}`;

  if (file?.buffer) {
    const { error: storageError } = await supabaseAdmin.storage
      .from(process.env.SUPABASE_BUCKET || "csv")
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype || "application/octet-stream",
        upsert: true,
      });

    if (storageError) throw storageError;
  }

  const { data: upload, error: uploadError } = await supabaseAdmin
    .from("excel_uploads")
    .upsert(
      {
        module_key: moduleKey,
        report_month: reportMonth,
        original_filename: fileName,
        storage_path: storagePath,
        uploaded_by: userId || null,
      },
      { onConflict: "module_key,report_month" }
    )
    .select("*")
    .single();

  if (uploadError) throw uploadError;

  const { error: deleteError } = await supabaseAdmin
    .from("report_rows")
    .delete()
    .eq("module_key", moduleKey)
    .eq("report_month", reportMonth);

  if (deleteError) throw deleteError;

  if (cleanRows.length) {
    const insertRows = cleanRows.map((row) => ({
      upload_id: upload.id,
      module_key: moduleKey,
      report_month: reportMonth,
      row_data: row,
    }));

    const { error: rowsError } = await supabaseAdmin
      .from("report_rows")
      .insert(insertRows);

    if (rowsError) throw rowsError;
  }

  return {
    upload,
    summary: {
      insertedRows: cleanRows.length,
      moduleKey,
      reportMonth,
      storagePath,
    },
  };
}