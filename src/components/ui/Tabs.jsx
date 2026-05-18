export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={active === tab.value}
          onClick={() => onChange(tab.value)}
          className={`min-h-12 border-b px-4 py-3 text-sm transition ${
            active === tab.value ? "border-b-2 border-teal bg-card font-semibold text-text" : "border-border bg-card text-muted hover:bg-panel hover:text-text"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
