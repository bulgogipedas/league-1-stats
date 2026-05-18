export function normalizeValue(value, max) {
  if (!max) return 0;
  return Math.max(0, Math.min(100, (Number(value || 0) / max) * 100));
}

export function average(rows, key) {
  if (!rows.length) return 0;
  return rows.reduce((sum, row) => sum + Number(row[key] || 0), 0) / rows.length;
}

export function sum(rows, key) {
  return rows.reduce((total, row) => total + Number(row[key] || 0), 0);
}
