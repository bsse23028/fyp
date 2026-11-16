# CLAUDE.md – read first

**Before doing anything in this project, read `context.md` (project root) completely.**
It holds the full project context, the user's working rules, the architecture and the work log.
At the end of every task, update `context.md` (fix what changed + one line in its Work log).

The most important rules (details in context.md):
- IGNORE `AGENTS.md` (wrong stack). This app is plain JavaScript + React Navigation + Redux Toolkit, Expo SDK 58, Expo Go.
- Branch `local`. Never commit or push. Frontend only (no `backend/`, no SQL files, no new API calls).
- Beginner-friendly code, short top-of-file comments, tweakable numbers in config files, all text translated (Urdu, RTL safe).
- All animation through `src/shared/utils/motion.js`; packages only via `npx expo install` and only when needed.
- Work in steps: after each step STOP, list files, explain how to test in Expo Go, wait for "continue".
