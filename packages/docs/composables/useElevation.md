# useElevation

Turns `elevation` into a `box-shadow`. It accepts three vocabularies at once —
an origam rung name, a Material 0..24 number, or a free-form `box-shadow`
string — and emits a utility class **and** an inline declaration in parallel.

## API

```ts
function useElevation (
    props: IElevationProps | Ref<TElevation | undefined>,
    flat: Ref<boolean> = ref(false),
    bgColor: Ref<TColor> = ref(ELEVATION_LEGACY_BG_COLOR),
    name = getCurrentInstanceName()
): {
    elevationClasses: ComputedRef<string[]>
    elevationStyles: ComputedRef<string[]>
}
```

`TElevation` is `number | string`. `flat` is an escape hatch: while it is
`true`, **both** returns are empty, whatever `elevation` says.

```vue
<script setup lang="ts">
import { toRef } from 'vue'
import { useElevation } from 'origam/composables'
import type { IElevationProps } from 'origam/interfaces'

const props = defineProps<IElevationProps & { flat?: boolean }>()
const { elevationClasses, elevationStyles } = useElevation(props, toRef(props, 'flat'))
</script>

<template>
    <div :class="['origam-card', elevationClasses]" :style="elevationStyles">
        <slot />
    </div>
</template>
```

## The three vocabularies — measured

| `elevation` | `elevationClasses` | `elevationStyles` |
|---|---|---|
| `'md'` | `['{name}--elevated', 'origam--shadow-md']` | `box-shadow: var(--origam-shadow---md)` |
| `'none'` | `['{name}--elevated', 'origam--shadow-none']` | `box-shadow: var(--origam-shadow---none)` |
| `'2xl'` | `['{name}--elevated']` | `box-shadow: var(--origam-shadow---2xl, var(--origam-shadow---xl))` |
| `0` | `['{name}--elevated', 'origam--shadow-none']` | `box-shadow: var(--origam-shadow---none)` |
| `4` | `['{name}--elevated', 'origam--shadow-md']` | `box-shadow: var(--origam-shadow---md)` |
| `24` | `['{name}--elevated', 'origam--shadow-xl']` | `box-shadow: var(--origam-shadow---xl)` |
| `'4'` | same as `4` | same as `4` |
| `'0 4px 12px rgba(0,0,0,.24)'` | `['{name}--elevated']` | the value verbatim |
| `'zzz'` | `['{name}--elevated']` | **`[]`** |
| unset / `null` | `[]` | `[]` |
| anything, with `flat = true` | `[]` | `[]` |

Note `'2xl'` and `'3xl'`: they are valid origam rungs (`ORIGAM_SHADOW_RUNGS`)
but have **no** utility class (`UTILITY_SHADOW_RUNGS` stops at `xl`), so they
take the inline path alone. The code deliberately skips the numeric bridge for
them — `parseInt('2xl')` is `2`, which would otherwise resolve to the wrong
rung. ⚠️ But see the next section: they do not give you two extra rungs.

## ⚠️ `elevation="2xl"` and `"3xl"` render exactly like `xl`

**They are accepted, they paint, and they paint the `xl` shadow — not a
stronger one.** If you need a shadow heavier than `xl`, pass a free-form
`box-shadow` string; `2xl` / `3xl` will not give you one.

`ORIGAM_SHADOW_RUNGS` accepts eight names; the token sheets declare **six**.
`--origam-shadow---2xl` and `--origam-shadow---3xl` exist in **no** stylesheet
of the DS — not `primitive.css`, not `light.css` / `dark.css`, not their SCSS
twins. They are emitted with a fallback onto the top declared rung
(`SHADOW_RUNG_FALLBACK`), the way `useRounded` has always done via
`UTILITY_RADIUS_FALLBACK`:

```ts
// elevation.composable.ts — the origam-rung branch
styles.push(`box-shadow: ${ shadowVar(elevation) }`)
// elevation="2xl"  →  'box-shadow: var(--origam-shadow---2xl, var(--origam-shadow---xl))'
// elevation="xl"   →  'box-shadow: var(--origam-shadow---xl)'    ← no fallback needed
```

### Why the fallback, and not just the tokens — #813

Until 2.17.x the reference was emitted **bare**, and that was not merely inert.
An unresolved `var()` makes the declaration **invalid at computed-value time**,
so the property computes to `unset` — and `box-shadow` is not inherited, so
that is `none`. The declaration still wins the cascade first, which means it
did not yield to the component's own rule, it **replaced it with nothing**. A
component that would have had a shadow from its own SCSS *lost* it, because of
a prop meant to strengthen it. Measured in Chromium, before → after:

| element | before | after |
|---|---|---|
| component rule alone | `rgba(0,0,0,0.9) 0px 1px 2px 0px` | unchanged |
| `md` (token declared) | `rgba(0,0,0,0.05) 0px 6px 24px 0px, …` | unchanged |
| `xl` (token declared) | `rgba(0,0,0,0.2) 0px 11px 15px -7px, …` | unchanged |
| `2xl` (token absent) | **`none`** — component shadow erased | `rgba(0,0,0,0.2) 0px 11px 15px -7px, …` |
| `3xl` (token absent) | **`none`** | same as `xl` |

⚠️ The fallback has to be a real shadow: `var(--origam-shadow---2xl, none)` was
measured too, and it computes `none` — valid, but visually identical to the
defect.

Declaring genuine `2xl` / `3xl` tokens stays open, and is a **design**
decision rather than a bug fix: the ladder has no derivable progression (`md`
is a different family — a 1px ring plus a soft shadow) and `xl` is already the
top of the Material 0..24 scale this composable maps
(`MATERIAL_ELEVATION_TOP_RUNG`), so there is no rung above to borrow from. The
day those tokens land, the fallback goes inert on its own.

