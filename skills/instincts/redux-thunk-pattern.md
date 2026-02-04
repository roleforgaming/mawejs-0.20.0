---
id: mawejs-redux-thunk-pattern
trigger: "when adding async logic to a Redux slice or dispatching from a component"
confidence: 0.85
domain: state-management
source: local-repo-analysis
---

# Async Operations Are Thunks; Sync State Persists Via a `sync` Helper

## Action

Slices in `src/gui/app/store/` follow this structure:

1. **Simple reducers** are inline arrows inside `createSlice({ reducers })`.
2. **Async operations** (file load, settings restore) are thunk creators exported alongside slice actions:
   ```javascript
   function open({file}) {
     return async (dispatch, getState) => {
       dispatch(docAction.loading({file}))   // signal loading
       const content = await mawe.load(file) // async work
       docs[id] = content                    // cache
       dispatch(docAction.loaded({file}))    // signal done
     }
   }
   ```
3. **Persistence** uses a module-level `sync(state)` that writes to a settings JSON file.
   Call `sync` inside reducers that change persisted state; skip it when restoring on init (`nosync: true`).

## Evidence

- `docSlice.js` — `open`, `init` are thunks; `loading`/`loaded`/`close` are inline reducers
- `sync` writes `settings_doc.json` via `localfs.settingswrite`
- `init` strips `loading` and `edit` (volatile keys) before restoring
- `docAction` merges slice actions with thunk creators into one export object
