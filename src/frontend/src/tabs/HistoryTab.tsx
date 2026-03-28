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

export function HistoryTab() {
  const { state } = useStore();
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = state.logs.filter((log) => {
    const cat = state.categories.find((c) => c.id === log.categoryId);
    const matchSearch =
      search.trim() === "" ||
      cat?.name.toLowerCase().includes(search.toLowerCase());
    const matchCat =
      catFilter === "all" ||
      log.categoryId === catFilter ||
      (catFilter === "productive" && cat?.parentId === "productive") ||
      (catFilter === "time-waste" && cat?.parentId === "time-waste");
    return matchSearch && matchCat;
  });

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div style={{ padding: theme.spacing.lg, paddingBottom: "100px" }}>
      <SectionHeader title="History" />

      <input
        type="text"
        placeholder="Search logs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        data-ocid="history.search_input"
        style={{
          width: "100%",
          boxSizing: "border-box",
          background: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.md,
          padding: "12px 16px",
          color: theme.colors.text,
          fontSize: theme.font.md,
          outline: "none",
          marginBottom: theme.spacing.md,
        }}
      />

      {/* Category filter */}
      <div
        style={{
          display: "flex",
          gap: theme.spacing.sm,
          overflowX: "auto",
          marginBottom: theme.spacing.lg,
          paddingBottom: "4px",
        }}
      >
        {[
          { id: "all", label: "All" },
          { id: "productive", label: "Productive" },
          { id: "time-waste", label: "Time-Waste" },
          ...state.categories.map((c) => ({ id: c.id, label: c.name })),
        ].map((opt) => (
          <button
            type="button"
            key={opt.id}
            data-ocid="history.filter.tab"
            onClick={() => setCatFilter(opt.id)}
            style={{
              padding: "6px 12px",
              borderRadius: theme.radius.pill,
              border: `1px solid ${catFilter === opt.id ? theme.colors.accent : theme.colors.border}`,
              background:
                catFilter === opt.id
                  ? `${theme.colors.accent}20`
                  : theme.colors.surface,
              color:
                catFilter === opt.id
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

      {filtered.length === 0 ? (
        <div
          data-ocid="history.empty_state"
          style={{
            textAlign: "center",
            padding: theme.spacing.xl,
            color: theme.colors.textDim,
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: theme.spacing.md }}>
            🕐
          </div>
          <div
            style={{
              fontSize: theme.font.md,
              fontWeight: 600,
              marginBottom: theme.spacing.sm,
            }}
          >
            No entries found
          </div>
          <div style={{ fontSize: theme.font.sm }}>
            {state.logs.length === 0
              ? "Start logging to see your history here"
              : "No logs match your current filter"}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing.sm,
          }}
        >
          {filtered.map((log, i) => {
            const cat = state.categories.find((c) => c.id === log.categoryId);
            const isExpanded = expanded === log.id;
            const isProductive = cat?.parentId === "productive";
            const color = isProductive
              ? theme.colors.teal
              : theme.colors.orange;
            return (
              <div
                key={log.id}
                data-ocid={`history.item.${i + 1}`}
                onClick={() => setExpanded(isExpanded ? null : log.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    setExpanded(isExpanded ? null : log.id);
                }}
                style={{
                  background: theme.colors.surface,
                  borderRadius: theme.radius.md,
                  padding: theme.spacing.md,
                  border: `1px solid ${isExpanded ? theme.colors.accent : theme.colors.border}`,
                  cursor: "pointer",
                  transition: `border-color ${theme.anim.fast} ease`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontWeight: 700,
                        color: theme.colors.text,
                        fontSize: theme.font.md,
                      }}
                    >
                      {cat?.name ?? log.categoryId}
                    </span>
                    <span
                      style={{
                        marginLeft: theme.spacing.sm,
                        fontSize: theme.font.xs,
                        color,
                        fontWeight: 600,
                        background: `${color}20`,
                        padding: "2px 8px",
                        borderRadius: theme.radius.pill,
                      }}
                    >
                      {isProductive ? "Productive" : "Time-Waste"}
                    </span>
                  </div>
                  <div
                    style={{ fontWeight: 700, color, fontSize: theme.font.lg }}
                  >
                    {log.unit === "time" ? `${log.value}h` : log.value}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: theme.font.sm,
                    color: theme.colors.textDim,
                    marginTop: "4px",
                  }}
                >
                  {formatDate(log.date)}
                </div>
                {isExpanded && (
                  <div
                    style={{
                      marginTop: theme.spacing.md,
                      paddingTop: theme.spacing.md,
                      borderTop: `1px solid ${theme.colors.border}`,
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: theme.font.sm,
                        color: theme.colors.textMuted,
                      }}
                    >
                      <strong style={{ color: theme.colors.text }}>
                        Category:
                      </strong>{" "}
                      {cat?.name} ({isProductive ? "Productive" : "Time-Waste"})
                    </div>
                    <div
                      style={{
                        fontSize: theme.font.sm,
                        color: theme.colors.textMuted,
                      }}
                    >
                      <strong style={{ color: theme.colors.text }}>
                        Value:
                      </strong>{" "}
                      {log.unit === "time"
                        ? `${log.value} hours`
                        : `${log.value}`}
                    </div>
                    <div
                      style={{
                        fontSize: theme.font.sm,
                        color: theme.colors.textMuted,
                      }}
                    >
                      <strong style={{ color: theme.colors.text }}>
                        Unit:
                      </strong>{" "}
                      {log.unit}
                    </div>
                    {log.duration && (
                      <div
                        style={{
                          fontSize: theme.font.sm,
                          color: theme.colors.textMuted,
                        }}
                      >
                        <strong style={{ color: theme.colors.text }}>
                          Duration:
                        </strong>{" "}
                        {log.duration}h
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: theme.font.sm,
                        color: theme.colors.textMuted,
                      }}
                    >
                      <strong style={{ color: theme.colors.text }}>
                        Logged at:
                      </strong>{" "}
                      {formatDate(log.createdAt)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
