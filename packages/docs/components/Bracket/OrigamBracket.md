# OrigamBracket

`<OrigamBracket>` renders a tournament tree. It supports three layouts:

| Variant                 | Visual                                                       |
|-------------------------|--------------------------------------------------------------|
| `single-elimination`    | Classic knockout. Each round is a column of matches.         |
| `double-elimination`    | Winner Bracket on top, Loser Bracket below, Grand Final last.|
| `round-robin`           | NxN matrix. Every competitor plays every other competitor.   |

The component is purely presentational. Pass it a typed `rounds`
array, listen for `match-click` / `winner-click` / `competitor-click`,
and update the data on your side.

## Data shapes

```ts
interface IBracketCompetitor {
    id: string | number
    name: string
    seed?: number
    avatar?: string
    metadata?: Record<string, unknown>
}

interface IBracketMatch {
    id: string | number
    competitorA: IBracketCompetitor | null  // null = TBD / bye
    competitorB: IBracketCompetitor | null
    scoreA?: number | string                // string for 'DSQ', 'W/O', …
    scoreB?: number | string
    winnerId?: string | number | null
    status?: 'pending' | 'live' | 'completed' | 'forfeited'
    nextMatchId?: string | number           // for explicit connector linking
    scheduledAt?: string                    // ISO date — informative only
    metadata?: Record<string, unknown>
}

interface IBracketRound {
    id: string | number
    title: string                           // pre-translated
    matches: IBracketMatch[]
    side?: 'winner' | 'loser' | 'grand-final'
}
```

## Basic usage — single elimination (4 players)

```vue
<template>
    <OrigamBracket :rounds="rounds" @match-click="onMatch" />
</template>

<script setup lang="ts">
    import { OrigamBracket } from '@origam/components'
    import type { IBracketRound } from '@origam/interfaces'

    const rounds: IBracketRound[] = [
        {
            id: 'sf',
            title: 'Semi-finals',
            matches: [
                {
                    id: 'sf1',
                    competitorA: { id: 't1', name: 'T1', seed: 1 },
                    competitorB: { id: 'g2', name: 'G2', seed: 4 },
                    scoreA: 2, scoreB: 0, winnerId: 't1',
                    nextMatchId: 'f1'
                },
                {
                    id: 'sf2',
                    competitorA: { id: 'fnc', name: 'FNATIC', seed: 2 },
                    competitorB: { id: 'tl', name: 'Team Liquid', seed: 3 },
                    scoreA: 1, scoreB: 2, winnerId: 'tl',
                    nextMatchId: 'f1'
                }
            ]
        },
        {
            id: 'f',
            title: 'Final',
            matches: [
                {
                    id: 'f1',
                    competitorA: { id: 't1', name: 'T1' },
                    competitorB: { id: 'tl', name: 'Team Liquid' },
                    scoreA: 3, scoreB: 2, winnerId: 't1',
                    status: 'completed'
                }
            ]
        }
    ]

    const onMatch = (match, round) => {
        console.log('clicked match', match.id, 'of round', round.id)
    }
</script>
```

## Double elimination

```vue
<OrigamBracket :rounds="doubleElim" variant="double-elimination" />
```

Use `round.side` to mark whether a round belongs to the Winner Bracket,
the Loser Bracket, or the Grand Final. The component groups rounds
into those three sections automatically — the input order within each
section is preserved.

```ts
[
    { id: 'wb-sf', title: 'Winner semis', side: 'winner', matches: [...] },
    { id: 'wb-f',  title: 'Winner final', side: 'winner', matches: [...] },
    { id: 'lb-f',  title: 'Loser final',  side: 'loser',  matches: [...] },
    { id: 'gf',    title: 'Grand final',  side: 'grand-final', matches: [...] }
]
```

## Round robin

```vue
<OrigamBracket :rounds="groupStage" variant="round-robin" />
```

Round-robin renders an NxN matrix. Every match in the dataset gets
indexed by `(competitorA.id, competitorB.id)` and mirrored across the
diagonal. The diagonal cells are inert.

## Props

