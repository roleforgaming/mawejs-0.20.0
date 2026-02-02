//-----------------------------------------------------------------------------
// Theme Factory
//-----------------------------------------------------------------------------

import { lightTheme } from './lightTheme.js';
import { darkTheme } from './darkTheme.js';

export function getTheme(mode) {
  return mode === 'dark' ? darkTheme : lightTheme;
}
