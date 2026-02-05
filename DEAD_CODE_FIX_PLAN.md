# Dead Code Cleanup — Task Plan for Junior Developers

**Created:** 2026-02-04
**Source:** DEAD_CODE_ANALYSIS.md
**Verify after every phase:** `npm run build` must pass before moving on.

---

## How to read this document

- Every task lists **what** to do, **which files** to touch, and a **verify** step.
- **Gotcha** boxes flag things that commonly go wrong.
- Tasks are grouped into three phases. Complete each phase fully and run the phase
  verification checklist before starting the next one.

### Project quick-reference

| Need | Command |
|------|---------|
| Build | `npm run build` |
| Dev (Windows — two terminals) | T1: `npm run dev:react` / T2: `npm run dev:electron` |
| Search codebase | `grep -rn "pattern" src/ --include="*.js"` |

---

## Phase 1 — Zero Risk

Nothing in this phase is imported or referenced by live code.  Run these in any
order.  A single `npm run build` at the end is sufficient.

---

### 1.1  Remove the accidental external repo

**What:** The directory `everything-claude-code/` is a separate git repository
that was cloned into the project root by mistake.  It has no relation to MaweJS.

**Steps:**

```bash
git rm -rf everything-claude-code/
```

If git complains (e.g. nested `.git`), fall back to:

```bash
# PowerShell
Remove-Item -Recurse -Force everything-claude-code
git add -A
```

> **Gotcha:** The directory contains its own `.git` folder.  Delete the whole
> directory, not just its contents.

---

### 1.2  Remove unused npm dependencies

**What:** Four packages are installed but never imported anywhere.

**File:** `package.json`

| Line | Package | Section |
|------|---------|---------|
| 31 | `"buffer": "^6.0.3"` | dependencies |
| 32 | `"claude": "^0.1.1"` | dependencies |
| 54 | `"stream": "^0.0.3"` | dependencies |
| 60 | `"@babel/plugin-proposal-private-property-in-object": "^7.21.11"` | devDependencies |

**Steps:**

1. Open `package.json`.
2. Delete those four lines.
3. Check JSON is still valid — no trailing comma on the line that is now last
   in its section.  The line before `"buffer"` is `"@mui/material"` and the
   line after `"stream"` is `"use-immer"`.  Both sections keep other entries
   so a trailing comma on the *remaining* last item is fine as long as the
   deleted line's comma is gone with it.
4. Run:
   ```bash
   npm install
   ```

> **Gotcha:** Do **not** touch `wait-on` — it is used by the `dev` script on
> line 9 of `package.json`.

---

### 1.3  Delete the unused Redux store directory

**What:** `src/gui/app/store/` contains four files (index, docSlice, cwdSlice,
workspaceSlice).  The imports that would connect them are commented out in
`src/index.js` and were never uncommented.

**Steps:**

1. Delete the directory:
   ```bash
   # PowerShell
   Remove-Item -Recurse -Force src\gui\app\store
   ```

2. Open `src/index.js`.  Find and delete these two commented lines:
   ```javascript
   //import {store} from "./gui/app/store"
   //import {Provider} from "react-redux"
   ```

> **Gotcha:** Only delete `store/` inside `src/gui/app/`.  The parent directory
> contains the main App component and must stay.

---

### 1.4  Delete `src/system/scanner.js`

**What:** A `Scanner` class that is never instantiated or imported.

**Confirm first:**
```bash
grep -rn "scanner" src/ --include="*.js"
```
You should see only the file itself — no imports.

**Steps:**

```bash
del src\system\scanner.js          # cmd
# or
Remove-Item src\system\scanner.js  # PowerShell
```

---

### Phase 1 checklist

- [ ] `everything-claude-code/` directory is gone
- [ ] `npm install` completed without errors
- [ ] `src/gui/app/store/` directory is gone
- [ ] Commented Redux imports removed from `src/index.js`
- [ ] `src/system/scanner.js` is gone
- [ ] **`npm run build` passes**

---

## Phase 2 — Low Risk

Each task here touches live code.  Verify with `npm run build` after *each*
task before moving to the next.

---

### 2.1  Remove the old `ChooseWordFormat` toggle block

**What:** `src/gui/common/components.js` uses a `/* … /*/` toggle pattern to
keep an old version of `ChooseWordFormat` (lines 150–186) alongside the current
version (line 188 onward).  The old version should be deleted outright.

**File:** `src/gui/common/components.js`

**Exactly what to remove (lines 150–187):**

```
150: /*
151: export class ChooseWordFormat extends React.PureComponent {
     ...  (old implementation using `static buttons`)
186: }
187: /*/
```

Delete from the `/*` on line 150 through the `/*/` on line 187, inclusive.
The `export class ChooseWordFormat` on (currently) line 188 is the live
version and must stay exactly as-is.

**Verify:**
```bash
grep -n "class ChooseWordFormat" src/gui/common/components.js
# Should show exactly ONE hit
npm run build
```

