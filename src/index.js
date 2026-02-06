import React, { createContext, useMemo, useEffect } from "react";

import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@mui/material";
import { getTheme } from "./gui/common/theme.js";
import { SnackbarProvider } from "notistack";
import { useSetting } from "./gui/app/settings.js";

import App from "./gui/app/app.js";

//-----------------------------------------------------------------------------
// Theme Context for theme switching
//-----------------------------------------------------------------------------

export const ThemeContext = createContext(null);

//-----------------------------------------------------------------------------
// ThemeWrapper component manages theme state and applies it dynamically
// NOTE: ThemeProvider likes to create new theme every time it is rendered.
// Using useMemo prevents unnecessary theme recreation.
//-----------------------------------------------------------------------------

function ThemeWrapper({ children }) {
  const [themeMode, setThemeMode] = useSetting("theme", "light");
  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeMode);
  }, [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <ThemeContext.Provider value={{ themeMode, setThemeMode }}>
        {children}
      </ThemeContext.Provider>
    </ThemeProvider>
  );
}

//-----------------------------------------------------------------------------
// Render application with theme wrapper
//-----------------------------------------------------------------------------

createRoot(document.getElementById("root")).render(
  <ThemeWrapper>
    <SnackbarProvider>
      <App />
    </SnackbarProvider>
  </ThemeWrapper>,
);
