# OrigamTimeline

Vertical activity feed — release timeline / changelog style. Renders a dot and connecting line for each entry.

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
| `side` | `'start' \| 'end' \| 'alternating'` | `'start'` | Content position relative to the track |
| `truncateLine` | `boolean` | `false` | Hides the connector on the last item |
| `color` | `TColor` | `undefined` | Propagated dot color (overridden per-item by `intent`) |
| `density` | `TDensity` | `undefined` | Density modifier |
| `size` | `TSize` | `undefined` | Size modifier |

## Props — OrigamTimelineItem

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | `undefined` | Entry title (bold, monospace) |
| `subtitle` | `string` | `undefined` | Typically a date or secondary label |
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

## Accessibility

- The wrapper renders with `role="list"`.
- Each item renders with `role="listitem"`.
- The track (dot + connector) is `aria-hidden="true"` — it is purely decorative.
- Use descriptive `title` values for screen-reader users.
- Keyboard navigation follows natural DOM order.
