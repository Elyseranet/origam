import { FEATURE_QUERIES } from '../../consts/CssSupport/css-support.const'

/**
 * Name of a feature in the monitored CSS support matrix.
 *
 * Derived from `FEATURE_QUERIES` rather than restated, so adding an
 * entry to that `as const satisfies` literal is the single edit needed
 * to widen the matrix — the type follows automatically.
 */
export type TCssFeatureName = keyof typeof FEATURE_QUERIES

/** Snapshot of the whole matrix: every feature name → supported or not. */
export type TCssSupportMap = Readonly<Record<TCssFeatureName, boolean>>
