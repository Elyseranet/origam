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

### `border` on the default (non-outlined) variant

The `border` shorthand also works standalone, without `variant="outlined"` —
`true` (or the `'thin'` / `'thick'` utility keywords) paints all four sides;
`'top'` / `'right'` / `'bottom'` / `'left'` paints a single edge only:

```vue
<template>
    <OrigamBtn border           text="All sides (1px)" />
    <OrigamBtn border="thin"    text="Thin (1px)" />
    <OrigamBtn border="thick"   text="Thick (2px)" />
    <OrigamBtn border="none"    text="Explicit opt-out (0)" />
    <OrigamBtn border="top"     text="Top only" />
    <OrigamBtn border="bottom"  text="Bottom only" />
    <OrigamBtn :border="4"      text="Numeric (4px)" />
    <OrigamBtn border="2px dashed" text="Free-form string" />
</template>
```

Measured widths (Chromium, default theme):

| value | rendered |
|---|---|
| *(prop absent)* | `0px` |
| `border="none"` | `0px` |
| `border` (boolean) | `1px` |
| `border="thin"` | `1px` |
| `border="thick"` | `2px` |
| `border="top"` | `1px` top, `0` elsewhere |
| `:border="4"` | `4px` |
| `border="2px dashed"` | `2px dashed` |

Width is resolved per physical side
(`--origam-btn---border-{top,right,bottom,left}-width`, each falling back to
the general `--origam-btn---border-width` token), so a direction only ever
paints the side it names — the other three stay at `0`.

::: warning Why the width keywords need a component-scoped rule (#391)
`useBorder` emits the global `.origam--border-{none,thin,thick}` utility for
these keywords, but **the utility alone cannot paint here**. A Vue scoped rule
(`.origam-btn[data-v-hash]`) has specificity (0,2,0); a utility
(`.origam--border-thick`) has (0,1,0), so the component's own
`border-*-width` declaration outranks it *regardless of which sheet loads
last* — this is specificity, not order. Measured before the fix:
`border="thick"` painted `1px`, and `border="none"` painted `1px` instead of
cancelling.

So the component also emits `origam-btn--border-{keyword}`, and
`OrigamBtn.vue` consumes it by writing `--origam-btn---border-width` — the
same custom property its base rule already reads. **The other 42 components
that consume `useBorder` do not yet carry these rules**, so `border="thick"`
still renders as `thin` there; they now receive the class, which is inert
until each grows the matching rule (or until the DS-wide cascade decision
in #391 / #514 is taken).
:::

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
| `click`          | `MouseEvent`         | Standard button click. Fires for `<a>` tags too. |
| `click:prepend`  | `MouseEvent`         | Clicked the prepend slot. Stops propagation upstream. |
| `click:append`   | `MouseEvent`         | Clicked the append slot. |
| `group:selected` | `{ value: boolean }` | The button's selection inside its group changed — `value` is the new state. Only fires when the button is registered in a group. `<OrigamBtnToggle>` is the only component that provides one (`ORIGAM_BTN_TOGGLE_KEY`) — `<OrigamBtnGroup>` is purely visual and does not. A button outside a toggle calls `useGroupItem(…, false)`, gets `null`, and never registers the watcher, so nothing is ever emitted. Inside one, the emit comes from `useGroupItem`'s `watch(isSelected, …)`, so a programmatic change to the toggle's `modelValue` fires it exactly like a click. |

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

> `fontFamily` was removed from `IBtnProps` (issue #501): the component's SCSS
> has no `font-family` rule, and `fontFamily` is a project-level setting
> configured once on `OrigamApp` — not a per-instance override. Use
> `fontFamily` on text components (`OrigamTitle`, `OrigamCode`, …) where it
> still has an effect.

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

`<OrigamBtn>` reads its variables from
`packages/ds/src/assets/css/tokens/light.css` and `dark.css` (SCSS twins
under `packages/ds/src/assets/scss/tokens/`) — the `--origam-btn---*`
prefix (and `--origam-btn-group---*` when grouped). Override at the
document root or via a `:style` binding to re-skin a single instance.

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

The full list lives in `packages/ds/src/assets/css/tokens/light.css` and
`dark.css` — grep for `--origam-btn`.

## Accessibility

- ✅ Full keyboard support (Enter, Space).
- ✅ `aria-busy="true"` while a loader is active (any `loading` kind —
  skeleton, line or circular). Absent when idle, so no `aria-busy="false"`
  is added to the accessibility tree.
- ✅ Focus ring uses `--origam-color__border---focus` (theme-aware).
- ⚠️ `disabled` is conveyed **differently per tag**, on purpose:
  - `tag="button"` (the default) gets the **native `disabled` attribute**.
    No `aria-disabled` is emitted — it would be redundant, and the ARIA
    spec's first rule is that a native element beats an ARIA attribute.
  - `tag="a"` has no native `disabled`, so the anchor gets
    `aria-disabled="true"` and its `href` is dropped instead.
- ⚠️ **Icon-only mode needs an `aria-label` you supply yourself.** The
  component does **not** derive one from the `icon` prop, and there is no
  `ariaLabel` prop: an icon name (`mdi-content-save`) is an identifier, not
  a translated human label, so auto-filling it would produce exactly the
  "bad ARIA" the W3C tells you is worse than none. Pass it through — it
  falls through to the root element with the rest of `$attrs`:

  ```vue
  <origam-btn icon="mdi-content-save" :aria-label="t('btn_save', 'Save')"/>
  ```

## Theming notes

- The component is **theme-aware out of the box**. Switching
  `<html data-theme="dark">` re-resolves every variable instantly —
  no Vue re-render required.
- A sub-tree can opt into a different theme via `<OrigamThemeProvider>`.

## Related

- `OrigamBtnGroup` — segmented control / toolbar group.
- `OrigamBtnToggle` — single-pick or multi-pick toggle group.
- `useColorEffect` — composable that drives the intent → token resolution.
