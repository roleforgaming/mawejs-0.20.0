---
name: mawejs-patterns
description: Coding patterns extracted from the MaweJS Electron desktop writing app
version: 1.0.0
source: local-git-analysis
analyzed_commits: 10
---

# MaweJS Coding Patterns

## Commit Conventions

The project targets conventional commits but enforcement is inconsistent.
Observed prefixes and their usage:

| Prefix | Count | Example |
|--------|-------|---------|
| `feat` | 2 | `feat(autosave): Implement periodic background auto-save` |
| `fix` | 2 | `fix(ui): Make fold toggle clickable and fix Word Frequency dark mode` |
| `refactor` | 2 | `refactor(app): Improve save robustness and implement graceful shutdown` |
| *(none)* | 4 | `update`, `Fixed bug where notes would not break out on new line.` |

**Rule:** Always use `<type>(<scope>): <description>` format. Valid types:
`feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`.
Common scopes: `app`, `ui`, `export`, `autosave`, `slatejs`.

---

## Process Architecture — IPC Layer

All renderer-to-main communication goes through a single IPC bridge.
Never call Node.js or Electron APIs directly from renderer code.

### Renderer side (`src/system/`)

Each module exposes thin wrappers that call `window.ipc.callMain`:

```javascript
// src/system/localfs.js — every export is a one-liner over fscall
function fscall(cmd, ...args) {
  return window.ipc.callMain("hostfs", [cmd, ...args]);
}
export function read(fileid, encoding="utf8") {
  return fscall("read", fileid, encoding);
}
```

Channels: `"hostfs"`, `"dialog"`, `"app"`.

### Main process side (`public/backend/`)

`ipcdispatch.js` is the single router — a nested `switch` on channel then command.
Each channel delegates to its own handler module (`hostfs.js`, `hostdialog.js`, `hostapp.js`).
Unrecognised commands throw immediately:

```javascript
default: break;
// falls through to:
throw Error(`IPC: ${channel}/${cmd}: Not implemented.`);
```

### Adding a new IPC command

1. Add the handler function in the appropriate `host*.js` file.
2. Add a `case` in the matching `switch` block in `ipcdispatch.js`.
3. Add a thin export in the matching `src/system/*.js` wrapper.
4. Write a test in `test/` that exercises the round-trip through `ipcDispatch` directly.

---

## File Identity

Files are tracked by an `id` field that holds the **full path**.
File descriptors are plain objects: `{ id, name, ... }`.
Use `localfs.fstat(path)` to obtain one.
Never construct a file descriptor manually unless you are writing tests.

---

## State Management — Redux Toolkit Slices

Redux Toolkit slices live in `src/gui/app/store/`.  Each slice:

- Defines `initialState` with a `status` boolean (indicates initialisation complete).
- Uses inline arrow reducers for simple state updates.
- Exports a **thunk creator** for any async work (loading files, reading settings).
- Persists its state to a JSON settings file via `localfs.settingswrite` in a `sync` helper.
- Strips volatile keys (`loading`, `edit`) when restoring from persisted state on init.

```javascript
// Pattern: thunk with dispatch + settings sync
function open({file}) {
  return async (dispatch, getState) => {
    dispatch(docAction.loading({file}))
    const content = await mawe.load(file)
    docs[id] = content            // module-level cache
    dispatch(docAction.loaded({file}))
  }
}

async function sync(state) {
  fs.settingswrite("settings_doc.json", JSON.stringify(state, null, 2))
}
```

Module-level `var docs = {}` acts as an in-memory document cache keyed by file `id`.
Access it via the exported `docByID(id)` / `docUpdate(id, content)` helpers — never import `docs` directly.

---

## Settings — localStorage Hook

UI preferences (theme, panel state, etc.) use a custom hook backed by `localStorage`:

```javascript
// src/gui/app/settings.js
export function useSetting(key, defaultValue) { … }

// usage
const [theme, setTheme] = useSetting("mawejs.theme", "light");
```

