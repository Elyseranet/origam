/**
 * Shape of a component's `variant` preset table (ADR-005).
 *
 * A preset is a named `Partial<Props>` — NOT a CSS rule. For every value
 * the component's `variant` prop can take, it declares the subset of OTHER
 * props that value should default to when the consumer doesn't set them.
 *
 * WHY this must be the exact shape `IOrigamTheme.variants[component]` also
 * uses (ADR-005 "a preset IS theme configuration" directive): a DS-shipped
 * preset and a theme-authored variant override are resolved by the SAME
 * mechanism (`useDefaults`'s preset tier, see `defaults.composable.ts`), one
 * tier apart. If the two shapes ever diverge, that reuse breaks and the
 * maintainer's stated goal — consumers naming their own variants from the
 * theming layer — becomes impossible.
 */
export type TVariantPresets<V extends string, P> = Partial<Record<V, Partial<P>>>
