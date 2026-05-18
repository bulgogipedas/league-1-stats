export default function Skeleton({ className = "h-24" }) {
  return <div className={`animate-pulse border border-border bg-panel ${className}`} />;
}
