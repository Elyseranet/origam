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

## CSS variables consumed

Declared in `assets/css/tokens/light.css`. Before #538 these were CSS
literals inside the component's own `<style>` block — no theme could reach
them.

| Variable | Default |
|---|---|
| `--origam-transition--transform-scale-enter-active---transition-duration` | `225ms` |
| `--origam-transition--transform-scale-enter-active---transition-timing-function` | `var(--origam-motion__easing---decelerate)` |
| `--origam-transition--transform-scale-leave-active---transition-duration` | `125ms` |
| `--origam-transition--transform-scale-leave-active---transition-timing-function` | `var(--origam-motion__easing---accelerate)` |

Override at the document root or on a specific instance:

```css
.my-panel {
    --origam-transition--transform-scale-enter-active---transition-duration: 0.15s;
}
```

## Props

`<OrigamTranslateScale>` does **not** take the whole shared
`ITransitionProps` surface. It implements its own enter / leave hooks
instead of going through `useCssTransition` or `useWindowTransition`, so
four members of that surface were removed from its type on 2026-09-06:

```ts
interface ITransitionTranslateScaleProps
    extends Omit<ITransitionProps, 'group' | 'mode' | 'hideOnLeave' | 'leaveAbsolute'> {}

interface ITranslateScaleProps extends ITransitionTranslateScaleProps {
    target?: HTMLElement | [x: number, y: number]
}
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | `'origam-transition--transform-scale'` | Transition class prefix for the CSS-only path. |
| `disabled` | `boolean` | `undefined` | Neutralises both paths — see the note below. |
| `origin` | `string` | `undefined` | `transform-origin` applied before the scale runs, on both paths. |
| `target` | `HTMLElement \| [x, y]` | `undefined` | Switches to the JS/WAAPI shared-element path and names the rect to animate from / to. |

### What the removed four do now

| Prop | Behaviour if you pass it anyway |
|---|---|
| `group` / `hideOnLeave` / `leaveAbsolute` | Nothing. They are not declared, so they fall through as raw DOM attributes onto the transitioned element (`group="true" hideonleave="true" leaveabsolute="true"` — visible in the rendered markup). Use `<OrigamTranslateBottom>` or another `useCssTransition` member if you need them. |
| `mode` | ⛔ **It still works, by accident.** This component's root *is* a native `<transition>`, so an undeclared `mode` falls through to it and Vue's `Transition` — which declares `mode` — picks it up. Measured: passing `mode="out-in"` yields `Transition.$props.mode === 'out-in'`. TypeScript will reject it, since it is no longer part of `ITranslateScaleProps`. Do not rely on this; it is a gap between the type and the runtime, not a supported API. |

## Emits

None. `ITransitionEmits` is empty for every member of the family.

## Slots

| Slot | Scope | Description |
|---|---|---|
| `default` | — | The transitioned content. |

## Notes

- During the JS path, `pointer-events: none` is applied so users don't
  click on a moving target.
- For pure CSS animation, omit `target`.
- `disabled` neutralises **both**
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
- **`origin` is implemented on BOTH
  paths (#538/#548)** — this is the only member of the 8-component
  `origin` audit where the prop has something to anchor on, since this
  is the only transition whose keyframes/CSS class include an actual
  `scale(...)`. Set as `el.style.transformOrigin` before the scale
  runs:
  - **CSS-only** (`!target`): the inline style wins the cascade over
    the `.origam-transition--transform-scale-enter-from` rule's
    `transform: scale(0.9)`.
  - **WAAPI** (`target` set): set before `getDimensions()` runs so its
    `getComputedStyle(el).transformOrigin` read
    (`utils/Transition/transition.util.ts`) picks up the custom value —
    that function's `x`/`y` offset math already generically accounts
    for whatever `transform-origin` is current on the element.

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
