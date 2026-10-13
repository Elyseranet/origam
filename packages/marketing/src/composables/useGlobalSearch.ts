/**
 * useGlobalSearch — index global pour la command palette du header.
 *
 * Construit un tableau ICommand depuis les 8 familles du catalogue
 * (`/api/reference/{kind}`) et les pages statiques.
 *
 * Chargement PARESSEUX : aucune des 8 familles n'est demandée au montage du
 * layout. Elles sont téléchargées une fois, à la première ouverture de la
 * palette (`ensureLoaded`). Avant ce changement, 4 familles (332 Ko) étaient
 * sérialisées dans le HTML de CHAQUE page ; en ajouter 4 de plus (+654 Ko)
 * aurait presque triplé ce coût pour des visiteurs qui n'ouvrent jamais ⌘K.
 *
 * Filtre de famille : `OrigamCommandPalette` n'a pas de prop de filtre, on lui
 * passe donc un `commands` déjà restreint (famille + requête + plafond) — voir
 * `utils/global-search.util.ts`.
 *
 * Locale (ADR #325) : chaque `descriptionFallback` vient du serveur en texte
 * localisé ; `useReferenceCatalog` transmet `?locale=` et l'inclut dans la clé.
 */
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ICommand } from 'origam/interfaces'

import {
    GLOBAL_SEARCH_ALL_FAMILY,
    GLOBAL_SEARCH_RESULT_CAP,
    GLOBAL_SEARCH_STATIC_PAGES,
    GLOBAL_SEARCH_STATIC_PAGE_HREFS
} from '~/consts/global-search.const'
import { CATALOG_FAMILIES } from '~/consts/catalog-family.const'
import type { IGlobalSearchEntry } from '~/interfaces/global-search.interface'
import type { TGlobalSearchFamily } from '~/types/global-search.type'
import { useReferenceCatalog } from '~/composables/useApiReference'
import { useT } from '~/composables/useT'
import { buildFamilyCommands, buildStaticPageCommands, globalSearchFamilyHref, searchCommands } from '~/utils/global-search.util'

/** Lignes par famille quand la requête est vide et que toutes les familles sont visibles. */
const TEASER_PER_FAMILY = 5

export function useGlobalSearch () {
    const { locale } = useI18n()
    const { t } = useT()

    const family = ref<TGlobalSearchFamily>(GLOBAL_SEARCH_ALL_FAMILY)
    const query = ref('')
    const requested = ref(false)

    const catalogs = CATALOG_FAMILIES.map(f => ({
        family: f,
        catalog: useReferenceCatalog<IGlobalSearchEntry>(f.kind, undefined, { lazy: true })
    }))

    const isLoading = computed(() => requested.value && catalogs.some(c => c.catalog.status.value === 'pending'))

    async function loadAll (): Promise<void> {
        await Promise.all(catalogs.map(c => c.catalog.execute()))
    }

    function ensureLoaded (): void {
        if (requested.value) return

        requested.value = true
        void loadAll()
    }

    watch(locale, () => {
        if (requested.value) void loadAll()
    })

    const pages = computed<ICommand[]>(() =>
        buildStaticPageCommands(GLOBAL_SEARCH_STATIC_PAGES, t('chrome.search_group_pages', 'Pages'), t)
    )

    const poolsByFamily = computed(() => {
        const pools = new Map<string, ICommand[]>()

        for (const { family: f, catalog } of catalogs) {
            pools.set(f.kind, buildFamilyCommands(f, catalog.data.value ?? [], t))
        }

        return pools
    })

    const totalEntries = computed(() => {
        let total = 0

        poolsByFamily.value.forEach(pool => { total += pool.length })

        return total
    })

    const commands = computed<ICommand[]>(() => {
        const needle = query.value.trim()
        const selected = family.value

        if (selected !== GLOBAL_SEARCH_ALL_FAMILY) {
            return searchCommands(poolsByFamily.value.get(selected) ?? [], needle, GLOBAL_SEARCH_RESULT_CAP)
        }

        if (!needle) {
            const teaser = CATALOG_FAMILIES.flatMap(f =>
                (poolsByFamily.value.get(f.kind) ?? []).slice(0, TEASER_PER_FAMILY)
            )

            return [...pages.value, ...teaser]
        }

        const all = [...pages.value, ...CATALOG_FAMILIES.flatMap(f => poolsByFamily.value.get(f.kind) ?? [])]

        return searchCommands(all, needle, GLOBAL_SEARCH_RESULT_CAP)
    })

    function setQuery (value: string): void {
        query.value = value
    }

    function resetQuery (): void {
        query.value = ''
    }

    function setFamily (value: TGlobalSearchFamily): void {
        family.value = value
    }

    /** Passe à la famille suivante (ou précédente) du cycle « Tout, famille 1 … famille 8 ». */
    function cycleFamily (step: 1 | -1): void {
        const order: TGlobalSearchFamily[] = [GLOBAL_SEARCH_ALL_FAMILY, ...CATALOG_FAMILIES.map(f => f.kind)]
        const index = order.indexOf(family.value)

        family.value = order[(index + step + order.length) % order.length]!
    }

    function getHref (commandId: string): string {
        return globalSearchFamilyHref(commandId) ?? GLOBAL_SEARCH_STATIC_PAGE_HREFS[commandId] ?? '/'
    }

    return {
        commands,
        family,
        isLoading,
        totalEntries,
        ensureLoaded,
        setQuery,
        resetQuery,
        setFamily,
        cycleFamily,
        getHref
    }
}
