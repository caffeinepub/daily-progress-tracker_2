import type React from "react";
import { createContext, useContext, useEffect, useReducer } from "react";

export interface LogEntry {
  id: string;
  categoryId: string;
  value: number;
  unit: "time" | "number";
  date: string;
  duration?: number;
  createdAt: string;
}

export interface SubCategory {
  id: string;
  name: string;
  parentId: "productive" | "time-waste";
  maxSliderValue: number;
  defaultUnit: "time" | "number";
}

export interface AppSettings {
  navLayout: "bottom" | "side";
  fps: 30 | 60;
  tabOrder: string[];
  hiddenTabs: string[];
}

export interface AppState {
  logs: LogEntry[];
  categories: SubCategory[];
  settings: AppSettings;
}

type Action =
  | { type: "ADD_LOG"; payload: LogEntry }
  | { type: "REMOVE_LOG"; payload: string }
  | { type: "ADD_CATEGORY"; payload: SubCategory }
  | { type: "UPDATE_CATEGORY"; payload: SubCategory }
  | { type: "DELETE_CATEGORY"; payload: string }
  | { type: "UPDATE_SETTINGS"; payload: Partial<AppSettings> };

const DEFAULT_CATEGORIES: SubCategory[] = [
  {
    id: "study",
    name: "Study",
    parentId: "productive",
    maxSliderValue: 8,
    defaultUnit: "time",
  },
  {
    id: "workout",
    name: "Workout",
    parentId: "productive",
    maxSliderValue: 2,
    defaultUnit: "time",
  },
  {
    id: "daily-routine",
    name: "Daily Routine",
    parentId: "productive",
    maxSliderValue: 4,
    defaultUnit: "time",
  },
  {
    id: "goals",
    name: "Goals",
    parentId: "productive",
    maxSliderValue: 10,
    defaultUnit: "number",
  },
  {
    id: "games",
    name: "Games",
    parentId: "time-waste",
    maxSliderValue: 4,
    defaultUnit: "time",
  },
  {
    id: "screen-time",
    name: "Screen Time",
    parentId: "time-waste",
    maxSliderValue: 8,
    defaultUnit: "time",
  },
];

const DEFAULT_STATE: AppState = {
  logs: [],
  categories: DEFAULT_CATEGORIES,
  settings: {
    navLayout: "bottom",
    fps: 30,
    tabOrder: ["home", "log", "graphs", "history", "settings"],
    hiddenTabs: [],
  },
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "ADD_LOG":
      return { ...state, logs: [action.payload, ...state.logs] };
    case "REMOVE_LOG":
      return {
        ...state,
        logs: state.logs.filter((l) => l.id !== action.payload),
      };
    case "ADD_CATEGORY":
      return { ...state, categories: [...state.categories, action.payload] };
    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.id ? action.payload : c,
        ),
      };
    case "DELETE_CATEGORY":
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload),
      };
    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.payload } };
    default:
      return state;
  }
}

const StoreContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const saved = localStorage.getItem("dpt_state");
  const initial = saved
    ? { ...DEFAULT_STATE, ...JSON.parse(saved) }
    : DEFAULT_STATE;
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    localStorage.setItem("dpt_state", JSON.stringify(state));
  }, [state]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
