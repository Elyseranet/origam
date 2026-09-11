# OrigamBtn

`<OrigamBtn>` is the polymorphic action element for origam. It renders a
`<button>`, an `<a>`, or any other tag (`tag` prop) and exposes the full
intent / variant / size / density mixin set.

## Basic usage

```vue
<template>
    <OrigamBtn text="Click me" />
</template>
```

## Variants

```vue
<template>
    <div class="demo-row">
        <OrigamBtn variant="flat"     text="Flat" />
        <OrigamBtn variant="elevated" text="Elevated" />
        <OrigamBtn variant="tonal"    text="Tonal" />
        <OrigamBtn variant="outlined" text="Outlined" />
        <OrigamBtn variant="text"     text="Text" />
        <OrigamBtn variant="plain"    text="Plain" />
    </div>
</template>
```

## Color (intent)

Origam v2 only accepts **semantic intent** values for `color` (raw hex still
works but emits a deprecation warning — full removal in v3.0.0).

```vue
<template>
    <div class="demo-row">
        <OrigamBtn color="primary"   text="Primary" />
        <OrigamBtn color="secondary" text="Secondary" />
        <OrigamBtn color="ghost"     text="Ghost" />
        <OrigamBtn color="success"   text="Success" />
        <OrigamBtn color="danger"    text="Danger" />
        <OrigamBtn color="warning"   text="Warning" />
        <OrigamBtn color="info"      text="Info" />
    </div>
</template>
```

For one-off custom colors, use a `:style` binding instead of `color`:

```vue
<OrigamBtn :style="{ '--origam-btn---background-color': '#7c3aed' }" text="Custom" />
```

## Sizes

```vue
<template>
    <div class="demo-row">
        <OrigamBtn size="x-small" text="X-Small" />
        <OrigamBtn size="small"   text="Small" />
        <OrigamBtn size="default" text="Default" />
        <OrigamBtn size="large"   text="Large" />
        <OrigamBtn size="x-large" text="X-Large" />
    </div>
</template>
```

## Density

```vue
<template>
    <div class="demo-row">
        <OrigamBtn density="compact"     text="Compact" />
        <OrigamBtn density="default"     text="Default" />
        <OrigamBtn density="comfortable" text="Comfortable" />
    </div>
</template>
```

## Icons (prepend / append)

```vue
<template>
    <OrigamBtn prepend-icon="mdi-account" text="Profile" />
    <OrigamBtn append-icon="mdi-arrow-right" text="Next" />
    <OrigamBtn icon="mdi-heart" />  <!-- icon-only -->
</template>
```

## States

```vue
<template>
    <OrigamBtn disabled text="Disabled" />
    <OrigamBtn loading  text="Loading…" />
    <OrigamBtn readonly text="Readonly" />
    <OrigamBtn active   text="Active" />
</template>
```

## Modifiers

```vue
<template>
    <OrigamBtn block text="Full-width" />
    <OrigamBtn slim  text="Tight padding" />

    <!-- Stacked: icon above the label -->
    <OrigamBtn stacked prepend-icon="mdi-heart" text="Stacked" />

    <!-- Rounded radius variants -->
    <OrigamBtn rounded text="Rounded" />
</template>
```

## Border customization

The `outlined` and `ghost` variants expose a customizable border. Beyond
the `border` shorthand (inherited from `IBorderProps`), the standalone
`borderColor` and `borderStyle` props override only the colour or the
line-style without restating the width — the width stays theme-driven.

```vue
<template>
    <OrigamBtn variant="outlined" border-color="tomato"   text="Custom color" />
    <OrigamBtn variant="outlined" border-style="dashed"   text="Dashed" />
    <OrigamBtn variant="outlined" border-color="rebeccapurple" border-style="dotted" text="Both" />
</template>
```

The outlined variant resolves its colour from
`var(--origam-btn---border-color, currentColor)`, so per-instance overrides
work via the prop, a token, or an inline `--origam-btn---border-color`.

## Polymorphic tag

```vue
<template>
    <!-- Renders as <a href="…"> -->
    <OrigamBtn tag="a" href="/docs" text="Docs" />

    <!-- Renders as a router-link automatically when `to` is set -->
    <OrigamBtn :to="{ name: 'home' }" text="Home" />
</template>
```

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Override the inner content entirely. |
| `prepend` | — | Replace the prepend icon / avatar slot. |
| `append`  | — | Replace the append icon / avatar slot. |
| `loader`  | `progressProps` | Replace the spinner shown when `loading` is true. |
| `wrapper` | — | Replace EVERYTHING inside the button (advanced). |

```vue
<template>
    <OrigamBtn>
        <template #prepend>
            <OrigamIcon icon="mdi-heart" />
        </template>

        Full custom <strong>content</strong>

        <template #append>
            <OrigamIcon icon="mdi-arrow-right" />
        </template>
    </OrigamBtn>
</template>
```

## Emits