> **Gotcha:** The `/*/` on line 187 is *not* a typo — it is the closing marker
> of the toggle comment.  Removing lines 150–187 leaves the active class
> starting on what was line 188.  Do not touch anything at or below that line.

---

### 2.2  Remove commented-out code blocks in `factory.js`

**What:** Three dead code blocks wrapped in `/* … */` comments.

**File:** `src/gui/common/factory.js`

| Lines | Content |
|-------|---------|
| 75–86 | Styled Tooltip (old implementation; the active `Tooltip` is on line 88) |
| 226–230 | Commented `ButtonGroup` function (approximate — search for `export function ButtonGroup`) |
| 360–373 | Commented `DropDown` component (approximate — search for `DropDown`) |

**Steps:**

1. For each block, confirm the exact line range with `grep -n` first — line
   numbers shift as you edit.
2. Delete the `/* … */` block (inclusive of the comment markers).
3. Leave everything else untouched.

**Verify:** `npm run build`

> **Gotcha:** The file has an `/* eslint-disable no-unused-vars */` directive
> on line 11.  That is intentional — do **not** remove it.

---

### 2.3  Remove unused re-exports from `factory.js`

**What:** Several MUI components are re-exported from `factory.js` but never
imported by any other file in `src/`.

**File:** `src/gui/common/factory.js`, lines 50–58 (the `export { … }` block)

**Remove these names from the export list:**

| Name | Reason to keep? |
|------|-----------------|
| `Chip` | No imports outside factory |
| `Link` | No imports outside factory |
| `List` | No imports outside factory |
| `ListItem` | No imports outside factory |
| `Breadcrumbs` | Re-exported on its own line further down; remove that line too |

The export block currently looks like:

```javascript
export {
  Spinner,
  Chip, Link,
  TextField,
  List, ListItem, ListItemText, ListSubheader, ListItemIcon, Typography,
  Accordion, AccordionSummary, AccordionDetails,
  Dialog,
}
```

After editing it should be:

```javascript
export {
  Spinner,
  TextField,
  ListItemText, ListSubheader, ListItemIcon, Typography,
  Accordion, AccordionSummary, AccordionDetails,
  Dialog,
}
```

Also find and remove the standalone `Breadcrumbs` re-export (search for
`export.*Breadcrumbs`).

**Do NOT remove `Tooltip`** — it is used internally by `Button`, `IconButton`,
and `ToggleButton` inside factory.js itself (lines 240, 251, 262).  It is not
exported to other files but the function must remain.

**Verify:**
```bash
npm run build
# confirm no "Chip is not exported" or similar errors
```

> **Gotcha:** `ButtonGroup` is imported from MUI at the top of the file (line
> 24) for internal use.  Do not touch the MUI import line — only remove it from
> any *re-export* statement if one exists.

---

### 2.4  Make internal helpers private in `components.js`

**What:** Five `updateDoc*` functions and two classes (`EditHead`,
`EditHeadButton`) are exported but only used *within* `components.js` itself.
Removing `export` makes them module-private without changing behaviour.

**File:** `src/gui/common/components.js`

**Confirm they are internal-only:**
```bash
grep -rn "EditHead\|EditHeadButton\|updateDocName\|updateDocTitle\|updateDocSubtitle\|updateDocAuthor\|updateDocPseudonym" src/ --include="*.js"
```
All hits should be inside `components.js` only.  If you see hits in other
files, **stop** and ask before proceeding.

**Steps:**  Remove the `export` keyword from these seven declarations (lines
36–42, 68).  Example:

```javascript
// Before
export function updateDocName(updateDoc, value) { … }
export class EditHead extends React.PureComponent {

// After
function updateDocName(updateDoc, value) { … }
class EditHead extends React.PureComponent {
```

**Verify:** `npm run build`

---

### 2.5  Remove scattered single unused exports

Each of these exports has zero imports outside its own file.  **Verify each
one individually** with grep before acting — the analysis may have a false
positive.

| File | Export | Action |
|------|--------|--------|
| `src/gui/common/hotkeys.js` | `isHotkey` | drop `export` |
| `src/document/head.js` | `storyType` | drop `export` |
| `src/document/xmljs/load.js` | `maweFromBuffer` | drop `export` |
| `src/document/util.js` | `wordcount` | drop `export` |
| `src/util/index.js` | `isEmpty` | drop `export` |
| `src/util/index.js` | `sleep` | drop `export` |
| `src/system/host.js` | `appLog` | drop `export` |
| `src/gui/app/views.js` | `getViewMode` | drop `export` |
| `src/gui/app/views.js` | `setViewMode` | drop `export` |
| `src/gui/editor/editor.js` | `getFocusTo` | drop `export` |
| `src/gui/slatejs/slateHelpers.js` | `elemByTypes` | drop `export` |
| `src/gui/slatejs/slateHelpers.js` | `elemsByRange` | drop `export` |
| `src/gui/app/context.js` | `cmdImportFile` | drop `export` |
| `src/gui/slatejs/slateMarks.js` | `isMarkActive` | drop `export` |

**Workflow for each export:**

