# OrigamSheet

`<OrigamSheet>` is the generic chrome surface — a styled, theme-aware
container with the full origam mixin set (border, rounded, elevation,
position, dimension, padding, margin, color). Most "panel-like"
components (`<OrigamCard>`, `<OrigamDialog>`, …) ultimately compose
from `<OrigamSheet>`, but it is also exposed standalone for one-off
needs.

## Basic usage

```vue
<template>
    <OrigamSheet>
        Hello
    </OrigamSheet>
</template>
```

## Color (intent)

```vue
<template>
    <OrigamSheet color="primary">Tinted text</OrigamSheet>
    <OrigamSheet bg-color="primary">Tinted background</OrigamSheet>
</template>
```

## Elevation

```vue
<template>
    <OrigamSheet :elevation="0">flat</OrigamSheet>
    <OrigamSheet :elevation="1">xs</OrigamSheet>
    <OrigamSheet :elevation="3">sm</OrigamSheet>
    <OrigamSheet :elevation="8">md</OrigamSheet>
    <OrigamSheet :elevation="16">lg</OrigamSheet>
    <OrigamSheet :elevation="24">xl</OrigamSheet>
</template>
```

## Rounded

```vue
<template>
    <OrigamSheet rounded="x-small">x-small</OrigamSheet>
    <OrigamSheet rounded="default">default</OrigamSheet>
    <OrigamSheet rounded="x-large">x-large</OrigamSheet>
</template>
```

## Position

```vue
<template>
    <OrigamSheet position="absolute" :top="0" :right="0">corner</OrigamSheet>
    <OrigamSheet position="sticky"   :top="0">sticky header</OrigamSheet>
</template>
```

## Dimension & location

```vue
<template>
    <OrigamSheet width="320" height="200">card-sized</OrigamSheet>
    <OrigamSheet location="top center">centred at the top</OrigamSheet>
</template>
```

## Modifiers

```vue
<template>
    <OrigamSheet border>Bordered</OrigamSheet>
    <OrigamSheet rounded border>Rounded + bordered</OrigamSheet>
</template>
```

## Polymorphic tag

```vue
<template>
    <OrigamSheet tag="article">…</OrigamSheet>
</template>
```

## Events

| Name | Payload | When |
|---|---|---|
| `update:snap` | `TSheetSnapId` | The gesture or `snapTo()` settles on a new snap point. |
| `update:open` | `boolean` | The sheet crosses the closed / non-closed boundary. |
| `update:active` | `boolean` | v-model companion of the `active` prop — emitted when the sheet **root is clicked**, and only then. |

> ⛔ **`update:active` is mouse-only.** The root binds `@click="onActive()"`
> and nothing else: there is no `keydown` handler, and the default `tag`
> is `div`, so no native element turns `Enter` / `Space` into a click.
> The toggle comes from `useStateFlag(props, { state: 'active' })`, not
> from a `useActive` composable — that name no longer exists. Setting
> `tag="button"` would make the root keyboard-activatable, at the cost of
> nesting the drag handle's `<button>` inside another button, which is
> invalid HTML. If you need a keyboard path to the active state, drive
> `v-model:active` from your own control instead of relying on the sheet
> surface.

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Sheet content. |

## Props (interface)

