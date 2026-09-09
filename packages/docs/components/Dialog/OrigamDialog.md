# OrigamDialog

`<OrigamDialog>` is a **modal dialog** built on `OrigamOverlay` and `OrigamCard`. It
manages focus trapping, ARIA attributes, scroll blocking, and keyboard dismissal
(`ESC`). Use it for confirmation dialogs, forms, and informational messages.

## Basic usage

```vue
<template>
    <OrigamDialog v-model="open" title="Hello">
        <template #activator="{ props: a }">
            <OrigamBtn v-bind="a">Open</OrigamBtn>
        </template>
        <template #content>Dialog body text.</template>
        <template #footer>
            <OrigamBtn @click="open = false">Close</OrigamBtn>
        </template>
    </OrigamDialog>
</template>
```

## Props

⛔ **Added 2026-08-31 (issue #419)** — this component had no Props table at
all despite exposing ~20 props through `IOverlayProps` / `ICardProps` /
`IStatusProps`. Grouped to mirror the story's own control groups
(`packages/stories/components/stories/Dialog/OrigamDialog.story.vue`,
Design + Functional Variants) rather than re-deriving an ad-hoc grouping.

| Group | Prop | Type | Description |
|---|---|---|---|
| Behaviour | `fullscreen` | `boolean` | Dialog fills the viewport, no margin/rounding. |
| | `retainFocus` | `boolean` | Loops focus inside the dialog with Tab / Shift+Tab. Default `true`. |
| | `persistent` | `boolean` (from `IOverlayProps`) | Disables closing on `ESC` / outside click. |
| | `disabled` | `boolean` (from `IOverlayProps`) | Prevents the activator from opening the dialog. |
| Sizing | `size` | `'x-small' \| 'small' \| 'default' \| 'large' \| 'x-large'` | Preset width rung — see `--origam-dialog---width-*` tokens. |
| | `density` | (from `ICardProps`) | Forwarded to the inner `<OrigamCard>`. |
| Color | `color` / `bgColor` | `TIntent \| string` (from `ICardProps`) | Forwarded to the inner `<OrigamCard>`. |
| Shape | `rounded`, `elevation`, `flat` | (from `ICardProps`) | Forwarded to the inner `<OrigamCard>`. |
| Border | `border`, `borderColor`, `borderStyle` | (from `ICardProps`) | Forwarded to the inner `<OrigamCard>`. |
| Status | `status`, `statusIconPosition` | (from `IStatusProps`) | Built-in status icon — see [Status / icon](#status--icon). |
| Icons | `prependIcon`, `appendIcon`, `icon` | `TIcon` (from `ICardProps`) | Forwarded to the inner `<OrigamCard>` header. |
| Content | `title`, `subtitle`, `text`, `image` | `string` (from `ICardProps`) | Forwarded to the inner `<OrigamCard>`. |
| Dimension | `width`, `height` | `number \| string` (from `IOverlayProps` / `IDimensionProps`) | Sizes the content container. |
| Accessibility | `closeLabel` | `string` | Accessible name (locale key) of the built-in close button — see [Accessibility](#accessibility). |

`IDialogProps` also extends the full `IOverlayProps` surface (activator,
location strategy, scroll strategy, lazy mount, transition, scrim — see
the `OrigamOverlay` doc) and the full
`ICardProps` surface beyond what's listed above — this table covers the
props exercised by the component's own story, not every inherited prop.

## Fullscreen

```vue
<template>
    <OrigamDialog v-model="open" fullscreen title="Full screen dialog">…</OrigamDialog>
</template>
```

## Scrolling

The dialog's content area scrolls internally, **unconditionally** — the header
and footer stay pinned while `.origam-card__content` takes the overflow. There
is no prop to configure this, and none is needed.

::: warning `scrollable` was removed — issue #419
`<OrigamDialog>` used to declare a `scrollable` boolean. It emitted an
`origam-dialog--scrollable` modifier class that **no SCSS rule in the codebase
ever targeted**, and the layout it claimed to enable was already applied
unconditionally by the rules above. It was therefore redundant, not merely
inert: passing it, or not, produced byte-identical computed styles. Measured in
Chromium, both readings of `[overflow-y|overflow-x|max-height|height|display|flex-direction]`
across `.origam-overlay__content` / `.origam-card` / `.origam-card__content`:

```
visible|visible|calc(100% - 48px)|430px|block|row
// hidden|hidden|100%|430px|flex|column
// auto|auto|100%|330px|flex|column
```

Removing it changes no rendering whatsoever. It is a typed-API removal only:
code passing `scrollable` now fails to type-check, and should simply drop the
prop.

**A separate, still-open defect was explicitly carved out of this decision**:
content that overflows *outside* `.origam-card__content` — a tall `#asset`,
`#text`, or header region — is clipped by the card's `overflow: hidden` with no
way to reach it. Removing `scrollable` neither caused nor fixed that; it has its
own ticket. Do not read #419 as having settled it.
:::

## Status / icon

Built-in status icons via the `status` prop.

```vue
<template>
    <OrigamDialog v-model="open" status="success" title="Saved!" />
</template>
```

## Persistent

```vue
<template>
    <OrigamDialog v-model="open" persistent title="Must confirm">…</OrigamDialog>
</template>
```

## Retain focus

Keep focus inside the dialog. Enabled by default (`retainFocus`).

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `activator` | `{ props }` | Element that opens the dialog. Spread `props`. |
| `default` | `{ isActive }` | Full content override (bypasses the inner card). |
| `loader` | — | Custom loader inside the card. |
| `header` | — | Replaces the card header. |
| `header-prepend` | — | Icon / avatar in the header. |
| `header-title` | — | Custom title markup. |
| `header-subtitle` | — | Custom subtitle markup. |
| `header-content` | — | Extra header body. |
| `header-append` | — | Replaces the built-in close button. |
| `asset` | — | Image / media banner. |
| `text` | — | Card text region. |
| `content` | — | Main scrollable body. |
| `footer` | — | Action row at the bottom. |

## Events

| Name | Payload | When |
|---|---|---|
| `update:modelValue` | `boolean` | Open / close. |
| `isRead` | `true` | Bottom of content scrolled into view (accessibility gate). |
| `click:outside` | `MouseEvent` | Click landed outside the content (non-persistent only). |

## Design tokens

| CSS variable | Description |
|---|---|
| `--origam-dialog---max-height` | Maximum height of the content container. |
| `--origam-dialog---max-width` | Maximum width of the content container. |
| `--origam-dialog---border-radius` | Dialog border radius. |
| `--origam-dialog---box-shadow` | Dialog shadow. |
| `--origam-dialog__fullscreen---max-width` | Full-screen override. |
| `--origam-dialog__fullscreen---max-height` | Full-screen override. |

## Accessibility

- `role="dialog"` and `aria-modal="true"` are set automatically.
- `aria-labelledby` points at the id the inner `<OrigamCard>` puts on its title
  element, so a plain `title` prop is enough to give the dialog an accessible
  name — no extra ARIA needed. The reference is asserted to actually resolve in
  `packages/tests/TU/components/Dialog/dialog-contract.spec.ts`; a dangling
  `aria-labelledby` would leave the dialog unnamed, which is worse than no
  attribute at all.
- The header's built-in close button is rendered unconditionally when the
  `header-append` slot is not supplied. It reaches `<OrigamCard>` through
  Card's OWN slot name (`header.append`, point notation) — the same spec pins
  that seam, because a name mismatch there silently drops the button and leaves
  the dialog closable only by `ESC` or an outside click.
- `aria-haspopup="dialog"` and `aria-expanded` are applied to the activator.
- Focus moves into the dialog on open and returns to the activator on close.
- `ESC` closes non-persistent dialogs.
- `retainFocus` (default `true`) loops focus inside the dialog with Tab / Shift+Tab.
- `closeLabel` (`string`, default `'origam.close'`) is the accessible name of the built-in close button. It carries a **locale key**, not final text — resolved through the DS `t()` mechanism, the same key `OrigamAlert` and `OrigamChip` use for their own close control. A raw string that matches no key is returned unchanged, so `closeLabel="Dismiss this dialog"` still works for consumers who prefer to translate on their side.
