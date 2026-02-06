# Gemini Code Assistant Context: MaweJS

This document provides essential context for an AI assistant to understand and effectively contribute to the MaweJS project.

## Project Overview

**MaweJS** is a story editor for "plantsers" - writers who fall between being pure "pantsers" (writing by the seat of their pants) and "planners." It is a desktop application built with **Electron** and **React**.

The core philosophy is "Just start writing." It presents a simple, unstructured editor like a word processor, but internally it manages the story as a structured tree of acts, chapters, and scenes. This allows for powerful organization features like drag-and-drop reordering of scenes, folding sections of text, and metadata analysis without sacrificing the fluid writing experience of a single document.

### Key Technologies

*   **Application Framework:** Electron
*   **UI Framework:** React
*   **Text Editor:** SlateJS
*   **State Management:** A mix of React hooks (`useImmer` in `app.js`) and a settings system using `localStorage` (`useSetting` hook). The project also has documentation pointing towards Redux Toolkit for more complex state.
*   **Styling:** MUI for components and theming, with component-local CSS files.
*   **File Format:** A custom XML-based format (`.mawe`) which can also be Gzip compressed (`.mawe.gz`).

### Core Architecture

The project follows a standard Electron two-process model:

1.  **Main Process (`public/`):** Written in CommonJS. Handles window creation (`electron.js`), and all Node.js/Electron API access through a dedicated IPC layer (`backend/`).
2.  **Renderer Process (`src/`):** The React application, written using ES modules. All interactions with the backend (file system, dialogs) are strictly funneled through the IPC bridge.

## Building and Running

### Installation

Install all project dependencies:
```bash
npm install
```

### Development

The application can be run in development mode. On Windows, this requires two separate terminals.

*   **Linux:**
    ```bash
    npm run dev
    ```

*   **Windows:**
    ```bash
    # In Terminal 1:
    npm run dev:react

    # In Terminal 2 (after the first command is running):
    npm run dev:electron
    ```

### Building for Production

Create a distributable application for the local platform:
```bash
npm run build
```

To build for both Windows and Linux:
```bash
npm run release
```

### Testing

The project uses a custom test runner, not a standard framework like Jest.

*   **Running Tests:** Execute a specific test file using the `test/run.js` script.
    ```bash
    node test/run.js test/test_scan.js
    ```
*   **Test Structure:** Tests are files within the `test/` directory. They export a `run(args)` function. There is no formal assertion library; tests typically log output to the console for manual verification or throw errors on failure.

## Development Conventions

### IPC (Inter-Process Communication)

This is a critical pattern. **Never call Node.js or Electron APIs directly from the renderer (`src/`).**

*   **Renderer Side:** Proxy modules in `src/system/` (e.g., `localfs.js`, `dialog.js`) wrap calls to the main process. They use the `window.ipc.callMain(channel, [cmd, ...args])` function exposed via the preload script.
*   **Main Process Side:** A central router, `public/backend/ipcdispatch.js`, receives all IPC calls. It uses a `switch` statement to delegate the `[channel]` and `[cmd]` to the appropriate handler function in the `public/backend/host*.js` files.

### Document Model

*   The public API for all document handling is in `src/document/index.js` (e.g., `mawe.load`, `mawe.save`).
*   The underlying logic for converting between the `.mawe` XML format and the in-memory JavaScript object is in `src/document/xmljs/`.
*   To handle changes to the file format across versions, add a new migration function in `src/document/xmljs/migration.js`.

### State Management

*   The primary document state is managed in the root `<App>` component (`src/gui/app/app.js`) using the `useImmer` hook for immutable updates.
*   Application settings (like the UI theme and recent files list) are managed via the `useSetting` custom hook (`src/gui/app/settings.js`), which uses `localStorage`.

### Styling

*   Styling is done with a combination of MUI components and component-local CSS files (e.g., `app.js` is paired with `app.css`).
*   The application supports light and dark themes, managed by `src/gui/common/theme.js`.

### Commit Style

Follow the **Conventional Commits** specification. Use prefixes like `feat(scope):`, `fix(scope):`, and `refactor(scope):`. Common scopes include `ui`, `app`, `export`, and `autosave`.
