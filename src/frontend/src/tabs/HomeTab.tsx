import React from "react";
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

function SparkChart({ data, color }: { data: number[]; color: string }) {
  const w = 120;
  const h = 40;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - (v / max) * (h - 4),
  }));

  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cp1x = pts[i - 1].x + (pts[i].x - pts[i - 1].x) / 2;
    const cp2x = pts[i - 1].x + (pts[i].x - pts[i - 1].x) / 2;
    d += ` C ${cp1x} ${pts[i - 1].y}, ${cp2x} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
  }

  const fillD = `${d} L ${pts[pts.length - 1].x} ${h} L ${pts[0].x} ${h} Z`;

  return (
    <svg aria-hidden="true" width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id={`sg-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#sg-${color.slice(1)})`} />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CategoryCard({
  parentId,
  color,
}: { parentId: "productive" | "time-waste"; color: string }) {
  const { state } = useStore();
  const cats = state.categories.filter((c) => c.parentId === parentId);
  const now = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const dailyTotals = days.map((day) =>
    state.logs
      .filter(
        (l) =>
          l.date.slice(0, 10) === day &&
          cats.some((c) => c.id === l.categoryId),
      )
      .reduce((s, l) => s + l.value, 0),
  );

  const total7d = dailyTotals.reduce((s, v) => s + v, 0);
  const label = parentId === "productive" ? "Productive" : "Time-Waste";

  return (
    <div
      style={{
        flex: 1,
        background: theme.colors.surface,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      <div
        style={{
          fontSize: theme.font.sm,
          color: theme.colors.textMuted,
          marginBottom: theme.spacing.xs,
          fontWeight: 600,
        }}
      >
        <span style={{ color }}>#</span> {label}
      </div>
      <div
        style={{
          fontSize: theme.font.xl,
          fontWeight: 700,
          color: theme.colors.text,
          marginBottom: theme.spacing.sm,
        }}
      >
        {total7d.toFixed(1)}
        <span
          style={{
            fontSize: theme.font.sm,
            color: theme.colors.textMuted,
            marginLeft: "4px",
          }}
        >
          7d
        </span>
      </div>
      <SparkChart data={dailyTotals} color={color} />
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function HomeTab() {
  const { state } = useStore();
  const recent = state.logs.slice(0, 5);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getCategory = (id: string) => state.categories.find((c) => c.id === id);

  return (
    <div style={{ padding: theme.spacing.lg, paddingBottom: "100px" }}>
      <div style={{ marginBottom: theme.spacing.lg }}>
        <div
          style={{
            fontSize: theme.font.xl,
            fontWeight: 700,
            color: theme.colors.text,
          }}
        >
          {getGreeting()}
        </div>
        <div
          style={{
            fontSize: theme.font.sm,
            color: theme.colors.textMuted,
            marginTop: theme.spacing.xs,
          }}
        >
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      <SectionHeader title="Last 7 Days" />
      <div
        style={{
          display: "flex",
          gap: theme.spacing.md,
          marginBottom: theme.spacing.xl,
        }}
      >
        <CategoryCard parentId="productive" color={theme.colors.teal} />
        <CategoryCard parentId="time-waste" color={theme.colors.orange} />
      </div>

      <SectionHeader title="Recent Logs" />
      {recent.length === 0 ? (
        <div
          data-ocid="home.empty_state"
          style={{
            color: theme.colors.textDim,
            textAlign: "center",
            padding: theme.spacing.xl,
            fontSize: theme.font.md,
          }}
        >
          No logs yet. Start tracking in the Log tab!
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing.sm,
          }}
        >
          {recent.map((log, i) => {
            const cat = getCategory(log.categoryId);
            const isProductive = cat?.parentId === "productive";
            return (
              <div
                key={log.id}
                data-ocid={`home.item.${i + 1}`}
                style={{
                  background: theme.colors.surface,
                  borderRadius: theme.radius.md,
                  padding: theme.spacing.md,
                  border: `1px solid ${theme.colors.border}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      color: theme.colors.text,
                      fontSize: theme.font.md,
                    }}
                  >
                    {cat?.name ?? log.categoryId}
                  </div>
                  <div
                    style={{
                      fontSize: theme.font.sm,
                      color: theme.colors.textDim,
                      marginTop: "2px",
                    }}
                  >
                    {formatDate(log.date)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontWeight: 700,
                      color: isProductive
                        ? theme.colors.teal
                        : theme.colors.orange,
                      fontSize: theme.font.lg,
                    }}
                  >
                    {log.unit === "time" ? `${log.value}h` : log.value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
