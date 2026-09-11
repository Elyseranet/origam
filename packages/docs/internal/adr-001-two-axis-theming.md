# ADR-001 — Two-axis theming (`data-theme` × `data-mode`)

- **Status**: Accepted (2026-05-29)
- **Deciders**: user (arnaudprioul), team-lead, architect
- **Scope**: `packages/ds` (runtime theming) + `packages/marketing` (consumer)

---

## Context

The origam token pipeline (Style Dictionary v4 + Tokens Studio) emits a
**theme matrix scoped on two attributes**:

```css
[data-theme="geek"][data-mode="dark"]  { /* … */ }
[data-theme="cartoon"][data-mode="light"] { /* … */ }
```

8 brand themes (sobre, glass, geek, cartoon, editorial, material, ecom,
apple) × 2 modes (light, dark) = 16 generated blocks
(`packages/ds/src/assets/css/tokens/themes-all.css`).

The **runtime**, however, only ever knew **one axis**:

- `useTheme()` (`packages/ds/src/composables/Theme/theme.composable.ts`)
  manages a single `data-theme` attribute whose value is `light | dark |
  <custom>`.
- `ORIGAM_THEME_ATTR = 'data-theme'` is the only attribute constant.
- The Nuxt module plugins (`plugin.server.ts`, `plugin.client.ts`) read /
  write a single `origam-theme` cookie and set a single `data-theme`
  attribute. They never set `data-mode`.

**Consequence**: the 16-theme matrix is unreachable through the official DS
API. Any consumer that wants the matrix must set `data-theme` *and*
`data-mode` by hand. This is exactly why `packages/marketing` grew a
parallel theming layer (`--m-*` variables + a hand-rolled `ThemeSwitcher`
that writes both attributes via `useHead`).

A second, related gap: **no theme defines a `shadow` / `elevation`
semantic tier**. Audited across all 20 `tokens/semantic/*.json` files —
every theme carries `color`, most carry `radius`, only `cartoon` carries
`border`, a few carry `font`, and **none carry `shadow`**. Component
tokens such as `card.box-shadow = {shadow.sm}` therefore resolve to a
*primitive* shadow that is identical across every theme, which forced the
marketing layer to hard-code per-theme box-shadows (geek neon, cartoon
hard-offset, material M3, …).

## Decision

1. **Adopt a two-axis theming model as the canonical DS contract.**
   - `data-theme` carries the **brand** identity
     (`sobre | glass | geek | cartoon | editorial | material | ecom |
     apple | <custom>`).
   - `data-mode` carries the **light/dark** variant (`light | dark`).
   - The two axes are orthogonal: any brand × any mode.

2. **Extend the DS runtime to own both axes** (no consumer-side
   work-arounds):
   - `useTheme()` exposes a `theme` ref (brand) **and** a `mode` ref
     (light/dark), each persisted and each reflected onto its own
     attribute. Add `ORIGAM_MODE_ATTR = 'data-mode'`.
   - `applyThemeSync` writes both attributes.
   - The Nuxt module gains `modes` / `defaultMode` options and a second
     cookie (`origam-mode`). The server plugin resolves `mode` from the
     `origam-mode` cookie then the `Sec-CH-Prefers-Color-Scheme` hint, and
     injects both attributes no-flash. The client plugin syncs both
     cookies.
   - `OrigamThemeProvider` gains a `mode` prop so a sub-tree can be pinned
     to an arbitrary `brand × mode` (needed by the Theme Builder preview).

3. **Add a `shadow` (and `elevation`) semantic tier per theme.** The token
   build emits `--origam-shadow-{rung}` scoped to `[data-theme][data-mode]`
   so component tokens that already reference `{shadow.x}` inherit the
   per-theme value with **no SCSS change**.

4. **Themes are expressed through tokens, not through a parallel CSS
   layer.** The marketing `--m-*` / `[data-theme]` override layer is
   retired (see ADR-002 / the marketing overlay). Anything a token cannot
   express (gradient fills, `backdrop-filter`, `::first-letter` drop-caps,
   multi-layer `drop-shadow`) is the *only* thing allowed to live in a
   scoped, commented CSS overlay.

## Alternatives considered

- **Flatten the matrix to 16 single-axis themes**
  (`data-theme="geek-dark"`). Rejected: it contradicts what the token
  build already emits (we would have to regenerate every selector), it
  loses the orthogonality (a consumer toggling light↔dark would have to
  string-rewrite the brand half), and it doubles the public theme
  vocabulary. The two-axis model is the smaller, more correct change.

- **Leave the runtime single-axis and let consumers set `data-mode`
  themselves.** Rejected: that *is* the status quo that produced the
  parallel marketing layer. The whole point is to make the matrix
  reachable through the supported API.

## Consequences

- **DS** ships a richer theming runtime (two refs, two cookies, two
  attributes). `useTheme`, the module options, the plugins, and
  `OrigamThemeProvider` all change — versioned as a minor/major bump on
  `packages/ds` per the release policy.
- **Token pipeline** gains a `shadow`/`elevation` semantic tier; every
  `tokens/semantic/{theme}-{mode}.json` must declare it.
- **Marketing** drops its parallel theming, recables `ThemeSwitcher` onto
  `useTheme()`, and migrates per-theme looks into tokens (+ a minimal,
  documented `theme-effects.css` for the inexpressible bits).
- **Docs** (`composables/useTheme.md`, `components/ThemeProvider`,
  `integrations/nuxt.md`) are updated to document the two-axis model.

## Related

- ADR-002 — Theme Builder data model & export (reuses the token pipeline).
- `packages/marketing/CLAUDE.md` — marketing engineering overlay enforcing
  these rules.
