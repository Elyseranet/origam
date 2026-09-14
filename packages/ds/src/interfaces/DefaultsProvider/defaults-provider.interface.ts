
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

/*********************************************************
 * IDefaultProviderProps
 *
 * @description
 * ⛔ N'etend PAS `ICommonsComponentProps`, et c'est structurel :
 * `<OrigamDefaultsProvider>` est SANS RACINE — son template est un `<slot/>`
 * nu. `id`, `class` et `style` n'ont aucun element sur lequel atterrir.
 *
 * @description
 * Les declarer les rendait invisibles a Vue (une prop declaree sort de
 * `$attrs`) sans rien peindre : un consommateur qui ecrivait
 * `<origam-defaults-provider class="x">` perdait sa classe en silence, la ou
 * l'absence de declaration l'aurait au moins fait retomber sur l'enfant.
 * Trois entrees de la baseline C1. Issue #550.
 ********************************************************/
export interface IDefaultProviderProps {
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

/*********************************************************
 * IDefaultProviderEmits
 *
 * @description
 * `<OrigamDefaultsProvider>` emits nothing of its own — it only calls
 * `provideDefaults()` (a `provide`, not an emit) to publish the map to
 * descendants.
 ********************************************************/
export interface IDefaultProviderEmits {}

/**
 * Slots for `<OrigamDefaultsProvider>`. The component is structurally
 * transparent (no rendered chrome), so `default` carries the subtree.
 */
export interface IDefaultProviderSlots {
    default(): unknown
}
