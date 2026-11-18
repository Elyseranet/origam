import { useT as usePlaygroundT, useComponentRegistry } from '@origam/playground/composables'
import { catalogFamilyOf, loadCatalogDefinitions } from '@origam/playground/catalog'
import { createDefaultSnippets, SCENE_VERSION, SNIPPET_PARENT_OF } from '@origam/playground/consts'
import { acceptsDefaultSlot, attachSnippets, createInstanceId, instantiateSnippet } from '@origam/playground/utils'
import type { IComponentSnippet, IPlaygroundInstance, IPlaygroundScene } from '@origam/playground/interfaces'

import { useT } from '~/composables/useT'
import {
    MARKETING_SNIPPET_PARENT_OF,
    PLAYGROUND_FALLBACK_SLOT_TEXT,
    PLAYGROUND_RENDERED_BY
} from '~/consts/playground-host.const'
import { createMarketingSnippets } from '~/consts/playground-snippets.const'
import type {
    IPlaygroundFallbackContent,
    IPlaygroundHostEntry,
    IPlaygroundHostOptions
} from '~/interfaces/playground-host.interface'
import { collectComponentNames, findInstanceOf, mergeSnippetTables, snippetFor } from '~/utils/playground-host.util'

/**
 * usePlaygroundHost — the marketing site as a HOST of `@origam/playground`
 * (lot E, #1145). One entry point for the two pages that render through the
 * playground engine, `/components/{slug}` and `/theming`:
 *
 *  - definitions come from the playground's COMMITTED catalogue
 *    (`@origam/playground/catalog`, 219 components), one chunk per component,
 *    loaded for the documented component's FAMILY plus every component its
 *    snippets nest — never the whole catalogue;
 *  - snippets: the playground's own first (`createDefaultSnippets`), then the
 *    marketing ones (`createMarketingSnippets`, ex-`COMPONENT_PREVIEW_ADAPTERS`);
 *  - implementations: one shared loader, `origam/components` — the marketing
 *    Nuxt module already registers the whole barrel, so this costs no chunk.
 *
 * ⛔ Client only. `createInstanceId` is `crypto.randomUUID`, so a scene built on
 * the server and again on the client carries different ids; both pages mount
 * the engine inside `<client-only>`, and call `load()` from `onMounted`.
 */
export function usePlaygroundHost (options: IPlaygroundHostOptions) {
    const { t } = useT()
    const { t: playgroundT } = usePlaygroundT()

    const snippets = mergeSnippetTables(createDefaultSnippets(playgroundT), createMarketingSnippets(t, options.overlayAttach))
    const parentOf = { ...SNIPPET_PARENT_OF, ...MARKETING_SNIPPET_PARENT_OF }
    const loadComponents = () => import('origam/components')

    const namesFor = (componentName: string): string[] => {
        const renderedBy = PLAYGROUND_RENDERED_BY[componentName]
        const family = [...catalogFamilyOf(componentName), ...(renderedBy ? catalogFamilyOf(renderedBy) : [])]
        const nested = family.flatMap(name => (snippets[name] ?? []).flatMap((snippet: IComponentSnippet) => collectComponentNames(snippet.instances)))
        return [...new Set([componentName, ...family, ...nested])]
    }

    /**
     * Registry + scene factory for one documented component, or `null` when
     * the catalogue does not carry it.
     */
    const load = async (componentName: string, fallback: IPlaygroundFallbackContent = {}): Promise<IPlaygroundHostEntry | null> => {
        const definitions = attachSnippets(await loadCatalogDefinitions(namesFor(componentName)), snippets, parentOf)
        const definition = definitions.find(candidate => candidate.name === componentName)

        if (!definition) return null

        const loaders = Object.fromEntries([...new Set(definitions.map(candidate => candidate.family))].map(family => [family, loadComponents]))
        const registry = useComponentRegistry({ definitions, loaders })
        const own = snippetFor(componentName, definitions)
        /*
         * A sub-part its parent renders INTERNALLY cannot be a scene instance,
         * but it is on screen inside that parent: preview the parent's snippet
         * rather than nothing (`renderedByParent`, `PLAYGROUND_RENDERED_BY`).
         */
        const renderedBy = own ? undefined : PLAYGROUND_RENDERED_BY[componentName]
        const snippet = own ?? (renderedBy ? snippetFor(renderedBy, definitions) : undefined)
        const parent = renderedBy && snippet ? renderedBy : undefined

        /*
         * No snippet: a blank instance — with text in its default slot when it
         * declares one, the fiche's own `defaultSlotContent` first. An empty
         * container is a 0 × 0 box, a preview that lies.
         */
        const blank = (): IPlaygroundInstance[] => {
            const slotContent = fallback.slotContent
                || (acceptsDefaultSlot(definition) ? t(PLAYGROUND_FALLBACK_SLOT_TEXT.key, PLAYGROUND_FALLBACK_SLOT_TEXT.fallback) : '')
            return [{ id: createInstanceId(), componentName, props: {}, ...(slotContent ? { slotContent } : {}) }]
        }

        const createScene = (): IPlaygroundScene => {
            const roots = snippet ? instantiateSnippet(snippet) : blank()
            /* The inspector opens on the DOCUMENTED component, not on the parent that hosts it. */
            const selected = findInstanceOf(roots, componentName) ?? roots[0]
            return { version: SCENE_VERSION, roots, selectedInstanceId: selected?.id ?? null }
        }

        return {
            componentName,
            registry,
            createScene,
            hasSnippet: !!snippet,
            renderedByParent: parent ? registry.getComponentMetadata(parent)?.label ?? parent : null
        }
    }

    return { load }
}
