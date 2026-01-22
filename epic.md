---
id: "c766c576-a4aa-4e39-b899-b9d57fd621e9"
title: "Epic Brief: Speed Reading PWA"
createdAt: "1769094175445"
updatedAt: "1769094217686"
type: spec
---

# Epic Brief: Speed Reading PWA

## Summary

Build a mobile-friendly Progressive Web App (PWA) that enables speed reading through rapid sequential visual presentation (RSVP) of text, one word at a time. The app features two complementary reading modes: **Speed Reading Mode** for focused, paced consumption, and **Normal Reading Mode** for detailed review and context. Users can seamlessly transition between modes, adjust reading pace (100-600 WPM), and manage a library of texts with automatic progress tracking. The initial version will use a hardcoded EPUB file and leverage proven EPUB parsing and scroll performance patterns from the existing petra_reader codebase.

## Context & Problem

### Who's Affected
- **Speed reading enthusiasts** who want to improve reading efficiency and comprehension
- **Busy readers** who need to consume large volumes of text quickly
- **Mobile users** who want a distraction-free reading experience on their phones
- **Language learners** who benefit from focused, word-by-word presentation

### Current Pain Points

**1. Lack of Accessible Speed Reading Tools**
- Most speed reading apps are desktop-only or require expensive subscriptions
- Mobile speed reading experiences are often clunky and not optimized for touch interfaces
- No seamless way to switch between speed reading and normal reading for context checking

**2. Poor Reading Progress Management**
- Users lose their place when switching between devices or sessions
- No library management for organizing multiple texts
- Reading progress isn't preserved across sessions

**3. Limited Customization**
- Fixed reading speeds that don't adapt to user skill level or content difficulty
- No visual customization (themes, fonts) for different reading preferences
- One-size-fits-all approach doesn't accommodate individual reading styles

### Where in the Product

This is a **new standalone PWA** that will:
- Function as an installable mobile-first web application
- Operate entirely client-side with localStorage for data persistence
- Use Next.js App Router with static export (`output: 'export'`); dynamic routes like `/reader/[bookId]` must be pre-generated at build time (MVP: one known `bookId`)
- Reuse EPUB parsing logic from file:petra_reader/convex/utils/epub.ts
- Adopt scroll performance patterns from file:petra_reader/src/app/reader/[bookId]/page.tsx
- Initially hardcode file:La Sangre de los Elfos - Andrzej Sapkowski.epub as the reading material

### Core User Need

**"I want to read faster without losing comprehension, with the flexibility to slow down and review context when needed, all on my mobile device."**

The app addresses this by:
1. **Speed Reading Mode**: Presents one word at a time at a user-controlled pace (WPM), minimizing eye movement and maximizing focus
2. **Normal Reading Mode**: Provides full-text scrollable view for detailed reading, context checking, and comprehension verification
3. **Seamless Transitions**: Pause button fades to normal mode; resume button returns to speed reading
4. **Progress Persistence**: Automatically saves reading position and resumes from last location
5. **Customization**: Adjustable WPM (100-600), font sizes, and color themes (dark/light)

### Technical Foundation

**EPUB Parsing** (from petra_reader):
- Use `epub2` + `cheerio` to extract paragraphs with IDs
- Preserve chapter structure for navigation
- Handle TOC, anchors, and text matching for chapter detection

**Scroll Performance** (from petra_reader):
- Chunked loading: 50 paragraphs per chunk
- Windowed approach: Load visible chunks + 2-chunk padding on each side
- Dynamic pruning: Remove chunks outside the visible window
- Placeholder strategy: Pre-allocate array, overlay loaded chunks
- Debounced saves: Save reading position after 1 second of scroll stability
- Virtualization: Use `@tanstack/react-virtual` for efficient rendering

**Technology Stack**:
- Next.js (React) App Router with static export
- Tailwind CSS v4 for styling (mobile-first)
- localStorage for client-side data persistence (library, progress, settings)
- Basic PWA features (installable, manifest) with a minimal offline fallback page
- Mobile-first responsive design

### Success Criteria

1. **Functional Speed Reading**: Users can read at adjustable speeds (100-600 WPM) with smooth word transitions
2. **Seamless Mode Switching**: Pause triggers fade transition to normal mode; resume button returns to speed reading
3. **Progress Persistence**: Reading position auto-saves and resumes correctly across sessions
4. **Performance**: Normal reading mode scrolls smoothly without lag or waterfall re-renders
5. **Customization**: Users can adjust WPM, font size/style, and color themes
6. **Library Management**: Users can save and manage multiple texts (future-ready, though initially hardcoded)
7. **Mobile-Friendly**: Touch-optimized interface that works well on mobile devices
8. **PWA Installability**: App can be installed to home screen and functions as standalone app

### Out of Scope (Initial Version)

- Text upload/import functionality (deferred for later)
- Reading statistics, bookmarks, or highlights
- Text-to-speech or dictionary features
- Full offline support with service workers
- Backend services or cloud sync
- Multi-device synchronization
- Social features or sharing capabilities