| Prop              | Type                                                          | Default               |
|-------------------|---------------------------------------------------------------|-----------------------|
| `rounds`          | `IBracketRound[]`                                             | — (required)          |
| `variant`         | `'single-elimination' \| 'double-elimination' \| 'round-robin'` | `'single-elimination'` |
| `direction`       | `'horizontal' \| 'vertical'`                                  | `'horizontal'`        |
| `density`         | `'default' \| 'compact' \| 'comfortable'`                     | `'default'`           |
| `showRoundTitles` | `boolean`                                                     | `true`                |
| `showScores`      | `boolean`                                                     | `true`                |
| `showSeed`        | `boolean`                                                     | `false`               |
| `interactive`     | `boolean`                                                     | `true`                |
| `tag`             | `string`                                                      | `'div'`               |
| `color`           | `TIntent \| <css-color>`                                     | `'primary'`           |
| `bgColor`         | `TIntent \| <css-color>`                                     | — (none)              |
| `rounded`         | `TRounded \| number \| string \| boolean`                    | — (match default 6px) |
| `roundedTopLeft` / `roundedTopRight` / `roundedBottomLeft` / `roundedBottomRight` | `number \| string \| boolean` | — (overrides one corner only, `rounded` still drives the other three) |
| `elevation`       | `number` (0–24, bucketised to the shadow ladder)             | — (match default)     |
| `border`          | `'thin' \| 'thick' \| number \| boolean`                     | — (match default 1px) |
| `borderTop` / `borderRight` / `borderBottom` / `borderLeft` | `'thin' \| 'thick' \| number \| boolean` | — (overrides one side only) |
| `borderBlock` / `borderInline`  | `'thin' \| 'thick' \| number \| boolean` | — (logical-axis shorthand: block = top+bottom, inline = left+right in LTR) |
| `borderColor`     | `TIntent \| <css-color>`                                     | — (subtle)            |
| `borderTopColor` / `borderRightColor` / `borderBottomColor` / `borderLeftColor` | `TIntent \| <css-color>` | — (overrides one side's colour only) |
| `borderStyle`     | `'solid' \| 'dashed' \| 'dotted' \| …`                       | `'solid'`             |
| `winnersLabel`    | `string`                                                      | `'Winners bracket'`   |
| `losersLabel`     | `string`                                                      | `'Losers bracket'`    |
| `width` / `height` / `minWidth` / `minHeight` / `maxWidth` / `maxHeight` | `number \| string` | — (applied to the bracket root) |
| `margin` / `marginTop` / `marginRight` / `marginBottom` / `marginLeft` / `marginBlock` / `marginInline` | `number \| string \| boolean` | — (applied to the bracket root) |
| `padding` / `paddingTop` / `paddingRight` / `paddingBottom` / `paddingLeft` / `paddingBlock` / `paddingInline` | `number \| string \| boolean` | — (applied to the bracket root) |
| `fontSize` / `fontWeight` / `letterSpacing` | `TFontSize` / `TFontWeight` / `TLetterSpacing` | — (see typography note below) |

> **`bgColor`** paints the surface of **every match card** (including
> hover). When a surface is painted, the match text is automatically set
> to the black / white that passes WCAG against the rendered colour — so
> the bracket stays legible whatever the intent (seeds, scores and names
> included). With no `bgColor`, **`color`** drives the match text on the
> neutral surface. Both accept a tokenised intent or a raw CSS color.
>
> **`rounded` (+ per-corner), `elevation` and `border*` (+ per-side, +
> colours) apply to each match card**, not the bracket root — every card
> is shaped / elevated / bordered, confirmed by reading the component:
> these props resolve into `--origam-bracket-match---*` custom properties
> set inline on the bracket root, which cascade via normal CSS inheritance
> to every `.origam-bracket-match` card (`OrigamBracketMatch.vue`'s own
> scoped SCSS reads the exact same var names). A per-corner/per-side prop
> overrides only the corner/side it targets — `rounded="lg"` plus
> `roundedTopLeft="0px"` flattens one corner and leaves the other three at
> `lg`, same precedence grammar as `margin`/`padding`. The **connector
> links between matches follow the match border colour** (`borderColor`,
> or the subtle default), so the tree and its links read as one. `border`
> and its per-side variants accept the same vocabulary: a bare number, a
> named rung (`'thin'` / `'thick'`), or `true`/`''` — a raw CSS-length
> *string* like `'8px'` is silently dropped (verified at runtime), unlike
> `rounded`, which does accept a CSS-length string.
>
> **`tag`, dimension (`width`/`height`/`min*`/`max*`) and `margin*`/
> `padding*` apply to the bracket's own root element** — a different
> surface than the match-card props above.
>
> **Typography (`fontSize`/`fontWeight`/`letterSpacing`) is narrower than
> either of those two surfaces**: it only drives the `double-elimination`
> section labels ("Winner Bracket" / "Loser Bracket" / "Grand Final"
> headings) via `useTypography(props, 'bracket-double-label')` — it has no
> effect on `single-elimination` / `round-robin`, and no effect on the
> match cards or competitor rows either. `fontFamily` and `lineHeight` were
> removed from `IBracketProps` (issue #501) — the section-label SCSS never
> read either var. `fontFamily` is a project-level setting configured once
> on `OrigamApp`, not a per-instance override.
>
> `winnersLabel` / `losersLabel` are only rendered in the
> `double-elimination` layout, as the heading above each bracket tree.
> Pre-translate them — the component never calls `useT`.

## Events

| Event             | Payload                                                              |
|-------------------|----------------------------------------------------------------------|
| `match-click`     | `(match: IBracketMatch, round: IBracketRound, ev: MouseEvent)`       |
| `winner-click`    | `(competitor: IBracketCompetitor, match: IBracketMatch, ev)`         |
| `competitor-click`| `(competitor: IBracketCompetitor, match: IBracketMatch, ev)`         |

## Slots

| Slot          | Scope                                                            | Purpose                            |
|---------------|------------------------------------------------------------------|------------------------------------|
| `round-title` | `{ round, index }`                                               | Custom title heading.              |
| `match`       | `{ match, round, isFinal }`                                      | Replace the match card.            |
| `competitor`  | `{ competitor, match, isWinner, side }`                          | Replace the competitor row.        |
| `connector`   | `{ from, to }`                                                   | Replace the SVG path between matches. |

## Layout strategy

For `single-elimination`:

- Each round is laid out as a flex column (in horizontal mode) or row
  (in vertical mode).
- Matches inside a round are evenly distributed with `justify-content:
  space-around` so the classic doubling-gap branching emerges naturally
  from the overall height being divided by the round's match count.
- Connectors are rendered as a single absolutely-positioned `<svg>`
  whose `viewBox` matches the tree dimensions. Each connector is a
  three-segment polyline: exit the source match horizontally to the
  half-way x, drop to the target match y, then enter horizontally.
- Endpoints are **measured from the live DOM** (each match card's
  `getBoundingClientRect`) rather than computed from a grid formula, so
  every link stays anchored to the exact centre of the card it leaves /
  enters regardless of round title, density, score visibility or gap.
  Re-measured on mount, on `ResizeObserver`, and when the relevant props
  change.
- `nextMatchId` on `IBracketMatch` drives explicit linking; if absent,
  the layout falls back to positional mapping (match `i` of round `n`
  connects to match `floor(i / 2)` of round `n + 1`).
- The connector path automatically receives the
  `origam-bracket__connector--winner` modifier class when the source
  match has a declared `winnerId`.

For `double-elimination`:

- Rounds are grouped by `IBracketRound.side` into **two independent
  trees** — the Winner Bracket (`side: 'winner'`, or `undefined`) on top
  and the Loser Bracket (`side: 'loser'`) below — laid out on a CSS grid,
  with the Grand Final column (`side: 'grand-final'`) on the right,
  vertically centred across both. Each tree carries a heading
  (`winnersLabel` / `losersLabel`).
- The Grand Final is a **single match**. The Winner Bracket champion's
  one-round advantage is expressed on that match via `advantage`
  (`{ competitorId, rounds }`, default `rounds: 1`) — rendered as a
  `+N` badge on the favoured competitor row, signalling the head start
  that competitor carries into the series.
- Connectors are driven **purely by `nextMatchId`** (no positional
  fallback): every match that declares a downstream id draws a measured
  link to that card wherever it lands, so Winner-final → Grand Final and
  Loser-final → Grand Final both resolve across the two trees.

For `round-robin`:

- A CSS grid with a header row + header column is rendered. Cells on
  the diagonal are inert. Off-diagonal cells display the match score
  (when known), pulling from whichever direction of the `(A, B)` pair
  is stored in the data.

## Accessibility

- Root: `role="region"` with `aria-label="Tournament bracket"`.
- Each round: `role="group"` with `aria-labelledby` pointing at its
  title heading.
- Each match: `role="group"` with `aria-label="Match: <A> versus <B>"`.
- Interactive competitor rows expose `role="button"`, are reachable
  via `Tab`, and respond to Enter / Space.
- The SVG layer is marked `aria-hidden="true"` — connectors are purely
  decorative.
- The round-robin layout uses `role="table"` / `"row"` / `"columnheader"`
  / `"rowheader"` / `"cell"` so screen readers can navigate it as a
  grid.

## Tokens

All visual values are exposed as CSS variables declared in
`packages/ds/src/assets/css/tokens/light.css` and `dark.css` (SCSS twins
under `packages/ds/src/assets/scss/tokens/`), following the standard
`--origam-bracket---*`,
`--origam-bracket-match---*`, `--origam-bracket-competitor---*`,
`--origam-bracket-connector---*`, `--origam-bracket-round-robin---*`
naming. Override at the consumer level for theming.
