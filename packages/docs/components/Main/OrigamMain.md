# OrigamMain

`<OrigamMain>` is the central content slot of the application shell.
It registers itself with the surrounding `<OrigamLayout>` via
`useLayout` so that drawers, app-bars, system-bars and bottom-navs
push it around without overlapping. Renders as `<main>` by default.

## Basic usage

```vue
<template>
    <OrigamLayout>
        <OrigamAppBar />
        <OrigamDrawer />
        <OrigamMain>
            <RouterView />
        </OrigamMain>
    </OrigamLayout>
</template>
```

## Scrollable

`scrollable` makes `<OrigamMain>` host its own scroll context. The
inner `__scroller` element gets `overflow-y: auto` and the outer
element switches to `position: absolute` so it fills the layout
without contributing to the document scroll.

```vue
<template>
    <OrigamLayout full-height>
        <OrigamMain scrollable>
            <!-- Long content; scrolls inside the main slot only -->
        </OrigamMain>
    </OrigamLayout>
</template>
```

## Modifiers

```vue
<template>
    <OrigamMain rounded>Rounded corners</OrigamMain>
    <OrigamMain border>Bordered main slot</OrigamMain>
</template>
```

## Polymorphic tag

```vue
<template>
    <!-- Override the default <main> if you need to nest two main slots
         (e.g. embedded mode or a portal). -->
    <OrigamMain tag="div">…</OrigamMain>
</template>
```

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Page content. |

## Props (interface)

```ts
interface IMainProps extends ITagProps, ICommonsComponentProps,
    IPaddingProps, IMarginProps, IBorderProps, IRoundedProps,
    IDimensionProps {
    scrollable?: boolean
}
```

## Anatomy

```html
<main class="origam-main [origam-main--scrollable]">
    <div class="origam-main__wrapper [origam-main__scroller]">
        <!-- default slot -->
    </div>
</main>
```

## Design tokens consumed

`<OrigamMain>` reads from `tokens/component/main.json`. The component
also re-exports the `--origam-layout---position-*` family written by
the surrounding `<OrigamLayout>` so its inner padding tracks every
sibling drawer / app-bar.

| CSS variable | Default |
|---|---|
| `--origam-main--flex` | `1 0 auto` |
| `--origam-main--max-width` | `100%` |
| `--origam-main--width` | `100%` |
| `--origam-main--height` | `100%` |
| `--origam-main--display` | `flex` |
| `--origam-main--position` | `absolute` |
| `--origam-main--position-top` | `0` |
| `--origam-main--position-left` | `0` |
| `--origam-main--transition-duration` | inherits motion.duration.medium |
| `--origam-main--transition-property` | `all` |
| `--origam-main--transition-timing-function` | inherits motion.easing.standard |
| `--origam-main__scroller--max-width` | `100%` |
| `--origam-main__scroller--position` | `relative` |

The component also reads the layout-bound positions:
`--origam-layout---position-top`, `--origam-layout---position-bottom`,
`--origam-layout---position-left`, `--origam-layout---position-right`.

## Accessibility

- Renders `<main>` by default — the landmark is correct out of the box.
  Screen-reader users should be able to jump to the main slot via
  the "main" landmark shortcut.
- Keep a single `<OrigamMain>` per page.
- When `scrollable`, the inner scroll context still receives keyboard
  focus and arrow-key scrolling for free.

## Theming notes

- The component is theme-aware via its consumed tokens. Switching
  `<html data-theme="…">` re-resolves them instantly.
- A sub-tree can opt into a different theme via `<OrigamThemeProvider>`.

## Related

- `OrigamLayout` — application shell.
- `OrigamSheet` — generic surface, similar API.
- `OrigamContainer` — outer wrapper with breakpoint-aware max-width.
