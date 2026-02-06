# Implementation Plan: Fix Build Warnings and Issues

## Overview

This plan addresses all build warnings and issues reported by `npm run build` for the MaweJS Electron application. The issues include dead code, React hooks dependency warnings, missing switch cases, bundle size optimization, and miscellaneous warnings. The plan is organized in phases ordered by risk: safety first (dead code removal), then correctness (hooks/switch fixes), then optimization (bundle size).

## Requirements

- Fix all 40+ dead code instances (unused variables and imports)
- Fix all 17 React hooks dependency warnings
- Add default cases to 7 switch statements
- Fix 1 switch fallthrough case in docIndex.js
- Reduce bundle size from 563.39 kB gzipped
- Address deprecation warnings (fs.F_OK, child process)
- Ensure Electron icon is properly configured

## Architecture Overview

The affected files span multiple layers:
- **Document layer**: `src/document/` - Export formatters, utilities, XML loading/saving
- **GUI layer**: `src/gui/` - React components for editor, export, arc views
- **System layer**: `src/system/` - IPC wrappers for Electron main process
- **Utilities**: `src/util/` - Generic helper functions

## Implementation Steps

---

### Phase 1: Dead Code Removal (Low Risk, High Impact)

**Objective**: Remove unused variables, imports, and functions to eliminate warnings and reduce bundle size.

**Why do this first**: Dead code removal is the safest change - removing unused code cannot break functionality. It also makes subsequent phases easier by reducing noise in the codebase.

---

#### Task 1.1: Clean Unused Imports in Document Export Files

**Files**:
- `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\document\export\formatDoc.js`
- `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\document\export\formatRTF.js`
- `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\document\export\formatTEX.js`

**Actions**:
1. In `formatRTF.js`:
   - Review `getHeader` import from `../head` - ensure it is used
   - Remove any unused local variables

2. In `formatTEX.js`:
   - Look for variables prefixed with underscore (e.g., `_number`) which indicate intentionally unused parameters
   - These should use proper ESLint ignore comments or be renamed

3. In `formatDoc.js`:
   - Review and remove any unused imports

**Verification**:
```bash
npm run build 2>&1 | grep -E "formatDoc|formatRTF|formatTEX"
```

---

#### Task 1.2: Clean Document Utility Files

**Files**:
- `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\document\util.js`
- `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\document\head.js`
- `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\document\xmljs\load.js`
- `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\document\xmljs\migration.js`
- `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\document\xmljs\save.js`

**Actions**:
1. In `util.js`:
   - Remove or use `uuid` and `nanoid` re-exports if not used externally
   - Check if `fs` require is actually needed
   - Review `filterCtrlElems` function - if unused, remove

2. In `load.js`:
   - Remove unused imports from the migration and tree modules
   - Check `_index` parameters in parse functions - if unused, either remove or add ignore comment

3. In `migration.js`:
   - Review all imports and remove unused ones
   - Check for unused helper functions

4. In `save.js`:
   - Review and remove unused imports

**Verification**:
```bash
npm run build 2>&1 | grep -E "util\.js|head\.js|load\.js|migration\.js|save\.js"
```

---

#### Task 1.3: Clean GUI Component Files

**Files**:
- `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\gui\app\views.js`
- `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\gui\arc\arc.js`
- `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\gui\common\docIndex.js`
- `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\gui\common\icons.js`

**Actions**:
1. In `views.js`:
   - Remove the empty `React` import if only using JSX
   - Review and remove unused exports

2. In `arc.js`:
   - Remove unused imports from factory, recharts, or dnd
   - Check `mode2rotate` function for missing return case

3. In `docIndex.js`:
   - Review class properties and remove unused ones
   - Check destructured props that are never used

4. In `icons.js`:
   - Review all MUI icon imports - remove any that are not used
   - Check MDI icon imports

**Verification**:
```bash
npm run build 2>&1 | grep -E "views\.js|arc\.js|docIndex\.js|icons\.js"
```

---

#### Task 1.4: Clean Editor Component Files

**Files**:
- `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\gui\editor\editor.js`
- `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\gui\editor\wordTable.js`

**Actions**:
1. In `editor.js`:
   - At line ~213, check if `Element` is imported from slate but used without import
   - Remove unused variables in `trackMarks` callback
   - Check debugging components at bottom (ASTChildren, SlateAST, Pre, Empty) - remove if unused
   - Review all useState/useCallback that might not be used

