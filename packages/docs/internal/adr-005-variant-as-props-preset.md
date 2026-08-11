# ADR-005 — `variant` = preconfiguration of props, not a CSS layer

- **Status**: Accepted in part (2026-08-11) — Q1, Q4 and Q5 arbitrated; Q2 and Q3 still open

- **Deciders**: user (arnaudprioul), architect
- **Scope**: `packages/ds` (component API + `useVariant` + `useDefaults` +
  theme model), with downstream impact on `packages/stories`,
  `packages/docs`, `packages/tests`, `packages/marketing`
- **Target release**: **v3.0.0** — breaking change, explicitly accepted by the
  maintainer. No backward-compatibility shim is required.
- **Related**: ADR-001 (two-axis theming), ADR-004 (theme authoring model),
  `ROADMAP.md` § *Composants : `variant` = preconfig de props* (this ADR is the
  specification that section asked for), `CLAUDE.md` § *Classes-first
  conventions*

---

## Context

### The request

> « L'idée des variants que je voudrais, c'est que ce soit des
> **préconfigurations de props**, et l'ajout d'une classe à la limite. L'idée
> c'est qu'**on n'injecte pas de CSS avec le variant** ; la classe ne servira
> qu'au développeur voulant override certaines choses. »

Today a `variant` is the opposite: a class whose *only* effect is a block of
SCSS shipped by the DS. It carries no prop semantics at all.

### The symptom that motivated the audit

In the marketing Theme Builder, a component rendered `outlined` ignores any
background-colour change. The mechanism is fully explained by the code:

- `packages/marketing/src/components/theming/ThemeBuilderPreview.vue:144` binds
  the whole control panel with `v-bind="previewProps"`. Both `variant` and
  `bgColor` therefore arrive as **explicit vnode props** — the props-resolution
  chain is not at fault.
- `packages/ds/src/components/Btn/OrigamBtn.vue:714-715` declares
  `&--variant-outlined { background-color: transparent !important; }`.
- `useColor` / `useBackgroundColor`
  (`packages/ds/src/composables/Commons/color.composable.ts`) emit either a
  utility **class** (tokenised value) or an **inline style** (custom value).
  Neither is `!important`.

Per the CSS cascade, an `!important` author declaration outranks a *normal*
inline-style declaration. So the variant rule wins unconditionally, and no
prop, class or inline style the consumer can reach will ever beat it.

This is not a one-off. **The variant block of `OrigamBtn.vue` (lines 672-800)
contains 4 `!important` declarations on `background-color` — verified by
grep on the whole file, which holds 20 in total, the remainder on positioning.** And the DS itself already works around them:

