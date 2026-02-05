# MaweJS — Data Models & Schemas Codemap

<!-- freshness: 2026-02-03 -->

---

## File Formats

### On-disk: `.mawe` and `.mawe.gz`

Documents are stored as **XML** (`.mawe`) or **gzip-compressed XML** (`.mawe.gz`).

- Compression is transparent: `is-gzip` detects format on load; `pako` decompresses.
- The compression decision on save is made based on the original file extension.

### XML Schema (logical)

```xml
<story format="mawe" version="6">
  <head>
    <title>…</title>
    <author>…</author>
    <!-- other metadata -->
  </head>
  <body>
    <act>
      <chapter>
        <scene>
          <!-- scene content elements -->
        </scene>
        <scene type="synopsis">…</scene>
        <scene type="notes">…</scene>
      </chapter>
    </act>
  </body>
</story>
```

Hierarchy: `<story>` → `<body>` → `<act>` → `<chapter>` → `<scene>`

---

## In-Memory Document Model

After loading, the XML is converted to a **SlateJS-compatible tree** (array of nested objects with `type`, `children`, optional `text`).

### Node Types (`src/document/elements.js`)

#### Containers (foldable structure)

| Type | Parent | Level | Header element |
|------|--------|-------|----------------|
| `act` | (root) | 1 | `hact` |
| `chapter` | `act` | 2 | `hchapter` |
| `scene` | `chapter` | 3 | `hscene` |

#### Section Breaks (first element of a container — triggers a visual break)

| Type | Parent | Content mode |
|------|--------|--------------|
| `hact` | `act` | — |
| `hchapter` | `chapter` | — |
| `hscene` | `scene` | `scene` (regular) |
| `hsynopsis` | `scene` | `synopsis` |
| `hnotes` | `scene` | `notes` |

#### Paragraph / Inline Elements

| Type | Description |
|------|-------------|
| `p` | Standard paragraph |
| `quote` | Block quote |
| `comment` | Internal comment (not exported) |
| `missing` | Placeholder flagging missing content |
| `bookmark` | Named bookmark / anchor |
| `tags` | Metadata tags for the scene |
| `fill` | Word-count filler placeholder |
| `br` | Line break |

#### Text Marks

| Mark | Shortcut |
|------|----------|
| `bold` | Ctrl+B |
| `italic` | Ctrl+I |
| `underline` | — |

---

## Paragraph Markup (quick-insert)

Typing a markup string at the start of a blank line converts it to the corresponding type:

| Markup | Resulting type |
|--------|---------------|
| `** ` | `hact` |
| `# ` | `hchapter` |
| `## ` | `hscene` |
| `>> ` | `hsynopsis` |
| `%% ` | `hnotes` |
| `=> ` | `bookmark` |
| `!! ` | `missing` |
| `// ` | `comment` |
| `@@ ` | `tags` |
| `++ ` | `fill` |

---

## File Format Versions & Migration

`src/document/xmljs/migration.js` upgrades documents on load. Current version: **6**.

| Version | Key change |
|---------|------------|
| 1 | Original Python/GTK mawe format. Single-part. |
| 2 | Multi-part support added. |
| 3 | `body`/`notes` part → `chapter`; `ui.chart` → `ui.arc`. |
| 4 | (incremental fixes) |
| 5 | (incremental fixes) |
| 6 | Current stable version. |

Migration pipeline: `v1_to_v2 → v2_fixes → v2_to_v3 → v3_fixes → v3_to_v4 → v4_to_v5 → v5_to_v6 → v6_fixes` (applied as a `reduce` chain).

---

## File Descriptor Object

Throughout the codebase, files are represented as a descriptor obtained from `localfs.fstat(path)`:

```js
{
  id:   "/full/path/to/file.mawe",   // primary key — the absolute path
  name: "file.mawe",                 // basename
  // … other fs metadata
}
```

`id` is used everywhere as the stable file identity.

---

## Document API (`src/document/index.js`)

The `mawe` object is the single entry-point for all document operations:

| Method | Signature | Description |
|--------|-----------|-------------|
| `load` | `(file) → doc` | Load from disk. Accepts path string or file descriptor. Detects `.mawe` vs `.mawe.gz`, runs migration. |
| `create` | `(buffer?) → doc` | Create a new blank document (optionally from a buffer). |
| `save` | `(doc) → void` | Save document in place (uses `doc.file.id`). |
| `saveas` | `(doc, filename) → void` | Save to an arbitrary filename. |
| `info` | `(doc) → meta` | Extract head metadata (title, author, etc.). |
| `toXML` | `(doc) → xml` | Serialize document tree to XML string. |
| `fromXML` | `(xml) → doc` | Parse XML string to document tree. |
| `buf2tree` | `(buf) → tree` | Convert raw buffer to parsed tree. |

---

## Export Formats (`src/document/export/`)

| Formatter | Output |
|-----------|--------|
| `formatTXT` | Plain text |
| `formatHTML` | HTML |
| `formatRTF` | Rich Text Format |
| `formatTEX` | LaTeX |
| `formatDoc` | .docx (via mammoth) |

Comments and internal metadata are **excluded** from all export formats.

---

## Settings Persistence

Two channels:

1. **Browser `localStorage`** — accessed via `useSetting(key, default)`. Stores theme choice, recent-files list, UI preferences.
2. **App-data JSON files** — accessed via `localfs.settingsread(name)` / `localfs.settingswrite(name, obj)` → written by `hostfs` to an OS-specific app-data directory. Used for document-level settings (`settings_doc.json`).

---

## Word-Count Helpers (`src/document/util.js`)

| Function | Role |
|----------|------|
| `wcElem(node)` | Counts words in a Slate node (recursively) |
| `wcCompare(a, b)` | Compares two word-count snapshots |
| `elemAsText(node)` | Extracts plain-text string from a Slate node |
| `elemName(node)` | Returns the display name for a node type |
| `createDateStamp()` | ISO-ish timestamp for save records |
