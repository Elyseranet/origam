# OrigamChip

`<OrigamChip>` is a compact element that represents an input, attribute, or action.
It renders as a `<span>` by default and supports labels, close buttons, filter icons,
pill shapes, draggable behaviour, and group selection via `OrigamChipGroup`.

## Basic usage

```vue
<template>
    <OrigamChip text="My chip" />
</template>
```

## Closable

Set `closable` to show a close icon. The chip emits `click:close` and hides itself
(`modelValue` becomes `false`) when the icon is clicked.

```vue
<template>
    <OrigamChip closable text="Closable" />
</template>
```

## Filter

Inside a `OrigamChipGroup`, passing `filter` reveals a check icon when the chip is
selected. The icon is driven by `filterIcon` (default: checkmark).

```vue
<template>
    <OrigamChipGroup v-model="selected" filter>
        <OrigamChip :value="1" filter text="Option A" />
        <OrigamChip :value="2" filter text="Option B" />
    </OrigamChipGroup>
</template>
```

## Shape — `pill` and `label`

**A chip is fully round by default.** The base rule is
`border-radius: var(--origam-chip---border-radius, 9999px)`, so
`<OrigamChip text="…"/>` is already a pill and needs no prop.

`label` is the **opt-out**: it switches to a rectangular chip
(`var(--origam-chip---border-radius-label, 4px)`) — useful for tags.

```vue
<template>
    <OrigamChip label text="Tag" />
</template>
```

`pill` is the **explicit opt-in**: it restores the full radius over anything
that squared it. On a chip that sets neither, `pill` changes nothing visible —
it is only load-bearing when it has to win against `label` or against a
`rounded` token.

```vue
<template>
    <!-- Identical rendering: round is the default. -->
    <OrigamChip text="Pill chip" />
    <OrigamChip pill text="Pill chip" />

    <!-- Here `pill` matters: it wins over `label`. -->
    <OrigamChip pill label text="Round despite label" />
</template>
```

⛔ `pill` does **not** remove the chip's inner horizontal padding. Earlier
revisions of this page said it did; no rule ever implemented that, and the
padding stays governed by the `--origam-chip---padding-{size}` tokens.

## Draggable

```vue
<template>
    <OrigamChip draggable text="Drag me" />
</template>
```

## Color

Pass any `TIntent` value via `color` or `bgColor`.

```vue
<template>
    <OrigamChip color="primary" text="Primary" />
    <OrigamChip color="success" text="Success" />
    <OrigamChip color="danger"  text="Danger"  />
</template>
```

## Size

```vue
<template>
    <OrigamChip size="x-small" text="XS" />
    <OrigamChip size="small"   text="S"  />
    <OrigamChip size="default" text="M"  />
    <OrigamChip size="large"   text="L"  />
    <OrigamChip size="x-large" text="XL" />
</template>
```

## Density

```vue
<template>
    <OrigamChip density="compact"      text="Compact"      />
    <OrigamChip density="default"      text="Default"      />
    <OrigamChip density="comfortable"  text="Comfortable"  />
</template>
```

## Prepend / Append icons

```vue
<template>
    <OrigamChip prepend-icon="mdi-account" text="Profile" />
    <OrigamChip append-icon="mdi-chevron-down" text="More" />
</template>
```

## Props

`IChipProps` layers eleven own props on top of sixteen Commons interfaces.
The tables below cover the whole surface.

### Content

