"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction
} from "react";

export type Theme = "light" | "dark";

export type Settings = {
  wpm: number;
  fontSize: "small" | "medium" | "large" | "xl";
  fontFamily: "serif" | "sans-serif" | "monospace";
  theme: Theme;
};

type SettingsContextValue = {
  settings: Settings;
  updateSettings: (partial: Partial<Settings>) => void;
};

const DEFAULT_SETTINGS: Settings = {
  wpm: 250,
  fontSize: "medium",
  fontFamily: "serif",
  theme: "dark"
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

function useIsomorphicLayoutEffect(effect: () => void | (() => void), deps: React.DependencyList) {
  const useEffectHook: typeof useEffect =
    typeof window === "undefined" ? (useEffect as Dispatch<SetStateAction<unknown>>) && useEffect : useEffect;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffectHook(effect, deps);
}

export function SettingsProvider(props: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("speedreader:settings");
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Settings>;
        setSettings((prev) => ({
          ...prev,
          ...parsed
        }));
        return;
      }
    } catch {
      // ignore malformed settings
    }

    // Fallback to system preference for theme
    if (typeof window !== "undefined") {
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        setSettings((prev) => ({ ...prev, theme: "dark" }));
      }
    }
  }, []);

  // Persist settings and apply theme class
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("speedreader:settings", JSON.stringify(settings));
    } catch {
      // ignore quota errors for MVP
    }

    const root = window.document.documentElement;
    if (settings.theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [settings]);

  const updateSettings = (partial: Partial<Settings>) => {
    setSettings((prev) => ({
      ...prev,
      ...partial
    }));
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings
      }}
    >
      {props.children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return ctx;
}