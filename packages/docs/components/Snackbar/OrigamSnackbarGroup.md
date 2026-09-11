# OrigamSnackbarGroup

`<OrigamSnackbarGroup>` is a **multi-toast notification system** built on
top of the same intent / token vocabulary as `<OrigamSnackbar>`. Unlike
the single-shot snackbar, the stack is driven by a composable —
`useSnackbarGroup({ id })` — and renders any number of concurrent
notifications in a chosen anchor location of the viewport.

The component itself owns no template-level state: callers programmatically
push items via `notify()` and the stack handles ordering, FIFO eviction
past `max`, per-item auto-dismiss timers, intent-driven ARIA `role` /
`aria-live`, action buttons, and slide-in / slide-out transitions
(automatically degraded under `prefers-reduced-motion`).

## Basic usage

```vue
<template>
    <OrigamBtn @click="ping">Notify</OrigamBtn>
    <OrigamSnackbarGroup location="bottom-right" />
</template>

<script setup lang="ts">
    import { useSnackbarGroup } from '@origam/composables'

    const { notify } = useSnackbarGroup()

    function ping() {
        notify({
            title: 'Saved',
            message: 'Your profile was updated.',
            intent: 'success',
            duration: 3000
        })
    }
</script>
```

## Multiple independent stacks

Each `useSnackbarGroup({ id })` call keys into its own bucket. Render as
many `<OrigamSnackbarGroup :id="…">` as you need — global, per-region,
per-feature — and address them independently.

```vue
<template>
    <OrigamSnackbarGroup id="global" location="top-right" />
    <OrigamSnackbarGroup id="builder" location="bottom-left" />
</template>

<script setup lang="ts">
    import { useSnackbarGroup } from '@origam/composables'

    const builder = useSnackbarGroup({ id: 'builder' })

    function onSaveDraft() {
        builder.notify({
            title: 'Draft saved',
            intent: 'info'
        })
    }
</script>
```

## Action buttons

Each item can carry one or more action buttons. By default, clicking an
action runs the handler **and** dismisses the item (set `keepOpen: true`
to keep it visible).

```vue
<script setup lang="ts">
    import { useSnackbarGroup } from '@origam/composables'

    const { notify } = useSnackbarGroup()

    function onDelete(row) {
        notify({
            title: 'Item deleted',
            intent: 'warning',
            duration: 8000,
            actions: [
                {
                    label: 'Undo',
                    intent: 'primary',
                    handler: () => restore(row)
                }
            ]
        })
    }
</script>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | `'default'` | Identifier of the stack — pair with `useSnackbarGroup({ id })`. |
| `location` | `TSnackbarGroupLocation` | `'bottom-right'` | Anchor location (`top-left`, `top-right`, `top-center`, `bottom-left`, `bottom-right`, `bottom-center`, `top`, `bottom`). |
| `max` | `number` | `5` | Maximum number of items rendered concurrently. Excess items are evicted FIFO. |
| `defaultDuration` | `number` | `5000` | Default auto-dismiss timeout (ms). `0` makes new items sticky. |
| `spacing` | `string \| number` | `'12px'` | Gap between stacked items. |
| `direction` | `TSnackbarGroupDirection` | auto | `'top-down'` for `top-*` locations, `'bottom-up'` for `bottom-*` locations. Override explicitly when needed. |
| `tag` | `string` | `'div'` | Root tag for the region. |

The component teleports to `document.body` so its position is independent
of any parent overflow / transform context.

## Composable API — `useSnackbarGroup`

```ts
import { useSnackbarGroup } from '@origam/composables'

