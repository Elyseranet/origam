# OrigamAppBar

`<OrigamAppBar>` is a **docked, layout-aware toolbar** — typically the app's
top header. It wraps `<OrigamToolbar>` (title / prepend / content / append
regions, plus the full color / elevation / border / rounded / density
surface) and registers itself with the nearest `<OrigamLayout>` so sibling
regions (`OrigamMain`, drawers, footer bars) offset around its reserved
height automatically.

## Basic usage

```vue
<template>
    <OrigamApp>
        <OrigamAppBar title="My Application">
            <template #prepend>
                <OrigamBtn icon="mdi-menu" aria-label="Navigation menu" />
            </template>
            <template #append>
                <OrigamBtn icon="mdi-dots-vertical" aria-label="More options" />
            </template>
        </OrigamAppBar>
        <OrigamMain>
            <!-- page content -->
        </OrigamMain>
    </OrigamApp>
</template>
```

`<OrigamAppBar>` must be used inside an `<OrigamApp>` / `<OrigamLayout>` tree
for its reserved-height offset to reach `<OrigamMain>`. Outside a layout
provider it still renders standalone (stories, modal previews, tests) —
`useLayoutItem` falls back to inert styles.

## Color, elevation, rounded, border, density

Forwarded straight through to the internal `<OrigamToolbar>` — same behaviour
as documented on `OrigamToolbar`.

```vue
<template>
    <OrigamAppBar
        title="Primary"
        bg-color="primary"
        color="white"
        :elevation="4"
        rounded="medium"
        border
        density="compact"
    />
</template>
```

## Image / background

`image` renders an `<OrigamImg>` behind the prepend area (`.origam-bar__img`)
— useful for a gradient or photographic header. The `#img` slot takes
priority over the `image` prop when both are supplied.

```vue
<template>
    <OrigamAppBar title="Header" :image="{ src: '/banner.jpg', alt: '' }" />
</template>
```

## Collapse / flat

```vue
<template>
    <OrigamAppBar title="Collapsible" :collapse="collapsed" />
    <OrigamAppBar title="Flat" flat />
</template>
```

## Visibility (`v-model`)

`modelValue` (default `true`) controls whether the bar is shown. It is a
two-way binding — the scroll-hide behaviour below writes to it internally.

```vue
<template>
    <OrigamAppBar v-model="visible" title="Toggleable" />
</template>
```

## Scroll behaviour

`scroll-behavior` is a **space-separated token list** (combine freely):
`hide`, `inverted`, `collapse`, `elevate`, `active`, `fade-image`. `inverted`
is a modifier — it flips the trigger of `hide` / `collapse` / `elevate` and
does nothing on its own.

```vue
<template>
    <OrigamAppBar
        title="Scroll-aware"
        scroll-behavior="hide elevate"
        scroll-target=".origam-main"
        :scroll-threshold="300"
    />
</template>
```

| Token | Effect |
|---|---|
| `hide` | Bar slides out of view on scroll-down, back in on scroll-up (past `scrollThreshold`). |
| `inverted` | Flips the trigger for `hide` / `collapse` / `elevate` (e.g. reveal instead of hide). |
| `collapse` | Engages `collapse` once scrolled. |
| `elevate` | Drops the flat/no-shadow state once scrolled (elevation kicks in). |
| `active` | Engages the `active` design-state (see `IActiveState`) once scrolled past the top. |
| `fade-image` | Fades the `image` background as the page scrolls. |

## Layout — location, order, name

```vue
<template>
    <OrigamAppBar title="Footer bar" location="bottom" :order="1" name="footer-bar" />
</template>
```

| Prop | Effect |
|---|---|
| `location` | `top` (default) or `bottom` — which edge of the layout the bar docks to. |
| `order` | Stacking order among sibling layout items sharing the same `location`. |
| `name` | Identifier used by `<OrigamLayout overlaps>` to pair this bar with another item. |

## Slots

| Slot | Description |
|---|---|
| `default` | Extra content appended after the toolbar's own regions. |
| `prepend` | Leading area (hamburger menu, back button, …). Rendered together with the image background when `image` / `#img` is set. |
| `img` | Overrides the `image` prop — background content behind the prepend area. |
| `content` | Full override of the toolbar's main content region. |
| `append` | Trailing area (action buttons, avatars, …). |
| `title` | Inherited from `OrigamToolbar` — overrides the rendered title (see `OrigamToolbar`). |

## Emits

| Emit | Payload | Description |
|---|---|---|
| `update:modelValue` | `boolean` | Fires whenever visibility changes (manual `v-model` write or scroll-hide behaviour). |

## Props reference

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | — | Rendered by the inherited `OrigamToolbar` title region. |
| `image` | `IImgProps` | — | Background image behind the prepend area. See `OrigamImg`. |
| `color` / `bgColor` | `TIntent \| string` | — | Text / background intent. |
| `density` | `TDensity` | `default` | `compact \| default \| comfortable`. |
| `elevation` | `TElevation` | — | Shadow rung; no-op while `flat`. |
| `rounded` | `TRounded` | — | Corner radius token. |
| `border` / `borderColor` / `borderStyle` | — | — | Border surface. |
| `collapse` | `boolean` | `false` | Icon-only collapsed mode. |
| `flat` | `boolean` | `false` | Removes the shadow. |
| `height` | `number \| string` | `56` | Reserved layout thickness. |
| `modelValue` | `boolean` | `true` | Visibility (`v-model`). |
| `scrollBehavior` | `string` | — | Space-separated token list — see above. |
| `scrollTarget` | `string` | — | CSS selector of the scrollable element to observe. |
| `scrollThreshold` | `string \| number` | `300` | Distance (px) before scroll-behaviours engage. |
| `location` | `top \| bottom` | `top` | Docking edge. |
| `order` | `string \| number` | — | Stacking order among sibling layout items. |
| `name` | `string` | — | Identity used by `<OrigamLayout overlaps>`. |
| `tag` | `string` | `header` | Rendered root element. |

`width` / `minWidth` / `maxWidth` / `floating` / `absolute` are intentionally
**not** exposed — a docked AppBar's cross-axis size is owned by the layout
engine (`calc(100% - reservedLeft - reservedRight)`); see the comment on
`IAppBarProps` in `interfaces/App/app-bar.interface.ts` for the full
rationale.

## Design tokens

No AppBar-scoped CSS variables — the chrome (btn shape, transparent surface,
prepend/append gutters, title color) lives entirely in `OrigamToolbar`'s
scoped styles and applies to every Toolbar consumer. See
`OrigamToolbar` → Design tokens
for the full `--origam-toolbar---*` variable list.

## Accessibility

- Renders as `<header>` by default (override via `tag`).
- Use the `prepend` slot for skip-navigation links or a hamburger trigger
  with an `aria-label`.
- The `content` slot occupies the landmark center; keep it focused.
- `scroll-behavior="hide"` moves the bar out of the viewport but does not
  remove it from the accessibility tree — pair it with `inert` / focus
  management on the surrounding page if hidden content must not be reachable
  by keyboard while off-screen.

## Test coverage note

Only `appbar-scroll-active.spec.ts` (scroll-behavior `active` / `hide`) and
`appbar-coverage.spec.ts` (`density`, `elevation`, `rounded`, `border`,
`collapse`, `flat`, `location`, `image`) are exercised under Vitest.
`scroll-behavior="hide inverted"`, `collapse`, `elevate` and `fade-image`
scroll engagement, and the `Events - update:modelValue` / slot Variants, are
only covered by the Histoire story — they depend on real scroll/layout
geometry jsdom cannot provide.
