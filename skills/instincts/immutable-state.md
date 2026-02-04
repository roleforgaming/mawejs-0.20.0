---
id: mawejs-immutable-state
trigger: "when updating state, recent-file lists, or any shared data structure"
confidence: 0.90
domain: state-management
source: local-repo-analysis
---

# Never Mutate — Spread Into New Objects

## Action

All state updates must produce new objects/arrays.
This applies to Redux reducers, settings helpers, and any shared data structure.

## Examples From This Codebase

```javascript
// settings.js — recentAdd returns a NEW array
export function recentAdd(recent, file) {
  return [
    { name: file.name, id: file.id },
    ...recent.filter(entry => entry.id !== file.id)
  ]
}

// docSlice.js — reset reducer returns a fresh state value
function reset(state, {payload}) {
  const {value, nosync} = payload
  if(!nosync) sync(value)
  return value          // full replacement, not mutation
}
```

## Evidence

- `.claude/rules/coding-style.md` marks immutability as CRITICAL
- `recentAdd` / `recentRemove` in `settings.js` both return new arrays
- `docSlice` reset returns a replacement value rather than mutating `state`
- Hooks post-tool-use warning flags mutations
