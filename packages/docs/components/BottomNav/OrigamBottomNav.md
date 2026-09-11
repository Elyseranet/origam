# OrigamBottomNav

`<OrigamBottomNav>` is the fixed-to-viewport navigation bar for mobile /
compact layouts — a `<nav>` pinned to the bottom of the screen showing a
row of destination buttons (each one an `<OrigamBtn>`). It registers
itself as a bottom-positioned layout item with the surrounding
`<OrigamLayout>`, so `<OrigamMain>` and other layout regions offset
correctly, and it slides in/out via a transition when toggled.

## Basic usage

```vue
<template>
    <OrigamLayout>
        <OrigamMain>…</OrigamMain>

        <OrigamBottomNav :items="items" />
    </OrigamLayout>
</template>

<script setup lang="ts">
import { MDI_ICONS } from '@origam/enums'

const items = [
    { text: 'Home',    prependIcon: MDI_ICONS.HOME,    value: 'home'    },
    { text: 'Search',  prependIcon: MDI_ICONS.MAGNIFY, value: 'search'  },
    { text: 'Profile', prependIcon: MDI_ICONS.ACCOUNT, value: 'profile' },
]
</script>
```

Each entry of `items` is spread as props onto an internally-rendered
`<origam-btn>` (`v-bind="item"`), so any `IBtnProps` field — `text`,
`prependIcon`/`appendIcon`, `icon`, `value`, `disabled`, `to`/`href`… —
works out of the box.

## Mode

Three layouts for the button row, via the `mode` prop (`TNavMode`,
backed by the `MODE` enum):

| Value | Description |
|---|---|
| `vertical` (default) | Icon above label, centered in a 3-row grid (`prepend` / `content` / `append`). |
| `horizontal` | Icon and label side by side; each button's inline loader area is shown as `flex`. |
| `shift` | Same grid as `vertical`, plus the label of every **non-selected** item fades out and slides down by `0.5rem` — only the active item shows its text. |

```vue
<template>
    <OrigamBottomNav :items="items" mode="shift" />
</template>
```

## Position

When the bar is given a custom `width` (so it no longer spans edge to
edge), `position` (`TBottomNavPosition`, backed by `BOTTOM_NAV_POSITION`)
chooses where it sits horizontally:

| Value | Description |
|---|---|
| `start` (default) | Pinned to the inline-start edge (`left: 0`). |
| `center` | Centered (`left: 0; right: 0; margin-inline: auto`). |
| `end` | Pinned to the inline-end edge (`right: 0`). |

```vue
<template>
    <OrigamBottomNav :items="items" width="360px" position="center" />
</template>
```

## Grow

`grow` stretches every child button to share the available width evenly
(`flex-grow: 1` on each `.origam-btn`), instead of each button sizing to
its own content (bounded by `min-width: 80px` / `max-width: 168px`).

```vue
<template>
    <OrigamBottomNav :items="items" grow />
</template>
```

## Color

`color` / `bgColor` are forwarded as **defaults** to every child
`<origam-btn>` (via `OrigamDefaultsProvider`) — items that set their own
`color`/`bgColor` still win. `hover` and `active` are forwarded the same
way, so a state-aware palette configured on the bar cascades to every
button:

```vue
<template>
    <OrigamBottomNav
        :items="items"
        color="primary"
        bg-color="primary"
        :active="{ bgColor: 'success' }"
    />
</template>
```

The bar's own surface deliberately does **not** react to hover/active —
`isHover` / `isActive` are hard-wired to `false` when resolving the
bar's own resting color, since the container itself shouldn't darken on
hover; only its buttons should.

## Visibility

`modelValue` (default `true`) controls whether the bar is mounted and
slid into view. Toggling it off transitions the bar out via the
`transition` prop (see below) and unmounts it.

```vue
<template>
    <OrigamBottomNav :model-value="isVisible" :items="items" />
</template>
```

> **Note:** `modelValue` is shared with the item-group mechanics below —
> the same prop simultaneously drives "is the bar shown" (`useActive`)
> and, through `useGroup`, the selected item value(s) for the button
> group. Passing a non-boolean `modelValue` (e.g. a selected item's
> `value`) still resolves truthy for visibility purposes.

## Group selection (multiple / mandatory / disabled)

