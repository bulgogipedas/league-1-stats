export default function ChartNote({ children }) {
  return (
    <div className="mt-3 border-t border-border pt-3 text-xs leading-5 text-muted">
      {children || "Reference: hover marks for exact values. Axes use linear scales unless stated otherwise."}
    </div>
  );
}
