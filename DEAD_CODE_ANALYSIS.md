# MaweJS Dead Code Analysis Report

**Generated:** 2026-02-04
**Analysis Tool:** everything-claude-code:refactor-clean
**Status:** HANDOFF - Ready for cleanup implementation

---

## Executive Summary

The static analysis identified significant cleanup opportunities in the MaweJS codebase:

- **43 unused files** (primarily experimental sketches and unused store)
- **79 unused exports** across multiple modules
- **5 unused dependencies** (3 production, 2 dev)
- **~90 console.log statements** (many commented out)
- **2 syntax errors** (duplicate function declarations)
- **1 entire external repository** cloned into project by accident

**Estimated impact:** ~2,000+ lines of dead code, improved maintainability

---

## 1. Unused Dependencies

### Production Dependencies (SAFE TO REMOVE)

| Package | Version | Reason | Severity |
|---------|---------|--------|----------|
| `buffer` | ^6.0.3 | Not imported anywhere in codebase | LOW |
| `claude` | ^0.1.1 | Accidentally added, unused | LOW |
| `stream` | ^0.0.3 | Not imported anywhere in codebase | LOW |

**File:** `package.json` (lines 31, 32, 54)

### Dev Dependencies (REVIEW BEFORE REMOVAL)

| Package | Version | Reason | Note |
|---------|---------|--------|------|
| `@babel/plugin-proposal-private-property-in-object` | ^7.21.11 | Not referenced in build config | Safe to remove |
| `wait-on` | ^9.0.3 | Used in dev scripts | Check if needed for Windows workflow |

**File:** `package.json` (lines 60, 68)

**Action:** Remove from package.json and run `npm install`

---

## 2. Unused/External Files

### Priority 1: Remove (NOT PART OF PROJECT)

#### `everything-claude-code/` Directory
- **Type:** Entire separate Git repository
- **Size:** ~95+ files
- **Reason:** Accidentally cloned into project
- **Risk:** None - completely external
- **Action:** `git rm -r everything-claude-code/`

### Priority 2: Remove (Completely Unused)

#### Redux Store Infrastructure
All files in `src/gui/app/store/` are unused:
- `src/gui/app/store/index.js` - Store configuration
- `src/gui/app/store/docSlice.js` - Document state (unused)
- `src/gui/app/store/cwdSlice.js` - Working directory state (unused)
- `src/gui/app/store/workspaceSlice.js` - Workspace state (unused)

**Evidence:** Commented out in `src/index.js`:
```javascript
//import {store} from "./gui/app/store"
//import {Provider} from "react-redux"
```

**Files affected:** 4 files, ~300+ lines
**Risk:** None - never connected to application
**Action:** Delete entire directory

#### System Scanner (Unused)
- **File:** `src/system/scanner.js`
- **Reason:** Scanner class never instantiated
- **Risk:** None - completely unused
- **Action:** Delete file

### Priority 3: Review/Remove (Experimental Code)

#### `src/gui/sketches/` Directory
Per README: "Not all of them are working, but some might be taken back at some point of the future."

**Unused files:**
- `src/gui/sketches/filebrowser/file.js`
- `src/gui/sketches/filebrowser/filebrowser.js`
- `src/gui/sketches/filebrowser/index.js`
- `src/gui/sketches/organizer/organizer.js` (HAS SYNTAX ERROR - see below)
- `src/gui/sketches/workspace.old/` (entire directory)
- `src/gui/sketches/workspacebar/workspacebar.js`

**Risk:** Medium - these are experimental but not imported anywhere
**Action:** Archive or delete after verification no code depends on them

---

## 3. Syntax Errors (MUST FIX)

### Duplicate Function Declaration in `organizer.js`

**File:** `src/gui/sketches/organizer/organizer.js`

**Problem:** Two declarations of `OrganizerView` function:
- Line 39: Export declaration (calls itself recursively)
- Line 79: Duplicate function declaration

```javascript
// Line 39
export function OrganizerView({doc, updateDoc}) {
  return <DragDropContext onDragEnd={onDragEnd}>
      <OrganizerView   // <-- INFINITE RECURSION!
        doc={doc}
        updateDoc={updateDoc}
      />
    </DragDropContext>
  ...
}

// Line 79 - DUPLICATE!
function OrganizerView({doc, updateDoc}) {
  ...
}
```

**Issue:** Causes infinite recursion; file should not be used
**Action:** Delete file or fix if needed for future use

