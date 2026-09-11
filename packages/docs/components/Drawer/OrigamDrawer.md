# OrigamDrawer

`<OrigamDrawer>` is a **side-panel navigation surface** that participates in the
`OrigamLayout` system. It supports permanent, temporary (modal), rail, and sticky modes
with touch-swipe support.

## Basic usage

```vue
<template>
    <OrigamApp>
        <OrigamDrawer v-model="open">
            <OrigamList>
                <OrigamListItem title="Home" />
                <OrigamListItem title="Settings" />
            </OrigamList>
        </OrigamDrawer>
        <OrigamMain>…</OrigamMain>
    </OrigamApp>
</template>
```

## Temporary (modal)

```vue
<template>
    <OrigamDrawer v-model="open" temporary>…</OrigamDrawer>
</template>
```

## Permanent

```vue
<template>
    <OrigamDrawer permanent>…</OrigamDrawer>
</template>
```

## Rail mode

Icon-only width. Expands on hover when combined with `expandOnHover`.

```vue
<template>
    <OrigamDrawer rail expand-on-hover>…</OrigamDrawer>
</template>
```

## Location

Accepts `left` (default), `right`, or `bottom`.

```vue
<template>
    <OrigamDrawer location="right">…</OrigamDrawer>
</template>
```

## Width

```vue
<template>
    <OrigamDrawer :width="320">…</OrigamDrawer>
</template>
```

## Scrim

Pass `scrim` (boolean or color) for the backdrop shown in temporary mode.

```vue
<template>
    <OrigamDrawer temporary scrim>…</OrigamDrawer>
</template>
```

## Slots

| Slot | Description |
|---|---|
| `wrapper` | Full override of the internal layout. |
| `prepend` | Top area (logo, user avatar, …). |
| `default` | Scrollable body (navigation list, …). |
| `append` | Bottom area (logout, version, …). |

## Events

| Name | Payload | When |
|---|---|---|
| `update:modelValue` | `boolean` | Drawer open / close. |
| `update:rail` | `boolean` | Rail state toggled by hover when `expandOnHover`. |

## Design tokens

| CSS variable | Description |
|---|---|
| `--origam-drawer--background` | Drawer background. |
| `--origam-drawer--color` | Drawer text color. |
| `--origam-drawer--box-shadow` | Shadow in temporary mode. |
| `--origam-drawer---width` | Drawer width (layout-driven). |
| `--origam-drawer--transition-duration` | Open/close transition. |
| `--origam-drawer__scrim---opacity` | Backdrop opacity. |

## Accessibility

- Renders as `<nav>` by default (override via `tag`).
- In temporary mode, focus is trapped within the drawer; `ESC` closes it.
- The scrim is `aria-hidden`.
