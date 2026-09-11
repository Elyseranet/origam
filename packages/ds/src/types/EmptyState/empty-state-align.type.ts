/**
 * Horizontal alignment of the icon / title / description / actions
 * stack inside `<OrigamEmptyState>`.
 *
 * - `center` — default. Centred stack, content also `text-align: center`.
 *              Best for full-page or full-section placeholders.
 * - `left`   — left-aligned stack. Best for narrow side panels or list
 *              empty zones where the surrounding content is left-aligned.
 */
export type TEmptyStateAlign = 'center' | 'left'
