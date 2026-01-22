import type { Book } from "@/types/book";
import type { Position } from "@/types/reading";
import { tokenizeParagraph } from "./wordExtraction";

export function findChapterForParagraph(book: Book, paragraphId: number) {
  if (!book.chapters || book.chapters.length === 0) return null;

  let current = book.chapters[0];

  for (const chapter of book.chapters) {
    if (chapter.startParagraphId <= paragraphId) {
      current = chapter;
    } else {
      break;
    }
  }

  return current;
}

export function calculatePercentComplete(book: Book, position: Position): number {
  if (!book.paragraphs.length || !book.totalWords) return 0;

  let wordsBefore = 0;

  for (let i = 0; i < book.paragraphs.length; i += 1) {
    const para = book.paragraphs[i];
    const wordsInParagraph = tokenizeParagraph(para.text).length;

    if (i < position.paragraphId) {
      wordsBefore += wordsInParagraph;
      continue;
    }

    if (i === position.paragraphId) {
      const clampedIndex = Math.max(0, Math.min(wordsInParagraph, position.wordIndex));
      wordsBefore += clampedIndex;
      break;
    }
  }

  const percent = (wordsBefore / book.totalWords) * 100;
  return Math.max(0, Math.min(100, Math.round(percent)));
}

export function getWordAtPosition(book: Book, position: Position): string | null {
  const paragraph = book.paragraphs[position.paragraphId];
  if (!paragraph) return null;

  const words = tokenizeParagraph(paragraph.text);
  if (position.wordIndex < 0 || position.wordIndex >= words.length) {
    return null;
  }

  return words[position.wordIndex];
}

export function getNextPosition(book: Book, position: Position): Position | null {
  const paragraph = book.paragraphs[position.paragraphId];
  if (!paragraph) return null;

  const words = tokenizeParagraph(paragraph.text);
  if (position.wordIndex + 1 < words.length) {
    return {
      paragraphId: position.paragraphId,
      wordIndex: position.wordIndex + 1
    };
  }

  let nextParagraphId = position.paragraphId + 1;
  while (nextParagraphId < book.paragraphs.length) {
    const next = book.paragraphs[nextParagraphId];
    const nextWords = tokenizeParagraph(next.text);
    if (nextWords.length === 0) {
      nextParagraphId += 1;
      continue;
    }
    return {
      paragraphId: nextParagraphId,
      wordIndex: 0
    };
  }

  return null;
}