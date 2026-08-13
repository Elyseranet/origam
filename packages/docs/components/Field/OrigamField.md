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

`variant` is a **props preset** (ADR-005 — `variant` = preconfiguration of
props, not a CSS layer), resolved through the exact same mechanism a theme
uses to declare default props: `useDefaults`. It also has the widest
`variant` surface in the DS (`OrigamField` and its six descendants —
TextField, TextareaField, Select, FileField, NumberField, OtpInputField —
all share the `outlined`/`filled`/`plain`/`underlined`/`solo` vocabulary),
and it is the **hardest** conversion: almost all of a Field variant's look
targets nested BEM children (`__outlines`, `__outline`) or is
state-conditioned on them, which a preset — root-props-only by design —
cannot reach. This conversion is therefore **partial by construction**
(ADR-005 D5 family C), not a regression:

| Value | What converted to the preset | What stayed component CSS |
|---|---|---|
| `outlined` (default) | `bgColor` (background) | Border width/opacity custom properties, the full `__outline--start/end/notch` per-corner geometry, floating-label alignment, active/focused notch border — all BEM-child-only |
| `filled` | `bgColor` (background), `rounded` (asymmetric top-only radius) | `__input` top padding, `__outline` bottom-border + hover/focus/error opacity |
| `plain` | `bgColor: 'transparent'` | `__outlines { display: none }`, `__input` inline padding |
| `solo` | `elevation` (box-shadow) | `__input` top padding |
| `underlined` | *nothing* — see below | Border width/opacity, `__outline` bottom-border geometry, hover/focus opacity |

```vue
<template>
  <OrigamField variant="outlined" label="Outlined" />
  <OrigamField variant="filled"   label="Filled" />
  <OrigamField variant="plain"    label="Plain" />
  <OrigamField variant="solo"     label="Solo" />
  <OrigamField variant="underlined" label="Underlined" />
</template>
```

### Resolution order — the preset is the WEAKEST tier

```
prop at the call site  >  theme default  >  variant preset  >  component default
```

```vue
<template>
    <!-- Paints primary — bgColor is a call-site prop (tier 1), the
         outlined preset's bgColor is tier 3 (weakest). This is the
         ADR-005 acceptance test for this ticket. -->
    <origam-text-field variant="outlined" bg-color="primary">…</origam-text-field>
</template>
```

The `origam-field--variant-{value}` class is still applied to the root
element — it carries **zero** DS rules, purely a consumer override hook.
The irreducible BEM-child CSS listed above is kept alive by a SEPARATE
structural class, `origam-field--chrome-{value}` (driven by the resolved
`variant`, same pattern as `OrigamBlockquote`'s
`origam-blockquote--has-quote-mark`) — so it survives the CI guard that
bans DS rules on `--variant-*` selectors.

### `underlined` has no preset entry

Every declaration `underlined` used to make targets `__outline` children
(directly, or via a custom property only they read) — there is nothing at
the root to preset. `FIELD_VARIANT_PRESETS` deliberately omits an
`underlined` key rather than writing a misleading empty `{}` entry.

### `rounded` reaches the six descendants only when nothing else sets it

`TextField` / `TextareaField` / `Select` / `FileField` / `NumberField` /
`OtpInputField` all default their OWN `rounded` prop to `true` — a
concrete value, always forwarded explicitly to the internal
`<origam-field>`. That means `filled`'s asymmetric-radius preset entry is
only reachable through a **bare** `<OrigamField variant="filled">` — it
does not change rendering through any of the six typed atoms, in either
direction (their `rounded="true"` already beat the OLD `&--variant-filled`
CSS the same way, inline always winning over a class). `bgColor` and
`elevation` don't have this limitation — see `field-variant.const.ts` for
the full, verified explanation.

### Theme-level override

A theme can redefine what a variant means via `IOrigamTheme.variants`,
merged over the DS-shipped table:

```ts
createOrigam({
    themes: [{
        name: 'brand-x',
        variants: {
            'origam-field': {
                filled: { bgColor: 'var(--origam-color__surface---overlay)' }
            }
        }
    }]
})
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
