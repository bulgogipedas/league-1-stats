import * as d3 from "d3";
import { useState } from "react";
import ChartTooltip from "./ChartTooltip.jsx";
import useResize from "./useResize.js";

export default function LineChart({ series, xKey = "x", yKey = "y", height = 320, yDomain, yReverse = false }) {
  const [ref, size] = useResize();
  const [tooltip, setTooltip] = useState(null);
  const width = size.width;
  const h = height;
  const margin = { top: 18, right: 22, bottom: 34, left: 42 };
  const all = series.flatMap((item) => item.values);
  const x = d3.scaleLinear().domain(d3.extent(all, (d) => Number(d[xKey]))).nice().range([margin.left, width - margin.right]);
  const y = d3.scaleLinear()
    .domain(yDomain || [0, d3.max(all, (d) => Number(d[yKey])) || 1])
    .nice()
    .range(yReverse ? [margin.top, h - margin.bottom] : [h - margin.bottom, margin.top]);
  const color = d3.scaleOrdinal().domain(series.map((item) => item.name)).range(["var(--chart-blue)", "var(--chart-blue-strong)", "var(--chart-blue-soft)", "var(--text-secondary)", "var(--chart-neutral)", "var(--win)", "var(--loss)"]);
  const line = d3.line().x((d) => x(Number(d[xKey]))).y((d) => y(Number(d[yKey]))).curve(d3.curveMonotoneX);
  const xTicks = x.ticks(6);
  const yTicks = y.ticks(5);
  return (
    <div ref={ref} className="relative w-full overflow-hidden">
      <svg width={width} height={h} role="img" aria-label="Line chart" onMouseLeave={() => setTooltip(null)}>
        {yTicks.map((tick) => (
          <g key={tick}>
            <line x1={margin.left} x2={width - margin.right} y1={y(tick)} y2={y(tick)} stroke="var(--chart-grid)" />
            <text x={margin.left - 8} y={y(tick) + 4} textAnchor="end" className="fill-muted text-[10px]">{tick}</text>
          </g>
        ))}
        {xTicks.map((tick) => (
          <text key={tick} x={x(tick)} y={h - 10} textAnchor="middle" className="fill-muted text-[10px]">{tick}</text>
        ))}
        {series.map((item) => (
          <g key={item.name}>
            <path d={line(item.values)} fill="none" stroke={item.color || color(item.name)} strokeWidth="2" opacity="0.9">
              <title>{item.name}</title>
            </path>
            {item.values.map((point) => (
              <circle
                key={`${item.name}-${point[xKey]}-${point[yKey]}`}
                cx={x(Number(point[xKey]))}
                cy={y(Number(point[yKey]))}
                r="5"
                fill={item.color || color(item.name)}
                opacity="0.9"
                onMouseMove={(event) => setTooltip({
                  x: event.nativeEvent.offsetX,
                  y: event.nativeEvent.offsetY,
                  title: item.name,
                  rows: [
                    { label: "Week", value: Number(point[xKey]).toLocaleString() },
                    { label: "Value", value: Number(point[yKey] || 0).toLocaleString(undefined, { maximumFractionDigits: 2 }) },
                  ],
                })}
              />
            ))}
          </g>
        ))}
      </svg>
      <ChartTooltip tooltip={tooltip} />
    </div>
  );
}
