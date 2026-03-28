import React, { useState } from "react";
import { useStore } from "../store";
import { theme } from "../theme";

function SectionHeader({ title }: { title: string }) {
  return (
    <div
      style={{
        fontSize: theme.font.lg,
        fontWeight: 700,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
      }}
    >
      <span style={{ color: theme.colors.accent }}>#</span> {title}
    </div>
  );
}

type Period = "7d" | "30d" | "90d" | "all";
type ChartType = "smooth" | "line" | "bar";

interface DataPoint {
  x: number;
  y: number;
  label: string;
}

function catmullRomToBezier(
  pts: DataPoint[],
  _width: number,
  height: number,
  maxY: number,
) {
  if (pts.length < 2) return "";
  const toSvg = (p: DataPoint) => ({
    x: p.x,
    y: height - (p.y / maxY) * (height - 20) - 10,
  });
  const svgPts = pts.map(toSvg);

  let d = `M ${svgPts[0].x} ${svgPts[0].y}`;
  for (let i = 1; i < svgPts.length; i++) {
    const p0 = svgPts[Math.max(0, i - 2)];
    const p1 = svgPts[i - 1];
    const p2 = svgPts[i];
    const p3 = svgPts[Math.min(svgPts.length - 1, i + 1)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function SmoothChart({
  dataPoints,
  color,
  width = 320,
  height = 220,
}: {
  dataPoints: DataPoint[];
  color: string;
  width?: number;
  height?: number;
}) {
  if (dataPoints.length === 0) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: theme.colors.textDim,
        }}
      >
        No data
      </div>
    );
  }

  const maxY = Math.max(...dataPoints.map((d) => d.y), 1);
  const toSvgY = (y: number) => height - 30 - (y / maxY) * (height - 50);

  const svgPts = dataPoints.map((p) => ({
    x: p.x,
    y: toSvgY(p.y),
    label: p.label,
  }));
  const linePath = catmullRomToBezier(dataPoints, width, height - 30, maxY);

  const fillPath = `${linePath} L ${svgPts[svgPts.length - 1].x} ${height - 30} L ${svgPts[0].x} ${height - 30} Z`;
  const gradId = `grad-${color.replace("#", "")}`;

  return (
    <svg
      aria-hidden="true"
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={0}
          y1={toSvgY(maxY * f)}
          x2={width}
          y2={toSvgY(maxY * f)}
          stroke="#fff"
          strokeOpacity="0.07"
          strokeWidth="1"
        />
      ))}
      <path d={fillPath} fill={`url(#${gradId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {svgPts.map((p) => (
        <g key={`${p.label}-${p.x}`}>
          <line
            x1={p.x}
            y1={p.y + 8}
            x2={p.x}
            y2={height - 30}
            stroke={color}
            strokeOpacity="0.2"
            strokeWidth="1"
          />
          <circle
            cx={p.x}
            cy={p.y}
            r="5"
            fill={theme.colors.surface}
            stroke={color}
            strokeWidth="2.5"
          />
        </g>
      ))}
      {svgPts.map((p) => (
        <text
          key={`txt-${p.label}-${p.x}`}
          x={p.x}
          y={height - 8}
          textAnchor="middle"
          fill={theme.colors.textDim}
          fontSize="10"
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}

function BarChart({
  dataPoints,
  color,
  width = 320,
  height = 220,
}: {
  dataPoints: DataPoint[];
  color: string;
  width?: number;
  height?: number;
}) {
  if (dataPoints.length === 0)
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: theme.colors.textDim,
        }}
      >
        No data
      </div>
    );
  const maxY = Math.max(...dataPoints.map((d) => d.y), 1);
  const barW = Math.max(8, (width / dataPoints.length) * 0.6);
  return (
    <svg
      aria-hidden="true"
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={0}
          y1={(1 - f) * (height - 30)}
          x2={width}
          y2={(1 - f) * (height - 30)}
          stroke="#fff"
          strokeOpacity="0.07"
          strokeWidth="1"
        />
      ))}
      {dataPoints.map((p) => {
        const barH = (p.y / maxY) * (height - 30);
        return (
          <g key={`bar-${p.label}-${p.x}`}>
            <rect
              x={p.x - barW / 2}
              y={height - 30 - barH}
              width={barW}
              height={barH}
              rx="4"
              fill={color}
              fillOpacity="0.8"
            />
            <text
              x={p.x}
              y={height - 8}
              textAnchor="middle"
              fill={theme.colors.textDim}
              fontSize="10"
            >
              {p.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function LineChart({
  dataPoints,
  color,
  width = 320,
  height = 220,
}: {
  dataPoints: DataPoint[];
  color: string;
  width?: number;
  height?: number;
}) {
  if (dataPoints.length < 2)
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: theme.colors.textDim,
        }}
      >
        No data
      </div>
    );
  const maxY = Math.max(...dataPoints.map((d) => d.y), 1);
  const toY = (y: number) => height - 30 - (y / maxY) * (height - 50);
  const pathD = dataPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${toY(p.y)}`)
    .join(" ");
  return (
    <svg
      aria-hidden="true"
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
    >
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line
          key={f}
          x1={0}
          y1={toY(maxY * f)}
          x2={width}
          y2={toY(maxY * f)}
          stroke="#fff"
          strokeOpacity="0.07"
          strokeWidth="1"
        />
      ))}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {dataPoints.map((p) => (
        <g key={`line-${p.label}-${p.x}`}>
          <circle
            cx={p.x}
            cy={toY(p.y)}
            r="4"
            fill={theme.colors.surface}
            stroke={color}
            strokeWidth="2"
          />
          <text
            x={p.x}
            y={height - 8}
            textAnchor="middle"
            fill={theme.colors.textDim}
            fontSize="10"
          >
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function GraphsTab() {
  const { state } = useStore();
  const [period, setPeriod] = useState<Period>("7d");
  const [chartType, setChartType] = useState<ChartType>("smooth");
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [compare, setCompare] = useState(false);
  const chartWidth = 320;

  const getDays = () => {
    const now = new Date();
    const count = period === "7d" ? 7 : period === "30d" ? 30 : 90;
    return Array.from({ length: count }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (count - 1 - i));
      return d.toISOString().slice(0, 10);
    });
  };

  const buildDataPoints = (
    catFilter: (catId: string) => boolean,
    days: string[],
  ): DataPoint[] => {
    const step = Math.max(1, Math.floor(days.length / 10));
    return days
      .filter((_, i) => i % step === 0 || i === days.length - 1)
      .map((day, i, arr) => {
        const total = state.logs
          .filter((l) => l.date.slice(0, 10) === day && catFilter(l.categoryId))
          .reduce((s, l) => s + l.value, 0);
        const label = new Date(day).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        const x = (i / Math.max(arr.length - 1, 1)) * chartWidth;
        return { x, y: total, label };
      });
  };

  const days = getDays();

  const catFilterFn = (catId: string) => {
    if (selectedCat === "all") return true;
    if (selectedCat === "productive")
      return (
        state.categories.find((c) => c.id === catId)?.parentId === "productive"
      );
    if (selectedCat === "time-waste")
      return (
        state.categories.find((c) => c.id === catId)?.parentId === "time-waste"
      );
    return catId === selectedCat;
  };

  const mainData = buildDataPoints(catFilterFn, days);
  const productiveData = buildDataPoints(
    (id) =>
      state.categories.find((c) => c.id === id)?.parentId === "productive",
    days,
  );
  const timeWasteData = buildDataPoints(
    (id) =>
      state.categories.find((c) => c.id === id)?.parentId === "time-waste",
    days,
  );

  const ChartComponent =
    chartType === "smooth"
      ? SmoothChart
      : chartType === "bar"
        ? BarChart
        : LineChart;

  return (
    <div style={{ padding: theme.spacing.lg, paddingBottom: "100px" }}>
      <SectionHeader title="Graphs" />

      {/* Category filter */}
      <div
        style={{
          marginBottom: theme.spacing.md,
          overflowX: "auto",
          display: "flex",
          gap: theme.spacing.sm,
          paddingBottom: "4px",
        }}
      >
        {[
          { id: "all", label: "All" },
          { id: "productive", label: "# Productive" },
          { id: "time-waste", label: "# Time-Waste" },
          ...state.categories.map((c) => ({ id: c.id, label: c.name })),
        ].map((opt) => (
          <button
            type="button"
            key={opt.id}
            data-ocid="graphs.filter.tab"
            onClick={() => setSelectedCat(opt.id)}
            style={{
              padding: "6px 12px",
              borderRadius: theme.radius.pill,
              border: `1px solid ${selectedCat === opt.id ? theme.colors.accent : theme.colors.border}`,
              background:
                selectedCat === opt.id
                  ? `${theme.colors.accent}20`
                  : theme.colors.surface,
              color:
                selectedCat === opt.id
                  ? theme.colors.accent
                  : theme.colors.textMuted,
              fontWeight: 600,
              fontSize: theme.font.xs,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Period filter */}
      <div
        style={{
          display: "flex",
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.md,
        }}
      >
        {(["7d", "30d", "90d", "all"] as Period[]).map((p) => (
          <button
            type="button"
            key={p}
            data-ocid="graphs.filter.tab"
            onClick={() => setPeriod(p)}
            style={{
              flex: 1,
              padding: "8px 0",
              borderRadius: theme.radius.pill,
              border: `1px solid ${period === p ? theme.colors.accent : theme.colors.border}`,
              background:
                period === p
                  ? `${theme.colors.accent}20`
                  : theme.colors.surface,
              color:
                period === p ? theme.colors.accent : theme.colors.textMuted,
              fontWeight: 600,
              fontSize: theme.font.sm,
              cursor: "pointer",
            }}
          >
            {p === "all" ? "All" : p.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Chart type + compare */}
      <div
        style={{
          display: "flex",
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.lg,
        }}
      >
        <div
          style={{
            display: "flex",
            background: theme.colors.border,
            borderRadius: theme.radius.pill,
            padding: "3px",
            flex: 1,
          }}
        >
          {(["smooth", "line", "bar"] as ChartType[]).map((ct) => (
            <button
              type="button"
              key={ct}
              data-ocid="graphs.filter.tab"
              onClick={() => setChartType(ct)}
              style={{
                flex: 1,
                padding: "6px 0",
                borderRadius: theme.radius.pill,
                border: "none",
                background:
                  chartType === ct ? theme.colors.accent : "transparent",
                color: chartType === ct ? "#fff" : theme.colors.textMuted,
                fontWeight: 600,
                fontSize: theme.font.sm,
                cursor: "pointer",
                transition: `all ${theme.anim.fast} ease`,
              }}
            >
              {ct.charAt(0).toUpperCase() + ct.slice(1)}
            </button>
          ))}
        </div>
        <button
          type="button"
          data-ocid="graphs.compare.toggle"
          onClick={() => setCompare(!compare)}
          style={{
            padding: "6px 14px",
            borderRadius: theme.radius.pill,
            border: `1px solid ${compare ? theme.colors.teal : theme.colors.border}`,
            background: compare
              ? `${theme.colors.teal}20`
              : theme.colors.surface,
            color: compare ? theme.colors.teal : theme.colors.textMuted,
            fontWeight: 600,
            fontSize: theme.font.sm,
            cursor: "pointer",
          }}
        >
          Compare
        </button>
      </div>

      {/* Chart */}
      <div
        style={{
          background: theme.colors.surface,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.lg,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        {compare ? (
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
              <ChartComponent
                dataPoints={timeWasteData}
                color={theme.colors.orange}
                width={chartWidth}
                height={220}
              />
            </div>
            <ChartComponent
              dataPoints={productiveData}
              color={theme.colors.teal}
              width={chartWidth}
              height={220}
            />
            <div
              style={{
                display: "flex",
                gap: theme.spacing.md,
                marginTop: theme.spacing.sm,
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  color: theme.colors.teal,
                  fontSize: theme.font.sm,
                  fontWeight: 600,
                }}
              >
                ● Productive
              </span>
              <span
                style={{
                  color: theme.colors.orange,
                  fontSize: theme.font.sm,
                  fontWeight: 600,
                }}
              >
                ● Time-Waste
              </span>
            </div>
          </div>
        ) : (
          <ChartComponent
            dataPoints={mainData}
            color={theme.colors.accent}
            width={chartWidth}
            height={220}
          />
        )}
      </div>
    </div>
  );
}
