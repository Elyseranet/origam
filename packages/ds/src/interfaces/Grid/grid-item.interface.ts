import type {
    ICommonsComponentProps,
    ITagProps
} from '../../interfaces'

import type { TGridPlaceSelf } from '../../types'

/**
 * Object syntax for a grid line spec. The same shape is used for
 * `column` and `row`. Either pass `start` + `end`, or `start` + `span`,
 * or any subset (defaults are `auto`).
 *
 * `span` is mutually exclusive with `end` — when both are passed, `span`
 * wins (it's the more common ergonomic case).
 */
export interface IGridLineSpec {
    /** Inclusive starting grid line. Accepts a number or a named line. */
    start?: number | string
    /** Exclusive ending grid line. Accepts a number or a named line. */
    end?: number | string
    /** Span N tracks from `start`. Wins over `end` when both are set. */
    span?: number
}

/**
 * Props for `<OrigamGridItem>` — a thin wrapper that emits the per-item
 * CSS Grid placement properties. The component is optional: anyone can
 * achieve the same result by setting `style="grid-area: …"` on a plain
 * `<div>`. The wrapper exists to (a) avoid forcing consumers to remember
 * the verbose CSS syntax, and (b) accept an ergonomic object syntax.
 */
export interface IGridItemProps extends ICommonsComponentProps, ITagProps {
    /**
     * Inline-axis placement (`grid-column`). Two accepted shapes:
     *
     * - object: `{ start: 1, end: 5 }` or `{ start: 1, span: 4 }` —
     *   the component serialises to the right CSS.
     * - string: `'1 / 5'`, `'span 2'`, `'main-start / main-end'` —
     *   passed verbatim.
     */
    column?: IGridLineSpec | string | number
    /**
     * Block-axis placement (`grid-row`). Same accepted shapes as `column`.
     */
    row?: IGridLineSpec | string | number
    /**
     * `grid-area` name. When set, overrides `column` / `row` (CSS rule).
     * Use this in conjunction with the parent grid's `areas` prop.
     */
    area?: string
    /**
     * Per-item `align-self` override. Falls back to the parent grid's
     * `alignItems` when unset.
     */
    alignSelf?: TGridPlaceSelf
    /**
     * Per-item `justify-self` override. Falls back to the parent grid's
     * `justifyItems` when unset.
     */
    justifySelf?: TGridPlaceSelf
}
