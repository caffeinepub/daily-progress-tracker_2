import React, { useState, useRef, useEffect } from "react";
import { CustomSlider } from "../components/CustomSlider";
import { type SubCategory, useStore } from "../store";
import { theme } from "../theme";

const OVER_LIMIT_COLOR = "#b91c1c";
const OVER_LIMIT_TEXT = "#fca5a5";

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

function UnitToggle({
  unit,
  onChange,
}: { unit: "time" | "number"; onChange: (u: "time" | "number") => void }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "4px",
        background: theme.colors.border,
        borderRadius: theme.radius.pill,
        padding: "3px",
      }}
    >
      {(["time", "number"] as const).map((u) => (
        <button
          type="button"
          key={u}
          onClick={() => onChange(u)}
          style={{
            padding: "4px 10px",
            borderRadius: theme.radius.pill,
            border: "none",
            background: unit === u ? theme.colors.accent : "transparent",
            color: unit === u ? "#fff" : theme.colors.textMuted,
            fontSize: theme.font.xs,
            fontWeight: 600,
            cursor: "pointer",
            transition: `all ${theme.anim.fast} ease`,
          }}
        >
          {u === "time" ? "Time" : "Number"}
        </button>
      ))}
    </div>
  );
}

interface LogFieldProps {
  cat: SubCategory;
  value: number;
  unit: "time" | "number";
  onValueChange: (v: number) => void;
  onUnitChange: (u: "time" | "number") => void;
}

function LogField({
  cat,
  value,
  unit,
  onValueChange,
  onUnitChange,
}: LogFieldProps) {
  const isOverLimit = value > cat.maxSliderValue;
  return (
    <div style={{ marginBottom: theme.spacing.md }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: theme.spacing.sm,
        }}
      >
        <span
          style={{
            fontWeight: 600,
            color: theme.colors.text,
            fontSize: theme.font.md,
          }}
        >
          {cat.name}
        </span>
        <UnitToggle unit={unit} onChange={onUnitChange} />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.sm,
        }}
      >
        <input
          type="number"
          min={0}
          step={unit === "time" ? 0.25 : 1}
          value={value}
          onChange={(e) => {
            const raw = Number.parseFloat(e.target.value) || 0;
            onValueChange(raw);
          }}
          data-ocid="log.input"
          style={{
            width: "80px",
            background: theme.colors.border,
            border: `1px solid ${isOverLimit ? OVER_LIMIT_COLOR : theme.colors.border}`,
            borderRadius: theme.radius.sm,
            padding: "8px 10px",
            color: isOverLimit ? OVER_LIMIT_TEXT : theme.colors.text,
            fontSize: theme.font.md,
            fontWeight: 600,
            outline: "none",
            textAlign: "center",
            transition: "border 0.2s ease, color 0.2s ease",
          }}
        />
        <span
          style={{ color: theme.colors.textMuted, fontSize: theme.font.sm }}
        >
          {unit === "time" ? "hours" : "count"}
        </span>
      </div>
      <CustomSlider
        value={value}
        max={cat.maxSliderValue}
        onChange={onValueChange}
        unit={unit}
      />
    </div>
  );
}

interface ConfirmBarProps {
  onUndo: () => void;
  onExpire: () => void;
}

function ConfirmBar({ onUndo, onExpire }: ConfirmBarProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    timerRef.current = setTimeout(onExpire, 5000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onExpire]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "80px",
        left: theme.spacing.md,
        right: theme.spacing.md,
        background: theme.colors.surface,
        borderRadius: theme.radius.pill,
        border: `1px solid ${theme.colors.success}40`,
        overflow: "hidden",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          background: `${theme.colors.success}20`,
          borderRadius: theme.radius.pill,
          animation: "shrink5s 5s linear forwards",
          width: "100%",
        }}
      />
      <style>
        {"@keyframes shrink5s { from { width: 100%; } to { width: 0%; } }"}
      </style>
      <div
        style={{
          flex: 1,
          padding: "12px 16px",
          color: theme.colors.text,
          fontWeight: 500,
          fontSize: theme.font.sm,
          position: "relative",
          zIndex: 1,
        }}
      >
        ✓ Log saved
      </div>
      <button
        type="button"
        data-ocid="log.cancel_button"
        onClick={onUndo}
        style={{
          padding: "10px 16px",
          background: "none",
          border: "none",
          color: theme.colors.accent,
          fontWeight: 700,
          fontSize: theme.font.sm,
          cursor: "pointer",
          position: "relative",
          zIndex: 1,
        }}
      >
        Undo
      </button>
    </div>
  );
}

const QuickLogIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <title>Quick Log</title>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const FullLogIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <title>Full Log</title>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

export function LogTab() {
  const { state, dispatch } = useStore();
  const [mode, setMode] = useState<"single" | "multi">("single");
  const [selectedCatId, setSelectedCatId] = useState<string>(
    state.categories[0]?.id ?? "",
  );
  const [values, setValues] = useState<Record<string, number>>({});
  const [units, setUnits] = useState<Record<string, "time" | "number">>({});
  // Shared temp value/unit for single (quick log) mode
  const [tempValue, setTempValue] = useState(0);
  const [tempUnit, setTempUnit] = useState<"time" | "number">("time");
  const [logDate, setLogDate] = useState("");
  const [duration, setDuration] = useState("");
  const [showOptional, setShowOptional] = useState(false);
  const [lastLogId, setLastLogId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const getUnit = (cat: SubCategory) => units[cat.id] ?? cat.defaultUnit;
  const getValue = (cat: SubCategory) => values[cat.id] ?? 0;

  const setFieldValue = (catId: string, v: number) =>
    setValues((prev) => ({ ...prev, [catId]: v }));
  const setFieldUnit = (catId: string, u: "time" | "number") =>
    setUnits((prev) => ({ ...prev, [catId]: u }));

  const submitLog = (catIds: string[]) => {
    const now = new Date();
    const dateStr = logDate || now.toISOString();
    const dur = Number.parseFloat(duration) || undefined;
    const ids: string[] = [];
    const submittedCatIds: string[] = [];

    if (mode === "single") {
      // Single mode: use shared tempValue/tempUnit
      const catId = catIds[0];
      const cat = state.categories.find((c) => c.id === catId);
      if (!cat || tempValue <= 0) return;
      const id = `log-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      ids.push(id);
      submittedCatIds.push(catId);
      dispatch({
        type: "ADD_LOG",
        payload: {
          id,
          categoryId: catId,
          value: tempValue,
          unit: tempUnit,
          date: dateStr,
          duration: dur,
          createdAt: now.toISOString(),
        },
      });
      if (ids.length > 0) {
        setLastLogId(ids[0]);
        setShowConfirm(true);
        setTempValue(0);
        setTempUnit("time");
      }
    } else {
      // Multi mode: use per-category values/units
      for (const catId of catIds) {
        const cat = state.categories.find((c) => c.id === catId);
        if (!cat) continue;
        const value = getValue(cat);
        if (value <= 0) continue;
        const id = `log-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        ids.push(id);
        submittedCatIds.push(catId);
        dispatch({
          type: "ADD_LOG",
          payload: {
            id,
            categoryId: catId,
            value,
            unit: getUnit(cat),
            date: dateStr,
            duration: dur,
            createdAt: now.toISOString(),
          },
        });
      }
      if (ids.length > 0) {
        setLastLogId(ids[ids.length - 1]);
        setShowConfirm(true);
        setValues((prev) => {
          const next = { ...prev };
          for (const catId of submittedCatIds) delete next[catId];
          return next;
        });
        setUnits((prev) => {
          const next = { ...prev };
          for (const catId of submittedCatIds) delete next[catId];
          return next;
        });
      }
    }
  };

  const handleUndo = () => {
    if (lastLogId) dispatch({ type: "REMOVE_LOG", payload: lastLogId });
    setShowConfirm(false);
  };

  const productive = state.categories.filter(
    (c) => c.parentId === "productive",
  );
  const timeWaste = state.categories.filter((c) => c.parentId === "time-waste");
  const selectedCat = state.categories.find((c) => c.id === selectedCatId);

  const modeConfig = [
    { id: "single" as const, label: "Quick Log", Icon: QuickLogIcon },
    { id: "multi" as const, label: "Full Log", Icon: FullLogIcon },
  ];

  return (
    <div style={{ padding: theme.spacing.lg, paddingBottom: "120px" }}>
      {/* Mode toggle */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: theme.spacing.lg,
        }}
      >
        <div
          style={{
            display: "flex",
            background: theme.colors.border,
            borderRadius: theme.radius.pill,
            padding: "4px",
          }}
        >
          {modeConfig.map(({ id, label, Icon }) => {
            const isActive = mode === id;
            return (
              <button
                type="button"
                key={id}
                data-ocid={`log.${id}.tab`}
                onClick={() => setMode(id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: theme.radius.pill,
                  border: "none",
                  background: isActive ? theme.colors.accent : "transparent",
                  color: isActive ? "#fff" : theme.colors.textMuted,
                  fontWeight: 600,
                  fontSize: theme.font.md,
                  cursor: "pointer",
                  transition: `all ${theme.anim.normal} ease`,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  overflow: "hidden",
                }}
              >
                <Icon />
                <span
                  style={{
                    opacity: isActive ? 1 : 0,
                    maxWidth: isActive ? "100px" : "0px",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    transition: `opacity ${theme.anim.normal} ease, max-width ${theme.anim.normal} ease`,
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {mode === "single" ? (
        <>
          <SectionHeader title="Select Category" />
          <div style={{ marginBottom: theme.spacing.md }}>
            <div
              style={{
                fontSize: theme.font.sm,
                color: theme.colors.teal,
                fontWeight: 600,
                marginBottom: theme.spacing.sm,
              }}
            >
              Productive
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: theme.spacing.sm,
              }}
            >
              {productive.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: theme.radius.pill,
                    border: `1px solid ${selectedCatId === cat.id ? theme.colors.teal : theme.colors.border}`,
                    background:
                      selectedCatId === cat.id
                        ? `${theme.colors.teal}20`
                        : theme.colors.surface,
                    color:
                      selectedCatId === cat.id
                        ? theme.colors.teal
                        : theme.colors.textMuted,
                    fontWeight: 600,
                    fontSize: theme.font.sm,
                    cursor: "pointer",
                    transition: `all ${theme.anim.fast} ease`,
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: theme.spacing.lg }}>
            <div
              style={{
                fontSize: theme.font.sm,
                color: theme.colors.orange,
                fontWeight: 600,
                marginBottom: theme.spacing.sm,
              }}
            >
              Time-Waste
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: theme.spacing.sm,
              }}
            >
              {timeWaste.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: theme.radius.pill,
                    border: `1px solid ${selectedCatId === cat.id ? theme.colors.orange : theme.colors.border}`,
                    background:
                      selectedCatId === cat.id
                        ? `${theme.colors.orange}20`
                        : theme.colors.surface,
                    color:
                      selectedCatId === cat.id
                        ? theme.colors.orange
                        : theme.colors.textMuted,
                    fontWeight: 600,
                    fontSize: theme.font.sm,
                    cursor: "pointer",
                    transition: `all ${theme.anim.fast} ease`,
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {selectedCat && (
            <div
              style={{
                background: theme.colors.surface,
                borderRadius: theme.radius.lg,
                padding: theme.spacing.lg,
                border: `1px solid ${theme.colors.border}`,
              }}
            >
              <LogField
                cat={selectedCat}
                value={tempValue}
                unit={tempUnit}
                onValueChange={setTempValue}
                onUnitChange={setTempUnit}
              />

              <button
                type="button"
                onClick={() => setShowOptional(!showOptional)}
                style={{
                  background: "none",
                  border: "none",
                  color: theme.colors.textMuted,
                  cursor: "pointer",
                  fontSize: theme.font.sm,
                  fontWeight: 600,
                  marginBottom: theme.spacing.md,
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span
                  style={{
                    transform: showOptional ? "rotate(90deg)" : "rotate(0deg)",
                    transition: `transform ${theme.anim.fast} ease`,
                    display: "inline-block",
                  }}
                >
                  ▶
                </span>
                Optional fields
              </button>

              {showOptional && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: theme.spacing.md,
                    marginBottom: theme.spacing.md,
                  }}
                >
                  <div>
                    <label
                      htmlFor="log-datetime"
                      style={{
                        fontSize: theme.font.sm,
                        color: theme.colors.textMuted,
                        display: "block",
                        marginBottom: "6px",
                      }}
                    >
                      Date &amp; Time
                    </label>
                    <input
                      id="log-datetime"
                      type="datetime-local"
                      value={logDate}
                      onChange={(e) => setLogDate(e.target.value)}
                      data-ocid="log.input"
                      style={{
                        background: theme.colors.border,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: theme.radius.sm,
                        padding: "8px 12px",
                        color: theme.colors.text,
                        fontSize: theme.font.sm,
                        width: "100%",
                        boxSizing: "border-box",
                        outline: "none",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="log-duration"
                      style={{
                        fontSize: theme.font.sm,
                        color: theme.colors.textMuted,
                        display: "block",
                        marginBottom: "6px",
                      }}
                    >
                      Session Duration (hours)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={0.25}
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      id="log-duration"
                      placeholder="e.g. 1.5"
                      data-ocid="log.input"
                      style={{
                        background: theme.colors.border,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: theme.radius.sm,
                        padding: "8px 12px",
                        color: theme.colors.text,
                        fontSize: theme.font.sm,
                        width: "100%",
                        boxSizing: "border-box",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>
              )}

              <button
                type="button"
                data-ocid="log.submit_button"
                onClick={() => submitLog([selectedCat.id])}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: theme.radius.pill,
                  border: "none",
                  background: theme.colors.accent,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: theme.font.md,
                  cursor: "pointer",
                  transition: `background ${theme.anim.fast} ease`,
                }}
              >
                Save Log
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <div
            style={{
              background: theme.colors.surface,
              borderRadius: theme.radius.lg,
              padding: theme.spacing.lg,
              border: `1px solid ${theme.colors.border}`,
              marginBottom: theme.spacing.md,
            }}
          >
            <SectionHeader title="Productive" />
            {productive.map((cat) => (
              <LogField
                key={cat.id}
                cat={cat}
                value={getValue(cat)}
                unit={getUnit(cat)}
                onValueChange={(v) => setFieldValue(cat.id, v)}
                onUnitChange={(u) => setFieldUnit(cat.id, u)}
              />
            ))}
          </div>
          <div
            style={{
              background: theme.colors.surface,
              borderRadius: theme.radius.lg,
              padding: theme.spacing.lg,
              border: `1px solid ${theme.colors.border}`,
              marginBottom: theme.spacing.lg,
            }}
          >
            <SectionHeader title="Time-Waste" />
            {timeWaste.map((cat) => (
              <LogField
                key={cat.id}
                cat={cat}
                value={getValue(cat)}
                unit={getUnit(cat)}
                onValueChange={(v) => setFieldValue(cat.id, v)}
                onUnitChange={(u) => setFieldUnit(cat.id, u)}
              />
            ))}
          </div>
          <button
            type="button"
            data-ocid="log.submit_button"
            onClick={() => submitLog(state.categories.map((c) => c.id))}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: theme.radius.pill,
              border: "none",
              background: theme.colors.accent,
              color: "#fff",
              fontWeight: 700,
              fontSize: theme.font.md,
              cursor: "pointer",
            }}
          >
            Save All Logs
          </button>
        </>
      )}

      {showConfirm && (
        <ConfirmBar
          onUndo={handleUndo}
          onExpire={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