The bar's child buttons form a single-select (or multi-select) item
group out of the box — clicking one applies `selectedClass`
(`'origam-bottom-nav__btn--selected'` by default) to it.

| Prop | Type | Default | Description |
|---|---|---|---|
| `multiple` | `boolean` | — | Allow more than one selected item at a time. |
| `mandatory` | `boolean` | — | Prevent deselecting the last remaining active item. |
| `max` | `number` | — | Caps how many items can be selected when `multiple` is set. |
| `disabled` | `boolean` | — | Disables the whole group (all child buttons). |
| `selectedClass` | `string` | `'origam-bottom-nav__btn--selected'` | Class applied to the currently selected button(s). |

## Layout placement

`<OrigamBottomNav>` is layout-aware, using the standard `name` / `order`
/ `absolute` triple from `ILayoutItemProps`:

- `name` (default `'bottom-navigation'`) — unique id used by the layout
  machinery.
- `order` — relative order against sibling layout items.
- `absolute` — opt out of pushing/pulling sibling regions; the bar then
  floats over the main slot instead.

```vue
<template>
    <OrigamLayout>
        <OrigamMain>…</OrigamMain>
        <OrigamBottomNav name="tabs" order="0" :items="items" />
    </OrigamLayout>
</template>
```

## Transition

`transition` accepts `boolean | string | TTransitionProps` and defaults
to a slide-up-from-the-bottom transition (`OrigamTranslateBottom`,
passed as a component descriptor rather than a bare name so its
`<style>` is guaranteed to be registered). Pass `false` to disable the
enter/leave animation, or another transition component/name to replace
it.

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Overrides the entire items rendering; falls back to iterating `items`. |
| `item.{index}` | `{ props: item }` | Overrides a single item by index. |
| `item` | `{ props: item, index }` | Overrides the rendering of every item (falls back to `<origam-btn v-bind="item" />`). |

```vue
<template>
    <OrigamBottomNav :items="items">
        <template #item="{ props: itemProps, index }">
            <OrigamBtn v-bind="itemProps" :data-cy="`nav-item-${index}`" />
        </template>
    </OrigamBottomNav>
</template>
```

## Emits

| Event | Payload | Description |
|---|---|---|
| `update:modelValue` | `any` | Visibility / group-selection changes (see the note above). |
| `update:active` | `any` | Propagated from `IActiveProps` state. |
| `update:hover` | `boolean` | Propagated from `IHoverProps` state. |

## Props (interface)

```ts
interface IBottomNavProps extends ITagProps, ICommonsComponentProps,
    IColorProps, IBgColorProps, IPaddingProps, IBorderProps,
    IElevationProps, IMarginProps, IDimensionProps, IDensityProps,
    IRoundedProps, ILayoutItemProps, IGroupProps, IHoverProps,
    IActiveProps, ITransitionComponentProps {
    grow?: boolean
    mode?: TNavMode
    items?: Array<IBtnProps>
    position?: TBottomNavPosition
}
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `tag` | `string` | `'nav'` | Root element/component. |
| `items` | `Array<IBtnProps>` | `[]` | Destinations rendered as `<origam-btn>` instances. |
| `mode` | `TNavMode` | `'vertical'` | Layout of icon + label — see [Mode](#mode). |
| `position` | `TBottomNavPosition` | `'start'` | Horizontal placement when the bar has a custom `width` — see [Position](#position). |
| `grow` | `boolean` | — | Stretch every child button to share the width evenly. |
| `color` / `bgColor` | `TColor` | — | Forwarded as defaults to every child button. |
| `density` | `TDensity` | — | Inherits from `IDensityProps`; `'compact'` reduces the bar height by `8px`. |
| `rounded`, `border`(+ color/style), `elevation` | — | — | Standard shape surface — see `IRoundedProps` / `IBorderProps` / `IElevationProps`. |
| `padding*`, `margin*` | — | — | Standard spacing surface — see `IPaddingProps` / `IMarginProps`. |
| `height`, `width`, `min/maxHeight`, `min/maxWidth` | — | — | Standard dimension surface — see `IDimensionProps`. When `height` is set, the actual applied height is `height` minus `8px` in `compact` density. |
| `name`, `order`, `absolute` | — | `name: 'bottom-navigation'` | Layout placement — see [Layout placement](#layout-placement). |
| `location` | `TDirectionBoth` | — | Declared on `ILayoutItemProps` (`layout.interface.ts:73`) and inherited onto `IBottomNavProps`, but never read by `OrigamBottomNav.vue` — the `useLayoutItem()` call hardcodes `position: computed(() => 'bottom')` (`OrigamBottomNav.vue:188`). Passing `location` has no effect. |
| `modelValue`, `disabled`, `multiple`, `mandatory`, `max`, `selectedClass` | — | `modelValue: true`, `selectedClass: 'origam-bottom-nav__btn--selected'` | Visibility + group selection — see [Visibility](#visibility) / [Group selection](#group-selection-multiple--mandatory--disabled). |
| `hover`, `active`, `activeClass` | `boolean \| IHoverState` / `boolean \| IActiveState` | — | State-aware overrides forwarded to child buttons — see [Color](#color). |
| `transition` | `boolean \| string \| TTransitionProps` | `{ component: OrigamTranslateBottom }` | Enter/leave animation — see [Transition](#transition). |

## Anatomy

```html
<nav class="origam-bottom-nav origam-bottom-nav--{mode} origam-bottom-nav--position-{position}">
    <div class="origam-bottom-nav__content">
        <!-- one <origam-btn class="origam-bottom-nav__btn"> per item -->
    </div>
