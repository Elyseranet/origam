# OrigamMenu

`<OrigamMenu>` is a **floating dropdown** built on `OrigamOverlay`. It opens
on click by default (or on hover / right-click) and positions itself connected
to its activator element. Nested menus are supported natively.

## Basic usage

```vue
<template>
    <OrigamMenu :items="[{ title: 'Edit' }, { title: 'Delete' }]">
        <template #activator="{ props: a }">
            <OrigamBtn v-bind="a">Actions</OrigamBtn>
        </template>
    </OrigamMenu>
</template>
```

## With title

```vue
<template>
    <OrigamMenu title="Options" :items="items">
        <template #activator="{ props: a }">
            <OrigamBtn v-bind="a">Options</OrigamBtn>
        </template>
    </OrigamMenu>
</template>
```

## Custom content

Use the `default` slot when `items` is insufficient.

```vue
<template>
    <OrigamMenu>
        <template #activator="{ props: a }">
            <OrigamBtn v-bind="a">Custom</OrigamBtn>
        </template>
        <OrigamList>
            <OrigamListItem title="Custom item" />
        </OrigamList>
    </OrigamMenu>
</template>
```

## Open on hover

```vue
<template>
    <OrigamMenu open-on-hover :open-on-click="false">
        <template #activator="{ props: a }">
            <OrigamBtn v-bind="a">Hover me</OrigamBtn>
        </template>
    </OrigamMenu>
</template>
```

## Offset

```vue
<template>
    <OrigamMenu :offset="[8, 8]">
        <template #activator="{ props: a }">
            <OrigamBtn v-bind="a">Offset</OrigamBtn>
        </template>
    </OrigamMenu>
</template>
```

## Size and density on the built-in list

When the menu renders its own list from `items` (rather than a `#default`
slot), `size` and `density` are forwarded to that `OrigamList`, which cascades
them to every row. This keeps a menu opened from a sized activator on the same
vertical scale as the activator itself.

```vue
<template>
  <OrigamMenu size="small" density="compact" :items="items">
    <template #activator="{ props }">
      <OrigamBtn v-bind="props" size="small">Actions</OrigamBtn>
    </template>
  </OrigamMenu>
</template>
```

A menu driven by the `#default` slot owns its own markup — pass `size` /
`density` to the `OrigamList` you mount there.

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `activator` | `{ props }` | Element that toggles the menu. Spread `props`. |
| `default` | — | Full content override (replaces the auto-generated list). |

## Events

| Name | Payload | When |
|---|---|---|
| `update:modelValue` | `boolean` | Menu open / close. |
| `contextmenu` | `MouseEvent` | Native right-click on the activator, forwarded — fires regardless of `openOnContextMenu`, so a parent can show its own context menu instead of (or alongside) the menu opening. |
| `select` | `IListItemProps` | A leaf row of `items` was clicked. Rows that open a submenu do **not** emit — opening a submenu is navigation, not a choice. |

When you render rows through the `items` prop, the menu owns the
`<origam-list-item>` that receives the click, so `select` is how you learn
which row was picked:

```vue
<origam-menu :items="items" @select="onSelect"/>
```

An item object may still carry its own `onClick`; both run on the same click.
Wire one or the other, not both, or a single click will be handled twice.
Prefer `onClick` when the handler needs the `MouseEvent` itself (to call
`preventDefault()`, for instance) — the `select` payload is the item, not the
event.

## Props (interface)

```ts
interface IMenuProps extends IOverlayProps, IListProps, Omit<IListItemProps,
    'prependIcon' | 'appendIcon' |
    'prependAvatar' | 'appendAvatar' |
    'prependAriaLabel' | 'appendAriaLabel'> {
    id?: string
}
```

### Own props

`<OrigamMenu>` inherits the whole `IOverlayProps` surface (activator,
location, scroll strategy, scrim, transition…) plus `IListProps` /
`IListItemProps` for the list it renders from `items`. Those are documented
on their own pages — the table below covers only what `IMenuProps` adds.

⛔ The **outer adjacent surface is excluded** from that inheritance (#756).
`<OrigamMenu>` renders no prepend/append zone of its own: a row takes its
media from the ITEM object (`{ title: 'Edit', prependIcon: 'mdi-pencil' }`),
which is what the `items` examples above do. The six props existed only
because `IListItemProps` carried them, and none of them reached the DOM —
including `prependAriaLabel` / `appendAriaLabel`, which would have been
accessible names for a zone that is never rendered.

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | `origam-menu-{uid}` | DOM id of the menu surface. Also the value the activator advertises through `aria-owns`, so set it when you need a stable, predictable hook for a test or an external `aria-controls`. Left unset, an auto-generated unique id is used. |

## Design tokens

| CSS variable | Description |
|---|---|
| `--origam-menu---background` | Menu surface background. |
| `--origam-menu---color` | Menu text color. |
| `--origam-menu---border-radius` | Menu border radius. |
| `--origam-menu---box-shadow` | Menu shadow. |
| `--origam-menu---max-height` | Maximum height before scrolling. |
| `--origam-menu---z-index` | Z-index stacking. |
| `--origam-menu__content---overflow` | Overflow of the menu surface. `auto` by default: the surface is the scrollport, so a list taller than the ceiling scrolls inside the panel instead of spilling out of it. Set to `visible` only if you deliberately want the content to escape the panel — the options below the ceiling then become unreachable. |
| `--origam-menu__content---max-width` | List container max-width. |
| `--origam-menu__content---padding` | List container padding. |

## Scrolling

The menu surface (`.origam-menu__content`) is the **scrollport**: it carries both
the height ceiling and the `overflow`. Two ceilings can apply, whichever is lower:

| Source | Applies to | Typical use |
|---|---|---|
| `--origam-menu---max-height` (default `calc(100vh - 32px)`) | the menu surface itself | keeps any menu inside the viewport |
| the `max-height` prop | `.origam-overlay__content`, the surface's parent | a caller capping a specific dropdown (`OrigamSelect` passes `310`) |

The parent is a flex column container, which is what makes a ceiling set on it
opposable to the surface. Before this was the case (#742) the ceiling and the
`overflow` sat on two different boxes: the capped box kept `overflow: visible`
and let its content spill, while the box that could scroll had no ceiling at all
(`clientHeight === scrollHeight`, nothing to scroll). A 30-option list rendered
1448px tall inside a 310px cap and the bottom 20 options were unreachable with
both the mouse and the keyboard.

Nested sub-menus are **not** clipped by that scrollport: every overlay level is
teleported into `body > .origam-overlay-container`, so a flyout is never a DOM
descendant of its parent's surface.

## Accessibility

- `role="menu"` is set on the overlay.
- The activator gets `aria-haspopup="menu"`, `aria-expanded`, and `aria-owns`.
- Arrow keys navigate between focusable list items.
- `ESC` and `Tab` close the menu and return focus to the activator.
