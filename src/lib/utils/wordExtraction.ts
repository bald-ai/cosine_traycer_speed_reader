export function tokenizeParagraph(text: string): string[] {
  return text
    .split(/\s+/)
    .map((word) => word.replace(/^[\"']+|[\"']+$/g, ""))
    .filter((word) => word.length > 0);
}

export function getWordCount(text: string): number {
  return tokenizeParagraph(text).length;
}