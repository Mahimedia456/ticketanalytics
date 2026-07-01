export default function MonthSelector({ value, onChange }) {
  return (
    <input
      type="month"
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      className="input max-w-[220px]"
    />
  );
}