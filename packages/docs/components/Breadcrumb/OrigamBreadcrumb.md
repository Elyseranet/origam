# OrigamBreadcrumb

`<OrigamBreadcrumb>` renders a navigation trail (`<nav>` containing an
`<ol>` of crumbs) from an `items` array, with a divider between
consecutive crumbs. It is composed of three components:

- **`<OrigamBreadcrumb>`** — the `<nav>` root, iterates `items` and
  wires up crumb + divider rendering.
- **`<OrigamBreadcrumbItem>`** — a single crumb (link or plain span).
- **`<OrigamBreadcrumbDivider>`** — the separator between two crumbs
  (a character or an `OrigamIcon`).

## Basic usage

```vue
<template>
    <OrigamBreadcrumb :items="items" />
</template>

<script setup lang="ts">
const items = [
    { title: 'Home',    href: '/' },
    { title: 'Section', href: '/section' },
    { title: 'Current' },
]
</script>
```

Items also accept plain strings — a string item becomes `{ title: item }`
with no link:

```vue
<template>
    <OrigamBreadcrumb :items="['Home', 'Section', 'Current']" />
</template>
```

The **last** item in `items` is always normalized to `disabled: true` and
`active: true` (`aria-current="page"`), regardless of what you pass —
this reflects "you are here" and matches the standard breadcrumb
pattern.

## Divider

`divider` (default `'/'`) is forwarded to every `<OrigamBreadcrumbDivider>`
between two crumbs. It accepts a plain string, or an MDI icon identifier
— when the value matches a known `MDI_ICONS` entry, an `<OrigamIcon>` is
rendered instead of literal text.

```vue
<template>
    <OrigamBreadcrumb :items="items" :divider="MDI_ICONS.CHEVRON_RIGHT" />
</template>
```

## Color, density, shape, spacing

`<OrigamBreadcrumb>` exposes the standard visual surface —
`color`/`bgColor`, `density`, `rounded`, `border` (+`borderColor`/
`borderStyle`), `elevation`, `padding*`/`margin*`. `color`, `bgColor`,
`density`, `hover`, `active` and `disabled` are also forwarded as
**defaults** to every child `<OrigamBreadcrumbItem>` (items that set
their own value still win):

```vue
<template>
    <OrigamBreadcrumb
        :items="items"
        color="primary"
        density="compact"
        rounded="small"
        border
    />
</template>
```

> Passing both `color` and `bgColor` with the **same** intent is
> intentional — it's what lets each item's auto-contrast branch inside
> `useStateEffect` pick a legible foreground against the shared
> background, instead of resolving a subtle "on-bg" tint meant for a
> transparent surface.

## Disabling the whole trail

`disabled` on `<OrigamBreadcrumb>` is forwarded as a default to every
item — combined with each item's own `disabled` (the last item is
always disabled regardless).

## Slots

| Component | Slot | Slot props | Description |
|---|---|---|---|
| `<OrigamBreadcrumb>` | `default` | — | Overrides the entire `<ol>` rendering. |
| `<OrigamBreadcrumb>` | `item.{index}` | `{ item, index }` | Overrides a single crumb by index. |
| `<OrigamBreadcrumb>` | `item` | `{ item, index }` | Overrides every crumb's rendering (falls back to `<origam-breadcrumb-item v-bind="item">`). |
| `<OrigamBreadcrumb>` | `item.title` | — | Passed through as the default slot of the fallback `<origam-breadcrumb-item>` — lets you customize the title content without replacing the whole item. |
| `<OrigamBreadcrumb>` | `divider.{index}` | `{ divider }` | Overrides a single divider by index. |
| `<OrigamBreadcrumb>` | `divider` | `{ divider }` | Overrides every divider (falls back to `<origam-breadcrumb-divider :divider="divider">`). |
| `<OrigamBreadcrumbItem>` | `default` | — | Overrides the crumb's content (falls back to `<span>{{ title }}</span>`). |
| `<OrigamBreadcrumbItem>` | `prepend` | — | Overrides the prepend icon/avatar. |
| `<OrigamBreadcrumbItem>` | `append` | — | Overrides the append icon/avatar. |
| `<OrigamBreadcrumbDivider>` | `default` | — | Overrides the divider content (falls back to the icon/character). |

```vue
<template>
    <OrigamBreadcrumb :items="items">
        <template #item="{ item, index }">
            <OrigamBreadcrumbItem v-bind="item" :prepend-icon="index === 0 ? MDI_ICONS.HOME : undefined" />
        </template>
        <template #divider>
            <OrigamIcon :icon="MDI_ICONS.CHEVRON_DOUBLE_RIGHT" />
        </template>
    </OrigamBreadcrumb>
</template>
```

## Emits

| Component | Event | Payload | Description |
|---|---|---|---|
| `<OrigamBreadcrumbItem>` | `click:prepend` | `MouseEvent` | Clicked the prepend slot. |
| `<OrigamBreadcrumbItem>` | `click:append` | `MouseEvent` | Clicked the append slot. |

`<OrigamBreadcrumb>` and `<OrigamBreadcrumbDivider>` emit nothing of
their own.

