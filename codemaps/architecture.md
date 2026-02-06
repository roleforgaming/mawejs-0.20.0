# MaweJS — Architecture Codemap

<!-- freshness: 2026-02-03 -->

## What is MaweJS

Electron desktop app for long-form story writing. "Externally unstructured" (continuous draft like Word) but "internally structured" (acts → chapters → scenes, like Scrivener). Metadata (synopsis, comments, tags) annotates text, not tree nodes.

**Version:** 0.20.0 | **Language:** JavaScript (no TypeScript) | **Module style:** ES modules in `src/`, CommonJS in `public/`

---

## Process Architecture

```
┌─────────────────────────────┐    IPC (electron-better-ipc)    ┌─────────────────────────────┐
│   Renderer (React)          │ ◄────────────────────────────►  │   Main Process (Electron)   │
│                             │                                  │                             │
│  src/index.js               │  window.ipc.callMain(channel,   │  public/electron.js         │
│    └─ app/app.js            │    [cmd, ...args])              │    └─ backend/ipcmain.js    │
│         ├─ editor/          │                                  │    └─ backend/ipcdispatch.js│
│         ├─ export/          │  Channels: "hostfs", "dialog",  │         ├─ hostfs.js       │
│         ├─ stats/           │            "app"                 │         ├─ hostdialog.js   │
│         ├─ arc/             │                                  │         └─ hostapp.js      │
│         └─ import/          │                                  │                             │
│  src/system/ (IPC proxies)  │                                  │                             │
│    localfs.js ──────────────┼──────────────────────────────►   │  hostfs.js (Node fs)        │
│    dialog.js  ──────────────┼──────────────────────────────►   │  hostdialog.js              │
│    host.js    ──────────────┼──────────────────────────────►   │  hostapp.js                 │
└─────────────────────────────┘                                  └─────────────────────────────┘
```

### IPC Dispatch Table (`public/backend/ipcdispatch.js`)

| Channel    | Command            | Handler                        |
|------------|--------------------|--------------------------------|
| `hostfs`   | `fstat`            | `hostfs.fsGetFileEntry`        |
| `hostfs`   | `read`             | `hostfs.fsRead`                |
| `hostfs`   | `write`            | `hostfs.fsWrite`               |
| `hostfs`   | `readdir`          | `hostfs.fsReadDir`             |
| `hostfs`   | `settingsread`     | `hostfs.fsSettingsRead`        |
| `hostfs`   | `settingswrite`    | `hostfs.fsSettingsWrite`       |
| `hostfs`   | `rename`           | `hostfs.fsRename`              |
| `hostfs`   | `remove`           | `hostfs.fsRemove`              |
| `hostfs`   | `openexternal`     | `hostfs.fsOpenExternal`        |
| `hostfs`   | `parent`           | `hostfs.fsGetParentDir`        |
| `hostfs`   | `getlocation`      | `hostfs.fsGetLocation`         |
| `hostfs`   | `readresource`     | `hostfs.fsReadResource`        |
| `hostfs`   | `dirname`          | `hostfs.fsDirname`             |
| `hostfs`   | `relpath`          | `hostfs.fsRelpath`             |
| `hostfs`   | `basename`         | `hostfs.fsBasename`            |
| `hostfs`   | `extname`          | `hostfs.fsExtname`             |
| `hostfs`   | `makepath`         | `hostfs.fsMakepath`            |
| `dialog`   | `openfile`         | `dialog.openFile`              |
| `dialog`   | `savefile`         | `dialog.saveFile`              |
| `dialog`   | `messagebox`       | `dialog.messageBox`            |
| `app`      | `info`             | `hostapp.info`                 |
| `app`      | `quit`             | `hostapp.quit`                 |
| `app`      | `log`              | `hostapp.log`                  |
| `app`      | `beep`             | `hostapp.beep`                 |
| `app`      | `confirm-close`    | `hostapp.confirmClose`         |
| `app`      | `cancel-close`     | `hostapp.cancelClose`          |

---

## Renderer Layer Map

