# Small Steps — interface direction

The reference composer suggests soft charcoal, a generous rounded input, and a quiet model control near Send. The app extends that direction with muted forest surfaces, a mint accent for completed actions, and a custom ascending-step mark. Everything is rendered locally; the app needs no network fonts or remote artwork.

## Research and decisions

- **Linear:** [A calmer interface for a product in motion](https://linear.app/now/behind-the-latest-design-refresh) emphasizes a receding sidebar, predictable actions, subtle separators, and restrained icons. Small Steps uses a consistent line-icon family, quiet navigation, a shared header, and a command palette. The main content, sidebar, and coach scroll independently.
- **Things:** [Features](https://culturedcode.com/things/features/) demonstrates the value of structured task views, quick entry, and smooth interactions. Small Steps separates Today, Progress, Reflections, and the Habit Library. N creates a habit; Ctrl K finds actions; filters and search narrow the current day without losing its context.
- **Streaks:** [Product overview](https://streaksapp.com/) makes completion and continued practice visible. Small Steps uses check-in feedback, streak labels, a weekly strip, and day-by-day statistics. A two-minute check-in counts as showing up, and recovery language stays encouraging.

## Interaction details

- Check-ins support a brief undo action. Finishing a day's habits plays a small confetti burst.
- The two-minute focus timer supports start, pause, resume, reset, minimize, and explicit completion. It does not mark a habit automatically and does not persist through app exit.
- Progress offers 7/30/90-day windows. Chart bars and calendar cells open their day's habits.
- Six library templates are editable before creation. No fabricated habits or history are inserted into the user's profile.
- Reflection entries store a mood and a short note locally and are included in normal JSON backups. Reflections are not added to AI context.
- Chat supports model selection in the composer, draft prompts about a selected habit, response copying, and an expandable writing area.
- Menus, dialogs, controls, and keyboard navigation use native accessible elements. Animations honor the operating system's reduced-motion preference.

## Verification

`node scripts/design-smoke.cjs` exercises the flows in an isolated Electron profile. Screenshots in `test-results/` contain test data only. Existing provider/authentication regression checks are in `scripts/openai-smoke.cjs`; they use mocked API replies, with no API charge.