### Duplicate Declaration in `components.js`

**File:** `src/gui/common/components.js`

**Problem:** `ChooseWordFormat` declared twice:
- Line 151: First declaration
- Line 188: Second declaration (duplicate)

**Action:** Remove duplicate at line 188 or merge if different logic intended

---

## 4. Unused Exports (79 Total)

### `src/gui/common/factory.js` (High Impact)

Key unused exports that could be removed:

| Export | Line | Type | Usage |
|--------|------|------|-------|
| `Chip` | 52:3 | Re-export | 0 references |
| `Link` | 52:9 | Re-export | 0 references |
| `List` | 54:3 | Re-export | 0 references |
| `ListItem` | 54:9 | Re-export | 0 references |
| `Tooltip` (custom) | 88:17 | Function | 0 references |
| `Box` | 115:14 | Class | 0 references |
| `FlexBox` | 122:14 | Class | 0 references |
| `ButtonGroup` | 225:9 | Re-export | 0 references |
| `ToggleButton` | 257:14 | Class | 0 references |
| `Radio` | 271:17 | Function | 0 references |
| `Breadcrumbs` | 317:9 | Re-export | 0 references |
| `Loading` | 334:17 | Function | 0 references |

**Action:** Remove these unused re-exports and custom components

### `src/system/localfs.js` (All Exports Unused)

All 19 exported functions are unused in the application:

```javascript
// All of these can be removed:
export const dirname = ...
export const relpath = ...
export const basename = ...
export const extname = ...
export const makepath = ...
export const fstat = ...
export const parent = ...
export const readdir = ...
export const read = ...
export const write = ...
export const settingsread = ...
export const settingswrite = ...
export const rename = ...
export const remove = ...
export const getlocation = ...
export const getuser = ...
export const openexternal = ...
export const readResource = ...
export const splitpath = ...
```

**Note:** These wrap IPC calls but are never imported. The app calls IPC directly.

**Action:** Keep as reference for future use, or delete if cleaning up IPC layer

### `src/gui/common/components.js` (7 Unused)

| Export | Line |
|--------|------|
| `updateDocName` | 36:17 |
| `updateDocTitle` | 37:17 |
| `updateDocSubtitle` | 38:17 |
| `updateDocAuthor` | 39:17 |
| `updateDocPseudonym` | 40:17 |
| `EditHead` | 42:14 |
| `EditHeadButton` | 68:14 |

**Action:** Remove unused exports

### Other Unused Exports

| File | Export | Line |
|------|--------|------|
| `src/gui/common/hotkeys.js` | `isHotkey` | 58:9 |
| `src/document/head.js` | `storyType` | 44:17 |
| `src/document/xmljs/load.js` | `maweFromBuffer` | 54:17 |
| `src/document/util.js` | `wordcount` | 213:17 |
| `src/util/index.js` | `isEmpty` | 23:3 |
| `src/util/index.js` | `sleep` | 24:3 |
| `src/system/host.js` | `appLog` | 25:17 |
| `src/gui/app/views.js` | `getViewMode` | 42:17 |
| `src/gui/app/views.js` | `setViewMode` | 43:17 |
| `src/gui/editor/editor.js` | `getFocusTo` | 158:17 |
| `src/gui/slatejs/slateHelpers.js` | `elemByTypes` | 43:17 |
| `src/gui/slatejs/slateHelpers.js` | `elemsByRange` | 55:17 |
| `src/gui/app/context.js` | `cmdImportFile` | 100:17 |
| `src/gui/slatejs/slateMarks.js` | `isMarkActive` | 15:17 |

---

## 5. Console.log Statements (~90 Total)

### Active Debug Logging (Should be Removed or Converted)

| File | Line | Statement | Type |
|------|------|-----------|------|
| `src/document/xmljs/load.js` | 180 | `console.log("Invalid act:", act)` | Debug |
| `src/document/xmljs/load.js` | 215 | `console.log("Invalid chapter:", chapter)` | Debug |
| `src/document/xmljs/load.js` | 251 | `console.log("Invalid scene:", scene)` | Debug |
| `src/document/xmljs/load.js` | 296 | `console.log("Invalid paragraph:", elem)` | Debug |
| `src/document/xmljs/migration.js` | 33 | `console.log("Doc version:", version)` | Version info |
| `src/document/xmljs/migration.js` | 62+ | `console.log("Migrate ...")` | Migration tracking |
| `src/gui/arc/arc.js` | 80 | `console.log("Beat sheet length=", ...)` | Debug |
| `src/gui/arc/arc.js` | 166 | `console.log("onDragEnd:", result)` | Event logging |
| `src/gui/app/app.js` | 87-88 | Version info logging | Startup |
| `src/gui/app/app.js` | 150+ | Auto-save logging | Feature logging |
| `src/gui/editor/editor.js` | 403 | `console.log("onDragEnd:", result)` | Event logging |
| `src/gui/export/export.js` | 257 | `console.log("Export to:", filename)` | Feature logging |
| `src/gui/slatejs/slateEditable.js` | 174 | `console.log("Paste:", event)` | Debug |
| `src/gui/app/context.js` | Multiple | Command logging | Feature logging |

