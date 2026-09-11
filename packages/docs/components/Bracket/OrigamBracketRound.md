# OrigamBracketRound

A single round column (horizontal mode) or row (vertical mode) of a
tournament bracket. Exported so you can render a round standalone outside
a full `OrigamBracket` tree.

```vue
<OrigamBracketRound
    :round="round"
    :index="0"
    :total-rounds="3"
/>
```

## Props

### Core

| Prop           | Type                               | Default       |
|----------------|------------------------------------|---------------|
| `round`        | `IBracketRound`                    | — (required)  |
| `index`        | `number`                           | — (required)  |
| `totalRounds`  | `number`                           | — (required)  |
| `showRoundTitle` | `boolean`                        | `true`        |
| `showScores`   | `boolean`                          | `true`        |
| `showSeed`     | `boolean`                          | `false`       |
| `interactive`  | `boolean`                          | `true`        |
| `color`        | `TIntent \| <css-color>`           | `'primary'`   |
| `direction`    | `'horizontal' \| 'vertical'`       | `'horizontal'`|
| `tag`          | `string`                           | `'div'`       |

### Typography

Props applied to the round title heading (`__title`). Only `fontSize`,
`fontWeight`, and `letterSpacing` have a visual effect — the `__title`
SCSS block reads the corresponding `--origam-bracket-round-title---*`
variables. `fontFamily` and `lineHeight` emit their var but the SCSS does
not consume them (no visible effect until the SCSS is extended).

| Prop            | Type            | CSS variable emitted                                |
|-----------------|-----------------|-----------------------------------------------------|
| `fontSize`      | `TFontSize`     | `--origam-bracket-round-title---font-size`          |
| `fontWeight`    | `TFontWeight`   | `--origam-bracket-round-title---font-weight`        |
| `letterSpacing` | `TLetterSpacing`| `--origam-bracket-round-title---letter-spacing`     |
| `fontFamily`    | `TFontFamily`   | `--origam-bracket-round-title---font-family` (no SCSS rule yet) |
| `lineHeight`    | `TLineHeight`   | `--origam-bracket-round-title---line-height` (no SCSS rule yet) |

## Emits

| Event              | Payload                                                  |
|--------------------|----------------------------------------------------------|
| `match-click`      | `(match: IBracketMatch, event: MouseEvent)`              |
| `competitor-click` | `(competitor, match, side: 'A'\|'B', event)`             |
| `winner-click`     | `(competitor, match, event)`                             |

## Slots

| Slot           | Scope                              |
|----------------|------------------------------------|
| `round-title`  | `{ round: IBracketRound, index: number }` |
| `match`        | `{ match: IBracketMatch, round: IBracketRound, isFinal: boolean }` |
