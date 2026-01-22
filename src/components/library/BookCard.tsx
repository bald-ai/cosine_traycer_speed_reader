import type { MouseEventHandler } from "react";

type BookCardProps = {
  title: string;
  author: string;
  progress: number;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

export default function BookCard(props: BookCardProps) {
  const { title, author, progress, onClick } = props;
  const clampedProgress = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-800/80 p-4 text-left shadow-lg shadow-slate-950/40 hover:border-emerald-400/80 hover:shadow-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 transition"
    >
      <div className="flex items-start gap-4">
        <div className="h-16 w-12 shrink-0 rounded-md bg-slate-900/80 border border-slate-700/80 flex items-center justify-center text-[10px] uppercase tracking-[0.16em] text-slate-400">
          Book
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold tracking-tight text-slate-50">{title}</h2>
          <p className="text-xs text-slate-400 mt-1">{author}</p>
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>Progress</span>
              <span>{clampedProgress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-400"
                style={{ width: `${clampedProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}