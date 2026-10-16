/**
 * useCatalogRelatedFamilies — l'encart « Same subject in the other families »
 * d'une fiche de référence (#1172) : ses lignes, et le repli de chacune.
 *
 * Relations STOCKÉES uniquement, lues dans les deux sens par le serveur
 * (`/api/reference/neighbours`). Aucun rapprochement par le nom : l'encart ne
 * fait que présenter ce que l'API a résolu. La mise en forme des lignes vit
 * dans `catalog-related.util.ts` ; ce composable n'y ajoute que l'état réactif.
 */
import { computed, ref, useId, watch } from 'vue'

import { useCatalogNeighbours } from './useApiReference'
import { useLocaleHref } from './useLocaleHref'
import { useT } from './useT'

import { buildRelatedGroupViews } from '../utils/catalog-related.util'

import type { ICatalogDetailNavProps } from '../interfaces/catalog-detail-nav.interface'
import type { TReferenceKind } from '../types/api-reference.type'

export function useCatalogRelatedFamilies (props: ICatalogDetailNavProps) {
    const { t } = useT()
    const { localeHref } = useLocaleHref()

    const titleId = `catalog-related-${useId()}`

    const slug = computed(() => props.slug)

    const { data: neighbours } = useCatalogNeighbours(props.kind, slug)

    /** Les familles que le lecteur a dépliées. Remis à zéro quand la fiche change. */
    const openKinds = ref<ReadonlySet<TReferenceKind>>(new Set())

    watch(slug, () => {
        openKinds.value = new Set()
    })

    const groups = computed(() => buildRelatedGroupViews(
        neighbours.value?.related ?? [],
        props.kind,
        openKinds.value,
        t,
        localeHref,
        titleId
    ))

    const hasRelated = computed(() => groups.value.length > 0)

    const toggle = (kind: TReferenceKind) => {
        const next = new Set(openKinds.value)

        if (next.has(kind)) next.delete(kind)
        else next.add(kind)

        openKinds.value = next
    }

    return { titleId, groups, hasRelated, toggle }
}
