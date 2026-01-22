import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load as loadHtml } from "cheerio";
import EPub from "epub2";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOOK_ID = "la-sangre-de-los-elfos";
const EPUB_FILENAME = "La Sangre de los Elfos - Andrzej Sapkowski.epub";

type Paragraph = {
  id: number;
  text: string;
  chapterIndex: number;
};

type Chapter = {
  index: number;
  title: string;
  startParagraphId: number;
};

type BookJson = {
  id: string;
  title: string;
  author?: string;
  paragraphs: Paragraph[];
  chapters: Chapter[];
  totalWords: number;
};

function tokenize(text: string): string[] {
  return text
    .split(/\s+/)
    .map((word) => word.replace(/^["']+|["']+$/g, ""))
    .filter((word) => word.length > 0);
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function processEpub() {
  const projectRoot = path.resolve(__dirname, "..");
  const epubPath = path.join(projectRoot, EPUB_FILENAME);
  const outputDir = path.join(projectRoot, "public", "books");
  const outputPath = path.join(outputDir, `${BOOK_ID}.json`);

  await ensureDir(outputDir);

  const epub = await EPub.createAsync(epubPath, "/images/", "/chapters/");

  const title = (epub.metadata && epub.metadata.title) || "La Sangre de los Elfos";
  const author = (epub.metadata && epub.metadata.creator) || "Andrzej Sapkowski";

  const paragraphs: Paragraph[] = [];
  const chapters: Chapter[] = [];

  for (let index = 0; index < epub.flow.length; index += 1) {
    const flowItem = epub.flow[index];
    const chapterId = flowItem.id;
    const chapterTitle = flowItem.title || `Chapter ${index + 1}`;

    const rawHtml = await epub.getChapterRaw(chapterId);
    const $ = loadHtml(rawHtml);

    const startParagraphId = paragraphs.length;

    $("p").each((_, el) => {
      const text = $(el).text().trim();
      if (!text) return;
      const paragraph: Paragraph = {
        id: paragraphs.length,
        text,
        chapterIndex: index
      };
      paragraphs.push(paragraph);
    });

    if (paragraphs.length > startParagraphId) {
      chapters.push({
        index,
        title: chapterTitle,
        startParagraphId
      });
    }
  }

  const totalWords = paragraphs.reduce((sum, paragraph) => sum + tokenize(paragraph.text).length, 0);

  const bookJson: BookJson = {
    id: BOOK_ID,
    title,
    author,
    paragraphs,
    chapters,
    totalWords
  };

  await fs.writeFile(outputPath, JSON.stringify(bookJson), "utf8");
  // eslint-disable-next-line no-console
  console.log(`Processed EPUB → ${outputPath}`);
}

processEpub().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to process EPUB:", error);
  process.exit(1);
});