"use client";

import type { Chapter } from "@/types/book";

type ChapterMenuProps = {
  isOpen: boolean;
  chapters: Chapter[];
  currentChapterIndex: number | null;
  onSelect: (chapter: Chapter) => void;
  onClose: () => void;
};

export default function ChapterMenu(props: ChapterMenuProps) {
  const { isOpen, chapters, currentChapterIndex, onSelect, onClose } = props;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-start justify-center bg-black/50 backdrop-blur-sm">
      <div className="mt-16 w-full max-w-md rounded-b-2xl bg-slate-950 border border-slate-800 border-t-slate-700/80 shadow-xl max-h-[60vh] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <h2 className="text-sm font-semibold tracking-tight">Chapters</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded-md hover:bg-slate-800/60"
          >
            Close
          </button>
        </div>
        <div className="max-h-[50vh] overflow-y-auto py-1">
          {chapters.length === 0 ? (
            <div className="px-4 py-3 text-xs text-slate-400">No chapters detected.</div>
          ) : (
            <ul className="divide-y divide-slate-800/80 text-sm">
              {chapters.map((chapter) => {
                const isActive = currentChapterIndex === chapter.index;
                return (
                  <li key={chapter.index}>
                    <button
                      type="button"
                      onClick={() => onSelect(chapter)}
                      className={`w-full px-4 py-3 text-left transition ${
                        isActive
                          ? "bg-emerald-500/10 text-emerald-100"
                          : "text-slate-200 hover:bg-slate-900"
                      }`}
                    >
                      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 mb-0.5">
                        Chapter {chapter.index + 1}
                      </div>
                      <div className="text-sm">{chapter.title}</div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}