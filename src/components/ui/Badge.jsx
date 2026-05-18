const tones = {
  W: "border-win bg-white text-win",
  D: "border-draw bg-white text-draw",
  L: "border-loss bg-white text-loss",
  teal: "border-teal bg-white text-teal",
  amber: "border-amber bg-white text-text",
  muted: "border-border bg-white text-muted",
};

export default function Badge({ children, tone = "muted" }) {
  return <span className={`inline-flex items-center border px-2 py-0.5 text-xs font-normal ${tones[tone] || tones.muted}`}>{children}</span>;
}