> `packages/ds/src/components/Pagination/OrigamPagination.vue:388-392`
> ```
> // In colored mode force `flat` so the btn actually PAINTS the
> // pagination-driven `--origam-btn---background-color`. The theme's
> // default `text` variant sets `background-color: transparent
> // !important`, which would otherwise swallow the colored fill.
> variant: baseBg ? VARIANT.FLAT : undefined,
> ```

A DS component conditionally *not* setting a variant, to escape its own
variant CSS, is the clearest available evidence that the current model
inverts the intended layering.

### Measured state of the art

Figures below were established by reading the source on branch
`docs/ds-8-pages-manquantes`; every claim is traceable to a file path.

**Prop surface — 18 interfaces expose `variant`.** The maintainer's count is
confirmed. Breakdown:

| How | Count | Files |
|---|---|---|
| Declared directly (`variant?: …`) | 8 | `Audio/audio-player`, `Blockquote/blockquote`, `Bracket/bracket`, `Chart/chart`, `Kbd/kbd`, `Skeleton/skeleton`, `SliderField/slider-field`, `Tabs/tabs` |
| `extends IVariantProps` | 6 | `Btn/btn`, `Btn/btn-group`, `ConfirmWrapper/confirm-wrapper`, `Field/field`, `NumberField/number-field`, `OtpInputField/otp-input-field` |
| Transitively, via `extends IFieldProps` | 4 | `TextField/text-field`, `TextareaField/textarea-field`, `Select/select`, `FileField/file-field` |

(all under `packages/ds/src/interfaces/`; `Commons/variant.interface.ts` is the
mixin itself and is not counted.)

**Component surface — 14 `.vue` files read or emit a variant**:
`OrigamAudio`, `OrigamBlockquote`, `OrigamBracket`, `OrigamBtn`,
`OrigamBtnGroup`, `OrigamConfirmWrapper`, `OrigamField`, `OrigamKbd`,
`OrigamPagination`, `OrigamRatingFieldItem`, `OrigamSkeleton`,
`OrigamSliderField`, `OrigamTab`, `OrigamTabs`.

**The mechanism is not centralised — only 3 of those 14 call `useVariant()`**
(`OrigamBtn`, `OrigamBtnGroup`, `OrigamField`). The other eleven hand-roll the
class: `OrigamBlockquote.vue:224` interpolates
`` `origam-blockquote--variant-${props.variant}` ``,
`OrigamKbd.vue:88` uses an object binding, `OrigamSkeleton.vue:133,142` uses a
*different* convention entirely (`origam-skeleton--{variant}`, **single**
tiret, no `variant` segment). Any refactor that only touches `useVariant` would
miss 79 % of the surface.

**`useVariant` itself does one thing** — push
`` `${name}--variant-${variant}` `` into a class array
(`packages/ds/src/composables/Commons/variant.composable.ts`). It has no
knowledge of props, tokens or themes.

**`OrigamBtn` carries 8 variant selectors** — the maintainer's figure is
confirmed with one nuance: **7** `&--variant-*` blocks (lines 673, 677, 682,
686, 714, 742, 753), plus the legacy `&--flat,` alias on line 672 sharing the
`flat` block. `OrigamBtnGroup` adds 6 more blocks covering the same 7 values.

**Ten unrelated vocabularies, 38 values, and they collide.** There is no shared
variant vocabulary:

| Vocabulary | Values | Source |
|---|---|---|
| `VARIANT` (Btn, BtnGroup) | `text` `flat` `elevated` `tonal` `outlined` `plain` `ghost` | `enums/Commons/variant.enum.ts` |
| `VARIANT_INPUT` (Field + 6 descendants) | `underlined` `filled` `solo` `outlined` `plain` | idem |
| `BLOCKQUOTE_VARIANT` | `default` `elegant` `quoted` `minimal` `pull` | `enums/Blockquote/` |
| `TKbdVariant` | `filled` `outlined` `tonal` | `types/Kbd/kbd.type.ts` |
| `TAB_VARIANT` | `default` `pills` `underline` | `enums/Tabs/` |
| `TSkeletonVariant` | `text` `rectangular` `circular` `card` `list-item` | `types/Skeleton/` |
| `BRACKET_VARIANT` | `single-elimination` `double-elimination` `round-robin` | `enums/Bracket/` |
| `SLIDER_FIELD_VARIANT` | `field` `timer` `audio` | `enums/SliderField/` |
| `AUDIO_VARIANT` | `expanded` `compact` (+2 deprecated aliases) | `enums/Audio/` |
| Chart series | `fill` `stroke` | `interfaces/Chart/chart.interface.ts:249` |

`outlined` exists in three vocabularies with three unrelated implementations.
`text` means "unfilled button" in `VARIANT` and "a skeleton shaped like a line
of text" in `TSkeletonVariant`. This matters for the target model: **a single
global preset table is impossible**; the table must be per component.

### Why the current model is structurally wrong

1. **It is opaque.** A variant's effect is discoverable only by reading SCSS.
   Nothing in the props panel, the story controls or the doc table says
   "`outlined` forces the background transparent".
2. **It is not overridable.** `!important` + class specificity make it a
   terminal decision, not a default.
3. **It is not themeable through props.** `CLAUDE.md` and the user's standing
   instruction require **PROPS FIRST, CSS as last resort**. A theme can only
   retune a variant by overriding the `--origam-btn---background-color-tonal`
   family of CSS variables — i.e. the exact last-resort path the policy says to
   avoid.
4. **It duplicates the prop surface.** `elevated` sets a `box-shadow` that the
   `elevation` prop already owns; `tonal` sets a `background-color` that
   `bgColor` already owns; `outlined` sets a border that `border` /
   `borderColor` / `borderStyle` already own.

---

## Decision

### D1 — A variant is a named `Partial<IProps>`, stored per component in `consts/`

Each component that has a *stylistic* variant (see D5) gains:

```
packages/ds/src/consts/{Component}/{component}-variant.const.ts
  → export const {COMPONENT}_VARIANT_PRESETS
