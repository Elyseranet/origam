# OrigamField

`<OrigamField>` is the visual shell shared by all text-based inputs (TextField,
NumberField, PasswordField, etc.). It handles the floating label, outline/filled
variant, prefix/suffix, inner prepend/append icons, loader, and the density
calculation.

`OrigamField` is rarely used directly — prefer the typed atoms. Use it when you
need to embed a custom `<input>` or non-standard control inside the standard
field chrome.

## Basic usage

```vue
<template>
  <OrigamField label="Custom input">
    <template #default="{ id, onFocus, onBlur, ref: inputRef }">
      <input :id="id" :ref="inputRef" @focus="onFocus" @blur="onBlur" />
    </template>
  </OrigamField>
</template>
```

## Variants

```vue
<template>
  <OrigamField variant="outlined" label="Outlined" />
  <OrigamField variant="filled"   label="Filled" />
  <OrigamField variant="plain"    label="Plain" />
</template>
```

## Color

```vue
<template>
  <OrigamField color="primary"   label="Primary" />
  <OrigamField color="secondary" label="Secondary" />
</template>
```

## Density

```vue
<template>
  <OrigamField density="compact"     label="Compact" />
  <OrigamField density="default"     label="Default" />
  <OrigamField density="comfortable" label="Comfortable" />
</template>
```

## Rounded

The field corner radius defaults to the active theme's
`--origam-field---border-radius` token (e.g. `6px` sobre, `8px` apple,
`10px` glass, `12px` material, `0px` editorial). Pass the `rounded` prop
(inherited from `IRoundedProps`) to override it per instance — named
rungs (`xs`/`sm`/`md`/`lg`/`xl`), the legacy boolean, or a free-form CSS
value.

```vue
<template>
  <OrigamField label="Themed default" />
  <OrigamField label="Medium"   rounded="md" />
  <OrigamField label="Custom"   rounded="10px" />
  <OrigamField label="Pill"     rounded="9999px" />
</template>
```

The inline padding automatically **clears the corner**: when the radius is
larger than `--origam-field---padding-start` / `-end` (e.g. `rounded="lg"`
against an 8px padding), the field floors its inline padding at the radius so
the value text and the floating label never collide with the rounded outline.
The floor is capped at the control height, so an intentional pill
(`rounded="9999px"`) stays laid out instead of inheriting a 9999px padding.

## Prefix / suffix

```vue
<template>
  <OrigamField label="Price" prefix="$" suffix=".00" />
</template>
```

## Prepend / append inner

```vue
<template>
  <OrigamField label="Search" prepend-inner-icon="mdi-magnify" />
</template>
```

## States (dirty / focused / error / disabled)

```vue
<template>
  <OrigamField label="Error"    :error="true" />
  <OrigamField label="Disabled" disabled />
  <OrigamField label="Dirty"    :dirty="true" />
</template>
```

## Props — Typography (label surface)

The `fontSize` prop targets the floating label only (BEM child `__label--floating`).
It sets `--origam-field__label---font-size` on the `.origam-field__label` element,
which the SCSS reads for the floating label text size and the JS animation scale.

| Prop       | Type        | Default | Description                                                                       |
|------------|-------------|---------|-----------------------------------------------------------------------------------|
| `fontSize` | `TFontSize` | —       | Font-size token (xs · sm · md · lg · xl · 2xl · …). Sets `--origam-field__label---font-size`. When unset the theme default applies. |

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `default` | `{ id, aria-describedby, isActive, isFocused, ref, onBlur, onFocus, class }` | The control inside the field |
| `label` | `ILabelProps` | Custom label content |
| `floatingLabel` | `ILabelProps` | Custom floating label |
| `prefix` | — | Before control |
| `suffix` | — | After control |
| `prependInner` | — | Inside before |
| `appendInner` | — | Inside after |
| `loader` | — | Loading indicator |

## Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `any` | Value echo |
| `update:focused` | `boolean` | Focus state changed |
| `click:clear` | `MouseEvent` | Clear icon clicked |
| `click:prependInner` | `MouseEvent` | Inner prepend clicked |
| `click:appendInner` | `MouseEvent` | Inner append clicked |
| `focus` | `FocusEvent` | Field focused |
| `blur` | `FocusEvent` | Field blurred |

## Design tokens

| CSS variable | Default | Description |
|---|---|---|
| `--origam-field---border-radius` | theme rung (fallback `8px`) | Corner radius (overridable via `rounded` prop) |
| `--origam-field---border-color` | semantic border | Outline color |
| `--origam-field---label-color` | text-secondary | Label color |
| `--origam-field---bg-color` | surface | Background |
| `--origam-field---density` | `0px` | Density offset |
