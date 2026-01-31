# Chapter Extraction Broken

## Status
**BROKEN** - Needs to be fixed later

## Problem
The current chapter extraction implementation in `scripts/process-epub.ts` is not working correctly. It fails to properly identify and extract chapters from EPUB files, resulting in missing or incorrect chapter information.

## Context
Chapter extraction is critical for:
- Displaying chapter titles in the reader
- Tracking reading progress by chapter
- Navigating between chapters
- Building a proper table of contents

## Known Issues
- TOC-based detection not implemented
- Anchor matching not working
- Text content matching fallback missing
- Path normalization not handling various EPUB formats

## Next Steps
- Review the petra_reader project (`/Users/michalkrsik/windsurf_project_folder/petra_reader/convex/utils/epub.ts`) for a working implementation
- Implement proper TOC parsing and anchor-based chapter detection
- Add fallback mechanisms for edge cases

## Notes
- See `petra_reader/convex/utils/epub.ts` for reference implementation
- The working implementation includes:
  - TOC lookup structures (tocIdMap, tocAnchorMap, tocFileMap)
  - Anchor-based chapter detection
  - Text matching fallback
  - Path normalization for various EPUB formats
  - Heading extraction from HTML

Created: 2026-01-31
