# ADR-005 — Where theme default PROPS get resolved

- **Status**: Implemented (2026-08-15) — the recommended option below shipped
  as `installThemePropsResolver()` in
  `packages/ds/src/composables/Commons/theme-props-resolver.composable.ts`,
  wired into `createOrigam()`. The "Open questions" section is resolved as
  follows: (1) the global `beforeCreate` hook was accepted; (2) interception
  is scoped to the union of every REGISTERED theme (not just the brand active
  at mount) — the Theme Builder runtime-authoring residual gap noted there is
  still open and untested; (3) the 39 `useDefaults()` calls were **not**
  removed in this change — they coexist, pace of removal still to be decided;
  (4) the dependency on `instance.props` being mutable via
  `Object.defineProperty` was accepted, pinned by tests that must fail loudly
  on a Vue upgrade that breaks it (see that file's own doc comment). See
  `CLAUDE.md`'s "How `theme.components` props actually resolve" section and
  `packages/docs/integrations/theming-authoring.md` for the consumer-facing
  writeup.
- **Deciders**: user (arnaudprioul) — *pending*; architect (analysis + spike)
- **Scope**: `packages/ds` (`useDefaults`, `provideDefaults`, `createOrigam`,
  all 217 components)
- **Relates to**: ADR-001 (two-axis theming), ADR-003 (themes installed via
  `createOrigam`), ADR-004 (theme authoring). Does not supersede any of them —
  this ADR is about the **mechanism** that turns `theme.components` into
  actual prop values, not about how themes are authored.

---

## Context

The project's non-negotiable rule is that **a theme is configured
PROPS-FIRST**: the `components` block of an `IOrigamTheme` sets props per
component, and raw CSS vars are the last resort. That is stated as the
fundamental logic of the DS.

**The mechanism that implements it only works on 39 of 217 components.**

The circuit is:

```
IOrigamTheme.components
  → createOrigam (collapses brand×mode themes into one IDefault)
  → app.provide(ORIGAM_DEFAULTS_KEY, defaultsRef)
  → useDefaults(props)   ← CALLED INSIDE THE COMPONENT — this is an OPT-IN
  → merged props
```

The final step is opt-in, and it has failed three separate times, in three
different ways, all silently, on the same path.

### Manifestation 1 — a bound `undefined` counted as "passed" (shipped in 2.14.1)

`usePassedProps` treated a key present in `vnode.props` with the value
`undefined` as explicitly provided. The most ordinary consumer pattern —
`:bg-color="state.bgColor"` — therefore declared the prop as supplied while it
was empty, and the theme default was skipped. Symptom recorded in the
CHANGELOG: *"a component that appears to ignore its theme, with no log and no
error"*. Fixed in `defaults.composable.ts:85` by requiring a non-`undefined`
value.

### Manifestation 2 — the template does not see the merged props

`useDefaults` returns a **new object**. The script reads the merged value via
`props.x`; the template does not.

This is not a subtlety of style — it is how the SFC compiler emits template
code. Compiling a component that follows the project's own pattern
(`const _props = withDefaults(defineProps<T>(), {}); const props = useDefaults(_props)`)
produces:

```js
const _props = __props           // the RAW props object
// template:
type: __props.type,              // ← reads the RAW props, never `props`
"data-v": __props.variant
```

The template compiles to `__props.x`, i.e. `instance.props` — the *unmerged*
object. The value returned by `useDefaults` is invisible to it.

**Verified consequence on real code.** `OrigamSelectionControl` binds
`:type="type"` in its template. Under a provider setting
`'origam-selection-control': { type: 'checkbox' }`:

```
rendered type attribute = undefined
input.type              = "text"
```

So an `<input>` inside a `SelectionControlGroup` gets no `type` attribute, has
no checkbox semantics, and never emits `update:modelValue`. The whole
`SelectionControlGroup` family is non-functional for anyone following the
documentation.

**This is not an isolated case — it is the majority case.** An audit
extracting each component's prop list from the Vue compiler's own runtime
descriptor, then scanning only the expression regions of the root
`<template>` (with `<script setup>` depth-0 bindings treated as shadowing,
`v-for` aliases and `v-slot` destructures excluded):

| Metric | Count |
|---|---|
| `useDefaults` callers whose template reads a declared prop by its bare name | **33 of 39 (85 %)** |
| Distinct (component, prop) pairs affected | **199** |

⚠️ **Read that number correctly.** `useDefaults` only changes a value when the
parent did *not* pass the prop. Where a consumer always passes it, the
divergence exists structurally but never shows. **199 is a count of
structurally broken sites, not of observed user-visible bugs.**

What makes it material is *which* props diverge. The most frequently affected
are `density`, `prependAvatar` / `appendAvatar`, `text`, `title`, `disabled`,
`name`, `color` — precisely the props a theme exists to drive.

The 6 clean components (`App`, `BtnGroup`, `Checkbox`, `Form`, `Radio`,
`Tabs`) are clean for an instructive reason: every prop their template touches
is routed through a depth-0 binding that reads the **merged** props. The
remediation pattern is already in the codebase —
`packages/ds/src/components/Btn/OrigamBtnGroup.vue:130`:

```ts
const items = computed(() => (props.items ?? []) as Array<IBtnProps>)
```

That works, but it is one binding per prop per component — 199 of them to
write and to keep in sync, which is the cost the recommended option avoids.

Note the interaction with the coding rule "no `props.` in the template". That
rule is correct and stays. It is *not* the cause — the cause is that
`useDefaults` returns a value the template has no way to reach. Writing
`props.type` in the template would paper over a design fault with a style
violation.

### Manifestation 3 — 178 of 217 components never call `useDefaults`

Writing `components: { 'origam-xxx': { … } }` for any of them produces
**nothing**, with no warning.

| Metric | Count |
|---|---|
| Components in `packages/ds/src/components` | **217** |
| Components calling `useDefaults` | **39** (18.0 %) |
| Components **not** covered | **178** (82.0 %) |

A `grep -l useDefaults` returns 43, but four files only mention it **in a
comment** and never call it — `OrigamAvatarGroup`, `OrigamBottomNav`,
`OrigamBreadcrumb`, `OrigamDefaultsProvider`. The real caller count, matched
on the actual call `= useDefaults(`, is **39**.

### Scale of the surface

From the Vue compiler's runtime props descriptor across those 39 components:

| Metric | Value |
|---|---|
| Mean runtime props per component | **71.1** (median 72) |
| Max | **142** (`OrigamSelect`) |
| Cumulative props across the 39 | **2 771** |
| Own props declared on the root interface | 285 (~10 %) |

~90 % of the prop surface is inherited from `Commons` interfaces (9–22
`extends` per component). This matters for the cost analysis below: any design
that does per-prop work on *every* prop is doing it ~71 times per instance,
while a theme typically drives 5–12 props (largest observed forward:
`SelectionControlGroup`, 12 keys).

### Who feeds the defaults map today

Relevant because any replacement must keep these working. Only **two** direct
`provideDefaults` calls exist in the DS:

- `OrigamDefaultsProvider.vue:39` — pushes its own `defaults` prop
  (`scoped` / `reset` / `root` / `disabled`).
- `OrigamThemeProvider.vue:56` — `provideDefaults(scopedDefaults, {scoped:true})`
  from `resolveThemeDefaults(theme, mode)`. **This is the props-first theme
  path per sub-tree**, and the two-axis (`data-theme` × `data-mode`)
  integration point.

A further **14 group components** feed the map indirectly by rendering
`<origam-defaults-provider>` in their template — `AvatarGroup`, `BtnGroup`,
`BottomNav`, `Breadcrumb`, `ChipGroup`, `ConfirmWrapper`, `ExpansionPanels`,
`ItemGroup`, `List`, `ListGroup`, `RadioGroup`, `SelectionControlGroup`,
`TabPanels`, `Tabs`. `SelectionControlGroup` forwards the most (12 keys,
including the `type` that manifestation 2 drops).

Secondary observation, **not verified at runtime**: only `AvatarGroup` and
`BtnGroup` use the `usePassedProps` + `omitUndefined` guard added for #263
(Vue coerces an unset prop whose declared type includes `boolean` to `false`,
which then wins the merge against an ancestor default). The other 12 forward
`props.x` directly, so the same trap is structurally possible on any
boolean-union prop (`border`, `rounded`, `disabled`, `divider`…). This is a
suspicion worth a separate check, not a confirmed bug, and it is *not* an
argument for or against this ADR.

### Why these are one problem, not three

Three mechanisms, three failures, all silent, on the same trajectory. Each fix
so far has been local to one mechanism. Fixing the third one component at a
time leaves room for a fourth: nothing in the design makes the correct
behaviour the default, and nothing makes an omission visible.

---

## Options considered

### Option A — merge defaults into descendant vnodes inside the provider

`OrigamDefaultsProvider` walks its rendered vnode tree and rewrites
`vnode.props` for descendants that have theme defaults. Attractive because it
would cover all 217 with no per-component change, kill the opt-in, and fix the
template by construction.

**Rejected — it cannot reach far enough. Measured, not assumed.**

| Placement of the target component | Reached? |
|---|---|
| Written directly in the provider's slot | yes |
| Nested in plain elements of the same template | yes |
| **Rendered inside another component's own template** | **no** |
| **Produced by a `v-for` in a child component** | **no** |

A provider only sees the vnodes created **in its own render scope**. Anything
a child component renders from its own template does not exist yet when the
provider runs.

That is disqualifying here: **146 of 217 components (67 %) render other
`origam-*` components inside their own template.** Option A would silently
miss theming in two thirds of the catalogue — replacing a known blind spot
with a subtler one.

### Option B — rewrite each prop's `default` into a factory that injects the theme

Vue calls prop default factories with the component instance active:

```js
// @vue/runtime-core 3.5.39, resolvePropValue, line 5028
const reset = setCurrentInstance(instance)
value = propsDefaults[key] = defaultValue.call(null, props)
reset()
```

so `inject()` is legal inside a `default()`. Patching every component's props
descriptor at install time would resolve the theme inside Vue's own props
resolution.

This works remarkably well, and **fixes manifestations 1 and 2 for free**:
Vue only calls the factory when `value === undefined`, so an explicitly bound
`undefined` correctly falls through to the theme (manifestation 1 becomes
structurally impossible), and the resolved value *is* `instance.props`, which
is exactly what the template reads (manifestation 2 disappears). Verified: an
explicit prop still wins, boolean semantics are preserved, and components
nested inside other components' templates are reached.

**Rejected — it loses reactivity, which is a hard requirement.**

Vue caches the factory result per instance (`instance.propsDefaults`) and never
invalidates it. Measured: after a live theme swap the prop **stays on the old
value**.

That is a regression against an explicitly supported behaviour.
`theme.composable.ts` documents fix #275, whose entire purpose is that props
driven by `theme.components` update live on theme switch; its comment names
the exact symptom to avoid — *"any prop resolved through `useDefaults()`
freezes on the theme active at initial load until a full page reload"*.

I tried to rescue it by clearing `instance.propsDefaults` and forcing an
update. **It does not work** — the cached value is only re-read when the
*parent* re-renders and runs `updateProps`; a child cannot re-resolve its own
defaults. Making this reliable would need a registry of every live instance
plus forced parent invalidation: more machinery, and still fighting the
framework.

Secondary limit: a prop whose declared type includes `Function` cannot use a
factory (Vue treats `default` as the value itself), so such props would be
untouchable.

### Option C — add `useDefaults` to the 178 remaining components

Rejected, and it was already excluded in the brief. It propagates
manifestation 2 to the whole catalogue: every one of those components would
read merged values in the script and raw values in the template. It also keeps
the opt-in, so component 218 can still forget it.

### Option D — a pass-through `computed` per prop

Rejected on performance grounds, and the objection is **numerically correct**.
Measured below: applying per-prop work to *every* prop costs **+39.8 %** on
mount. The instinct behind the rejection was right.

---

## Recommended option — resolve into `instance.props`, once, centrally

A single app-level hook (installed by `createOrigam`) intercepts, at
`beforeCreate`, the props a theme actually targets, and installs a **plain
getter** on `instance.props` that reads the injected defaults map.

Three properties make it work:

1. **The template already reads `instance.props`** (`__props.x`). Writing the
   resolution *there* means script and template read the same value by
   construction — manifestation 2 cannot recur.
2. **No `computed` is needed.** The getter reads `defaults.value` *during the
   render effect*, so the render effect becomes a dependency of the defaults
   ref automatically. Reactivity is free; there is no per-prop reactive node.
3. **Only props a theme names are intercepted.** Cost scales with the size of
   the theme, not with the catalogue.

### Spike results — what was verified

Prototyped and run against real DS code (`packages/tests/TU/spike/`, not
committed):

| Check | Result |
|---|---|
| Fixes the real `OrigamSelectionControl` defect, **component unmodified** | ✅ `type="checkbox"` |
| Reaches a component rendered inside another component's template | ✅ (Option A's blind spot) |
| Explicitly passed prop still wins | ✅ |
| Explicitly bound `undefined` falls back to theme (manifestation 1) | ✅ |
| Live theme swap updates the prop (#275 requirement) | ✅ |
| Survives a parent re-render (`updateProps` does not clobber the getter) | ✅ |
| SSR (`renderToString`) | ✅ `<input type="checkbox">` |
| Nested provider overrides its subtree only (the `OrigamThemeProvider` `scoped:true` shape) | ✅ |
| Coexists with the 39 existing `useDefaults` calls | ✅ (spike ran on a component that calls it) |

### Measured cost

Measured at **realistic width**: 1000 instances × **71 props** (the audited
mean), 6 of them themed. Median of 9 interleaved runs, jsdom. Ratios are
meaningful; absolute ms are not (jsdom ≠ browser).

| Strategy | Mount | Overhead |
|---|---|---|
| baseline (no mechanism) | 106.7 ms | — |
| hook present, component not themed | 104.2 ms | −2.3 % |
| **recommended: getter, themed props only** | **99.6 ms** | **−6.6 %** |
| computed, themed props only | 101.2 ms | −5.2 % |
| per-prop work on *every* prop | 152.1 ms | **+42.6 %** |

**The negative percentages are noise, not a speed-up.** Intercepting 6 props
cannot make a mount faster. The honest reading is that the baseline, the
early-out and both themed-only strategies are **indistinguishable at this
sample size** — the harness's noise floor is roughly ±7 %, which is wider than
the effect being measured. What *is* far outside the noise, and reproducible
across two independent runs at different widths (+39.8 % at 8 props, +42.6 %
at 71), is the cost of touching every prop.

Three conclusions:

- **The 178 currently-uncovered components pay nothing measurable.** A
  component no theme mentions early-outs.
- **Scoping is the whole game.** Getter vs computed is lost in the noise
  (−6.6 % vs −5.2 %); *how many props you touch* is what costs. The rejection
  of the per-prop pass-through was numerically right — that is the +42.6 % row,
  and this design's entire purpose is to avoid it.
- The cost grows with the **theme's** size, not the catalogue's. Adding the
  178 missing components to theming does not add per-instance work unless a
  theme actually names their props.

### Known weakness — and its fix

Deciding *which* props to intercept from the theme active at mount creates a
gap: a prop named only by a **later** theme was never intercepted and will not
update. Verified:

```
theme A themes `color` only → swap to theme B theming `color` + `rounded`
  color   = success  (intercepted, updates)
  rounded = none     ← NEVER INTERCEPTED
```

Fix, also verified: scope interception to the **union of prop keys across all
registered themes**, which `createOrigam` knows at install time. This keeps
the cost benefit and closes the gap (`rounded = lg` after swap).

Residual: a theme edited at **runtime** to add a prop key absent from every
registered theme (the Theme Builder authoring flow) would still not intercept
it on already-mounted instances. See open questions.

---

## Consequences

**Positive**

- All 217 components become themeable, with **no per-component change**.
- The opt-in disappears; a future component 218 cannot forget it.
- Manifestations 1 and 2 become structurally impossible.
- The "no `props.` in the template" rule is preserved untouched.
- One mechanism, uniform across the catalogue.

**Negative / risk**

- A global `beforeCreate` hook is **invisible machinery**. It resolves props in
  a place a reader of the component does not look. This must be documented
  loudly, or it becomes the next silent trap.
- It relies on `instance.props` being mutable via `defineProperty`. That is not
  a documented public API. It works in 3.5.39 (verified, including through the
  `shallowReactive` proxy and under SSR where props are raw), but a Vue
  internals change could break it. Mitigation: pin the behaviour with unit
  tests that fail loudly on upgrade.
- `useDefaults` becomes redundant for its 39 callers. They coexist safely
  (both read the same map), so removal can be gradual — but leaving both in
  place indefinitely means two mechanisms, which the brief rightly forbids.

---

## Migration sketch (not part of the decision)

1. Ship the hook in `createOrigam`, scoped to the union of registered theme
   keys. No component changes. Everything themeable immediately.
2. Add regression tests: the `SelectionControl` template case, a
   non-`useDefaults` component honouring a theme, live-swap, SSR.
3. Remove `useDefaults` calls from the 39 components, one batch at a time,
   verifying no behaviour change. Keep the export as a deprecated no-op for
   external consumers until the next major.
4. Delete `usePassedProps`'s heuristic — Vue's own `value === undefined` test
   replaces it.

Estimated effort: step 1 is small and self-contained (the spike is ~40 lines).
Steps 3–4 are mechanical but touch 39 files and want their own PRs.

---

## Open questions — for the user to settle

1. **Is a global `beforeCreate` hook acceptable at all?** It is the crux. It
   buys total coverage with zero per-component code, and costs explicitness:
   props get resolved somewhere the component file does not mention. If that
   trade is refused, the honest fallback is Option C (add `useDefaults`
   everywhere) *plus* a fix for manifestation 2 — more code, more surface, but
   visible in each file.

2. **Runtime-authored themes (Theme Builder).** Should interception cover the
   union of registered themes only (cheap, one residual gap), or should the
   Theme Builder force a remount when a theme gains a new prop key? The
   builder is an authoring tool, so a remount may be entirely acceptable.

3. **Pace of `useDefaults` removal** — same release as the hook, or the next
   major? Two mechanisms must not coexist for long, but 39 files in one PR is
   a large diff.

4. **Depending on a Vue internal.** Mutating `instance.props` is not public
   API. Acceptable with tests pinning it, or a blocker on principle?

---

## What I did not verify

Stated explicitly so this is not read as more settled than it is:

- Everything was tested in **jsdom via Vitest**, not in a real browser and not
  in Histoire. Perf ratios should be re-measured in a browser before being
  quoted as product facts.
- The spike ran on **2–3 components**, not the full 217 catalogue. It was not
  run against a full app render.
- The **Nuxt SSR plugin path** (`plugin.server.ts` / `plugin.client.ts`) was
  not exercised; only `renderToString` on a bare app.
- **HMR**, `attrs` fallthrough interaction, and `Function`-typed props under
  the recommended option were not tested.
- Removing `useDefaults` from the 39 was **not** attempted — coexistence was
  verified, removal was not.
- The **199 divergent (component, prop) pairs** come from a static scan. 12
  were hand-verified against source; the remaining pairs were not individually
  confirmed, so treat 199 as accurate to within a handful.
