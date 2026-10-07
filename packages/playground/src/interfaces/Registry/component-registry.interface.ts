import type { IComponentDefinition } from '../Catalog/component-definition.interface'
import type { TComponentLoader, TComponentResolution } from '../../types/Commons/prop-value.type'

/*********************************************************
 * IComponentRegistryOptions
 *
 * @description
 * What a host hands the registry at construction. Both halves are supplied by
 * the host rather than discovered, so the registry stays free of any
 * build-tool assumption: an autonomous app can pass `import.meta.glob`
 * loaders, a Nuxt host can pass its own, and a test can pass plain objects.
 ********************************************************/
export interface IComponentRegistryOptions {
    /** The catalogue. Metadata only — no component implementation. */
    definitions: IComponentDefinition[]
    /**
     * How to fetch an implementation, keyed by FAMILY (`'Btn'`), falling back
     * to a component name key when a host registers one component alone.
     *
     * Keyed by family because that is the DS's own unit: 96
     * `components/{Family}/index.ts` barrels cover the 218 SFCs, so one
     * loader serves every member of its family and a parent arrives together
     * with the sub-components that cannot render without it.
     */
    loaders?: Record<string, TComponentLoader>
}

/*********************************************************
 * IComponentRegistry
 *
 * @description
 * The three questions the playground asks about the catalogue, and nothing
 * else. Two are synchronous because they only read metadata; the third is
 * asynchronous because it may fetch code.
 *
 * @description
 * ⛔ That asymmetry is the contract, not an implementation detail. A
 * synchronous `getComponent` would force the whole catalogue to be loaded up
 * front — 218 components — which is precisely what this indirection exists to
 * avoid. Any caller that wants the metadata must use `getComponentMetadata`
 * and must NOT reach for `getComponent` to get at it.
 ********************************************************/
export interface IComponentRegistry {
    /**
     * Resolve an implementation, loading it on first use and caching it after.
     *
     * Returns `null` for an unknown name instead of throwing: a host may
     * register a partial catalogue, so asking for an absent component is
     * routine rather than exceptional.
     */
    getComponent: (name: string) => Promise<TComponentResolution>
    /**
     * The whole catalogue, metadata only. Synchronous and loads nothing.
     */
    getComponents: () => IComponentDefinition[]
    /**
     * One component's metadata, or `undefined` when it is not registered.
     * Synchronous and loads nothing.
     */
    getComponentMetadata: (name: string) => IComponentDefinition | undefined
}
