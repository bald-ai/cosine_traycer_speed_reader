export type Paragraph = {
  id: number;
  text: string;
  chapterIndex?: number;
};

export type Chapter = {
  index: number;
  title: string;
  startParagraphId: number;
};

export type Book = {
  id: string;
  title: string;
  author?: string;
  coverUrl?: string;
  paragraphs: Paragraph[];
  chapters: Chapter[];
  totalWords: number;
};