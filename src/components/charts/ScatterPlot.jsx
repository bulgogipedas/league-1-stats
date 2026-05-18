import * as d3 from "d3";
import { useState } from "react";
import ChartTooltip from "./ChartTooltip.jsx";
import useResize from "./useResize.js";

export default function ScatterPlot({ data, xKey, yKey, selected, height = 330 }) {
  const [ref, size] = useResize();
  const [tooltip, setTooltip] = useState(null);
  const width = size.width;
  const margin = { top: 24, right: 24, bottom: 42, left: 46 };
  const x = d3.scaleLinear().domain([0, d3.max(data, (d) => Number(d[xKey] || 0)) || 1]).nice().range([margin.left, width - margin.right]);
  const y = d3.scaleLinear().domain([0, d3.max(data, (d) => Number(d[yKey] || 0)) || 1]).nice().range([height - margin.bottom, margin.top]);
  return (
    <div ref={ref} className="relative w-full overflow-visible">
      <svg width={width} height={height} role="img" aria-label="Scatter plot" onMouseLeave={() => setTooltip(null)}>
        {x.ticks(5).map((tick) => <text key={tick} x={x(tick)} y={height - 14} textAnchor="middle" className="fill-muted text-[10px]">{tick}</text>)}
        {y.ticks(5).map((tick) => (
          <g key={tick}>
            <line x1={margin.left} x2={width - margin.right} y1={y(tick)} y2={y(tick)} stroke="#E0E0E0" />
            <text x={margin.left - 8} y={y(tick) + 4} textAnchor="end" className="fill-muted text-[10px]">{tick}</text>
          </g>
        ))}
        {data.map((row) => {
          const active = row.team_slug === selected;
          return (
            <g key={row.team_slug}>
              <circle
                cx={x(row[xKey])}
                cy={y(row[yKey])}
                r={active ? 8 : 6}
                fill={active ? "#0F62FE" : "#8D8D8D"}
                opacity={active ? 1 : 0.7}
                onMouseMove={(event) => setTooltip({
                  x: event.nativeEvent.offsetX,
                  y: event.nativeEvent.offsetY,
                  title: row.team,
                  rows: [
                    { label: xKey, value: Number(row[xKey] || 0).toLocaleString(undefined, { maximumFractionDigits: 2 }) },
                    { label: yKey, value: Number(row[yKey] || 0).toLocaleString(undefined, { maximumFractionDigits: 2 }) },
                  ],
                })}
              />
              {active && <text x={x(row[xKey]) + 9} y={y(row[yKey]) + 4} className="fill-text text-[11px]">{row.team}</text>}
            </g>
          );
        })}
      </svg>
      <ChartTooltip tooltip={tooltip} />
    </div>
  );
}
