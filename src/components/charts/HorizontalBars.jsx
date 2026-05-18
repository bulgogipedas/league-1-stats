import * as d3 from "d3";
import { useState } from "react";
import ChartTooltip from "./ChartTooltip.jsx";
import useResize from "./useResize.js";

export default function HorizontalBars({ data, height = 360 }) {
  const [ref, size] = useResize();
  const [tooltip, setTooltip] = useState(null);
  const width = size.width;
  const margin = { top: 20, right: 24, bottom: 20, left: 130 };
  const y = d3.scaleBand().domain(data.map((d) => d.label)).range([margin.top, height - margin.bottom]).padding(0.35);
  const max = d3.max(data, (d) => Math.max(Number(d.left || 0), Number(d.right || 0))) || 1;
  const x = d3.scaleLinear().domain([-max, max]).range([margin.left, width - margin.right]);
  return (
    <div ref={ref} className="relative w-full overflow-visible">
      <svg width={width} height={height} role="img" aria-label="Comparison bars" onMouseLeave={() => setTooltip(null)}>
        <line x1={x(0)} x2={x(0)} y1={margin.top} y2={height - margin.bottom} stroke="#8D8D8D" />
        {data.map((row) => (
          <g key={row.label}>
            <text x={margin.left - 10} y={y(row.label) + y.bandwidth() / 2 + 4} textAnchor="end" className="fill-muted text-[11px]">{row.label}</text>
            <rect x={x(-row.left)} y={y(row.label)} width={x(0) - x(-row.left)} height={y.bandwidth()} fill="#0F62FE" onMouseMove={(event) => setTooltip({ x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY, title: row.label, rows: [{ label: "Team", value: Number(row.left || 0).toLocaleString(undefined, { maximumFractionDigits: 2 }) }] })} />
            <rect x={x(0)} y={y(row.label)} width={x(row.right) - x(0)} height={y.bandwidth()} fill="#8D8D8D" onMouseMove={(event) => setTooltip({ x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY, title: row.label, rows: [{ label: "Opponent", value: Number(row.right || 0).toLocaleString(undefined, { maximumFractionDigits: 2 }) }] })} />
          </g>
        ))}
      </svg>
      <ChartTooltip tooltip={tooltip} />
    </div>
  );
}
