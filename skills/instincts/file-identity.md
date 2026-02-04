---
id: mawejs-file-identity
trigger: "when working with files, paths, or file descriptors"
confidence: 0.95
domain: data-model
source: local-repo-analysis
---

# Files Are Identified by Full Path in a Descriptor Object

## Action

- File identity = the `id` field, which holds the **full absolute path**.
- A file descriptor is `{ id, name, ... }` — a plain object.
- Obtain one via `localfs.fstat(path)` — never construct one manually outside tests.
- When you need a path string and have a descriptor, use `file.id`.
- `mawe.load()` accepts either a descriptor or a raw path string (calls `fstat` internally).

## Evidence

- `src/document/index.js:43` — `if (typeof file === "string") file = await fs.fstat(file);`
- `src/gui/app/context.js` — all `cmd*` functions pass `file` or `filename` through the same pattern
- `docSlice.js` — the module-level `docs` cache is keyed by `id`
- CLAUDE.md explicitly states: *"Files are tracked by an `id` field (the full path) inside a file descriptor object"*
