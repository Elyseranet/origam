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

The component reads the RTL context from `useRtl()` and applies the
`origam-app--rtl` class automatically.

## Slots

| Slot | Description |
|---|---|
| `default` | Application content — place layout children here. |

## Design tokens

`OrigamApp` inherits all tokens from `OrigamLayout`.

| CSS variable | Description |
|---|---|
| `--origam-layout---display` | Layout display mode. |
| `--origam-layout---position` | Layout positioning. |

## Accessibility

- Acts as the page root; authors should set a `lang` attribute on the document `<html>` element.
- RTL text direction is applied automatically when the locale is right-to-left.
- All landmark regions (`<header>`, `<nav>`, `<main>`) must be direct children.

## Related

- `OrigamToolbar` — top app bar.
- `OrigamDrawer` — navigation drawer.
- `OrigamMain` — main content area.
- `OrigamLayout` — the underlying layout engine.
