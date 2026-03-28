import type React from "react";
import { useRef, useState } from "react";
import { theme } from "../theme";

export type TabId = "home" | "log" | "graphs" | "history" | "settings";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

interface Props {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  layout: "bottom" | "side";
  tabOrder: string[];
  hiddenTabs: string[];
}

function HomeIcon() {
  return (
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function LogIcon() {
  return (
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}
function GraphsIcon() {
  return (
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
function HistoryIcon() {
  return (
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
    </svg>
  );
}

const ALL_TABS: Tab[] = [
  { id: "home", label: "Home", icon: <HomeIcon /> },
  { id: "log", label: "Log", icon: <LogIcon /> },
  { id: "graphs", label: "Graphs", icon: <GraphsIcon /> },
  { id: "history", label: "History", icon: <HistoryIcon /> },
  { id: "settings", label: "Settings", icon: <SettingsIcon /> },
];

export function TabBar({
  activeTab,
  onTabChange,
  layout,
  tabOrder,
  hiddenTabs,
}: Props) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const orderedTabs = tabOrder
    .map((id) => ALL_TABS.find((t) => t.id === id))
    .filter((t): t is Tab => !!t && !hiddenTabs.includes(t.id));

  const getScale = (idx: number) => {
    if (hoveredIdx === null) return 1;
    const diff = Math.abs(idx - hoveredIdx);
    if (diff === 0) return 1.3;
    if (diff === 1) return 1.15;
    return 1;
  };

  const getTabIdxAtPoint = (
    clientX: number,
    clientY: number,
  ): number | null => {
    for (let i = 0; i < buttonRefs.current.length; i++) {
      const btn = buttonRefs.current[i];
      if (!btn) continue;
      const rect = btn.getBoundingClientRect();
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        return i;
      }
    }
    for (let i = 0; i < buttonRefs.current.length; i++) {
      const btn = buttonRefs.current[i];
      if (!btn) continue;
      const rect = btn.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right) {
        return i;
      }
    }
    return null;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const idx = getTabIdxAtPoint(touch.clientX, touch.clientY);
    if (idx !== null) setHoveredIdx(idx);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const idx = getTabIdxAtPoint(touch.clientX, touch.clientY);
    if (idx !== null) {
      setHoveredIdx(idx);
      const tab = orderedTabs[idx];
      if (tab && tab.id !== activeTab) {
        onTabChange(tab.id as TabId);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const idx = getTabIdxAtPoint(touch.clientX, touch.clientY);
    if (idx !== null) {
      const tab = orderedTabs[idx];
      if (tab) onTabChange(tab.id as TabId);
    }
    setHoveredIdx(null);
  };

  if (layout === "side") {
    return (
      <div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          height: "100dvh",
          width: "72px",
          background: theme.colors.surface,
          borderRight: `1px solid ${theme.colors.border}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: `calc(${theme.spacing.xl} + env(safe-area-inset-top))`,
          paddingBottom: `calc(${theme.spacing.xl} + env(safe-area-inset-bottom))`,
          gap: theme.spacing.md,
          zIndex: 100,
        }}
      >
        {orderedTabs.map((tab, idx) => {
          const isActive = tab.id === activeTab;
          const isHovered = hoveredIdx === idx;
          return (
            <button
              type="button"
              key={tab.id}
              data-ocid={`nav.${tab.id}.link`}
              ref={(el) => {
                buttonRefs.current[idx] = el;
              }}
              onClick={() => onTabChange(tab.id as TabId)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: isActive ? theme.colors.accent : theme.colors.textDim,
                transform: `scale(${getScale(idx)})`,
                transition: `transform ${theme.anim.fast} ease, color ${theme.anim.fast} ease`,
                padding: theme.spacing.sm,
                borderRadius: theme.radius.md,
              }}
            >
              {tab.icon}
              <span
                style={{
                  fontSize: theme.font.xs,
                  opacity: isActive || isHovered ? 1 : 0,
                  transition: `opacity ${theme.anim.normal} ease`,
                  fontWeight: 600,
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: "calc(8px + env(safe-area-inset-bottom))",
        paddingTop: "8px",
        paddingLeft: "16px",
        paddingRight: "16px",
        background: `${theme.colors.bg}CC`,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: `1px solid ${theme.colors.border}`,
        zIndex: 100,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          display: "flex",
          alignItems: "center",
          gap: theme.spacing.xs,
          background: theme.colors.surface,
          borderRadius: theme.radius.pill,
          padding: "6px 16px",
          border: `1px solid ${theme.colors.border}`,
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          touchAction: "none",
        }}
      >
        {orderedTabs.map((tab, idx) => {
          const isActive = tab.id === activeTab;
          const isHovered = hoveredIdx === idx;
          return (
            <button
              type="button"
              key={tab.id}
              data-ocid={`nav.${tab.id}.link`}
              ref={(el) => {
                buttonRefs.current[idx] = el;
              }}
              onClick={() => onTabChange(tab.id as TabId)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: isActive ? theme.colors.accent : theme.colors.textDim,
                transform: `scale(${getScale(idx)})`,
                transition: `transform ${theme.anim.fast} cubic-bezier(0.34, 1.56, 0.64, 1), color ${theme.anim.fast} ease`,
                padding: "6px 12px",
                borderRadius: theme.radius.md,
                minWidth: "52px",
                pointerEvents: "none",
              }}
            >
              {tab.icon}
              <span
                style={{
                  fontSize: theme.font.xs,
                  fontWeight: 600,
                  opacity: isActive || isHovered ? 1 : 0,
                  maxHeight: isActive || isHovered ? "16px" : "0px",
                  overflow: "hidden",
                  transition: `opacity ${theme.anim.normal} ease, max-height ${theme.anim.normal} ease`,
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