```
src/
├── index.js                  Entry: React root, ThemeContext, providers
├── gui/
│   ├── app/                  Root component, commands, settings, store
│   │   ├── app.js            App component: orchestrates views & file ops
│   │   ├── context.js        CmdContext — file-operation command dispatch
│   │   ├── settings.js       localStorage persistence (useSetting hook)
│   │   ├── views.js          View routing: editor / export / stats / arc
│   │   └── store/            Redux Toolkit slices (docSlice, cwdSlice, workspaceSlice)
│   ├── editor/               Draft editing view
│   │   ├── editor.js         Main editor component (mounts SlateJS)
│   │   ├── tagTable.js       Tag-based filtering table
│   │   └── wordTable.js      Per-scene word count table
│   ├── slatejs/              SlateJS rich-text integration
│   │   ├── slateEditor.js    Editor instance creation, plugin pipeline, normalization
│   │   ├── slateEditable.js  <Editable> wrapper
│   │   ├── slateMarks.js     Bold, italic, underline, comment marks
│   │   ├── slateButtons.js   Toolbar buttons
│   │   ├── slateFolding.js   Collapse/expand sections
│   │   ├── slateDnD.js       Drag-and-drop scene reorder
│   │   ├── slateSearch.js    Find/replace
│   │   └── slateHelpers.js   Slate utility functions
│   ├── common/               Shared UI primitives
│   │   ├── factory.js        VBox, HBox, Button, ToolBox, Menu, etc.
│   │   ├── components.js     HeadInfo, WordsToday, ActualWords, etc.
│   │   ├── hotkeys.js        Keyboard shortcut definitions (IsKey)
│   │   ├── icons.js          Icon wrappers (@mdi/js, @mui/icons-material)
│   │   ├── docIndex.js       Document structure indexing
│   │   ├── theme.js          Theme management
│   │   ├── themes/           lightTheme.js, darkTheme.js
│   │   └── styles/           sheet.css, colors.css, sheet.editor.css, etc.
│   ├── import/               Import dialogs & logic (TXT, DOCX, MD, clipboard)
│   ├── export/               Export dialog
│   ├── stats/                Statistics view (Recharts)
│   ├── arc/                  Story-structure arc visualization
│   └── sketches/             Experimental: filebrowser, organizer, workspacebar
├── document/                 Document model — load, save, create, export
│   ├── index.js              mawe API: load(), save(), create(), saveas()
│   ├── head.js               Document header / metadata (info())
│   ├── elements.js           Node types, paragraph types, markup shortcuts
│   ├── util.js               wcElem, elemHeading, createDateStamp, etc.
│   ├── xmljs/                .mawe XML serialization
│   │   ├── load.js           loadmawe(), buf2tree(), fromXML()
│   │   ├── save.js           savemawe(), toXML()
│   │   ├── tree.js           XML tree helpers
│   │   └── migration.js      v1→v2→…→v6 format upgrades
│   └── export/               Formatters: RTF, HTML, LaTeX, TXT, DOCX
├── system/                   Thin IPC proxies (never call Node/Electron directly)
│   ├── localfs.js            File-system ops → callMain("hostfs", …)
│   ├── dialog.js             File dialogs   → callMain("dialog", …)
│   ├── host.js               App-level ops  → callMain("app", …)
│   └── scanner.js            Directory traversal
└── util/                     Generic utilities
    ├── index.js
    ├── generic.js
    └── compress.js           Gzip via pako (.mawe.gz support)
```

---

## Key Conventions

- **IPC only.** Renderer never calls Node/Electron APIs directly. Everything goes through `window.ipc.callMain(channel, [cmd, ...args])`.
- **File identity.** Files are tracked by `id` (full path) inside `{ id, name, … }`. Get one via `localfs.fstat(path)`.
- **Settings.** `localStorage` via `useSetting()` hook — not Redux.
- **CSS.** Component-local `.css` files. MUI Emotion handles theming.
- **Tests.** Custom runner (`test/run.js`), no Jest. Each test exports `run()`. IPC is mocked by setting `global.window.ipc.callMain = ipcDispatch`.
- **`sketches/`** is experimental; do not assume stability.

---

## Autosave & Shutdown

- Periodic auto-save runs in the renderer background.
- On window close Electron sends `confirm-close` IPC; renderer may reply `cancel-close` if there are unsaved changes.

## Theme System

`ThemeContext` at root (`src/index.js`). Light / dark themes in `src/gui/common/themes/`. Switchable at runtime.
