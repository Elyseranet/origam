# ADR-003 — Themes installed via `createOrigam` (dogfood model)

- **Status**: Accepted (2026-05-30)
- **Deciders**: user (arnaudprioul), team-lead, architect
- **Scope**: `packages/ds` (createOrigam + Nuxt module + theme presets) +
  `packages/marketing` (consumer)
- **Supersedes**: the marketing-side reliance on the pre-generated
  `themes-all.css` matrix. Keeps ADR-001 (two-axis theming) intact.

---

> **Note (2026-09-04)**: this ADR was written while the Style Dictionary v4
> + Tokens Studio token pipeline (`ds/tokens/`) was still the declared
> source of truth for the preset objects (§1) and for contrast fixes (§7).
> That pipeline was removed on 2026-08-31; the text below is left
> unmodified as the historical record of the decision. The token sheets it
> used to generate are now the hand-maintained source of truth — see the
> "Design tokens" section of the repository `CLAUDE.md`.

## Context

Stage 1 wired the marketing themes to the **pre-generated CSS matrix**
(`origam/tokens/css/themes-all`, `[data-theme][data-mode]` blocks). The
marketing site swapped `data-theme` / `data-mode` and the matching CSS
block lit up.

The user clarified the **intended** model: the marketing site is the
**showcase that dogfoods the DS the way a real external consumer would**.
A consumer does not ship our internal pre-built CSS matrix — they
**install themes through `createOrigam`**:

```ts
// nuxt.config — what a consumer (and therefore the showcase) does
origam: {
  themes: [sobreTheme, glassTheme, geekTheme, /* … */],
  defaultTheme: 'sobre',
  defaultMode: 'auto'
}
```

This is not a cosmetic change: it makes the showcase prove the public
install path, and it makes contrast / "geek is broken" into **DS findings**
(fix in tokens) rather than marketing CSS overrides.

### What already exists (built under T-DS3 — large head start)

The DS already ships the runtime-injection machinery this model needs:

- `IOrigamTheme` (`interfaces/Theme/origam-theme.interface.ts`) —
  `{ name?, mode?, vars?, tokens?, component? }`. A theme object resolves
  to a `--origam-*` block scoped by `name` → `[data-theme="<name>"]` and
  `mode` → `[data-mode="<mode>"]` (exactly ADR-001's two axes).
- `resolveThemeVars`, `tokenTreeToVars`, `themeSelector`, `applyTheme`
  (`utils/Theme/apply-theme.util.ts`) — walk a DTCG tree via the shared
  `tokenPathToCssVar` naming util and inject a `<style>` block (SSR-safe).
- `createOrigam({ theme })` already calls `applyTheme(options.theme)` for a
  **single** theme.

The gaps are: **plural** install, **the Nuxt module still importing the
pre-generated CSS** instead of injecting objects, **no preset objects**,
and **no runtime list** of configured themes for the switcher.

## Decision

1. **Theme presets live in the DS as importable objects: `origam/themes`.**
   The 8 example brands (sobre, glass, geek, cartoon, editorial, material,
   ecom, apple) are exported as `IOrigamTheme[]` (one object per
   brand×mode, or one object per brand carrying both modes — see §B of the
   re-plan). This is the most consumer-realistic option: an external app
   does `import { geekTheme } from 'origam/themes'` exactly as the showcase
   does. It proves the DS ships usable presets, not just a private CSS
   matrix.

   - Source of truth stays the Tokens Studio JSON under `ds/tokens/`. The
     preset objects are **generated from those tokens at build time**
     (same pipeline) into `origam/themes`, so presets and the published
     CSS sheets never drift.

2. **`createOrigam` accepts `themes: IOrigamTheme[]`** (plural) alongside
   the existing singular `theme`. It injects each theme's CSS-var block
   (scoped by name×mode) via the existing `applyTheme` machinery, and
   exposes the installed list (names) through the app's provide context.

3. **The Nuxt module installs theme objects, not CSS imports.** The
   `themes` option accepts `IOrigamTheme[]` (or preset names it resolves to
   objects). The module stops `push`-ing `origam/tokens/css/${theme}` and
   instead hands the objects to `createOrigam` (server + client plugins),
   which injects them. `primitive` + `utilities` CSS stay (they are the
   theme-invariant base). `defaultTheme` selects the active brand,
   `defaultMode` the active mode.

4. **Module DEFAULTS change**: `themes: ['origam']` (the default brand),
   not `['light', 'dark']`. Light/dark are the **mode** axis
   (`defaultMode`), not themes. A bare install shows the `origam` brand in
   auto mode.

5. **The switcher list derives from the configured themes.** The runtime
   config / provide exposes the installed theme names; `ThemeSwitcher`
   maps over that list instead of a hard-coded `MARKETING_THEMES` const.

6. **`themes-all.css` is demoted to a build/preview artifact.** It may
   stay for Histoire/visual-regression, but the **marketing site no longer
   depends on it**. Marketing's theming flows entirely through the install.

   > **Update (2026-08-27, issue #497)**: the artifact was fully removed,
   > not just demoted. `$themes.json` had dropped to 2 entries (`light`,
   > `dark`) with zero `<brand>-<mode>` combos, so the generator's
   > aggregation step (`build-tokens.mjs`) had silently become a no-op —
   > the ~2.1 MB CSS/SCSS files on disk were a stale hand-edited snapshot,
   > not a build output, and nothing loaded them (no `@import`/`href`/
   > `url()` anywhere). The `origam/tokens/css/themes-all` and
   > `origam/tokens/scss/themes-all` export subpaths, the two generated
   > files, and the dead aggregation branch in `build-tokens.mjs` are gone.
   > Anyone who imported those subpaths should switch to the per-theme
   > sheets (`origam/tokens/css/light`, `origam/tokens/css/dark`, and
   > their `scss` counterparts). This is a breaking change (major bump),
   > see `CHANGELOG.md`.

7. **Contrast / broken-theme fixes are DS findings.** Anything the dogfood
   reveals (low contrast, geek neon unreadable) is corrected in
   `ds/tokens/semantic/{theme}-{mode}.json`, never via a marketing
   override. The showcase's job is to surface these.

## Alternatives considered

- **Themes as marketing-local data** (objects defined in
  `packages/marketing`). Rejected: it does *not* dogfood the public API —
  an external consumer couldn't reproduce it, and the DS would not prove it
  ships usable presets. The whole point is consumer-realism.

- **Keep the CSS matrix, just hide it behind a marketing wrapper.**
  Rejected: still couples marketing to an internal artifact and hides the
  contrast bugs the user wants surfaced.

## Consequences

- **DS** gains `origam/themes` (generated presets), plural `themes` on
  `createOrigam`, an object-based module `themes` option with runtime
  injection, new DEFAULTS, and a runtime list of installed themes.
- **Marketing** `nuxt.config` installs preset objects; `ThemeSwitcher`
  derives its list from the install; the `themes-all.css` import and the
  `MARKETING_THEMES` hard-coded list are removed.
- **ADR-001 unchanged** — the two-axis attributes are exactly what the
  injected blocks are scoped on. `useTheme` / `OrigamThemeProvider`
  Stage-1 work stays valid; only the **source** of the variables changes
  (install-time injection vs pre-generated CSS).
- **ADR-002 unchanged** — the Builder's `ITheme` still reduces to
  `IOrigamTheme` at export; `createOrigam({ theme })` is exactly the
  install path the export snippet targets.

## Related

- ADR-001 — two-axis theming.
- ADR-002 — Theme Builder data model & export.
- `packages/marketing/SPECS-v3-phase2.md` — revised tickets.