- Key `null` or `undefined` disables persistence (useful for transient state).
- Value `null`/`undefined` removes the key from storage.
- Recent-file list helpers (`recentAdd`, `recentRemove`) return new arrays — no mutation.

---

## Command Context Pattern

Top-level file operations (open, save, import, export) are triggered by child components through a React Context:

```javascript
// context.js
export const CmdContext = createContext(null)

// child component
const setCommand = useContext(CmdContext)
setCommand({ action: "save" })
```

Each `cmd*` function in `context.js` handles dialogs and then calls `setCommand` with a plain action object.
The root `App` component owns the `setCommand` state and dispatches based on `action`.

---

## Document Model API (`src/document/`)

The `mawe` object is the single entry point for document operations:

| Method | Purpose |
|--------|---------|
| `mawe.load(file)` | Load `.mawe` or `.mawe.gz`, returns `{ file, story, … }` |
| `mawe.save(doc)` | Save in-place (format determined by file extension) |
| `mawe.saveas(doc, filename)` | Save to a new path |
| `mawe.create(buffer)` | Parse an XML buffer into a doc |
| `mawe.info(file)` | Read header info without full load |

`load` accepts either a file-descriptor object or a string path (it calls `fstat` internally).
Compression (`.mawe.gz`) is transparent — determined by the file extension at save time.

Format migrations run automatically inside `loadmawe` via `src/document/xmljs/migration.js`.

---

## Theme System

Themes are plain objects exported from `src/gui/common/themes/{light,dark}Theme.js`.
`getTheme(mode)` in `themes/index.js` selects between them.
A `ThemeContext` at the root (`src/index.js`) enables runtime switching.
CSS custom properties in `colors.css` complement the MUI theme for non-MUI elements.

---

## UI Primitives

`src/gui/common/factory.js` re-exports and wraps MUI components into a project-local vocabulary
(`Button`, `IconButton`, `Menu`, `Tooltip`, etc.) plus layout primitives (`VBox`, `HBox`).
Import UI components from `factory.js`, not directly from `@mui/material`, to keep theming and styling consistent.

---

## CSS Organisation

- Component-local `.css` files sit next to their `.js` file (e.g. `editor.css` beside `editor.js`).
- Global/shared styles live in `src/gui/common/styles/`.
- `sheet.editor.css` — styles for the draft editing view.
- `sheet.preview.css` — styles for export preview.
- `colors.css` — CSS custom properties for theme colours.
- `TOC.css` — table-of-contents / outline panel.

---

## Testing

Tests live in `test/` and use a **custom runner**, not Jest or Vitest.

- Each test file exports (or directly calls) an async `run(args)` function.
- IPC is mocked by wiring `global.window.ipc.callMain` to `ipcDispatch` directly — no Electron required.
- Run a single test: `node test/run.js <filename>.js`

```javascript
// test/run.js — sets up the fake IPC environment
global.window = {
  ipc: { callMain: require("../public/backend/ipcdispatch").ipcDispatch }
}
require = require("esm")(module)   // enables ES module imports
require("./" + testcase).run(args)
```

Tests validate round-trip correctness (load → save → reload → compare) rather than mocking internals.

---

## Hot Files (change frequently — be careful)

| File | Touches | Why |
|------|---------|-----|
| `src/gui/app/app.js` | 4 | Root component; owns command dispatch, autosave, theme state |
| `src/gui/slatejs/slateEditor.js` | 3 | SlateJS editor core + normalization logic (known fragile) |
| `src/gui/app/app.css` | 3 | Global layout styles |

Normalization in `slateEditor.js` has historically caused regressions. A circuit-breaker pattern was added to limit re-normalization loops — keep this in mind when editing that file.

---

## Code-Style Rules (from `.claude/rules/`)

- **No mutation.** Always spread into new objects.
- **ES modules** (`import`/`export`) in `src/`; **CommonJS** (`require`) in `public/`.
- **No TypeScript.** Plain `.js` everywhere.
- Files should stay under ~800 lines; extract when they grow.
- No `console.log` in production code (hooks will warn).
- `sketches/` contains experimental/incomplete code — do not assume it is stable.
