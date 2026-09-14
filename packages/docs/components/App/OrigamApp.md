# OrigamApp

`<OrigamApp>` is the **root layout shell** of an origam application. It wraps
`OrigamLayout` and provides the full-height coordinate space that `OrigamDrawer`,
`OrigamToolbar`, `OrigamMain`, and other layout components register themselves into.

## Basic usage

```vue
<template>
    <OrigamApp>
        <OrigamToolbar title="My App" />
        <OrigamDrawer v-model="drawerOpen">
            <OrigamList>
                <OrigamListItem title="Home" />
            </OrigamList>
        </OrigamDrawer>
        <OrigamMain>
            <router-view />
        </OrigamMain>
    </OrigamApp>
</template>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `color` | `TColor` | — | Default text colour of the application. Forwarded to the layout root and inherited by descendants through normal CSS inheritance. |
| `bgColor` | `TColor` | — | Background colour painted on the application surface. |
| `fullHeight` | `boolean` | `true` | Stretch the layout to the full viewport (`100vw` / `100vh`). |
| `overlaps` | `string[]` | — | IDs of layout items allowed to overlap each other (forwarded to the layout). |
| `id` | `string` | — | DOM id of the application root. Forwarded to the layout element. |
| `class` | `string \| string[] \| object` | — | Extra classes on the root, alongside `origam-app` and the RTL class. |
| `style` | `string \| string[] \| object \| StyleValue` | — | Extra inline styles on the root. |

`<OrigamApp>` is a thin shell over `<OrigamLayout>` and deliberately exposes
**only** the surface-colour props — an application root has no business
carrying a border, corner radius, shadow, dimension or spacing. Those design
props remain available directly on `<OrigamLayout>` for embedded / sized
layouts.

## Surface color

`bgColor` paints the application background; `color` sets the root text colour
which cascades to descendants via CSS inheritance — a lightweight way to set an
app-wide default without per-component overrides.

```vue
<template>
    <OrigamApp bg-color="surface" color="on-surface">
        <OrigamMain>…</OrigamMain>
    </OrigamApp>
</template>
```

## Full height

`fullHeight` defaults to `true`. The root element occupies *at least* the
full viewport height (`min-height: 100vh`) — content taller than one
screen grows the element past the viewport rather than clipping; a page
that fits in one screen still fills it exactly.

## RTL support

The component reads the RTL context from `useRtl()` and applies **one of
two** classes on every render — there is no "RTL only" class:

| Locale direction | Class emitted | Rule |
|---|---|---|
| right-to-left | `origam-app--is-rtl` | `direction: rtl` |
| left-to-right | `origam-app--is-ltr` | `direction: ltr` |

`useRtl()` builds the name as `` `${componentName}--is-${isRtl ? 'rtl' : 'ltr'}` ``,
so the LTR class is always present when the locale is left-to-right.
Style against `origam-app--is-rtl`, not `origam-app--rtl`; the latter is
never emitted.

The direction itself comes from the locale provider
(`ORIGAM_LOCALE_KEY`) — set it through `createOrigam`'s `locale` option or
an ancestor `provideLocale`, not on `<OrigamApp>`, which has no `rtl`
prop of its own.

## Emits

`<OrigamApp>` emits nothing (`IAppEmits` is empty). It only forwards
props to `<OrigamLayout>`.

## Slots

| Slot | Description |
|---|---|
| `default` | Application content — place layout children here. |

## Design tokens

Two variables are read by `OrigamApp`'s own scoped stylesheet:

| CSS variable | Default |
|---|---|
| `--origam-app---color` | `var(--origam-color__text---primary)` |
| `--origam-app---background-color` | `var(--origam-color__surface---default)` |

Everything else the root paints comes from `<OrigamLayout>`, which
`OrigamApp` renders — including the `--origam-layout---position-{top,
right,bottom,left}` custom properties the layout machinery writes at
runtime for descendants to offset against — see the `OrigamLayout` page.

## Accessibility

- Acts as the page root; authors should set a `lang` attribute on the document `<html>` element.
- The text direction is set from the locale, via the `origam-app--is-rtl` / `origam-app--is-ltr` class described above.
- All landmark regions (`<header>`, `<nav>`, `<main>`) must be direct children.

## Related

- `OrigamToolbar` — top app bar.
- `OrigamDrawer` — navigation drawer.
- `OrigamMain` — main content area.
- `OrigamLayout` — the underlying layout engine.
