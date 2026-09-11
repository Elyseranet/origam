# ADR-002 — Theme Builder data model & export

- **Status**: Accepted (2026-05-29)
- **Deciders**: user (arnaudprioul), team-lead, architect
- **Scope**: `packages/marketing` (`/themes/builder`) + a shared naming
  util exported from `packages/ds`
- **Depends on**: ADR-001 (two-axis theming)

---

## Context

`SPECS-v3.md` defines a no-code Theme Builder that lets a user edit global
tokens (color, radius, typography, shadow, spacing, animation) and
per-component config, preview a full mini-dashboard live (device ×
light/dark), and export the result as **JSON / TypeScript / CSS** plus an
integration snippet:

```ts
import { myTheme } from './my-theme'
createOrigam({ theme: myTheme })
```

Two realities constrain the model:

1. **The SPEC's token vocabulary is a simplification of the DS semantic
   surface.** The SPEC lists `Primary, Surface, Background, Text, Border`;
   the DS semantic layer is richer — e.g. `color.action.primary.{bg,
   bgHover, bgSubtle, bgDisabled, fg, fgSubtle, fgDisabled}`,
   `color.surface.{default, raised, overlay, sunken, disabled}`,
   `color.text.{primary, secondary, disabled, inverse, onColor}`. A naive
   1:1 ("Primary" → one variable) would leave hover/subtle/disabled
   states unthemed.

2. **`createOrigam` does not yet ingest a theme object** (it provides
   icons/display/locale/date/goTo only). The snippet is a capability to
   build, tracked as a DS ticket (T-DS3).

## Decision

### 1. Editable **anchors**, derived **ramps**

The Builder edits a small set of **anchor** values and **derives** the
full DS semantic surface from them (deterministically, same math the
hand-authored themes use):

- For each intent (`primary, secondary, success, warning, danger, info`)
  the user edits **one** anchor color; the Builder derives `bg`, `bgHover`
  (darken/lighten step), `bgSubtle` (alpha), `bgDisabled`, `fg`
  (contrast-picked), `fgSubtle`, `fgDisabled`.
- `surface` / `text` / `border` anchors derive their `default/raised/…`
  and `primary/secondary/…` rungs by the same stepping function.
- The derivation function is **shared, not re-invented**: it lives next to
  the DS token math and is exported for the Builder to consume, so a
  Builder-made theme and a hand-authored theme resolve identically.

Advanced users can override any derived rung individually (the model
keeps an `overrides` map keyed by full token path).

### 2. `ITheme` shape (DTCG-compatible)

```ts
interface ITheme {
  name: string
  author: string
  description: string
  tokens: {
    color:      IThemeColorAnchors      // intent + surface/text/border anchors
    radius:     Record<TRadiusRung, string>      // xs..2xl, pill
    typography: IThemeTypography         // family, scale, weight, tracking, leading
    shadow:     Record<TShadowRung, string>       // xs..xl
    spacing:    Record<TSpacingRung, string>      // xs..xl
    animation:  Record<TAnimationSpeed, string>   // fast/normal/slow
  }
  components: Partial<Record<TBuilderComponent, IComponentConfig>>
  overrides?: Record<string, string>     // full-path manual overrides
}
```

`tokens` maps 1:1 onto the DS semantic groups; `components` maps onto
`tokens/component/*.json`. Interfaces live in `app/interfaces/`,
types/enums/consts in their folders (project convention).

### 3. Export reuses the DS pipeline naming, not a second generator

- **CSS**: `ITheme` → resolve anchors to the full token set → emit
  `--origam-{group}-{…}` via the DS's **own** `path → css-var` naming
  function (`origam/name/css`), exported from the DS as a pure util. No
  parallel naming logic in marketing. Output is a `[data-theme="<name>"]`
  block (two-axis: emit light + dark blocks when both modes are authored).
- **JSON**: the `ITheme` object, DTCG-shaped, re-importable into Tokens
  Studio and the Style Dictionary build.
- **TS**: `export const myTheme = { … } satisfies ITheme`.
- **Snippet**: `createOrigam({ theme: myTheme })` once T-DS3 lands; until
  then the documented integration is "import the generated `.css` + set
  `data-theme`".

### 4. Live preview is scoped, not global

The edited theme is applied to the preview **sub-tree only**, via
`OrigamThemeProvider` (ADR-001 `mode` prop) plus inline CSS-var injection
on the dashboard wrapper. It never touches `<html>`, so editing a theme
does not repaint the surrounding builder chrome. Device frame = wrapper
width; light/dark = provider `mode`.

## Alternatives considered

- **Flat 1:1 token editing (one input per CSS var).** Rejected: hundreds
  of inputs, no coherence between related rungs, and it pushes color-ramp
  math onto the user. Anchors + derivation matches how the existing themes
  were authored.

- **A marketing-local CSS-var generator.** Rejected: it would drift from
  the DS naming transform the moment either side changes. The naming
  function is the single source of truth and is exported from the DS.

## Consequences

- DS exports (a) a pure `tokenPathToCssVar` util and (b) the ramp
  derivation function, both consumed by the Builder. Tracked under T-DS3.
- The Builder's `useThemeExport` is thin: it orchestrates derivation +
  naming + string templating per format. No bespoke CSS knowledge.
- A round-trip test (export JSON → re-import → identical `ITheme`) is part
  of the Builder's acceptance (T-QA).

## Related

- ADR-001 — two-axis theming.
- `packages/marketing/CLAUDE.md` rule 5.
