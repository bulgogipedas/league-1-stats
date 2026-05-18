export default function Card({ title, kicker, children, className = "", action }) {
  return (
    <section className={`min-w-0 border border-border bg-card p-4 sm:p-6 ${className}`}>
      {(title || kicker || action) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            {kicker && <p className="text-sm text-muted">{kicker}</p>}
            {title && <h2 className="text-xl font-normal leading-7 text-text">{title}</h2>}
          </div>
          {action && <div className="min-w-0 max-w-full overflow-x-auto">{action}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
