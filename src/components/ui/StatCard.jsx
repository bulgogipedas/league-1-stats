import Card from "./Card.jsx";

export default function StatCard({ label, value, sublabel, tone = "text-text" }) {
  return (
    <Card className="min-h-[116px]">
      <p className="text-sm text-muted">{label}</p>
      <p className={`stat-number mt-4 text-3xl font-light leading-9 ${tone}`}>{value}</p>
      {sublabel && <p className="mt-2 text-xs text-muted">{sublabel}</p>}
    </Card>
  );
}
