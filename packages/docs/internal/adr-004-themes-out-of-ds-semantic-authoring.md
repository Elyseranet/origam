# ADR-004 — Themes out of the DS + semantic JSON theme authoring

- **Status**: Implemented (2026-06-12)
- **Deciders**: user (arnaudprioul), backend-lead, architect
- **Scope**: `packages/ds` (createOrigam + theme model + Nuxt module + token
  build) + `packages/marketing` (consumer, separate stream)
- **Supersedes**: ADR-003's "theme presets live in the DS as `origam/themes`".
  Keeps ADR-001 (two-axis theming) and ADR-002 (Theme Builder data model) intact.

---

## Context

ADR-003 shipped the 8 brand presets **inside the DS** as a generated
`origam/themes` barrel. That barrel ballooned to ~2.8 MB and OOM-killed the
marketing Nitro build. More fundamentally, brand themes are **not** the DS's
concern: the DS is pure mechanics plus its own neutral identity. The 7 extra
brands (glass, geek, cartoon, editorial, material, ecom, apple) belong to the
**consuming app** (the marketing showcase), not to the published library.

Separately, the theme **authoring format** was wrong for DX. A theme was a flat
map of raw CSS variables:

```ts
vars: { '--origam-color__surface---default': '#fff', /* … 50 more … */ }
```

The user rejected this: a theme should be written as **clean semantic JSON**,
by intention, with **no `--origam-` prefixes** and **no DTCG `$value`**.

## Decision

1. **The DS ships exactly ONE theme: `sobre`** (the neutral base). It is the
   implicit default `createOrigam()` installs when no theme is supplied. All
   other brands live in the consuming app and are passed in as objects.

2. **Themes are authored as plain semantic JSON.** A theme object exposes:
   - `colors` — the color surface (nested by intention), and
   - sibling scales `radius`, `typography`, `shadow`, `spacing`, `animation`.

   Each leaf path resolves to its `--origam-*` variable through the shared
   `tokenPathToCssVar` grammar, so a hand-written theme is byte-for-byte
   compatible with the published token sheets. `vars` (raw custom properties)
   and `tokens` (raw DTCG tree) remain only as **advanced escape hatches**.

   Full reference: **[Theme authoring](../integrations/theming-authoring.md)**.

3. **A gradient is an ordinary color value.** There is **no dedicated gradient
   group** in the theme model. A color slot accepts solid / rgb / hsl /
   gradient alike (`surface: { default: 'linear-gradient(…)' }`).

4. **The config stays JSON** — serialisable, so a Theme Builder export
   round-trips without loss.

## Resolution grammar (parity)

The friendly authoring field maps to a token-path root, then the leaf path
flows through the existing CSS-variable grammar:

| Field | Root | Example path | Resolved variable |
|---|---|---|---|
| `colors` | `color` | `surface.default` | `--origam-color__surface---default` |
| `colors` | `color` | `action.primary.bg` | `--origam-color__action--primary---bg` |
| `radius` | `radius` | `md` | `--origam-radius---md` |
| `spacing` | `space` | `4` | `--origam-space---4` |
| `typography` | `font` | `size.md` | `--origam-font__size---md` |
| `shadow` | `shadow` | `md` | `--origam-shadow---md` |
| `animation` | `motion` | `duration.fast` | `--origam-motion__duration---fast` |

## Consequences

- The 2.8 MB `origam/themes` barrel and the per-brand preset generator are
  removed; the marketing Nitro OOM is resolved at the root.
- `createOrigam` provides the per-component `component` defaults layer under
  `ORIGAM_DEFAULTS_KEY` (unchanged by this ADR — see `useTheme.md`).
- The marketing stream re-authors its 7 brands in the semantic JSON format and
  passes them as `IOrigamTheme[]` objects to the Nuxt module.

## Resolved item — gradient preset palette

**Decision**: gradient presets (`gradient-sunset`, `gradient-ocean`, …) are
**kept** in the DS as a named CSS tier. They are NOT brand themes — they are
primitive preset values exposed via `--origam-gradient---*` CSS variables
(generated from `tokens/semantic/gradient-{light,dark}.json`) and consumed by
`OrigamTextMask` and `color.composable`. The gradient tier continues to generate
alongside `light` and `dark`. It is not part of the theme-authoring model (no
`gradient` field in `IOrigamTheme`) and is not shipped as a consumer import —
it is a DS-internal feature, retained in `$metadata.json` / `$themes.json`.
