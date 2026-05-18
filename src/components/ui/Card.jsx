export default function Card({ title, kicker, children, className = "", action }) {
  return (
    <section className={`border border-border bg-card p-6 ${className}`}>
      {(title || kicker || action) && (
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            {kicker && <p className="text-sm text-muted">{kicker}</p>}
            {title && <h2 className="text-xl font-normal leading-7 text-text">{title}</h2>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
