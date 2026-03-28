import type React from "react";
import { useEffect, useState } from "react";
import { TabBar, type TabId } from "./components/TabBar";
import { StoreProvider, useStore } from "./store";
import { GraphsTab } from "./tabs/GraphsTab";
import { HistoryTab } from "./tabs/HistoryTab";
import { HomeTab } from "./tabs/HomeTab";
import { LogTab } from "./tabs/LogTab";
import { SettingsTab } from "./tabs/SettingsTab";
import { theme } from "./theme";

function useServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {
          // SW registration failed silently — non-critical
        });
      });
    }
  }, []);
}

function AppInner() {
  const { state } = useStore();
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [displayTab, setDisplayTab] = useState<TabId>("home");
  const [opacity, setOpacity] = useState(1);

  const fps = state.settings.fps ?? 60;

  useServiceWorker();

  useEffect(() => {
    document.documentElement.setAttribute("data-fps", String(fps));
  }, [fps]);

  const handleTabChange = (tab: TabId) => {
    if (tab === activeTab) return;
    if (fps === 30) {
      setActiveTab(tab);
      setDisplayTab(tab);
      return;
    }
    setOpacity(0);
    setTimeout(() => {
      setActiveTab(tab);
      setDisplayTab(tab);
      setOpacity(1);
    }, 150);
  };

  const isSide = state.settings.navLayout === "side";

  const tabContent: Record<TabId, React.ReactNode> = {
    home: <HomeTab />,
    log: <LogTab />,
    graphs: <GraphsTab />,
    history: <HistoryTab />,
    settings: <SettingsTab />,
  };

  return (
    <div
      data-fps={fps}
      style={{
        background: theme.colors.bg,
        minHeight: "100dvh",
        color: theme.colors.text,
        fontFamily:
          "system-ui, -apple-system, 'SF Pro Display', Inter, sans-serif",
        display: "flex",
        flexDirection: isSide ? "row" : "column",
      }}
    >
      {isSide && (
        <TabBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          layout="side"
          tabOrder={state.settings.tabOrder}
          hiddenTabs={state.settings.hiddenTabs}
          fps={fps}
        />
      )}
      <div
        style={{
          flex: 1,
          marginLeft: isSide ? "72px" : "0",
          opacity,
          transition: fps === 60 ? `opacity ${theme.anim.normal} ease` : "none",
          maxWidth: "600px",
          margin: isSide ? "0 auto 0 72px" : "0 auto",
          width: "100%",
          paddingTop: isSide ? 0 : 0,
          /* Extra bottom padding so content isn't hidden behind the dock */
          paddingBottom: isSide
            ? 0
            : "calc(90px + env(safe-area-inset-bottom))",
        }}
      >
        {tabContent[displayTab]}
      </div>
      {!isSide && (
        <TabBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          layout="bottom"
          tabOrder={state.settings.tabOrder}
          hiddenTabs={state.settings.hiddenTabs}
          fps={fps}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  );
}
