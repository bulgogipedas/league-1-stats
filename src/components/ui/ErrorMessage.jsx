import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";
import { classifyError } from "../../utils/errorMessages.js";

export default function ErrorMessage({ error, context = "dashboard", onRetry, compact = false }) {
  const details = classifyError(error, context);
  const Icon = details.kind === "Internet connection issue" ? WifiOff : AlertTriangle;
  const rawMessage = typeof error === "string" ? error : error?.message;

  return (
    <section className={`border border-loss bg-white ${compact ? "p-4" : "p-4 sm:p-6"}`} role="alert" aria-live="polite">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center border border-loss bg-panel text-loss">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-loss">{details.kind}</p>
          <h2 className="mt-1 text-lg font-semibold text-text">{details.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{details.description}</p>
          <p className="mt-2 text-sm font-medium text-text">{details.action}</p>
          {rawMessage && (
            <details className="mt-3 text-xs text-muted">
              <summary className="cursor-pointer font-semibold text-text">Technical details</summary>
              <pre className="mt-2 max-h-32 overflow-auto border border-border bg-panel p-3 whitespace-pre-wrap">{rawMessage}</pre>
            </details>
          )}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex min-h-11 items-center gap-2 border border-border bg-panel px-4 py-2 text-sm font-semibold hover:border-teal hover:bg-white"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
