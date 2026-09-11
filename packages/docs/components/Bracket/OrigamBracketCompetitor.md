# OrigamBracketCompetitor

A single competitor row — optional seed prefix, optional avatar, name, an
optional `+N` advantage badge and a score. Rendered inside
`OrigamBracketMatch`, but exported so you can reuse a row standalone (e.g.
inside a custom `#match` / `#competitor` slot).

```vue
<OrigamBracketCompetitor :competitor="competitor" :score="2" />
```

`competitor` is an `IBracketCompetitor` (`id`, `name`, optional `seed`,
optional `avatar`). `null` renders a "TBD" placeholder.

## Props

| Prop              | Type                          | Default     |
|-------------------|-------------------------------|-------------|
| `competitor`      | `IBracketCompetitor \| null`  | — (required)|
| `score`           | `number \| string`            | — (`—`)     |
| `bgColor`         | `TIntent \| <css-color>`      | — (transparent) |
| `color`           | `TIntent \| <css-color>`      | — (inherits) |
| `isWinner`        | `boolean`                     | `false`     |
| `isLoser`         | `boolean`                     | `false`     |
| `advantageRounds` | `number`                      | — (no badge)|
| `forfeit`         | `boolean`                     | `false`     |
| `showScore`       | `boolean`                     | `true`      |
| `showSeed`        | `boolean`                     | `false`     |
| `interactive`     | `boolean`                     | `true`      |
| `rounded`         | `TRounded \| number \| string \| boolean` | — |
| `elevation`       | `number` / shadow rung        | —           |
| `border`          | `'thin' \| 'thick' \| number \| string \| boolean` | — |
| `borderColor`     | `TIntent \| <css-color>`      | — (currentColor) |
| `borderStyle`     | `'solid' \| 'dashed' \| …`    | —           |
| `density`         | `'default' \| 'compact' \| 'comfortable'` | — |
| `width` / `height` / `minWidth` / `maxWidth` / `minHeight` / `maxHeight` | `number \| string` | — |
| `padding*` / `margin*` | `number \| string`       | —           |
| `tag`             | `string`                      | `'div'`     |

The full cross-cutting surface (rounded, elevation, border, density,
dimension, padding, margin) is supported via the standard Commons
composables, so a standalone row behaves like any other origam component.

### Typography (`ITypographyProps`)

`fontSize` and `fontWeight` override the matching font variable on **all four
text surfaces** simultaneously. Each surface reads its own CSS variable so
they can also be overridden independently via CSS.

| Prop         | Type          | Applied to surfaces (CSS var prefix)                                     |
|--------------|---------------|--------------------------------------------------------------------------|
| `fontSize`   | `TFontSize`   | root (`bracket-competitor`), seed (`bracket-seed`), score (`bracket-score`), advantage (`bracket-advantage`) |
| `fontWeight` | `TFontWeight` | root (`bracket-competitor`), seed (`bracket-seed`), score (`bracket-score`), advantage (`bracket-advantage`) |

`fontFamily`, `lineHeight`, and `letterSpacing` are inherited via
`ITypographyProps` (vars are emitted) but the SCSS reads no matching var on
any surface — they have no visual effect until the SCSS is extended.

- `isWinner` bolds the row + tints its background; `isLoser` de-emphasises
  it (lower opacity). `null` competitor → italic "TBD".
- `advantageRounds > 0` renders a `+N` badge next to the name — the Winner
  Bracket champion's Grand Final head start.

## Events

| Event   | Payload                          |
|---------|-----------------------------------|
| `click` | `(ev: MouseEvent \| KeyboardEvent)` — only when `interactive` |

## Notes

- Name, score, seed and the winner/loser/TBD states all derive from
  `currentColor`, so the row stays legible on whatever surface its parent
  match is painted (auto-contrast — see `OrigamBracket`).
- `bgColor` paints the row and `color` sets its text (standalone use).
  Left unset inside a bracket, the row stays transparent and inherits the
  bracket's auto-contrast colour — so the match surface stays in control.
