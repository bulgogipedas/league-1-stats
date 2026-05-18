import * as d3 from "d3";
import { useState } from "react";
import ChartTooltip from "./ChartTooltip.jsx";
import useResize from "./useResize.js";

export default function RankTimelineChart({ series, height = 340 }) {
  const [ref, size] = useResize();
  const [tooltip, setTooltip] = useState(null);
  const width = size.width;
  const margin = { top: 20, right: 26, bottom: 36, left: 42 };
  const all = series.flatMap((item) => item.values);
  const x = d3.scaleLinear().domain(d3.extent(all, (d) => d.week)).nice().range([margin.left, width - margin.right]);
  const y = d3.scaleLinear().domain([1, 18]).range([margin.top, height - margin.bottom]);
  const color = d3.scaleOrdinal().domain(series.map((item) => item.name)).range(["#0F62FE", "#002D9C", "#4589FF", "#525252", "#8D8D8D", "#24A148", "#DA1E28", "#F1C21B"]);
  const line = d3.line().x((d) => x(d.week)).y((d) => y(d.rank)).curve(d3.curveMonotoneX);

  return (
    <div ref={ref} className="relative w-full overflow-hidden">
      <svg width={width} height={height} role="img" aria-label="Table rank timeline" onMouseLeave={() => setTooltip(null)}>
        {[1, 3, 6, 9, 12, 15, 18].map((tick) => (
          <g key={tick}>
            <line x1={margin.left} x2={width - margin.right} y1={y(tick)} y2={y(tick)} stroke="#E0E0E0" />
            <text x={margin.left - 8} y={y(tick) + 4} textAnchor="end" className="fill-muted text-[10px]">{tick}</text>
          </g>
        ))}
        {x.ticks(8).map((tick) => (
          <text key={tick} x={x(tick)} y={height - 10} textAnchor="middle" className="fill-muted text-[10px]">{tick}</text>
        ))}
        {series.map((item) => (
          <g key={item.name}>
            <path d={line(item.values)} fill="none" stroke={item.color || color(item.name)} strokeWidth="2">
              <title>{item.name}</title>
            </path>
            {item.values.map((point) => (
              <circle
                key={`${item.name}-${point.week}`}
                cx={x(point.week)}
                cy={y(point.rank)}
                r="5"
                fill={item.color || color(item.name)}
                onMouseMove={(event) => setTooltip({
                  x: event.nativeEvent.offsetX,
                  y: event.nativeEvent.offsetY,
                  title: item.name,
                  rows: [
                    { label: "Week", value: point.week.toLocaleString() },
                    { label: "Rank", value: point.rank.toLocaleString() },
                    { label: "Points", value: Number(point.points || 0).toLocaleString() },
                  ],
                })}
              />
            ))}
          </g>
        ))}
        <text x={margin.left} y={14} className="fill-muted text-[10px]">Rank 1 at top</text>
      </svg>
      <ChartTooltip tooltip={tooltip} />
    </div>
  );
}
