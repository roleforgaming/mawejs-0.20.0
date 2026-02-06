//*****************************************************************************
//*****************************************************************************
//
// File import view
//
//*****************************************************************************
//*****************************************************************************

import "./import.css"

import React, {
  useState, useEffect, useCallback,
} from 'react';

import {
  VBox, HBox,
  ToolBox, Button,
  Label,
  Separator,
  Inform,
  Filler,
  addHotkeys,
  IsKey,
  Dialog,
} from "../common/factory";

import { maweFromTree } from "../../document/xmljs/load";

import { Preview } from "./preview";
import { ImportText } from "./importText";

//import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';

//const anytext = require("any-text")
const mammoth = require("mammoth")
const fs = require("../../system/localfs")

//*****************************************************************************
//
// Import view
//
//*****************************************************************************

const formats = {
  "text": { name: "Text", },
}

function getContent(file, ext) {
  if (!file) {
    return {
      loader: navigator.clipboard.readText(),
      format: "text"
    }
  }
  switch (ext) {
    //case ".rtf":
    case ".docx": return {
      loader: fs.read(file.id, null)
        .then(buffer => mammoth.extractRawText({ arrayBuffer: buffer }))
        .then(result => result.value),
      format: "text"
    }
    default: break;
  }
  return {
    loader: fs.read(file.id),
    format: "text"
  }
}

export function ImportDialog({ updateDoc, buffer, setBuffer }) {
  const theme = useTheme();
  const { file, ext } = buffer

  //console.log("File:", file, "Ext:", ext)

  const [content, setContent] = useState()
  const [format, setFormat] = useState()
  const [imported, setImported] = useState()

  const Import = useCallback((e) => {
    const story = maweFromTree({
      elements: [{
        type: "element", name: "story",
        attributes: { format: "mawe", version: "4" },
        elements: [
          {
            type: "element", name: "body",
            elements: imported,
          }
        ]
      }]
    })
    updateDoc(story)
    setBuffer(undefined)
  }, [imported, updateDoc, setBuffer])

  const Cancel = useCallback((e) => {
    //console.log('Cancel function called'); // Debugging log
    setBuffer(undefined); // Close the dialog by resetting the buffer
  }, [setBuffer])

  useEffect(() => addHotkeys([
    [IsKey.Escape, Cancel],
  ]), [Cancel])

  useEffect(() => {
    const { loader, format } = getContent(file, ext)
    loader
      .then(content => {
        setContent(content)
        setFormat(format)
        if (file) Inform.success(`Loaded: ${file.name}`);
      })
      .catch(err => {
        Inform.error(err);
        setBuffer()
      })
  }, [buffer, file, ext, setContent, setFormat, setBuffer])

  return <Dialog
      open={true}
      //fullScreen={true}
      fullWidth={true}
      maxWidth="xl"
      disableEscapeKeyDown={true}
    >
    <VBox style={{ overflow: "auto", padding: "4pt", background: theme.palette.background.default }}>

    <ToolBox>
      <Label>Import from: {buffer.file?.name ?? "Clipboard"}</Label>
      <Separator />
      <Filler />

      <Separator />
      <Label>Format: {formats[format]?.name ?? format}</Label>
      {/*<SelectFormatButton value={format} setFormat={setFormat}/>*/}

      <Separator />

      <Separator />
      <IconButton onClick={Cancel} aria-label="close"><CloseIcon /></IconButton>
    </ToolBox>

    <HBox style={{ overflow: "auto" }}>
      <Preview imported={imported} />
      <VBox className="ImportSettings">
        <SelectFormat format={format} content={content} setImported={setImported} />
        <Button variant="contained" color="success" onClick={Import}>
          Import
        </Button>
      </VBox>
    </HBox>
  </VBox></Dialog>
}

//-----------------------------------------------------------------------------

class SelectFormat extends React.PureComponent {
  render() {
    const { format, content, setImported } = this.props

    switch (format) {
      case "text": return <ImportText content={content} setImported={setImported} />
      default: return null
    }
  }
}
