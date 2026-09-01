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

⛔ **Corrected 2026-08-31 (issue #419)** — 4 of the 6 entries below were
written with a **double** tiret (`--origam-drawer--background`, `--color`,
`--box-shadow`, `--transition-duration`), which in this project's naming
convention denotes a *state modifier*
(`--{component}--{state}---{property}`). The component's SCSS uses the
**triple**-tiret plain form throughout
(`packages/ds/src/components/Drawer/OrigamDrawer.vue`, verified against
its `<style>` block). Copy-pasting the double-tiret spelling from the old
table changed nothing, silently. Only `--origam-drawer---width` and
`--origam-drawer__scrim---opacity` were already correct. The table below
also adds the tokens the component reads that the old table omitted
entirely.

| CSS variable | Description |
|---|---|
| `--origam-drawer---background` | Drawer background. |
| `--origam-drawer---color` | Drawer text color. |
| `--origam-drawer---box-shadow` | Shadow in temporary mode. |
| `--origam-drawer---width` | Drawer width (layout-driven). |
| `--origam-drawer---height` | Drawer height. |
| `--origam-drawer---max-width` | Drawer max width. |
| `--origam-drawer---border-color` / `---border-style` | Border color/style (all 4 sides). |
| `--origam-drawer---border-{top,right,bottom,left}-width` | Per-side border width (`0` by default). |
| `--origam-drawer---border-{start-start,start-end,end-start,end-end}-radius` | Per-corner logical radius (`none` by default). |
| `--origam-drawer---transition-duration` / `---transition-property` / `---transition-timing-function` | Open/close transition. |
| `--origam-drawer__scrim---background` | Backdrop color (default `color.overlay.scrim`). |
| `--origam-drawer__scrim---opacity` | Backdrop opacity. |
| `--origam-drawer__scrim---transition-duration` / `---transition-property` / `---transition-timing-function` | Backdrop fade transition. |

## Accessibility

- Renders as `<nav>` by default (override via `tag`).
- In temporary mode, focus is trapped within the drawer; `ESC` closes it.
- The scrim is `aria-hidden`.
