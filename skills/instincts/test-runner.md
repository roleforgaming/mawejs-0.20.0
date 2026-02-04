---
id: mawejs-test-runner
trigger: "when writing or running tests"
confidence: 0.90
domain: testing
source: local-repo-analysis
---

# Tests Use a Custom Runner — No Jest, No Vitest

## Action

- Every test file lives in `test/` and is invoked via:
  ```
  node test/run.js <testfile>.js
  ```
- The runner (`test/run.js`) sets up a fake Electron environment by wiring
  `global.window.ipc.callMain` directly to `ipcDispatch`.
- It uses the `esm` package to transpile ES module `import`/`export` syntax at runtime.
- Each test file either exports a `run(args)` function or calls its main function directly at the top level.
- Tests favour **round-trip correctness** (load → transform → save → reload → compare)
  over unit-level mocking.

## When Writing a New Test

1. Create `test/test_<name>.js`
2. Import modules using ES module syntax (the runner handles transpilation)
3. Mock IPC is already available — no setup needed beyond what `run.js` provides
4. Run with `node test/run.js test_<name>.js`

## Evidence

- `test/run.js` — 24 lines, sets up `global.window`, uses `esm`, requires the test file
- `test/test_write.js` — round-trip: load `.mawe` → save as `.mawe.gz` → reload → compare buffers
- `test/test_fstat.js` and `test/test_scan.js` — exercise `localfs` functions through `ipcDispatch`
