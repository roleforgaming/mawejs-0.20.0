# MaweJS — Frontend Codemap

<!-- freshness: 2026-02-03 -->

The renderer is a **React 19** single-page app served inside Electron's `BrowserWindow`. All source lives under `src/` and uses **ES module** syntax.

---

## Component Tree (simplified)

```
<ThemeContext.Provider>           src/index.js
  <SnackbarProvider>             notistack notifications
    <SettingsContext.Provider>    src/gui/app/settings.js
      <CmdContext.Provider>      src/gui/app/context.js — file-op commands
        <App>                    src/gui/app/app.js
          <ToolBar>              top navigation + file menus
          <ViewSwitch>           src/gui/app/views.js
            ├── <Editor>         src/gui/editor/editor.js   (default view)
            ├── <Export>         src/gui/export/export.js
            ├── <Stats>          src/gui/stats/stats.js
            └── <Arc>            src/gui/arc/arc.js
          <ImportDialog>         src/gui/import/import.js   (modal)
```

---

## `src/gui/app/` — Application Shell

### `app.js`
Root component. Responsibilities:
- Fetches app info via `appInfo()` IPC on mount.
- Owns the "current document" state (loaded doc object).
- Provides `CmdContext` so any descendant can trigger file commands.
- Renders the toolbar and view switcher.

### `context.js`
Defines the command functions that are threaded through `CmdContext`:

| Command | What it does |
|---------|--------------|
| `cmdNewFile` | Creates a blank `.mawe` document |
| `cmdOpenFile` | Opens a file-picker dialog and loads |
| `cmdLoadFile` | Loads a file by path (no dialog) |
| `cmdSaveFile` | Saves current doc in place |
| `cmdSaveFileAs` | Save-as dialog then write |
| `cmdCloseFile` | Closes the current document |
| `cmdRenameFile` | Renames the underlying file |
| `cmdOpenImportFile` | Opens the import dialog |
| `cmdImportClipboard` | Imports from clipboard |
| `cmdOpenResource` | Opens a bundled tutorial/example |

### `settings.js`
- `useSetting(key, defaultValue)` — hook that reads/writes `localStorage`.
- `recentAdd(file)` / `recentRemove(id)` — manage the recent-files list.
- `SettingsContext` wraps the app so components can access raw settings.

### `views.js`
- `ViewSelectButtons` — renders the tab bar (editor / export / stats / arc).
- `ViewSwitch` — renders the active view component based on current selection.

### `store/`
Redux Toolkit slices (`docSlice`, `cwdSlice`, `workspaceSlice`). Defined but **not actively wired** into the current UI — state is managed locally in `app.js` with `useImmer`.

---

## `src/gui/editor/` — Draft View

### `editor.js`
Mounts the SlateJS `<Editable>`. Passes the document tree as `value`, wires up all SlateJS plugins. Renders the tag table and word table beneath the editor.

### `tagTable.js`
Parses `@@` tag lines from the document, groups them, and renders a filterable table.

### `wordTable.js`
Shows per-scene word counts. Uses `wcElem()` from `src/document/util.js`.

---

## `src/gui/slatejs/` — Rich-Text Editor Layer

The heaviest subsystem. SlateJS provides the editable tree; this directory wraps it into a writing-focused editor.

### `slateEditor.js`
- `getCoreEditor()` — base editor with normalization rules (keeps the Slate tree structurally valid: containers must nest correctly, empty containers get a default child, etc.).
- `getUIEditor()` — adds UI plugins on top (marks, folding, DnD, search).
- **Normalization is the most fragile area** — see recent commit history.

### `slateMarks.js`
Text-level formatting: `bold`, `italic`, `underline`, `comment` (inline highlight).

### `slateFolding.js`
Collapse / expand acts, chapters, scenes. Folded nodes are visually hidden but remain in the Slate value.

### `slateDnD.js`
Drag-and-drop reordering of scenes using `@hello-pangea/dnd`.

### `slateSearch.js`
Find / replace with highlight decoration.

### `slateButtons.js`
Toolbar buttons that call Slate transforms (bold toggle, heading-type switches, etc.).

### `slateHelpers.js`
Shared utilities: selection helpers, node-matching predicates.

---

## `src/gui/common/` — Shared Primitives

### `factory.js`
Layout primitives built on MUI:
`VBox`, `HBox`, `Filler`, `Button`, `IconButton`, `ToolBox`, `Separator`, `Spinner`, `Menu`, `MenuItem`, `Inform`.

### `components.js`
Reusable display widgets: `HeadInfo`, `CharInfo`, `WordsToday`, `ActualWords`, `TargetWords`, `MissingWords`, `OpenFolderButton`.

### `hotkeys.js`
Defines the `IsKey` constant map (e.g., `IsKey.CtrlB`, `IsKey.CtrlAlt1`). Used by both the editor and `elements.js` shortcut tables.

### `icons.js`
Thin wrappers around `@mdi/js` and `@mui/icons-material`.

### `themes/`
`lightTheme.js` and `darkTheme.js` — MUI theme objects. Exported via `themes/index.js`.

### `styles/`
Global CSS: `sheet.css`, `colors.css`, `sheet.editor.css`, `sheet.preview.css`, `TOC.css`.

---

## `src/gui/import/`

| File | Role |
|------|------|
| `import.js` | `<ImportDialog>` modal — user picks source |
| `importText.js` | Parses plain text into the document tree |
| `preview.js` | Shows a preview of what will be imported |
| `util.js` | Shared import helpers |

Supported sources: `.txt`, `.docx` (via `mammoth`), `.md`, clipboard.

---

## `src/gui/export/`

`export.js` — dialog that delegates to the formatters in `src/document/export/`.

---

## `src/gui/stats/`

`stats.js` — Recharts-based view showing daily word counts and target progress.

---

## `src/gui/arc/`

`arc.js` — Visual story-structure arc (act/chapter/scene layout).

---

## `src/gui/sketches/` — Experimental

Contains incomplete / work-in-progress UI: `filebrowser/`, `organizer/`, `workspacebar/`, `workspace.old/`. Not wired into the main app navigation. Do not rely on stability.

---

## Key Dependencies (renderer)

| Package | Role |
|---------|------|
| `react` 19.2 | UI framework |
| `@mui/material` 7.x | Component library + theming (Emotion) |
| `slate` / `slate-react` 0.120 | Rich-text editor core |
| `slate-history` 0.113 | Undo/redo |
| `@hello-pangea/dnd` 18 | Drag-and-drop |
| `immer` / `use-immer` | Immutable state updates |
| `notistack` | Toast notifications |
| `recharts` 3.6 | Charts in stats view |
| `mammoth` 1.11 | DOCX → HTML (for import) |
| `is-hotkey` 0.2 | Keyboard shortcut matching |
| `material-ui-popup-state` | Controlled popup/menu state |
