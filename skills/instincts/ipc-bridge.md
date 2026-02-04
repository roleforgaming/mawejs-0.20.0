---
id: mawejs-ipc-bridge
trigger: "when adding a new backend capability or calling into Node/Electron APIs"
confidence: 0.95
domain: architecture
source: local-repo-analysis
---

# Route All Backend Calls Through the IPC Bridge

## Action

Never call Node.js or Electron APIs directly from renderer code.
Every backend call must flow through the three-layer stack:

1. `src/system/*.js` — thin wrapper calls `window.ipc.callMain(channel, [cmd, ...args])`
2. `public/backend/ipcdispatch.js` — switch-routes `channel` + `cmd` to the handler
3. `public/backend/host*.js` — actual implementation

## When Adding a New Command

1. Implement the logic in the correct `host*.js` file
2. Add a `case` in `ipcdispatch.js` under the right channel
3. Export a one-liner wrapper in the matching `src/system/*.js` file
4. Test via `ipcDispatch` directly (no Electron needed)

## Evidence

- Every file in `src/system/` (`localfs.js`, `dialog.js`, `host.js`) follows this exact pattern
- `ipcdispatch.js` is the single routing hub — 68 lines, nested switch
- Test runner (`test/run.js`) mocks IPC by pointing `global.window.ipc.callMain` at `ipcDispatch`
- Channels: `"hostfs"`, `"dialog"`, `"app"`
