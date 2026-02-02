# Quick Reference: Normalization Fix

## What Was Fixed

✅ **Primary Issue**: Infinite normalization loop causing crash when pasting large text
✅ **Location**: `src/gui/slatejs/slateEditor.js`
✅ **Error**: "Could not completely normalize the editor after 9660+ iterations"

## Changes Made

### 1. **Critical Fix** - Line 614-618

Wrapped merge operations in `Editor.withoutNormalizing`:

```javascript
Editor.withoutNormalizing(editor, () => {
  foldNode(editor, prev[0], prev[1], false);
  foldNode(editor, block, path, false);
  Transforms.mergeNodes(editor, { at: path });
});
```

**Impact**: Prevents infinite loop by batching transforms

### 2. **Optimization** - Line 302-309

Fixed word count normalization logic

- Early return when word count matches
- Reduces unnecessary transforms

### 3. **Performance** - Line 351-353

Added type guard to `withBR` normalization

- Only process `p` and `br` nodes
- Skip irrelevant node types

### 4. **Safety** - Line 535-537

Wrapped parent wrapping in `withoutNormalizing`

- Prevents cascading normalizations during hierarchy fixes

## Testing Checklist

- [ ] Copy 1000+ words from external source
- [ ] Paste into document rapidly
- [ ] Switch between multiple documents
- [ ] Paste while selecting text
- [ ] Verify no crash occurs
- [ ] Check console for normalization warnings

## If Issues Persist

1. Check browser console for errors
2. Look for excessive normalization iterations
3. Add debug logging:
   ```javascript
   console.log("Normalizing:", entry);
   ```
4. Report with:
   - Browser version
   - Text size/content
   - Steps to reproduce

## Key Principle

**Always wrap multiple Transforms operations inside normalization functions with `Editor.withoutNormalizing`**

This prevents cascading normalizations that can create infinite loops.