```ts
interface ISheetProps extends ITagProps, ICommonsComponentProps,
    IPaddingProps, IMarginProps, IColorProps, IBgColorProps, IBorderProps,
    IRoundedProps, IElevationProps, IDimensionProps,
    ILocationProps, IPositionProps, IActiveProps, IHoverProps {
    side?: TDirectionBoth                     // 'bottom' unlocks the swipe
    swipeable?: boolean                       // default false
    snapPoints?: ReadonlyArray<TSheetSnapPoint>
    defaultSnap?: TSheetSnapId                // default 'half'
    open?: boolean                            // v-model:open
    disabled?: boolean                        // default false
    persistent?: boolean                      // default false
    handleLabel?: string                      // locale key, default 'origam.sheet.handle.aria_label'
}
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `side` | `TDirectionBoth` | — | Anchored edge. `'bottom'` is the only side that enables the swipe gesture and renders the handle. |
| `swipeable` | `boolean` | `false` | Enables the drag gesture. Combined with `side="bottom"`, renders the handle. |
| `snapPoints` | `ReadonlyArray<TSheetSnapPoint>` | closed / peek / half / full | Custom snap ladder. |
| `defaultSnap` | `TSheetSnapId` | `'half'` | Snap applied on mount. |
| `open` | `boolean` | — | Two-way via `v-model:open`; maps onto the closed/open snap semantics. |
| `disabled` | `boolean` | `false` | Freezes the gesture. |
| `persistent` | `boolean` | `false` | Prevents collapsing to `closed` — falls back to the smallest non-zero snap. |
| `handleLabel` | `string` | `'origam.sheet.handle.aria_label'` | **Locale key**, not final text, for the drag handle's accessible name. See [Accessibility](#accessibility). |
| `bgColor` | `TColor` | — | Background colour of the sheet surface (`useBothColor`, alongside `color`). |
| `hover` | `boolean \| IStateEffectConfig` | — | `true` forces the hover state on; an object overrides the resting design props while the pointer is over the sheet (`@mouseenter` / `@mouseleave` on the root). |
| `hoverClass` | `string` | — | Class applied while hovered. |
| `active` | `boolean \| IStateEffectConfig` | — | Same grammar, for the active state. Toggled by clicking the sheet root — see the note under **Events**. |
| `activeClass` | `string` | — | Class applied while active. |

## Anatomy

```html
<div class="origam-sheet [origam-sheet--border] [origam-sheet--rounded]
            [origam-sheet--{position}]">
    <!-- default slot -->
