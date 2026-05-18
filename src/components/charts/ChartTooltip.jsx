export default function ChartTooltip({ tooltip }) {
  if (!tooltip) return null;
  return (
    <div
      className="pointer-events-none absolute z-30 min-w-40 border border-border bg-white px-3 py-2 text-xs shadow-sm"
      style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
    >
      <p className="font-semibold text-text">{tooltip.title}</p>
      {tooltip.rows?.map((row) => (
        <p key={`${row.label}-${row.value}`} className="mt-1 flex justify-between gap-5 text-muted">
          <span>{row.label}</span>
          <span className="stat-number text-text">{row.value}</span>
        </p>
      ))}
    </div>
  );
}
