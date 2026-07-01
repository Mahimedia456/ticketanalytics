import FileUpload from "./FileUpload";

export default function ExcelUploadBox({ onData }) {
  return (
    <div>
      <FileUpload onData={onData} />
    </div>
  );
}