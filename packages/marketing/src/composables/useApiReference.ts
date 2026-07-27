/**
 * useApiReference — composable SSR-friendly pour les pages API Reference.
 *
 * Remplace les import.meta.glob('~/consts/<famille>/*.const.ts', {eager:true})
 * et les imports de const catalogue par des appels à l'API Nitro.
 *
 * Trois fonctions exportées :
 *  - useReferenceCatalog  → liste légère d'une famille (index pages)
 *  - useReferenceDoc      → objet doc complet d'une entrée (slug pages)
 *  - useReferenceCategories → groupes d'affichage (remplace *_CATEGORIES)
 *
 * L'API validée est définie dans :
 *  - server/api/reference/[kind].get.ts
 *  - server/api/reference/[kind]/[slug].get.ts
 *  - server/api/reference/categories/[kind].get.ts
 */

import type { Ref, ComputedRef } from 'vue'
import type { TReferenceKind } from '~/types/api-reference.type'

export type { TReferenceKind } from '~/types/api-reference.type'

/**
 * Fetches the lightweight catalog for one entity family.
 *
 * Réutilise le cache Nuxt (même clé → un seul aller-réseau par page SSR).
 * Retourne un Ref<T[]> peuplé côté serveur.
 *
 * @param kind     - L'une des 8 familles DOC_KINDS.
 * @param category - Filtre optionnel category/domain (transmis en query param).
 */
export function useReferenceCatalog<T>(kind: TReferenceKind, category?: string) {
    return useFetch<T[]>(`/api/reference/${kind}`, {
        key: `catalog:${kind}:${category ?? ''}`,
        query: category ? { category } : undefined,
        default: () => [] as T[],
    })
}

/**
 * Fetches the full documentation object for one entity.
 *
 * - Quand le slug est falsy, retourne null sans appel réseau.
 * - Une réponse 404 déclenche une erreur fatale Nuxt (→ error.vue).
 * - La clé réactive garantit le re-fetch lors des navigations intra-page.
 *
 * Async pour que le throw createError au niveau racine soit intercepté par
 * le pipeline SSR de Nuxt — un throw à l'intérieur du handler useAsyncData
 * est absorbé par useAsyncData et ne remonte pas au serveur.
 *
 * @param kind - L'une des 8 familles DOC_KINDS.
 * @param slug - Slug réactif (Ref / ComputedRef) ou string statique.
 */
export async function useReferenceDoc<T>(
    kind: TReferenceKind,
    slug: Ref<string | null | undefined> | ComputedRef<string | null | undefined> | string | null | undefined,
) {
    const slugRef: Ref<string | null | undefined> = isRef(slug) ? slug : ref(slug)

    const result = await useAsyncData<T | null>(
        () => slugRef.value ? `doc:${kind}:${slugRef.value}` : `doc:${kind}:__skip`,
        async () => {
            if (!slugRef.value) return null
            return await $fetch<T>(`/api/reference/${kind}/${slugRef.value}`)
        },
        {
            watch: [slugRef],
            default: () => null as T | null,
        },
    )

    if (result.error.value && slugRef.value) {
        const status: number =
            (result.error.value as any)?.statusCode ??
            (result.error.value as any)?.status ??
            0
        throw createError({
            statusCode: status === 404 ? 404 : 500,
            fatal: true,
            statusMessage: status === 404
                ? `${kind} '${slugRef.value}' not found`
                : `Failed to load ${kind} '${slugRef.value}'`,
        })
    }

    return result
}

/**
 * Fetches the ordered display groups (categories / domains) for one entity family.
 *
 * Retourne les clés de catégorie sous forme de string[] (ordonnées par position).
 * Remplace les constantes statiques du type COMPONENTS_CATEGORIES.
 *
 * @param kind - L'une des 8 familles DOC_KINDS.
 */
export function useReferenceCategories(kind: TReferenceKind) {
    return useAsyncData<string[]>(
        `categories:${kind}`,
        () => $fetch<string[]>(`/api/reference/categories/${kind}`),
        { default: () => [] },
    )
}
