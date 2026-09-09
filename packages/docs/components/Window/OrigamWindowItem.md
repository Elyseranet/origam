# OrigamWindowItem

`<OrigamWindowItem>` is a single slide of an `<OrigamWindow>`. Each item
registers itself with the window's group via `useGroupItem`, accepts a
`value` for selection, and runs the in/out transition driven by the
parent window's `direction` + `reverse` state.

## Basic usage

```vue
<template>
    <OrigamWindow v-model="step">
        <OrigamWindowItem :value="1">Slide 1</OrigamWindowItem>
        <OrigamWindowItem :value="2">Slide 2</OrigamWindowItem>
        <OrigamWindowItem :value="3">Slide 3</OrigamWindowItem>
    </OrigamWindow>
</template>
```

## Custom transition

`transition` overrides the transition name for forward navigation, and
`reverseTransition` for backward navigation. Pass `false` to skip the
transition entirely (e.g. for the initial mount).

```vue
<template>
    <OrigamWindowItem
        :value="1"
        transition="origam-fade-transition"
        reverse-transition="origam-fade-transition"
    >…</OrigamWindowItem>

    <OrigamWindowItem :value="2" :transition="false">No transition</OrigamWindowItem>
</template>
```

## Disabled

`disabled` prevents the item from being navigable through prev/next.
The window's group skips disabled items when computing the next active
index.

```vue
<template>
    <OrigamWindowItem :value="2" disabled>Locked slide</OrigamWindowItem>
</template>
```

## Lazy mount

`eager`, when paired with the window's lazy strategy, forces the item to
render up-front. Without `eager`, the item is rendered the first time it
becomes selected and stays mounted thereafter (see `useLazy`).

```vue
<template>
    <OrigamWindowItem :value="3" eager>Mounted at startup</OrigamWindowItem>
</template>
```

## Emits

| Emit | Payload | Description |
|---|---|---|
| `group:selected` | `{ value: boolean }` | Fired whenever the item's own selection state flips — `true` when it becomes the visible slide, `false` when it leaves. Emitted from the `isSelected` watcher in `useGroupItem`, so it fires on every change, never on mount. |

`IWindowItemEmits` extends `IGroupEmits`; the signature is shared with
every group-item component of the DS.

```vue
<template>
    <OrigamWindow v-model="step">
        <OrigamWindowItem :value="1" @group:selected="onSelected">Step 1</OrigamWindowItem>
    </OrigamWindow>
</template>

<script setup lang="ts">
    function onSelected (payload: { value: boolean }) {
        console.log(payload.value ? 'shown' : 'hidden')
    }
</script>
```

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | The slide content. Rendered inside the transition wrapper. |

## Props (interface)

```ts
interface IWindowItemProps extends ICommonsComponentProps, ILazyProps,
    IGroupItemProps, ITransitionComponentProps {
    transition?: boolean | string
    reverseTransition?: boolean | string
}
```

## Anatomy

```html
<transition>
    <div class="origam-window-item">
        <slot/>
    </div>
</transition>
```

## Design tokens consumed

Defined in `packages/ds/src/assets/css/tokens/light.css` and `dark.css`
(SCSS twins under `packages/ds/src/assets/scss/tokens/`).

| CSS variable | Default |
|---|---|
| `--origam-window-item---x-transition-duration` | `0.3s` |
| `--origam-window-item---x-transition-easing` | `cubic-bezier(0.25, 0.8, 0.5, 1)` |

The leave / enter transforms (`translateX(100%)`, `translateY(-100%)`,
etc.) are baked into the SCSS — they correspond to the four axis +
direction combinations the parent window can apply.

## Fallthrough attributes

The component sets `inheritAttrs: false` and re-binds `$attrs` onto the
rendered `.origam-window-item` element. Any attribute you pass that is not
a declared prop — `role`, `aria-*`, `title`, `data-*`, `tabindex` — lands on
that element.

This is not the default Vue behaviour and it is deliberate: the template
root is `<OrigamTransition>`, whose own root is Vue's built-in
`<Transition>`. `<Transition>` forwards nothing to the element it animates,
so without the explicit re-bind every attribute was silently dropped, with
no warning and no error.

```html
<origam-window-item
        value="a"
        role="group"
        aria-roledescription="slide"
        aria-label="Slide 1 of 3"
/>
```

The transition lifecycle hooks this component needs are unaffected — they
travel through the `transition` prop object, never through attrs.

## Accessibility

- Only the active item is visible (`v-show`), but every mounted item is
  in the DOM. Use `lazy` semantics if non-active panels include heavy
  media.
- Provide stable keys (`:value`) so the window's group can track the
  active item across reorders.
- The ARIA APG carousel pattern asks for `role="group"` +
  `aria-roledescription="slide"` on each slide. Pass them as plain
  attributes (see **Fallthrough attributes** above) — they reach the
  rendered element. The component does not set them for you, because a
  window item is not necessarily a carousel slide.

## Related

- `OrigamWindow` — the host carousel that drives selection +
  transitions for nested `<OrigamWindowItem>` children.