```

typed by a new shared type
`packages/ds/src/types/Commons/variant-preset.type.ts`:

```ts
export type TVariantPresets<V extends string, P> = Record<V, Partial<P>>
```

Illustrative shape for `OrigamBtn` (values to be finalised during
implementation against the current rendering — see the migration gate in D7):

```ts
export const BTN_VARIANT_PRESETS: TVariantPresets<TVariant, IBtnProps> = {
    flat:     { elevation: 0 },
    text:     { bgColor: 'transparent', elevation: 0 },
    elevated: { elevation: 'md' },
    tonal:    { bgColor: 'surface-overlay', elevation: 0 },
    outlined: { bgColor: 'transparent', border: true, borderStyle: 'solid',
                borderColor: 'currentColor', elevation: 0 },
    plain:    { bgColor: 'transparent', elevation: 0,
                opacity: 70, hover: { opacity: 100 } },   // needs D6/Q1
    ghost:    { /* see D6 — not fully expressible */ }
}
```

**This is the whole definition of a variant.** No SCSS accompanies it.

**Why `consts/` and not the token pipeline.** A preset is a map of *prop
values* (`elevation: 'md'`, `border: true`), not of CSS values. Style
Dictionary's contract (ADR-004, `packages/ds/scripts/build-tokens.mjs`) is
DTCG-in → CSS/SCSS/TS-token-types-out; asking it to emit a Vue props
descriptor would stretch it past its purpose and put a build step between the
author and a value that is pure TypeScript. Tokens remain the *target* props
resolve to, not their source.

**Why not in the theme by default.** The DS must ship a working definition of
`outlined` with no theme installed — `sobre` is the only theme the DS owns
(ADR-004 D1). The theme *overrides* the table (D4); it does not constitute it.

### D2 — Resolution: **tier-bound expansion**

The mechanism already exists. `useDefaults`
(`packages/ds/src/composables/Commons/defaults.composable.ts`) resolves every
prop through a documented chain:

```
1. value explicitly passed by the parent template   (highest)
2. component defaults from the closest provider     ('origam-btn': {…})
3. global defaults from the closest provider        (global: {…})
4. the component's own withDefaults() value         (lowest)
```

A theme's `components` block feeds tiers 2-3 (`IOrigamTheme.components:
IDefault`, `interfaces/Theme/origam-theme.interface.ts:121`).

**Decision: a variant's preset is inserted immediately *below* the tier that
declared the variant.**

```
1.   explicit prop from the parent template
1.5    ↳ preset, if `variant` was itself passed explicitly
2.   component defaults from the provider / theme
2.5    ↳ preset, if `variant` came from the provider
3.   global provider defaults
3.5    ↳ preset, if `variant` came from global defaults
4.   withDefaults()
4.5    ↳ preset, if `variant` came from withDefaults()
```

Stated as one rule: **a preset never outranks a declaration made at the same
tier as, or above, the tier that declared the variant.**

This answers the question directly:

| Case | Result |
|---|---|
| `<origam-btn variant="outlined" bg-color="primary">` | **`bgColor="primary"` wins and paints.** Both are tier 1; the preset sits at 1.5. |
| Theme sets `{ variant: 'outlined', bgColor: 'primary' }` | `bgColor: primary` wins — same tier (2), preset at 2.5. The theme author's explicit intent is honoured. |
| `<origam-btn variant="outlined">` under a theme setting `bgColor: 'primary'` | The preset's transparent wins (1.5 beats 2). A locally chosen `outlined` overrides an app-wide fill. *(Flagged for arbitration — see Q2.)* |
| `<origam-btn bg-color="primary">`, theme sets `variant: 'outlined'` | `bgColor` wins (tier 1 beats 2.5). |

**Implementation constraint, founded in code and non-negotiable.** The
"was this prop declared at this tier?" test **must** be the existing
`usePassedProps()` primitive (vnode.props inspection), never `=== undefined`.
The reason is documented in `defaults.composable.ts` (issue #263): Vue resolves
an *unset* prop whose declared type includes `boolean` to the concrete value
`false`, never `undefined`. `IBorderProps.border` is
`boolean | number | string | TDirectionBoth | …` and `IRoundedProps.rounded` is
`boolean | number | string | TRounded | …` — precisely the props an `outlined`
preset needs to set. A naive undefined-check would see `border: false` as
"explicitly passed" and the preset would be unreachable for exactly the props
that matter most.

The preset tier therefore ships as an extension of `useDefaults`, not as a
parallel mechanism.

### D3 — The class survives; the DS ships no rule for it

`useVariant` keeps emitting `` `${name}--variant-{value}` ``, and is
**generalised to all 14 components** so the convention stops being hand-rolled
in eleven files (including `OrigamSkeleton`'s divergent single-tiret form).

The DS ships **zero** SCSS rule matching `--variant-*`. The class becomes a
pure consumer hook, exactly as requested.

Two guards make this enforceable rather than aspirational:

- **CI check**: `grep -rE '\-\-variant-' packages/ds/src --include='*.vue'
  --include='*.scss'` must return no *selector* (comments excepted). Wired into
  the lint job.
- **`!important` ban** in DS component styles. It is the actual mechanical
  cause of the reported symptom, and it must not survive the migration in a
  different rule.

### D4 — A theme redefines a variant in **props**

`IOrigamTheme` gains a fourth authoring surface, sibling to `vars`, `cssVars`
and `components`:

```ts
variants?: Record<string, Record<string, Record<string, unknown>>>
//         component name    variant value    partial props

