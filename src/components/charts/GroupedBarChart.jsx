import * as d3 from "d3";
import { useState } from "react";
import ChartTooltip from "./ChartTooltip.jsx";
import useResize from "./useResize.js";

export default function GroupedBarChart({ data, keys, labelKey = "label", colors = ["#0F62FE", "#8D8D8D"], height = 320 }) {
  const [ref, size] = useResize();
  const [tooltip, setTooltip] = useState(null);
  const width = size.width;
  const margin = { top: 20, right: 18, bottom: 56, left: 42 };
  const x0 = d3.scaleBand().domain(data.map((d) => d[labelKey])).range([margin.left, width - margin.right]).padding(0.25);
  const x1 = d3.scaleBand().domain(keys).range([0, x0.bandwidth()]).padding(0.12);
  const y = d3.scaleLinear().domain([0, d3.max(data, (d) => d3.max(keys, (key) => Number(d[key] || 0))) || 1]).nice().range([height - margin.bottom, margin.top]);
  return (
    <div ref={ref} className="relative w-full overflow-hidden">
      <svg width={width} height={height} role="img" aria-label="Grouped bar chart" onMouseLeave={() => setTooltip(null)}>
        {y.ticks(5).map((tick) => (
          <g key={tick}>
            <line x1={margin.left} x2={width - margin.right} y1={y(tick)} y2={y(tick)} stroke="#E0E0E0" />
            <text x={margin.left - 8} y={y(tick) + 4} textAnchor="end" className="fill-muted text-[10px]">{tick}</text>
          </g>
        ))}
        {data.map((row, rowIndex) => (
          <g key={row[labelKey]} transform={`translate(${x0(row[labelKey])},0)`}>
            {keys.map((key, index) => (
              <rect
                key={key}
                x={x1(key)}
                y={y(Number(row[key] || 0))}
                width={x1.bandwidth()}
                height={height - margin.bottom - y(Number(row[key] || 0))}
                fill={colors[index]}
                rx="2"
                onMouseMove={(event) => setTooltip({
                  x: event.nativeEvent.offsetX,
                  y: event.nativeEvent.offsetY,
                  title: String(row[labelKey]),
                  rows: [{ label: key, value: Number(row[key] || 0).toLocaleString(undefined, { maximumFractionDigits: 2 }) }],
                })}
              />
            ))}
            <text
              x={x0.bandwidth() / 2}
              y={height - 28}
              textAnchor="end"
              transform={`rotate(-35 ${x0.bandwidth() / 2} ${height - 28})`}
              className="fill-muted text-[10px]"
              opacity={data.length > 16 && rowIndex % 2 ? 0 : 1}
            >
              {String(row[labelKey]).slice(0, 10)}
            </text>
          </g>
        ))}
      </svg>
      <ChartTooltip tooltip={tooltip} />
    </div>
  );
}
