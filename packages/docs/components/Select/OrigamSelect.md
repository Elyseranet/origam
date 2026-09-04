# OrigamSelect

`<OrigamSelect>` is the dropdown select built on `<OrigamTextField>` +
`<OrigamMenu>` + `<OrigamList>`. It supports single and multiple selection,
chips display, autocomplete / filter mode, and the full field mixin set.

## Basic usage with v-model

```vue
<script setup lang="ts">
import { ref } from 'vue'
const country = ref<string | null>(null)
const items = ['France', 'Germany', 'Spain', 'Italy']
</script>

<template>
  <OrigamSelect v-model="country" :items="items" label="Country" />
</template>
```

## Items with value / label

```vue
<script setup lang="ts">
const items = [
  { title: 'France', value: 'fr' },
  { title: 'Germany', value: 'de' },
]
</script>

<template>
  <OrigamSelect :items="items" item-title="title" item-value="value" label="Country" />
</template>
```

## Multiple selection

```vue
<script setup lang="ts">
const selected = ref<string[]>([])
</script>

<template>
  <OrigamSelect v-model="selected" :items="['A','B','C']" multiple label="Multi" />
</template>
```

## Chips

```vue
<template>
  <OrigamSelect :items="['A','B','C']" multiple chips label="With chips" />
</template>
```

## Closable chips

```vue
<template>
  <OrigamSelect :items="['A','B','C']" multiple chips closable-chips label="Removable chips" />
</template>
```

## Autocomplete / filter

```vue
<template>
  <OrigamSelect :items="['Apple','Banana','Cherry']" autocomplete label="Search" />
</template>
```

## No-data text

```vue
<template>
  <OrigamSelect :items="[]" no-data-text="Nothing found" label="Empty" />
</template>
```

## States (disabled / readonly / error)

```vue
<template>
  <OrigamSelect label="Disabled" disabled :items="['A']" />
  <OrigamSelect label="Readonly" readonly :items="['A']" model-value="A" />
  <OrigamSelect label="Error" :error="true" error-messages="Select an option" :items="['A']" />
</template>
```

## Size and density reach the dropdown

`size` and `density` are forwarded to the `OrigamList` mounted inside the
dropdown, which cascades them to every option row. A `small` / `compact`
select therefore opens a `small` / `compact` menu instead of a full-size one.

```vue
<template>
  <OrigamSelect
      label="Country"
      size="small"
      density="compact"
      :items="['France', 'Germany', 'Spain']"
  />
</template>
```

The option row lands on the same rung of the control-height scale as the field
itself (28 / 36 / 44 / 52px for `small` / `default` / `large` / `x-large`), so
the two heights match exactly. `density` then shifts both by the same
`0` / `-8px` / `+8px`. Measured on the Design story, control and option row are
equal at every `size` × `density` combination.

One deliberate limit remains:

- **`size` alone does not scale the option text.** `.origam-field` renders its
  own text at a fixed 16px whatever the `size`, so scaling the menu text off the
  `size` prop would create a new mismatch rather than remove one. The text does
  follow the field when your own CSS changes it — see below.
- **An unsized select keeps the historical 40px rows** against a 36px control.
  Passing `size="default"` explicitly brings both to 36px.

## The dropdown follows your own typography

The menu is teleported out of the select's DOM subtree so it can escape
`overflow` and stacking contexts. A consequence catches most applications out:
**CSS you write against the select never reaches the options**. A compact form
theme, a scaled container, or a plain rule like

```css
.my-form .origam-select * { font-size: 13px; }
```

used to shrink the control and leave the popup at its own size — a small field
opening a visibly oversized menu.

Inheriting `font-size` on the teleported surface would not have fixed it either:
option text is sized with `var(--origam-list-item__title---font-size, 1rem)`, and
`rem` resolves against the document root, not the parent — the options would keep
the root size whatever the surface inherited.

So `OrigamSelect` measures the typography that actually won on the field when the
menu opens, and republishes it on the teleported surface as the tokens the list
already reads. Nothing to configure: any rule of yours that changes the field's
font is picked up, including rules the design system cannot see.

`menuProps.contentProps.style` still wins, for a popup you want to diverge on
purpose:

```vue
<template>
  <OrigamSelect
      label="Country"
      :items="items"
      :menu-props="{ contentProps: { style: { fontSize: '15px' } } }"
  />
</template>
```

The measurement is taken at open time, so a font that changes while the menu is
already open is picked up at the next opening.

`listProps` still wins: `:list-props="{ density: 'default' }"` overrides the
forwarded value for consumers who want the popup to diverge on purpose.

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `default` | — | Replace dropdown list |
| `item` | `{ item, props }` | Custom list item |
| `chip` | `{ item, props }` | Custom chip |
| `selection` | `{ item, index }` | Custom selection display |
| `no-data` | — | Empty state |
| `label` | `ILabelProps` | Custom label |
| `prepend` | — | Outer left |
| `append` | — | Outer right |
| `prependInner` | — | Inside field left |
| `appendInner` | — | Inside field right |
| `loader` | — | Loading indicator |

## Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `any` | Selection changed |
| `update:menu` | `boolean` | Menu open/close |
| `update:search` | `string` | Search text changed |
| `focus` | `FocusEvent` | Field focused |
| `blur` | `FocusEvent` | Field blurred |
| `update:focused` | `boolean` | Focus state changed (relayed from the nested `<origam-text-field>`) |
| `click:clear` | `MouseEvent` | Clear clicked |
| `click:append` | `MouseEvent` | Outer append adornment clicked (relayed from `<origam-text-field>`) |
| `click:prepend` | `MouseEvent` | Outer prepend adornment clicked (relayed from `<origam-text-field>`) |
| `click:appendInner` | `MouseEvent` | Inner append adornment clicked (relayed from `<origam-text-field>`) |
| `click:prependInner` | `MouseEvent` | Inner prepend adornment clicked (relayed from `<origam-text-field>`) |

## Design tokens

| CSS variable | Default | Description |
|---|---|---|
| `--origam-field---border-color` | semantic border | Outline |
| `--origam-field---bg-color` | surface | Background |
| `--origam-select---menu-max-height` | `300px` | Dropdown max height |
