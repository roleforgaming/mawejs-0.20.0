//*****************************************************************************
//*****************************************************************************
//
// Helper functions for SlateJS
//
//*****************************************************************************
//*****************************************************************************

import {
  Editor,
  Transforms,
  Element,
} from 'slate'
import { ReactEditor } from 'slate-react'

//*****************************************************************************
//
// Helper functions
//
//*****************************************************************************

//-----------------------------------------------------------------------------

export function elemIsBlock(editor, elem) {
  return elem && !Editor.isEditor(elem) && Element.isElement(elem);
}

//-----------------------------------------------------------------------------

// Return true, if editor operations change content
// Return false, if operations only change selection

export function isAstChange(editor) {
  return editor.operations.some(op => 'set_selection' !== op.type)
}

//-----------------------------------------------------------------------------
// Focusing elements

export async function focusByPath(editor, path, collapse = true) {
  //console.log("FocusByPath", path)
  if(!ReactEditor.isFocused(editor)) {
    ReactEditor.focus(editor)
    //await sleep(20);
  }
  if(path) try {
    Transforms.select(editor, path);
    if(collapse) Transforms.collapse(editor);
  } catch(e) {
    console.log("Focus: invalid path ignored.")
  }
  const {focus} = editor.selection
  if(focus) {
    //console.log("Scroll to:", focus)
    scrollToPoint(editor, focus)
  }
}

async function scrollToPoint(editor, point) {
  const [dom] = ReactEditor.toDOMPoint(editor, point)
  //console.log("Parent:", dom.parentElement)
  /*
  dom.parentElement.scrollIntoView({
    //behaviour: "smooth",
    block: "start",
  })
  /*/
  dom.parentElement.scrollIntoViewIfNeeded()
  /**/
}

export async function scrollToRange(editor, range, focus) {
  if(focus) {
    await focusByPath(editor, range, false)
  }

  scrollToPoint(editor, range.focus)
}
