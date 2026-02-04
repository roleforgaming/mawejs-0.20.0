---
id: mawejs-theme-system
trigger: "when adding UI elements, colours, or theme-aware styling"
confidence: 0.85
domain: ui
source: local-repo-analysis
---

# Themes Are Resolved at Runtime via Context + CSS Custom Properties

## Action

- MUI theming: `getTheme(mode)` in `src/gui/common/themes/index.js` returns the full
  MUI theme object. Theme objects live in `lightTheme.js` / `darkTheme.js`.
- CSS theming: `src/gui/common/styles/colors.css` defines CSS custom properties
  (e.g. `--color-bg`) that switch based on a `data-theme` attribute or media query.
- The active theme mode is stored via `useSetting("mawejs.theme", "light")` and
  propagated through a React context at the root (`src/index.js`).
- When adding a new colour or style, define it in the theme object AND as a CSS
  custom property if it is used outside MUI components.

## Evidence

- `themes/index.js` — 10-line factory: `mode === 'dark' ? darkTheme : lightTheme`
- `bba47ec` commit — introduced runtime theme switching across 17 files
- `colors.css` grew from 38 to 97 lines in that commit to add dark-mode properties
- `useSetting` in `settings.js` persists the choice to localStorage
