const tones = {
  W: "border-win bg-card text-win",
  D: "border-draw bg-card text-draw",
  L: "border-loss bg-card text-loss",
  teal: "border-teal bg-card text-teal",
  amber: "border-amber bg-card text-text",
  muted: "border-border bg-card text-muted",
};

export default function Badge({ children, tone = "muted" }) {
  return <span className={`inline-flex items-center border px-2 py-0.5 text-xs font-normal ${tones[tone] || tones.muted}`}>{children}</span>;
}
