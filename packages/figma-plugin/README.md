# Origam DS Sync — Figma plugin

A Figma plugin that syncs the Origam design system (tokens + component
metadata) into a Figma file. Lives inside the Origam UI repo so the
plugin and the runtime always agree on the shape of the data.

**v1 scope** — 14 components generated as Figma `COMPONENT_SET`s, plus
two exporters (Tokens Studio JSON, SCSS Origam) for the round-trip back
to the repo.

## Requirements

- Node `>= 22` (matches the parent repo's `.nvmrc`).
- Figma **desktop** app — plugin development requires desktop, the web
  client cannot load local manifests.
- [Tokens Studio for Figma](https://docs.tokens.studio/) (free) — the
  plugin assumes Tokens Studio has already imported `tokens/` from the
  repo and created the corresponding Figma Variables. We do NOT
  re-implement variable creation.

## Install

```bash
cd figma-plugin
npm install
```

## Build

```bash
npm run build       # one-shot: dist/code.js + dist/ui.html
npm run dev         # watch mode
npm run typecheck   # tsc --noEmit
npx vitest run      # 28 unit tests on lib/color.ts
```

Build artefacts:
- `dist/code.js` — Figma main-thread bundle (sandboxed v8, no DOM)
- `dist/ui.html` — iframe shell with the React UI + CSS inlined

Figma reads only those two files plus `manifest.json`.

## Load in Figma

1. Run `npm run build` (or `npm run dev`).
2. Open the **Figma desktop** app.
3. Open any file (the plugin runs against the active document).
4. Menu: **Plugins → Development → Import plugin from manifest…**
5. Select `figma-plugin/manifest.json` from this repo.
6. Run via **Plugins → Development → Origam DS Sync**.

After the first import Figma remembers the plugin; you only need to
rebuild (`npm run build`) and re-run from the menu after code changes.

## End-to-end workflow

```
                   Origam UI repo                              Figma file
                   ───────────────                              ──────────

                    tokens/                                     Variables
              ┌──────────────────┐                             ┌────────┐
              │ primitive.json   │  ─── Tokens Studio ──→      │ Origam │
              │ semantic/*.json  │     for Figma (free)        │ /Color │
              │ component/*.json │                             │ /Btn…  │
              └──────────────────┘                             └────────┘
                       ▲                                            │
                       │                                            ▼
                       │                                   ┌────────────────┐
                       │                                   │ Origam DS Sync │
                       │                                   │ (this plugin)  │
                       │                                   └────────────────┘
                       │                                            │
                       │      Export tab                            ▼
                       │      ┌────────────────────┐    Generate tab
                       └─────│ Tokens Studio JSON │   ┌────────────────────┐
                              │ SCSS Origam        │   │ 14 ComponentSets   │
                              └────────────────────┘   │ Origam/Btn         │
                                       ↓               │ Origam/TextField…  │
                              `npm run tokens:build`   └────────────────────┘
```

### Designer workflow

1. **One-time setup**: install Tokens Studio for Figma, point it at
   `tokens/` from this repo, sync. Tokens Studio creates Figma
   Variables with Light/Dark modes.
2. Install **Origam DS Sync** (this plugin) via the manifest.
3. **Generate tab** → "Detect Origam variables" → "Generate components".
   The plugin creates a `[Origam] Components` page with 14
   ComponentSets, each bound to the Variables Tokens Studio created.
4. Use those components to mock up screens. Switching the file's
   theme (Light ↔ Dark) flips the bound variables — your mockup
   updates automatically.
5. **Export tab** → choose format → click Export. The plugin produces
   either:
   - **Tokens Studio JSON** — a `.zip` mirroring `tokens/` layout
     (`$metadata.json`, `$themes.json`, `primitive.json`,
     `semantic/{light,dark}.json`, `component/<name>.json`). Drop the
     unzipped contents into the repo's `tokens/` and run
     `npm run tokens:build` to regenerate the SCSS / CSS / TS types.
   - **SCSS Origam** — a single `_origam.semantic.scss` file matching
     the `origam/css/themed` transform output. For consumers who want
     to bypass Tokens Studio entirely.
   - **W3C Design Tokens JSON** — placeholder, lands in v2.
6. **Sync tab** — placeholder for the v2 inverse flow (repo → Figma).

## Component matrix (v1)

The plugin generates 14 ComponentSets. Each one packs:
- a **reduced Variant matrix** (avoid Cartesian explosion — see
  `src/components/Btn.ts` for the canonical doc)
- **Component Properties** (Boolean / Text / Instance Swap) for
  everything that doesn't warrant a separate variant frame
- **Auto-layout** everywhere
- **Token bindings** via `setBoundVariableForPaint` so theme changes
  propagate live

| Component  | Variant axes                                          | Frames |
| ---        | ---                                                   | ---    |
| Btn        | intent × variant × size (reduced tour)                | 15     |
| TextField  | variant × size × state (reduced tour)                 | 9      |
| Textarea   | variant × size × state (reduced tour)                 | 8      |
| Select     | variant × size × state + open                         | 9      |
| Checkbox   | size × value (full matrix)                            | 9      |
| Radio      | size × value (full matrix)                            | 6      |
| Switch     | variant × size × intent × value (reduced tour)        | 10     |
| Card       | variant × density (full matrix)                       | 12     |
| Chip       | intent × variant × size (reduced tour)                | 10     |
| Avatar    | shape × size × kind (reduced tour)                     | 10     |
| Alert      | intent × variant (reduced tour)                       | 7      |
| Dialog     | size × variant (reduced tour)                         | 7      |
| Toolbar    | variant × density (reduced tour)                      | 5      |
| Badge      | intent × variant × size (reduced tour)                | 10     |
| **Total**  |                                                       | **127** |

`Tabs` is **not** included — Origam composes tabs from `Btn` +
`BtnGroup`, no dedicated component exists. Skipped per the brief.

## Project layout

```
figma-plugin/
  manifest.json            Figma plugin manifest (entrypoints, permissions)
  package.json             scripts + dependencies (esbuild, React, fflate, vitest)
  tsconfig.json            strict TS config
  esbuild.config.mjs       bundles code.ts + ui.tsx, inlines into ui.html
  vitest.config.ts         vitest config (scoped to *.spec.ts)
  src/
    code.ts                main-thread entry — message dispatcher
    ui.tsx                 iframe entry — React 18 root
    ui.html                HTML template
    ui.css                 stylesheet (uses --figma-color-* vars)
    globals.d.ts           __PLUGIN_VERSION__ + *.css ambient declarations
    ui/
      App.tsx              root, owns active-tab state
      TabBar.tsx           accessible tablist
      GenerateTab.tsx      "Generate components" workflow
      ExportTab.tsx        format selector + download
      SyncTab.tsx          v2 placeholder
      constants.ts         tab list, component list, export formats
    lib/
      messaging.ts         type-safe postMessage protocol
      color.ts             hex ↔ Figma RGB/RGBA conversion (28 unit tests)
      color.spec.ts        vitest assertions
      tokens-types.ts      DTCG / Tokens Studio types
      variables.ts         Figma Variables API wrappers
      styles.ts            local Text/Effect Style helpers
    components/
      _shared.ts           reusable builder primitives
      Btn.ts               reference component (15 variants)
      TextField.ts
      Textarea.ts
      Select.ts
      Checkbox.ts
      Radio.ts
      Switch.ts
      Card.ts
      Chip.ts
      Avatar.ts
      Alert.ts
      Dialog.ts
      Toolbar.ts
      Badge.ts
    exporters/
      tokens-studio.ts     DTCG ZIP exporter (uses fflate)
      scss-origam.ts       Single-file SCSS exporter
  dist/                    build output (gitignored)
```

## Architectural conventions

Architectural conventions (`I` prefix for interfaces, `T` prefix for
types, files under `src/lib`, `src/components`, etc.) follow the parent
repo's `CLAUDE.md` and `CLAUDE_CODE_BRIEF.md`.

## Roadmap

- **v1** (this release)
  - 14 ComponentSets generated
  - Tokens Studio JSON + SCSS Origam exporters
  - 3-tab UI shell
- **v2**
  - W3C Design Tokens JSON exporter
  - Inverse Sync (repo → Figma): consume the same Tokens Studio JSON
    and apply it as new Variable values without round-tripping through
    Tokens Studio
  - Brand themes (`semantic/brand-{name}.json`) once they land in the
    repo's `tokens/$themes.json`

## Network access

The manifest currently declares `networkAccess.allowedDomains: ["none"]`
— v1 is fully offline. If a future phase needs to fetch the published
token bundle from a remote URL, update both `manifest.json` and the
`CLAUDE_CODE_BRIEF.md` so the change is auditable.

## Troubleshooting

**"Detect Origam variables" reports missing namespaces.**
The plugin expects Tokens Studio to have created collections named
`Primitive`, `Semantic`, and `Component/{name}` (case-insensitive).
Run Tokens Studio sync first, then click Detect again.

**Exported `_origam.semantic.scss` doesn't match `npm run tokens:build`
output.**
Aliases are flattened in the SCSS exporter (matches Style Dictionary's
`outputReferences: false` setting). If you want the original alias
chains, use the Tokens Studio JSON exporter instead — DTCG references
are preserved as `{namespace.path}` strings.

**Bundle size warning on `dist/ui.js` (~1 MB).**
React 18 + react-dom + the per-tab JSX. Figma's 1 MB plugin limit
applies to `dist/code.js` (currently 137 KB), not the UI iframe — the
UI loads as a regular browser page.