</div>
```

## Design tokens consumed

`<OrigamSheet>` reads its variables from
`packages/ds/src/assets/css/tokens/light.css` and `dark.css` (SCSS twins
under `packages/ds/src/assets/scss/tokens/`). Override at the document
root or via a `:style` binding to re-skin a single instance.

| CSS variable | Declared value |
|---|---|
| `--origam-sheet---position` | `relative` |
| `--origam-sheet---display` | `block` |
| `--origam-sheet---box-sizing` | `border-box` |
| `--origam-sheet---background` | `var(--origam-color__surface---default)` |
| `--origam-sheet---color` | `var(--origam-color__text---primary)` |
| `--origam-sheet---backdrop-filter` | `none` |
| `--origam-sheet---box-shadow` | `var(--origam-shadow---none)` |
| `--origam-sheet---border-style` | `solid` |
| `--origam-sheet---border-color` | `var(--origam-color__text---primary)` |
| `--origam-sheet---border-{top,right,bottom,left}-width` | `var(--origam-border__width---0)` |
| `--origam-sheet---border-{start,end}-{start,end}-radius` | `var(--origam-radius---none)` |
| `--origam-sheet---width` / `---max-width` | `100%` |
| `--origam-sheet---min-width` | `var(--origam-space---0)` |
| `--origam-sheet---height` / `---max-height` | `100%` |
| `--origam-sheet---min-height` | `var(--origam-space---0)` |
| `--origam-sheet---padding-{block,inline}-{start,end}` | `var(--origam-space---0)` |
| `--origam-sheet---margin-{block,inline}-{start,end}` | `var(--origam-space---0)` |
| `--origam-sheet--border---border-{top,right,bottom,left}-width` | `var(--origam-border__width---thin)` |
| `--origam-sheet--border---box-shadow` | `var(--origam-shadow---none)` |
| `--origam-sheet--rounded---border-radius` | `var(--origam-radius---sm)` |
| `--origam-sheet__swipeable---border-radius` | `var(--origam-radius---2xl)` |
| `--origam-sheet__bottom---snap-peek` | `120px` |
| `--origam-sheet__bottom---snap-half` | `50vh` |
| `--origam-sheet__bottom---snap-full` | `90vh` |
| `--origam-sheet__handle---width` | `32px` |
| `--origam-sheet__handle---height` | `4px` |
| `--origam-sheet__handle---color` | `var(--origam-color__border---subtle)` |
| `--origam-sheet__handle---border-radius` | `var(--origam-radius---full)` |
| `--origam-sheet__handle---margin-block` | `var(--origam-space---2)` |

> There is no single `--origam-sheet---border-width` or
> `---border-radius`: the border is declared per edge and the radius per
> corner. Overriding the shorthand name does nothing.
| `--origam-sheet---margin-block-start` | `{space.0}` |
| `--origam-sheet---margin-block-end` | `{space.0}` |
| `--origam-sheet---margin-inline-start` | `{space.0}` |
| `--origam-sheet---margin-inline-end` | `{space.0}` |
| `--origam-sheet--border---border-width` | `{border.width.thin}` |
| `--origam-sheet--border---box-shadow` | `{shadow.none}` |
| `--origam-sheet--rounded---border-radius` | `{radius.sm}` |

The full list lives in `packages/ds/src/assets/css/tokens/light.css` and
`dark.css` — grep for `--origam-sheet`.

## Accessibility

- Picks a presentational `<div>` by default — use a more meaningful
  `tag` (`article`, `section`, `aside`, `dialog`, …) when the sheet
  represents a discrete region.
- The component does not trap focus. If you build a dialog on top of
  `<OrigamSheet>`, layer a focus-trap composable on top.
- **The drag handle is a real `<button type="button">`**, not a `<div>`
  carrying `role="button"`. It is therefore focusable and exposed as a
  button to assistive technology from the element itself, with no
  `tabindex` to keep in sync with UA behaviour.
- **The handle answers the keyboard, not just the pointer (C6 a11y fix).**
  `useSheetSwipe` only wires `pointerdown` / `pointermove` / `pointerup`
  — until this fix a keyboard or switch-device user who tabbed to a
  button announced as operable got nothing from it, a WCAG 2.1.1
  violation. Focusing the handle and pressing a key now steps through
  the same discrete `snapPoints` the drag gesture commits to:

  | Key | Effect |
  |---|---|
  | <kbd>↑</kbd> | Next larger snap point |
  | <kbd>↓</kbd> | Next smaller snap point |
  | <kbd>Home</kbd> | Smallest snap point |
  | <kbd>End</kbd> | Largest snap point |

  Disabled via the `disabled` prop (or when the sheet isn't
  `swipeable` + `side="bottom"`, in which case the handle doesn't
  render at all).
- The handle's accessible name comes from the `handleLabel` prop, which
  carries a **locale key**, not final text — it is resolved through the DS
  `t()` mechanism and therefore follows the active locale. It defaults to
  `origam.sheet.handle.aria_label` (`"Drag handle"` / `"Poignée de
  déplacement"`).

  ```vue
  <!-- Default — announced in the active locale -->
  <OrigamSheet swipeable side="bottom" />

  <!-- Your own key, added to your locale files -->
  <OrigamSheet swipeable side="bottom" handle-label="editor.resize_panel" />
  ```

  A raw string matching no key is returned unchanged, so
  `handle-label="Resize the panel"` still works if you'd rather translate
  on your side. Redefining `origam.sheet.handle.aria_label` in your own
  messages changes it everywhere at once.
- The handle only renders when the sheet is both `swipeable` and
  `side="bottom"`; there is nothing to focus otherwise.

## Theming notes

- The component is theme-aware out of the box. Switching
  `<html data-theme="…">` re-resolves every variable instantly.
- A sub-tree can opt into a different theme via `<OrigamThemeProvider>`.

## Related

- `OrigamMain` — application-level main slot, similar API.
- `OrigamContainer` — outer wrapper with breakpoint-aware max-width.
