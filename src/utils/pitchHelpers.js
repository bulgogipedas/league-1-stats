export const positionColors = {
  G: "#F1C21B",
  D: "#002D9C",
  M: "#0F62FE",
  F: "#DA1E28",
};

export function formationSlots(formation = "4-3-3") {
  const lines = String(formation).split("-").map((item) => Number(item));
  const slots = [{ x: 8, y: 50, pos: "G" }];
  const xLines = [24, 47, 68, 84];
  lines.forEach((count, lineIndex) => {
    const yStep = 100 / (count + 1);
    Array.from({ length: count }).forEach((_, index) => {
      slots.push({
        x: xLines[lineIndex] || 50 + lineIndex * 12,
        y: yStep * (index + 1),
        pos: lineIndex === 0 ? "D" : lineIndex === lines.length - 1 ? "F" : "M",
      });
    });
  });
  return slots.slice(0, 11);
}
