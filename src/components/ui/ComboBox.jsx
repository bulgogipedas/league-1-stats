import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";

export default function ComboBox({ label, value, onChange, options, placeholder = "Search", emptyLabel = "No results" }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return options.slice(0, 80);
    return options.filter((option) => `${option.label} ${option.meta || ""}`.toLowerCase().includes(term)).slice(0, 80);
  }, [options, query]);

  return (
    <div className="relative">
      <label className="mb-1 block text-xs text-muted">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((state) => !state)}
        className="flex min-h-12 w-full items-center justify-between border border-border bg-panel px-3 py-2 text-left text-sm"
        aria-expanded={open}
      >
        <span>
          <span className="block text-text">{selected?.label || placeholder}</span>
          {selected?.meta && <span className="block text-xs text-muted">{selected.meta}</span>}
        </span>
        <Search className="h-4 w-4 text-muted" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full border border-border bg-white">
          <div className="flex items-center border-b border-border bg-panel px-3">
            <Search className="h-4 w-4 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoFocus
              placeholder={placeholder}
              className="min-h-12 w-full bg-panel px-3 text-sm outline-none"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
                <X className="h-4 w-4 text-muted" />
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {filtered.length === 0 && <p className="px-3 py-4 text-sm text-muted">{emptyLabel}</p>}
            {filtered.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                  setQuery("");
                }}
                className={`block w-full border-b border-border px-3 py-3 text-left text-sm hover:bg-panel ${option.value === value ? "bg-panel" : "bg-white"}`}
              >
                <span className="block text-text">{option.label}</span>
                {option.meta && <span className="block text-xs text-muted">{option.meta}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
