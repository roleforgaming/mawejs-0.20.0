//*****************************************************************************
//*****************************************************************************
//
// Access to Electron host system dialogs
//
//*****************************************************************************
//*****************************************************************************

module.exports = {
  openFile, saveFile, messageBox,
}

//-----------------------------------------------------------------------------

const { dialog } = require('electron')

//-----------------------------------------------------------------------------

async function openFile(browserWindow, options) {
  return dialog.showOpenDialog(browserWindow, options)
}

async function saveFile(browserWindow, options) {
  return dialog.showSaveDialog(browserWindow, options)
}

async function messageBox(browserWindow, options) {
  const { response } = await dialog.showMessageBox(browserWindow, options)
  return response
}
