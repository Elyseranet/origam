import type { TGridGapSize, TMasonryAlign } from '../../types'

/**
 * Closed list of valid `align` values for `<OrigamMasonry>`. Exposed so
 * stories / consumers can iterate the matrix without re-typing the
 * literals.
 */
export const MASONRY_ALIGNS: ReadonlyArray<TMasonryAlign> = [
    'top',
    'center'
]

/**
 * Defaults for `<OrigamMasonry>`. Duplicated here so consumers can
 * reference them when authoring their own wrappers without re-importing
 * the component.
 *
 * - `columns: 3`         — typical Pinterest-ish layout.
 * - `gap: 'md'`          — reuses the same token matrix as `<OrigamGrid>`.
 * - `animated: true`     — visually nicer transitions on resize / column
 *                          count flip; disable for performance-sensitive
 *                          screens or when consumers prefer no motion.
 * - `align: 'top'`       — Pinterest semantics.
 * - `tag: 'div'`         — neutral generic wrapper.
 */
export const MASONRY_DEFAULTS = {
    columns: 3,
    gap: 'md' as TGridGapSize,
    animated: true,
    align: 'top' as TMasonryAlign,
    tag: 'div'
} as const
