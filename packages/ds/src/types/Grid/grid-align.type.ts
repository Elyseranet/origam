/**
 * Place-items (`align-items` + `justify-items`) accepts the 4-value
 * subset of CSS Box Alignment. `baseline` is excluded on purpose —
 * it has no useful meaning when items can span rows / columns.
 */
export type TGridPlaceItems =
    | 'start'
    | 'center'
    | 'end'
    | 'stretch'

/**
 * Place-content (`align-content` + `justify-content`) — aligns the
 * full grid inside its container when the grid is smaller than the
 * available space. Mirrors the CSS Box Alignment matrix.
 */
export type TGridPlaceContent =
    | 'start'
    | 'center'
    | 'end'
    | 'stretch'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'

/**
 * Place-self (`align-self` + `justify-self`) on a grid item.
 * Same matrix as place-items.
 */
export type TGridPlaceSelf =
    | 'start'
    | 'center'
    | 'end'
    | 'stretch'

/**
 * Gap size tokens (`'xs' | 'sm' | 'md' | 'lg' | 'xl'`). When the
 * consumer passes one of these strings to the `gap` / `columnGap`
 * / `rowGap` prop, `<OrigamGrid>` resolves it to a `var(--origam-grid---gap-{token})`
 * reference (which itself points at `space.*` primitives via
 * `tokens/component/grid.json`).
 *
 * Any other string is passed through verbatim (`'24px'`, `'1rem 2rem'`).
 * Plain `number` is interpreted as pixels.
 */
export type TGridGapSize =
    | 'xs'
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