## Props

### `<OrigamBreadcrumb>`

```ts
interface IBreadcrumbProps extends IColorProps, IBgColorProps, ITagProps,
    ICommonsComponentProps, IDensityProps, IRoundedProps, IPaddingProps,
    IMarginProps, IBorderProps, IElevationProps, IHoverProps,
    IActiveProps {
    disabled?: boolean
    divider?: string | TIcon
    items?: Array<TBreadcrumbItem>
}
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `Array<string \| Partial<IBreadcrumbItemProps>>` | `[]` | Crumbs to render. String entries become `{ title }`. |
| `divider` | `string \| TIcon` | `'/'` | Separator between crumbs — text or MDI icon id. |
| `tag` | `string` | `'nav'` | Root element/component. |
| `density` | `TDensity` | `'default'` | Compresses the root's padding. |
| `disabled` | `boolean` | — | Forwarded as a default `disabled` to every item. |
| `color` / `bgColor` | `TColor` | — | Forwarded as defaults to every item. |
| `hover` / `active` / `activeClass` | `boolean \| IHoverState` / `boolean \| IActiveState` / `string` | — | `hover`/`active` forwarded as defaults to every item. `activeClass` is part of `IActiveProps` but is not itself propagated to items. |
| `rounded`, `border`(+`borderColor`/`borderStyle`), `elevation` | — | — | Standard shape surface — see `IRoundedProps` / `IBorderProps` / `IElevationProps`. |
| `padding*`, `margin*` | — | — | Standard spacing surface — see `IPaddingProps` / `IMarginProps`. |

### `<OrigamBreadcrumbItem>`

```ts
interface IBreadcrumbItemProps extends ICommonsComponentProps, ITagProps,
    IBorderProps, IPaddingProps, IMarginProps, IRoundedProps, ILinkProps,
    IColorProps, IBgColorProps, IDensityProps, IAdjacentProps,
    IHoverProps, IActiveProps {
    title: string
    disabled?: boolean
}
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | — | Required. Crumb label, rendered via the default slot fallback. |
| `disabled` | `boolean` | — | Also forced `true` on the last item by the parent `<OrigamBreadcrumb>`. Sets `pointer-events: none` and dims opacity. |
| `tag` | `string` | `'span'` | Root element — overridden to an `<a>` internally by `useLink` when `href`/`to` resolves to a link. |
| `href` / `to` / `replace` / `exact` | — | — | Standard link surface — see `ILinkProps`. When present, `aria-current="page"` is set if the resolved route/`active` state matches. |
| `prependIcon` / `prependAvatar` / `appendIcon` / `appendAvatar` | — | — | Standard adjacent surface — see `IAdjacentProps`. |
| `color` / `bgColor` | `TColor` | — | Resolved against the parent's `<OrigamBreadcrumb>`-level defaults when unset (via `useDefaults`). |
| `density` | `TDensity` | `'default'` | Resolved against the parent's default when unset. |
| `hover` / `active` | `boolean \| IHoverState` / `boolean \| IActiveState` | — | Resolved against the parent's default when unset. |
| `activeClass` | `string` | — | Custom class applied while `isActive` (own or route-matched) is true. |
| `rounded`, `border` | — | — | Standard shape surface. |
| `padding*`, `margin*` | — | — | Standard spacing surface. |

### `<OrigamBreadcrumbDivider>`

```ts
interface IBreadcrumbDividerProps extends ICommonsComponentProps, ITagProps,
    IPaddingProps, IMarginProps, IDensityProps, IColorProps, IBgColorProps,
    ISizeProps {
    divider: string | TIcon
}
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `divider` | `string \| TIcon` | `'/'` | Required. Rendered as literal text unless it matches a known `MDI_ICONS` value, in which case an `<origam-icon>` is rendered instead. |
| `tag` | `string` | `'span'` | Root element/component. |
| `size` | `TSize \| number` | — | Standard size surface — see `ISizeProps`. |
| `color` / `bgColor` | `TColor` | — | **Not** resolved against the parent `<OrigamBreadcrumb>` — the divider has no `useDefaults()` wiring, unlike `<OrigamBreadcrumbItem>`. |
| `padding*`, `margin*` | — | — | Standard spacing surface. |

## Anatomy

```html
<nav class="origam-breadcrumb" aria-label="Breadcrumb">
    <ol class="origam-breadcrumb__items">
        <li class="origam-breadcrumb__item">
            <a class="origam-breadcrumb-item origam-breadcrumb-item--link">Home</a>
            <span class="origam-breadcrumb-divider">/</span>
        </li>
        <li class="origam-breadcrumb__item">
            <span class="origam-breadcrumb-item origam-breadcrumb-item--disabled"
                  aria-current="page">Current</span>
        </li>
    </ol>
