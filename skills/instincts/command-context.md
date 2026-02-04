---
id: mawejs-command-context
trigger: "when a child component needs to trigger a file operation (open, save, import, export)"
confidence: 0.90
domain: architecture
source: local-repo-analysis
---

# File Operations Flow Through CmdContext, Not Direct Dispatch

## Action

Child components must not call `mawe.load()` or `mawe.save()` directly.
Instead, they obtain `setCommand` from `CmdContext` and emit an action object:

```javascript
import { useContext } from "react"
import { CmdContext } from "../app/context"

const setCommand = useContext(CmdContext)
setCommand({ action: "save" })           // trigger save
setCommand({ action: "load", filename }) // trigger open
```

The root `App` component owns the `setCommand` state and contains the
`switch` that executes the actual operation.

Helper functions in `context.js` wrap dialog interactions:
- `cmdOpenFile` — opens a file-picker dialog, then emits `{ action: "load", filename }`
- `cmdSaveFile` — emits `{ action: "save" }` if file exists, otherwise delegates to `cmdSaveFileAs`
- `cmdImportFile` / `cmdOpenImportFile` — same pattern for imports

## Evidence

- `src/gui/app/context.js` — 160 lines, all `cmd*` helpers follow this pattern
- `CmdContext` is created there and consumed throughout the editor and import/export UIs
- Keeps `App` as the single orchestrator; child components are decoupled from file I/O details
