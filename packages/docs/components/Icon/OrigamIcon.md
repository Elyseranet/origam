# OrigamIcon

`<OrigamIcon>` is the **polymorphic dispatcher** at the heart of the icon
family. It receives any of the supported icon notations and renders the
matching leaf component automatically:

| Input shape | Resolves to | Rendered as |
|---|---|---|
| `'mdi:mdi-home'` (set-prefixed string) | `OrigamClassIcon` (via the registered set) | `<i class="mdi mdi-home">` |
| `'mdi-home'` (default-set fallback) | `OrigamClassIcon` | `<i class="mdi mdi-home">` |
| `'$success'` (alias) | `OrigamClassIcon` (alias resolved) | `<i class="mdi mdi-check-circle">` |
| `'M12 …'` (single SVG path) | `OrigamSvgIcon` | inline `<svg><path d>` |
| `[...]` (array of paths) | `OrigamSvgIcon` | inline `<svg>` with multiple `<path>` |
| Vue component (e.g. lucide / hugeicons) | `OrigamComponentIcon` | wrapper `<div>` + inner component |

`OrigamIcon` is also the only place the **icon mixin set** is wired
(`useBothColor`, `useBorder`, `usePadding`, `useMargin`, `useSize`). The
leaf components only carry sizing (numeric override + named class).

## Basic usage

```vue
<template>
    <!-- Material Design Icons font set (default) -->
    <OrigamIcon icon="mdi-heart" />

    <!-- Explicit set prefix -->
    <OrigamIcon icon="mdi:mdi-account" />

    <!-- Aliased icon -->
    <OrigamIcon icon="$success" />

    <!-- Inline SVG path -->
    <OrigamIcon icon="M12 2 L17 8 …" />

    <!-- Vue component icon -->
    <OrigamIcon :icon="LucideHomeIcon" />
</template>
```

## Sizes

Five named tiers are mapped to the typographic scale tokens:

```vue
<template>
    <OrigamIcon icon="mdi-home" size="x-small" />  <!-- font.size.xs -->
    <OrigamIcon icon="mdi-home" size="small"   />  <!-- font.size.sm -->
    <OrigamIcon icon="mdi-home" size="default" />  <!-- font.size.md -->
    <OrigamIcon icon="mdi-home" size="large"   />  <!-- font.size.lg -->
    <OrigamIcon icon="mdi-home" size="x-large" />  <!-- font.size.xl -->

    <!-- Numeric override (pixels) -->
    <OrigamIcon icon="mdi-home" :size="48" />
</template>
```

## Color (intent)

Icons inherit `currentColor` by default — set the color on any ancestor and
the icon picks it up. For an explicit override, use `color` / `bgColor`:

```vue
<template>
    <OrigamIcon icon="mdi-alert"   color="danger" />
    <OrigamIcon icon="mdi-check"   color="success" />
    <OrigamIcon icon="mdi-info"    color="info" />
    <OrigamIcon icon="mdi-warning" color="warning" />
</template>
```

For a one-off custom colour, use a `:style` binding instead of a raw hex:

```vue
<OrigamIcon
    icon="mdi-heart"
    :style="{ '--origam-icon---color': '#e91e63' }"
/>
```

## Polymorphic tag

```vue
<template>
    <!-- Default — <i> for class-icons, <div> for SVG/component/ligature -->
    <OrigamIcon icon="mdi-home" />

    <!-- Force a different tag -->
    <OrigamIcon icon="mdi-home" tag="span" />
</template>
```

## Click handler (button mode)

When `OrigamIcon` receives an `@click` listener it switches to button
semantics: `role="button"`, `cursor: pointer`, no `aria-hidden`.

```vue
<template>
    <OrigamIcon
        icon="mdi-close"
        aria-label="Close"
        @click="onClose"
    />
</template>
```

## Slots

| Slot | Description |
|---|---|
| `default` | Override the icon by passing its **string name** as the slot's text content. Useful for `<OrigamIcon>$success</OrigamIcon>`. |

## Props (interface)

```ts
interface IIconComponentProps extends IIconProps,
    IColorProps, ICommonsComponentProps, ITagProps,
    ISizeProps, IPaddingProps, IMarginProps, IBorderProps {
    disabled?: boolean
}

interface IIconProps {
    icon?: TIcon
}

type TIcon =
    | string
    | Array<(string | [path: string, opacity: number])>
    | Component
```

## Anatomy

```html
<!-- Class icon (mdi/fa) -->
<i class="origam-icon origam-icon--size-default mdi mdi-home"></i>

<!-- SVG icon -->
<div class="origam-icon origam-icon--svg origam-icon--size-default">
    <svg class="origam-icon__svg" viewBox="0 0 24 24">
        <path d="…" />
    </svg>
</div>

<!-- Ligature icon -->
<div class="origam-icon origam-icon--ligature origam-icon--size-default">home</div>

<!-- Component icon (Vue component) -->
<div class="origam-icon origam-icon--component origam-icon--size-default">
    <!-- inner Vue component -->
</div>
```

## Design tokens consumed

`<OrigamIcon>` reads from `tokens/component/icon.json`:

| CSS variable | Token reference |
|---|---|
| `--origam-icon---color` | `currentColor` |
| `--origam-icon---transition-duration` | `{motion.duration.fast}` |
| `--origam-icon---font-size-xs` | `{font.size.xs}` |
| `--origam-icon---font-size-sm` | `{font.size.sm}` |
| `--origam-icon---font-size-md` | `{font.size.md}` |
| `--origam-icon---font-size-lg` | `{font.size.lg}` |
| `--origam-icon---font-size-xl` | `{font.size.xl}` |

## Accessibility

- `aria-hidden="true"` is applied automatically when **no click handler** is
  registered — purely-decorative icons stay invisible to screen readers.
- When a click handler IS attached: `role="button"` + the consumer must
  provide `aria-label`.
- Inline SVG is rendered with `role="img"` + `aria-hidden="true"` (the
  outer wrapper is the announce target).

## Theming notes

- `currentColor` makes every icon **theme-aware** out of the box: switching
  `<html data-theme="dark">` re-resolves the cascading text colour and the
  icon follows. No Vue re-render required.
- For an explicit theme-driven colour override, use the matching token
  directly: `:style="{'--origam-icon---color': 'var(--origam-color__feedback--danger---fg)'}"`

## Related

- `OrigamClassIcon` — the `mdi-` / `fa-` font-class leaf.
- `OrigamSvgIcon` — inline SVG path leaf.
- `OrigamComponentIcon` — Vue-component wrapper leaf.
- `OrigamLigatureIcon` — Material-style ligature leaf.
- `useIcon` — composable that powers the dispatch.
