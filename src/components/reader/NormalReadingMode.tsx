"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useBook } from "@/contexts/BookContext";
import { useReading } from "@/contexts/ReadingContext";
import { useSettings } from "@/contexts/SettingsContext";
import SettingsModal from "@/components/reader/SettingsModal";
import ChapterMenu from "@/components/reader/ChapterMenu";
import ProgressBar from "@/components/shared/ProgressBar";
import { findChapterForParagraph, calculatePercentComplete } from "@/lib/utils/bookHelpers";
import { tokenizeParagraph } from "@/lib/utils/wordExtraction";
import type { Chapter } from "@/types/book";

export default function NormalReadingMode() {
  const router = useRouter();
  const { book } = useBook();
  const { mode, position, highlightedWord, setMode, setPosition, setHighlightedWord } = useReading();
  const { settings } = useSettings();

  const [showSettings, setShowSettings] = useState(false);
  const [showChapterMenu, setShowChapterMenu] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const paragraphRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const scrollTimeoutRef = useRef<number | null>(null);

  const fontSizeClass = useMemo(() => {
    switch (settings.fontSize) {
      case "small":
        return "text-sm";
      case "large":
        return "text-lg";
      case "xl":
        return "text-xl";
      case "medium":
      default:
        return "text-base";
    }
  }, [settings.fontSize]);

  const fontFamilyClass = useMemo(() => {
    switch (settings.fontFamily) {
      case "serif":
        return "font-serif";
      case "monospace":
        return "font-mono";
      case "sans-serif":
      default:
        return "font-sans";
    }
  }, [settings.fontFamily]);

  const currentChapter: Chapter | null = useMemo(() => {
    if (!book) return null;
    return findChapterForParagraph(book, position.paragraphId);
  }, [book, position.paragraphId]);

  const progressPercent = useMemo(() => {
    if (!book) return 0;
    return calculatePercentComplete(book, position);
  }, [book, position]);

  useEffect(() => {
    if (!book || !scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const targetParagraph = book.paragraphs[position.paragraphId];
    if (!targetParagraph) return;

    const targetElement = paragraphRefs.current[targetParagraph.id];
    if (!targetElement) return;

    const offset = targetElement.offsetTop - container.offsetTop;
    container.scrollTo({ top: offset, behavior: "smooth" });
  }, [book]);

  if (!book) return null;

  const handleBack = () => {
    router.push("/");
  };

  const handleScroll = () => {
    if (!book || !scrollContainerRef.current) return;

    if (scrollTimeoutRef.current != null) {
      window.clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = window.setTimeout(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const containerTop = containerRect.top;
      const containerBottom = containerRect.bottom;

      let bestParagraphId: number | null = null;
      let bestDelta = Number.POSITIVE_INFINITY;

      for (const para of book.paragraphs) {
        const el = paragraphRefs.current[para.id];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.bottom < containerTop || rect.top > containerBottom) continue;
        const delta = Math.abs(rect.top - containerTop);
        if (delta < bestDelta) {
          bestDelta = delta;
          bestParagraphId = para.id;
        }
      }

      if (bestParagraphId != null) {
        setPosition({
          paragraphId: bestParagraphId,
          wordIndex: 0
        });
      }
    }, 150);
  };

  const handleWordClick = (paragraphId: number, wordIndex: number) => {
    if (highlightedWord && highlightedWord.paragraphId === paragraphId && highlightedWord.wordIndex === wordIndex) {
      setHighlightedWord(null);
    } else {
      setHighlightedWord({ paragraphId, wordIndex });
      setPosition({ paragraphId, wordIndex });
    }
  };

  const handleResumeSpeedReading = () => {
    if (!book) return;

    const startFrom = highlightedWord ?? position;
    setPosition(startFrom);
    setMode("speed");
  };

  const handleChapterSelect = (chapter: Chapter) => {
    if (!book || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const targetElement = paragraphRefs.current[chapter.startParagraphId];

    if (targetElement) {
      const top = targetElement.offsetTop - container.offsetTop;
      container.scrollTo({ top, behavior: "smooth" });
      setPosition({
        paragraphId: chapter.startParagraphId,
        wordIndex: 0
      });
    }

    setShowChapterMenu(false);
  };

  return (
    <>
      <div className="flex h-screen flex-col bg-slate-950">
        <header className="flex items-center gap-2 border-b border-slate-800 bg-slate-950/95 px-3 py-2.5">
          <button
            type="button"
            onClick={handleBack}
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => setShowChapterMenu(true)}
            className="flex-1 truncate text-center text-xs text-slate-200"
          >
            {currentChapter ? (
              <>
                <span className="uppercase tracking-[0.18em] text-[10px] text-slate-500">
                  Chapter {currentChapter.index + 1}
                </span>
                <span className="ml-2 truncate text-xs text-slate-200">{currentChapter.title}</span>
              </>
            ) : (
              <span className="text-xs text-slate-400">Full book</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800"
          >
            Settings
          </button>
        </header>

        <div className="px-3 pt-2 pb-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>
              {currentChapter ? `Chapter ${currentChapter.index + 1}` : "Progress"}
            </span>
            <span>{progressPercent}%</span>
          </div>
          <ProgressBar value={progressPercent} />
        </div>

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 pb-16 pt-3"
        >
          <div className={`${fontFamilyClass} ${fontSizeClass} leading-relaxed space-y-4`}>
            {book.paragraphs.map((paragraph) => {
              const words = tokenizeParagraph(paragraph.text);
              const isHighlightedParagraph =
                highlightedWord && highlightedWord.paragraphId === paragraph.id;

              return (
                <div
                  key={paragraph.id}
                  ref={(el) => {
                    paragraphRefs.current[paragraph.id] = el;
                  }}
                  className="text-slate-100"
                >
                  {words.map((word, index) => {
                    const isHighlighted =
                      isHighlightedParagraph && highlightedWord?.wordIndex === index;
                    return (
                      <span
                        key={index}
                        onClick={() => handleWordClick(paragraph.id, index)}
                        className={`cursor-pointer ${
                          isHighlighted
                            ? "bg-amber-300 text-slate-900 rounded px-0.5"
                            : "hover:bg-slate-700/60 rounded px-0.5"
                        }`}
                      >
                        {word}
                        {index < words.length - 1 ? " " : ""}
                      </span>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        <div className="pointer-events-none fixed inset-x-0 bottom-0 flex justify-end px-4 pb-4">
          <button
            type="button"
            onClick={handleResumeSpeedReading}
            className="pointer-events-auto rounded-full bg-emerald-500 text-slate-950 text-xs font-semibold px-4 py-2 shadow-lg shadow-emerald-500/40 hover:bg-emerald-400"
          >
            Resume Speed Reading
          </button>
        </div>
      </div>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <ChapterMenu
        isOpen={showChapterMenu}
        chapters={book.chapters}
        currentChapterIndex={currentChapter ? currentChapter.index : null}
        onSelect={handleChapterSelect}
        onClose={() => setShowChapterMenu(false)}
      />
    </>
  );
}