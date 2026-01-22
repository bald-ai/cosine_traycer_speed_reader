"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useBook } from "@/contexts/BookContext";
import { useReading } from "@/contexts/ReadingContext";
import { useSettings } from "@/contexts/SettingsContext";
import { findChapterForParagraph } from "@/lib/utils/bookHelpers";
import { getNextPosition, getWordAtPosition } from "@/lib/utils/bookHelpers";
import type { Position } from "@/types/reading";

function calculateDelayForWord(targetWpm: number, rampIndex: number, rampUpWords = 25): number {
  const clampedWpm = Math.max(100, Math.min(600, targetWpm));
  const startWpm = clampedWpm * 0.7;

  let currentWpm: number;
  if (rampIndex < rampUpWords) {
    const increment = (clampedWpm - startWpm) / Math.max(1, rampUpWords - 1);
    currentWpm = startWpm + increment * rampIndex;
  } else {
    currentWpm = clampedWpm;
  }

  const delay = Math.round(60000 / currentWpm);
  return delay;
}

export default function SpeedReadingMode() {
  const router = useRouter();
  const { book } = useBook();
  const { position, setMode, setPosition, setHighlightedWord } = useReading();
  const { settings, updateSettings } = useSettings();

  const [displayedWord, setDisplayedWord] = useState<string>("");
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(false);

  const positionRef = useRef<Position | null>(position);
  const timeoutRef = useRef<number | null>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    if (!book) return;
    if (isPaused) return;

    let cancelled = false;

    function step(rampIndex: number) {
      if (cancelled || isPaused) return;

      const currentPosition = positionRef.current;
      if (!currentPosition) {
        setMode("normal");
        return;
      }

      const word = getWordAtPosition(book, currentPosition);
      if (!word) {
        setMode("normal");
        return;
      }

      setDisplayedWord(word);
      setPosition(currentPosition);

      const nextPosition = getNextPosition(book, currentPosition);
      positionRef.current = nextPosition;

      if (!nextPosition) {
        setHighlightedWord(currentPosition);
        setMode("normal");
        return;
      }

      const delay = calculateDelayForWord(settings.wpm, rampIndex);
      timeoutRef.current = window.setTimeout(() => step(rampIndex + 1), delay);
    }

    step(0);

    return () => {
      cancelled = true;
      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [book, isPaused, setMode, setPosition, setHighlightedWord, settings.wpm]);

  useEffect(() => {
    if (!showControls || isPaused) {
      if (controlsTimeoutRef.current != null) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
      return;
    }

    controlsTimeoutRef.current = window.setTimeout(() => {
      setShowControls(false);
    }, 4000);

    return () => {
      if (controlsTimeoutRef.current != null) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isPaused]);

  const currentChapter = useMemo(() => {
    if (!book || !positionRef.current) return null;
    return findChapterForParagraph(book, positionRef.current.paragraphId);
  }, [book]);

  if (!book) return null;

  const handleToggleControls = () => {
    setShowControls((prev) => !prev);
  };

  const handleBackToLibrary = () => {
    router.push("/");
  };

  const handlePause = () => {
    setIsPaused(true);
    setShowControls(true);
    if (timeoutRef.current != null) {
      window.clearTimeout(timeoutRef.current);
    }
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleSwitchToNormalMode = () => {
    const currentPosition = positionRef.current;
    if (currentPosition) {
      setHighlightedWord(currentPosition);
    }
    setMode("normal");
  };

  const handleSpeedChange = (direction: "up" | "down") => {
    const current = settings.wpm;
    const factor = direction === "up" ? 1.1 : 0.9;
    const raw = current * factor;
    const rounded = Math.round(raw / 5) * 5;
    const clamped = Math.max(100, Math.min(600, rounded));
    updateSettings({ wpm: clamped });
    setShowControls(true);
  };

  const fontFamilyClass =
    settings.fontFamily === "serif"
      ? "font-serif"
      : settings.fontFamily === "monospace"
      ? "font-mono"
      : "font-sans";

  return (
    <div
      className="relative flex h-screen flex-col bg-slate-950 text-slate-50"
      onClick={handleToggleControls}
    >
      <div className="flex-1 flex items-center justify-center px-6">
        <div
          className={`text-4xl sm:text-5xl font-semibold tracking-tight text-center ${fontFamilyClass}`}
        >
          {displayedWord || "Tap to start"}
        </div>
      </div>

      {showControls && (
        <div
          className="absolute inset-0 z-20 flex flex-col justify-between bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950/90"
          onClick={(event) => event.stopPropagation()}
        >
          <header className="flex items-center justify-between px-4 pt-4 text-xs">
            <button
              type="button"
              onClick={handleBackToLibrary}
              className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-slate-200 hover:bg-slate-800"
            >
              Back
            </button>
            <div className="flex-1 mx-3 text-center truncate">
              {currentChapter ? (
                <>
                  <span className="uppercase tracking-[0.18em] text-[10px] text-slate-500">
                    Chapter {currentChapter.index + 1}
                  </span>
                  <span className="ml-2 text-xs text-slate-200">{currentChapter.title}</span>
                </>
              ) : (
                <span className="text-xs text-slate-400">Speed Reading</span>
              )}
            </div>
            <div className="text-xs text-slate-300">{settings.wpm} WPM</div>
          </header>

          <footer className="px-4 pb-6">
            {!isPaused ? (
              <div className="flex items-center justify-between gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => handleSpeedChange("down")}
                  className="flex-1 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-slate-100 hover:bg-slate-800"
                >
                  Slow Down
                </button>
                <button
                  type="button"
                  onClick={handlePause}
                  className="flex-1 rounded-full bg-emerald-500 px-4 py-2 font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 hover:bg-emerald-400"
                >
                  Pause
                </button>
                <button
                  type="button"
                  onClick={() => handleSpeedChange("up")}
                  className="flex-1 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-slate-100 hover:bg-slate-800"
                >
                  Speed Up
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 text-sm">
                <button
                  type="button"
                  onClick={handleSwitchToNormalMode}
                  className="flex-1 rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-slate-100 hover:bg-slate-800"
                >
                  Normal Mode
                </button>
                <button
                  type="button"
                  onClick={handleResume}
                  className="flex-1 rounded-full bg-emerald-500 px-4 py-2 font-semibold text-slate-950 shadow-lg shadow-emerald-500/40 hover:bg-emerald-400"
                >
                  Resume
                </button>
              </div>
            )}
          </footer>
        </div>
      )}
    </div>
  );
}