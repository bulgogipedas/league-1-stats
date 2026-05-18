import * as d3 from "d3";
import { useState } from "react";
import ChartTooltip from "./ChartTooltip.jsx";
import useResize from "./useResize.js";

export default function DonutChart({ data, height = 280 }) {
  const [ref, size] = useResize();
  const [tooltip, setTooltip] = useState(null);
  const width = size.width;
  const radius = Math.min(width, height) / 2 - 18;
  const pie = d3.pie().value((d) => d.value)(data);
  const arc = d3.arc().innerRadius(radius * 0.58).outerRadius(radius);
  const colors = { W: "var(--win)", Wins: "var(--win)", D: "var(--draw)", Draws: "var(--draw)", L: "var(--loss)", Loses: "var(--loss)", Losses: "var(--loss)" };
  return (
    <div ref={ref} className="relative w-full">
      <svg width={width} height={height} role="img" aria-label="Result distribution" onMouseLeave={() => setTooltip(null)}>
        <g transform={`translate(${width / 2},${height / 2})`}>
          {pie.map((slice) => (
            <path key={slice.data.label} d={arc(slice)} fill={colors[slice.data.label]} onMouseMove={(event) => setTooltip({ x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY, title: slice.data.label, rows: [{ label: "Matches", value: Number(slice.data.value || 0).toLocaleString() }] })} />
          ))}
          <text textAnchor="middle" className="fill-text text-sm font-semibold">Results</text>
        </g>
      </svg>
      <ChartTooltip tooltip={tooltip} />
    </div>
  );
}
