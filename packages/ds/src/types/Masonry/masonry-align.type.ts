/**
 * Vertical alignment of items inside a single masonry column.
 *
 * - `'top'`     — items packed against the top of the column (default,
 *                 Pinterest-style).
 * - `'center'`  — column content is centred vertically inside the
 *                 container height (rare, but useful when the masonry
 *                 sits inside a taller flex parent and the consumer
 *                 wants the visual centre of gravity in the middle).
 *
 * Only honoured by the JS fallback path — the CSS-native masonry path
 * uses `align-items` semantics, which already maps to `start` (top).
 * The CSS path therefore always aligns to top; switching to `'center'`
 * implicitly forces the JS fallback so the value is observable.
 */
export type TMasonryAlign =
    | 'top'
    | 'center'
