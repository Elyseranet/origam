# useTypography

The font counterpart of `useColor` / `useBorder` / `useMargin`. For each of the
five `ITypographyProps` the consumer set, it emits **one inline custom
property** re-pointing the component's own font variable at the matching
primitive token. A prop left unset emits nothing, so the theme keeps control.

## API

```ts
function useTypography (props: ITypographyProps, varPrefix: string): {
    typographyStyles: ComputedRef<Record<string, string> | null>
}
```

| parameter | role |
|---|---|
| `props` | must satisfy `ITypographyProps` |
| `varPrefix` | the var namespace the component owns, used **as-is** — a block name (`'btn'`, `'title'`) for a root, or a full BEM child namespace (`'card__text'`, `'picker__title'`) for a child surface |

The prop → var mapping:

| prop | emitted variable | resolves to |
|---|---|---|
| `fontFamily` | `--origam-{prefix}---font-family` | `var(--origam-font__family---{value})` |
| `fontSize` | `--origam-{prefix}---font-size` | `var(--origam-font__size---{value})` |
| `fontWeight` | `--origam-{prefix}---font-weight` | `var(--origam-font__weight---{value})` |
| `lineHeight` | `--origam-{prefix}---line-height` | `var(--origam-font__lineHeight---{value})` |
| `letterSpacing` | `--origam-{prefix}---letter-spacing` | `var(--origam-font__letterSpacing---{value})` |

Note the token group keeps its **camelCase** spelling (`font__lineHeight`,
`font__letterSpacing`) while the CSS property is kebab-cased. That asymmetry is
in the map, not a typo.

## Usage

```vue
<script setup lang="ts">
import { useTypography } from 'origam/composables'
import type { ITypographyProps } from 'origam/interfaces'

const props = defineProps<ITypographyProps>()
const { typographyStyles } = useTypography(props, 'btn')
</script>

<template>
    <button :style="typographyStyles"><slot /></button>
</template>
```

Measured output:

```
useTypography({ fontSize: 'xl', fontWeight: 'bold' }, 'btn')
// { "--origam-btn---font-size": "var(--origam-font__size---xl)",
//   "--origam-btn---font-weight": "var(--origam-font__weight---bold)" }

useTypography({}, 'btn')
// null

useTypography({ fontFamily: 'mono', lineHeight: 'relaxed', letterSpacing: 'wide' }, 'card__text')
// { "--origam-card__text---font-family": "var(--origam-font__family---mono)",
//   "--origam-card__text---line-height": "var(--origam-font__lineHeight---relaxed)",
//   "--origam-card__text---letter-spacing": "var(--origam-font__letterSpacing---wide)" }
```

⚠️ Each prop is a **closed union**, and the scales do not share vocabulary —
`lineHeight` and `letterSpacing` in particular have no `sm` / `lg` rung:

| prop | accepted values |
|---|---|
| `fontFamily` | `sans` · `mono` · `serif` |
| `fontSize` | `xs` · `sm` · `md` · `lg` · `xl` · `2xl` · `3xl` · `4xl` · `5xl` |
| `fontWeight` | `regular` · `medium` · `semibold` · `bold` · `extrabold` · `black` |
| `lineHeight` | `none` · `tight` · `snug` · `normal` · `relaxed` · `loose` |
| `letterSpacing` | `tight` · `normal` · `wide` · `wider` · `widest` |

## Two shapes that are deliberate

### Inline styles only — no utility classes

There is no `.origam--font-*` family in
`assets/css/tokens/origam-utilities.css`, so per the classes-first contract
none is invented here. A single `typographyStyles` return is the honest shape;
if font utilities ever ship, a `typographyClasses` computed can be added then.

### A flat object, never an array

`typographyStyles` is one flat `{ '--var': 'value' }` object (or `null`).
Vue's `:style` deep-flattens either form — but components that route their
styles through [`useStyle()`](./useStyle.md) feed the value into a string
serialiser that only stringifies objects at the **top level** of the styles
array. A nested array would leak into the sheet as `[object Object]`. A flat
object drops into both paths.

`null` rather than `{}` when nothing is set: falsy, so `:style="[a, typographyStyles]"`
contributes nothing.

## ⛔ Emitting a var is not the same as painting

A prop only has a **visible** effect when the component's SCSS already reads
the matching `--origam-{prefix}---{property}`. Props outside that set still
type-check and still emit their variable — and paint nothing.

A documented example: `OrigamBtn` uses prefix `btn` and has no `font-family`
rule in its SCSS, so `fontFamily` on a Btn emits
`--origam-btn---font-family` and changes nothing on screen.

Do **not** add an SCSS rule just to force an effect without flagging it.

### The generic var is the override channel

`--origam-{prefix}---font-size` (no size suffix) is the channel through which
the `fontSize` prop overrides a component's own `size` / `density` variant.
Two rules follow:

- **Never pre-define the generic var as a static token** when per-size tokens
  (`--origam-{prefix}---font-size-{xs|sm|…}`) exist. If the generic is always
  defined it always resolves, collapsing every size variant to one value —
  the historical Chip / Kbd bug.
- Each `&--size-*` / `&--density-*` rule must read **generic first**:

  ```scss
  font-size: var(--origam-btn---font-size,
                 var(--origam-btn---font-size-md, 1rem));
  ```

  so `useTypography` wins when `fontSize` is passed, and the per-size token
  drives when it is not.

`OrigamIcon` is out of scope for this surface entirely: its `size` **is** its
font-size.

## Consumers

**44**: 43 components in `packages/ds/src/components/`, plus
`packages/ds/src/composables/Chart/chart-header-typography.composable.ts`.

There is no `typography.composable.spec.ts` under
`packages/tests/TU/composables/Commons/` — the composable is covered
indirectly through component specs such as `OrigamTitle.spec.ts`.

## Source

`packages/ds/src/composables/Commons/typography.composable.ts`
(the file's header comment carries the per-component rollout table:
which `varPrefix` each component owns and which props actually paint on it).

## Related

- [`useStyle`](./useStyle.md) — the serialiser the flat-object shape exists for.
- [`useColor`](./useColor.md) — the colour sibling of this surface.
