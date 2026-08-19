import type { TModeResolved } from './theme.type'

/**
 * Summary of one installed brand theme, derived from the `IOrigamTheme[]`
 * objects passed to `createOrigam({ themes })`. Several `IOrigamTheme` objects
 * may share the same `name` (one per mode); they are collapsed into a single
 * entry whose `modes` lists every concrete mode that brand was installed for.
 *
 * Consumers (e.g. a theme switcher) map over this list instead of hard-coding
 * the available brands — the list is the single source of truth for "what was
 * installed".
 */
export interface TInstalledTheme {
    /** Brand name, applied as `data-theme="<name>"`. */
    name: string
    /** Concrete modes this brand ships (`'light'` / `'dark'`). */
    modes: TModeResolved[]
    /**
     * Human-readable label for UI. Defaults to `name` when no installed object
     * for this brand provided a `label`.
     */
    label: string
    /** Short description for UI, when an installed object provided one. */
    description?: string
    /** CSS background for a brand swatch preview, when provided. */
    swatch?: string
}

/**
 * The full installed-themes list provided by `createOrigam` and read back via
 * `useInstalledThemes()`.
 */
export type TInstalledThemes = TInstalledTheme[]
