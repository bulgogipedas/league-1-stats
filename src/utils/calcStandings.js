export function sortStandings(rows, key = "Pts", direction = "desc") {
  const copy = [...rows];
  copy.sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (typeof av === "string") return direction === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    return direction === "asc" ? av - bv : bv - av;
  });
  return copy;
}
