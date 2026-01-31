# Mobile App Experiment Notes

## Needs
- Ship the app as a full mobile app for iOS and Android.
- Access local files without the limitations of a web-only app.
- Keep changes minimal to the existing Next.js codebase.
- Preserve the web version alongside mobile.

## First Experiment: Capacitor Wrapper
We will wrap the existing Next.js app with Capacitor to produce native iOS/Android builds.

## Why This Choice
- Minimal changes: keep the current React/Next.js UI and logic.
- Native file access via Capacitor plugins (file picker/filesystem).
- One codebase serves web + native builds.
- Fastest path to validate mobile viability before deeper rewrites.