**Action:**
- Remove all debug logging
- Keep feature logging if useful, or convert to proper logging system
- Use environment-based conditional logging if needed for production debugging

### Commented-Out Code Blocks

| File | Lines | Content |
|------|-------|---------|
| `src/gui/common/factory.js` | 75-86 | Styled Tooltip component |
| `src/gui/common/factory.js` | 226-230 | ButtonGroup function |
| `src/gui/common/factory.js` | 360-373 | DropDown component |
| `src/gui/slatejs/slateEditable.js` | 177-204 | onPaste handler |
| `src/index.js` | - | Redux store imports |

**Action:** Remove all commented code (version control preserves history)

---

## 6. Missing/Unused Import Declarations

### Unused Redux Imports

**File:** `src/index.js`

```javascript
//import {store} from "./gui/app/store"
//import {Provider} from "react-redux"
```

**Action:** Remove commented lines

### Unused Babel Plugin

**File:** `package.json`

The `@babel/plugin-proposal-private-property-in-object` is not referenced in any build configuration or `.babelrc` file.

**Action:** Remove from devDependencies

---

## Cleanup Roadmap

### Phase 1: Zero Risk (Can be done immediately)
1. Remove `everything-claude-code/` directory
   - Command: `git rm -r everything-claude-code/`
   - Impact: ~100 files removed

2. Remove unused npm dependencies
   - Remove: `buffer`, `claude`, `stream`, `@babel/plugin-proposal-private-property-in-object`
   - Run: `npm install`
   - Impact: ~5-10 KB bundle reduction

3. Remove Redux store code
   - Delete: `src/gui/app/store/` directory
   - Delete: commented Redux imports in `src/index.js`
   - Impact: ~300 lines, 4 files removed

4. Remove `src/system/scanner.js`
   - Delete: entire file
   - Impact: ~50 lines removed

### Phase 2: Low Risk (Verify first, then execute)
1. Fix syntax errors:
   - Delete or fix `src/gui/sketches/organizer/organizer.js`
   - Remove duplicate `ChooseWordFormat` in `src/gui/common/components.js`

2. Remove console.log statements:
   - Remove debug logging
   - Convert feature logging to proper logging
   - Impact: ~200 lines, cleaner production code

3. Delete unused export statements:
   - Remove from `src/gui/common/factory.js`
   - Remove from `src/gui/common/components.js`
   - Impact: ~40 lines removed

### Phase 3: Medium Risk (Archive before deleting)
1. Archive or delete `src/gui/sketches/` directory
   - Backup entire directory first
   - Impact: ~500+ lines removed
   - Risk: Contains experimental code that might be resurrected

---

## Testing After Cleanup

After implementing cleanup:

1. **Build test:** `npm run build`
2. **Dev test:** `npm run dev`
3. **Search for references:** Verify no remaining imports from deleted files
4. **Bundle size check:** Verify bundle size reduction

---

## Recommendations

### Immediate Actions (Next Sprint)
- ✅ Remove `everything-claude-code/` directory
- ✅ Remove unused dependencies
- ✅ Remove Redux store code (commented out anyway)
- ✅ Fix syntax errors in organizer.js

### Follow-up Actions
- Remove console.log debug statements
- Clean up unused exports
- Archive experimental sketches directory

### Long-term Improvements
- Implement proper logging system (structured logging, levels)
- Set up ESLint rules to catch unused exports automatically
- Add pre-commit hook to prevent console.log in production code

---

## Notes

- Analysis was performed on commit: `main` (2026-02-04)
- No code changes were made - this is an analysis-only report
- All file paths are relative to project root
- This report should be reviewed before implementing cleanup

---

**Next Steps:** Assign cleanup tasks or execute Phase 1 cleanup as outlined above.
