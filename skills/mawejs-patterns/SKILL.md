---
name: mawejs-patterns
description: Coding patterns extracted from MaweJS — an Electron + React desktop app for long-form story writing
version: 1.0.0
source: local-git-analysis
analyzed_commits: 10
---

# MaweJS Patterns

MaweJS is an Electron desktop application for long-form story writing. It is "externally unstructured" (continuous draft view) but "internally structured" (acts → chapters → scenes). The app is built with React 19, SlateJS for the rich-text editor, Redux Toolkit for state, and MUI for theming.

---

## Commit Conventions

The project uses **conventional commits** with scoped prefixes. Observed patterns from recent history:

| Prefix | Example |
|---|---|
| `feat(scope):` | `feat(autosave): Implement periodic background auto-save` |
| `fix(scope):` | `fix(ui): Make fold toggle clickable and fix Word Frequency dark mode` |
| `refactor(scope):` | `refactor(app): Improve save robustness and implement graceful shutdown` |

Common scopes: `ui`, `app`, `export`, `autosave`. A small number of commits use no prefix (e.g. bare `update` or a plain sentence). Prefer the conventional-commit style when writing commit messages.

---

## Code Architecture

```
public/                         # Electron main-process (CommonJS / require)
├── electron.js                 # App entry, BrowserWindow setup
└── backend/
    ├── ipcdispatch.js          # Central IPC router (switch on channel + command)
    ├── hostfs.js               # File-system operations
    ├── hostdialog.js           # OS file/save dialogs
    ├── hostapp.js              # App-level commands (quit, beep, close handshake)
    ├── ipcmain.js              # Registers IPC handlers with Electron
    └── services.js             # Shared backend utilities

src/                            # Renderer process (ES modules / import-export)
├── index.js                    # React root, ThemeContext provider
├── system/                     # Thin IPC proxy wrappers
│   ├── localfs.js              #   → hostfs commands
│   ├── dialog.js               #   → hostdialog commands
│   └── host.js                 #   → hostapp commands
├── document/                   # Document model (load / save / export / migration)
│   ├── index.js                # Public API: mawe.load(), mawe.save(), mawe.create()
│   ├── xmljs/                  # .mawe XML ↔ JS tree (load, save, migration, tree)
│   └── export/                 # Formatters: RTF, HTML, TeX, TXT, Doc
├── gui/
│   ├── app/                    # Root App component, Redux store, CmdContext, settings
│   │   └── store/              # Redux slices: docSlice, cwdSlice, workspaceSlice
│   ├── slatejs/                # SlateJS integration (editor, marks, folding, DnD, search)
│   ├── editor/                 # Draft view, tag table, word-count table
│   ├── common/                 # Shared primitives (factory.js), icons, hotkeys, themes
│   │   └── themes/             # lightTheme.js / darkTheme.js
│   ├── import/                 # Import dialogs (TXT, DOCX, clipboard)
│   ├── export/                 # Export dialog
│   ├── arc/                    # Story-arc visualization
│   ├── stats/                  # Statistics view (Recharts)
│   └── sketches/               # Experimental / WIP views — not stable
└── util/                       # Generic utilities, gzip compression (pako)

test/                           # Custom test runner (not Jest)
├── run.js                      # Entry: mocks window.ipc, loads test via esm
├── test_fstat.js
├── test_scan.js
└── test_write.js
```

### Key architectural rules

- **No TypeScript.** Pure JavaScript with ES module syntax (`import`/`export`) in `src/`, CommonJS (`require`) in `public/`.
- **CSS is component-local.** Each component has a `.css` file alongside its `.js` file. MUI Emotion handles theming.
- **`sketches/` is experimental.** Do not treat anything there as stable or production code.

---

## IPC Pattern (Critical)

All communication between the renderer and the Electron main process goes through a single IPC bridge. **Never call Node.js or Electron APIs directly from renderer code.**

### Renderer side (`src/system/`)

Each `host*` module wraps `window.ipc.callMain` for a single channel:

```js
// src/system/localfs.js
function fscall(cmd, ...args) {
  return window.ipc.callMain("hostfs", [cmd, ...args]);
}

export function read(fileid)        { return fscall("read", fileid); }
export function write(fileid, data) { return fscall("write", fileid, data); }
// ... etc
```

### Main-process side (`public/backend/ipcdispatch.js`)

A single switch statement routes `[channel][command]` → handler function:

