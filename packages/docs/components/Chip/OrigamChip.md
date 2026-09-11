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

## Pill

`pill` removes the inner horizontal padding and makes the chip fully round.

```vue
<template>
    <OrigamChip pill text="Pill chip" />
</template>
```

## Label

`label` switches to a rectangular chip (border-radius: 4px) — useful for tags.

```vue
<template>
    <OrigamChip label text="Tag" />
</template>
```

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

## Props — Typography

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