const { notify, dismiss, dismissAll, items } = useSnackbarGroup({
    id: 'global',           // optional, default 'default'
    max: 20,                // optional global cap on the store
    defaultDuration: 5000   // optional, applied when item omits duration
})
```

| Method | Signature | Description |
|---|---|---|
| `notify` | `(opts: ISnackbarGroupItemOptions) => string` | Pushes an item, returns its generated id. |
| `dismiss` | `(id: string) => void` | Removes a specific item and fires its `onDismiss`. |
| `dismissAll` | `() => void` | Clears the stack — each item's `onDismiss` fires. |
| `items` | `Readonly<Ref<…>>` | Reactive read-only list. Use for debugging or custom rendering. |

Calling `useSnackbarGroup({ id })` multiple times with the same `id`
returns handles backed by the same underlying store — `notify` here,
`dismiss` there.

## `ISnackbarGroupItemOptions`

| Field | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | — | Bold first line. |
| `message` | `string` | — | Body text under the title (or sole line if no title). |
| `intent` | `TIntent` | `'info'` | Semantic intent — drives icon defaults, `role=status/alert`, surface coloring. |
| `duration` | `number` | stack default | Auto-dismiss timeout (ms). `0` = sticky. |
| `icon` | `TIcon` | per-intent | Prepend icon override. |
| `actions` | `Array<ISnackbarGroupItemAction>` | — | Action buttons rendered in the footer. |
| `dismissible` | `boolean` | `true` | Whether to show the close (X) button. |
| `onDismiss` | `() => void` | — | Callback fired once the item leaves the stack (any cause). |

### `ISnackbarGroupItemAction`

| Field | Type | Required | Description |
|---|---|---|---|
| `label` | `string` | yes | Button label. |
| `handler` | `() => void` | yes | Invoked on click. |
| `intent` | `TIntent` | no | Optional intent override for the action button color. |
| `keepOpen` | `boolean` | no | When `true`, the item stays visible after the click. |

## Accessibility

- The stack root carries `role="region"` + `aria-label="Notifications"`
  so assistive technology can navigate to it directly.
- Each item carries either `role="status"` + `aria-live="polite"` for
  `info` / `success` / neutral intents, or `role="alert"` +
  `aria-live="assertive"` for `warning` / `danger` intents. Screen
  readers therefore announce critical errors immediately while
  informational toasts wait for a free moment.
- `aria-atomic="true"` is set so updates to the item announce as a unit.
- The dismiss button is a real `<button type="button">` with a descriptive
  `aria-label`, focusable through the regular Tab order.
- The slide-in / slide-out transition collapses to a quick fade under
  `prefers-reduced-motion: reduce`.

## Slots

`<OrigamSnackbarGroup>` is **composable-driven** and does not expose a
default slot. Item content is configured per-`notify()` call (title,
message, intent, icon, actions). This is intentional — it keeps the
declarative template free of imperative spawn logic and lets background
services (auth, sync, validation) push notifications from anywhere
without holding a component ref.

## Design tokens

| CSS variable | Description |
|---|---|
| `--origam-snackbar-group---z-index` | Stack z-index (default `toast`). |
| `--origam-snackbar-group---gap` | Gap between stacked items. |
| `--origam-snackbar-group---max-width` | Max width of the stack container. |
| `--origam-snackbar-group---transition-duration` | Slide-in / slide-out duration. |
| `--origam-snackbar-group---position-top` | Top offset for top-anchored stacks. |
| `--origam-snackbar-group---position-bottom` | Bottom offset for bottom-anchored stacks. |
| `--origam-snackbar-group---position-left` | Left offset for left-anchored stacks. |
| `--origam-snackbar-group---position-right` | Right offset for right-anchored stacks. |
| `--origam-snackbar-group__item---background-color` | Item surface background. |
| `--origam-snackbar-group__item---border-color` | Item surface border. |
| `--origam-snackbar-group__item---color` | Item text color. |
| `--origam-snackbar-group__item---box-shadow` | Item elevation. |
| `--origam-snackbar-group__item---border-radius` | Item corner radius. |
| `--origam-snackbar-group__item---padding` | Item inner padding. |
| `--origam-snackbar-group__item---min-width` / `max-width` | Item width clamp. |
| `--origam-snackbar-group__item---action-color` | Action button color. |

Intent-based surface colors fall through to the shared semantic
`--origam-color__feedback--{intent}---*` tokens, so a single design-token
brand swap re-skins both `OrigamSnackbar` and `OrigamSnackbarGroup`
together.
