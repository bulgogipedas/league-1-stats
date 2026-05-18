export default function SegmentedControl({ label, value, onChange, options }) {
  return (
    <div>
      <p className="mb-1 text-xs text-muted">{label}</p>
      <div className="grid min-h-12 border border-border" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`border-r border-border px-3 py-2 text-sm last:border-r-0 ${value === option.value ? "bg-strong text-white" : "bg-panel text-text hover:bg-white"}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
