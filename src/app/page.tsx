"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, memo } from "react";
import { useRouter } from "next/navigation";
import BookCard from "@/components/library/BookCard";

const BackgroundDecoration = memo(function BackgroundDecoration() {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 via-neutral-900/20 to-neutral-950 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
    </>
  );
});

const MotionHeader = dynamic(
  () => import("framer-motion").then((m) => ({ default: m.motion.header })),
  { ssr: false }
);

const MotionDiv = dynamic(
  () => import("framer-motion").then((m) => ({ default: m.motion.div })),
  { ssr: false }
);

const MotionH1 = dynamic(
  () => import("framer-motion").then((m) => ({ default: m.motion.h1 })),
  { ssr: false }
);

const MotionP = dynamic(
  () => import("framer-motion").then((m) => ({ default: m.motion.p })),
  { ssr: false }
);

const MotionSection = dynamic(
  () => import("framer-motion").then((m) => ({ default: m.motion.section })),
  { ssr: false }
);

const MotionH2 = dynamic(
  () => import("framer-motion").then((m) => ({ default: m.motion.h2 })),
  { ssr: false }
);

const MotionFooter = dynamic(
  () => import("framer-motion").then((m) => ({ default: m.motion.footer })),
  { ssr: false }
);

const BOOK_ID = "la-sangre-de-los-elfos";

type ProgressState = {
  percentComplete: number;
};

export default function LibraryPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<ProgressState | null>(null);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = (window as Window).localStorage.getItem(`speedreader:progress:${BOOK_ID}`);
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
    <main className="min-h-screen flex flex-col items-center px-4 py-8 bg-neutral-950 text-neutral-100 relative overflow-hidden">
      <BackgroundDecoration />
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Header */}
        <MotionHeader 
          className="text-center mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <MotionDiv
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/20 mb-6"
          >
            <svg 
              className="w-8 h-8 text-violet-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </MotionDiv>
          
          <MotionH1 
            className="text-4xl font-bold tracking-tight bg-gradient-to-r from-neutral-100 to-neutral-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Speed Reading
          </MotionH1>
          
          <MotionP 
            className="text-sm text-neutral-400 mt-3 max-w-xs mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Practice rapid serial visual presentation (RSVP) and switch to normal reading whenever you need more context.
          </MotionP>
        </MotionHeader>

        {/* Book Section */}
        <MotionSection
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <MotionH2 
            className="text-xs uppercase tracking-[0.2em] text-neutral-500 mb-4 px-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            Your Library
          </MotionH2>
          
          <BookCard
            title="La Sangre de los Elfos"
            author="Andrzej Sapkowski"
            progress={progress?.percentComplete ?? 0}
            onClick={() => router.push(`/reader/${BOOK_ID}`)}
            index={0}
          />
        </MotionSection>

        {/* Footer */}
        <MotionFooter
          className="text-center pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <p className="text-xs text-neutral-600">
            Continue reading where you left off
          </p>
        </MotionFooter>
      </div>
    </main>
  );
}
