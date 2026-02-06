//*****************************************************************************
//
// Import preview
//
//*****************************************************************************

import React from "react"
import { DeferredRender } from "../common/factory"
import { useTheme } from '@mui/material/styles'

//-----------------------------------------------------------------------------

export function Preview({ imported }) {
  const theme = useTheme()

  if(!imported) return null

  return <>
    <ImportIndex
      style={{minWidth: "200px", maxWidth: "300px", width: "300px"}}
      imported={imported}
      />
    <div className="Filler Board Editor"
      style={{
        borderRight: `1px solid ${theme.palette.divider}`,
        borderLeft: `1px solid ${theme.palette.divider}`
      }}
      tabIndex={0}
      >
      <div className="Sheet Regular">
        <DeferredRender>{imported.map((act, i) => <PreviewAct key={i} act={act} theme={theme} />)}</DeferredRender>
        </div>
    </div>
  </>
}

function PreviewAct({ act, theme }) {
  return <div className="chapter">
    <h4>{act.attributes.name}</h4>
    {act.elements.map((chapter, i) => <PreviewChapter key={i} chapter={chapter} theme={theme} />)}
  </div>
}


function PreviewChapter({ chapter, theme }) {
  return <div className="chapter">
    <h5>{chapter.attributes.name}</h5>
    {chapter.elements.map((scene, i) => <PreviewScene key={i} scene={scene} theme={theme} />)}
  </div>
}

function PreviewScene({ scene, theme }) {
  return <div className="scene">
    <h6>{scene.attributes.name}</h6>
    {scene.elements.map((p, i) => <PreviewParagraph key={i} paragraph={p} theme={theme} />)}
  </div>
}

function PreviewParagraph({ paragraph, theme }) {
  const text = paragraph.elements.map(n => n.text).join(" ")
  return <p>
    {text}
    <span style={{marginLeft: "2pt", color: theme.palette.text.secondary}}>&para;</span>
  </p>
}

function ImportIndex({imported}) {
  return <div className="TOC" style={{maxWidth: "300px"}}>
    <DeferredRender>{imported.map(actIndex)}</DeferredRender>
  </div>

  function actIndex(act, index) {
    return <div key={index} className="Act">
      <div className="Entry ActName"><div className="Name">{act.attributes.name}</div></div>
      {act.elements.map(chapterIndex)}
    </div>
  }

  function chapterIndex(chapter, index) {
    return <div key={index} className="Chapter">
      <div className="Entry ChapterName"><div className="Name">{chapter.attributes.name}</div></div>
      {chapter.elements.map(sceneIndex)}
    </div>
  }

  function sceneIndex(scene, index) {
    return <div key={index} className="Entry SceneName"><div className="Name">{scene.attributes.name}</div></div>
  }
}
