# OrigamPicker

`<OrigamPicker>` is the **base shell** shared by every picker variant
(`<OrigamColorPicker>`, `<OrigamDatePicker>`, …). It composes
`<OrigamSheet>` and lays out three optional regions on a CSS grid:
`title`, `header`, and `body` (plus an `actions` row when the slot is
provided).

The component itself is presentation-only — concrete pickers feed it
content through slots and props. It carries no state.

## Basic usage

```vue
<template>
    <OrigamPicker title="Pick a date">
        <p>Picker body content here.</p>
    </OrigamPicker>
</template>
```

## With every region populated

```vue
<template>
    <OrigamPicker title="Pick a color">
        <template #header>
            <strong>Header zone</strong>
        </template>

        Body content (default slot).

        <template #actions>
            <OrigamBtn variant="text">Cancel</OrigamBtn>
            <OrigamBtn>Save</OrigamBtn>
        </template>
    </OrigamPicker>
</template>
```

## Hide the header region

```vue
<template>
    <OrigamPicker hide-header>
        Bodyless picker
    </OrigamPicker>
</template>
```

## Landscape layout

The landscape modifier rearranges the grid so the title and header sit
to the left, with the body (and actions) on the right. Useful for the
classic two-pane date picker.

```vue
<template>
    <OrigamPicker title="Pick a date" landscape>
        <template #header>
            <em>Selected: 2026-04-27</em>
        </template>
        Body
    </OrigamPicker>
</template>
```

## Title slot override

```vue
<template>
    <OrigamPicker>
        <template #title>
            <OrigamPickerTitle title="Custom title"/>
        </template>
        Body
    </OrigamPicker>
</template>
```

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `title`   | — | Replaces the auto-rendered `<OrigamPickerTitle>` from the `title` prop. |
| `header`  | — | Optional region between the title and the body. |
| `default` | — | Picker body. |
| `actions` | — | Footer row (typically `OrigamBtn`s aligned to the end). When used, the layout grows a fourth grid row. |

## Props (interface)

```ts
interface IPickerProps extends ICommonsComponentProps, IColorProps,
    ISheetProps, IBorderProps, IPaddingProps, IMarginProps,
    IElevationProps, IRoundedProps, IPickerTitleProps {
    landscape?: boolean
    hideHeader?: boolean
}
```

The full sheet API (`color`, `bgColor`, `elevation`, `rounded`,
`width`, `height`, `tag`, `border`, …) is forwarded through the inner
`<OrigamSheet>`.

## Anatomy

```html
<div class="origam-sheet origam-picker [origam-picker--landscape]
            [origam-picker--has-actions]">
    <div>
        <div class="origam-picker__title">…</div>      <!-- optional -->
        <div class="origam-picker__header">…</div>     <!-- optional -->
    </div>
    <div class="origam-picker__body">…</div>
    <div class="origam-picker__actions">…</div>        <!-- optional -->
</div>
```

The grid template flips between portrait and landscape:

| Mode | `grid-template-areas` |
|---|---|
| Portrait, no actions | `"title" "header" "body"` |
| Portrait, with actions | `"title" "header" "body" "actions"` |
| Landscape, no actions | `"title" "header body" "header body"` |
| Landscape, with actions | `"title" "header body" "header actions"` |

## Design tokens consumed

`<OrigamPicker>` reads from `tokens/component/picker.json`. Override at
the document root or via a `:style` binding to re-skin a single
instance.

| CSS variable | Token reference |
|---|---|
| `--origam-picker---background-color` | `{color.surface.raised}` |
| `--origam-picker---color` | `{color.text.primary}` |
| `--origam-picker---border-color` | `{color.border.subtle}` |
| `--origam-picker---border-width` | `{border.width.thin}` |
| `--origam-picker---border-radius` | `{radius.md}` |
| `--origam-picker---box-shadow` | `{shadow.lg}` |
| `--origam-picker---padding-block` | `{space.4}` |
| `--origam-picker---padding-inline` | `{space.4}` |
| `--origam-picker---min-width` | `320px` |
| `--origam-picker---max-width` | `100vw` |
| `--origam-picker---z-index` | `{zIndex.dropdown}` |
| `--origam-picker---transition-duration` | `{motion.duration.medium}` |
| `--origam-picker---transition-timing-function` | `{motion.easing.standard}` |

## Accessibility

- The picker shell is a presentational container. Map the appropriate
  ARIA pattern (`role="dialog"`, `aria-labelledby`, focus management)
  on the parent that owns the picker semantics — for example the
  `<OrigamColorPicker>` or `<OrigamDatePicker>`.
- The auto-rendered title is rendered as a `<div>`. Promote it to a
  heading via the `<OrigamPickerTitle tag="h2">` slot when the picker
  is placed in a region that benefits from a heading hierarchy.

## Theming notes

- All visual properties resolve from CSS variables — switching
  `<html data-theme="…">` re-skins picker instantly.
- Pickers compose `<OrigamSheet>`, so the same chrome props (border,
  rounded, elevation) apply transparently.

## Related

- `OrigamPickerTitle` — header title slot.
- `OrigamSheet` — chrome surface composed by the picker.
- `OrigamColorPicker`, `OrigamDatePicker` — concrete picker variants
  (delivered in later lots).
