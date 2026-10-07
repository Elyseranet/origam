import type { Component } from 'vue'

import type { IComponentDefinition } from '../../interfaces/Catalog/component-definition.interface'
import type {
    IComponentRegistry,
    IComponentRegistryOptions
} from '../../interfaces/Registry/component-registry.interface'
import type { TComponentResolution } from '../../types/Commons/prop-value.type'

/*********************************************************
 * useComponentRegistry
 *
 * @description
 * The catalogue's single read surface. Holds metadata for every registered
 * component and resolves implementations lazily, one family at a time.
 *
 * @description
 * ⛔ Lazy is not an optimisation here, it is the only workable shape. The DS
 * ships 218 component SFCs (measured on `develop` @ bcb9dc909, via the git
 * index), and a playground shows one or a handful at a time. Eagerly
 * importing the barrel would pull all of them — and in this DS that is worse
 * than a size cost, because importing a component executes its module graph,
 * and `packages/ds/src/types/Icon/icon.type.ts` imports `OrigamIcon.vue`
 * directly, so the type and component graphs are not separable.
 *
 * @description
 * Loaders are keyed by FAMILY, resolved by component NAME. The DS groups the
 * 218 SFCs into 96 `components/{Family}/index.ts` barrels and `origam`'s
 * package `exports` maps `./components/*` onto them, so one
 * `() => import('origam/components/Btn')` serves `OrigamBtn`,
 * `OrigamBtnGroup` and `OrigamBtnToggle` — and a parent arrives with the
 * sub-components that cannot render without it.
 ********************************************************/
export function useComponentRegistry (options: IComponentRegistryOptions): IComponentRegistry {
    const definitions = new Map<string, IComponentDefinition>()

    for (const definition of options.definitions) definitions.set(definition.name, definition)

    const loaders = options.loaders ?? {}

    /*
     * Caches the RESOLVED PROMISE, not the component.
     *
     * ⛔ Caching the component after the await would let two concurrent calls
     * for the same family both start a load — the second arrives while the
     * first is still in flight, finds the cache empty and begins again. A
     * playground triggers exactly that: rendering a parent and its children
     * in one pass asks for several names of one family at once. Storing the
     * promise makes the second caller await the first load.
     */
    const inFlight = new Map<string, Promise<TComponentResolution>>()

    const getComponents = (): IComponentDefinition[] => [...definitions.values()]

    const getComponentMetadata = (name: string): IComponentDefinition | undefined => definitions.get(name)

    const pickFromModule = (module: Record<string, unknown>, name: string): TComponentResolution => {
        /*
         * A family barrel exports its members by name; a single-component
         * loader may export `default` instead. Named first, because a barrel
         * has no meaningful `default` and falling back to one would hand back
         * an arbitrary member of the family.
         */
        const named = module[name]

        if (named) return named as Component

        const fallback = module.default

        return fallback ? (fallback as Component) : null
    }

    const getComponent = async (name: string): Promise<TComponentResolution> => {
        const definition = definitions.get(name)

        if (!definition) return null

        const cached = inFlight.get(name)

        if (cached) return cached

        /*
         * Family key first, component name second. A host registering one
         * component alone has no family barrel to point at, so it keys the
         * loader by the component's own name.
         */
        const loader = loaders[definition.family] ?? loaders[name]

        if (!loader) return null

        const resolution = Promise.resolve(loader())
            .then(module => pickFromModule(module, name))
            /*
             * A failed load must not poison the cache: drop the entry so a
             * later call can retry rather than replaying the rejection
             * forever. A chunk request lost to a flaky network is the normal
             * case this covers.
             */
            .catch((error: unknown) => {
                inFlight.delete(name)
                throw error
            })

        inFlight.set(name, resolution)

        return resolution
    }

    return { getComponent, getComponents, getComponentMetadata }
}
