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
for the case where motion is unwanted on purpose. It is NOT the way to
honour `prefers-reduced-motion`: the transition this dispatcher renders
handles that itself (see Accessibility below).

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

## Accessibility

Reduced motion is handled by the component itself — you do NOT need to pass
`disabled` from a `matchMedia` listener. Every member of the family emits a
`@media (prefers-reduced-motion: reduce)` block (shared `ds-reduced-motion`
mixin, issue #494) that collapses the duration to `0.01ms`.

That override wins over the CSS variables above, deliberately: it zeroes the
PROPERTY, not the variable, so a theme or a per-instance duration cannot
resurrect the motion for a user who asked for none. Verified in Chromium —
setting a 9 s duration through the token under `prefers-reduced-motion:
reduce` still measures `0.01ms`.

`disabled` remains available for the unrelated case of skipping the
transition on purpose.

## Related

- `OrigamFade` — opacity-only transition.
- `OrigamScaleRotate` — scale + rotation.
- `OrigamWindowXTranslate` — slide between
  window panes (x-axis).
