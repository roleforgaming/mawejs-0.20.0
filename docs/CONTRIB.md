# Contributing to MaweJS

## Development Workflow

### Prerequisites

- **Node.js** and **npm** (or equivalent package manager)
- **Git** for version control
- On Linux: `sudo` access for sandbox fix

### Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/mkoskim/mawejs.git
   cd mawejs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development environment**

   **Linux (single command):**
   ```bash
   npm run dev
   ```

   **Windows (two separate terminals):**
   ```bash
   # Terminal 1: Start React development server
   npm run dev:react

   # Terminal 2: Start Electron app (wait for dev server to be ready first)
   npm run dev:electron
   ```

### Available Scripts

| Script | Description | Usage |
|--------|-------------|-------|
| `npm run dev` | Start React dev server + Electron concurrently (Linux only) | `npm run dev` |
| `npm run dev:react` | Start React development server on localhost:3000 | Terminal 1 on Windows |
| `npm run dev:electron` | Start Electron window with dev tools | Terminal 2 on Windows (after dev:react) |
| `npm run build` | Build React + package Electron (current platform) | Production builds |
| `npm run release` | Build React + package Electron for Windows & Linux | Cross-platform release |
| `npm run react-start` | React dev server with no browser auto-open | Development |
| `npm run react-build` | Optimized React production build | Build step |
| `npm run react-test` | Run React test suite | Testing |
| `npm run react-eject` | Eject from Create React App configuration | Advanced only |
| `npm run audit` | Audit production dependencies for vulnerabilities | Security |
| `npm run fresh` | Clean rebuild: delete dist/, build/, node_modules/, package-lock.json | Recovery |
| `npm run fix` | Set SUID on chrome-sandbox for Linux (requires sudo) | Linux sandbox fix |
| `npm run electron-build` | Build Electron package for current platform | Packaging |
| `npm run electron-build-mwl` | Build Electron packages for Windows & Linux | Cross-platform packaging |

### Testing

Custom test runner (not Jest):

```bash
node test/run.js test_scan.js
node test/run.js test_fstat.js
node test/run.js test_write.js
```

Each test file exports a `run()` function. Tests mock Electron by setting `global.window.ipc.callMain` directly.

## Project Architecture

### Process Boundary

```
Electron Main Process          │  Renderer Process (React)
  public/electron.js           │    src/index.js → src/gui/app/app.js
  public/backend/hostfs.js     │    src/system/localfs.js  (IPC proxy)
  public/backend/hostdialog.js │    src/system/dialog.js
  public/backend/hostapp.js    │    src/system/host.js
        ↑                       │         ↓
        └── IPC via electron-better-ipc ──┘
            dispatched through public/backend/ipcdispatch.js
```

### Renderer Layer Structure

| Directory | Responsibility |
|-----------|---|
| `src/gui/app/` | Root App component, Redux store, settings persistence, view routing, file operations |
| `src/gui/editor/` | Draft editing view, tag table, word count table |
| `src/gui/slatejs/` | SlateJS rich-text editor integration — plugins, marks, search, folding, drag-and-drop |
| `src/gui/common/` | Shared UI primitives (factory.js: VBox/HBox/Button/etc.), icons, hotkeys, themes |
| `src/gui/import/` | Import dialogs and preview for TXT/DOCX/clipboard |
| `src/gui/export/` | Export dialog and formatters |
| `src/gui/stats/` | Statistics/progress view (uses Recharts) |
| `src/gui/arc/` | Story-structure arc visualization |
| `src/gui/sketches/` | Experimental/work-in-progress views (not stable) |
| `src/document/` | Document model: load, save, create, export. Format migration. |
| `src/document/xmljs/` | `.mawe` XML serialization (load.js, save.js), tree representation |
| `src/document/export/` | Export formatters: RTF, HTML, TEX, TXT, Markdown |
| `src/system/` | Thin IPC wrappers: localfs.js (file ops), dialog.js (dialogs), host.js (app-level) |
| `src/util/` | Generic utilities and gzip compression |

### State Management

**Redux Toolkit** with three slices in `src/gui/app/store/`:

- **`docSlice`** — Current document, loading state, cached document content by file ID. Syncs to `settings_doc.json`.
- **`cwdSlice`** — Current working directory for file browser
- **`workspaceSlice`** — Workspace/recent-files state

Settings (theme, recent files, etc.) use `localStorage` via `useSetting` hook.

### Document Model

- **File Format:** `.mawe` (XML) or `.mawe.gz` (gzip-compressed)
- **Hierarchy:** `<story>` → `<body>` → acts → chapters → scenes
- **Scene Types:** Regular content, synopsis, notes
- **Elements:** Paragraphs, headings, comments (not exported), fillers, tags
- **Migration:** `src/document/xmljs/migration.js` handles format upgrades

### SlateJS Integration

Located in `src/gui/slatejs/`:

- `slateEditor.js` — Core editor instance, plugin pipeline, normalization
- `slateMarks.js` — Bold, italic, underline, and other text marks
- `slateFolding.js` — Section collapse/expand in draft view
- `slateDnD.js` — Drag-and-drop scene reordering
- `slateSearch.js` — Find/replace functionality

## Key Conventions

1. **IPC Pattern:** Never call Node/Electron APIs directly from renderer. Use `window.ipc.callMain(channel, [command, ...args])`.

2. **File Identity:** Files tracked by `id` field (full path) in file descriptor objects. Obtain with `localfs.fstat(path)`.

3. **Language:** Pure JavaScript with ES modules in `src/`, CommonJS in `public/`.

4. **Styling:** Component-local `.css` files alongside JS. MUI's Emotion handles themes.

5. **Immutability:** Always create new objects, never mutate state. Use spread operators or `immer` library.

6. **No TypeScript** in current codebase — use plain JavaScript.

## Platform-Specific Notes

### Linux

After updating Electron, you may need to fix the sandbox permissions:

```bash
npm run fix
```

This sets the SUID bit on `chrome-sandbox`. If you don't trust the npm script, do it manually:

```bash
sudo chown root node_modules/electron/dist/chrome-sandbox
sudo chmod 4755 node_modules/electron/dist/chrome-sandbox
```

In newer Ubuntu versions, you may need to run AppImage without sandboxing:

```bash
mawejs-A.B.C.Linux.amd.AppImage --no-sandbox
```

### Windows

Use separate terminals for development:

```bash
# Terminal 1
npm run dev:react

# Terminal 2 (after dev:react is running)
npm run dev:electron
```

## Debugging

### React DevTools

See: https://github.com/mkoskim/mawejs/discussions/131

### Electron Debugging in VS Code

See: https://github.com/Microsoft/vscode-recipes/tree/master/Electron

## Testing with Example Files

Example story files are available in `examples/` directory:

```bash
https://github.com/mkoskim/mawejs/tree/master/examples
```

Use these for testing import/export and document operations.

## Code Quality Standards

- Avoid mutation — use spread operators or `immer`
- Keep files focused (<800 lines)
- Use meaningful variable/function names
- Handle errors comprehensively
- No hardcoded values
- No `console.log` in production code
- Validate user input at system boundaries

## Git Workflow

- Use conventional commits: `type: description`
- Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`
- Write detailed commit messages explaining the "why"
- Keep commits atomic and focused

## Reporting Issues

See discussions page for project status: https://github.com/mkoskim/mawejs/discussions/88

For bugs, please provide:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. MaweJS version
5. OS and platform (Windows/Linux/macOS)

## License

MaweJS is licensed under the MIT License. See LICENSE file for details.
