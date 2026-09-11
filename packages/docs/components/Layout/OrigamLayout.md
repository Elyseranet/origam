# OrigamLayout

`<OrigamLayout>` is the application shell. It owns a measured viewport
and registers every layout-aware child (drawer, app-bar, system-bar,
bottom-nav, main, …) via the `useCreateLayout` composable so each one
can position itself relative to its siblings.

Use **one** `<OrigamLayout>` near the top of your app — usually around
`<NuxtPage />` or `<RouterView />`.

## Basic usage

```vue
<template>
    <OrigamLayout>
        <OrigamSystemBar />
        <OrigamAppBar />
        <OrigamDrawer />
        <OrigamMain>
            <RouterView />
        </OrigamMain>
        <OrigamBottomNav />
    </OrigamLayout>
</template>
```

## Overlaps

`overlaps` is a list of layout item id pairs that should not push each
other but instead stack on top of one another. Each entry is the
`name` of a layout item (`AppBar`, `Drawer`, `BottomNav`, …) joined
with a colon.

```vue
<template>
    <OrigamLayout :overlaps="['AppBar:Drawer']">
        <OrigamAppBar name="AppBar" />
        <OrigamDrawer name="Drawer" />
        <OrigamMain>…</OrigamMain>
    </OrigamLayout>
</template>
```

## Full-height

`fullHeight` opts the wrapper into `min-height: 100vh` — it occupies at
least the full viewport (useful for shells that have no surrounding
scroll context: Tauri windows, embedded dashboards…) and grows past one
screen if its content is taller, rather than clipping.

```vue
<template>
    <OrigamLayout full-height>
        <OrigamMain>…</OrigamMain>
    </OrigamLayout>
</template>
```

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | The application's chrome and main slot. |

## Exposed methods

`<OrigamLayout>` exposes (via `defineExpose`) helpers that are useful
when you need to read the layout state imperatively:

| Method / property | Returns | Description |
|---|---|---|
| `getLayoutItem(id)` | `ILayerItem \| undefined` | Read the resolved rect of a layout item by id. |
| `items` | `Ref<ILayerItem[]>` | Reactive list of all registered items. |
| `filterProps` | `Function` | Internal helper for deferred-tag rendering. |

## Props (interface)

```ts
interface ILayoutProps extends ICommonsComponentProps {
    overlaps?:   Array<string>
    fullHeight?: boolean
}
```

## Anatomy

```html
<div :id="layoutId" class="origam-layout">
    <div :id="`${layoutId}-wrapper`" class="origam-layout__wrapper">
        <!-- default slot — layout-aware children -->
    </div>
</div>
```

## Design tokens consumed

`<OrigamLayout>` reads from `tokens/component/layout.json`. The
component itself is mostly transparent; the layout-aware children
(drawer, app-bar, system-bar, …) consume their own tokens once
positioned.

| CSS variable | Default |
|---|---|
| `--origam-layout---position-top` | `0` |
| `--origam-layout---position-bottom` | `0` |
| `--origam-layout---position-left` | `0` |
| `--origam-layout---position-right` | `0` |

The `--origam-layout---position-*` variables are written by the layout
machinery whenever a child registers itself, so `<OrigamMain>` and
sibling elements can offset their inner padding accordingly.

## Accessibility

- The wrapper renders a presentational `<div>` — pick a meaningful
  semantic structure inside (a `<header>` slot via `<OrigamAppBar>`, a
  `<main>` slot via `<OrigamMain>`, …).
- Keep a single `<main>` per page; the layout doesn't enforce it but
  most consumers should.

## Theming notes

- The component is theme-aware via its children; the wrapper itself
  emits no chrome.
- A sub-tree can opt into a different theme via `<OrigamThemeProvider>`.

## Related

- `OrigamMain` — the central scroll area.
- `OrigamSystemBar` — OS-style title bar.
- `OrigamAppBar`, `OrigamDrawer`, `OrigamBottomNav` — siblings registered against the layout.
