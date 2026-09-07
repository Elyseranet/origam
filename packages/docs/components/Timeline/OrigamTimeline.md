# OrigamTimeline

Activity feed — release timeline / changelog style. Renders a dot and connecting line for each entry.

Two layouts, chosen with `orientation`:

- **`'vertical'`** (default) — dots stacked top to bottom, content beside each dot; `side` picks left, right, or alternating.
- **`'horizontal'`** — dots laid out left to right inside a scroll-snapping track, content below each dot.

## Basic usage

```vue
<origam-timeline :items="entries" />
```

Where `entries` is an array of `ITimelineEntry`:

```ts
const entries: ITimelineEntry[] = [
  { title: 'v1.0.0', subtitle: 'May 5, 2026', description: 'Stable release', intent: 'primary' },
  { title: 'v0.9-rc', subtitle: 'Apr 28, 2026', description: 'Release candidate', intent: 'success' }
]
```

## Composition API (slot-driven)

```vue
<origam-timeline>
  <origam-timeline-item title="v1.0.0" subtitle="May 5, 2026" intent="primary">
    Custom slot body content
  </origam-timeline-item>
  <origam-timeline-item title="v0.9-rc" subtitle="Apr 28, 2026" intent="success" :is-last="true"/>
</origam-timeline>
```

## Props — OrigamTimeline

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `ITimelineEntry[]` | `undefined` | Data-driven entries (alternative to slot children) |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Layout axis. `'horizontal'` wraps the items in an `origam-timeline__track-wrapper` with `scroll-snap-type: x mandatory` and a hidden scrollbar, so the user pages point-to-point by swiping or scrolling. Provided to every `<OrigamTimelineItem>` through the timeline context, so items placed by hand in the `default` slot pick it up without receiving the prop. |
| `side` | `'start' \| 'end' \| 'alternating'` | `'start'` | Content position relative to the track |
| `truncateLine` | `boolean` | `false` | Hides the connector on the last item |
| `color` | `TColor` | `undefined` | Propagated dot color (overridden per-item by `intent`). Only a `string` value is forwarded through the context — a boolean `false` is dropped. |
| `density` | `TDensity` | `undefined` | Density modifier |
| `size` | `TSize \| number` | `undefined` | Size modifier. The `x-small … x-large` rungs each rescale the dot, track width, item gap and both font sizes. |
| `ariaLabel` | `string` | `undefined` | Accessible name of the `role="list"` root. Bound straight to `aria-label`, so it is the **final string**, not a locale key — translate it yourself. Give one whenever the surrounding page does not already name the list. |
| `tag` | `string` | `'div'` | Element rendered for the root. |
| `id` | `string` | generated | DOM id of the root. |
| `class` | `string \| string[] \| object` | `undefined` | Extra classes on the root. |
| `style` | `string \| string[] \| object \| StyleValue` | `undefined` | Extra inline styles on the root. |

## Emits — OrigamTimeline

None. `ITimelineEmits` is empty: the component renders a static list of
`<OrigamTimelineItem>` and never calls `emit()`.

## Slots — OrigamTimeline

| Slot | Description |
|---|---|
| `default` | Replaces the whole auto-generated `<OrigamTimelineItem>` list. In `horizontal` mode it renders inside the scroll-snapping track wrapper. |

## Props — OrigamTimelineItem

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | `undefined` | Entry title (bold, monospace) |
| `subtitle` | `string` | `undefined` | Typically a date or secondary label |
| `description` | `string` | `undefined` | Body text under the title. Falls back to the `#body` slot; when neither is set, the body element is not rendered at all. |
| `orientation` | `'vertical' \| 'horizontal'` | `undefined` | Layout axis. Normally injected from the parent timeline rather than passed; unset means vertical. |
| `icon` | `TIcon` | `undefined` | Replaces the plain dot with an icon |
| `intent` | `TIntent` | `'primary'` | Dot color intent |
| `isLast` | `boolean` | `false` | Marks the final item (hides connector when `truncateLine=true`) |
| `truncateLine` | `boolean` | `false` | Per-item override (usually set by parent context) |
| `side` | `'start' \| 'end' \| 'alternating'` | `'start'` | Track position |
| `index` | `number` | `0` | Used for alternating layout computation |

## Slots — OrigamTimelineItem

| Slot | Description |
|---|---|
| `default` | Full override of the content area |
| `body` | Override of the description area only |
| `dot` | Override of the dot element |

## CSS variable tokens

| Token | CSS variable | Default |
|---|---|---|
| Background | `--origam-timeline---background-color` | `var(--origam-color__surface---default)` |
| Text color | `--origam-timeline---color` | `var(--origam-color__text---primary)` |
| Gap | `--origam-timeline---gap` | `14px` |
| Track width | `--origam-timeline---track-width` | `24px` |
| Dot size | `--origam-timeline---dot-size` | `12px` |
| Dot background | `--origam-timeline---dot-bg` | `var(--origam-color__action--primary---bg)` |
| Connector color | `--origam-timeline---connector-color` | `var(--origam-color__border---subtle)` |
| Title font size | `--origam-timeline---title-font-size` | `var(--origam-font__size---md)` |
| Title weight | `--origam-timeline---title-font-weight` | `600` |
| Subtitle font size | `--origam-timeline---subtitle-font-size` | `var(--origam-font__size---sm)` |
| Subtitle color | `--origam-timeline---subtitle-color` | `var(--origam-color__text---secondary)` |

## Intents

The `intent` prop maps to semantic design tokens:

- `primary` — action.primary.bg/fg
- `success`, `warning`, `danger`, `info` — feedback.{intent}.bg/fg
- `secondary`, `ghost`, `neutral` — action.{intent}.bg/fg

## Horizontal mode

```vue
<template>
    <origam-timeline :items="entries" orientation="horizontal"/>
</template>
```

The track is a flex row with `overflow-x: auto` and
`scroll-snap-type: x mandatory`; the scrollbar is hidden
(`scrollbar-width: none` plus the `-webkit-scrollbar` reset) because the
dots and connectors already show progress. Give the timeline a bounded
width — the track fills its container and only scrolls once the items
overflow it.

## Accessibility

- The wrapper renders with `role="list"`, and `aria-label` when `ariaLabel` is set.
- Each item renders with `role="listitem"`.
- The track (dot + connector) is `aria-hidden="true"` — it is purely decorative.
- Use descriptive `title` values for screen-reader users.
- Keyboard navigation follows natural DOM order. In `horizontal` mode the
  scroll container has no `tabindex`, so it is not itself a tab stop —
  keyboard users reach the off-screen items only through whatever
  focusable content the entries contain.
