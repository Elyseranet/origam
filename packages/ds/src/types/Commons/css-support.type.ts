import { FEATURE_QUERIES } from '../../consts/Commons/css-support.const'

/**
 * Name of a feature in the monitored CSS support matrix.
 *
 * Derived from `FEATURE_QUERIES` rather than restated, so adding an
 * entry to that `as const satisfies` literal is the single edit needed
 * to widen the matrix — the type follows automatically.
 *
 * FILED UNDER `Commons/`, NOT `CssSupport/`
 * ----------------------------------------
 * `useCssSupport()` is the DS's single feature-detection layer, consumed
 * across the catalogue to pick a CSS-first path over a JS fallback — it
 * is a cross-cutting subsystem, not a component's prop surface, which is
 * exactly what `types/Commons/` is for (and why the `file-naming` guard
 * exempts that directory: a file there is deliberately not tied to one
 * component, and no `OrigamCssSupport` exists to name it after).
 *
 * The matching `FEATURE_QUERIES` const sits in `consts/CssSupport/`
 * under its own documented exemption in the same guard. Sibling
 * directories would have been more symmetrical, but that needs the
 * guard's `exemptDirs` widened to `types/CssSupport` — a guard change,
 * which is a lead's call, not a side effect of moving a type.
 */
export type TCssFeatureName = keyof typeof FEATURE_QUERIES

/** Snapshot of the whole matrix: every feature name → supported or not. */
export type TCssSupportMap = Readonly<Record<TCssFeatureName, boolean>>
