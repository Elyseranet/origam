# OrigamClassIcon

`<OrigamClassIcon>` is the **font-class leaf** rendered when an icon name
maps to a CSS-class-driven font set (Material Design Icons via `mdi-*`,
Font Awesome via `fa-*`, etc.). It is selected automatically by
`OrigamIcon` when the resolved icon string is a class
name — you almost never instantiate it by hand, except in low-level
integrations or when registering a new icon set.

## Basic usage

```vue
<template>
    <!-- Direct usage — bypasses the dispatcher, useful inside a custom IIconSet -->
    <OrigamClassIcon icon="mdi-home" />
    <OrigamClassIcon icon="fa-solid fa-circle" />
</template>
```

The `icon` prop is **simply concatenated as a class** on the rendered
element. No alias resolution, no set-prefix stripping — that's the
dispatcher's job.

## Sizes

```vue
<template>
    <!-- Named sizes — share the same SCSS rule as the dispatcher -->
    <OrigamClassIcon icon="mdi-heart" size="x-small" />
    <OrigamClassIcon icon="mdi-heart" size="small"   />
    <OrigamClassIcon icon="mdi-heart" size="default" />
    <OrigamClassIcon icon="mdi-heart" size="large"   />
    <OrigamClassIcon icon="mdi-heart" size="x-large" />

    <!-- Numeric override — sets font-size + line-height in pixels -->
    <OrigamClassIcon icon="mdi-heart" :size="32" />
</template>
```

## Polymorphic tag

```vue
<template>
    <!-- Default tag is <i> -->
    <OrigamClassIcon icon="mdi-home" />

    <!-- Override -->
    <OrigamClassIcon icon="mdi-home" tag="span" />
</template>
```

## Custom icon sets

`<OrigamClassIcon>` is the recipe to bind your own font icons. Register a
new set in the createOrigam options, point its `component` to a wrapper
that prepends your set prefix, and you're done:

```ts
import { OrigamClassIcon } from '@origam/components'

export const fa: IIconSet = {
    component: (props: any) => h(OrigamClassIcon, {
        ...props,
        // Combine the set's namespace with the consumer's icon name
        class: 'fa'
    })
}
```

## Props (interface)

`OrigamClassIcon` accepts the full `IIconComponentProps` interface, and
resolves every surface axis itself.

| Prop | Type | Description |
|---|---|---|
| `icon` | `TIcon` | Icon class name, e.g. `mdi-account`. |
| `size` | `TSize \| number` | Named token, or a number applied as both `font-size` and `line-height`. |
| `tag` | `string` | Root element. |
| `color` / `bgColor` | `TColor` | Foreground / background intent. |
| `border` (+ per-side, `borderColor`, `borderStyle`) | see `OrigamAlert` | Border axis. |
| `rounded` (+ per-corner) | `boolean \| number \| string \| TRounded` | Radius axis. |
| `padding` / `margin` (+ per-side, block, inline) | `boolean \| number \| string` | Spacing axes. |
| `width` / `height` / `min*` / `max*` | `number \| string` | Dimension axis. |
| `class` | `string \| string[] \| object` | Merged into the root class list. |
| `style` | `string \| string[] \| object` | Merged into the root style. |

::: tip Behaviour change
These axes used to be a no-op at the leaf level: `OrigamIcon` resolved them
and handed the result down as `class` / `style`, so they only worked when the
icon was reached *through* the dispatcher. Since the leaves are exported on
the public barrel too, `<origam-class-icon padding="8px">` written directly
got nothing at all.

The leaf now consumes the same composables itself, so both paths work. There
is no double application — the dispatcher never forwards the axis props
themselves: it resolves them and hands down `icon`, `size`, `tag`, `class`,
`style` (plus `id` and `aria-hidden`), so a padding the dispatcher resolved
arrives as a class the leaf simply merges.
:::

::: tip There is no `disabled` prop
An icon renders; it does not respond to input. There is nothing on it to
disable, so the whole family — `OrigamIcon`, `OrigamClassIcon`,
`OrigamSvgIcon`, `OrigamLigatureIcon`, `OrigamComponentIcon` — deliberately
exposes no `disabled`.

A `disabled` prop did exist on `IIconComponentProps` up to v2.15. None of the
five components ever read it: it produced no class, no attribute and no style,
and passing it did nothing at all. It was removed rather than implemented.

Paint the disabled state on the control that OWNS the icon — the button, the
field, the list item. The icon then inherits its opacity and cursor for free,
which is also what keeps a single control from showing two different disabled
treatments. For a one-off greyed icon, drive `color`.
:::

::: tip Accessibility — same "direct usage" gap, now closed
`aria-hidden` used to reach this leaf only via `OrigamIcon`'s fallthrough.
Written directly (`<origam-class-icon icon="mdi-home">`), a decorative glyph
was fully exposed to the accessibility tree. The leaf now resolves its own
`aria-hidden` (`true` unless a click handler is attached) — see
[Accessibility](#accessibility) below.

**No `role` is emitted on either path.** `useIconAccessibility()` returns
`isClickable` / `ariaHidden` / `hasAccessibleName` and nothing else, and
`OrigamClassIcon.vue` binds `aria-hidden` only — see the `role="button"`
rationale in [Accessibility](#accessibility).
:::

## Anatomy

Rendered markup for the **Basic usage** example above
(`<OrigamClassIcon icon="mdi-home" />`), measured with `mount()` — the leaf
emits its root class, the raw `icon` string, and nothing else:

```html
<i
    id="origam-class-icon-v-0"
    aria-hidden="true"
    class="origam-icon mdi-home"
></i>
```

Two class names people expect here and do **not** get from a bare leaf:

- `origam-icon--size-default` appears only when `size` is passed explicitly
  (`size="default"`); the component declares no default for `size`.
- the set prefix (`mdi`, `fa`, …) is added by the icon **set** wrapper — see
  [Custom icon sets](#custom-icon-sets) — so it shows up when the glyph is
  reached through `<OrigamIcon>`, not when the leaf is written by hand. The
  `id` is the one `useStyle()` generates unless you pass your own.

## Accessibility

- `aria-hidden="true"` by default — the glyph is decorative and stays out
  of the accessibility tree, whether reached through `OrigamIcon` or used
  directly.
- A click handler flips `aria-hidden` to `"false"`. ⛔ **Since #653, it no
  longer also sets `role="button"`** — measured: this element has no
  `tabindex` and no keyboard handler anywhere, so the role used to
  announce a control a keyboard user could never reach (`Tab`) or
  activate (`Enter` / `Space`). A dev-time console warning still fires
  when clickable with no `aria-label` / `aria-labelledby`, now pointing
  at the real fix:
  `<origam-btn icon="mdi-home" :aria-label="t('btn_home', 'Home')" @click="..."/>`
  — a real `<button>`, keyboard-accessible for free. See `OrigamIcon.md`'s
  Accessibility section for the full rationale, including the measured
  before/after markup.

## When to use

- **Almost never**, directly. Use `<OrigamIcon>` instead — it dispatches
  to the right leaf for you.
- When **registering a new font icon set** via `createOrigam({ sets: { … } })`.
  The set's `component` factory is the place to call `OrigamClassIcon`.

## Related

- `OrigamIcon` — the dispatcher (preferred entry-point).
- `createOrigam` — register
  custom icon sets.