1. `grep -rn "ExportName" src/ --include="*.js"`
2. If the only hits are the definition line (and maybe internal usage in the
   same file), remove `export`.
3. If you see an import in *any other* file, **skip it** — the analysis was
   wrong.

**Verify:** `npm run build` after finishing the batch.

> **Gotcha:** `isEmpty` and `sleep` in `src/util/index.js` may be re-exported
> via a barrel export.  Check whether `util/index.js` is itself imported
> elsewhere and whether the consuming code destructures those names.

---

### Phase 2 checklist

- [ ] Old `ChooseWordFormat` block removed; only one class definition remains
- [ ] Three commented blocks removed from `factory.js`
- [ ] `Chip`, `Link`, `List`, `ListItem`, `Breadcrumbs` removed from factory re-exports
- [ ] `updateDoc*`, `EditHead`, `EditHeadButton` are no longer exported
- [ ] Scattered unused exports verified and de-exported
- [ ] **`npm run build` passes after every task**

---

## Phase 3 — Medium Risk

These tasks touch code that *might* be wanted again or require judgment calls.
Back up before deleting.

---

### 3.1  Remove the `sketches/` directory

**What:** `src/gui/sketches/` is explicitly documented as experimental and
nothing in the main app imports from it.  One file (`organizer.js`) also has an
infinite-recursion bug.

**Steps:**

1. Confirm nothing imports from sketches:
   ```bash
   grep -rn "from.*sketches" src/ --include="*.js"
   ```
   Should return zero results.

2. The directory is already tracked by git, so history is preserved.  Simply
   delete:
   ```bash
   Remove-Item -Recurse -Force src\gui\sketches
   ```

3. If you or the team want an explicit backup archive anyway:
   ```powershell
   Compress-Archive -Path src\gui\sketches -DestinationPath sketches-backup.zip
   ```
   Store the zip outside the repo.

**Verify:** `npm run build`

> **Gotcha:** Git history already preserves every file.  You can always
> `git checkout <hash> -- src/gui/sketches` to bring them back if needed.  No
> external backup is strictly necessary.

---

### 3.2  Remove `src/system/localfs.js`

**What:** All 19 exported functions in this file wrap IPC calls, but the app
calls IPC directly and never imports from `localfs.js`.

**Decision:** This file documents the available file-system API surface.  The
team should decide whether to keep it as a reference or delete it.

**If deleting:**

1. Confirm:
   ```bash
   grep -rn "from.*localfs" src/ --include="*.js"
   ```
   Zero results expected.

2. Delete the file.

**If keeping:** No changes needed — leave as-is.

**Verify:** `npm run build`

---

### 3.3  Remove debug `console.log` statements

**What:** ~90 `console.log` calls across the codebase, most of which are
leftover debug output.

**Which files to edit:**

| File | What's there |
|------|--------------|
| `src/document/xmljs/load.js` | "Invalid act/chapter/scene/paragraph" logs |
| `src/document/xmljs/migration.js` | "Doc version" and "Migrate …" logs |
| `src/gui/arc/arc.js` | "Beat sheet length" and "onDragEnd" logs |
| `src/gui/app/app.js` | Version info and auto-save logs |
| `src/gui/editor/editor.js` | "onDragEnd" log |
| `src/gui/export/export.js` | "Export to" log |
| `src/gui/slatejs/slateEditable.js` | "Paste" log + commented onPaste block |
| `src/gui/app/context.js` | Command logging |

**Rules for each `console.log`:**

| Keep | Remove |
|------|--------|
| `console.error(…)` calls (error reporting) | `console.log("debug …")` |
| Version info in `app.js` (useful for support) | `console.log` inside event handlers |
| Migration version logs (useful for file-format debugging) | `console.log` for "Invalid …" validation |

Also remove the commented-out `onPaste` handler block in `slateEditable.js`
(lines ~177–204).

**Verify:** `npm run build` and do a quick smoke-test in dev mode.

> **Gotcha:** Do not remove the `console.log(err)` inside `Inform.error` in
> `factory.js` — that is intentional error reporting, not debug output.

---

### Phase 3 checklist

- [ ] `src/gui/sketches/` is gone (or decision made to keep)
- [ ] `localfs.js` decision made and acted on
- [ ] Debug `console.log` statements removed; error logging preserved
- [ ] Commented `onPaste` block removed from `slateEditable.js`
- [ ] **`npm run build` passes**
- [ ] Smoke-test: app launches, open a file, edit, save

---

## Rollback

Every change should be committed individually (or per-task).  If something
breaks:

```bash
git log --oneline -15          # find the bad commit
git revert <commit-hash>       # revert it cleanly
```

For a full reset to before any cleanup started:

```bash
git reset --hard <pre-cleanup-commit>
```

---

## Commit message style

Follow the repo convention (`<type>: <description>`):

```
chore: Remove accidentally cloned external repository
chore: Remove unused npm dependencies (buffer, claude, stream, babel plugin)
chore: Delete unused Redux store directory
chore: Remove old ChooseWordFormat toggle block in components.js
chore: Remove debug console.log statements
```
