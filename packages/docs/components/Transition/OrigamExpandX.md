# OrigamExpandX

`<OrigamExpandX>` animates the **width** of its slot from `0` to its
natural pixel width on enter, and the reverse on leave. Use for
horizontally collapsing rails, sidebars, or chip rows.

The transition is **JS-driven**: it measures `offsetWidth` and toggles
`overflow: hidden` so the content doesn't spill mid-flight.

## Basic usage

```vue
<template>
    <OrigamExpandX>
        <div v-if="open">{{ content }}</div>
    </OrigamExpandX>
</template>
```

## Grouped / list usage

Set `group` to animate a **keyed list** of items instead of a single
element — the root switches from Vue's `Transition` to `TransitionGroup`,
which is what makes the `-move` CSS var below apply: as an item enters or
leaves, its siblings smoothly translate into their new position (FLIP)
instead of jumping.

```vue
<template>
    <OrigamExpandX group>
        <div v-for="chip in chips" :key="chip.id">{{ chip.label }}</div>
    </OrigamExpandX>
</template>
```

`mode` (`in-out` / `out-in` / `default`) only applies to the single-child
form — Vue's `TransitionGroup` doesn't support it, so it's silently
omitted from the underlying transition when `group` is true (no dev
warning either way).

## CSS variables consumed

| Variable | Default |
|---|---|
| `--origam-transition--expand-x-enter-active---transition-duration` | `0.5s` |
| `--origam-transition--expand-x-enter-active---transition-timing-function` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--origam-transition--expand-x-enter-active---transition-property` | `width` |
| `--origam-transition--expand-x-enter-leave---transition-duration` | `0.5s` |
| `--origam-transition--expand-x-move---transition-property` | `transform` — only reachable via `group` (see above) |

Override at the document root or on a specific instance:

```css
.my-rail {
    --origam-transition--expand-x-enter-active---transition-duration: 0.25s;
}
```

## Props

`ITransitionNoOriginProps` (`ITransitionProps` minus `origin`):

| Prop | Effect |
|---|---|
| `name` | CSS class prefix passed to the underlying transition. |
| `disabled` | Short-circuits both the JS measurement and the CSS path — mounts/unmounts instantly. |
| `mode` | `in-out` (default) / `out-in` / `default`. Single-child form only (see Grouped usage). |
| `group` | Switches the root to `TransitionGroup` for a keyed list; unlocks the `-move` reflow. |
| `leaveAbsolute` | On leave, pulls the element out of flow (`position: absolute`, frozen at its current box) so siblings reflow immediately instead of waiting for the width to reach `0`. Restored once the leave completes. |
| `hideOnLeave` | Skips the visible width-collapse on leave entirely — the element is hidden (`display: none`) instantly instead. |

⛔ **`origin` was removed (breaking change, #538/#548).** It set
`transform-origin`, which is meaningless for a width-only animation (no
`transform: scale(...)` anywhere in this component's enter/leave) — the
prop was declared but never produced any observable effect. Consumers
passing `origin` now get a compile-time TypeScript error rather than a
silent no-op.

## Notes

- The slot **must** be a single root element with a measurable width
  (or, with `group`, one measurable element per keyed list item).
- `disabled` short-circuits both the JS measurement and the CSS path.
- `leaveAbsolute` and `hideOnLeave` are most useful together with `group`
  (removing one item from a horizontal list without the others waiting
  on its full collapse animation), but both also work on a single-child
  `<OrigamExpandX>` without `group`.
