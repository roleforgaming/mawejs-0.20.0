# MaweJS — Backend Codemap

<!-- freshness: 2026-02-03 -->

All backend code runs in the **Electron main process** under `public/`. Uses **CommonJS** (`require`/`module.exports`).

---

## Entry Point

**`public/electron.js`** — Electron app bootstrap.
- Creates `BrowserWindow` (size/position persisted via `electron-window-state`).
- Registers IPC handlers via `ipcmain.js`.
- Dev-mode: `electron-reload` watches `public/` for hot-restart (`nodemon` wraps this in `dev:electron`).

---

## IPC Layer

```
Renderer call:  window.ipc.callMain(channel, [cmd, ...args])
                        │
                        ▼
          public/backend/ipcmain.js        ← registers the IPC listener
                        │
                        ▼
          public/backend/ipcdispatch.js    ← switch(channel) → switch(cmd)
                  │              │              │
                  ▼              ▼              ▼
            hostfs.js      hostdialog.js    hostapp.js
```

`ipcdispatch.js` is also used directly by the test runner to mock IPC without Electron — keeps the routing logic single-sourced.

---

## Modules

### `hostfs.js` — File System

All file I/O for the app. Wraps Node `fs` (via `fs-extra`) and `path`.

| Export | What it does |
|--------|--------------|
| `fsGetFileEntry(path)` | Returns `{ id, name, … }` descriptor (≡ `fstat`) |
| `fsGetParentDir(path)` | Returns parent directory descriptor |
| `fsGetLocation()` | Returns app-default save location |
| `fsRead(path)` | Reads file as Buffer |
| `fsWrite(path, data)` | Writes data to file |
| `fsReadDir(path)` | Lists directory entries |
| `fsSettingsRead(name)` | Reads JSON settings file from app data dir |
| `fsSettingsWrite(name, obj)` | Writes JSON settings file |
| `fsRename(from, to)` | Renames / moves file |
| `fsRemove(path)` | Deletes file or directory |
| `fsOpenExternal(path)` | Opens path in OS default handler |
| `fsReadResource(name)` | Reads bundled resource (e.g., tutorial files) |
| `fsDirname(p)` | `path.dirname` |
| `fsRelpath(from, to)` | `path.relative` |
| `fsBasename(p, ext)` | `path.basename` |
| `fsExtname(p)` | `path.extname` |
| `fsMakepath(...parts)` | `path.join` |

### `hostdialog.js` — Native Dialogs

Wraps Electron `dialog` module. All dialogs are modal to the `browserWindow` passed from the dispatcher.

| Export | What it does |
|--------|--------------|
| `openFile(win, …)` | Shows open-file dialog, returns selected path(s) |
| `saveFile(win, …)` | Shows save-file dialog, returns chosen path |
| `messageBox(win, …)` | Shows message/confirmation dialog |

### `hostapp.js` — Application Control

| Export | What it does |
|--------|--------------|
| `info()` | Returns `{ name, version }` from `package.json` |
| `quit()` | Calls `app.quit()` |
| `log(…)` | Forwards args to `console.log` (useful for renderer debugging) |
| `beep()` | Calls `app.dock?.bounce()` / system beep |
| `confirmClose(win)` | Initiates the graceful-shutdown handshake |
| `cancelClose()` | Cancels a pending close (unsaved-changes guard) |

### `services.js`

Shared utility functions consumed by the host modules.

---

## Graceful Shutdown Flow

```
User clicks ×
      │
      ▼
Electron emits 'before-close'
      │
      ▼  IPC
hostapp.confirmClose(win)  →  renderer receives confirm-close
      │                              │
      │                              ▼
      │                     checks for unsaved changes
      │                              │
      │          ┌───── dirty ──────┘
      │          ▼
      │     sends cancel-close  →  hostapp.cancelClose() → abort close
      │
      └──── clean ──► app.quit()
```

---

## Key Dependencies (main process only)

| Package | Role |
|---------|------|
| `electron` 39.x | Runtime |
| `electron-better-ipc` | Typed IPC helpers |
| `electron-window-state` | Persist window geometry |
| `electron-is-dev` | Dev-mode detection |
| `electron-reload` | Hot-restart on `public/` changes |
| `fs-extra` | Extended fs (used by `hostfs`) |
