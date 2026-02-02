//-----------------------------------------------------------------------------
// Dark Theme
//-----------------------------------------------------------------------------

import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: "#e0e0e0" },
    background: {
      default: '#1a1a1a',
      paper: '#2d2d2d',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#b0b0b0',
    },
  },
  typography: {
    //fontSize: 14,
  },
  components: {
    MuiButtonBase: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          lineHeight: 1.0,
          padding: "4px",
          "&:hover": {
            background: "#3a3a3a",
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        //size: 'small',
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          lineHeight: 1.0,
          fontSize: "12pt",
          padding: "4px",
          minWidth: "24px",
          minHeight: "24px",
          borderRadius: 0,
        },
      },
    },
    MuiToggleButton: {
      defaultProps: {
        //size: 'small',
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          lineHeight: 1.0,
          padding: "4px",
          borderRadius: 0,
          border: 0,
          "&:hover": {
            background: "#3a3a3a",
          },
          '&.Mui-selected': {
            background: "#1e4d7b",
          },
          '&.Mui-disabled': {
            border: "0",
          }
        },
      },
    },
    MuiIconButton: {
      defaultProps: {
        //size: 'small',
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          padding: "4px",
          borderRadius: 0,
          "&:hover": {
            background: "#3a3a3a",
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
        margin: 'dense',
      },
    },
    MuiInputBase: {
      defaultProps: {
        spellCheck: false,
        size: "small",
        margin: 'dense',
      },
      styleOverrides: {
        root: {
          //paddingLeft: "5px",
        },
        input: {
          //height: "24px",
          //padding: "4px",
        }
      },
    },

/*
    MuiOutlinedInput: {
      defaultProps: {
        size: "small",
        margin: 'dense',
      },
      styleOverrides: {
        root: {
          paddingLeft: "5px",
        },
        input: {
          height: "24px",
          padding: "4px",
        }
      },
    },
*/
    /*
    MuiFilledInput: {
      defaultProps: {
        margin: 'dense',
      },
    },
    MuiFormControl: {
      defaultProps: {
        margin: 'dense',
      },
    },
    MuiFormHelperText: {
      defaultProps: {
        margin: 'dense',
      },
    },
    MuiInputLabel: {
      defaultProps: {
        margin: 'dense',
      },
    },
    MuiListItem: {
      defaultProps: {
        dense: true,
      },
    },
*/
    MuiFab: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiTable: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiToolbar: {
      defaultProps: {
        variant: 'dense',
      },
      styleOverrides: {
        root: {
          backgroundColor: '#2d2d2d',
          color: '#e0e0e0',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#2d2d2d',
          color: '#e0e0e0',
        },
      },
    },

    //-------------------------------------------------------------------------
    // Tooltip
    //-------------------------------------------------------------------------

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: "11pt",
        }
      }
    },

    //-------------------------------------------------------------------------
    // Transitions
    //-------------------------------------------------------------------------

    MuiMenu: {
      defaultProps: {
        transitionDuration: 0,
      }
    },
    MuiPopover: {
      defaultProps: {
        transitionDuration: 0,
      }
    },
    MuiAccordion: {
      defaultProps: {
        slotProps: {transition: {timeout: {enter: 75, exit: 75}}},
      }
    },
    MuiDialog: {
      defaultProps: {
        transitionDuration: 200,
      }
    },
  },
});
