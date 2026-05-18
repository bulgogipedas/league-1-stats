import { useState } from "react";
import { formationSlots, positionColors } from "../../utils/pitchHelpers.js";
import ChartTooltip from "./ChartTooltip.jsx";
import useResize from "./useResize.js";

export default function PitchViz({ formation = "4-3-3", players = [] }) {
  const [ref, size] = useResize();
  const [tooltip, setTooltip] = useState(null);
  const width = size.width;
  const height = Math.max(360, width * 0.58);
  const slots = formationSlots(formation);
  const squad = slots.map((slot, index) => ({ ...slot, ...(players[index] || {}), pos: players[index]?.Pos || slot.pos }));
  const sx = (x) => (x / 100) * width;
  const sy = (y) => (y / 100) * height;
  return (
    <div ref={ref} className="relative w-full overflow-visible border border-border bg-pitch">
      <svg width={width} height={height} role="img" aria-label="Formation pitch" onMouseLeave={() => setTooltip(null)}>
        <rect x="12" y="12" width={width - 24} height={height - 24} fill="#F4F4F4" stroke="#C6C6C6" strokeWidth="2" />
        <line x1={width / 2} x2={width / 2} y1="12" y2={height - 12} stroke="#C6C6C6" />
        <circle cx={width / 2} cy={height / 2} r={height * 0.12} fill="none" stroke="#C6C6C6" />
        <rect x="12" y={height * 0.29} width={width * 0.12} height={height * 0.42} fill="none" stroke="#C6C6C6" />
        <rect x={width - 12 - width * 0.12} y={height * 0.29} width={width * 0.12} height={height * 0.42} fill="none" stroke="#C6C6C6" />
        {squad.map((player, index) => (
          <g key={`${player.Player || index}-${index}`} transform={`translate(${sx(player.x)},${sy(player.y)})`}>
            <circle
              r={Math.max(14, Math.min(24, 12 + Number(player.Touches || player.Min || 50) / 80))}
              fill={positionColors[player.pos] || "#0F62FE"}
              fillOpacity="0.9"
              onMouseMove={(event) => setTooltip({
                x: event.nativeEvent.offsetX,
                y: event.nativeEvent.offsetY,
                title: player.Player || player.name || `Player ${index + 1}`,
                rows: [
                  { label: "Position", value: player.pos },
                  { label: "Minutes", value: Number(player.Min || 0).toLocaleString() },
                  { label: "Touches", value: Number(player.Touches || 0).toLocaleString() },
                ],
              })}
            />
            <text y="4" textAnchor="middle" className="fill-bg text-[10px] font-bold">{player.pos}</text>
            <text y="34" textAnchor="middle" className="fill-text text-[10px]">{String(player.Player || player.name || `Player ${index + 1}`).split(" ").slice(-1)}</text>
          </g>
        ))}
      </svg>
      <ChartTooltip tooltip={tooltip} />
    </div>
  );
}