2. In `wordTable.js`:
   - Remove `useRef` if not used
   - Check if all useMemo dependencies are actually used

**Verification**:
```bash
npm run build 2>&1 | grep -E "editor\.js|wordTable\.js"
```

---

#### Task 1.5: Clean SlateJS Integration Files

**Files**:
- `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\gui\slatejs\slateButtons.js`
- `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\gui\slatejs\slateEditable.js`
- `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\gui\slatejs\slateEditor.js`
- `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\gui\slatejs\slateFolding.js`
- `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\gui\slatejs\slateHelpers.js`
- `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\gui\slatejs\slateMarks.js`

**Actions**:
1. In `slateButtons.js`:
   - Remove unused `useCallback` import if not used
   - Remove unused `removeMark` import from slate
   - Check `Separator` import usage

2. In `slateEditable.js`:
   - Remove unused imports from slate (Node, Transforms, Element)
   - Check if `debug` object is used

3. In `slateEditor.js`:
   - Check `insertTextData` - it destructures `insertTextData` but may not use original
   - Review imports: `Point`, `Range`, `Text`, `Element` - add imports if used globally
   - These are likely used but not imported (causing runtime globals)

4. In `slateFolding.js`:
   - Import `Range` and `Element` from slate (they're used but not imported)
   - Remove `elemTags` if not used

5. In `slateHelpers.js`:
   - Remove unused `Transforms`, `Element` imports if not used

6. In `slateMarks.js`:
   - Remove unused `Transforms` import

**Verification**:
```bash
npm run build 2>&1 | grep -E "slateButtons|slateEditable|slateEditor|slateFolding|slateHelpers|slateMarks"
```

---

#### Task 1.6: Clean Import and Export View Files

**Files**:
- `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\gui\export\export.js`
- `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\gui\import\importText.js`

**Actions**:
1. In `export.js`:
   - Remove `ListSubheader` if MuiMenuItem is used instead
   - Remove unused imports from factory
   - Check `elemName`, `getSuffix` usage

2. In `importText.js`:
   - Remove unused `useEffect` import if not directly used in functional components
   - Check `Menu, MenuItem` imports

**Verification**:
```bash
npm run build 2>&1 | grep -E "export\.js|importText\.js"
```

---

#### Task 1.7: Clean System and Utility Files

**Files**:
- `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\system\host.js`
- `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\util\generic.js`

**Actions**:
1. In `host.js`:
   - This file looks clean, verify no unused exports

2. In `generic.js`:
   - Check if `splitByLeadingElem` and `splitByTrailingElem` are both used
   - Check if `isNotEmpty` is used

**Verification**:
```bash
npm run build 2>&1 | grep -E "host\.js|generic\.js"
```

---

### Phase 2: Fix React Hooks Dependencies (Medium Risk, High Impact)

**Objective**: Add missing dependencies to useEffect, useCallback, and useMemo hooks to prevent stale closure bugs.

**Why this matters**: Missing dependencies can cause subtle bugs where callbacks use stale values. React's exhaustive-deps rule catches these.

---

#### Task 2.1: Fix Editor Hooks

**File**: `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\gui\editor\editor.js`

**Actions**:
1. Line 229 - `trackMarks` callback:
   ```javascript
   // BEFORE: Missing setTrack dependency
   const trackMarks = useCallback((editor, sectID) => {
     // ... uses setTrack
   }, [setTrack])
   
   // This looks correct, verify the warning
   ```

2. Line 250-251 - `updateSection` callback:
   ```javascript
   // Check if editors and trackMarks are in dependencies
   const updateSection = useCallback((key, buffer) => {
     const editor = editors[key]
     trackMarks(editor, key)
     // ...
   }, [editors]) // Missing: trackMarks, updateDoc
   ```
   **Fix**: Add `trackMarks` and `updateDoc` to dependencies.

3. Line 276-277 - Focus effect:
   ```javascript
   useEffect(() => {
     focusByPath(editor, focusTo)
   }, [refocus, active, focusTo]) // Missing: getActiveEdit or editor
   ```
   **Fix**: Add the actual editor reference.

4. Line 280-282 - Initial focus effect:
   ```javascript
   useEffect(() => {
     ReactEditor.focus(getActiveEdit())
   }, []) // Missing: getActiveEdit
   ```
   **Fix**: Add `getActiveEdit` to dependencies, or use a ref.

5. Line 320-354 - Search hotkeys effect:
   ```javascript
   useEffect(() => addHotkeys([...]), [getActiveEdit, searchText, focusMode, setFocusMode])
   // Check if all callbacks used inside are listed
   ```

**Verification**:
```bash
npm run build 2>&1 | grep "editor\.js" | grep -i "hook"
```

---

#### Task 2.2: Fix Arc View Hooks

**File**: `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\gui\arc\arc.js`

**Actions**:
1. Line 83-96 - `drafteditor` useMemo:
   ```javascript
   const drafteditor = useMemo(() => {
     const editor = getCoreEditor()
     editor.onChange = () => {
       if(isAstChange(editor)) {
         updateDoc(doc => {
           doc.draft.acts = editor.children;
           // ...
         })
       }
     }
     editor.children = doc.draft.acts
     return editor
   }, []) // Missing: updateDoc, doc.draft.acts
   ```
   **Fix**: This is intentional - the editor should only be created once. Add comment:
   ```javascript
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [])
   ```

**Verification**:
```bash
npm run build 2>&1 | grep "arc\.js" | grep -i "hook"
```

---

#### Task 2.3: Fix DocIndex Hooks

**File**: `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\gui\common\docIndex.js`

**Actions**:
1. Line 63 - Highlighter callback:
   ```javascript
   const highlighter = useCallback(
     re
     ? ([node, path]) => {
         // ... uses highlight.length
       }
     : undefined,
     [re] // Missing: highlight
   )
   ```
   **Fix**: Add `highlight` to dependencies:
   ```javascript
   [re, highlight]
   ```

2. Line 94-106 - wcFormatFunction callback:
   ```javascript
   const wcFormatFunction = useCallback(
     (!wcFormat || wcFormat === "off")
     ? undefined
     : (id, words) => <FormatWords
         // ... uses wcFormat, cumulative, total
       />,
     [wcFormat, total, cumulative]
   )
   ```
   **Note**: This looks correct. Verify the warning source.

**Verification**:
```bash
npm run build 2>&1 | grep "docIndex\.js" | grep -i "hook"
```

---

#### Task 2.4: Fix SlateEditable Hooks

**File**: `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\gui\slatejs\slateEditable.js`

**Actions**:
1. Line 45-64 - highlighter callback:
   ```javascript
   const highlighter = useCallback(
     re
     ? ([node, path]) => {
         const offsets = searchOffsets(Node.string(node), re)
         const ranges = offsets.map(offset => ({
           // ... uses highlight.length
         }))
         return ranges
       }
     : undefined,
     [re] // Missing: highlight
   )
   ```
   **Fix**: Add `highlight` to dependencies.

**Verification**:
```bash
npm run build 2>&1 | grep "slateEditable\.js" | grep -i "hook"
```

---

#### Task 2.5: Fix WordTable Hooks

**File**: `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\gui\editor\wordTable.js`

**Actions**:
1. Line 58 - `total` useMemo:
   ```javascript
   const total = useMemo(() => filtered.map(([wt, c]) => c).reduce((total, c) => total + c, 0))
   // Missing dependency array
   ```
   **Fix**: Add dependency array:
   ```javascript
   const total = useMemo(() => filtered.map(([wt, c]) => c).reduce((total, c) => total + c, 0), [filtered])
   ```

2. Lines 64-65 - Sort callbacks:
   ```javascript
   const fSortAscending  = useCallback((a, b) => (a[1] > b[1]) ? 1 : (a[1] < b[1]) ? -1 : 0)
   const fSortDescending = useCallback((a, b) => (a[1] < b[1]) ? 1 : (a[1] > b[1]) ? -1 : 0)
   // Missing dependency arrays
   ```
   **Fix**: Add empty dependency arrays (these functions are pure with no dependencies):
   ```javascript
   const fSortAscending  = useCallback((a, b) => (a[1] > b[1]) ? 1 : (a[1] < b[1]) ? -1 : 0, [])
   const fSortDescending = useCallback((a, b) => (a[1] < b[1]) ? 1 : (a[1] > b[1]) ? -1 : 0, [])
   ```

**Verification**:
```bash
npm run build 2>&1 | grep "wordTable\.js" | grep -i "hook"
```

---

### Phase 3: Fix Switch Statements (Low Risk, Medium Impact)

**Objective**: Add default cases to all switch statements and fix the fallthrough case.

**Why this matters**: Missing default cases can lead to unexpected behavior. The fallthrough in docIndex.js may cause incorrect rendering.

---

#### Task 3.1: Fix Switch Fallthrough in docIndex.js

**File**: `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\gui\common\docIndex.js`

**Location**: Line 505-516 (ItemIcon render method)

**Current code**:
```javascript
switch (type) {
  case "bookmark":
  case "missing":
  case "fill":
  //case "synopsis":
  //case "notes":
  case "comment":
  case "tags":
    return <div className={addClass("Box", type)} />
  default:
    return null
}
```

**Analysis**: This switch has a default case already. The warning might be about the commented cases. Review the actual warning message.

**Action**: Verify the switch structure is correct. The fallthrough from bookmark/missing/fill/comment/tags to the return statement is intentional (they all render the same).

---

#### Task 3.2: Add Default Cases to Document Utility Switches

**File**: `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\document\util.js`

**Locations**:
1. `wcParagraph` function (lines 268-283):
   ```javascript
   switch(elem.type) {
     case "p":
     case "quote":
       return { chars, text: wc }
     case "missing": return { missing: wc }
     case "fill": {
       // ...
     }
     default:
       break
   }
   ```
   **Status**: Has default case, OK.

2. `wcElem` function (lines 311-337):
   ```javascript
   switch(elem.type) {
     // ... cases
     default:
       break;
   }
   ```
   **Status**: Has default case, OK.

---

#### Task 3.3: Add Default Cases to View Switches

**File**: `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\gui\app\views.js`

**Location**: `ViewSwitch` function (lines 82-91)

**Current code**:
```javascript
switch (getViewMode(doc)) {
  case "editor": return <EditView {...props} />
  case "stats": return <StatsView {...props} />
  case "arc": return <StoryArcView {...props} />
  case "export": return <ExportView {...props} />
  default: break;
}
```
**Status**: Has default case, OK.

---

#### Task 3.4: Add Default Cases to Arc.js Switches

**File**: `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\gui\arc\arc.js`

**Location**: `mode2rotate` function (lines 215-223)

**Current code**:
```javascript
function mode2rotate(mode) {
  switch (mode) {
    case "topCCW":    return { start:  90, rotate:  1}
    case "topCW":     return { start:  90, rotate: -1}
    case "bottomCCW": return { start: 270, rotate:  1}
    case "bottomCW":  return { start: 270, rotate: -1}
  }
  return { start: 0, rotate: 1 }
}
```

**Fix**: Convert implicit default to explicit:
```javascript
function mode2rotate(mode) {
  switch (mode) {
    case "topCCW":    return { start:  90, rotate:  1}
    case "topCW":     return { start:  90, rotate: -1}
    case "bottomCCW": return { start: 270, rotate:  1}
    case "bottomCW":  return { start: 270, rotate: -1}
    default:          return { start: 0, rotate: 1 }
  }
}
```

**Location**: `indexElements` function (lines 127-133)

**Current code**:
```javascript
function indexElements() {
  switch(doc.ui.arc.elements) {
    case "act": return []
    case "chapter": return ["chapter"]
  }
  return ["chapter", "scene"]
}
```

**Fix**: Add explicit default:
```javascript
function indexElements() {
  switch(doc.ui.arc.elements) {
    case "act": return []
    case "chapter": return ["chapter"]
    default: return ["chapter", "scene"]
  }
}
```

---

#### Task 3.5: Add Default Cases to Export Switches

**File**: `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\gui\export\export.js`

**Location**: `ExportIndex` indexItem function (lines 287-296)

**Current code**:
```javascript
switch(node.type) {
  case "hact": return <ActItem key={index} node={node} index={index}/>
  // ... other cases
  default:
    return null
}
```
**Status**: Has default case, OK.

**Location**: `getTypeSuffix` function (lines 231-238)

**Current code**:
```javascript
function getTypeSuffix(contentType) {
  switch(contentType) {
    case "synopsis": return ".synopsis"
    case "storybook": return ".storybook"
    default: break;
  }
  return ""
}
```

**Fix**: Move return into default:
```javascript
function getTypeSuffix(contentType) {
  switch(contentType) {
    case "synopsis": return ".synopsis"
    case "storybook": return ".storybook"
    default: return ""
  }
}
```

---

#### Task 3.6: Add Default Cases to Import Switches

**File**: `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\gui\import\importText.js`

**Location**: `getLinebreak` function (lines 75-80)

**Current code**:
```javascript
function getLinebreak(linebreak) {
  switch(linebreak) {
    case "single": return "\n"
    default:
    case "double": return "\n\n"
  }
}
```
**Status**: Has default case, but unusual syntax. Consider:
```javascript
function getLinebreak(linebreak) {
  switch(linebreak) {
    case "single": return "\n"
    case "double":
    default:
      return "\n\n"
  }
}
```

---

#### Task 3.7: Add Default Cases to RTF Formatter

**File**: `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\src\document\export\formatRTF.js`

**Location**: `charEscape` function (lines 166-178)

**Current code**:
```javascript
function charEscape(c) {
  const code = c.charCodeAt(0)
  if(code > 127) return `\\u${code}?`
  switch(c) {
    case '\\': return "\\\\"
    case '{': return "\\{"
    case '}': return "\\}"
    case '"': return "\\'94"
  }
  return c
}
```

**Fix**: Add explicit default:
```javascript
function charEscape(c) {
  const code = c.charCodeAt(0)
  if(code > 127) return `\\u${code}?`
  switch(c) {
    case '\\': return "\\\\"
    case '{': return "\\{"
    case '}': return "\\}"
    case '"': return "\\'94"
    default: return c
  }
}
```

---

### Phase 4: Bundle Size Optimization (Medium Risk, High Impact)

**Objective**: Reduce the gzipped bundle size from 563.39 kB.

**Why this matters**: Large bundles slow down initial load time, especially on slower connections.

---

#### Task 4.1: Analyze Bundle Composition

**Action**: Run bundle analyzer to identify largest dependencies.

**Steps**:
1. Install analyzer: `npm install --save-dev webpack-bundle-analyzer`
2. Add to package.json:
   ```json
   "analyze": "npm run build && npx webpack-bundle-analyzer build/static/js/*.js"
   ```
3. Run: `npm run analyze`

**Expected findings**:
- Large MUI imports (tree-shaking may not be working)
- Recharts (large charting library)
- SlateJS (necessary for editor)
- xml-js (necessary for file format)

---

#### Task 4.2: Optimize MUI Imports

**Files**: All files importing from `@mui/material` or `@mui/icons-material`

**Current pattern** (problematic):
```javascript
import { Button, TextField } from "@mui/material"
```

**Better pattern** (enables tree-shaking):
```javascript
import Button from "@mui/material/Button"
import TextField from "@mui/material/TextField"
```

**Note**: This is a large refactor affecting many files. Consider whether the savings justify the effort.

---

#### Task 4.3: Review Large Dependencies

**File**: `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\package.json`

**Potentially removable dependencies**:
1. `cargo` - Check if actually used
2. `claude` - Check if actually used  
3. `grep` - Check if actually used
4. `rg` - Check if actually used
5. `stream` - May be unnecessary if using Node built-in

**Action**: Search for imports of these packages and remove if unused.

---

#### Task 4.4: Lazy Load Non-Critical Views

**Files to lazy load**:
- `src/gui/stats/stats.js` - Statistics view
- `src/gui/arc/arc.js` - Story arc view
- `src/gui/export/export.js` - Export view

**Implementation in views.js**:
```javascript
import React, { lazy, Suspense } from "react"

const StatsView = lazy(() => import("../stats/stats"))
const StoryArcView = lazy(() => import("../arc/arc"))
const ExportView = lazy(() => import("../export/export"))

// In ViewSwitch:
return <Suspense fallback={<div>Loading...</div>}>
  {/* switch content */}
</Suspense>
```

**Risk**: Medium - requires testing to ensure lazy loading works correctly.

---

### Phase 5: Deprecation Warnings (Low Risk, Low Impact)

**Objective**: Update deprecated API usage.

---

#### Task 5.1: Fix fs.F_OK Deprecation

**File**: `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\public\backend\hostfs.js`

**Location**: Line 94

**Current code**:
```javascript
return fs.promises.access(fileid, fs.constants.R_OK)
```

**Note**: This uses `fs.constants.R_OK` which is correct. The warning might be about a different location. Search for `fs.F_OK` or `F_OK` usage.

**Action**: Search for any usage of `fs.F_OK` and replace with `fs.constants.F_OK`.

---

#### Task 5.2: Fix Child Process Shell Warnings

**Action**: Search for child_process usage and ensure shell option is explicitly set.

**Command**:
```bash
grep -r "child_process\|spawn\|exec" --include="*.js" .
```

---

### Phase 6: Electron Configuration (Low Risk, Low Impact)

**Objective**: Ensure Electron icon is properly configured.

---

#### Task 6.1: Verify Electron Icon Configuration

**File**: `D:\Documents\mawejs-0.20.0\mawejs-0.20.0\public\electron.js`

**Current code** (line 58):
```javascript
icon: path.join(__dirname, "./favicon.png"),
```

**Verification**: The icon exists at `public/favicon.png`. Ensure:
1. Icon is at least 256x256 pixels
2. For Windows: also provide .ico file
3. For Linux: ensure icon is square

**Fix in package.json build config**:
```json
"build": {
  "icon": "public/favicon.png",
  "extraResources": [...]
}
```

---

## Testing Strategy

### After Phase 1 (Dead Code):
```bash
npm run build
# Verify no "unused" warnings
# Verify app still runs: npm run dev
```

### After Phase 2 (Hooks):
```bash
npm run build
# Verify no exhaustive-deps warnings
# Verify app functionality:
#   - Open editor, type text
#   - Use search
#   - Switch views
#   - Drag and drop scenes
```

### After Phase 3 (Switches):
```bash
npm run build
# Verify no switch warnings
# Test all views:
#   - Editor view
#   - Arc view
#   - Stats view
#   - Export view
```

### After Phase 4 (Bundle):
```bash
npm run build
# Compare bundle size before/after
# Run full app test
```

### Full Regression Test:
1. Create new document
2. Add acts, chapters, scenes
3. Edit text with formatting
4. Use folding
5. Search text
6. Export to RTF, TEX, MD
7. Import text file
8. View statistics
9. View story arc
10. Save and reload

---

## Risks and Mitigations

### Risk 1: Breaking React Component State
**Likelihood**: Medium
**Impact**: High
**Mitigation**: 
- Fix one hook at a time
- Test immediately after each change
- Keep original code commented until verified

### Risk 2: Removing Actually-Used Code
**Likelihood**: Low
**Impact**: High
**Mitigation**:
- Use grep to verify no usage before removing
- Keep git history for easy revert
- Test thoroughly after each removal

### Risk 3: Bundle Size Reduction Breaking Functionality
**Likelihood**: Medium
**Impact**: High
**Mitigation**:
- Implement lazy loading only after other phases complete
- Test all views after lazy loading
- Have rollback plan

### Risk 4: Switch Changes Altering Logic
**Likelihood**: Low
**Impact**: Medium
**Mitigation**:
- Only add default cases, don't change existing logic
- Verify behavior matches before/after

---

## Success Criteria

- [ ] `npm run build` completes with 0 warnings
- [ ] Bundle size reduced to under 500 kB gzipped (stretch goal: under 400 kB)
- [ ] All existing functionality works correctly
- [ ] No runtime errors in console
- [ ] All tests pass: `node test/run.js test_scan.js`
- [ ] App starts correctly: `npm run dev`

---

## Estimated Effort

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Phase 1: Dead Code | 7 tasks | 2-3 hours |
| Phase 2: Hooks | 5 tasks | 1-2 hours |
| Phase 3: Switches | 7 tasks | 30 minutes |
| Phase 4: Bundle | 4 tasks | 2-4 hours |
| Phase 5: Deprecation | 2 tasks | 30 minutes |
| Phase 6: Electron | 1 task | 15 minutes |
| **Total** | **26 tasks** | **6-10 hours** |

---

## Implementation Order

1. **Start with Phase 1** - Safest changes, immediate feedback from build warnings
2. **Move to Phase 3** - Quick wins with switch statements
3. **Complete Phase 2** - More complex but important for correctness
4. **Do Phase 5** - Quick fixes for deprecations
5. **Complete Phase 6** - Minor configuration
6. **Finish with Phase 4** - Most complex, highest risk

This order minimizes risk while maximizing early progress visibility.
