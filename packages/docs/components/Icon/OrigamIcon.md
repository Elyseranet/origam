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
    <OrigamIcon icon="mdi-home" size="x-small" />  <!-- --origam-icon---font-size-xs -->
    <OrigamIcon icon="mdi-home" size="small"   />  <!-- --origam-icon---font-size-sm -->
    <OrigamIcon icon="mdi-home" size="default" />  <!-- --origam-icon---font-size-md -->
    <OrigamIcon icon="mdi-home" size="large"   />  <!-- --origam-icon---font-size-lg -->
    <OrigamIcon icon="mdi-home" size="x-large" />  <!-- --origam-icon---font-size-xl -->

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
    <!-- Default — <i>, for EVERY notation -->
    <OrigamIcon icon="mdi-home" />
    <OrigamIcon icon="M12 2 L17 8 …" />

    <!-- Force a different tag -->
    <OrigamIcon icon="mdi-home" tag="span" />
</template>
```

⚠️ The root is `<i>` whatever the notation. `<OrigamIcon>` declares
`withDefaults(…, { tag: 'i' })` and forwards `:tag="tag"` to the leaf it
dispatched to, so `OrigamSvgIcon` / `OrigamComponentIcon` /
`OrigamLigatureIcon`'s own `tag: 'div'` default is never reached through the
dispatcher. Mounting a leaf directly *does* give you a `<div>`. Pinned by
`packages/tests/TU/components/Icon/icon-root-tag.spec.ts`.

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

## Props

### Content

| Prop | Type | Default | Description |
|---|---|---|---|
| `icon` | `TIcon` | `undefined` | The glyph. See the dispatch table at the top for every accepted form. Overridden by the `default` slot when that slot resolves to a text node |
| `tag` | `string` | `'i'` | Element the root renders as |

### Color

| Prop | Type | Default | Description |
|---|---|---|---|
| `color` | `TColor` | `undefined` | Foreground. Falls back to `--origam-icon---color`, i.e. `currentColor` |
| `bgColor` | `TColor` | `undefined` | Surface behind the glyph. Both channels go through `useBothColor` |

### Sizing

| Prop | Type | Default | Description |
|---|---|---|---|
| `size` | `TSize \| number` | `undefined` | One of `x-small` · `small` · `default` · `large` · `x-large`. Emits `origam-icon--size-{value}`, whose rule reads `--origam-icon---font-size-{xs\|sm\|md\|lg\|xl}`. A number or an unrecognised length goes to `sizeStyles` as inline `width` / `height` instead — never both channels at once. **Unset means no class and no rule**: the glyph keeps the inherited `font-size` |

### Dimension (`IDimensionProps`)

Consumed by `useDimension(props)` — inline declarations on the root, so they
outrank the size rung.

| Prop | Type | Description |
|---|---|---|
| `width` / `height` | `number \| string` | Explicit box size |
| `minWidth` / `minHeight` | `number \| string` | |
| `maxWidth` / `maxHeight` | `number \| string` | |

### Shape, border and spacing

| Group | Props | Composable |
|---|---|---|
| Shape | `rounded`, `roundedTopLeft` / `TopRight` / `BottomLeft` / `BottomRight` | `useRounded` |
| Border | `border`, `borderBlock`, `borderInline`, `borderTop` / `Right` / `Bottom` / `Left`, `borderColor`, `borderStyle`, the four per-side `border*Color` | `useBorder` |
| Padding | `padding`, `paddingBlock`, `paddingInline`, `paddingTop` / `Right` / `Bottom` / `Left` | `usePadding` |
| Margin | `margin`, `marginBlock`, `marginInline`, `marginTop` / `Right` / `Bottom` / `Left` | `useMargin` |
| Commons | `id`, `class`, `style` | — |

### Not a prop

`disabled` is deliberately absent. None of the five icon components ever read
it, and an icon is a render element, not a control — there is nothing to
disable. Paint the disabled state on whatever *carries* the icon (button,
field, list item); the icon inherits its opacity and cursor. That also stops a
single control from showing two divergent disabled treatments.

## Emits

**None.** `IIconComponentEmits` is empty on purpose: none of the five
components calls `emit(…)` anywhere. A `@click` listener you attach is a
plain DOM listener — which is exactly what `useIconAccessibility` detects to
switch the icon into button mode (see **Accessibility**).

## Props (interface)

```ts
interface IIconComponentProps extends IIconProps,
    IColorProps, IBgColorProps, ICommonsComponentProps, ITagProps,
    ISizeProps, IPaddingProps, IMarginProps, IBorderProps,
    IDimensionProps, IRoundedProps {
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

Through `<OrigamIcon>` the root is always `<i>` (see **Polymorphic tag**), and
the `--size-*` class only appears when `size` is set.

```html
<!-- Class icon (mdi/fa) — <OrigamIcon icon="mdi-home" size="default" /> -->
<i class="origam-icon origam-icon--size-default mdi mdi-home"></i>

<!-- SVG icon — <OrigamIcon icon="M12 …" /> -->
<i class="origam-icon origam-icon--svg">
    <svg class="origam-icon__svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="…" />
    </svg>
</i>

<!-- Component icon — <OrigamIcon :icon="LucideHome" /> -->
<i class="origam-icon origam-icon--component">
    <!-- inner Vue component -->
</i>
```

Mounted directly rather than through the dispatcher, each leaf keeps its own
`tag: 'div'` default:

```html
<div class="origam-icon origam-icon--ligature">home</div>
```

## Design tokens consumed

`<OrigamIcon>` reads its variables from
`packages/ds/src/assets/css/tokens/light.css` and `dark.css` (SCSS twins
under `packages/ds/src/assets/scss/tokens/`):

| CSS variable | Declared value |
|---|---|
| `--origam-icon---color` | `currentColor` |
| `--origam-icon---transition-duration` | `var(--origam-motion__duration---fast)` |
| `--origam-icon---transition-timing-function` | `var(--origam-motion__easing---standard)` |
| `--origam-icon---font-size-xs` … `-4xl` | `var(--origam-font__size---{rung})`, for `xs` `sm` `md` `lg` `xl` `2xl` `3xl` `4xl` |
| `--origam-icon---color-primary` | `var(--origam-color__action--primary---bg)` |
| `--origam-icon---color-success` | `var(--origam-color__feedback--success---bg)` |
| `--origam-icon---color-warning` | `var(--origam-color__feedback--warning---bg)` |
| `--origam-icon---color-danger` | `var(--origam-color__feedback--danger---bg)` |
| `--origam-icon---color-info` | `var(--origam-color__feedback--info---bg)` |
| `--origam-icon---color-disabled` | `var(--origam-color__text---disabled)` |

## Accessibility

- `aria-hidden="true"` is applied automatically when **no click handler** is
  registered — purely-decorative icons stay invisible to screen readers.
- When a click handler IS attached: `role="button"` + `aria-hidden="false"`.
  The icon itself carries no accessible name — pass `aria-label` or
  `aria-labelledby` on the same element, or a dev-time console warning
  fires pointing you at the fix described below.
- ⚠️ **A clickable icon is a button — use `<origam-btn>`, not `@click` on
  an icon.** `role="button"` here is a compatibility fallback for existing
  `@click` usage, not a recommended pattern: this element has **no
  `tabindex` and no keyboard handler** (measured — `Tab` never reaches it,
  `Enter`/`Space` do nothing), so a keyboard or switch-device user cannot
  discover or activate it even once it announces `role="button"`. Prefer
  `OrigamBtn`'s icon-only mode, a real `<button>` with full keyboard
  support for free:

  ```vue
  <!-- ❌ Avoid — no keyboard access despite role="button" -->
  <origam-icon icon="mdi-close" aria-label="Close" @click="onClose"/>

  <!-- ✅ Prefer — origam-btn icon-only mode -->
  <origam-btn icon="mdi-close" :aria-label="t('btn_close', 'Close')" @click="onClose"/>
  ```

  `IBtnProps.icon` accepts `boolean | TIcon` (icon-only mode); see
  `OrigamBtn.md`'s Accessibility section — icon-only mode needs an
  `aria-label` you supply yourself, exactly like above, but on a real
  button.
- An earlier draft of this ticket (#653) explored a typed `clickable` prop
  with a `vue-tsc`-enforced discriminated union. It was removed before
  release: no component in the repo ever used it, and constraining an API
  nobody uses just papers over the real defect — a clickable icon should
  never have existed as ARIA-on-a-glyph in the first place.
- The inline `<svg>` leaf (`OrigamSvgIcon`) always renders its glyph with
  `aria-hidden="true"` — no `role` — it never carries meaning on its own;
  the accessible name lives on the interactive ancestor, not the glyph.
  It also never calls `useIconAccessibility()` at all, so a clickable
  `OrigamSvgIcon` doesn't even get the fallback above — tracked
  separately as #660.

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
