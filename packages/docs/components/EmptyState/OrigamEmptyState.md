# OrigamEmptyState

A placeholder shown when a list, table, or any collection has nothing
to render. Five presets cover the most common cases (no data yet, no
search results, an error, offline, locked content); five slots let you
swap a single piece or replace the whole layout.

```vue
<template>
    <origam-empty-state
            preset="no-data"
            title="No items yet"
            description="Create your first item to get started."
            size="md"
    >
        <template #actions>
            <origam-btn @click="create">Create item</origam-btn>
        </template>
    </origam-empty-state>
</template>
```

## Presets

| Preset        | Default icon                      | Intent      | When to reach for it                                              |
|---------------|-----------------------------------|-------------|-------------------------------------------------------------------|
| `no-data`     | `mdi:mdi-database-off-outline`    | `neutral`   | The collection has never had data — first-run / empty inbox / new project. |
| `no-results`  | `mdi:mdi-magnify-close`           | `neutral`   | A search or filter returned nothing — surface "broaden filters" CTA. |
| `error`       | `mdi:mdi-alert-circle-outline`    | `danger`    | An operation failed — surface a Retry CTA.                        |
| `offline`     | `mdi:mdi-wifi-off`                | `warning`   | Network is down — surface "Switch to offline mode" / "Retry".     |
| `locked`      | `mdi:mdi-lock-outline`            | `secondary` | Gated by plan / auth / permissions — surface Sign-in / Upgrade.   |

Each preset bundles a default `icon` + `iconColor`; override either via
the matching props for the 5% case (e.g. brand-specific illustration on
top of the `error` preset).

## Props

| Prop          | Type                                                           | Default      | Notes                                                                  |
|---------------|----------------------------------------------------------------|--------------|------------------------------------------------------------------------|
| `preset`      | `'no-data' \| 'no-results' \| 'error' \| 'offline' \| 'locked'` | `'no-data'`  | Bundles a default icon + intent — see [Presets](#presets).             |
| `title`       | `string`                                                       | `undefined`  | Primary heading. Override via `#title` slot for richer markup.         |
| `description` | `string`                                                       | `undefined`  | Optional sub-heading.                                                  |
| `icon`        | `TIcon`                                                        | per-preset   | Overrides the preset icon. Same shape as `<OrigamIcon>`.               |
| `iconColor`   | `TIntent`                                                      | per-preset   | Overrides the preset's icon color (semantic intent).                   |
| `size`        | `'sm' \| 'md' \| 'lg'`                                         | `'md'`       | Drives icon size, font sizes, padding, gap.                            |
| `align`       | `'center' \| 'left'`                                           | `'center'`   | Horizontal alignment of the stack.                                     |
| `tag`         | `string`                                                       | `'div'`      | Root element tag.                                                      |
| `fontFamily`  | `TFontFamily`                                                  | `undefined`  | Font family token applied to **both** the title and description (`sans` · `mono` · `serif`).        |
| `fontSize`    | `TFontSize`                                                    | `undefined`  | Font size token applied to **both** surfaces. **Overrides the `size`-driven font-size** when set; `size` drives when unset. |
| `fontWeight`  | `TFontWeight`                                                  | `undefined`  | Font weight token applied to both surfaces.                            |
| `lineHeight`  | `TLineHeight`                                                  | `undefined`  | Line-height token applied to both surfaces.                            |

> Typography props come from the shared `ITypographyProps` surface and act on
> **both** text surfaces (title + description) at once. `letterSpacing` is part
> of the surface but inert here — neither surface declares a `letter-spacing`
> rule.

## Slots

| Slot          | Purpose                                                                                |
|---------------|----------------------------------------------------------------------------------------|
| `default`     | Replaces the entire built-in layout. Use for bespoke hero placeholders.                |
| `icon`        | Replaces the default `<OrigamIcon>`. Use for SVG / `<img>` illustrations.              |
| `title`       | Replaces the rendered title element. Slot wins over the `title` prop.                  |
| `description` | Replaces the rendered description element. Slot wins over the `description` prop.      |
| `actions`     | Actions row rendered below the description. Typically 1–2 buttons (Create / Retry / …). |

## Examples

```vue
<origam-empty-state
        preset="no-data"
        title="No items yet"
        description="Create your first item to get started."
>
    <template #actions>
        <origam-btn intent="primary" @click="create">Create item</origam-btn>
    </template>
</origam-empty-state>

<origam-empty-state
        preset="error"
        title="Something went wrong"
        description="We could not load this list. Retry in a few seconds."
>
    <template #actions>
        <origam-btn @click="retry">Retry</origam-btn>
    </template>
</origam-empty-state>

<origam-empty-state
        preset="no-results"
        title="No matches found"
        description="Try a different keyword or broaden the filters."
>
    <template #icon>
        <svg viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="28" cy="28" r="18" fill="none" stroke="currentColor" stroke-width="3"/>
            <line x1="42" y1="42" x2="56" y2="56" stroke="currentColor" stroke-width="3"/>
        </svg>
    </template>
</origam-empty-state>
```

## Accessibility

- The root carries `role="status"` and `aria-live="polite"` so an
  empty state appearing dynamically (e.g. after a search filter
  clears the list) is announced passively by screen readers.
- The icon is decorative (the title and description carry the
  semantic) — the icon container is marked `aria-hidden="true"` so
  assistive tools do not announce it.
- The `actions` slot is just a flex row; place your actionable
  controls (buttons, links) inside it directly — they keep their
  own semantics and keyboard handling.
- When passing a custom SVG illustration through the `#icon` slot,
  ensure it carries `aria-hidden="true"` if it is decorative, or
  the appropriate `<title>` / `aria-label` if it carries meaning
  not duplicated by the text.

## Related

- `OrigamAlert` — surface a warning /
  feedback message inline alongside existing data. Use Alert for
  "something is happening", EmptyState for "there is nothing to show".