| Prop | Type | Default | Description |
|---|---|---|---|
| `text` | `string` | — | Chip body. Overridden by the `#default` slot. |
| `tag` | `string` | `'span'` | Root element. Note: a purely clickable chip renders a real `<button>` regardless (#530). |
| `prependIcon` / `appendIcon` | `TIcon` | — | Icons on either side of the body (`IAdjacentProps`). |
| `prependAvatar` / `appendAvatar` | `string` | — | Avatar image URLs on either side (`IAdjacentProps`). |

### Shape

| Prop | Type | Default | Description |
|---|---|---|---|
| `pill` | `boolean` | `false` | Explicit full-radius opt-in. Round is already the default, so this only matters against `label` or a `rounded` token — see [Shape](#shape-pill-and-label). |
| `label` | `boolean` | `false` | Rectangular chip (`--origam-chip---border-radius-label`, `4px`). |
| `rounded` (+ per-corner) | `TRounded` | — | Radius token (`IRoundedProps`). Emits a utility class, which sits below the component's scoped rules in the cascade. |
| `border` (+ `borderColor`, `borderStyle`, per-edge) | `IBorderProps` | — | Border surface. |
| `elevation` | `TElevation` | — | Shadow token. |

### Colour

| Prop | Type | Default | Description |
|---|---|---|---|
| `color` | `TColor` | — | Foreground colour — intent token or raw CSS. |
| `bgColor` | `TColor` | — | Background colour. |

### Sizing

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `TSize \| number` | `'default'` | `x-small` → `x-large`. Each rung declares the chip's height, padding and font-size, so this default is load-bearing — without it no `--size-*` class is emitted and the chip collapses. |
| `density` | `TDensity` | — | Compacts the size rung. |
| `padding*` / `margin*` | `IPaddingProps` / `IMarginProps` | — | Spacing surface. |

### Behaviour

| Prop | Type | Default | Description |
|---|---|---|---|
| `modelValue` | `boolean` | `true` | Visibility. Set to `false` by the close button. |
| `closable` | `boolean` | `false` | Renders the close button. |
| `closeIcon` | `TIcon` | `'mdi:mdi-close-circle-outline'` | Icon inside the close button. |
| `closeLabel` | `string` | `'origam.close'` | i18n **key** for the close button's accessible name — not a literal string. |
| `filter` | `boolean` | `false` | Renders the selection check when the chip is selected in a group. |
| `filterIcon` | `TIcon` | `'mdi:mdi-check'` | Icon used by `filter`. |
| `draggable` | `boolean` | — | Native drag on the root. |
| `link` | `boolean` | — | Forces clickable behaviour without an `href` / `to`. `isClickable` is `!disabled && (belongs to a group \|\| link \|\| has a router target)`. |
| `href` / `to` / `replace` / `exact` | `ILinkProps` | — | Router / anchor target. A chip with any of these becomes clickable. |
| `value` / `disabled` / `selectedClass` | `IGroupItemProps` | — | Group membership inside `<OrigamChipGroup>`. |
| `ripple` | `boolean \| { class: string }` | — | Ripple on activation. |

### State effects

| Prop | Type | Default | Description |
|---|---|---|---|
| `hover` (+ `hoverClass`) | `boolean \| IStateEffectConfig` | — | Forced / configured hover appearance (`IHoverProps`). |
| `active` (+ `activeClass`) | `boolean \| IStateEffectConfig` | — | Decorative forced-highlight state (`IActiveProps`). Unrelated to `modelValue` and to group selection. |

### Host

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` / `class` / `style` | `ICommonsComponentProps` | — | Host identity and style passthrough. |

### Typography

| Prop         | Type        | Default | Description                                                                          |
|--------------|-------------|---------|--------------------------------------------------------------------------------------|
| `fontSize`   | `TFontSize` | —       | Font-size token (xs · sm · md · lg · xl · 2xl · 3xl · 4xl · 5xl). Sets `--origam-chip---font-size`. When unset the size-variant value stays in control. |
| `fontWeight` | `TFontWeight` | —     | Font-weight token (regular · medium · semibold · bold · extrabold · black). Sets `--origam-chip---font-weight`. When unset the theme default (400) applies. |

## Emits

| Event              | Payload          | Description                                    |
|--------------------|------------------|------------------------------------------------|
| `click`            | `MouseEvent`     | Root element clicked                           |
| `click:close`      | `MouseEvent`     | Close button clicked; `modelValue` set to false|
| `click:prepend`    | `MouseEvent`     | Prepend area clicked                           |
| `click:append`     | `MouseEvent`     | Append area clicked                            |
| `update:modelValue`| `boolean`        | Visibility changed                             |
| `group:selected`   | `any`            | Selection changed within a group               |

## Slots

| Slot      | Scope               | Description                                |
|-----------|---------------------|--------------------------------------------|
| `default` | `contentProps`      | Chip label / body                          |
| `prepend` | —                   | Custom prepend content                     |
| `append`  | —                   | Custom append content                      |
| `close`   | `{ closeIcon }`     | Custom close button                        |
| `filter`  | `{ filterIcon }`    | Custom filter/selection icon               |

## Tokens

| Variable                                  | Default         | Used for                    |
|-------------------------------------------|-----------------|-----------------------------|
| `--origam-chip---background-color`        | (unset)         | chip fill                   |
| `--origam-chip---color`                   | (unset)         | chip text color             |
| `--origam-chip---border-color`            | `currentColor`  | border color                |
| `--origam-chip---border-radius`           | `9999px`        | pill shape                  |
| `--origam-chip---border-width`            | `0px`           | border thickness            |
| `--origam-chip---font-weight`             | `400`           | label weight                |
| `--origam-chip---opacity-disabled`        | `0.3`           | disabled opacity            |
| `--origam-chip__close---cursor`           | `pointer`       | close icon cursor           |
| `--origam-chip__close---font-size`        | `18px`          | close icon size             |
| `--origam-chip__overlay---opacity`        | `0`             | hover/focus overlay opacity |
