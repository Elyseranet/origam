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
    IDensityProps,
    Pick<ITypographyProps, 'fontSize' | 'fontWeight' | 'letterSpacing'> {
    text?: string | number
}
```

### Own props

| Prop | Type | Default | Description |
|---|---|---|---|
| `text` | `string \| number` | `undefined` | Rendered inside a `<span>`. Ignored when the `default` slot is filled |
| `tag` | `string` | `'div'` | Element the root renders as (`ITagProps`) |

### Layout props

Each is consumed through its standard composable, which emits a utility class
for a tokenised value and an inline declaration for a custom one.

| Group | Props | Composable |
|---|---|---|
| Density | `density` | `useDensity` — emits `origam-card-text--density-{value}`, which sets `--origam-card-text---density` to `-8px` / `0px` / `8px`. That offset is added to all four padding channels via `calc()` |
| Padding | `padding`, `paddingBlock`, `paddingInline`, `paddingTop` / `Right` / `Bottom` / `Left` | `usePadding` |
| Margin | `margin`, `marginBlock`, `marginInline`, `marginTop` / `Right` / `Bottom` / `Left` | `useMargin` |
| Border | `border`, `borderBlock`, `borderInline`, `borderTop` / `Right` / `Bottom` / `Left`, `borderColor`, `borderStyle`, and the four per-side `border*Color` | `useBorder` |
| Shape | `rounded`, `roundedTopLeft` / `TopRight` / `BottomLeft` / `BottomRight` | `useRounded` |
| Commons | `id`, `class`, `style` | — |

## Emits

**None.** `ICardTextEmits` is empty on purpose: the component only renders the
`text` prop or the default slot, and never calls `emit(…)`.

### Typography props (`Pick<ITypographyProps, …>`)

Only the three keys named in the `Pick` are declared — `fontFamily` and
`lineHeight` are **not** props of this component and passing either does
nothing.

| Prop | Type | Default | Description |
|---|---|---|---|
| `fontSize` | `TFontSize` | — | Font size token. Sets `--origam-card-text---font-size` to `var(--origam-font__size---{fontSize})` (xs · sm · md · lg · xl · 2xl · 3xl · 4xl · 5xl). When unset, the card text keeps its theme font-size. |
| `fontWeight` | `TFontWeight` | — | Font weight token. Sets `--origam-card-text---font-weight` to `var(--origam-font__weight---{fontWeight})` (regular 400 · medium 500 · semibold 600 · bold 700 · extrabold 800 · black 900). When unset, the card text keeps its theme font-weight. |
| `letterSpacing` | `TLetterSpacing` | — | Letter-spacing token. Sets `--origam-card-text---letter-spacing` to `var(--origam-font__letterSpacing---{letterSpacing})` (tight · normal · wide · wider · widest). When unset, the card text keeps its theme letter-spacing. |

`lineHeight` and `fontFamily` were removed from `ICardTextProps` (issue #501)
— the card-text SCSS has no matching rules for either, and `fontFamily` is a
project-level setting configured once on `OrigamApp`, not a per-instance
override.

## Anatomy

```html
<!-- the root element is `tag`, `div` by default -->
<div class="origam-card-text">
    <span>{{ text }}</span>
</div>
```

The `<span>` only exists on the `text` path — filling the `default` slot
replaces it entirely, so slot content is a direct child of the root.

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

⛔ **These are not in the token stylesheets.** `--origam-card-text---*` is
declared nowhere in `packages/ds/src/assets/css/tokens/` — grepping `light.css`
or `dark.css` for `card-text` returns nothing. The defaults live in an
unscoped `<style>:root { … }` block at the bottom of
`packages/ds/src/components/Card/OrigamCardText.vue`, which is what actually
ships them; that file is the full list.

Because they sit on `:root` rather than in a theme sheet, this component has
**no dark-theme variant of its own** — `--origam-card-text---border-color` is
the literal `rgba(0, 0, 0, 0.87)` under every theme. Migrating the block into
`light.css` / `dark.css` (step 4 of the token-migration checklist in
`CLAUDE.md`) is still pending for this component.

Beyond the table above, the block also declares `---flex` (`1 1 auto`), the
four `---border-*-width` channels and their `---border-width` shorthand,
`---border-color`, `---border-style`, the four `---border-*-radius` corners
and their `---border-radius` shorthand, and the four `---margin-*` channels
(all `0`).

## Accessibility

- Use the `tag` prop to choose the correct semantic element for the context.
  `div` (default) is appropriate inside a card; swap for `p` when the
  content is a single paragraph of prose.
- The card text element carries no implicit role — it is a layout container.

## Related

- `OrigamCard` — the card shell that wraps this component.
- `OrigamCardHeader` — the header area of a card.
