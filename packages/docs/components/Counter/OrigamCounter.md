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

The counter appears/disappears with a transition driven by its `transition`
prop. It defaults to `{ component: OrigamSlideY }` — pass a different
transition component descriptor to override it. A bare string (e.g.
`"fade"`) sets Vue's native `<Transition name="…">` directly, and the DS
ships no CSS for that literal name — it silently produces no animation.

```vue
<template>
  <OrigamCounter :value="10" :max="50" :active="show" :transition="{ component: OrigamFade }" />
</template>
```

## Density

`density` shifts the rendered font size by a **delta of 1px around the
`--origam-counter---font-size` token** — the same grammar as `<OrigamCard>`
and `<OrigamChip>`, where `--origam-{component}---density` is always a delta,
never the value itself.

| `density` | Rendered font size |
|---|---|
| *(not passed)* | token |
| `default` | token (strictly identical to not passing the prop) |
| `comfortable` | token + 1px |
| `compact` | token − 1px |

Because the delta is added to the token rather than replacing it, a theme that
overrides `counter.font-size` keeps control of the base size at every density.

```vue
<template>
  <OrigamCounter :value="42" :max="100" density="compact" />
</template>
```

The font size is deliberately **not** animated: `transition-property` is
restricted to paint properties, so a size change lands on the same frame
instead of being interpolated over the transition duration.

## Slots

`<OrigamCounter>` has no named slots — it renders text-only.

## Emits

`<OrigamCounter>` emits no events.

## Design tokens

| CSS variable | Default | Description |
|---|---|---|
| `--origam-counter---color` | text-secondary | Inactive text color |
| `--origam-counter---active-color` | text-primary | Active text color |
| `--origam-counter---font-size` | `0.625rem` (`font.size.xs`) | Base font size, before the density delta |
| `--origam-counter---density` | `0px` | Density delta added to the base font size |
| `--origam-counter---transition-duration` | `100ms` (`motion.duration.fast`) | Duration of the colour / opacity transition |
