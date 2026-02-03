# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Commands

```bash
# Development (Linux — single command; Windows — run these in two separate terminals)
npm run dev            # Linux: starts React dev server + Electron concurrently
npm run dev:react      # Windows terminal 1: React dev server on localhost:3000
npm run dev:electron   # Windows terminal 2: Electron window (wait for dev server first)

# Build & release
npm run build          # React build + Electron package (current platform)
npm run release        # React build + Electron package (Windows + Linux)

# Tests (custom runner, not Jest — each test file exports a run() function)
node test/run.js test_scan.js
node test/run.js test_fstat.js
node test/run.js test_write.js

# Linux sandbox fix (after Electron updates)
npm run fix            # Sets SUID on chrome-sandbox; requires sudo

# Clean rebuild
npm run fresh          # Deletes dist/, build/, node_modules/, package-lock.json, reinstalls
```

---

## Architecture Overview

MaweJS is an Electron desktop app for long-form story writing. It is "externally unstructured" (continuous draft view like Word) but "internally structured" (acts → chapters → scenes, like Scrivener). The metadata (synopsis, comments, tags) annotates **text**, not tree nodes, so the story can be restructured freely.

### Process Boundary

```
Electron Main Process          │  Renderer Process (React)
  public/electron.js           │    src/index.js  →  src/gui/app/app.js
  public/backend/hostfs.js     │    src/system/localfs.js  (thin IPC proxy)
  public/backend/hostdialog.js │    src/system/dialog.js
  public/backend/hostapp.js    │    src/system/host.js
        ↑                       │         ↓
        └── IPC via electron-better-ipc ──┘
            dispatched through public/backend/ipcdispatch.js
```

All file-system and dialog calls from the renderer go through `window.ipc.callMain(channel, [cmd, ...args])`. The channel names are `"hostfs"`, `"dialog"`, and `"app"`. `ipcdispatch.js` is the single switch-statement that routes commands to the corresponding `host*.js` handler. The same dispatcher is used by the test runner (`test/run.js`) to mock IPC without Electron.

### Renderer Layer Structure

| Directory | Responsibility |
|-----------|---------------|
| `src/gui/app/` | Root `App` component, Redux store, settings persistence, view routing, file-operation commands (`CmdContext`) |
| `src/gui/editor/` | Draft editing view, tag table, word count table |
| `src/gui/slatejs/` | SlateJS rich-text editor integration — plugins, marks, search, folding, drag-and-drop |
| `src/gui/common/` | Shared UI primitives (`factory.js`: VBox/HBox/Button/etc.), icons, hotkeys, theme provider |
| `src/gui/import/` | Import dialogs and preview for TXT/DOCX/clipboard |
| `src/gui/export/` | Export dialog |
| `src/gui/stats/` | Statistics / progress view (uses Recharts) |
| `src/gui/arc/` | Story-structure arc visualization |
| `src/gui/sketches/` | Experimental / work-in-progress views (file browser, organizer, workspace bar) |
| `src/document/` | Document model: load, save, create, export. Format migration lives here. |
| `src/document/xmljs/` | `.mawe` XML serialization (`load.js`, `save.js`), tree representation, migration between file-format versions |
| `src/document/export/` | Export formatters: `formatRTF`, `formatHTML`, `formatTEX`, `formatTXT` (also Markdown) |
| `src/system/` | Thin wrappers around IPC: `localfs.js` (file ops), `dialog.js` (open/save dialogs), `host.js` (app-level: quit, info) |
| `src/util/` | Generic utilities and gzip compression (`compress.js` wraps pako) |

### State Management

Redux Toolkit with three slices in `src/gui/app/store/`:

- **`docSlice`** — tracks the currently-open document (`edit` field), loading state, and caches loaded document content in a module-level `docs` map keyed by file ID. State syncs to `settings_doc.json` via `localfs.settingswrite`.
- **`cwdSlice`** — current working directory for the file browser.
- **`workspaceSlice`** — workspace / recent-files state.

Settings (theme choice, recent files, etc.) use `localStorage` via the `useSetting` hook in `settings.js`.

### Document Model & File Format

- Files are `.mawe` (XML) or `.mawe.gz` (gzip-compressed XML).
- Hierarchy: `<story>` → `<body>` → acts → chapters → scenes. Each scene can be regular content, synopsis, or notes.
- Elements within scenes: paragraphs, headings, comments (not exported), fillers (word-count placeholders), tags.
- `src/document/xmljs/migration.js` handles upgrading older file formats on load.
- The `mawe` object exported from `src/document/index.js` is the primary API: `mawe.load(file)`, `mawe.save(doc)`, `mawe.create(buffer)`, etc.

### SlateJS Integration

The editor is built on SlateJS (`src/gui/slatejs/`). Key files:
- `slateEditor.js` — core editor instance, plugin pipeline, normalization.
- `slateMarks.js` — bold, italic, underline, etc.
- `slateFolding.js` — collapse/expand sections in the draft view.
- `slateDnD.js` — drag-and-drop scene reordering.
- `slateSearch.js` — find/replace within the editor.

Normalization (keeping the Slate tree valid after edits) has been a source of bugs — see recent commits around the circuit-breaker pattern.

### Autosave & Graceful Shutdown

- Periodic auto-save runs in the background (see `125d7f0`).
- On close, Electron sends a `confirm-close` IPC message; the renderer can `cancel-close` if there are unsaved changes (see `8c3d297`).

### Theme System

Themes are defined in `src/gui/common/themes/` (light and dark). A `ThemeContext` at the root (`src/index.js`) allows dynamic switching at runtime (`bba47ec`).

---

## Key Conventions

- **IPC pattern:** Renderer calls `window.ipc.callMain(channel, [command, ...args])`. Never call Node/Electron APIs directly from renderer code.
- **File identity:** Files are tracked by an `id` field (the full path) inside a file descriptor object `{ id, name, ... }`. Use `localfs.fstat(path)` to get one.
- **No TypeScript.** Pure JavaScript with ES module syntax (`import`/`export`) in `src/`, CommonJS (`require`) in `public/` (Electron main process).
- **CSS:** Component-local `.css` files alongside their JS. MUI's Emotion handles theming styles.
- **Test mocking:** Tests mock Electron by setting `global.window.ipc.callMain` to `ipcDispatch` directly — no test framework, just a `run(args)` export per file.
- **`sketches/` directory:** Contains experimental or incomplete features. Don't assume code there is stable or used.
