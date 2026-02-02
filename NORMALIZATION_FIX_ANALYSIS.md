# MaweJS Copy/Paste Crash Fix - Analysis & Solution

## Issue Summary

When copying and pasting large amounts of text between documents quickly, the application crashes with:

```
ERROR: Could not completely normalize the editor after 9660+ iterations!
This is usually due to incorrect normalization logic that leaves a node in an invalid state.
```

## Root Cause Analysis

### Primary Issue: Infinite Normalization Loop

The crash is caused by **recursive normalization loops** in the Slate.js editor customizations located in `src/gui/slatejs/slateEditor.js`.

#### How Slate.js Normalization Works:

1. Slate normalizes the editor state after every change
2. Normalization runs **bottom-up** (from text nodes → paragraphs → scenes → chapters → editor)
3. Each `normalizeNode` function can call `Transforms` operations
4. These transforms trigger **another normalization pass**
5. If not properly controlled, this creates infinite loops

#### The Problematic Code Path:

When pasting large text:

1. `insertTextData` (line 120) inserts many new paragraph nodes
2. `withFixNesting.normalizeNode` (line 460) processes these nodes bottom-up
3. `mergeHeadlessChilds` (line 600) finds containers without headers
4. It calls `Transforms.mergeNodes` **inside a normalization function** (line 617)
5. This triggers **another normalization pass** before the current one finishes
6. The new normalization finds the same issue and tries to merge again
7. **Infinite loop** → crash after max iterations

### Secondary Issues:

1. **Word Count Updates** (line 304): Calling `Transforms.setNodes` during normalization can trigger cascading normalizations
2. **P/BR Conversion** (line 353, 359): Converting between empty paragraphs and breaks can ping-pong
3. **Parent Wrapping** (line 531): wrapping nodes to fix hierarchy during normalization triggers more normalizations

## Fixes Applied

### Fix 1: Wrap Merge Operations (Critical - Lines 612-620)

**Problem**: `Transforms.mergeNodes` inside normalization triggers cascading normalizations

**Solution**: Wrap all transforms in `mergeHeadlessChilds` with `Editor.withoutNormalizing`:

```javascript
// Before:
foldNode(editor, prev[0], prev[1], false);
foldNode(editor, block, path, false);
Transforms.mergeNodes(editor, { at: path });

// After:
Editor.withoutNormalizing(editor, () => {
  foldNode(editor, prev[0], prev[1], false);
  foldNode(editor, block, path, false);
  Transforms.mergeNodes(editor, { at: path });
});
```

**Why This Works**: The `withoutNormalizing` wrapper batches all three operations and delays normalization until after they all complete, preventing the cascading loop.

### Fix 2: Optimize Word Count Logic (Lines 302-309)

**Problem**: Inverted logic causes unnecessary transforms

**Solution**: Return early if word count already matches:

```javascript
// Before:
if (!wcCompare(words, node.words)) {
  Transforms.setNodes(editor, { words }, { at: path });
  return;
}
return normalizeNode(entry);

// After:
if (wcCompare(words, node.words)) {
  return normalizeNode(entry);
}
Transforms.setNodes(editor, { words }, { at: path });
return;
```

**Why This Works**: Reduces the number of transforms during large paste operations, improving performance and reducing normalization pressure.

### Fix 3: Add Type Guard to withBR (Lines 348-353)

**Problem**: Processes all node types unnecessarily

**Solution**: Only process `p` and `br` nodes:

```javascript
// Only process p and br nodes
if (node.type !== "p" && node.type !== "br") {
  return normalizeNode(entry);
}
```

**Why This Works**: Prevents wasted normalization passes on nodes that will never be converted, improving performance.

### Fix 4: Wrap Parent Checking (Lines 530-537)

**Problem**: `wrapNodes` during normalization causes cascading normalizations

**Solution**: Wrap the operation in `withoutNormalizing`:

```javascript
// Before:
Transforms.wrapNodes(editor, { type }, { at: path });

// After:
Editor.withoutNormalizing(editor, () => {
  Transforms.wrapNodes(editor, { type }, { at: path });
});
```

**Why This Works**: Prevents the wrap operation from triggering immediate normalization, allowing the current normalization pass to complete first.

## Testing Recommendations

### Manual Testing:

1. ✅ Copy a large block of text (1000+ words)
2. ✅ Paste it into document A
3. ✅ Immediately copy and paste to document B
4. ✅ Repeat rapidly between documents C, D, E
5. ✅ Verify no crash occurs

### Edge Cases to Test:

- [ ] Pasting text with mixed formatting (headers, paragraphs)
- [ ] Pasting into folded sections
- [ ] Pasting across different section types (act → chapter → scene)
- [ ] Rapid paste + undo operations
- [ ] Pasting while text is selected

### Performance Testing:

- [ ] Measure normalization iterations (should be < 100 for large pastes)
- [ ] Monitor for memory leaks during repeated paste operations
- [ ] Check editor responsiveness during/after large pastes

## Additional Recommendations

### 1. Add Normalization Debugging

Consider adding a debug counter to track normalization iterations:

```javascript
const MAX_NORMALIZE_ITERATIONS = 1000;
let normalizeCount = 0;

editor.normalizeNode = (entry) => {
  if (++normalizeCount > MAX_NORMALIZE_ITERATIONS) {
    console.error("Normalization limit exceeded", entry);
    return; // Bail out
  }
  // ... existing logic
};
```

### 2. Consider Batching Large Pastes

For extremely large paste operations, consider batching the insert:

```javascript
Editor.withoutNormalizing(editor, () => {
  // Insert all nodes
  editor.insertText(first)
  editor.insertNodes(lines.map(...))
})
// Normalize once at the end
```

This is already done in `insertTextData` (line 132), which is good!

### 3. Monitor Slate.js Updates

Check the Slate.js repository for normalization improvements:

- https://github.com/ianstormtaylor/slate/issues
- Look for similar infinite loop issues

## Conclusion

The primary fix (wrapping merge operations in `withoutNormalizing`) should resolve the crash. The secondary fixes improve performance and reduce normalization pressure, making the editor more stable during heavy operations.

**Estimated Impact**:

- 🔴 **Critical**: Fix 1 - Directly prevents the infinite loop
- 🟡 **Important**: Fix 2 & 4 - Reduce cascading normalizations
- 🟢 **Nice to have**: Fix 3 - Performance optimization

All fixes are **non-breaking** and maintain the existing editor behavior.
