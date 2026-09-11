# Changelog

## 0.1.0 — v1 release

First public version of the Origam DS Sync Figma plugin. Built across
9 phases tracked in `../CLAUDE_CODE_BRIEF.md`.

### Plugin shell

- Manifest: `editorType: ["figma"]`, no network access, dynamic
  `documentAccess`. Modern Figma plugin contract.
- Bundler: esbuild Node API, two entries (`code.ts` for the main
  thread, `ui.tsx` for the iframe), inlined into `dist/ui.html` via a
  template marker swap. Watch mode supported.
- TypeScript strict + `exactOptionalPropertyTypes`,
  `noImplicitOverride`, `noUnusedLocals`/`noUnusedParameters`.

### UI (3 tabs, React 18)

- **Generate** — banner about Tokens Studio prereq, "Detect Origam
  variables" button, 14-component checklist with Select all/none,
  "Generate components" button (disabled when zero selected).
- **Export** — radio group for format (Tokens Studio JSON / SCSS
  Origam / W3C placeholder), Export button, `aria-live` status zone
  with download wiring.
- **Sync** — v2 placeholder.
- Auto light/dark match via `--figma-color-*` runtime CSS vars.
  Accessible tablist with `role="tablist"` + `aria-selected` + roving
  tabindex.

### Lib helpers

- **`messaging.ts`** — discriminated-union message protocol (UI ↔
  main thread). Wrappers `postToCode` / `postToUI` /
  `onMessageFromUI` (catches sync throws and async rejections,
  forwards as `{type:'error'}`) / `onMessageFromCode`.
- **`color.ts`** — hex ↔ Figma RGB/RGBA conversion. Pure module, **28
  unit tests** in `color.spec.ts` covering identity / alpha /
  floating-point tolerance / clamp / parse / throw paths.
- **`tokens-types.ts`** — DTCG / Tokens Studio types anchored on
  `tokens/primitive.json` and `tokens/component/btn.json`.
- **`variables.ts`** — defensive Figma Variables API wrappers
  (`findCollection`, `findVariableByName`, `getVariableValue`,
  `bindVariableToFill/Stroke/CornerRadius`).
- **`styles.ts`** — local Text/Effect Style stubs.

### Component builders (14 ComponentSets — 127 frames total)

| Component | Variant axes                                          | Frames | Component Properties |
| ---       | ---                                                   | ---    | ---                  |
| Btn       | intent × variant × size (reduced tour)                | 15     | `disabled`, `loading`, `iconPrepend`, `iconAppend`, `block`, `rounded`; text `label`; instance swap `iconPrependSlot`/`iconAppendSlot` |
| TextField | variant × size × state (reduced tour)                 | 9      | 4 booleans, 6 text, 4 instance swap |
| Textarea  | variant × size × state (reduced tour)                 | 8      | TextField + `autoGrow`, `noResize`, text `rows` |
| Select    | variant × size × state + open                         | 9      | TextField + `multiple`, `chips`, `clearable`, `searchable`, `loading` |
| Checkbox  | size × value (full matrix)                            | 9      | `error`, `disabled`; text `label` |
| Radio     | size × value (full matrix)                            | 6      | `error`, `disabled`; text `label` |
| Switch    | variant × size × intent × value (reduced tour)        | 10     | `disabled` |
| Card      | variant × density (full matrix)                       | 12     | `hover`, `clickable`, `withImage`, `withActions`; 3 text + 2 instance swap |
| Chip      | intent × variant × size (reduced tour)                | 10     | `closable`, `selected`, `disabled`, `withAvatar`, `withIcon`; text `label`; 2 instance swap |
| Avatar    | shape × size × kind (reduced tour)                    | 10     | `withBadge`; text `initials`; 3 instance swap |
| Alert     | intent × variant (reduced tour)                       | 7      | `closable`, `withIcon`, `withActions`, `prominent`; 2 text + 2 instance swap |
| Dialog    | size × variant (reduced tour)                         | 7      | `withIcon`, `persistent`, `scrollable`; 2 text + 3 instance swap |
| Toolbar   | variant × density (reduced tour)                      | 5      | `flat`, `floating`, `withExtension`; text `title`; 3 instance swap |
| Badge     | intent × variant × size (reduced tour)                | 10     | `inline`; text `value` |

