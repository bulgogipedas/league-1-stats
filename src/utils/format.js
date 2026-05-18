export function number(value, digits = 0) {
  const numeric = Number(value || 0);
  return numeric.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

export function percent(value) {
  return `${number(value, 1)}%`;
}

export function positionLabel(pos) {
  return { D: "Defender", M: "Midfielder", F: "Forward", G: "Goalkeeper" }[pos] || pos || "Unlisted";
}

export function resultTone(result) {
  return result === "W" ? "W" : result === "L" ? "L" : "D";
}

export function resultLabel(result) {
  return { W: "Wins", D: "Draws", L: "Loses" }[result] || result;
}
