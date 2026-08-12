import type { TBackdropBlur } from '../../types'

/**
 * Backdrop-blur prop surface — `backdrop-filter: blur(...)` expressed as
 * props instead of shipped CSS (ADR-005, Q1 arbitration).
 *
 * Named `IBackdropProps` / `backdropBlur`, NOT reusing
 * `filters.interface.ts` (`IFiltersProps`): that file is the
 * autocomplete / search-filter contract consumed by `OrigamSelect`
 * (`customFilter`, `filterKeys`, `filterMode`, …) — DATA filtering, an
 * unrelated concept that happens to share the English word "filter" with
 * the CSS graphical filter this interface models. Kept as two separate,
 * unambiguously-named files on purpose so a reader grepping "filter"
 * isn't misled into thinking one supersedes the other.
 */
export interface IBackdropProps {
    backdropBlur?: TBackdropBlur
}
