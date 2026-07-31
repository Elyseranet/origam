# origam — Changelog

This changelog tracks releases of the `origam` package itself. Token-value
churn (Tokens Studio sync from Figma, semantic primitive shifts) lives in
[`tokens/CHANGELOG.md`](./tokens/CHANGELOG.md) — keep them separate so
"the design moved" never blocks a release of "the code shipped a new
component".

Format inspired by [Keep a Changelog](https://keepachangelog.com).
This project follows [Semantic Versioning](https://semver.org).

---

## [Unreleased]

---

## [2.12.1] — 2026-07-31

**Hotfix — `vue-router` 5 is now accepted.** A consuming project could not
upgrade to Nuxt 4.5.1: Nuxt pulls `vue-router` 5, while origam declared an
optional peer of `vue-router: "^4.5.0"`. The peer range is widened to
`"^4.5.0 || ^5.0.0"`.

Nothing else changed — no runtime code, no public API, no dependency added.
The widening is strictly additive: projects on `vue-router` 4 are unaffected,
projects on 5 stop being blocked.

Vue Router 5 is, in the maintainers' own words, "a *boring* release, it
merges unplugin-vue-router into the core package with no breaking changes",
and the official migration guide states: "If you're using Vue Router 4
without unplugin-vue-router, there are no breaking changes". origam does not
use unplugin-vue-router, nor the iife build (the single documented breaking
change is that the iife bundle no longer ships `@vue/devtools-api`).

Verified on both majors before shipping: every symbol origam imports
(`useLink`, `RouterLink.useLink`, `RouteLocationRaw`, `Router`,
`RouteLocationNormalizedLoaded`, `NavigationGuardNext`, `UseLinkOptions`)
still exists in 5.2.0; type-check of the design system is clean against
4.6.4 and 5.2.0 alike; and the built `dist` was exercised at runtime under
both — href resolution, named routes, click navigation, external hrefs,
`isActive`, and the tag fallback when no `to` is passed all behave
identically.

**Consumer note.** `vue-router` 5 requires `vue` `^3.5.34 || ^4.0.0`, while
origam's peer on `vue` remains `^3.5.0`. A project pinned between Vue 3.5.0
and 3.5.33 that adopts `vue-router` 5 will hit a conflict — between `vue`
and `vue-router` directly, not with origam.

---

## [2.12.0] — 2026-07-29

**Hotfix — `vue-i18n` is optional again.** A consuming project reported that
origam could not be enabled at all: `createOrigam()` reached `createLocale()`,
which imported `vue-i18n` at module level, even though the package declares it
as an **optional** peer. Any project without `vue-i18n` failed at import time.

### Fixed

- **`createLocale()` no longer imports `vue-i18n`.** The default locale is now
  backed by a built-in adapter shipped with the DS. Runtime *and* type
  dependencies are gone — `grep vue-i18n` over the published `dist/` returns
  only a string literal (the vue-i18n adapter's own `name` field) and a
  comment. (Reported by a consumer.)
- The `vue-i18n` **type** imports in `locale.interface.ts` / `locale.util.ts`
  are replaced by locally-declared structural types. An `import type` costs
  nothing at runtime but still breaks `tsc` for a project that does not install
  the package once `skipLibCheck` is `false` — the same class of bug, one step
  further.

### Added

- **`createBuiltinAdapter()`**, exported from `origam/utils`. Resolves dotted
  keys, falls back to the fallback locale then to the key itself, and
  interpolates both positional (`{0}`) and named (`{value}`) params — the only
  two forms used by the DS's own messages.

  It deliberately does **not** reimplement `vue-i18n`: no plurals, no linked
  messages, no date formatting. A consumer needing those keeps `vue-i18n` and
  passes their own adapter.

### Changed — read this if you use `vue-i18n`

**The default adapter is no longer `vue-i18n`.** If you relied on
`createOrigam()` building a `vue-i18n` instance for you, pass it explicitly:

```ts
import { createOrigam } from 'origam'
import { createVueI18nAdapter } from 'origam/utils'
import { createI18n, useI18n } from 'vue-i18n'

const i18n = createI18n({ legacy: false, locale: 'en' })

createOrigam({
    locale: { adapter: createVueI18nAdapter({ i18n, useI18n }) }
})
```

Nothing changes for the DS's own strings — they resolve identically through
either adapter. This is a **minor** rather than a patch precisely because that
default changed.

---

## [2.11.0] — 2026-07-28

Theming-resolution release. Every fix here has the same root cause: a
component **declared** theme-able props but never **consumed** them, so an
`IOrigamTheme.components` block was a silent no-op. Minor rather than patch
because the public prop surface grew (see *Added*), even though every commit
is labelled `fix`.

### Added

- **`ISelectionControlProps` now extends `IBorderProps` / `IRoundedProps` /
  `IElevationProps`**, inherited by `ICheckboxBtnProps` and `IRadioBtnProps`.
  `OrigamSelectionControl` consumes them through the standard
  `useBorder` / `useRounded` / `useElevation` composables, on the
  state-layer box that owns the control's visible surface — same relay point
  as `OrigamSwitchTrack`. Checkbox and Radio therefore accept `border`,
  `rounded` and `elevation`, from a prop or from a theme. (#241)

  ::: warning Known limit — `rounded` alone paints nothing at rest
  The state-layer box has no background and no border by default, so a
  `rounded` passed on its own is measurable in the computed style but
  produces no visible difference at rest. It shows on hover (the state layer
  now follows the radius), or combined with `border` / `elevation` / a
  custom background. The glyph itself (`mdi-checkbox-*`, `mdi-radiobox-*`)
  is an icon-font character and keeps its own shape — reshaping the mark
  would be a rendering change, not a prop. Documented in the Checkbox and
  Radio pages.
  :::

### Fixed

- **`OrigamBtnGroup`** forwarded `density`/`color`/`bgColor`/`size`/`hover`/
  `active` to its children unconditionally, overwriting theme defaults with
  `undefined`. Now filtered through `usePassedProps()` — the helper that
  detects whether the *consumer* actually passed a prop, since Vue coerces an
  unpassed boolean to `false`, never `undefined`. (#274)
- **`:is="tag"` bypassed theme resolution** on 7 components — `OrigamAvatar`,
  `OrigamBtnGroup`, `OrigamExpansionPanel`, `OrigamLabel`, `OrigamMessages`,
  `OrigamTab`, `OrigamTabs`. In `<script setup>` the template binds each prop
  from the *raw* `$props`, independently of the local
  `props = useDefaults(_props)`, so a bare `:is="tag"` never saw the theme's
  value. The audit the ticket asked for widened the scope from 1 file to 7.
  (#250)
- **`OrigamSelectionControl` declared `grid-area: control` unconditionally**,
  assuming it always sits inside a Field/Input named grid. Any consumer
  placing a bare control in its own grid saw every instance collapse onto one
  cell. The declaration was in fact **dead code** on the Field/Input path —
  `.origam-input__control` already owns `grid-area: control` *and* is
  `display: flex`, and a `grid-area` on a flex child has no effect — so it is
  removed rather than scoped. (#247)
- **The Checkbox/Radio hover halo hardcoded `border-radius: 100%`**, staying
  circular even under `rounded="md"` — while being the only surface the prop
  could paint. Now `inherit`. (#241)

### Internal

- Marketing i18n: locale files split one per top-level namespace, an
  `i18n:check` script wired into CI, and 195 missing translation keys filled
  (400 → 205). EN/FR parity reached **0 gap** — the admin backoffice went
  from 0 % to fully translated. No change to the published package.

---

## [2.10.0] — 2026-07-27

Field-rendering release. No new API — no component, prop, emit or slot was
added, and no source file was created. The minor bump is there to flag one
**visible rendering change** for consumers of `origam/styles` (see *Changed*);
everything else is a fix.

### Changed

- **`--origam-field__input---padding-start` / `-end` now resolve to `0`**
  (was `var(--origam-space---4)`, i.e. 16px) for consumers of the bundled
  `origam/styles` (`main.css`). The inline spacing of a field is owned by the
  **root** token `--origam-field---padding-start`, which is unchanged at
  `{space.4}`; the input wrapper sits inside it, so a second inline padding
  doubled it — and it truncated the value text of narrow controls
  (`elevated` → `ele…`). Consumers importing `origam/tokens/css/{light,dark}`
  are **unaffected**: those sheets already emitted `0` since 2026-07-24.
  Fields keep their inline spacing, supplied by the root token. (#295)

### Fixed

- **Tokens** — `field.input.padding-start/end` was `0` in the generated sheets
  but `{space.4}` in the token source, so every `tokens:build` silently
  reverted the fix, and `main.css` (produced by the separate `styles:build`
  step) had drifted to a third value. The source now carries the intent and
  the pipeline is idempotent — a second full build produces no diff. (#295)
- **`OrigamSliderField`** — the `rounded` prop was inert: radii were
  hardcoded instead of going through `useRounded()`. (#283)
- **`OrigamApp`** — did not call `useDefaults()`, so
  `theme.components['origam-app']` (`bgColor`, `fullHeight`) was ignored.
- **`OrigamField`** — inline padding is floored at the corner radius so
  content clears the rounded outline, and the outline's start leg is widened
  to match, the left corner no longer rendering flatter than the right.
  Prepended fields are excluded to avoid a swatch/icon box artifact.
- **`OrigamField`** — the outlined floating label was pinned to the notch
  corner by a hard `margin: 0 4px` while the input text and the resting label
  both sit at `--origam-field__input---padding-start`, leaving the label
  misaligned with its own value — visibly so on large-radius themes.
- **`OrigamColorPickerField`** — the swatch sat inside the field's inline
  padding, so any consumer raising `--origam-field---padding-start` opened a
  gap between the colour and the left border. Also fixed: the field wrapping
  onto two lines when given content, and the swatch's square outer corner.
- **`OrigamColorPicker`** — a class typo on the hue/alpha slider fill
  occluded both gradients.
- **`OrigamDatePickerField`** — wrapped onto two lines when given content in
  `range` mode.

### Internal

- Quality Gate unblocked: the two SonarQube new-code violations that had kept
  the `Build` workflow red on every `develop` push since 2026-07-22 are
  resolved — a nested ternary in `OrigamSliderField` and a duplicate
  `:deep()` selector in `OrigamColorPickerField`. Both were pure
  maintainability findings, no behaviour change. (#296)

---

## [2.9.0] — 2026-07-22

Theming-enablement release. This ships the design-token **hooks** and the
`useDefaults` **wiring** that let a consumer configure a component's
appearance entirely from an `IOrigamTheme` object (props-first), plus the
CSS hooks brand themes need for translucency and separation. No breaking
changes — every addition is opt-in via a new component token with an inert
(`none`) fallback, so existing renders are byte-identical until a theme
sets a value.

### Added

- **`useDefaults()` now resolves per-component theme defaults on 11 more
  components** that declared theme-configurable props but never read
  `theme.components['origam-<name>']` — their theme config was silently
  inert before this. This is the mechanism that makes props-first theming
  actually apply. (#242)
- **Translucency & focus hooks on 7 components.** New component tokens,
  each consumed with an inert fallback (`var(--…, none)`):
  `--origam-chip---backdrop-filter`, `--origam-snackbar-item---backdrop-filter`,
  `--origam-field---backdrop-filter` (+ `--origam-field---focus-ring-*`),
  `--origam-switch__track---backdrop-filter`,
  `--origam-selection-control__input---backdrop-filter`,
  `--origam-tooltip---backdrop-filter`, `--origam-overlay-scrim---backdrop-filter`.
  These give brand themes real `backdrop-filter` translucency (glass, frosted
  surfaces) without per-instance `:style` overrides. (#253)
- **`OrigamAvatarGroup` separation ring.** Overlapping avatars now get a
  legible seam via a dedicated `outline` — a CSS property distinct from
  `box-shadow`, so it coexists with each theme's own avatar shadow with no
  specificity or ordering tricks. Driven by new
  `--origam-avatar-group__item---outline-{color,width,style}` tokens
  (defaults `color.surface.default` / `2px` / `solid`). Only avatars rendered
  inside an `<origam-avatar-group>` get it; a standalone `<origam-avatar>`
  never does. (#263)
- **`usePassedProps()` composable helper.** Reports which props a consumer
  actually passed by reading `vnode.props`, distinguishing a real value from
  Vue 3 coercing an unpassed boolean prop to `false`. Used so a
  theme-provided value is no longer overwritten by an `undefined → false`
  default. (#263)

### Fixed

- **Live theme switching now updates component default *props*, not just CSS
  variables.** The Nuxt module's theme singleton could be duplicated when the
  host app resolved `origam/nuxt` (source) and `origam/composables` (compiled
  `dist`) to two physical module files — two independent `_theme` singletons,
  so the plugin's watcher (which reassigns the resolved per-component
  defaults) listened to a different instance than the one `setTheme()`
  mutated. Props stayed frozen on a live switch while cssVars followed (pure
  CSS cascade). The singleton is now anchored on `globalThis` on the client
  (server stays module-level to avoid leaking state across concurrent SSR
  requests). (#275)
- **`OrigamRadio`, `OrigamTabs` and `OrigamSliderField` now call
  `useDefaults()`.** They declared theme-configurable props (`activeBgColor`,
  `variant`, `color`/`bgColor`) but never resolved
  `theme.components['origam-<name>']`, so that theme config was silently inert.
  (#279)
- **`OrigamDialog` `scrim` now renders.** `scrim` was missing from the
  component's `withDefaults(...)`, so Vue 3 coerced the unpassed boolean to
  `false` and forwarded it to `OrigamOverlay`, overriding the overlay's own
  `scrim: true` default — the backdrop never showed. Anchored `scrim: true` in
  `withDefaults` (same pattern as the existing `openOnClick` default). (#279)
- **`useDefaults` wiring no longer collapses `<origam-code>`'s header zone.**
  The origam base theme carried a `compact: true` default (authored in a bulk
  pass before `useDefaults` was wired, never visually validated); once the
  wiring landed it forced every code block without an explicit `compact` prop
  into the condensed single-line pill layout, dropping the
  header/filename/line-numbers/lang-badge. Removed from the base theme. (#249)
- **`OrigamBtnGroup` renders as a single rounded surface.** The group applies
  its `rounded`/`elevation` on the outer wrapper with `overflow: hidden`
  clipping children to the inner curvature — no forced child heights, no
  inner-radius tokens; group height derives from `OrigamBtn`'s own border-box
  height calc. (#239)
- **`OrigamSwitchTrack.error` widened from `boolean` to `string | boolean`**
  to match the canonical Commons `IValidationProps`, so the parent's
  validation surface is type-assignable again (was `vue-tsc` TS2345, CI red).
  Consumed by truthiness only — behaviour unchanged. (#239)
- **`OrigamLayout` / `OrigamApp` `full-height` no longer clamps content
  taller than one screen.** The full-height wrapper was `height: 100vh`
  (a hard clamp) instead of `min-height: 100vh` ("occupy at least the
  viewport"). Content overflowing past one screen still rendered (nothing
  was clipped — no `overflow: hidden` on that element), but the wrapper's
  own box never grew to match, so any ancestor sizing itself off that box
  (e.g. a themed page background) stopped short of the actual page height.
  `full-height` pages now grow naturally past one screen and the
  background/box always matches the true content height.
- Fixed a handful of pre-existing `$type: "dimension"` component tokens
  with non-numeric values (`auto`, `calc(...)`) that crashed the
  `size/rem` Style Dictionary transform and silently blocked
  `tokens:build` / the full package build (`btn.width`, `dialog.max-width`,
  `dialog.max-height`, `contextual-menu.max-height`, `menu.max-height`,
  `expansion-panel.header.append.margin-inline-start`,
  `expansion-panel.popout.max-width(-active)`,
  `expansion-panel.inset.max-width-active`) — retyped to `"other"`,
  matching the established pattern already used for equivalent tokens
  elsewhere in the same files. No visual/behavioural change; this only
  unblocks the build pipeline.

> The 8 marketing brand themes (glass · cartoon · geek · apple · editorial ·
> material · ecom) that these hooks enable live in the private
> `@origam/marketing` package and are **not** part of the npm `origam`
> release — this changelog tracks the published library only.

---

## [2.8.1] — 2026-07-15

### Fixed

- **The npm tarball now ships `README.md` and `LICENSE`.** The publish runs
  from `packages/ds/` exclusively, but the package dir contained neither
  file — both listed in the `files` array yet silently absent from every
  published version (the npm page showed no readme at all). The new
  npm-facing README covers install, quick start (plugin + token sheets +
  Nuxt module), the theming model and the granular exports, and links to
  the upcoming documentation site (https://origam.dev).

---

## [2.8.0] — 2026-07-15

### Added

- **Border per-side props are now wired** (`useBorder`). The discrete
  `borderTop` / `borderRight` / `borderBottom` / `borderLeft` props on
  `IBorderProps` — declared but never read until now — each accept a
  number (px), a boolean (legacy thin opt-in) or a free-form
  `"width style color"` string (same grammar as the global `border`
  shorthand). New per-side color overrides ship alongside:
  `borderTopColor` / `borderRightColor` / `borderBottomColor` /
  `borderLeftColor` (`TColor` — semantic intent or raw CSS color).
  Precedence is specific-over-global (global `border`, then standalone
  `borderColor` / `borderStyle`, then per-side width/style, then per-side
  color) and documented on `useBorder`. Emitted declarations are physical
  (`border-top-width`, …). `useStateEffect` forwards the 8 new props, so
  Card, Sheet and every other consumer gets them for free. Pilot
  component: Card (story + doc + e2e).
- **`useElevation` accepts a free-form custom `box-shadow` value.**
  `elevation` (new `TElevation` type) still takes a named origam rung or
  a Material 0–24 number, and now also any shadow-like CSS string
  (`var()` / `calc()` / `rgba()` / hex / length / `inset` signals),
  emitted verbatim as `box-shadow`. Previously a custom string silently
  produced NO shadow (`parseInt` read a leading `0` and resolved to the
  `none` rung). Pilot component: Card (story + doc + e2e).

### Changed

- **`OrigamBlockquote`: `bgColor` renamed to `accentColor` (non-breaking).**
  `bgColor` never painted a surface fill on Blockquote — it drove the
  decorative accent (bar, background quote glyph, author label), which the
  `bgColor` name misrepresented. `accentColor` is now the canonical prop;
  `bgColor` keeps working as a deprecated alias (`accentColor` wins when
  both are set) and logs a console warning once per session. Scope: this
  pass only touches Blockquote — `bgColor` stays canonical and
  non-deprecated on surface-fill components (Btn, Card, Chip, Badge,
  Alert, Pagination, …). Removal of the `bgColor` alias on Blockquote is
  targeted for v3.0.0. See `ROADMAP.md` — "Renommer `bgColor` →
  `accentColor`".

### Fixed

- **`useMargin`: 2-value strings work again.** `margin="8px 16px"` silently
  produced no styles (the 2-value case was missing from
  `formatMarginStylesVar`; padding already had it). Both utils now document
  the intentional 4-value order convention: values are grouped by logical
  axis — `block-start`, `inline-start`, `block-end`, `inline-end`
  (top / left / bottom / right) — NOT the native CSS clockwise shorthand.
  RTL-safe by design, arbitrated in #216.

### Internal

- Marketing `/theming` — the Theme Builder ships six rich, validated
  controls built from origam components (color/accentColor with intents +
  custom picker, density, rounded with per-corner link/unlink, elevation
  presets + full custom box-shadow, border with per-side width AND color
  link/unlink, padding/margin devtools-style box-model with axis linking).
- Marketing playground isolation: the `origam` preview theme now carries a
  complete GENERATED reset of every component var (~2700/mode, derived from
  the DS baseline sheets) — ambient brand themes can no longer leak into
  the playground preview.
- Marketing package restructured to the project architecture (`src/`
  srcDir, locales under `src/assets/locales`, wireframes under
  `wireframes/`).

---

## [2.7.3] — 2026-07-10

### Fixed

- **`OrigamField`: the `rounded` prop now drives the whole field chrome.**
  The prop used to round the outer box only (inline `border-radius`), while
  the inner chrome (outline legs, per-corner radii) reads
  `--origam-field---border-radius` — which the prop never touched, so the
  outline corners stayed at the default and mismatched the box (themes had
  to force the var with `!important` hacks). The field now mirrors the
  radius resolved from the `rounded` prop into its component var, keeping
  box and outline in sync for every field type (text, select, textarea,
  number, password, date, file, color). `shaped` / `shaped-invert` are
  unaffected and stay SCSS-owned.

---

## [2.7.2] — 2026-07-09

### Fixed

- **Default text (and every `currentColor` icon) rendered browser-black in
  dark mode.** The semantic text token flips correctly
  (`neutral-900 → neutral-50`) and `app.json` has declared
  `app.color` / `app.background-color` all along — but nothing consumed
  them. `OrigamApp` now paints the base pair
  (`color: var(--origam-app---color)`,
  `background-color: var(--origam-app---background-color)`), and
  `OrigamThemeProvider` (`display: contents`) sets the inherited `color`
  so a local `data-mode="dark"` sub-tree gets readable defaults too.
  Verified in both modes (computed styles) with no light-mode change.

---

## [2.7.1] — 2026-07-09

### Fixed

- **`origam/styles` CSS entry shipped empty.** `src/assets/css/main.css` was
  0 bytes in every published version (2.6.x, 2.7.0), so
  `import 'origam/styles'` (the `style`/`import`/`require` conditions)
  delivered no tokens and no utility classes — only the SCSS path
  (`@use 'origam/styles'`) worked. `main.css` is now compiled from
  `main.scss` at build time (`styles:build`): the full aggregate
  (primitives + light + dark + utilities + reset, ~366 KB) ships in the
  package.

### Internal

- New brand identity: the "cube sonobe" logo (modular origami — identical
  folded units assembling into a structure) replaces the legacy mark across
  the repo (docs/stories/marketing assets; not part of the npm tarball).
- npm publishing is handled by CI again (release workflow auth fixed).

---

## [2.7.0] — 2026-07-08

### Added

- `OrigamThemeProvider` now applies the active theme's **component default
  props** to its sub-tree (props-first theming cascades into sub-trees via
  `provideDefaults`), not just the `data-theme` / `data-mode` attributes. A
  `<origam-theme-provider theme="brand-x">` wrapper therefore gives every
  descendant that brand's per-component defaults.
- Glass theme: `OrigamAlert` glassmorphism (transparency + blur).

### Changed

- **`shiki` is now an OPTIONAL peer dependency** (removed from `dependencies`).
  `OrigamCode` degrades gracefully to plain, un-highlighted code when `shiki`
  is not installed (a one-time console warning is emitted; line numbers,
  highlight-lines and copy keep working). **Migration:** add `shiki` (`^4.3.1`)
  to your app's dependencies to keep syntax highlighting. This drops a heavy
  (~3 MB) hard dependency from apps that don't render code blocks.

### Fixed

- `OrigamPagination` colored mode (`color` / `bgColor`) now fills the page
  buttons. The theme's default `text` btn variant
  (`background-color: transparent !important`) was swallowing the intent fill,
  leaving resting buttons transparent; the row now forces the `flat` variant
  when a colour is set.
- Cartoon dark `/theming`: fields adopt the theme and the primary btn contrast
  is corrected.

### Internal

- Restored the green `vue-tsc` type-check gate under TypeScript 6.
- E2E suite stabilised: sharded CI plus deterministic fixture-drift fixes
  (variant-index / navigation realignment) — the "flaky" bucket was
  deterministic drift, not timing.

---

## [2.6.3] — 2026-07-03

### Changed

- Internal code-quality cleanup to green the SonarQube quality gate
  (`new_violations`): removed redundant type assertions, merged duplicate
  imports, extracted nested template literals, `||` → `??`, dropped a redundant
  `| undefined`, converted a call-signature interface to a function type, and
  removed a leftover CSS comment. **No API or runtime behaviour change** — pure
  refactor (PR #87).
- Marketing site (private, not part of the published `origam` package):
  `@nuxtjs/i18n` 9 → 10 and `@nuxtjs/seo` 2 → 5 (locales moved to `i18n/locales/`;
  v10 config breaking changes handled) — PR #88.

---

## [2.6.2] — 2026-07-03

### Changed

- Dependency maintenance (Dependabot): TypeScript 5.8 → 6.0, ESLint 9 → 10
  (+ `typescript-eslint`, `eslint-plugin-vue`), Style Dictionary 4 → 5
  (+ `@tokens-studio/sd-transforms` 1 → 2), Shiki 3 → 4 (VitePress docs), and a
  dev-tooling batch (`jsdom` 25 → 29, `happy-dom`, `sass`, `@types/node`,
  `unplugin-vue-components`, `lint-staged`, `globals`…). **Vite and Vue stay
  pinned** (`vite ~7.3.6`, `vue 3.5.35`) — their bumps were declined (Vite ≥ 7.3.5
  broke the build; the Vue override neutralises the bump). `react-dom` bump
  closed (not a dependency of a Vue design system).

### Fixed

- CI publish (`release.yml`): the npm publish step failed with **E404** because
  `pnpm publish` did not expand the `${NODE_AUTH_TOKEN}` placeholder from
  setup-node's `.npmrc` → the PUT went out unauthenticated. The resolved token is
  now written to the `.npmrc` pnpm reads before publish (PR #82). 2.5.0/2.5.1/2.6.0
  had failed here; 2.6.1 was published manually as a stop-gap.
- Test robustness: `transition.composable.spec.ts` used an invalid CSS sentinel
  (`transformOrigin: 'original'`) that jsdom 29 now rejects; switched to a valid
  value `top left` (PR #84).

---

## [2.6.1] — 2026-07-02

### Added

- `OrigamCode` — `compact` and `prompt` display modes (commit `5ebc6702`).
  Compact mode collapses the component to a single line (no gutter, no
  filename bar); `prompt` mode renders a shell-style `$` prefix. Two-axis
  theming support: the component now tracks both `data-theme` and
  `data-mode` on the host `<html>` element so it correctly switches in
  dark/light sub-trees (`fix(ds): OrigamCode two-axis theming` — commit
  `e2e716f2`). Scroller fill repaired in the same pass.
- `backdrop-filter` glassmorphism tokens on `Card` / `Sheet` / `Toolbar` /
  `Menu` — new token group `component.{card,sheet,toolbar,menu}.backdrop-filter`
  emitted as `--origam-{cmp}---backdrop-filter` CSS vars. Allows consumers
  to build frosted-glass surfaces without overrides (commit `71647594`).

### Changed

- Brand themes removed from the DS (ADR-004) — the `origam` package now
  ships only the `light` and `dark` base token sets. Consumer themes
  (`sobre`, `geek`, `glass`, `cartoon`, `apple`, `ecom`, `editorial`,
  `material`) are now authored in semantic JSON and installed via
  `createOrigam({ themes: [...] })` rather than bundled into the lib.
  The DS stays unopinionated; themes travel with the consumer
  (commits `fbea1e3f`, `5f1bf51c`, `e0a47050`, `edc30e80`, `f7c56f06`,
  `3b9f8510`).

### Fixed

- `OrigamImg` — `markBooted` `requestAnimationFrame` callback was called
  during SSR, crashing server-render (`fix(ds): guard OrigamImg markBooted
  rAF behind IN_BROWSER` — commit `6b09c5df`).
- Six SSR/theming gaps surfaced by the marketing site refactor: theme cookie
  injection race, `data-mode` missing on first SSR render, component-level
  token var scope, active-theme guard in `useTheme`, Menu/Tooltip token
  resolution under sub-tree providers, Nuxt hydration mismatch on theme
  toggle (commit `b9fe3219`).
- `OrigamSelect` — the chevron icon opened then instantly re-closed the menu
  on the very first click (field not yet focused): the opening `mousedown`
  bubbled to the control handler and double-toggled. The toggle now only
  runs when the field is already focused; otherwise the event bubbles to the
  single control handler that opens + focuses in one pass (PR #70).
- Sass `mixed-decls` deprecation warnings eliminated in `OrigamBtn` and
  `OrigamSwitchTrack` — declarations that followed a nested rule (`@media` /
  `&:focus-visible`) are moved above it. Pure reorder, identical compiled CSS
  (PR #73).
- Layout offset counted twice in SSR / production builds (invisible in dev):
  Vue's hydration-mismatch recovery could abandon a layout item mid-`setup()`
  after it registered, leaving an orphan in `registered` so a 240 px drawer
  reserved 480 px. `useLayoutItem`'s `register()` now evicts stale entries
  occupying the same `(order, position)` slot (PR #76).

---

## [2.6.0] — 2026-06-11

> **The bracket + a11y + theming release.** `OrigamBracket` ships as a
> production-ready e-sport tournament component (double-elimination, Grand
> Final, statuses, full cross-cutting prop surface). `v-contrast` becomes
> the DS-wide WCAG text-legibility guard applied to every colour-bearing
> component. A two-axis theming engine (`data-theme` × `data-mode`) replaces
> the previous single-axis approach and enables brand themes to be installed
> at runtime via `createOrigam()`. Multiple composables and layout components
> also land fixes. 170 commits total in this range (DS-relevant subset
> documented below).

### Added

- `v-contrast` directive — runtime WCAG 2.1 AA text-legibility guard
  (`feat(ds): v-contrast directive` — commit `8a80787a`). Applied
  automatically to every colour-bearing component in the same cycle
  (`feat(ds/a11y): apply v-contrast to all colour-bearing components` —
  commit `4a4d4473`). Two correctness fixes landed before release: correct
  WCAG luminance maths for composite translucent backgrounds (commit
  `96ff45c4`), and `color(srgb …)` token format support + guard against
  clobbering an explicit `color` prop (commits `34786ed5`, `12a3e378`).
- `OrigamBracket` — **major enrichment** on top of the 2.3.0 initial
  component. Full double-elimination layout with two independent trees +
  a Grand Final match (`feat(ds/bracket): real two-tree double-elimination
  layout` — commit `dee1c23d`; Grand Final — commit `560eaf5b`).
  Full cross-cutting prop surface on both `OrigamBracketMatch`
  (`rounded` / `elevation` / `border` / `color` / `bgColor` — commit
  `8998f0e3`) and `OrigamBracketCompetitor` (commit `3088ad31`).
  Distinct status indicators (live, forfeit) + live-link prop (commit
  `4d38c65c`). Connector trait inherits match `border-width` / `style` /
  `color` (commit `94242ab3`). State variant (hover / active) wired
  (commits `0f4d5924`, `5edeca52`, `92edcd1b`). Auto-contrast on match
  text and seed numbers via `v-contrast` (commit `4cd5bc44`).
  `OrigamDivider` used internally for the match divider (commit `c472bb71`).
- `OrigamBlockquote` — **major enrichment** from the initial Wave 4 stub.
  Two-axis colour model: `color` (foreground / accent) and `bgColor`
  (surface / left-bar background) applied on all 5 variants
  (`feat(ds/blockquote): two-axis colour model` — commit `ccfe8c82`).
  `bgColor` accent on every variant including `elegant` and `minimal`
  (commit `b2f5c1f3`). `color` also drives the source label (commit
  `d80e88ca`). Accent pseudo-element decoupled from the `border` prop
  (commit `c5843ee1`, revert + re-land in same release).
- `OrigamBottomNav` — three additions: dimension props (`width`, `height`,
  etc.) now apply (fix — commit `21d44f63`); `position` prop
  (`start | center | end`) controls item distribution (commit `395a797e`);
  `active` state exposed and diffused to the child buttons (commit
  `5bdb3e85`).
- `OrigamAvatarGroup` — three additions: `rounded`, `elevation`, `border`
  propagated to all child avatars (commit `725303bd`); `hover` / `active`
  state fan-out made reactive (commit `e163cfba`); click-outside collapses
  an expanded group (commit `c364aae3`).
- `OrigamAppbar` — `scroll-behavior="active"` engages the active surface
  state on scroll (commit `07feb981`). `hide` and `inverted` scroll
  behaviours repaired; `scrollBehavior` now accepts combined tokens
  (commits `01912f4c`, `b625ea1e`). Removed dead props: `absolute`
  (commit `50c5ea32`), `floating` (commit `3d707ef5`), `width` /
  `minWidth` / `maxWidth` (commit `c5e7a6b9` — layout owns the
  cross-axis).
- Two-axis theming engine — `data-theme` (brand identity) × `data-mode`
  (light/dark) replace the previous single `data-theme` approach. Shadow
  tokens gain per-theme variants (commit `f7c56f06`). `createOrigam()`
  gains a `theme` option to install one or multiple presets at init time,
  SSR no-flash (commits `edc30e80`, `5f1bf51c`, `3b9f8510`). Token
  authoring via semantic JSON (colors, radius, typography, shadow, spacing,
  animation groups) — `feat(ds): semantic JSON theme authoring` (commit
  `e0a47050`).
- Field validation surface extended to 5 additional field components
  (`InlineEdit`, `OtpInputField`, `Clipboard`, `NumberField`,
  `SliderField`) via unified `useValidation` wiring (commit `27977831`).
- `OrigamStatus` — forces its intent onto `color` / `bgColor` (non-
  overridable) so status badges are always correctly painted regardless of
  surrounding theme (commit `8a72740a`).

### Changed

- `OrigamAudio` — dimension props (`width`, `height`) now apply (commit
  `adaf4395`); content fills the available height with controls pushed
  to the bottom (commit `97207e26`); progress row grows when the bar is
  taller (commit `8f8f1c1f`); `rounded="none"` and shaped variants added
  (commit `073d0513`). Compact disc rendering fixed — oversized with
  floating grooves (commit `bef36e20`). Reactive `autoplay` (commit
  `0dc90fea`). Play-button focus tint lingering + playlist active item
  blinking fixed (commit `6e6042bb`).
- `OrigamToolbar` — `hover` / `active` now drive the surface colour
  (state-aware) (commit `c966e9c6`).
- `OrigamAlert` — removed redundant `prominent` prop (commit `f32af0a8`).
- `OrigamAvatar` — `color` prop now applies; `v-contrast` was previously
  overriding an explicit `color` (commit `369e0afa`). Dead `start` / `end`
  props removed (commit `84f324fe`).
- `OrigamApp` — now exposes only `color` / `bgColor` and forwards them to
  the layout (commit `111f6596`).
- DS-wide: `useStateEffect` repaired — runtime prop changes for
  `color` / `bgColor` and similar were silently ignored after initial
  mount (commit `a1a66120`). Reactive-update loops in `AvatarGroup` and
  `RadioGroup` killed (commit `4c5eb18d`).
- Monorepo migration — `packages/ds`, `packages/marketing`,
  `packages/stories`, `packages/docs`, `packages/tests`,
  `packages/figma-plugin` are now first-class pnpm workspace packages
  (commits `4d53558b`, `70f1819f`, `fa0ed997`).

### Fixed

- `OrigamBtn` — `border-color` and `border-style` are now customisable
  props (commit `b44add69`).
- `OrigamField` — themed `border-radius` now resolves via the real
  component token (commit `851b2a2f`).
- `OrigamExpansionPanels` — `useElevation` import missing, causing
  `ReferenceError` at mount (commit `2eef9288`).
- `OrigamDatePicker` — crash guard for empty `daysInMonth` when reading
  `date` prop (commit `896b9eec`).
- `OrigamBorder` — numeric `border-width` values were invisible (missing
  `border-style` and `border-color` defaults) (commit `e9a151ec`).
- `rounded="none"` — did not actually remove the border radius; affected
  `OrigamAudio` and other consumers (commit `073d0513`).
- `fix(ds): /* @vite-ignore */ on shiki dynamic import` — defensive guard
  to silence the Vite bundler warning on the `OrigamCode` lazy highlighter
  import (commit `f6bbc494`).
- DS/marketing integration — MDI class prefix resolution, search hotkey
  double-fire, Menu anchor positioning (commit `d113a245`); lib dist
  missing CSS in first production deploy (commit `62667fbc`).

---

## [2.5.1] — 2026-05-27

> **Patch.** Two housekeeping commits with no public API impact.

### Changed

- Repository structure cleaned up: unit specs moved to `tests/TU/`,
  the dev playground dropped (commit `52f7dc70`).
- `.gitignore` updated to exclude `tests/a11y/.report` and
  `tests/a11y/.results` artefacts (commit `6c2ef153`).

---

## [2.5.0] — 2026-05-24

> **The accessibility release.** WCAG 2.1 AA pass across the entire
> component catalogue, critical backlog items (Select combobox pattern,
> DataTable caption, ColorPicker keyboard), and a VitePress sidebar
> reorganised by UI taxonomy.

### Fixed

- WCAG 2.1 AA pass — 35 targeted fixes across 36 components covering:
  missing `aria-label` on icon-only buttons, incorrect `role` assignments,
  focus management gaps, colour-contrast warnings on default token values,
  and keyboard-navigation holes in Slider / Rating / Switch / Radio
  (commit `1ad0aeaf`).
- Critical a11y backlog:
  - `OrigamSelect` — full combobox ARIA pattern (`role="combobox"` +
    `aria-expanded` + `aria-activedescendant` + `aria-autocomplete`).
  - `OrigamDataTable` — `<caption>` element added so screen readers
    announce the table purpose.
  - `OrigamColorPicker` — keyboard navigation restored; tab order and
    focus ring corrected.
  - A11y test infrastructure wired (commit `b3dd8552`).
- VitePress docs — SSR crash in the build resolved; chart legend guard
  against undefined series data (commit `6cfb0029`).

### Changed

- VitePress component sidebar reorganised by UI taxonomy (layout /
  navigation / data-display / forms / feedback / utility) instead of
  flat alphabetical order (commit `0bd5e2f2`).

---

## [2.4.0] — 2026-05-23

> **The chart engine + media kit + Wave 4 release.** In-house chart
> engine (27 primitives, 19 families, pure SVG, zero external dep),
> atomic media kit (`OrigamAudio` with waveform / vinyl / stem-tracks /
> playlist, `OrigamVideo` YouTube-style player, `OrigamMediaScrubber`
> and `OrigamMediaController` primitives), native `SliderField`, six
> utility / content components (`OrigamGrid`, `OrigamMasonry`,
> `OrigamEmptyState`, `OrigamClipboard`, `OrigamInlineEdit`,
> `OrigamNumberFormat`), `OrigamWatermark`, `OrigamQRCode`,
> `OrigamCalendar`, `OrigamTextMask`, gradient support on color props,
> and a DS-wide reuse-interfaces audit. 149 commits.

### Added

#### Chart engine

- `OrigamChart` + `useChart` — in-house chart component. 8 base types
  (`line` / `area` / `bar` / `column` / `pie` / `donut` / `scatter` /
  `radar`). Pure SVG rendering (no canvas, no `d3`, no `chart.js`, no
  `echarts`). Tooltip inline-positioned via mouse move; legend as
  `<ul role="list">` with click-to-toggle series visibility. Animated
  entrance with `prefers-reduced-motion` respect. Custom slots for
  `tooltip` / `legend-item` / `title` / `empty`. ARIA `role="img"` with
  `<title>` + `<desc>`; every data point is `tabindex="0"` +
  `role="button"` with a descriptive `aria-label`. Pure-function SVG
  path utilities — SSR-safe. `tokens/component/chart.json` (title,
  subtitle, axis, grid, tooltip, legend, point, bar, pie, radar,
  animation groups). (commit `b46541ce`)
- Family split into 9 per-type components (`OrigamChartCartesian`,
  `OrigamChartPolar`, `OrigamChartRadar`, `OrigamChartGauge`, …) sharing
  the engine via `OrigamChartAxis` and `OrigamChartLegend` sub-components
  (commits `4da143c9`, `c950c364`, `ef4ab360`).
- 15 additional chart families extending the base engine:
  - **Honeycomb / Treemap / Sankey / Word-cloud** (commit `94902edc`)
  - **Heatmap / Sunburst / Box-plot / Pictorial** (commit `c1e69d60`)
  - **Candlestick / Streamgraph** (commit `c5edc9b0`)
  - **Pyramid / Funnel** family with outside labels + leader lines on
    narrow bands (commits `445acb05`, `f4af7a27`, `293905bc`)
  - **Polar-bar / Variwide** (commit `26380205`)
  - **Pareto / Bullet** (commit `39f141a3`)
  - **Combination chart** (line + column / area + line) (commit
    `4406e92d` area, `10d012ad` bar-axis swap)
  - **Map / Choropleth / Flight-routes / Plot bands** (commit `c728bd94`,
    `6e72e7f4`)
  - **Stacked percent / Multi-axis Y** (commit `6e72e7f4`)
  - **Drilldown** (commit `8f827e7d`)
  - **Sparkline / Zoom-pan / RangeSelector** (commit `23d97e29`)
  - **Annotations** (arrows, label callouts, circle highlights, brackets)
    (commit `e1e41b89`)
- Chart composables wired to full DS cross-cutting prop surface
  (`IDimensionProps` via `useDimension`, `margin`, `padding`, `rounded`,
  `elevation`, `bgColor`) (commits `7179cd6c`, `e16742e0`).
- Scatter chart: `z` dimension drives bubble radius (commit `2eb6c868`).
- Pie / donut: multi-series concentric rings; per-slice legend toggle
  (commit `ba51275b`).
- DS intent colours and custom CSS colours resolve to the correct token
  namespace in charts (commit `8166cd1e`).
- 7 canonical transverse emit interfaces (`IChartEmits`, etc.) added
  (commit `e1c7b890`).
- DS-wide typed `defineEmits` migration — 7 batches covering 54+
  components (commits `01381e41`, `a03627a8`, `ce40e686`, `2ce1ccd2`,
  `3347bc58`, `279fb2f0`, `e91c9518`).

#### Media kit

- `OrigamAudio` + `useAudioPlayer` + `useWaveform` — in-house audio
  player. Custom UI (play/pause, scrubber, volume, waveform via
  `OfflineAudioContext`). Media Session API for lock-screen controls +
  metadata. Cover image. 3 controls modes. Vinyl disc animation. Stem-
  tracks (multi-channel mute/solo). Playlist with tri-state loop and
  random shuffle. Zero external dep. ARIA: dynamic `aria-label`,
  `role="slider"` on scrubber, `role="img"` on waveform. SSR-safe.
  `tokens/component/sound.json` (commits `293efc06`, `d3781288`,
  `9c12e283`, `f3d3c797`). Waveform + album ported from `OrigamSound`
  (commit `d5a0246b`). `useWaveform` moved to Audio namespace (commit
  `d4822f26`). `<OrigamSound>` namespace retired — superseded by
  `<OrigamAudio>` (commit `a77911bc`).
- `OrigamVideo` + `useVideoPlayer` — in-house video player. YouTube-style
  restructure: custom UI (play/pause, scrubber, volume, fullscreen, PIP,
  captions), 3 controls modes, WebVTT captions with language switcher,
  `aspect-ratio` preset, download prop + quality switcher in cog menu,
  YouTube-style skip ripple (half-disk + chevrons stagger). Zero external
  dep. ARIA: `role="slider"` on scrubber, `role="status"` / `role="alert"`
  on state overlays. SSR-safe. `tokens/component/video.json` (commits
  `8a37102e`, `97420a99`, `31dcfdae`, `f50ccbdb`, `dcccb4dd`, `0208b2f3`,
  `9bbbea96`, `75b0779f`, `80e2a9c0`).
- `OrigamMediaScrubber` — reusable horizontal + vertical media scrubber
  primitive (thin track, buffer indicator, hover thumb + tooltip). Used
  by both `OrigamAudio` and `OrigamVideo` for their respective scrubber
  and volume controls (commits `9f87c917`, `9e050390`, `15d53094`).
- `OrigamMediaController` — shared media-control shell extracted from
  `useVideoPlayer` (commit `2cbb9618`). `useMediaPlayer` base composable
  split out (commit `c2a9f282`).

#### New utility / content components

- `OrigamGrid` + `OrigamGridItem` — declarative CSS Grid wrapper. Props
  for `columns` / `rows` / `areas` / `gap` (token or raw CSS) /
  `autoFlow` / `align*` / `justify*` and item-level `column` / `row` /
  `area` / `*Self` shorthands. Object syntax (`{ start, end }`) or raw
  CSS strings (`'1 / 5'`, `'span 2'`) for span control. Token group
  `--origam-grid---gap-{xs,sm,md,lg,xl}` (commit `0ebb1cd4`).
- `OrigamMasonry` + `useMasonry` — Pinterest-style masonry layout.
  CSS-first via `grid-template-rows: masonry` (detected via `useCssSupport`
  — new `masonry` flag). JS bucket-fill fallback with `ResizeObserver`.
  Responsive columns via container-query breakpoints. `animated` prop.
  `tokens/component/masonry.json` (`animation-duration`,
  `animation-easing`) (commit `2691c4e5`).
- `OrigamEmptyState` — placeholder for absent data. 5 presets
  (`no-data` / `no-results` / `error` / `offline` / `locked`) with auto
  icon + intent mapping. Three sizes, two alignments. ARIA `role="status"`
  + `aria-live="polite"`. `tokens/component/empty-state.json` (commit
  `abaca302`).
- `OrigamClipboard` + `useClipboard` — copy-to-clipboard helper.
  `navigator.clipboard.writeText` + `execCommand` fallback. Scoped
  `#default` slot exposes `{ copy, copied, error }`. Auto-resetting
  feedback state. ARIA `aria-live="polite"`. SSR-safe.
  `tokens/component/clipboard.json` (commit `d93c2957`).
- `OrigamInlineEdit` + `useInlineEdit` — edit-in-place pattern. Click
  display → input prefilled → Enter confirms / Escape cancels. Async
  `validate` callback. Multiline textarea mode. Custom slots
  `#display` / `#edit` / `#actions`. ARIA `aria-invalid` +
  `aria-describedby`. `tokens/component/inline-edit.json` (commit
  `d4a95557`).
- `OrigamNumberFormat` + `useNumberFormat` — i18n number formatting via
  `Intl.NumberFormat`. 7 formats, full locale support with auto-resolution
  chain, LRU-cached `Intl` instances. Scoped `#default` slot exposes
  `{ formatted, parts, value }`. ARIA `aria-label` expansion for compact
  notation (commit `dd8bfe3c`).
- `OrigamWatermark` + `useWatermark` — diagonal repeating overlay. SVG
  data-URL (no canvas). Text or image mode. Anti-tamper MutationObserver.
  `pointer-events: none`. `tokens/component/watermark.json`. SSR-safe
  (commit `cc715c38`).
- `OrigamQRCode` + `useQRCode` — SVG QR code rendering via
  `qrcode-generator` (~5 kB). 4 ECC levels. Optional logo overlay.
  Rounded modules. LRU cache. ARIA `role="img"`. Renamed from
  `OrigamQRCode` → `OrigamQrCode` (Vue style guide — commits `9f5a4eea`,
  `eabb92a3`, `1ee2acf6`, `da34f20d`, multiple QrCode fixes).
- `OrigamCalendar` + `useCalendar` — full calendar. 4 views
  (month / week / day / agenda), navigation, events with
  start / end / color / category, range select with drag-to-create,
  RRULE recurring events (`DAILY | WEEKLY | MONTHLY` + `INTERVAL` /
  `COUNT` / `UNTIL` / `BYDAY`). Toolbar with view switcher. Locale-aware
  via `Intl.DateTimeFormat`. Zero external dep. ARIA
  `application / gridcell / toolbar` + keyboard navigation. SSR-safe
  (commit `8b5d7f0a`).
- `OrigamTextMask` + gradient color props — text reveals an animated
  background via `background-clip: text`. 4 animation types
  (`pan` / `rotate` / `pulse` / `zoom`) with `prefers-reduced-motion`.
  Zero JS (pure CSS keyframes). SSR-safe (commit `31f67d37`).
- Gradient support for `color` / `bgColor` / `textColor` props. Three
  input formats: raw CSS gradient string, `IGradient` structured object
  (`{ from, to, via?, direction?, type? }` or `{ stops: [...] }`), or
  preset name (`color="gradient-sunset"`). 5 built-in semantic presets
  (`sunset`, `ocean`, `forest`, `fire`, `midnight`) with light + dark
  variants. 100 % backward-compatible (commit `c922fbff`).
- `SliderField` — native HTML `<input type="range">` implementation
  (commit `d3781288`).

### Changed

- DS-wide reuse-interfaces audit — 9 batches (commits `d0afd731`,
  `2c6e3aab`, `325c4df1`, `5f1abaf8`, and earlier in the cycle).
  Every component that declared `height` / `width` / `margin` / etc.
  inline now `extends IDimensionProps` / `IMarginProps` / etc. and
  consumes the matching composable. Eliminates half-implemented
  surfaces and drift from the standard `convertToUnit` helper.
- All ~28 inline composable constants extracted to `src/consts/`
  (commits `7cd6ff81`, `de48f7da`).
- Story Playground variants universally renamed to `Default` across all
  177 stories (commits `cfeaa682`, `ace53342`, `f2e89284`).

### Fixed

- `OrigamChart` — area fill previously overridden by the SCSS
  `fill: none` cascade (commit `ed1c4610`); scatter points overflowing
  the plot zone (commit `ba51275b`); horizontal bar — category/value
  axis swapped (commit `f8ec65db`); legend click filtered wrong series
  index (commit `d25eae00`); `legendPosition` not moving the legend
  (commit `082d053b`); column/bar slots overlapping value axis on first
  index (commit `4406e92d`); stepped-line tail cut off (commit
  `ee45357a`); pie/donut legend showing wrong labels (commit `4406e92d`).
- `OrigamVideo` — double-click skip on desktop (`f50ccbdb`); controls bar
  clicks restored after overlay removal (`4fd5f375`); skip ripple sizing
  cascade (`80e2a9c0`, `9bbbea96`, `75b0779f`); cross-origin download
  via blob (`73c2e2a4`, `d84fa9bc`).
- `OrigamCalendar` — Calendar loading shape + active toolbar button
  contrast (`55e58b3d`).
- `OrigamQrCode` — intent-to-paint mapping, SVG host sizing, title
  centring (commits `c1823057`, `dceb4cfe`).
- Link composable — `ComputedRef` for `tag` and `href` unwrapped in
  templates; previously caused a `[object Object]` render (commit
  `9822c47b`, reverted and re-landed as `3f79d0c0`).
- `withDefaults()` inline literal rule enforced — `Grid`, `Masonry`,
  `Blockquote` were referencing `XXX_DEFAULTS` objects statically
  unresolvable by the SFC compiler, causing `undefined` prop crashes
  (commit `276fff1e`).
- `OrigamSnackbar` — `roundedClasses` `ReferenceError` at mount (commit
  `aa86f93c`).

---

## [2.3.0] — 2026-05-15

> **The features release.** Four new components, four major
> enrichments, an official Nuxt module, and a comprehensive SSR
> safety audit. All additions are backward-compatible — drop-in
> upgrade from 2.2.x. 378 unit tests (+158 vs 2.2.1), 0 lint errors.

### Added

- `origam/nuxt` sub-export — official Nuxt 3 / Nuxt 4 module. Auto-imports
  components and composables. SSR-safe theme resolution via cookie +
  `Sec-CH-Prefers-Color-Scheme` header (no FOUC, no hydration mismatch).
  Auto-injects token CSS files (primitive + selected themes + utilities).
  Configurable via `origam: {}` in `nuxt.config.ts`. Resolves through
  `modules: ['origam/nuxt']`. New `IOrigamNuxtModuleOptions` and
  `IOrigamNuxtRuntimeConfig` interfaces; new theme constants
  (`ORIGAM_THEME_AUTO`, `ORIGAM_THEME_LIGHT`, `ORIGAM_THEME_DARK`,
  `ORIGAM_THEME_ATTR`, `ORIGAM_THEME_STORAGE_KEY`). Reference
  documentation at `docs/integrations/nuxt.md`.

### Changed

- `OrigamTextField` — new `mask` prop with built-in patterns
  (`phone:fr`, `phone:us`, `phone:international`, `iban`, `siret`,
  `creditcard`, `date:iso`, `date:fr`, `date:us`, `time`, `time:12h`,
  `postcode:fr`, `postcode:us`) plus a custom pattern syntax
  (`#` = digit, `A` = letter, `*` = any, anything else is a literal).
  In-house mask engine — zero external dependency (no `imask.js` /
  `cleave.js` / `vue-the-mask`). Reactive validation pipeline with
  built-in `luhn` (credit card), `iban` (mod-97) and date parsers
  (`date:iso` / `date:fr` / `date:us`); custom validators accepted as
  `(unmasked) => boolean`. New emits `@valid(boolean)` and
  `@complete({ complete, unmasked })` fire on every value change. The
  v-model exposes the **unmasked** value while the DOM input displays
  the formatted (masked) one — paste handling strips literals and
  reformats, `aria-invalid` toggles on touched fields, and the engine
  auto-promotes phone-shaped patterns to `type="tel"` for mobile
  keyboard hints. New `useMask` composable, `applyMask` / `unmaskValue`
  / `resolveMaskConfig` / `validatePattern` utils, new `IMaskOptions`
  interface and `TMask` / `TBuiltInPattern` / `TPatternValidator`
  types.
- `OrigamTextareaField` — new `mode="rich"` enabling a lightweight
  HTML / Markdown editor based on `contenteditable`. Built in-house
  with zero external dependencies (no TipTap, ProseMirror, Quill).
  9 toolbar commands (`bold`, `italic`, `underline`, `link`,
  `list-bullet`, `list-ordered`, `heading`, `code-inline`,
  `clear-format`), customisable via the new `toolbar` prop (or
  `toolbar: false` to hide). Keyboard shortcuts (Cmd/Ctrl+B/I/U/K/E
  and Cmd/Ctrl+Shift+7/8 for the two list modes). New `output` prop
  switches the v-model serialisation between `'html'` (sanitised) and
  `'markdown'` (CommonMark-flavoured subset). New `toolbarPosition`
  prop (`'top' | 'bottom' | 'floating'`). New `format` emit fired on
  every toolbar click or keyboard shortcut with the command id (and
  the URL for link insertion). New slots `#toolbar` and
  `#toolbar-item` allow replacing the default UI entirely. Internal
  sub-component `OrigamRichToolbar.vue` + composable
  `useTextareaRich` own the contenteditable contract. In-house HTML
  sanitiser with allowlist on tags (`p`, `br`, `strong`, `b`, `em`,
  `i`, `u`, `a`, `ul`, `ol`, `li`, `h1`, `h2`, `h3`, `code`),
  attributes (`href` restricted to `http:` / `https:` / `mailto:` /
  `tel:` plus relative URLs; `class` restricted to the
  `origam-rich--*` prefix), and stripping every `on*` event handler
  before per-tag filtering. External links are auto-hardened with
  `rel="noopener noreferrer nofollow" target="_blank"`. ARIA:
  `role="toolbar" + aria-label` on the toolbar, real `<button>` per
  command with `aria-label` + `aria-pressed`, the editing surface
  carries `role="textbox" + aria-multiline="true"`. New tokens under
  `component/textarea-field/rich-*` (toolbar surface, button states,
  content padding, inline-code colors, link color, heading sizes).
  The plain-mode (`mode="plain"`, default) API is fully
  backward-compatible — passing nothing keeps the previous
  `<textarea>` behaviour.

- `OrigamCode` — major enrichment via shiki integration. Syntax
  highlighting for 13 languages (vue, ts, js, tsx, jsx, scss, css, json,
  bash, html, xml, yaml, md) plus `plaintext`. New props: `lineNumbers`,
  `highlightLines` (accepts both `number[]` and the range syntax
  `'2,5-7'`), `copyable`, `maxHeight`, `theme` (`'auto' | 'light' | 'dark'`),
  `wrap`, `filename`. Copy button with `navigator.clipboard` and an
  `execCommand('copy')` fallback for legacy WebViews. Lazy-init shiki
  highlighter cached as a module-level singleton across instances; an
  LRU (max 64 entries) caches highlighted HTML by `(code, lang, theme)`
  so re-renders never re-tokenise. Theme defaults to `auto` and tracks
  the host `<html data-theme>` attribute. New `useCode` composable
  exposing `{ highlight, prime, isReady, resetCacheForTesting }`. New
  utility `parseHighlightLines()` shared with stories/tests. Pure-CSS
  line-numbers gutter (CSS counter, no JS layout) and line-highlight
  swap (class toggle on already-rendered rows, no re-tokenisation).
  ARIA: `role="region"` on the surface, `aria-live="polite"` on the
  copy feedback, hidden line numbers. `shiki` (`^3.8.1`) promoted from
  `devDependencies` to `dependencies` (it's a runtime dep now); the
  bundle adds ~3 MB to installed `node_modules` for the curated subset.
  New tokens under `component/code` (35 vars: surface, header, filename,
  copy button, line-number gutter, line-highlight, scrollbar). The v2.x
  plain-text `<pre>` API is fully backward-compatible — passing just
  `code` and `lang` keeps the previous behaviour.

- `OrigamParallax` — major enrichment. Multi-layer support via new
  `OrigamParallaxLayer` subcomponent (`speed`, `offsetX`, `offsetY`,
  `zIndex` props; layers register themselves into the host runtime and
  receive direct DOM mutations of `transform` outside Vue reactivity).
  Host gains `direction` (`'vertical' | 'horizontal' | 'both'`),
  `easing` (`'linear' | 'ease-out' | 'spring'`, in addition to the
  legacy raw CSS timing-function string), `disabled`, `speed`,
  `threshold` props. New emits: `@enter`, `@leave`,
  `@scroll-progress(0→1)` driven by `IntersectionObserver` +
  `requestAnimationFrame`. `prefers-reduced-motion: reduce` is honoured
  natively — layers stay at `translate3d(offsetX, offsetY, 0)` and the
  rAF loop short-circuits. CSS-first scroll-driven animations
  (`animation-timeline: view()`) when `view-timeline` is supported
  (Chrome 115+, Edge 115+) AND `easing === 'linear'`; JS fallback
  otherwise. Spring easing implemented as a damped lerp in the JS path.
  Existing single-layer / `<OrigamParallaxElement>` API preserved (the
  two layer kinds use independent injection contexts and can coexist
  inside the same host). New tokens: `parallax.transition-duration-spring`,
  `parallax.transition-easing-default` / `-spring`,
  `parallax.layer.will-change` / `.transform-origin`.

### Added

- `OrigamCommandPalette` — ⌘K command launcher. Built on a teleported
  dialog with focus trap + focus restoration. Custom subsequence-based
  fuzzy-match algorithm (no external dep) ranks results by
  consecutive-run + label-prefix + first-position bonuses. Composable
  `useCommand` exposes a process-wide command registry — entries
  registered inside a Vue effect scope auto-unregister on dispose.
  Reuses `OrigamKbd` for inline shortcut display. Hotkey listener
  built on `useHotkey` (default `⌘+K` on macOS, `Ctrl+K` on
  Windows / Linux, configurable per combination or disabled with
  `:hotkey="null"`). ARIA combobox pattern (`role="combobox"` on the
  input, `role="listbox"` on the result list, `role="option"` per
  item, `aria-activedescendant` tracking the keyboard cursor) +
  `role="dialog"` + `aria-modal="true"` on the surface. Tokens exposed
  under `tokens/component/command-palette.json`
  (`--origam-command-palette---*`,
  `--origam-command-palette__input---*`,
  `--origam-command-palette__item---*`,
  `--origam-command-palette__group-title---*`,
  `--origam-command-palette__empty---*`,
  `--origam-command-palette__footer---*`,
  `--origam-command-palette--backdrop---*`).

- `OrigamBracket` — e-sport tournament tree. Supports single-elimination,
  double-elimination and round-robin variants. SVG connectors
  auto-computed from `nextMatchId` (with positional fallback). Slots for
  custom match / competitor / round-title / connector rendering. ARIA
  `role="region"` with per-round `role="group"` + `aria-labelledby`
  pointing at title headings. Tokens exposed under
  `tokens/component/bracket.json` (`--origam-bracket---*`,
  `--origam-bracket-match---*`, `--origam-bracket-competitor---*`,
  `--origam-bracket-connector---*`, `--origam-bracket-round-robin---*`).

- `OrigamSnackbarStack` — multi-toast notification system. Reuses
  `OrigamSnackbar` styling vocabulary for rendering. Composable
  `useSnackbarStack({ id })` exposes `notify` / `dismiss` /
  `dismissAll`. 8 anchor locations, max stack size with FIFO eviction,
  per-item auto-dismiss (or `0` for sticky), action buttons with
  optional `keepOpen`, ARIA `role="region"` on the stack root +
  `role="status"` / `"alert"` per intent on each item with matching
  `aria-live`. Slide-in / slide-out transitions degrade to a fade under
  `prefers-reduced-motion`. Tokens exposed under
  `tokens/component/snackbar-stack.json`
  (`--origam-snackbar-stack---*`, `--origam-snackbar-stack__item---*`).

- `OrigamTabs` / `OrigamTab` / `OrigamTabPanels` / `OrigamTabPanel` —
  full tab system with horizontal / vertical orientation, three visual
  variants (`default` / `pills` / `underline`), ARIA `role="tablist"` +
  `role="tab"` + `role="tabpanel"` wiring, full keyboard navigation
  (`←`/`→`/`↑`/`↓`/`Home`/`End`/`Enter`/`Space`), lazy or eager panel
  mounting, optional touch-swipeable panels. Reuses the shared
  `useGroup` orchestration so the selection state, mandatory behaviour
  and disabled-tab semantics align with the rest of the system
  (`OrigamBtnToggle`, `OrigamCarousel`, `OrigamBottomNav`). Tokens
  exposed under `tokens/component/tabs.json` (item color, indicator
  color, panel padding, transition duration).

- `OrigamClientOnly` — SSR helper component that renders its default
  slot only after `onMounted`. Optional `#fallback` slot (or
  `placeholder-tag` / `placeholder-class` props) reserves layout space
  during SSR to avoid CLS. Use to wrap fragments whose markup truly must
  differ between server and client (audio, deviceorientation,
  IntersectionObserver-driven features, …) without triggering hydration
  mismatches.

- `useCssSupportClient(feature, { defaultValue })` — hydration-safe
  feature-gate helper. Returns a `Ref<boolean>` that starts at
  `defaultValue` (default `false`) on both SSR and first client render,
  then flips to the real `CSS.supports()` result inside `onMounted`.
  Use to gate **markup** branches (template `v-if`) when the regular
  `useCssSupport().css.value.X` would produce a hydration mismatch
  (class-only branches keep using the existing API — Vue 3 reconciles
  class diffs fine).

### Fixed

- SSR safety — comprehensive audit of all composables and components
  that previously could crash on server render (`window is not defined`,
  `document is not defined`). `useCssSupport` already returned all-false
  flags during SSR; the rest of the surface (`useTheme`, `useCommand`,
  `useSnackbarStack`, `useCode`, `useMask`, `useTouch`, `useHotkey`,
  `useSticky`, `useSheetSwipe`, `useScroll`, `useParallax`, `useStyleTag`,
  `useTeleport`, `useLocationStrategies`, `useScrollStrategies`,
  `useDisplay`) was confirmed safe via the audit and patched where a
  composable's public method or a `computed` could be evaluated during
  SSR. Specifically: `useAspectRatio` no longer dereferences
  `window.innerWidth/Height` when no explicit `aspectRatio` prop is
  given; `useVirtual`'s `viewportHeight` computed guards
  `document.documentElement`; `useSnackbarStack.dismiss()` guards
  `window.clearTimeout`. Overlay components (Dialog, Drawer, Menu,
  Tooltip, Snackbar, ContextualMenu, SnackbarStack, CommandPalette)
  confirmed SSR-safe via `<Teleport>` (Vue defers the mount until the
  client). New guide `docs/guide/ssr.md`. New `src/__tests__/ssr-smoke.spec.ts`
  exercises every refactored composable in a simulated SSR environment
  (window/document/CSS stripped) **and** through `@vue/server-renderer`'s
  real `renderToString()`.

---

## [2.2.1] — 2026-05-14

### Fixed

- Expose `./package.json` explicitly in the `exports` map. The catch-all
  `"./*": "./dist/src/*"` previously intercepted `import 'origam/package.json'`
  and re-routed it to a non-existent file inside `dist/`. Standard
  consumer pattern (reading the version from the package metadata) was
  broken — fixed by adding `"./package.json": "./package.json"` ahead
  of the catch-all so it matches first.
- 2.2.0 was tagged but never published to npm. 2.2.1 is the first
  version that lands on the registry.

---

## [2.2.0] — 2026-05-14

> **The "ready for npm" release.** Package metadata, peer dependencies,
> tree-shaking signals and a real README are all in. Tarball preview
> shrunk from 5.6 MB to **867.9 kB** (2 343 files, zero suspect entry).
> No public API change vs 2.1.0 — every consumer upgrade is a
> drop-in.

### Added — stories, slots, emits coverage

- 525+ missing `Slot` / `Emit` Variants across 113 component stories
  (`feat(stories)`). Every documented slot now has a dedicated Variant
  with a custom-content example, and every emit a Variant that logs
  to a live counter.
- `OrigamSwitchTrack` extracted as a standalone primitive (track-only)
  so consumers can build switch-like compounds without rewriting the
  thumb logic.
- Tooling: `useStateEffect` now reacts to every per-axis composable
  (`useHover` / `useActive` / `useFocus`) in a single call — collapses
  the 14 components that historically wired them axis by axis.

### Fixed

- `useStyle` now instrumented across the 124 components that
  previously inlined `*Styles` arrays — single source of truth for the
  inline-style escape hatch.
- Carousel — `progress` prop renders a real-time progress bar wired to
  the cycle timer (was rendering a static "step / total" bar).
- Carousel — `hideDelimiterBackground` finally has a background to
  hide (default `__controls` bg = `rgba(0, 0, 0, 0.4)`).
- Histoire sandbox/panel sash now resizes the iframe in **both
  directions** (was capped at the 720 px responsive-preset width when
  dragging right).
- `useRounded` — utility variants (`xs|sm|md|lg|xl|none|full`) now
  emit BOTH the `.origam--rounded-*` class AND an inline
  `border-radius` declaration as a specificity escape hatch (Strategy
  A documented in `CLAUDE.md`).
- 130 unused-vars cleared from `src/`, 39 ESLint warnings fixed.

### Changed — package for npm

- `peerDependencies` introduced: `vue ^3.5`, `vue-i18n ^11`,
  `vue-router ^4.5` (last two `optional` via `peerDependenciesMeta`).
  They are no longer auto-installed as `dependencies` — consumers
  bring their own versions.
- `sideEffects: ["**/*.css", "**/*.scss", "**/*.vue"]` for downstream
  tree-shaking.
- `engines.node: ">=22"` (matches `.nvmrc`).
- `prepublishOnly` script chains `tokens:build` → `server:build` →
  unit tests. Every `npm publish` rebuilds from scratch with green
  tests.
- `files` whitelist tightened to `dist/src/`, `dist/tokens/`, LICENSE,
  README, CHANGELOG. The Histoire bundle (`dist/stories/`, ~13 MB) is
  no longer shipped to consumers.
- `build.config.ts` `externals` extended to `['vue', 'vue-i18n',
  'vue-router', '@mdi/font']` so peer deps don't get re-bundled.
- mkdist exclusion patterns expanded: `.spec.ts`, `__tests__/**`,
  `.cy.ts`, `.story.vue` are stripped from `dist/`.
- ESLint config ignores `docs/.vitepress/cache/**` and
  `figma-plugin/**` (these aren't part of the published library).

### Documentation

- Full `README.md` written from scratch (253 lines) — install,
  peer deps, plugin registration, theming (`data-theme` +
  `useTheme()` + `<OrigamThemeProvider>`), token tiers, component
  families, composable table, CSS-first principle.

### Internal

- ESLint rule `no-restricted-imports` blocks `@origam` /
  `@stories` / `@docs` / `@cypress` aliases inside `src/` — once
  published, those aliases can't be resolved by consumers.
- 124 components instrumented with `useStyle` following the
  canonical pattern.
- `.tsbuildinfo` and other transient artefacts removed from the tree.

---

## [2.1.0] — 2026-05-07

> **The classes-first release.** The 13 transversal composables
> (`useColor`, `useBackgroundColor`, `useTextColor`, `useColorEffect`,
> `useElevation`, `useRounded`, `useBorder`, `useMargin`, `usePadding`,
> `useSize`) now emit utility classes (e.g. `.origam--bg-primary`,
> `.origam--shadow-md`) when the consumer passes a tokenised value. The
> existing `*Styles` outputs stay populated only when the value is
> non-tokenisable (legacy hex, custom dimensions) — the inline style
> stack on a typical button drops from ~12 to ~6 declarations.
>
> **Non-breaking.** Every composable keeps its previous return shape;
> the new `*Classes` keys are additive. Components have been migrated
> to read both shapes in parallel (transition strategy A).

### Migrating from v2.0 to v2.1

Nothing is required. The release is additive; existing consumers keep
working unchanged. To start using the new path:

```vue
<!-- v2.0 — still works, still emits inline style -->
<OrigamBtn color="primary">Click</OrigamBtn>

<!-- v2.1 — same code, but the emitted DOM now also carries the
     `.origam--bg-primary` utility class instead of inline
     `background-color: var(...)`. Inspecting the DOM is much cleaner. -->
```

If you write your own components on top of `useColor*` / `useElevation`
/ `useRounded` / etc., you can now destructure the new `*Classes`
return:

```ts
const { colorClasses, colorStyles } = useColorEffect(props, isHover, isActive, isDisabled)
// colorClasses: ['origam--bg-primary']  when intent
// colorStyles : []                       when intent
// colorClasses: []                       when '#7c3aed'
// colorStyles : ['background-color: ...']when '#7c3aed'
```

Bind both — `:class="[..., colorClasses]"` AND `:style="[..., colorStyles]"`.
The hover/active/disabled state still flows through `colorStyles` (utility
classes are static, by design).

### Added

- **66 utility classes** generated by Style Dictionary, exposed at
  `origam/tokens/css/utilities` and forwarded by `origam/styles`:
  - `.origam--color-{primary|secondary|success|warning|danger|info|neutral}`
  - `.origam--bg-{primary|secondary|success|warning|danger|info|neutral}`
  - `.origam--shadow-{none|xs|sm|md|lg|xl}`
  - `.origam--rounded-{none|xs|sm|md|lg|xl|full}`
  - `.origam--border-{none|thin|thick}`
  - `.origam--p-{0..12}`, `.origam--m-{0..12}`, `.origam--gap-{0..12}`
  - `.origam--text-{xs|sm|md|lg|xl|2xl}`
- New return keys on transversal composables:
  `colorClasses`, `backgroundColorClasses`, `textColorClasses`,
  `elevationClasses` (extended), `roundedClasses` (extended),
  `borderClasses` (extended), `marginClasses`, `paddingClasses`,
  `sizeClasses`.
- `tests/e2e/utilities.spec.ts` — 66 Playwright tests, one per
  utility class, asserting both class presence and `getComputedStyle`
  resolution against the CSS var pipeline.
- `tests/e2e/prop-audit-phase4.spec.ts` — DOM audit on representative
  components confirming the inline-style pile reduction.
- 79 new Vitest unit specs in `src/composables/Commons/__tests__/`
  covering the classes-first branch of every refactored composable.

### Changed

- ~54 components migrated to consume `*Classes` in parallel with
  `*Styles`. Notable surface-bearing children: Menu/Tooltip/Picker/
  Snackbar/Badge — utility class lands on the `__content` / `__pill` /
  `__wrapper` BEM child, never on the teleport root.
- `OrigamSelectionControl.__wrapper` now carries
  `useTextColor(color)`'s class + style on its root element. This
  re-instates the Switch thumb tinting (`currentColor`) for tokenised
  intents, which had silently broken when `OrigamSwitchTrack` was
  extracted earlier in the cycle.
- `OrigamSwitch` SCSS — the legacy `[style*="color:"]` selector is
  joined by a class-driven set
  (`.origam-selection-control__wrapper.origam--color-{intent} &__thumb`)
  so both the new tokenised path and the legacy hex path tint the thumb
  via `currentColor`.

### Deprecated

- `*Styles` returns on the 10 refactored composables — prefer the
  matching `*Classes` for tokenised values. Both are kept for one
  major cycle; removal scheduled for v3.0.0.

### Fixed

- `OrigamSwitch` thumb stayed white when `color="primary"` (or any
  tokenised intent) — regression from the `OrigamSwitchTrack`
  extraction. Re-introduced via classes-first.
- `OrigamSnackbar` `__wrapper` no longer duplicates the
  `roundedClasses`/`borderClasses` already applied at the root.

### Known limits — planned for v2.2 (Phase 1.5)

- No utility for margin / padding axes (`mx`, `my`, `mt`, `mb`, `ml`,
  `mr`, `px`, `py`, `pt`, `pb`, `pl`, `pr`). Components passing
  axis-specific values fall back to inline styles for now.
- No `2xl` / `3xl` shadow utilities (the rungs exist as primitives but
  are off the manifest).
- Legacy `ROUNDED` enum (`x-small | small | default | medium | large
  | x-large | shaped | shaped-invert`) does not bridge to the
  `none|xs|sm|md|lg|xl|full` utility taxonomy — components passing a
  legacy value get their existing component-scoped BEM modifier and an
  inline style fallback.
- `useColorEffect` does NOT emit a `*Classes` value when `isHover` /
  `isActive` / `isDisabled` is true (states are inline-only by design).
  Components that bind `useActive(props, 'modelValue')` (Alert, Badge,
  BottomNav) therefore never carry a utility class while visible — the
  inline style still paints them correctly. This is intentional; do not
  rely on the utility class for state-dependent styling.

---

## [2.0.0] — 2026-04-26

> **The design tokens release.** Every component now resolves its colors,
> spacing, typography, and motion through a centralised, theme-aware
> token pipeline (Style Dictionary v4 + Tokens Studio for Figma). 50+
> components migrated; 18 of them also picked up real bug fixes from the
> companion `optimus-design-system` codebase. Multi-theme (light / dark)
> works out of the box; `brand-X` themes are an additive layer.

### Migrating from v0.x to v2.0.0

This is a major bump because three things change:

1. **The CSS variables that components read are now generated.** The old
   `<style>:root{}` blocks that each component shipped have been removed.
   Consumers MUST load the generated token CSS — either:

   ```ts
   import 'origam/styles' // primitive + light + dark + helpers
   ```
   or pick the layers separately:
   ```ts
   import 'origam/tokens/css/primitive'
   import 'origam/tokens/css/light'
   import 'origam/tokens/css/dark' // applied via [data-theme="dark"]
   ```

   If you were overriding origam vars at the document root (e.g.
   `:root { --origam-btn---background-color: red }`), that still works —
   the generated CSS is just a default. But if you depended on the
   per-component `:root{}` block being injected when the component
   mounted, that's gone. The vars are now set once globally.

2. **`useColorEffect` is intent-aware.** The `color` / `bgColor` props on
   `<OrigamBtn>`, `<OrigamChip>`, `<OrigamAvatar>`, etc. now expect a
   semantic intent (`'primary'`, `'success'`, `'danger'`, …) rather than
   a raw hex. Raw hex still works but emits a one-shot `console.warn`
   per `(prop, value)` pair (full removal in v3.0.0).

   ```vue
   <!-- v0.x -->
   <OrigamBtn color="#7c3aed">Click</OrigamBtn>

   <!-- v2.0 -->
   <OrigamBtn color="primary">Click</OrigamBtn>

   <!-- One-off custom color -->
   <OrigamBtn :style="{ '--origam-btn---background-color': '#7c3aed' }">…</OrigamBtn>
   ```

3. **`useElevation` no longer computes shadows in JS.** The `bgColor`
   parameter is accepted for signature compat but ignored. The composable
   now emits `box-shadow: var(--origam-shadow-{rung})` and the rung is
   themed at the token level (different shadow recipes for light vs dark).

   The legacy `formatElevationStyle(level, bgColor)` utility is still
   exported but `@deprecated` — it will be removed in v3.0.0.

### Added

- **Multi-tier design tokens** (`tokens/`):
  - Primitive: 12 color ramps, 12 spacing steps, full font / radius /
    shadow / motion / zIndex / opacity / border ladders.
  - Semantic: `surface`, `text`, `border`, `action.{primary,secondary,
    ghost}`, `feedback.{success,warning,danger,info}`, `overlay`. Per
    theme (light + dark), with hooks for brand-X.
  - Component: ~60 files, one per component, in DTCG / Tokens Studio
    format — editable from the Figma plugin.
- **Pipeline**: Style Dictionary v4 + sd-transforms. Outputs CSS,
  SCSS partials, and TypeScript union types. `npm run tokens:build`,
  `tokens:watch`, `tokens:lint`.
- **GitHub Action** (`.github/workflows/tokens-sync.yml`): consumes
  Figma → Tokens Studio → `tokens-sync` branch, rebuilds artifacts,
  opens a PR to `develop` automatically.
- **Multi-theme runtime**:
  - `useTheme()` composable — singleton ref, persistence, prefers-
    color-scheme fallback, toggle helper.
  - `<OrigamThemeProvider theme="dark">` for sub-tree overrides.
- **CSS-first / JS-fallback principle**:
  - `useCssSupport()` composable — feature detection layer wrapping
    `CSS.supports()` with caching for 20 modern features (subgrid,
    container queries, `:has()`, aspect-ratio, color-mix, anchor
    positioning, view transitions, …). Components now branch via
    this composable instead of calling `CSS.supports()` directly.
- **Defaults system** (ported from optimus):
  - `useDefaults()` composable + `<OrigamDefaultsProvider>` for
    cascading default props (mirrors Vuetify's `<v-defaults-provider>`).
  - `IDefault`, `IDefaultProviderProps`, `IDefaultProviderSlots`.
- **`<OrigamConfirmWrapper>`** — type-it-twice form helper with
  auto-injected validation, two render modes (slot-based / `field=`
  shortcut), and bidirectional defaults forwarding.
- **`SCSS helpers`** (`src/assets/scss/_helpers.scss`): `ds-intent`,
  `ds-elevation`, `ds-text-style`, `ds-space`, `ds-focus-ring`,
  `ds-visually-hidden`.
- **VARIANT / VARIANT_INPUT enums** + `TVariant` / `TVariantInput`
  types.
- Common emit / slot interfaces: `IFieldEmits`, `IFieldSlots`,
  `IFieldDefaultSlotProps`, `IInputEmits`, `IInputSlots`,
  `IAdjacentEmits`, `IAdjacentSlots`, `IAdjacentInnerEmits`,
  `IAdjacentInnerSlots`, `IActiveEmits`, `IFocusEmits`,
  `ICommonsComponentEmits`, `ICommonsComponentSlots`.

### Changed

- **Every component** with chrome (~50) now consumes design tokens
  rather than hardcoded values. The per-component `<style>:root{}`
  blocks are gone.
- **`OrigamPasswordField`** rebuilt from the optimus version (629
  vs 399 lines). New features: strength-requirements popup
  (`requirements` + `need*` flags + `minLength`), auto-injected
  validation rules, show/hide toggle, intersect-driven autofocus,
  click:control / mousedown:control emits.
- **`OrigamFileField`** split into 3 files (FileField + DragNDropItem
  + ListItem) for clearer responsibility boundaries; drag-and-drop
  mode reworked, `maxFileSize` validation added, typed emits.
- **`OrigamForm`** grew form-level validation, `scrollToError`,
  global `messages` rendering through OrigamMessages.
- **`OrigamField`** now exposes the `outline__notch` BEM child for
  the floating-label rendering, slot-based prefix/suffix detection,
  and proper focus↔active synchronisation.
- **Snackbar z-index** normalised from `10000` to `1060` via
  `{zIndex.toast}`. Consumers stacking custom overlays on top must
  verify their stacking context.
- **`color.action.primary.bgSubtle / fgSubtle`** added to the
  semantic layer (was missing — Select selected-item background and
  Slider thumb focus ring needed it).

### Fixed

- **OrigamMessages**: `:id` was bound to the entire messages array
  instead of the current message. Fixed by using a kebab-cased
  per-message key.
- **OrigamNumberField**: `watchEffect` → `watch(props.modelValue)` —
  the eager mode was causing reactive write loops while the user
  typed. Increment / decrement handlers split.
- **OrigamOtpInputField**: undefined-current crash guard;
  `isValidNumber` → `isInvalidValue` (semantic was inverted);
  double `update:focused` emit prevented; handleClear added.
- **OrigamFileField**: `@clik:append` and `@lick:append-inner` typo
  fixes; drag&drop append mode no longer overwrites existing files;
  locale arg shape `t(key, [arg])` corrected.
- **OrigamMenu**: stray `console.log()` removed.
- **OrigamOverlayScrim**: `<style scoped>` block was missing
  entirely — scrim wasn't rendering.
- **OrigamProgressCircular**: `backgroundColorClasses` /
  `loaderColorClasses` were missing on the SVG `<circle>` elements.
- **OrigamProgressLinear**: `useBackgroundColor` → `useTextColor`
  (the bar's color was being applied as background, washing it out).
- **OrigamListSubheader**: vuetify-specific
  `rgba(var(--v-theme-on-surface), …)` references replaced with
  origam-native tokens. Style block converted from `lang="css"` to
  `lang="scss"`.
- **OrigamExpansionPanel**: vuetify shadow var leak
  (`var(--v-shadow-key-umbra-opacity, …)`) removed; selector
  `:not(.v-expansion-panel-title--static)` matched a vuetify class
  that never renders in origam — corrected to the origam class.
- **OrigamSlideGroup**: `<style scoped>` block was missing entirely.
- **OrigamCheckbox / OrigamCheckboxBtn / OrigamSelectionControl**:
  `handleClickLabel` argument typed `MouseEvent` (was `Event` —
  caused TS strict failures).
- **OrigamSelectionControlGroup**: `item` slot now exposes
  `{ item, index }` (was `{ item }` only).

### Deprecated

- `formatElevationStyle(level, bgColor)` — replaced by the
  `--origam-shadow-{rung}` token ladder. Kept exported for one
  major version; full removal in v3.0.0.
- Raw hex / rgb passed to `useColorEffect` color props — pass a
  `TIntent` value or use `:style` for one-off custom colors. Removal
  in v3.0.0.

### Outstanding (deferred to v2.x or v3.0.0)

- Several form components still carry hardcoded hex inside their
  scoped styles (Switch 11, Select 8, DatePickerField 5,
  ColorPickerField 2, Img 2, Highlight 3). The token JSONs are in
  place; the `var(--origam-…)` references need to be wired in a
  follow-up. Fallback-only behaviour ensures consumers see the
  intended design today.
- Outstanding token-naming gaps: `color.surface.chrome` (SystemBar),
  `color.overlay.backdrop` (Drawer / Overlay scrim), `color.surface
  .inverse` (Tooltip), `opacity.20` / `opacity.30`, `radius.xs2: 6px`,
  `font.size.6xl: 45px`, `font.letterSpacing.widish`. Promote at
  next ui-designer review.
- `OrigamMain` uses `--origam-main--{prop}` (double-tiret) instead
  of the canonical `---` convention. Cosmetic, breaks consumer
  overrides. To be aligned at v3.

---

## Pre-2.0 history

The `[WIP]` commits before this release were the foundation work
(audit, Figma integration spike, package layout). The design-token
migration started at commit `2124ab8` (Lot 0) and shipped over
ten incremental commits visible in `git log --oneline main..HEAD`.

