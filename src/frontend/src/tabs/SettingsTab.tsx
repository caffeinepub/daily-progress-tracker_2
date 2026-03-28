import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
  type AppState,
  DEFAULT_STATE,
  type SubCategory,
  useStore,
} from "../store";
import { theme } from "../theme";
import { clearStorage, getStorageUsageKB } from "../utils/storage";

function SectionHeader({ title }: { title: string }) {
  return (
    <div
      style={{
        fontSize: theme.font.lg,
        fontWeight: 700,
        color: theme.colors.text,
        margin: `${theme.spacing.lg} 0 ${theme.spacing.md}`,
      }}
    >
      <span style={{ color: theme.colors.accent }}>#</span> {title}
    </div>
  );
}

function ToggleButton({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { id: string; label: string | React.ReactNode }[];
  onChange: (v: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        background: theme.colors.border,
        borderRadius: theme.radius.pill,
        padding: "3px",
      }}
    >
      {options.map((opt) => (
        <button
          type="button"
          key={opt.id}
          onClick={() => onChange(opt.id)}
          style={{
            flex: 1,
            padding: "8px 14px",
            borderRadius: theme.radius.pill,
            border: "none",
            background: value === opt.id ? theme.colors.accent : "transparent",
            color: value === opt.id ? "#fff" : theme.colors.textMuted,
            fontWeight: 600,
            fontSize: theme.font.sm,
            cursor: "pointer",
            transition: `all ${theme.anim.fast} ease`,
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: `${theme.spacing.md} 0`,
        borderBottom: `1px solid ${theme.colors.border}`,
      }}
    >
      {children}
    </div>
  );
}

const TAB_LABELS: Record<string, string> = {
  home: "Home",
  log: "Log",
  graphs: "Graphs",
  history: "History",
  settings: "Settings",
};

export function SettingsTab() {
  const { state, dispatch } = useStore();
  const { settings, categories } = state;
  const [newCatName, setNewCatName] = useState("");
  const [newCatParent, setNewCatParent] = useState<"productive" | "time-waste">(
    "productive",
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [storageKB, setStorageKB] = useState<number>(0);
  const [importStatus, setImportStatus] = useState<
    "" | "success" | "error" | "importing"
  >("");
  const [areYouSure, setAreYouSure] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getStorageUsageKB(state).then(setStorageKB);
  }, [state]);

  const updateSetting = (patch: Partial<typeof settings>) =>
    dispatch({ type: "UPDATE_SETTINGS", payload: patch });

  const addCategory = () => {
    if (!newCatName.trim()) return;
    const id = `cat-${Date.now()}`;
    dispatch({
      type: "ADD_CATEGORY",
      payload: {
        id,
        name: newCatName.trim(),
        parentId: newCatParent,
        maxSliderValue: 8,
        defaultUnit: "time",
      },
    });
    setNewCatName("");
  };

  const saveEdit = (cat: SubCategory) => {
    dispatch({
      type: "UPDATE_CATEGORY",
      payload: { ...cat, name: editingName },
    });
    setEditingId(null);
  };

  const moveTab = (id: string, dir: -1 | 1) => {
    const arr = [...settings.tabOrder];
    const i = arr.indexOf(id);
    if (i === -1) return;
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    updateSetting({ tabOrder: arr });
  };

  const toggleTabVisibility = (id: string) => {
    const hidden = settings.hiddenTabs.includes(id)
      ? settings.hiddenTabs.filter((h) => h !== id)
      : [...settings.hiddenTabs, id];
    updateSetting({ hiddenTabs: hidden });
  };

  const exportData = () => {
    const date = new Date().toISOString().split("T")[0];
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dpt-backup-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportStatus("importing");
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(
          ev.target?.result as string,
        ) as Partial<AppState>;
        if (!parsed.logs || !parsed.categories)
          throw new Error("Invalid backup");
        dispatch({ type: "LOAD_STATE", payload: parsed });
        setImportStatus("success");
      } catch {
        setImportStatus("error");
      }
      setTimeout(() => setImportStatus(""), 3000);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const handleClearData = async () => {
    await clearStorage();
    dispatch({ type: "LOAD_STATE", payload: DEFAULT_STATE });
    setAreYouSure(false);
  };

  const productive = categories.filter((c) => c.parentId === "productive");
  const timeWaste = categories.filter((c) => c.parentId === "time-waste");

  const inputStyle: React.CSSProperties = {
    background: theme.colors.border,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.sm,
    padding: "8px 12px",
    color: theme.colors.text,
    fontSize: theme.font.sm,
    outline: "none",
  };

  const actionBtnStyle = (color: string): React.CSSProperties => ({
    background: "none",
    border: `1px solid ${color}`,
    borderRadius: theme.radius.sm,
    color: color,
    padding: "7px 14px",
    fontSize: theme.font.sm,
    fontWeight: 600,
    cursor: "pointer",
    transition: `opacity ${theme.anim.fast} ease`,
  });

  return (
    <div style={{ padding: theme.spacing.lg, paddingBottom: "100px" }}>
      {/* # Appearance */}
      <SectionHeader title="Appearance" />
      <div
        style={{
          background: theme.colors.surface,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.md,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <Row>
          <div>
            <div style={{ fontWeight: 600, color: theme.colors.text }}>
              Tab Bar Layout
            </div>
            <div
              style={{
                fontSize: theme.font.xs,
                color: theme.colors.textDim,
                marginTop: "2px",
              }}
            >
              Bottom bar or side dock
            </div>
          </div>
          <ToggleButton
            value={settings.navLayout}
            options={[
              { id: "bottom", label: "Bottom" },
              { id: "side", label: "Side Dock" },
            ]}
            onChange={(v) =>
              updateSetting({ navLayout: v as "bottom" | "side" })
            }
          />
        </Row>
      </div>

      {/* # Tabs */}
      <SectionHeader title="Tabs" />
      <div
        style={{
          background: theme.colors.surface,
          borderRadius: theme.radius.lg,
          border: `1px solid ${theme.colors.border}`,
          overflow: "hidden",
        }}
      >
        {settings.tabOrder.map((tabId, i) => (
          <div
            key={tabId}
            style={{
              display: "flex",
              alignItems: "center",
              padding: theme.spacing.md,
              borderBottom:
                i < settings.tabOrder.length - 1
                  ? `1px solid ${theme.colors.border}`
                  : "none",
              gap: theme.spacing.sm,
            }}
          >
            <div
              style={{
                flex: 1,
                fontWeight: 600,
                color: settings.hiddenTabs.includes(tabId)
                  ? theme.colors.textDim
                  : theme.colors.text,
              }}
            >
              {TAB_LABELS[tabId]}
            </div>
            <button
              type="button"
              data-ocid="settings.toggle"
              onClick={() => toggleTabVisibility(tabId)}
              style={{
                background: "none",
                border: "none",
                color: settings.hiddenTabs.includes(tabId)
                  ? theme.colors.textDim
                  : theme.colors.accent,
                cursor: "pointer",
                fontSize: "16px",
                padding: "4px",
              }}
            >
              {settings.hiddenTabs.includes(tabId) ? "👁️‍🗨️" : "👁️"}
            </button>
            <button
              type="button"
              onClick={() => moveTab(tabId, -1)}
              disabled={i === 0}
              style={{
                background: "none",
                border: "none",
                color: i === 0 ? theme.colors.textDim : theme.colors.textMuted,
                cursor: i === 0 ? "default" : "pointer",
                fontSize: "14px",
                padding: "4px",
              }}
            >
              ▲
            </button>
            <button
              type="button"
              onClick={() => moveTab(tabId, 1)}
              disabled={i === settings.tabOrder.length - 1}
              style={{
                background: "none",
                border: "none",
                color:
                  i === settings.tabOrder.length - 1
                    ? theme.colors.textDim
                    : theme.colors.textMuted,
                cursor:
                  i === settings.tabOrder.length - 1 ? "default" : "pointer",
                fontSize: "14px",
                padding: "4px",
              }}
            >
              ▼
            </button>
          </div>
        ))}
      </div>

      {/* # Categories */}
      <SectionHeader title="Categories" />
      <div
        style={{
          background: theme.colors.surface,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.md,
          border: `1px solid ${theme.colors.border}`,
          marginBottom: theme.spacing.md,
        }}
      >
        <div
          style={{
            fontWeight: 700,
            color: theme.colors.teal,
            marginBottom: theme.spacing.md,
            fontSize: theme.font.md,
          }}
        >
          Productive
        </div>
        {productive.map((cat) => (
          <div
            key={cat.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.sm,
              marginBottom: theme.spacing.sm,
            }}
          >
            {editingId === cat.id ? (
              <>
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => saveEdit(cat)}
                  style={{
                    background: theme.colors.accent,
                    border: "none",
                    color: "#fff",
                    borderRadius: theme.radius.sm,
                    padding: "6px 12px",
                    cursor: "pointer",
                    fontSize: theme.font.sm,
                    fontWeight: 600,
                  }}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: theme.colors.textMuted,
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </>
            ) : (
              <>
                <span
                  style={{
                    flex: 1,
                    color: theme.colors.text,
                    fontSize: theme.font.md,
                  }}
                >
                  {cat.name}
                </span>
                <button
                  type="button"
                  data-ocid="settings.edit_button"
                  onClick={() => {
                    setEditingId(cat.id);
                    setEditingName(cat.name);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: theme.colors.textMuted,
                    cursor: "pointer",
                    fontSize: theme.font.sm,
                  }}
                >
                  Edit
                </button>
                {productive.length > 1 && (
                  <button
                    type="button"
                    data-ocid="settings.delete_button"
                    onClick={() =>
                      dispatch({ type: "DELETE_CATEGORY", payload: cat.id })
                    }
                    style={{
                      background: "none",
                      border: "none",
                      color: theme.colors.pink,
                      cursor: "pointer",
                      fontSize: theme.font.sm,
                    }}
                  >
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        ))}

        <div
          style={{
            fontWeight: 700,
            color: theme.colors.orange,
            marginTop: theme.spacing.lg,
            marginBottom: theme.spacing.md,
            fontSize: theme.font.md,
          }}
        >
          Time-Waste
        </div>
        {timeWaste.map((cat) => (
          <div
            key={cat.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.sm,
              marginBottom: theme.spacing.sm,
            }}
          >
            {editingId === cat.id ? (
              <>
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => saveEdit(cat)}
                  style={{
                    background: theme.colors.accent,
                    border: "none",
                    color: "#fff",
                    borderRadius: theme.radius.sm,
                    padding: "6px 12px",
                    cursor: "pointer",
                    fontSize: theme.font.sm,
                    fontWeight: 600,
                  }}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: theme.colors.textMuted,
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </>
            ) : (
              <>
                <span
                  style={{
                    flex: 1,
                    color: theme.colors.text,
                    fontSize: theme.font.md,
                  }}
                >
                  {cat.name}
                </span>
                <button
                  type="button"
                  data-ocid="settings.edit_button"
                  onClick={() => {
                    setEditingId(cat.id);
                    setEditingName(cat.name);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: theme.colors.textMuted,
                    cursor: "pointer",
                    fontSize: theme.font.sm,
                  }}
                >
                  Edit
                </button>
                {timeWaste.length > 1 && (
                  <button
                    type="button"
                    data-ocid="settings.delete_button"
                    onClick={() =>
                      dispatch({ type: "DELETE_CATEGORY", payload: cat.id })
                    }
                    style={{
                      background: "none",
                      border: "none",
                      color: theme.colors.pink,
                      cursor: "pointer",
                      fontSize: theme.font.sm,
                    }}
                  >
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        ))}

        {/* Add new */}
        <div
          style={{
            marginTop: theme.spacing.lg,
            paddingTop: theme.spacing.md,
            borderTop: `1px solid ${theme.colors.border}`,
          }}
        >
          <div
            style={{
              fontSize: theme.font.sm,
              color: theme.colors.textMuted,
              marginBottom: theme.spacing.sm,
              fontWeight: 600,
            }}
          >
            Add Sub-Category
          </div>
          <div
            style={{ display: "flex", gap: theme.spacing.sm, flexWrap: "wrap" }}
          >
            <input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Category name"
              data-ocid="settings.input"
              style={{ ...inputStyle, flex: 1, minWidth: "120px" }}
            />
            <select
              value={newCatParent}
              onChange={(e) =>
                setNewCatParent(e.target.value as "productive" | "time-waste")
              }
              data-ocid="settings.select"
              style={{ ...inputStyle }}
            >
              <option value="productive">Productive</option>
              <option value="time-waste">Time-Waste</option>
            </select>
            <button
              type="button"
              data-ocid="settings.primary_button"
              onClick={addCategory}
              style={{
                background: theme.colors.accent,
                border: "none",
                color: "#fff",
                borderRadius: theme.radius.sm,
                padding: "8px 16px",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: theme.font.sm,
              }}
            >
              + Add
            </button>
          </div>
        </div>
      </div>

      {/* # Slider Scale */}
      <SectionHeader title="Slider Scale" />
      <div
        style={{
          background: theme.colors.surface,
          borderRadius: theme.radius.lg,
          border: `1px solid ${theme.colors.border}`,
          overflow: "hidden",
        }}
      >
        {categories.map((cat, i) => (
          <div
            key={cat.id}
            style={{
              display: "flex",
              alignItems: "center",
              padding: theme.spacing.md,
              borderBottom:
                i < categories.length - 1
                  ? `1px solid ${theme.colors.border}`
                  : "none",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: theme.colors.text }}>
                {cat.name}
              </div>
              <div
                style={{ fontSize: theme.font.xs, color: theme.colors.textDim }}
              >
                {cat.parentId === "productive" ? "Productive" : "Time-Waste"}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.sm,
              }}
            >
              <span
                style={{
                  fontSize: theme.font.sm,
                  color: theme.colors.textMuted,
                }}
              >
                Max:
              </span>
              <input
                type="number"
                min={1}
                value={cat.maxSliderValue}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_CATEGORY",
                    payload: {
                      ...cat,
                      maxSliderValue: Number.parseFloat(e.target.value) || 1,
                    },
                  })
                }
                data-ocid="settings.input"
                style={{ ...inputStyle, width: "60px", textAlign: "center" }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* # Units */}
      <SectionHeader title="Units" />
      <div
        style={{
          background: theme.colors.surface,
          borderRadius: theme.radius.lg,
          border: `1px solid ${theme.colors.border}`,
          overflow: "hidden",
        }}
      >
        {categories.map((cat, i) => (
          <div
            key={cat.id}
            style={{
              display: "flex",
              alignItems: "center",
              padding: theme.spacing.md,
              borderBottom:
                i < categories.length - 1
                  ? `1px solid ${theme.colors.border}`
                  : "none",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: theme.colors.text }}>
                {cat.name}
              </div>
            </div>
            <ToggleButton
              value={cat.defaultUnit}
              options={[
                { id: "time", label: "Time" },
                { id: "number", label: "Number" },
              ]}
              onChange={(v) =>
                dispatch({
                  type: "UPDATE_CATEGORY",
                  payload: { ...cat, defaultUnit: v as "time" | "number" },
                })
              }
            />
          </div>
        ))}
      </div>

      {/* # Performance */}
      <SectionHeader title="Performance" />
      <div
        style={{
          background: theme.colors.surface,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.md,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        <Row>
          <div>
            <div style={{ fontWeight: 600, color: theme.colors.text }}>
              Battery Saver Mode
            </div>
            <div
              style={{
                fontSize: theme.font.xs,
                color: theme.colors.textDim,
                marginTop: "4px",
                maxWidth: "200px",
              }}
            >
              Pokémon GO-style frame rate limiter. 30 FPS saves battery. 60 FPS
              for smooth animations.
            </div>
          </div>
          <ToggleButton
            value={String(settings.fps)}
            options={[
              { id: "30", label: "30 FPS ⚡" },
              { id: "60", label: "60 FPS" },
            ]}
            onChange={(v) =>
              updateSetting({ fps: Number.parseInt(v) as 30 | 60 })
            }
          />
        </Row>
      </div>

      {/* # Storage */}
      <SectionHeader title="Storage" />
      <div
        style={{
          background: theme.colors.surface,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.md,
          border: `1px solid ${theme.colors.border}`,
        }}
      >
        {/* Storage Location */}
        <Row>
          <div>
            <div style={{ fontWeight: 600, color: theme.colors.text }}>
              Storage Location
            </div>
            <div
              style={{
                fontSize: theme.font.xs,
                color: theme.colors.textDim,
                marginTop: "2px",
              }}
            >
              Where your data is saved
            </div>
          </div>
          <ToggleButton
            value={settings.storageMode ?? "local"}
            options={[
              { id: "local", label: "📱 Device" },
              {
                id: "cloud",
                label: (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                    }}
                  >
                    ☁️ Cloud
                    <span
                      style={{
                        fontSize: "9px",
                        fontWeight: 700,
                        color: theme.colors.orange,
                        background: `${theme.colors.orange}22`,
                        border: `1px solid ${theme.colors.orange}55`,
                        borderRadius: theme.radius.pill,
                        padding: "1px 5px",
                        lineHeight: 1.4,
                      }}
                    >
                      Soon
                    </span>
                  </span>
                ),
              },
            ]}
            onChange={(v) =>
              updateSetting({ storageMode: v as "local" | "cloud" })
            }
          />
        </Row>

        {/* Storage Usage */}
        <Row>
          <div>
            <div style={{ fontWeight: 600, color: theme.colors.text }}>
              Storage Used
            </div>
            <div
              style={{
                fontSize: theme.font.xs,
                color: theme.colors.textDim,
                marginTop: "2px",
              }}
            >
              Approximate size of saved data
            </div>
          </div>
          <div
            style={{
              fontWeight: 700,
              fontSize: theme.font.md,
              color: theme.colors.teal,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            ~{storageKB.toFixed(1)} KB
          </div>
        </Row>

        {/* Export */}
        <Row>
          <div>
            <div style={{ fontWeight: 600, color: theme.colors.text }}>
              Export Backup
            </div>
            <div
              style={{
                fontSize: theme.font.xs,
                color: theme.colors.textDim,
                marginTop: "2px",
              }}
            >
              Download all data as JSON
            </div>
          </div>
          <button
            type="button"
            data-ocid="settings.secondary_button"
            onClick={exportData}
            style={actionBtnStyle(theme.colors.accent)}
          >
            ⬇ Export
          </button>
        </Row>

        {/* Import */}
        <Row>
          <div>
            <div style={{ fontWeight: 600, color: theme.colors.text }}>
              Import Backup
            </div>
            <div
              style={{
                fontSize: theme.font.xs,
                color: theme.colors.textDim,
                marginTop: "2px",
              }}
            >
              {importStatus === "importing" && (
                <span style={{ color: theme.colors.textMuted }}>
                  Importing…
                </span>
              )}
              {importStatus === "success" && (
                <span style={{ color: theme.colors.success }}>
                  ✓ Import successful
                </span>
              )}
              {importStatus === "error" && (
                <span style={{ color: theme.colors.pink }}>
                  ✗ Invalid backup file
                </span>
              )}
              {importStatus === "" && "Restore from a .json backup"}
            </div>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: "none" }}
              onChange={handleImport}
            />
            <button
              type="button"
              data-ocid="settings.upload_button"
              onClick={() => fileInputRef.current?.click()}
              style={actionBtnStyle(theme.colors.teal)}
            >
              ⬆ Import
            </button>
          </div>
        </Row>

        {/* Clear Data */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: `${theme.spacing.md} 0`,
          }}
        >
          <div>
            <div style={{ fontWeight: 600, color: theme.colors.text }}>
              Clear All Data
            </div>
            <div
              style={{
                fontSize: theme.font.xs,
                color: theme.colors.textDim,
                marginTop: "2px",
              }}
            >
              Permanently delete all logs and settings
            </div>
          </div>
          {!areYouSure ? (
            <button
              type="button"
              data-ocid="settings.delete_button"
              onClick={() => setAreYouSure(true)}
              style={actionBtnStyle(theme.colors.pink)}
            >
              🗑 Clear
            </button>
          ) : (
            <div
              style={{
                display: "flex",
                gap: theme.spacing.sm,
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: theme.font.xs,
                  color: theme.colors.textMuted,
                }}
              >
                Sure?
              </span>
              <button
                type="button"
                data-ocid="settings.confirm_button"
                onClick={handleClearData}
                style={{
                  ...actionBtnStyle(theme.colors.pink),
                  background: theme.colors.pink,
                  color: "#fff",
                }}
              >
                Yes, clear
              </button>
              <button
                type="button"
                data-ocid="settings.cancel_button"
                onClick={() => setAreYouSure(false)}
                style={actionBtnStyle(theme.colors.textMuted)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          marginTop: theme.spacing.xl,
          paddingTop: theme.spacing.lg,
          borderTop: `1px solid ${theme.colors.border}`,
        }}
      >
        <div style={{ fontSize: theme.font.xs, color: theme.colors.textDim }}>
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: theme.colors.accent, textDecoration: "none" }}
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </div>
  );
}
