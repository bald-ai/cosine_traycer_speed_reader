"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BookCard from "@/components/library/BookCard";

const BOOK_ID = "la-sangre-de-los-elfos";

type ProgressState = {
  percentComplete: number;
};

export default function LibraryPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<ProgressState | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(`speedreader:progress:${BOOK_ID}`);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { percentComplete?: number };
      if (typeof parsed.percentComplete === "number") {
        setProgress({ percentComplete: parsed.percentComplete });
      }
    } catch {
      // ignore malformed progress
    }
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8 bg-slate-950 text-slate-50">
      <div className="w-full max-w-md space-y-6">
        <header className="text-center mb-4">
          <h1 className="text-3xl font-semibold tracking-tight">Speed Reading</h1>
          <p className="text-sm text-slate-400 mt-2">
            Practice rapid serial visual presentation (RSVP) and switch to normal reading whenever you need
            more context.
          </p>
        </header>
        <section>
          <BookCard
            title="La Sangre de los Elfos"
            author="Andrzej Sapkowski"
            progress={progress?.percentComplete ?? 0}
            onClick={() => router.push(`/reader/${BOOK_ID}`)}
          />
        </section>
      </div>
    </main>
  );
}