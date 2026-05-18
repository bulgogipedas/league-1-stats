import { teamLogos } from "../../data/teamLogos.js";

export default function ClubLogo({ slug, name, size = "md" }) {
  const logo = teamLogos[slug];
  const sizeClass = size === "lg" ? "h-12 w-12" : size === "sm" ? "h-7 w-7" : "h-9 w-9";
  return (
    <span className={`inline-grid ${sizeClass} shrink-0 place-items-center border border-border bg-card align-middle`}>
      {logo?.image ? (
        <img src={logo.image} alt={`${name || slug} logo`} className="h-full w-full object-contain p-1" loading="lazy" />
      ) : (
        <span className="text-xs font-semibold text-muted">{String(name || slug || "?").slice(0, 2).toUpperCase()}</span>
      )}
    </span>
  );
}