The `token-var-channels` guard still does not catch this family, because the
reference is built in TypeScript rather than written in a `.scss` block — the
guard reads stylesheets. Tracked as **#823**.

⚠️ `'zzz'` is the one shape that emits a class with no shadow behind it:
`parseInt('zzz')` is `NaN`, the style branch returns early, and the
`{name}--elevated` class is left on its own. There is no warning.

## Material numbers are bucketed, not interpolated

`MATERIAL_ELEVATION_LADDER` maps the 25-step Material scale onto six rungs —
the first bucket whose `maxLevel` is `>=` the requested level wins:

| level | rung |
|---|---|
| `0` | `none` |
| `1` | `xs` |
| `2`–`3` | `sm` |
| `4`–`8` | `md` |
| `9`–`16` | `lg` |
| `17`+ | `xl` (`MATERIAL_ELEVATION_TOP_RUNG`) |

So `elevation="5"` and `elevation="8"` render identically. That is deliberate:
the theme owns six shadows, not twenty-five.

## Order matters — custom shadow before `parseInt`

The free-form detection runs **before** the numeric fallback, on both channels.
Without that order `parseInt('0 4px 12px rgba(0,0,0,.24)', 10)` reads the
leading `0` and silently resolves to the `none` rung — the custom shadow
vanishes with no error. Do not reorder those branches.

## ⛔ `bgColor` is accepted, ignored, and warns on every call site

The third parameter is kept for backward compatibility only: it affects
neither return. Passing anything other than `ELEVATION_LEGACY_BG_COLOR`
triggers a `console.warn`.

⚠️ The composable's banner used to say that warning fires "once". **Measured:
three `useElevation` calls with a non-default `bgColor` produce three
warnings.** The deduplication in `warnBgColorUsage` is inert — it queries a
`WeakSet` with an object literal it rebuilds on every call, so `has()` is
always `false`. The call sits in the body of `useElevation` rather than in a
`computed`, so the practical ceiling is one warning per component **mount**,
not per render. *Reported, not fixed — this is a documentation lot.*

The migration path is a shadow token: pass a rung and let the theme decide, or
set `--origam-{cmp}---box-shadow` for a one-off.

## `isCustomBoxShadow`

```ts
function isCustomBoxShadow (value: string): boolean
```

Signal-based detection rather than a `box-shadow` grammar parser — same
approach as `isCustomBorderRadius`. Measured:

| input | result |
|---|---|
| `'0 4px 12px rgba(0,0,0,.24)'` | `true` |
| `'var(--origam-shadow---card)'` | `true` |
| `'inset 0 0 0 2px #fff'` | `true` |
| `'none'` / `'md'` / `'2xl'` | `false` — rung names must not be swallowed |
| `'12'` | `false` — Material numbers must not be swallowed |
| `'zzz'` | `false` |

**Consumers:** 2 — `composables/Commons/elevation.composable.ts` and
`packages/marketing/src/composables/useThemeBuilderElevationControl.ts`. Plus
`packages/tests/TU/utils/Commons/elevation.util.spec.ts`.

## `formatElevationStyle` — deprecated, and unused

```ts
function formatElevationStyle (elevation: number = 0, bgColor?: TColor): string
```

Computes a `box-shadow` arithmetically from a Material level, normalising
offset / blur / opacity and optionally tinting from a background colour:

```ts
formatElevationStyle(0)   // 'box-shadow: 0px 0px 0px hsl(0deg 0% 0% / 0.50)'
formatElevationStyle(4)   // 'box-shadow: 1.3px 2.6px 2.6px hsl(0deg 0% 0% / 0.46)'
formatElevationStyle(24)  // 'box-shadow: 7.7px 15.4px 15.4px hsl(0deg 0% 0% / 0.26)'
formatElevationStyle(4, '#ff0080')
// 'box-shadow: 1.3px 2.6px 2.6px hsl(329.88235294117646deg 100% 50% / 0.46)'
```

⛔ **Deprecated since v0.4, slated for removal in v3.0.0, and measured at
ZERO consumers** — nothing in `packages/ds/src`, `packages/marketing`, or
anywhere else in the monorepo imports it; its only importer is its own spec,
`packages/tests/TU/utils/Commons/elevation.util.spec.ts`. It is kept exported
so that external consumers who imported it directly do not break at upgrade
time. Migrate to a rung, or to `@include ds-elevation('md')` from
`src/assets/scss/_helpers.scss`.

Note the unrounded hue in the tinted example: `convertToUnit(color.h, 'deg')`
passes the raw float through. Valid CSS, just noisy.

## Consumers

Counted by **real import declaration**: **42 components** — `OrigamCode`,
`OrigamList`, `OrigamExpansionPanels`, `OrigamSystemBar`, `OrigamPagination`,
`OrigamSwitchTrack`, the `OrigamChart*` family, … plus
`composables/Commons/stateEffect.composable.ts`. One spec,
`packages/tests/TU/composables/Commons/elevation.composable.spec.ts`.

## Source

`packages/ds/src/composables/Commons/elevation.composable.ts` ·
`packages/ds/src/utils/Commons/elevation.util.ts` ·
`packages/ds/src/consts/Commons/elevation.const.ts`

## Related

- [`useRounded`](./useRounded.md) — same classes-plus-styles pattern, same
  cascade reason
- [`useTheme`](./useTheme.md) — where the six shadow rungs are actually defined
