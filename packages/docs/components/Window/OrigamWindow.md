# OrigamWindow

`<OrigamWindow>` is a carousel-style stack: only one of its children
(`<OrigamWindowItem>`) is shown at a time and prev/next controls move
through the stack with a directional transition. Selection is owned by
`useGroup` so the active value can be controlled or two-way bound via
`v-model`.

## Basic usage

```vue
<template>
    <OrigamWindow v-model="step">
        <OrigamWindowItem :value="1">Step 1</OrigamWindowItem>
        <OrigamWindowItem :value="2">Step 2</OrigamWindowItem>
        <OrigamWindowItem :value="3">Step 3</OrigamWindowItem>
    </OrigamWindow>
</template>
```

> `<OrigamWindowItem>` MUST be nested inside `<OrigamWindow>` — it
> consumes the group context. The component throws on mount otherwise.

## Direction

`direction` toggles the transition axis. Horizontal slides items left /
right (default), vertical slides them up / down. Combine with `reverse`
to invert the geometric direction without affecting selection logic.

```vue
<template>
    <OrigamWindow direction="horizontal">…</OrigamWindow>
    <OrigamWindow direction="vertical">…</OrigamWindow>
    <OrigamWindow direction="horizontal" reverse>…</OrigamWindow>
</template>
```

## Continuous

`continuous` makes the carousel wrap: hitting prev on the first item
loops to the last, and vice-versa. Without it, prev / next are disabled
at the edges (and the corresponding control is hidden).

```vue
<template>
    <OrigamWindow continuous v-model="step">…</OrigamWindow>
</template>
```

## Show arrows

`showArrows` accepts `true`, `false`, or `'hover'`. The hover mode keeps
the arrows offscreen until the user hovers the window (driven entirely
by CSS — `--origam-window--show-arrows-on-hover---*-transform`).

```vue
<template>
    <OrigamWindow show-arrows>…</OrigamWindow>
    <OrigamWindow :show-arrows="false">…</OrigamWindow>
    <OrigamWindow show-arrows="hover">…</OrigamWindow>
</template>
```

## Custom icons

`prevIcon` / `nextIcon` swap the default chevrons. Pass any value the
icon system accepts (an `mdi-*` string, a component, etc.).

```vue
<template>
    <OrigamWindow prev-icon="mdi-arrow-left" next-icon="mdi-arrow-right">…</OrigamWindow>
</template>
```

## Touch

`touch` enables (or replaces) the swipe handlers. Pass `false` to
disable, `true` to use the defaults (left = next, right = prev), or an
object overriding individual handlers from `ITouchHandlers`.

```vue
<template>
    <OrigamWindow :touch="false">…</OrigamWindow>
    <OrigamWindow touch>…</OrigamWindow>
</template>
```

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | `group` | Where you nest `<OrigamWindowItem>` children. The bound `group` exposes `prev`, `next`, `select`, `selected`. |
| `prev` | `props`, `canMove` | Override the prev affordance. Spread `props` on a custom button. |
| `next` | `props`, `canMove` | Override the next affordance. |
| `arrows` | `prevProps`, `nextProps`, `canMoveBack`, `canMoveForward` | Replace both controls in one slot. |
| `additional` | `group` | Slot rendered AFTER the container — useful for pagination dots. |

## Props (interface)

```ts
interface IWindowProps extends ICommonsComponentProps, ITagProps,
    IDirectionProps, IBorderProps, IPaddingProps, IMarginProps,
    IRoundedProps, IElevationProps {
    continuous?: boolean
    nextIcon?: TIcon
    prevIcon?: TIcon
    reverse?: boolean
    showArrows?: string | boolean
    touch?: boolean | ITouchHandlers
    modelValue?: any
    disabled?: boolean
    selectedClass?: string
    mandatory?: boolean
}
```

## Anatomy

```html
<div class="origam-window">
    <div class="origam-window__container">
        <slot/>
        <div class="origam-window__controls">
            <button class="origam-window__prev"/>
            <button class="origam-window__next"/>
        </div>
    </div>
</div>
```

## Design tokens consumed

Defined in `tokens/component/window.json`.

| CSS variable | Default |
|---|---|
| `--origam-window---overflow` | `hidden` |
| `--origam-window---transition-duration` | `{motion.duration.slow}` |
| `--origam-window---transition-easing` | `{motion.easing.standard}` |
| `--origam-window__container---display` | `flex` |
| `--origam-window__container---flex-direction` | `column` |
| `--origam-window__controls---padding-inline` | `{space.4}` |
| `--origam-window__controls---color` | `{color.text.primary}` |
| `--origam-window--show-arrows-on-hover---prev-transform` | `translateX(-200%)` |
| `--origam-window--show-arrows-on-hover---next-transform` | `translateX(200%)` |
| `--origam-window--show-arrows-on-hover---hover-transform` | `translateX(0)` |

## Accessibility

- Prev / next buttons receive an `aria-label` from the locale (default
  `origam.carousel.prev` / `origam.carousel.next`).
- The active item is the only one rendered in the DOM transition phase;
  screen readers see one slide at a time.
- Pair `direction="horizontal"` with `prefers-reduced-motion` and bind
  `:transition="false"` on items if the user opted out of motion.

## Related

- `OrigamWindowItem` — the slide primitive consumed by `<OrigamWindow>`.
