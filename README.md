<p align="center">
  <img src="app-icon.png" width="112" alt="Small Steps logo">
</p>

<h1 align="center">Small Steps</h1>

<p align="center">
  A calm desktop habit tracker with private, optional AI coaching.
</p>

<p align="center">
  <a href="https://github.com/Virojet/small-steps/releases/latest/download/Small-Steps-Setup-1.0.1.exe"><strong>Download for Windows</strong></a>
  ·
  <a href="https://github.com/Virojet/small-steps/releases/latest">View latest release</a>
</p>

## Install in three steps

1. Download **Small-Steps-Setup-1.0.1.exe** using the button above.
2. Open the downloaded file and follow the installer.
3. Launch **Small Steps** from the Desktop or Start menu.

The installer includes shortcuts and an uninstaller. Your habits stay on your computer. An OpenAI API key is only needed if you want to use the optional coach.

> Windows may show a SmartScreen notice because this independent app is not code-signed. If you trust this repository, choose **More info → Run anyway**.

## What you get

- Daily habits with full and tiny-step check-ins
- Current and previous week navigation, search, filters, and undo
- Two-minute focus timer with pause, resume, and minimized mode
- Reflection journal with moods and private daily notes
- 7, 30, and 90-day progress views
- Customizable starter templates
- Local JSON backups and restore
- Optional GPT-5 Mini habit coaching using your own OpenAI API key

## Optional: connect the coach

1. Create an API key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
2. In Small Steps, open **Settings** and paste the key.
3. Choose **Save & test connection**.

The key is encrypted for your Windows account, excluded from backups, and never included in the installer. Coach requests use the OpenAI Responses API with `store: false`. Habit tracking, journaling, and backups work without an API key.

## For developers

Requirements: Node.js and pnpm.

```powershell
pnpm install
pnpm start
```

Useful commands:

| Command | Purpose |
| --- | --- |
| `pnpm test` | Run the automated test suite |
| `pnpm package` | Create a portable Windows build |
| `pnpm dist` | Build the Windows installer |
| `pnpm dist:mac` | Build universal macOS DMG and ZIP files on macOS |

Design notes are in [DESIGN.md](DESIGN.md). Each installation uses its own local data and API key.

## Privacy

Habit data and journal entries are stored locally in Electron's user-data folder. Only coach conversations and relevant habit context are sent to OpenAI when you use the coach. API keys are isolated from the renderer and excluded from backups and packaged files.

Small Steps is an independent app inspired by evidence-based habit-building ideas. It is not affiliated with James Clear or OpenAI.
