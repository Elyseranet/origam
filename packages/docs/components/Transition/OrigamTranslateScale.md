# OrigamTranslateScale

`<OrigamTranslateScale>` has two paths:

1. **CSS-only** (default) — pop in from `scale(0.9); opacity: 0` over
   225 ms, leave in 125 ms.
2. **JS-driven** when a `target` (HTMLElement or `[x, y]`) is supplied —
   the slot animates **from / to** the target's bounding rect using
   `el.animate()`, useful for shared-element transitions (e.g. card
   expanding from a list row into a detail view).

## Basic usage

```vue
<template>
    <OrigamTranslateScale>
        <Card v-if="show" />
    </OrigamTranslateScale>
</template>
```

## Shared-element mode

```vue
<template>
    <OrigamTranslateScale :target="originRow">
        <Detail v-if="show" />
    </OrigamTranslateScale>
</template>
```

When `target` is set, child elements receive a staggered opacity ramp
(0% → 33% → identity) so their content fades in after the container has
landed.

## CSS classes emitted

```
origam-transition--transform-scale-enter-active  { transition: 225ms decelerate; }
origam-transition--transform-scale-leave-active  { transition: 125ms accelerate; }
origam-transition--transform-scale-enter-from    { transform: scale(.9); opacity: 0; }
```

## Props

```ts
interface ITranslateScaleProps extends ITransitionProps {
    target?: HTMLElement | [x: number, y: number]
}
```

## Notes

- During the JS path, `pointer-events: none` is applied so users don't
  click on a moving target.
- For pure CSS animation, omit `target`.
- `disabled` (inherited from `ITransitionProps`) neutralises **both**
  paths: with `target`, the WAAPI enter/leave hooks are skipped entirely
  (no `el.animate()` call); without `target`, the CSS `enter`/`leave`
  classes never get applied. Either way the slotted content mounts/
  unmounts instantly, matching `<OrigamExpandX>`'s `:css="!disabled"`
  behaviour.
- Independently of `disabled`, the JS path already respects the
  OS-level `prefers-reduced-motion: reduce` setting: `animate()`
  (`utils/Commons/animation.util.ts`) shrinks the WAAPI duration to a
  near-zero value rather than running it at full speed — the CSS path
  is covered by the `ds.ds-reduced-motion` SCSS mixin.
