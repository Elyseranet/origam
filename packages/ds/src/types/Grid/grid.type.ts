import { OrigamGrid } from '../../components'
import { GRID_AUTO_FLOW } from '../../enums'

import type { TAlign } from '../Commons/align.type'
import type { TJustify } from '../Commons/justify.type'
import type { TRoundedToken } from '../Commons/rounded.type'

export type TOrigamGrid = InstanceType<typeof OrigamGrid>

/**
 * Closed list of CSS `grid-auto-flow` values surfaced by `<OrigamGrid>`.
 *
 * The native CSS spec accepts more permutations (`column dense`,
 * `row column dense`, …), but the matrix below is what 99 % of
 * dashboards / page-builders need. If a consumer needs a more
 * exotic value, they can pass a raw string via `:style` on the
 * outer container — we don't double-validate `grid-auto-flow`.
 */
export type TGridAutoFlow = `${GRID_AUTO_FLOW}`

/**
 * Place-items (`align-items` + `justify-items`) accepts the 4-value
 * subset of CSS Box Alignment. `baseline` is excluded on purpose —
 * it has no useful meaning when items can span rows / columns.
 *
 * Narrows the Commons `TAlign` vocabulary rather than redeclaring its
 * literals, so a rung added to `ALIGN` cannot silently bypass this
 * component's surface.
 */
export type TGridPlaceItems = Exclude<TAlign, 'baseline'>

/**
 * Place-content (`align-content` + `justify-content`) — aligns the
 * full grid inside its container when the grid is smaller than the
 * available space. Mirrors the CSS Box Alignment matrix: the full
 * `JUSTIFY` distribution vocabulary plus `stretch`, which only the
 * `ALIGN` side carries.
 */
export type TGridPlaceContent = TJustify | Extract<TAlign, 'stretch'>

/**
 * Gap size tokens (`'xs' | 'sm' | 'md' | 'lg' | 'xl'`). When the
 * consumer passes one of these strings to the `gap` / `columnGap`
 * / `rowGap` prop, `<OrigamGrid>` resolves it to a `var(--origam-grid---gap-{token})`
 * reference (which itself points at `space.*` primitives via
 * `tokens/component/grid.json`).
 *
 * Any other string is passed through verbatim (`'24px'`, `'1rem 2rem'`).
 * Plain `number` is interpreted as pixels.
 *
 * Reuses the Commons abbreviated size vocabulary (`TRoundedToken`, see
 * `Commons/rounded.type.ts`) rather than redeclaring the same 5 string
 * literals — same naming convention, unrelated CSS property (gap, not
 * radius).
 */
export type TGridGapSize = Exclude<TRoundedToken, 'none' | 'full'>