| Event           | Payload      | Description |
|-----------------|--------------|-------------|
| `click`         | `MouseEvent` | Standard button click. Fires for `<a>` tags too. |
| `click:prepend` | `MouseEvent` | Clicked the prepend slot. Stops propagation upstream. |
| `click:append`  | `MouseEvent` | Clicked the append slot. |

```vue
<template>
    <OrigamBtn
        prepend-icon="mdi-close"
        text="Cancel"
        @click="onCancel"
        @click:prepend="onCloseIcon"
    />
</template>
```

## Props (interface)

```ts
interface IBtnProps extends ICommonsComponentProps,
    IColorProps, IBorderProps, IDensityProps, IDimensionProps,
    IElevationProps, IRoundedProps, ITagProps, ISizeProps,
    ILinkProps, IRippleProps, ILoaderProps, IPositionProps,
    ILocationProps, IGroupItemProps, IPaddingProps, IMarginProps,
    IAdjacentProps, IStatusProps, IHoverProps, ITypographyProps {
    active?: boolean
    flat?: boolean
    icon?: boolean | TIcon
    block?: boolean
    slim?: boolean
    stacked?: boolean
    text?: string
}
```

### Typography

The font props come from the shared `ITypographyProps` surface (wired by the
`useTypography` composable). Each one re-points the matching `--origam-btn---*`
variable at a primitive font token, so a single button can override its theme
typography without custom CSS. Unset props keep the theme / size value.

| Prop | Type | Default | Description |
|---|---|---|---|
| `fontSize` | `TFontSize` | — | Sets `--origam-btn---font-size` to `var(--origam-font__size---{fontSize})` (xs → 5xl). Overrides the `size`-variant font-size when set. |
| `fontWeight` | `TFontWeight` | — | Sets `--origam-btn---font-weight` to `var(--origam-font__weight---{fontWeight})` (regular 400 → black 900). |
| `lineHeight` | `TLineHeight` | — | Sets `--origam-btn---line-height` to `var(--origam-font__lineHeight---{lineHeight})` (none 1 → loose 2). |
| `letterSpacing` | `TLetterSpacing` | — | Sets `--origam-btn---letter-spacing` to `var(--origam-font__letterSpacing---{letterSpacing})` (tight → widest). |

> `fontFamily` is part of the surface but has no effect on `<OrigamBtn>`: the
> component's SCSS has no `font-family` rule (buttons inherit the page font by
> design). Use `fontFamily` on text components (`OrigamTitle`, `OrigamCode`, …).

## Anatomy

```html
<button class="origam-btn origam-btn--{intent} origam-btn--size-{size}">
    <span class="origam-btn__overlay" />   <!-- hover/focus tint -->
    <span class="origam-btn__underlay" />  <!-- elevation shadow -->

    <span class="origam-btn__loader">
        <span class="origam-btn__prepend">
            <!-- prepend icon / avatar / slot -->
        </span>

        <span class="origam-btn__content">
            <!-- text or default slot -->
        </span>

        <span class="origam-btn__append">
            <!-- append icon / avatar / slot -->
        </span>
    </span>
</button>
```

## Design tokens consumed

`<OrigamBtn>` reads from `tokens/component/btn.json` (and
`btn-group.json` when grouped). Override at the document root or via
a `:style` binding to re-skin a single instance.

| CSS variable | Token reference |
|---|---|
| `--origam-btn---background-color` | `{color.action.secondary.bg}` |
| `--origam-btn---color` | `{color.action.secondary.fg}` |
| `--origam-btn---background-color-hover` | `{color.action.secondary.bgHover}` |
| `--origam-btn---border-radius` | `{radius.sm}` |
| `--origam-btn---border-color` | `currentColor` (outlined variant; overridable via `borderColor` prop) |
| `--origam-btn---border-color-ghost` | `color-mix(currentColor 24%)` (ghost variant) |
| `--origam-btn---font-size` | `{font.size.md}` |
| `--origam-btn---font-weight` | `{font.weight.medium}` |
| `--origam-btn---transition-duration` | `{motion.duration.slow}` |
| `--origam-btn--{intent}---background-color` | `{color.action.{intent}.bg}` |

The full list lives in
`tokens/component/btn.json`.

## Accessibility

- ✅ Full keyboard support (Enter, Space).
- ✅ `aria-disabled` mirrors the `disabled` prop.
- ✅ `aria-busy` set while `loading` is true.
- ✅ Focus ring uses `--origam-color__border---focus` (theme-aware).
- ✅ Icon-only mode requires an `aria-label`; the component falls
  back to `aria-label` from the `icon` prop's name when none is set.

## Theming notes

- The component is **theme-aware out of the box**. Switching
  `<html data-theme="dark">` re-resolves every variable instantly —
  no Vue re-render required.
- A sub-tree can opt into a different theme via `<OrigamThemeProvider>`.

## Related

- `OrigamBtnGroup` — segmented control / toolbar group.
- `OrigamBtnToggle` — single-pick or multi-pick toggle group.
- `useColorEffect` — composable that drives the intent → token resolution.
