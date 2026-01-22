"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode
} from "react";
import type { Mode, Position } from "@/types/reading";
import { useBook } from "./BookContext";
import { calculatePercentComplete } from "@/lib/utils/bookHelpers";

type ReadingContextValue = {
  mode: Mode;
  position: Position;
  highlightedWord: Position | null;
  setMode: (mode: Mode) => void;
  setPosition: (position: Position) => void;
  setHighlightedWord: (position: Position | null) => void;
};

const ReadingContext = createContext<ReadingContextValue | undefined>(undefined);

type ProviderProps = {
  bookId: string;
  children: ReactNode;
};

const DEFAULT_POSITION: Position = {
  paragraphId: 0,
  wordIndex: 0
};

export function ReadingProvider(props: ProviderProps) {
  const { bookId, children } = props;
  const { book } = useBook();

  const [mode, setModeState] = useState<Mode>("normal");
  const [position, setPositionState] = useState<Position>(DEFAULT_POSITION);
  const [highlightedWord, setHighlightedWordState] = useState<Position | null>(null);

  const saveTimeoutRef = useRef<number | null>(null);

  // Load last progress on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(`speedreader:progress:${bookId}`);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        paragraphId?: number;
        wordIndex?: number;
        mode?: Mode;
      };

      if (typeof parsed.paragraphId === "number") {
        setPositionState({
          paragraphId: parsed.paragraphId,
          wordIndex: parsed.wordIndex ?? 0
        });
      }
      if (parsed.mode === "normal" || parsed.mode === "speed") {
        setModeState(parsed.mode);
      }
    } catch {
      // ignore malformed progress
    }
  }, [bookId]);

  // Persist progress whenever position or mode changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!book) return;

    const payload = {
      bookId,
      paragraphId: position.paragraphId,
      wordIndex: position.wordIndex,
      mode,
      lastReadAt: Date.now(),
      percentComplete: calculatePercentComplete(book, position)
    };

    const key = `speedreader:progress:${bookId}`;

    if (mode === "normal") {
      if (saveTimeoutRef.current != null) {
        window.clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = window.setTimeout(() => {
        try {
          window.localStorage.setItem(key, JSON.stringify(payload));
        } catch {
          // ignore quota errors for MVP
        }
      }, 1000);
    } else {
      try {
        window.localStorage.setItem(key, JSON.stringify(payload));
      } catch {
        // ignore quota errors for MVP
      }
    }
  }, [book, bookId, mode, position]);

  const setMode = (nextMode: Mode) => {
    setModeState(nextMode);
    if (nextMode === "speed") {
      // Clear any existing highlight when entering speed mode
      setHighlightedWordState(null);
    }
  };

  const setPosition = (next: Position) => {
    setPositionState(next);
  };

  const setHighlightedWord = (next: Position | null) => {
    setHighlightedWordState(next);
  };

  return (
    <ReadingContext.Provider
      value={{
        mode,
        position,
        highlightedWord,
        setMode,
        setPosition,
        setHighlightedWord
      }}
    >
      {children}
    </ReadingContext.Provider>
  );
}

export function useReading(): ReadingContextValue {
  const ctx = useContext(ReadingContext);
  if (!ctx) {
    throw new Error("useReading must be used within a ReadingProvider");
  }
  return ctx;
}