import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { theme } from "../theme";

interface Props {
  value: number;
  max: number;
  onChange: (v: number) => void;
  unit: "time" | "number";
}

const OVER_LIMIT_COLOR = "#b91c1c";

export function CustomSlider({ value, max, onChange, unit }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [bouncing, setBouncing] = useState(false);
  const bounceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const prevValueRef = useRef(value);

  const isOverLimit = value > max;
  const activeColor = isOverLimit ? OVER_LIMIT_COLOR : theme.colors.accent;

  const triggerBounce = useCallback(() => {
    setBouncing(false);
    requestAnimationFrame(() => {
      setBouncing(true);
      clearTimeout(bounceTimerRef.current);
      bounceTimerRef.current = setTimeout(() => setBouncing(false), 500);
    });
  }, []);

  useEffect(() => {
    if (dragging) {
      prevValueRef.current = value;
      return;
    }
    if (value === prevValueRef.current) return;
    prevValueRef.current = value;
    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      triggerBounce();
    }, 250);
    return () => clearTimeout(debounceTimerRef.current);
  }, [value, dragging, triggerBounce]);

  const getValueFromEvent = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return 0;
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width),
      );
      return Number.parseFloat((ratio * max).toFixed(2));
    },
    [max],
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    trackRef.current?.setPointerCapture(e.pointerId);
    setDragging(true);
    onChange(getValueFromEvent(e.clientX));
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    onChange(getValueFromEvent(e.clientX));
  };

  const handlePointerUp = () => {
    setDragging(false);
    triggerBounce();
  };

  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const displayValue =
    unit === "time" ? `${value.toFixed(1)}h` : value.toFixed(1);
  const maxDisplay = unit === "time" ? `${max}h` : `${max}`;

  const thumbScale = dragging ? 1.2 : bouncing ? 1.35 : 1;
  const thumbSize = 22;

  const thumbTransition = dragging
    ? "left 0s, top 0s, transform 0.18s ease, box-shadow 0.18s ease, background 0.2s ease"
    : bouncing
      ? "left 0.35s cubic-bezier(0.25, 0.1, 0.25, 1), transform 0.45s cubic-bezier(0.34, 1.72, 0.64, 1), box-shadow 0.3s ease, background 0.2s ease"
      : "left 0.35s cubic-bezier(0.25, 0.1, 0.25, 1), transform 0.2s ease, box-shadow 0.3s ease, background 0.2s ease";

  return (
    <div style={{ position: "relative", padding: "14px 0" }}>
      {isOverLimit && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "-2px",
            color: OVER_LIMIT_COLOR,
            fontSize: theme.font.xs,
            fontWeight: 700,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {displayValue} / {maxDisplay}
        </div>
      )}
      {dragging && (
        <div
          style={{
            position: "absolute",
            left: `calc(${pct}% - 20px)`,
            top: "-4px",
            background: activeColor,
            color: "#fff",
            borderRadius: theme.radius.sm,
            padding: "2px 6px",
            fontSize: theme.font.xs,
            fontWeight: 600,
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 10,
            transition: "background 0.2s ease",
          }}
        >
          {displayValue}
        </div>
      )}
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: "relative",
          height: "10px",
          borderRadius: theme.radius.pill,
          background: theme.colors.border,
          cursor: "pointer",
          touchAction: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            width: `${pct}%`,
            borderRadius: theme.radius.pill,
            background: activeColor,
            transition: dragging
              ? "none"
              : "width 0.35s cubic-bezier(0.25, 0.1, 0.25, 1), background 0.2s ease",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: `${pct}%`,
            width: `${thumbSize}px`,
            height: `${thumbSize}px`,
            borderRadius: "50%",
            background: activeColor,
            boxShadow:
              dragging || bouncing
                ? `0 0 14px ${activeColor}90`
                : `0 2px 6px ${activeColor}50`,
            pointerEvents: "none",
            transition: thumbTransition,
            transform: `translate(-50%, -50%) scale(${thumbScale})`,
          }}
        />
      </div>
    </div>
  );
}
