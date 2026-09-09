# OrigamTransition

`<OrigamTransition>` is the **dispatcher** that wraps any of the leaf
transition components (`OrigamFade`, `OrigamScaleRotate`, …). It accepts
either a string CSS-name, a Vue `TransitionProps` object, or a `component`
reference and delegates to the right wrapper.

Use it whenever a higher-level component needs a swappable transition
prop (overlay, dialog, snackbar, picker, …).

## Basic usage

```vue
<template>
    <OrigamTransition transition="origam-transition--fade">
        <div v-if="show">…</div>
    </OrigamTransition>
</template>
```

## Component dispatch

```vue
<template>
    <OrigamTransition :transition="{ component: OrigamScaleRotate }">
        <Card v-if="show" />
    </OrigamTransition>
</template>
```

## Disabled

`disabled` short-circuits the transition entirely (Vue `:css="false"`),
useful when motion is unwanted or `prefers-reduced-motion` is detected
upstream.

## Props

```ts
interface ITransitionComponentProps {
    transition?: boolean | string | TTransitionProps
    disabled?: boolean
}
```

## Anatomy

`<OrigamTransition>` resolves to either:

- the Vue native `<Transition>` (string name path), or
- a registered origam-* leaf (`component` path).

It does **not** wrap the slot in any extra DOM.

## Related

- `OrigamFade` — opacity-only transition.
- `OrigamScaleRotate` — scale + rotation.
- `OrigamWindowXTranslate` — slide between
  window panes (x-axis).
