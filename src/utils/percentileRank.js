export function percentileRank(rows, value, metric) {
  const values = rows.map((row) => Number(row?.[metric] || 0)).sort((a, b) => a - b);
  if (!values.length) return 0;
  const below = values.filter((item) => item <= Number(value || 0)).length;
  return Math.round((below / values.length) * 100);
}