All builders share a defensive pattern: when a Figma Variable doesn't
exist, fall back to the Vue-source default value and surface a
`figma.notify` warning. Auto-layout everywhere. All paddings / fills /
strokes / corner radii bound to Figma Variables (no hardcoded
component values).

`Tabs` is intentionally NOT included — Origam composes tabs from
`Btn + BtnGroup`, no dedicated component in `src/components/`.

### Exporters

- **Tokens Studio JSON** (`exporters/tokens-studio.ts`) — walks all
  local Figma Variable collections + modes, serialises to DTCG
  (`{ "$type": "color", "$value": "#FFFFFF" }`), follows
  `VariableAlias` chains and emits `{namespace.path}` references.
  Bundles via `fflate.zipSync` into a `.zip` mirroring the
  `tokens/` repo layout. Detection of token-set boundaries handles
  both Tokens Studio's multi-collection layout and the flat-collection
  fallback.
- **SCSS Origam** (`exporters/scss-origam.ts`) — single
  `_origam.semantic.scss` matching the format produced by the
  `origam/css/themed` transform in `scripts/tokens.config.mjs`.
  Naming convention reproduced exactly (`primitive.color.neutral.0` →
  `--origam-color-neutral-0`, `component.btn.success.bg` →
  `--origam-btn--success---bg`). Aliases flattened to concrete values
  (matches `outputReferences: false`). Theme-scoped output blocks
  (`:root, [data-theme="light"]` + `[data-theme="dark"]`).
- **W3C Design Tokens JSON** — placeholder, returns "v2" error.

### Build artefacts (this release)

- `dist/code.js` — 137.4 KB
- `dist/ui.js` — 1.1 MB (React 18 + react-dom + per-tab JSX)
- `dist/ui.css` — 7.7 KB
- `dist/ui.html` — 1.07 MB final inlined

### Test results

- `npm run typecheck` — pass
- `npx vitest run` — **28/28 pass** (color.spec.ts)
- `npm run build` — pass

### Manual verification still required

CLI cannot exercise the Figma API. The project-manager (and the
designer) must verify in Figma desktop:

1. Tokens Studio has synced `tokens/` and Variables exist
2. Plugin loads via Plugins → Development → Import from manifest
3. Generate tab creates 14 ComponentSets in `[Origam] Components`
4. Each ComponentSet exposes the Component Properties listed above
5. Switching the file's theme flips Variable bindings live
6. Export tab → Tokens Studio JSON: round-trip produces a `.zip`
   that, once unzipped, diffs to zero against the source `tokens/`
7. Export tab → SCSS Origam: produces a `_origam.semantic.scss`
   functionally equivalent to `_light.scss + _dark.scss` from
   `npm run tokens:build`

### Known limitations

- Brand themes (other than light/dark) are **skipped** in v1 SCSS
  output. Roadmap item per the brief.
- `btn.gap` token doesn't exist in `tokens/component/btn.json` —
  the builder hardcodes 8 px with a `// TODO` comment. Either add
  the token (and rebuild) or accept the fallback.
- Component fills are mutated via an `unknown` cast over the
  read-only `fills` typing in `@figma/plugin-typings`. Pragmatic
  given the API design; could be tidied with a dedicated
  type-asserted helper.

## Dependencies

- `react@18`, `react-dom@18` (UI)
- `fflate@^0.8.2` (zip in the Tokens Studio exporter — ~9 KB)
- `@figma/plugin-typings@^1.108.0` (dev)
- `esbuild@^0.24.0` (dev)
- `typescript@^5.6.3` (dev)
- `vitest@^2.1.0` (dev)
