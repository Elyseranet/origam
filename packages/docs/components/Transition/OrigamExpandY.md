# OrigamExpandY

`<OrigamExpandY>` animates the **height** of its slot from `0` to its
natural pixel height on enter, and the reverse on leave. Use for
collapsible cards, accordions, and disclosure widgets.

The transition is **JS-driven**: it measures `offsetHeight` and toggles
`overflow: hidden` to mask collapsing margins.

## Basic usage

```vue
<template>
    <OrigamExpandY>
        <div v-if="open">{{ content }}</div>
    </OrigamExpandY>
</template>
```

## CSS variables consumed

| Variable | Default |
|---|---|
| `--origam-transition--expand-y-enter-active---transition-duration` | `0.5s` |
| `--origam-transition--expand-y-enter-active---transition-timing-function` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `--origam-transition--expand-y-enter-active---transition-property` | `height` |
| `--origam-transition--expand-y-enter-leave---transition-duration` | `0.5s` |
| `--origam-transition--expand-y-move---transition-property` | `transform` |

Override at root or per instance.

## Props

`ITransitionProps` — `name`, `disabled`. The `mode` defaults to `in-out`.

## Notes

- The slot must have a single root with a measurable height.
- This is the most common transition for accordion-style disclosure.
