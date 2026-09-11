# OrigamOverlay

`<OrigamOverlay>` is the **base layer** every floating surface composes
on top of. It owns the activator wiring, scrim, scroll/location
strategies, focus restoration, and ESC/back-button handling.

`<OrigamDialog>`, `<OrigamMenu>`, `<OrigamTooltip>`, `<OrigamDrawer>`
all wrap this primitive. You rarely instantiate it directly — but when
you do, it provides the full toolbox.

## Basic usage

```vue
<template>
    <OrigamOverlay v-model="open">
        <template #activator="{ props }">
            <OrigamBtn v-bind="props">Open overlay</OrigamBtn>
        </template>

        <OrigamSheet rounded elevation="8" style="padding: 24px;">
            Hello from the overlay.
        </OrigamSheet>
    </OrigamOverlay>
</template>
```

## Scrim variants

`scrim` accepts a boolean (default `true`) or a CSS-color / intent
string for a custom backdrop tint.

```vue
<template>
    <OrigamOverlay v-model="open" :scrim="false">…</OrigamOverlay>
    <OrigamOverlay v-model="open" scrim="primary">…</OrigamOverlay>
    <OrigamOverlay v-model="open" scrim="rgba(255, 0, 128, .4)">…</OrigamOverlay>
</template>
```

## Persistent

Pass `persistent` to ignore outside-clicks and ESC. The overlay plays a
small "shake" animation instead of closing.

```vue
<template>
    <OrigamOverlay v-model="open" persistent>…</OrigamOverlay>
</template>
```

## Disabled

While `disabled`, the model can never flip to `true`. Useful while a
form is loading or a feature flag is off.

```vue
<template>
    <OrigamOverlay v-model="open" :disabled="loading">…</OrigamOverlay>
</template>
```

## Contained

`contained` restricts the overlay (and its scrim) to the nearest
positioned ancestor instead of `<body>`. Pair with a host that has
`position: relative` and a fixed size.

```vue
<template>
    <div style="position: relative; height: 240px;">
        <OrigamOverlay v-model="open" contained>…</OrigamOverlay>
    </div>
</template>
```

## Z-index stack

Pass an explicit `zIndex` to override the auto-stacked value. Stacking
between sibling overlays is otherwise handled by `useStack`.

```vue
<template>
    <OrigamOverlay v-model="open" :z-index="3000">…</OrigamOverlay>
</template>
```

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `activator` | `{ isActive, props }` | Element that toggles the overlay. Spread `props` onto it (or any clickable). |
| `default` | `{ isActive }` | Floating content. |

## Events

| Name | Payload | When |
|---|---|---|
| `update:modelValue` | `boolean` | Open / close. |
| `click:outside`     | `MouseEvent` | A click landed outside the content. |
| `afterEnter` | — | After the enter transition completes. |
| `afterLeave` | — | After the leave transition completes. |
| `keydown` | `KeyboardEvent` | Forwarded keydown while the overlay is open. |

## Props (interface)

```ts
interface IOverlayProps extends ICommonsComponentProps, IDimensionProps,
    IActivatorProps, ILocationStrategyProps, IScrollStrategyProps,
    ILazyProps, ITransitionComponentProps, IScrimProps {
    absolute?: boolean
    attach?: boolean | string | Element
    closeOnBack?: boolean
    contentClass?: string | Array<string>
    contentProps?: any
    disabled?: boolean
    noClickAnimation?: boolean
    modelValue?: boolean
    zIndex?: number | string
    disableGlobalStack?: boolean
    persistent?: boolean
}
```

## Anatomy

```html
<!-- placed by Teleport into <body> by default -->
<div class="origam-overlay [origam-overlay--active]
            [origam-overlay--absolute] [origam-overlay--contained]">
    <div class="origam-scrim"></div>             <!-- backdrop -->
    <div class="origam-overlay__content">…</div> <!-- floating content -->
</div>
```

## Design tokens consumed

`<OrigamOverlay>` reads from `tokens/component/overlay.json`. The
content layer is intentionally transparent — the surface inside the
default slot owns its own chrome (`<OrigamSheet>`, `<OrigamCard>`).

| CSS variable | Token reference |
|---|---|
| `--origam-overlay---display` | `flex` |
| `--origam-overlay---position` | `fixed` |
| `--origam-overlay---border-radius` | `inherit` |
| `--origam-overlay---pointer-events` | `none` |
| `--origam-overlay---z-index` | `{zIndex.overlay}` |
| `--origam-overlay---transition-duration` | `{motion.duration.medium}` |
| `--origam-overlay---transition-easing` | `{motion.easing.standard}` |
| `--origam-overlay__scrim---background-color` | `{color.overlay.scrim}` (pending arbitrage #2) |
| `--origam-overlay__scrim---opacity` | `{opacity.32}` |
| `--origam-overlay__scrim---pointer-events` | `auto` |

## Accessibility

- The overlay does not assume a role — wrap your floating content in a
  semantic container (`<dialog>` via `<OrigamDialog>`, `role="menu"`,
  …) when its purpose demands it.
- Keyboard support: `ESC` closes the top-most overlay (unless
  `persistent`). Focus is returned to the activator on close.
- Outside-click closes by default. Add `persistent` for confirmation
  flows where users must explicitly choose an action.
- The scrim element is `aria-hidden` by virtue of being decorative —
  do not place readable content inside it.

## Theming notes

- Override `--origam-overlay__scrim---*` to tint the backdrop; the
  whole rule is scoped, so inline `:style` works for per-instance
  customisation.
- The transition can be swapped via the `transition` prop (any
  origam-transition component or a string name).

## Related

- `OrigamOverlayScrim` — standalone backdrop layer.
- `OrigamDialog`, `OrigamMenu`, `OrigamTooltip`, `OrigamDrawer` —
  consumers built on top of `<OrigamOverlay>`.
