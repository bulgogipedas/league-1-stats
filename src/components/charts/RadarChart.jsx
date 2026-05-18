import * as d3 from "d3";
import { useState } from "react";
import ChartTooltip from "./ChartTooltip.jsx";
import useResize from "./useResize.js";

export default function RadarChart({ axes, series, height = 340 }) {
  const [ref, size] = useResize();
  const [tooltip, setTooltip] = useState(null);
  const width = size.width;
  const radius = Math.max(48, Math.min(width, height) / 2 - 78);
  const center = { x: width / 2, y: height / 2 };
  const angle = (axis) => (axes.indexOf(axis) / axes.length) * Math.PI * 2;
  const line = d3.lineRadial().radius((d) => radius * (d.value / 100)).angle((d) => angle(d.axis)).curve(d3.curveLinearClosed);
  return (
    <div ref={ref} className="relative w-full overflow-hidden">
      <svg width={width} height={height} role="img" aria-label="Radar chart" onMouseLeave={() => setTooltip(null)}>
        <g transform={`translate(${center.x},${center.y})`}>
          {[25, 50, 75, 100].map((ring) => (
            <circle key={ring} r={radius * (ring / 100)} fill="none" stroke="var(--chart-grid)" />
          ))}
          {axes.map((axis) => {
            const a = angle(axis) - Math.PI / 2;
            const labelX = Math.cos(a) * (radius + 42);
            const labelY = Math.sin(a) * (radius + 42);
            const anchor = Math.abs(Math.cos(a)) < 0.25 ? "middle" : Math.cos(a) > 0 ? "start" : "end";
            return (
              <g key={axis}>
                <line x1="0" y1="0" x2={Math.cos(a) * radius} y2={Math.sin(a) * radius} stroke="var(--chart-grid)" />
                <text x={labelX} y={labelY} textAnchor={anchor} dominantBaseline="middle" className="fill-muted text-[10px]">
                  {axis.length > 12 ? axis.split(" ").map((word, index) => <tspan key={word} x={labelX} dy={index ? 11 : 0}>{word}</tspan>) : axis}
                </text>
              </g>
            );
          })}
          {series.map((item) => {
            const values = axes.map((axis) => ({ axis, value: Number(item.values[axis] || 0) }));
            return (
              <g key={item.name}>
                <path d={line(values)} fill={item.color} fillOpacity="0.18" stroke={item.color} strokeWidth="2">
                  <title>{item.name}</title>
                </path>
                {values.map((point) => {
                  const a = angle(point.axis) - Math.PI / 2;
                  const r = radius * (point.value / 100);
                  return (
                    <circle
                      key={`${item.name}-${point.axis}`}
                      cx={Math.cos(a) * r}
                      cy={Math.sin(a) * r}
                      r="5"
                      fill={item.color}
                      onMouseMove={(event) => setTooltip({
                        x: event.nativeEvent.offsetX,
                        y: event.nativeEvent.offsetY,
                        title: item.name,
                        rows: [{ label: point.axis, value: point.value.toLocaleString(undefined, { maximumFractionDigits: 1 }) }],
                      })}
                    />
                  );
                })}
              </g>
            );
          })}
        </g>
      </svg>
      <ChartTooltip tooltip={tooltip} />
    </div>
  );
}