```js
function ipcDispatch(channel, params, browserWindow) {
  const [cmd, ...args] = params;
  switch (channel) {
    case "hostfs": {
      switch (cmd) {
        case "read":  return hostfs.fsRead(...args);
        case "write": return hostfs.fsWrite(...args);
        // ...
      }
    }
    // ...
  }
}
```

When adding a new backend capability: add the handler in the appropriate `host*.js`, wire it into `ipcdispatch.js`, then expose it through the matching `src/system/*.js` proxy.

---

## File Co-Change Clusters

These groups of files tend to change together. When touching one, check the others:

| Cluster | Files |
|---|---|
| **IPC layer** | `public/backend/hostfs.js`, `hostdialog.js`, `hostapp.js`, `ipcdispatch.js`, `services.js`, `public/electron.js`, `src/system/localfs.js` |
| **Theme / UI globals** | `src/gui/common/theme.js`, `themes/lightTheme.js`, `themes/darkTheme.js`, `styles/colors.css`, `styles/sheet.css`, `factory.js`, `factory.css`, `icons.js` |
| **App root + context** | `src/gui/app/app.js`, `src/gui/app/app.css`, `src/gui/app/context.js` |
| **Editor view** | `src/gui/editor/editor.js`, `src/gui/editor/wordTable.js`, `src/gui/slatejs/slateEditable.js`, `styles/sheet.editor.css` |

---

## State Management

Redux Toolkit with three slices in `src/gui/app/store/`:

- **`docSlice`** — currently-open document. A module-level `docs` map caches loaded content by file ID. State syncs to `settings_doc.json` via `localfs.settingswrite`.
- **`cwdSlice`** — current working directory (file browser).
- **`workspaceSlice`** — workspace / recent-files state.

Settings (theme, recent files, etc.) use `localStorage` through the `useSetting` hook in `settings.js`.

---

## Document Model

- File formats: `.mawe` (XML) and `.mawe.gz` (gzip-compressed XML via pako).
- Hierarchy: `<story>` → `<body>` → acts → chapters → scenes.
- The public API lives in `src/document/index.js`: `mawe.load(file)`, `mawe.save(doc)`, `mawe.create(buffer)`.
- `src/document/xmljs/migration.js` upgrades older file-format versions on load. When changing the on-disk format, add a migration step here.

---

## Testing Conventions

Tests use a **custom runner**, not Jest or Vitest. Each test file exports a `run(args)` function. The runner (`test/run.js`) bootstraps a fake `window.ipc` by wiring `callMain` directly to `ipcdispatch`, then loads the test via `esm`.

```bash
# Run a single test
node test/run.js test_scan.js
node test/run.js test_fstat.js
node test/run.js test_write.js
```

Test structure:
```js
// test/test_scan.js
export function run(args) {
  scandocs(...args);
}

function scandocs(directory) {
  // exercise the code, log results, assert manually
}
```

There is no assertion library — tests log output and rely on manual inspection or thrown errors. The IPC mock means backend file-system code can be tested without Electron.

---

## Build & Development Workflow

```bash
# Development (Windows: two terminals)
npm run dev:react       # Terminal 1 — React dev server on localhost:3000
npm run dev:electron    # Terminal 2 — Electron window (wait for dev server first)

# Build
npm run build           # React build + Electron package (current platform)
npm run release         # React build + Electron package (Windows + Linux)

# Clean rebuild
npm run fresh           # Deletes dist/, build/, node_modules/, package-lock.json; reinstalls
```

---

## Hotspots & Known Complexity

- **SlateJS normalization** (`src/gui/slatejs/slateEditor.js`) — keeping the Slate tree valid after edits has been a recurring source of bugs. A circuit-breaker pattern was added to prevent infinite normalization loops. Treat changes here with care.
- **Autosave & shutdown handshake** — the renderer can cancel an app close if there are unsaved changes (`confirm-close` / `cancel-close` IPC). See `hostapp.js` and `app.js`.
- **Null safety in export** (`src/document/export/formatDoc.js`) — story acts can be null; formatters must guard against this.

---

## Most-Changed Files (by commit frequency)

| File | Commits |
|---|---|
| `src/gui/app/app.js` | 4 |
| `src/gui/slatejs/slateEditor.js` | 3 |
| `src/gui/app/app.css` | 3 |
| `src/system/localfs.js` | 2 |
| `src/gui/slatejs/slateEditable.js` | 2 |
| `src/gui/common/theme.js` | 2 |
| `public/backend/ipcdispatch.js` | 2 |
