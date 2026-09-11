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

Two deliberate limits:

- **The option text is not scaled.** `.origam-field` renders its own text at a
  fixed 16px whatever the `size`, so scaling the menu text would create a new
  mismatch rather than remove one.
- **An unsized select keeps the historical 40px rows** against a 36px control.
  Passing `size="default"` explicitly brings both to 36px.

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
| `click:clear` | `MouseEvent` | Clear clicked |

## Design tokens

| CSS variable | Default | Description |
|---|---|---|
| `--origam-field---border-color` | semantic border | Outline |
| `--origam-field---bg-color` | surface | Background |
| `--origam-select---menu-max-height` | `300px` | Dropdown max height |
