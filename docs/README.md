# Small Steps — Web Edition (GitHub Pages Ready)

Small Steps is an atomic habit tracker inspired by James Clear's *Atomic Habits*, featuring a daily Momentum Ring, Crystal Web Audio chimes, Dark/Light theme switching, a 2-minute focus timer, reflection journaling, and an integrated **AI Habit Coach**.

## 🚀 GitHub Pages Deployment

This folder (`docs/`) is pre-configured and ready for one-click deployment to GitHub Pages.

### Option 1: Direct GitHub Pages Setup (No Actions needed)
1. Push your repository to GitHub.
2. In your GitHub repository, go to **Settings** → **Pages**.
3. Under **Build and deployment** → **Source**, select **Deploy from a branch**.
4. Set Branch to `main` (or `master`) and folder to `/docs`.
5. Click **Save**. Within 1–2 minutes, your website will be live at `https://<your-username>.github.io/<repo-name>/`!

### Option 2: Automated GitHub Actions Workflow
A ready-to-use GitHub Actions workflow is located at `.github/workflows/deploy.yml`. When enabled:
1. In repository **Settings** → **Pages**, select **GitHub Actions** as the Source.
2. Every push to `main` will automatically build and publish your site.

---

## 🌟 Key Features

1. **Daily Habit Rhythm & Momentum Ring**:
   - Visual SVG completion arc displaying daily win percentage, active streak, and flow tier.
   - Group habits by period: ☀ Morning, ◷ Afternoon, ☾ Evening, ◌ Anytime.
   - Check off habits or complete a **2-minute version** ("tiny step").
   - Click to undo anytime.

2. **Crystal Web Audio Synthesizer**:
   - Procedural Web Audio API major chord arpeggio chime on every completed habit.
   - Triumphant celebration chime and confetti cascade when all daily habits are achieved.
   - Quick mute/unmute toggle (`S` key or header button).

3. **AI Habit Coach**:
   - Directly powered by OpenAI's official API models:
     - `GPT-5 Mini` (Fast & responsive)
     - `GPT-5.6 Luna` (Reflective & mindful)
     - `GPT-5.6 Terra` (Grounded habit structure)
     - `GPT-5.6 Sol` (High-energy motivation)
     - `GPT-6 Astra` (Deep reasoning & system design)
   - 1-Click **🌅 Morning Kickstart** and **🌙 Evening Review** action buttons.
   - Context-aware coaching using your actual daily habits.
   - API key stored locally in browser `localStorage`.

4. **Focus Timer**:
   - Built-in 2-minute countdown timer with circular progress and minimize dock.

5. **Reflection Journal**:
   - Daily reflections with mood tracking, searchable historical journal entries.

6. **Full Data Portability**:
   - Export and import JSON backups seamlessly between the Web Edition and Desktop app.
