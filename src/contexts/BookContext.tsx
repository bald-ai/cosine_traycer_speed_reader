"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";
import type { Book } from "@/types/book";
import { primeBookTokenCache } from "@/lib/utils/tokenCache";

type BookContextValue = {
  book: Book | null;
  isLoading: boolean;
  error: string | null;
};

const BookContext = createContext<BookContextValue | undefined>(undefined);

type ProviderProps = {
  bookId: string;
  children: ReactNode;
};

export function BookProvider(props: ProviderProps) {
  const { bookId, children } = props;
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBook() {
      setIsLoading(true);
      setError(null);

      try {
        let parsed: Book | null = null;

        if (typeof window !== "undefined") {
          const cached = window.localStorage.getItem(`speedreader:book:${bookId}`);
          if (cached) {
            try {
              parsed = JSON.parse(cached) as Book;
            } catch {
              parsed = null;
            }
          }
        }

        if (!parsed) {
          const res = await fetch(`/books/${bookId}.json`);
          if (!res.ok) {
            throw new Error(`Failed to load book data (${res.status})`);
          }
          parsed = (await res.json()) as Book;
          if (typeof window !== "undefined") {
            try {
              window.localStorage.setItem(`speedreader:book:${bookId}`, JSON.stringify(parsed));
            } catch {
              // ignore quota errors for MVP
            }
          }
        }

        if (!cancelled) {
          setBook(parsed);
          if (typeof window !== "undefined") {
            window.setTimeout(() => {
              if (!cancelled) {
                primeBookTokenCache(parsed);
              }
            }, 0);
          }
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Unknown error";
          setError(message);
          setBook(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadBook();

    return () => {
      cancelled = true;
    };
  }, [bookId]);

  return (
    <BookContext.Provider
      value={{
        book,
        isLoading,
        error
      }}
    >
      {children}
    </BookContext.Provider>
  );
}

export function useBook(): BookContextValue {
  const ctx = useContext(BookContext);
  if (!ctx) {
    throw new Error("useBook must be used within a BookProvider");
  }
  return ctx;
}