</nav>
```

Each crumb renders as a **single** `<li class="origam-breadcrumb__item">`
that holds the crumb **and** the divider following it — there is no
dedicated `<li>` for the divider (`OrigamBreadcrumb.vue`, lines 17-45).
The last crumb has no divider inside its `<li>`.

## Design tokens consumed

`<OrigamBreadcrumb>` reads from `tokens/component/breadcrumb.json`,
which declares a single `breadcrumb` block with nested `item` and
`divider` sub-blocks. Style Dictionary emits the nested entries as BEM
children of the root component:

| CSS variable | Token reference | Consumed by |
|---|---|---|
| `--origam-breadcrumb---background` | `transparent` | `<OrigamBreadcrumb>` root |
| `--origam-breadcrumb---color` | `{color.text.primary}` | `<OrigamBreadcrumb>` root |
| `--origam-breadcrumb---border-radius` | `{radius.none}` | `<OrigamBreadcrumb>` root — a `--origam-breadcrumb---border-radius-rounded` var (`{radius.sm}`, 4px) is also generated, but the component's `--rounded` modifier never reads it: `OrigamBreadcrumb.vue` hardcodes `border-radius: var(--origam-radius---2xl, 24px)` directly, so `--rounded` actually renders **24px**, not 4px |
| `--origam-breadcrumb---box-shadow-elevated` | `{shadow.md}` | Generated in `main.css`, but **not read** by the component — the `--elevated` modifier in `OrigamBreadcrumb.vue` sets its local `--origam-breadcrumb---box-shadow` straight to `var(--origam-shadow---md, …)`, bypassing this variable entirely |
| `--origam-breadcrumb---padding-block` / `-inline` | `{space.2}` | Generated in `main.css`, but **not read** — the component hardcodes its own local `--origam-breadcrumb---padding-{block,inline}-{start,end}` vars to a literal `8px`, ignoring these token-driven variables |
| `--origam-breadcrumb---gap` | `{space.0}` | Generated in `main.css`, but **not read anywhere** — `&__items` has no `gap` declaration; crumbs are only spaced by the divider's own inline padding |
| `--origam-breadcrumb__item---hover-color` | `{color.action.primary.bg}` | crumb hover affordance |
| `--origam-breadcrumb__item---active-color` | `{color.text.secondary}` | current-page crumb |
| `--origam-breadcrumb__item---opacity-disabled` | `{opacity.50}` | disabled crumb |
| `--origam-breadcrumb__divider---character` | `'/'` | default divider glyph |
| `--origam-breadcrumb__divider---padding-inline` | `{space.2}` | breathing room around the divider |
| `--origam-breadcrumb---home-icon-color` | `{color.action.primary.bg}` | optional home icon (via `prependIcon` on the first item) |

> **Known gap:** the generated globals above use the BEM naming
> `--origam-breadcrumb__item---*` / `--origam-breadcrumb__divider---*`
> (per the project's `component.card.overlay.bg` → `--origam-card__overlay---bg`
> convention). `OrigamBreadcrumbItem.vue` and `OrigamBreadcrumbDivider.vue`'s
> own scoped `<style>` blocks, however, read a **different, hyphenated**
> variable family — `--origam-breadcrumb-item---*` and
> `--origam-breadcrumb-divider---*` — which does not exist anywhere in
> the generated stylesheet (confirmed: zero matches in
> `packages/ds/src/assets/css/main.css`). In practice this means the
> `item.hover-color` / `item.active-color` / `divider.character` /
> `divider.padding-inline` design tokens declared in
> `tokens/component/breadcrumb.json` never reach the rendered item or
> divider — both always fall back to the hardcoded local defaults set
> at the top of their own scoped style block (e.g. item `color: inherit`,
> divider `padding-inline: 8px`). To actually theme an item or divider
> today, target the **local** variable directly, e.g.:
> `.origam-breadcrumb-item { --origam-breadcrumb-item---color: var(--origam-color__text---secondary); }`.
> This looks like a real naming-drift bug — flagged for a follow-up
> ticket rather than fixed here.

## Accessibility

- `<OrigamBreadcrumb>` renders `aria-label="Breadcrumb"` by default,
  translated via the DS's `useLocale()` (`t('origam.breadcrumb.ariaLabel', 'Breadcrumb')`).
- The crumb list is a real `<ol>`/`<li>` structure — screen readers
  announce it as an ordered list of navigation links.
- The current page's crumb carries `aria-current="page"` and
  `pointer-events: none` (via the `--disabled` modifier).
- `<OrigamBreadcrumbDivider>` is decorative; it carries no `aria-hidden`
  attribute of its own, so a text divider (e.g. `/`) is read aloud by
  screen readers between crumbs — worth keeping in mind if you switch to
  a purely visual glyph divider.

## Theming notes

- The component is theme-aware out of the box for the **root** surface
  (background, color, radius, elevation). Switching `<html data-theme="…">`
  re-resolves those variables instantly.
- Item/divider-level tokens have the naming-drift gap described above —
  see the note under "Design tokens consumed".
- A sub-tree can opt into a different theme via `<OrigamThemeProvider>`.

## Related

- `OrigamIcon` — renders the divider glyph when `divider` matches an
  MDI icon id, and the item's `prependIcon`/`appendIcon`.
- `OrigamAvatar` — renders the item's `prependAvatar`/`appendAvatar`.
