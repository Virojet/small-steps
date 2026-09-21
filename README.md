# Small Steps

A Windows and macOS desktop habit tracker inspired by Atomic Habits, with OpenAI coaching. Existing AI settings migrate to OpenAI while preserving habits and conversation history.

## Connect OpenAI

1. Open https://platform.openai.com/api-keys and create a project API key named Small Steps.
2. Check your API credit and billing at https://platform.openai.com/settings/organization/billing/overview.
3. Open Small Steps → Settings, then paste your OpenAI API key. The coach uses `gpt-5-mini`.
4. Click **Save & test connection**. This sends only a small test message, without habits or conversation history. Normal API charges apply.
5. Once connected, close Settings and talk to your coach.

The OpenAI connection uses the Responses API. Keys are encrypted on this Windows account, never displayed after saving, and excluded from backups. Responses use `store: false`; this does not override OpenAI's applicable API data policies. The coach sends habit context and recent conversation when you chat. A key from another provider does not work with OpenAI.

Reference: https://developers.openai.com/api/docs/quickstart and https://developers.openai.com/api/docs/guides/text.

## Run

Open `dist/Small Steps/Small Steps.exe` or use the Desktop shortcut. No browser or separate server is needed.

## Share on Windows

Give friends `release/Small-Steps-Setup-1.0.0.exe`. The installer creates Start Menu and Desktop shortcuts and includes an uninstaller. Each person enters their own OpenAI API key in Settings or the Coach panel; API keys are never included in the installer.

For development, install Node.js and pnpm, run `pnpm install`, `node node_modules/electron/install.js` if needed, then `pnpm start`. Run `pnpm test` for calendar and validation tests; `pnpm package` creates a portable Windows folder, while `pnpm dist` creates the Windows installer.

## Share on macOS

Run `pnpm dist:mac` on a Mac to create a universal DMG and ZIP for both Apple Silicon and Intel Macs. The included GitHub Actions workflow can build the same files on a macOS runner after the project is pushed to GitHub.

For a release friends can open without a Gatekeeper warning, add an Apple Developer `Developer ID Application` certificate and notarization credentials as the workflow's `CSC_LINK`, `CSC_KEY_PASSWORD`, `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, and `APPLE_TEAM_ID` secrets. Each person still enters their own OpenAI API key after installation.

## Features

- Dark charcoal interface with original steps branding, mint accents, motion, and reduced-motion support.
- Search and filter today's habits, browse previous weeks, and undo a check-in.
- Ctrl K command palette, N for a new habit, T for Today, and Ctrl / for the coach.
- Two-minute focus timer with pause, resume, reset, minimize, and explicit tiny-step completion. Timer sessions last until the app closes.
- Six customizable habit templates, 7/30/90-day progress charts, and clickable history cells.
- Local reflection journal with mood and daily notes; entries are included in backups and not sent to AI.
- Collapsible coach panel, habit-specific prompt drafts, and response copying.

Design references and decisions are documented in [DESIGN.md](DESIGN.md). UI checks: `node scripts/design-smoke.cjs` (uses an isolated test profile).

- Identity goal, habit stacking cue, two-minute version, reward, and daily schedule.
- Full or tiny-step check-ins, current-week backfill, streaks, eight-week history, and recovery prompts.
- Habit creation, editing, deletion, and JSON backups with restore confirmation.
- AI habit coach powered by the user's own OpenAI API key and GPT-5 Mini.
- Offline tracking. JSON data in Electron's userData folder. API keys are encrypted with the operating system's secure storage, isolated from the renderer and excluded from backups and packaged files.

The app starts with no fabricated history. Add a habit or choose a starter. In Settings, paste your own OpenAI API key. Chat sends messages and habit context to OpenAI; all other tracking is local. Back up your progress from Settings.

Reference: https://jamesclear.com/habit-tracker and https://jamesclear.com/habit-stacking. Independent app; not affiliated with James Clear.