// e.g. — the cartoon theme makes every outlined button a 3px hard border:
variants: {
    'origam-btn': { outlined: { border: 3, borderStyle: 'solid', rounded: 'lg' } }
}
```

Merged over the DS table at `createOrigam()` time with the same `mergeDeep`
already used by `provideDefaults`.

This is what makes the ADR compliant with the standing PROPS-FIRST rule: a
theme retunes what `outlined` *means* by changing prop values, and descends to
`vars` / `cssVars` only for what props genuinely cannot express (D6).

`variants` is a sibling of `components`, not a nested key, because
`components` is typed `IDefault` (component → prop map); nesting a variant
level inside it would make `{ 'origam-btn': { outlined: … } }` ambiguous with a
prop literally named `outlined`.

### D5 — Taxonomy: three families, and only one converts

Reading the 14 components shows `variant` is currently overloaded across three
categorically different jobs. **Only family A is a props preset.** Pretending
otherwise would be the main way this chantier could fail.

**A — Stylistic.** The variant changes only how the surface is painted. Full
preset conversion.
`OrigamBtn` (7 values), `OrigamBtnGroup` (7), `OrigamKbd` (3),
`OrigamBlockquote` (5, with a caveat — see D6).

**B — Structural / discriminant.** The variant selects a template branch or an
algorithm. It is not a style and has no props to preset.

- `OrigamSkeleton.vue:7,25` — `v-else-if="variant === 'list-item'"` /
  `'card'` render entirely different DOM trees. The five values also conflate
  two axes: a *shape* (`text` / `rectangular` / `circular`) and a
  *composition* (`card` / `list-item`).
- `OrigamBracket.vue:10,66,331,502,693,699` — the value drives the layout
  algorithm, the round-derivation and the SVG connector maths. `round-robin`
  is a different component wearing the same name.
- `OrigamTab.vue:162` — `hasIndicator = variant === 'underline'` mounts an
  element.
- `OrigamSliderField` — `field` wraps in `<origam-input>`, `timer` / `audio`
  do not; `audio` paints a waveform from `peaks`.
- `OrigamAudio` — `expanded` / `compact` render different chrome.
- Chart series `fill` / `stroke` — a rendering-path discriminant, not a
  component variant at all.

**These keep a discriminant prop and are exempt from the preset rule**, but the
exemption must be *documented on the prop*, not implicit. See Q4 for the naming
question.

**C — Internal layout.** `OrigamField` (5 values, `OrigamField.vue:993-1060+`).
The variant restyles BEM children (`__outlines`, `__outline`, `__label`),
toggles `display: none` on sub-elements, and drives the floating-label
geometry. Partially convertible: the asymmetric radius of `filled`
(`8px 8px 0 0`) **is** expressible — `IRoundedProps.rounded` accepts a CSS
shorthand string and per-corner props. Hiding `__outlines` is not. Field is
therefore the *hardest* case and must not be the pilot.

### D6 — What genuinely cannot be expressed in props today

Audited against the 56 interfaces in `packages/ds/src/interfaces/Commons/`.
Honest list:

| Variant effect | Current implementation | Prop coverage | Proposal |
|---|---|---|---|
| `opacity: .7` + `:hover{opacity:1}` | `OrigamBtn.vue:742-751` (`plain`) | **None.** No `IOpacityProps` among the 56 Commons interfaces — grep finds `opacity` only as a component-local prop on `Chart/chart-plot-band` and `Watermark`, and it is absent from `IStateEffectConfig`. | Add `IOpacityProps` to Commons (`opacity?: number \| string`) + `useOpacity` emitting a `.origam--opacity-{n}` utility, **and** add `opacity` to `IStateEffectConfig` so the hover half converts too. Small, reusable well beyond variants. |
| `backdrop-filter: blur(8px)` behind `@supports` | `OrigamBtn.vue:775-786` (`ghost`) | **None.** No prop, no token group, no utility class. | Either add `IBackdropProps` (`backdropBlur`), or keep `ghost` as a **documented exception**: a variant whose preset covers border/bg and whose blur stays in a `.origam-btn--variant-ghost` rule — the single sanctioned survivor. **Needs arbitration (Q1).** |
| `display: none` on an internal BEM child | `OrigamField.vue` (`plain`), `--inline` | **None**, and arguably shouldn't be a prop. | Keep as component-internal CSS keyed off a *behavioural* prop, not off the variant class. |
| Translucent tint of `currentColor` via `color-mix` | `OrigamBtn.vue:754-758` (`ghost`), `--tonal` fallback | **Partial.** `bgColor` accepts intents and raw CSS colours; whether a `color-mix(… currentColor …)` string survives `useColor`'s tokenised/custom branching is **unverified** — it must be tested before the Btn preset is written. | Verify first. If it passes through as a custom value → converts. If not → semantic token. |
| `font-weight: 600` on active tonal | `OrigamBtn.vue:709` | **Covered** — `ITypographyProps.fontWeight`. | Converts. |
| Asymmetric radius (`8px 8px 0 0`) | `OrigamField.vue:1002` (`filled`) | **Covered** — `IRoundedProps` accepts a CSS shorthand and per-corner props. | Converts. |
| Elevation / shadow | `elevated`, `solo` | **Covered** — `IElevationProps`. | Converts. |
| State-dependent presets (`&--variant-outlined &--active` fills, `&--variant-plain:hover`) | `OrigamBtn.vue:735-740`, `:746-751` | **Covered, and better than expected.** `IHoverProps.hover` / `IActiveProps.active` accept an **object of prop overrides** applied only while the state is engaged — `IStateEffectConfig` (`interfaces/Commons/state-effect.interface.ts:40-59`) exposes `color`, `bgColor`, `border`, `rounded`, `elevation`, `padding`, `margin`, `gap`. So `outlined`'s active fill is `active: { bgColor: … }`. | Converts — provided a preset is allowed to set state props (**Q3**). `plain`'s `:hover{opacity:1}` additionally needs `opacity` added to `IStateEffectConfig`. |

**Consequence to state plainly: the target model does not convert 100 % of the
current behaviour.** Two Btn variants (`plain`, `ghost`) require new prop
surface or a documented exception before they can move. Field's family C
conversion will be partial by construction.

### D7 — Migration: order, pilot, gates

**Pilot: `OrigamKbd`.** Three purely stylistic values (`filled` / `outlined` /
`tonal`), one component, one story, one doc, one e2e spec
(`packages/tests/e2e/kbd.spec.ts`), no state-dependent rules, no structural
branching. It exercises the full mechanism (preset table + tier resolution +
class-with-no-rule + theme override) at the smallest possible blast radius.

`OrigamBlockquote` was the ROADMAP's proposed pilot. It is a better *second*
step than a first: its `quoted` value also toggles a rendered element
(`OrigamBlockquote.vue:128`) and its `pull` value changes the default `align`
(`:146-153`) — i.e. it is already half family B, which would conflate two
problems in the pilot.

**Order:**

1. **Infrastructure** — `TVariantPresets`, the `useDefaults` variant tier,
   `usePassedProps`-based detection, `IOpacityProps`, the `variants` key on
   `IOrigamTheme`, the CI grep guard. No component touched. Unit-tested in
   isolation (`packages/tests/TU/`).
2. **Pilot** — `OrigamKbd`. Validate, then freeze the pattern in `CLAUDE.md`.
3. **Family A** — `OrigamBlockquote`, then `OrigamBtn` + `OrigamBtnGroup`
   together (they share `VARIANT` and BtnGroup styles its children).
   `OrigamBtn` is the highest-risk item and comes *after* the pattern is
   proven, not before.
4. **Family B** — no preset conversion. A documentation + naming pass only
   (Q4), plus `OrigamSkeleton`'s divergent class convention realigned onto
   `useVariant`.
5. **Family C** — `OrigamField` last, since its 6 descendant interfaces
   (`TextField`, `TextareaField`, `Select`, `FileField`, `NumberField`,
   `OtpInputField`) all inherit the change.

**Per-component definition of done** (the repo already mandates the first
three — `CLAUDE.md` § *Story + doc sync*, § *Test-as-you-build*):

- the `.vue`, its `.story.vue` and its `.md` land in the **same commit**;
- the story exposes both the **resolved preset** and an **override of it**, so
  a reviewer can see a variant's props *and* beat them;
- the doc's Props table gains a "preset by variant" column, or the preset table
  is rendered verbatim — a variant must stop being discoverable only by reading
  SCSS;
- the e2e spec asserts (a) the preset applies, (b) an explicit prop beats it,
  (c) the emitted class carries no DS style.

**Downstream blast radius, measured**: 38 story files, 35 doc files and 40 e2e
specs mention `variant`; **8 e2e specs assert directly on a `--variant-*`
class** (`btn`, `field`, `text-field`, `otp-input-field`, `kbd`, `blockquote`,
`bracket`, `rating-field`) and will need their assertions rewritten from "class
present" to "computed style / resolved prop correct". 68 files in
`packages/marketing/src` pass a `variant`.

**Visual-regression gate.** The ROADMAP already flags VRT as a prerequisite for
this work, and it is the only way to answer "did the rendering change?"
honestly for 38 values. **There is no VRT suite today**: of 175 e2e specs,
exactly one (`packages/tests/e2e/icons.spec.ts:522`) calls `toHaveScreenshot`,
and no baseline `*-snapshots` directory is committed. Everything else asserts
on classes and computed styles. Establishing a per-Variant screenshot harness
is a **hard prerequisite for step 3** (Btn), not a nice-to-have. The pilot
(step 2) can proceed on computed-style assertions alone.

---

## Alternatives considered

**A1 — Keep variant CSS, drop the `!important`.** Cheapest fix; solves the
reported symptom on Btn. **Rejected**: it leaves the variant opaque (still not
readable from props or docs), still not themeable through props, and still
duplicating `elevation` / `bgColor` / `border`. It also only defers the
specificity war — a class rule still outranks nothing the consumer can set
except an inline style, so the next `outlined` + `border="2"` conflict returns.

**A2 — Delete the variant class entirely; presets only.** Cleanest model.
**Rejected**: the user explicitly wants the class kept as an override hook, and
8 e2e specs plus an unknown amount of consumer CSS use it as a selector.
Keeping an *inert* class costs one string in a class array.

**A3 — Put the preset table in the token pipeline.** Would let themes retune
variants through the same DTCG files as everything else. **Rejected**: a preset
holds prop values (`elevation: 'md'`, `border: true`), not CSS values; Style
Dictionary would have to emit a Vue props descriptor, which is outside the DTCG
contract and would put a build step between an author and a plain TS object.
ADR-004 already moved theme authoring *away* from raw-value plumbing for the
same reason.

**A4 — Resolve the preset above everything (variant wins).** Matches today's
rendering exactly, so the v3 diff would be nil. **Rejected**: it is the bug.
`<origam-btn variant="outlined" bg-color="primary">` would keep ignoring
`bgColor`.

**A5 — Resolve the preset below everything (`withDefaults` wins).** Simplest
to implement. **Rejected on evidence**: `withDefaults` bakes a concrete value
for many props, and Vue coerces unset boolean-typed props to `false` (#263,
documented in `defaults.composable.ts`). The preset would be silently
unreachable for `border` and `rounded` — the two props `outlined` most needs.

**A6 — One global preset table shared by all components.** **Rejected on
evidence**: the ten vocabularies collide (`outlined` has three unrelated
meanings; `text` means opposite things on Btn and Skeleton). A shared table
would force a false unification.

**A7 — Convert every variant, including Skeleton and Bracket.** **Rejected**:
those variants select a template branch or a layout algorithm
(`OrigamBracket.vue:693-709`). No set of prop values expresses "run the
double-elimination round derivation". Forcing it would produce a preset table
with empty entries and a lie in the documentation.

---

## Consequences

**Positive**

- A variant becomes readable: its effect is a TS object, visible in the doc, in
  the story controls, and in the props panel.
- A variant becomes overridable by definition, which removes the reported
  Theme Builder dead-end and lets `OrigamPagination` drop its
  `variant: baseBg ? FLAT : undefined` workaround.
- Themes gain a props-level lever over variants, closing the gap between the
  PROPS-FIRST policy and the one API that structurally violated it.
- Roughly 13 SCSS blocks disappear from `OrigamBtn` + `OrigamBtnGroup`, and
  with them 9 `!important` declarations.
- It composes with, rather than contradicts, `CLAUDE.md` § *Classes-first*:
  props still resolve to utility classes (tokenised) or inline styles (custom).
  The variant simply stops being a *third*, opaque styling channel.

**Negative / risks**

- **Rendering will change for consumers upgrading to v3.** The preset values
  are a re-expression of the SCSS, not a byte-for-byte port; `tonal`'s
  `surface-overlay` bg and `elevated`'s `shadow.md` should land identically,
  but `ghost` (blur + triple-layer box-shadow + `color-mix`) and `plain`
  (opacity) are the two most likely to shift visibly. `outlined` will change
  *by design* wherever a consumer also passed a `bgColor` — that background
  will now paint.
- **Family B keeps a prop named `variant` that is not a preset.** Two meanings
  under one name is a documentation debt, not a solved problem (Q4).
- **`OrigamField` and its 6 descendants are a partial conversion.** Some Field
  variant CSS will remain. The ADR should not be read as promising otherwise.
- **The migration is gated on a VRT harness that does not exist yet.** That is
  net-new work before step 3.
- Every preset adds an indirection: reading a component's effective props now
  requires consulting the preset table. Mitigated by surfacing the *resolved*
  props in the story and doc.

---

## Maintainer's arbitration — decided 2026-08-11

**Q1 → option (a): a new prop surface.** `IBackdropProps` joins Commons with a
matching `--origam-backdrop-*` token group, and `ghost` becomes a pure preset
like every other variant in family A. The sanctioned-exception option was
rejected on the grounds that an exception to the rule the chantier is built on
does not stay singular — it becomes the precedent the next edge case cites.

**Q4 → rename.** Family B (`OrigamSkeleton`, `OrigamBracket`,
`OrigamSliderField`, `OrigamAudio`, `OrigamTab`'s indicator) drops the name
`variant`. Keeping one word for two opposite meanings — a style preset and a
behavioural discriminant — is what produced the current tangle;  v3 is the only
window to separate them. The replacement name per component is an
implementation decision, to be settled component by component against the list
in D5 (`type` / `layout` / `shape`+`composition` are the candidates raised).

**Q5 → confirmed.** This file stays at
`packages/docs/internal/adr-005-…`, following the existing convention.

### Consequence of Q1 + Q4 on scope

Both decisions **widen** the breaking surface rather than narrowing it: Q1 adds
a Commons interface and a token group, Q4 renames a public prop on five
components. That is a deliberate choice of doing it properly over doing it
cheaply — but it makes the visual-regression prerequisite in D7 harder, not
softer. There is currently **no VRT baseline in the repo** (one `toHaveScreenshot`
call across 175 e2e specs, with no committed snapshot). Renaming a prop is
caught by the type-checker; a variant that silently stops painting is not.

## Still open

These two are deliberately not decided here.

**Q2 — Preset (tier 1.5) vs. theme default (tier 2).**
D2 lets a locally written `variant="outlined"` override an app-wide
`bgColor: 'primary'` set by the theme. The alternative — theme defaults always
win over presets — would make a brand-wide fill survive a local `outlined`.
Both are defensible; the first is proposed because a variant chosen at the call
site is the more specific intent. Confirm or invert.

**Q3 — May a preset set *state* props (`hover: {…}` / `active: {…}`)?**
Several current variants style `:hover` / `--active`
(`OrigamBtn.vue:730-753`). The machinery exists —
`IStateEffectConfig` covers `color` / `bgColor` / `border` / `rounded` /
`elevation` / `padding` / `margin` / `gap` — so `outlined`'s active fill
converts cleanly. Two reservations: it roughly doubles preset size, and
`useColorEffect` deliberately emits **no utility class while a state is
engaged** (`CLAUDE.md` § *Classes-first*, rule 4), so state presets resolve to
inline styles only. Confirm that a preset may reach into state props, or
restrict presets to the resting state and keep state styling in the component's
own CSS keyed off a behavioural class.

---

## Related

- ADR-001 — two-axis theming (`data-theme` × `data-mode`)
- ADR-002 — Theme Builder data model
- ADR-004 — themes out of the DS, semantic JSON authoring (`components` block,
  `mergeDeep` semantics)
- `ROADMAP.md` § *Composants : `variant` = preconfig de props* — the request
  this ADR specifies; also § *`OrigamList` — variants de liste sémantiques*,
  which is a family-B case and should be re-read against D5
- `CLAUDE.md` § *Classes-first conventions*, § *Reuse existing interfaces*,
  § *Story + doc sync on every component change*
