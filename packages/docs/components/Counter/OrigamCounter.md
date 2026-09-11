# OrigamCounter

`<OrigamCounter>` is a standalone display-only character counter. It is
typically rendered by `<OrigamTextField>` / `<OrigamTextareaField>` inside the
`counter` slot, but can be used standalone to show any value/max pair.

## Basic usage

```vue
<template>
  <OrigamCounter :value="42" :max="100" />
</template>
```

## Active / inactive

The counter dims when `active` is false (default). It lights up when the
parent field is focused.

```vue
<template>
  <OrigamCounter :value="42" :max="100" :active="true" />
  <OrigamCounter :value="42" :max="100" :active="false" />
</template>
```

## Disabled

```vue
<template>
  <OrigamCounter :value="0" :max="200" disabled />
</template>
```

## Transition

The counter appears/disappears with a transition driven by its `transition` prop.

```vue
<template>
  <OrigamCounter :value="10" :max="50" :active="show" transition="fade" />
</template>
```

## Slots

`<OrigamCounter>` has no named slots — it renders text-only.

## Emits

`<OrigamCounter>` emits no events.

## Design tokens

| CSS variable | Default | Description |
|---|---|---|
| `--origam-counter---color` | text-secondary | Inactive text color |
| `--origam-counter---active-color` | text-primary | Active text color |
| `--origam-counter---font-size` | `0.75rem` | Counter font size |
