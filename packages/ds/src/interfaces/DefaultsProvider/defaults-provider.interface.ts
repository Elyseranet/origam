import type { ICommonsComponentProps } from '../../interfaces'

/**
 * Defaults map shape consumed by `<OrigamDefaultsProvider>` and resolved
 * by `useDefaults()` in components.
 *
 * - `global` keys apply to every component in the subtree.
 * - Any other top-level key is matched against the component's name
 *   (kebab-case `getCurrentInstanceName()`), so `OrigamBtn`'s instance
 *   name `origam-btn` reads from `defaults['origam-btn']`.
 *
 * Example
 * ```ts
 * <OrigamDefaultsProvider :defaults="{
 *   global:        { density: 'comfortable' },
 *   'origam-btn':  { color:   'primary' },
 *   'origam-chip': { variant: 'outlined' }
 * }">
 *   ...
 * </OrigamDefaultsProvider>
 * ```
 */
export interface IDefault {
    global?: Record<string, unknown>
    [key: string]: Record<string, unknown> | undefined
}

export interface IDefaultProviderProps extends ICommonsComponentProps {
    /** Map of defaults keyed by `global` or component name. */
    defaults?: IDefault
    /**
     * When `true`, parent defaults are passed through unchanged — useful to
     * temporarily disable an outer DefaultsProvider without unmounting it.
     */
    disabled?: boolean
    /**
     * When set, parent defaults are NOT inherited; the subtree starts from
     * this provider's defaults only. The value is opaque (string/number) but
     * can be used to track resets in DevTools.
     */
    reset?: string | number
    /**
     * Marks the provider as a root scope. Equivalent to `reset` in behaviour
     * (no parent inheritance) but communicates a different intent (this is
     * the top of a defaults tree, not a mid-tree override).
     */
    root?: string | number
    /**
     * When `true`, parent defaults are not merged in — the subtree only
     * sees this provider's defaults. Same as `reset` but expressed
     * declaratively without needing a discriminator value.
     */
    scoped?: boolean
}

/**
 * Slots for `<OrigamDefaultsProvider>`. The component is structurally
 * transparent (no rendered chrome), so `default` carries the subtree.
 */
export interface IDefaultProviderSlots {
    default(): unknown
}
