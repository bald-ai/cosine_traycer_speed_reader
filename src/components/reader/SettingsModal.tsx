"use client";

import type { Settings } from "@/contexts/SettingsContext";
import { useSettings } from "@/contexts/SettingsContext";

type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const FONT_SIZE_OPTIONS: { value: Settings["fontSize"]; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "xl", label: "Extra large" }
];

const FONT_FAMILY_OPTIONS: { value: Settings["fontFamily"]; label: string }[] = [
  { value: "serif", label: "Serif" },
  { value: "sans-serif", label: "Sans-serif" },
  { value: "monospace", label: "Monospace" }
];

export default function SettingsModal(props: SettingsModalProps) {
  const { isOpen, onClose } = props;
  const { settings, updateSettings } = useSettings();

  if (!isOpen) return null;

  const fontSizeIndex = FONT_SIZE_OPTIONS.findIndex((opt) => opt.value === settings.fontSize);

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-slate-950 border border-slate-800 p-4 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold tracking-tight">Reading settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded-md hover:bg-slate-800/60"
          >
            Close
          </button>
        </div>

        <div className="space-y-5 text-sm">
          <section>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-100">Font size</span>
              <span className="text-xs text-slate-400">
                {FONT_SIZE_OPTIONS[fontSizeIndex]?.label ?? "Medium"}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={FONT_SIZE_OPTIONS.length - 1}
              value={fontSizeIndex === -1 ? 1 : fontSizeIndex}
              onChange={(event) => {
                const index = Number(event.target.value);
                const option = FONT_SIZE_OPTIONS[index] ?? FONT_SIZE_OPTIONS[1];
                updateSettings({ fontSize: option.value });
              }}
              className="w-full accent-emerald-400"
            />
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-100">Font family</span>
            </div>
            <select
              value={settings.fontFamily}
              onChange={(event) => {
                const value = event.target.value as Settings["fontFamily"];
                updateSettings({ fontFamily: value });
              }}
              className="w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100"
            >
              {FONT_FAMILY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-100">Theme</span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => updateSettings({ theme: "light" })}
                className={`flex-1 rounded-md border px-3 py-2 ${
                  settings.theme === "light"
                    ? "border-emerald-400 bg-emerald-500/10 text-emerald-100"
                    : "border-slate-700 bg-slate-900 text-slate-300"
                }`}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ theme: "dark" })}
                className={`flex-1 rounded-md border px-3 py-2 ${
                  settings.theme === "dark"
                    ? "border-emerald-400 bg-emerald-500/10 text-emerald-100"
                    : "border-slate-700 bg-slate-900 text-slate-300"
                }`}
              >
                Dark
              </button>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-100">Speed reading WPM</span>
              <span className="text-xs text-slate-400">{settings.wpm} WPM</span>
            </div>
            <input
              type="range"
              min={100}
              max={600}
              step={5}
              value={settings.wpm}
              onChange={(event) => {
                const value = Number(event.target.value);
                const clamped = Math.max(100, Math.min(600, value));
                updateSettings({ wpm: clamped });
              }}
              className="w-full accent-emerald-400"
            />
          </section>
        </div>
      </div>
    </div>
  );
}