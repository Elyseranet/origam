# OrigamCardText

`<OrigamCardText>` is the body-text area of an origam card. It renders a
`<div>` by default and inherits density, padding, margin and border props
from its common surfaces. It is typically used inside `<OrigamCard>`.

## Basic usage

```vue
<template>
    <OrigamCard>
        <OrigamCardText text="Body copy goes here." />
    </OrigamCard>
</template>
```

## Slots

| Slot | Slot props | Description |
|---|---|---|
| `default` | — | Replaces the inner content. Falls back to the `text` prop. |

```vue
<template>
    <OrigamCard>
        <OrigamCardText>
            <p>Rich <strong>content</strong> via the default slot.</p>
        </OrigamCardText>
    </OrigamCard>
</template>
```

## Props (interface)

```ts
interface ICardTextProps extends ICommonsComponentProps, ITagProps,
    IBorderProps, IRoundedProps, IPaddingProps, IMarginProps,
    IDensityProps, ITypographyProps {
    text?: string | number
}
```

### Typography props (`ITypographyProps`)

| Prop | Type | Default | Description |
|---|---|---|---|
| `fontSize` | `TFontSize` | — | Font size token. Sets `--origam-card-text---font-size` to `var(--origam-font__size---{fontSize})` (xs · sm · md · lg · xl · 2xl · 3xl · 4xl · 5xl). When unset, the card text keeps its theme font-size. |
| `fontWeight` | `TFontWeight` | — | Font weight token. Sets `--origam-card-text---font-weight` to `var(--origam-font__weight---{fontWeight})` (regular 400 · medium 500 · semibold 600 · bold 700 · extrabold 800 · black 900). When unset, the card text keeps its theme font-weight. |
| `letterSpacing` | `TLetterSpacing` | — | Letter-spacing token. Sets `--origam-card-text---letter-spacing` to `var(--origam-font__letterSpacing---{letterSpacing})` (tight · normal · wide · wider · widest). When unset, the card text keeps its theme letter-spacing. |

`lineHeight` and `fontFamily` are available via `ITypographyProps` but the card-text SCSS has no matching rules — they have no visual effect at this time.

## Anatomy

```html
<div class="origam-card-text">
    <span>{{ text }}</span>
</div>
```

## Design tokens consumed

| CSS variable | Default |
|---|---|
| `--origam-card-text---font-size` | `0.875rem` |
| `--origam-card-text---font-weight` | `400` |
| `--origam-card-text---letter-spacing` | `0.0178571429em` |
| `--origam-card-text---text-transform` | `none` |
| `--origam-card-text---padding-block-start` | `1rem` |
| `--origam-card-text---padding-block-end` | `1rem` |
| `--origam-card-text---padding-inline-start` | `1rem` |
| `--origam-card-text---padding-inline-end` | `1rem` |

The full list lives in `tokens/component/card-text.json`.

## Accessibility

- Use the `tag` prop to choose the correct semantic element for the context.
  `div` (default) is appropriate inside a card; swap for `p` when the
  content is a single paragraph of prose.
- The card text element carries no implicit role — it is a layout container.

## Related

- `OrigamCard` — the card shell that wraps this component.
- `OrigamCardHeader` — the header area of a card.
