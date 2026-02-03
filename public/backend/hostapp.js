//*****************************************************************************
//*****************************************************************************
//
// Access to Electron host system dialogs
//
//*****************************************************************************
//*****************************************************************************

//-----------------------------------------------------------------------------

const {app, shell} = require("electron");

// Shared state: electron.js sets up the "close" handler that checks this flag.
// When the renderer has finished its pre-close save it calls confirmClose(),
// which sets the flag and closes the window.
const closeState = { confirmed: false };

module.exports = {
  info,
  quit,
  log,
  beep,
  confirmClose,
  cancelClose,
  closeState,
}

//-----------------------------------------------------------------------------

function info() {
  return {
    name: app.getName(),
    version: app.getVersion(),
  }
}

function quit() {
  app.quit();
}

function log(message) {
  console.log(message)
}

function beep() {
  console.log("Beep")
  //shell.beep()
}

// Called by the renderer after it has saved (or decided there is nothing to save)
// before the window is allowed to close.  browserWindow is injected by ipcdispatch.
function confirmClose(browserWindow) {
  closeState.confirmed = true;
  if (closeState.timeoutId) {
    clearTimeout(closeState.timeoutId);
    closeState.timeoutId = null;
  }
  if (browserWindow && !browserWindow.isDestroyed()) {
    browserWindow.close();
  }
}

// Called by the renderer when the user picks "Cancel" in the save dialog.
// Resets pending state so the next close attempt re-prompts.
function cancelClose() {
  closeState.pending = false;
  if (closeState.timeoutId) {
    clearTimeout(closeState.timeoutId);
    closeState.timeoutId = null;
  }
}
