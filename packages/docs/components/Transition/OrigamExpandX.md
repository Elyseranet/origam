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

## CSS variables consumed

| Variable | Default |
|---|---|
| `--origam-transition--expand-x-enter-active---transition-duration` | `0.5s` |
| `--origam-transition--expand-x-enter-active---transition-timing-function` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--origam-transition--expand-x-enter-active---transition-property` | `width` |
| `--origam-transition--expand-x-enter-leave---transition-duration` | `0.5s` |
| `--origam-transition--expand-x-move---transition-property` | `transform` |

Override at the document root or on a specific instance:

```css
.my-rail {
    --origam-transition--expand-x-enter-active---transition-duration: 0.25s;
}
```

## Props

`ITransitionProps` — `name`, `disabled`. The `mode` defaults to `in-out`
so the appearing element waits for the leaving one to finish (no width
flicker).

## Notes

- The slot **must** be a single root element with a measurable width.
- `disabled` short-circuits both the JS measurement and the CSS path.