</nav>
```

## Design tokens consumed

`<OrigamBottomNav>` reads from `tokens/component/bottom-nav.json`, under
the `bottom-bar` key — note the CSS variable prefix is
`--origam-bottom-bar---*`, not `--origam-bottom-nav---*`.

| CSS variable | Token reference |
|---|---|
| `--origam-bottom-bar---background` | `{color.neutral.200}` |
| `--origam-bottom-bar---color` | `{color.text.primary}` |
| `--origam-bottom-bar---height` | `{space.12}` (48px) |
| `--origam-bottom-bar---box-shadow` | `{shadow.none}` |
| `--origam-bottom-bar--elevated---box-shadow` | shadow projected **upward** (negative offset-Y), so it isn't clipped by the viewport edge |
| `--origam-bottom-bar--active---box-shadow` | same upward shadow, applied while the bar is active |
| `--origam-bottom-bar---border-radius` | `{radius.none}` at rest. The token layer also generates `--origam-bottom-bar__rounded---border-radius: {radius.sm}` (4px) for the `rounded` state, but nothing in `OrigamBottomNav.vue`'s SCSS reads that variable — the `&--rounded` rule hardcodes `var(--origam-radius---2xl, 24px)` directly (`OrigamBottomNav.vue:373-375`), so the applied radius is **24px**, not `{radius.sm}`. |
| `--origam-bottom-bar---density` / `-comfortable-density` / `-compact-density` | density-driven padding/height offset |
| `--origam-bottom-bar__content---justify-content` / `-align-items` / `-flex-wrap` | layout of the items row |
| `--origam-bottom-bar__content---transform` | Generated by the token layer (`light.css:566`) but **never read** — the SCSS's `transform` declaration and the `&--shift` override both target `--origam-bottom-bar__content--transform` (double `--`, not the generated triple-`-`-separated name; `OrigamBottomNav.vue:321` and `:468`). The two variables never meet: styling the shift-mode transform means overriding the double-dash name, not the token. |
| `--origam-bottom-bar---padding-*`, `--origam-bottom-bar---margin-*` | spacing (also driven by the `padding` / `margin` props) |

The full list lives in `tokens/component/bottom-nav.json`.

## Accessibility

- Renders a `<nav aria-label="Bottom navigation">` by default — the
  label is currently a hardcoded English string (not run through the
  DS's `useLocale()` translation layer, unlike `<OrigamBreadcrumb>`'s
  `aria-label`).
- Full keyboard support comes from the underlying `<origam-btn>`
  instances (native `<button>`/`<a>` semantics).

## Theming notes

- The component is theme-aware out of the box. Switching
  `<html data-theme="…">` re-resolves every variable instantly.
- A sub-tree can opt into a different theme via `<OrigamThemeProvider>`.

## Related

- `OrigamBtn` — the component rendered for each item.
- `OrigamLayout` / `OrigamMain` — the layout region system the bar
  registers into.
- `OrigamSystemBar` / `OrigamAppBar` — the top-of-viewport equivalents.
