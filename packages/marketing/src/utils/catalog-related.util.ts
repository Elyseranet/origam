/**
 * Encart « Same subject in the other families » des fiches de référence (#1172).
 *
 * Fonctions pures, sans Vue : le composable `useCatalogRelatedFamilies` les
 * branche sur l'état réactif, les tests les appellent directement.
 *
 * ⛔ Aucun tri ici. L'ordre alphabétique des entrées est posé par l'API
 * (`fetchRelatedGroups`, `server/utils/catalog-queries.ts`), qui les trie déjà
 * par nom ; le refaire ici créerait une seconde source de vérité. L'ordre des
 * LIGNES est celui du catalogue (`CATALOG_FAMILIES`).
 */
import { CATALOG_FAMILIES } from '../consts/catalog-family.const'
import {
    CATALOG_RELATED_ICON_COLLAPSED,
    CATALOG_RELATED_ICON_EXPANDED,
    CATALOG_RELATED_LIMIT
} from '../consts/catalog-detail-nav.const'
import type { ICatalogRelatedGroup, ICatalogRelatedGroupView } from '../interfaces/catalog-neighbours.interface'
import type { TReferenceKind } from '../types/api-reference.type'
import type { TTranslate } from '../types/i18n.type'

/** Vrai quand une famille compte plus d'entrées que la limite : elle se replie. */
export function isRelatedGroupCollapsible (count: number, limit = CATALOG_RELATED_LIMIT): boolean {
    return count > limit
}

/** Vrai quand l'entrée de rang `index` est affichée : ligne dépliée, ou rang sous la limite. */
export function isRelatedEntryShown (index: number, isOpen: boolean, limit = CATALOG_RELATED_LIMIT): boolean {
    return isOpen || index < limit
}

/**
 * Les lignes de l'encart, dans l'ordre du catalogue, sans la famille de la
 * fiche lue. `openKinds` = les familles dépliées par le lecteur.
 */
export function buildRelatedGroupViews (
    related: ICatalogRelatedGroup[],
    ownKind: TReferenceKind,
    openKinds: ReadonlySet<TReferenceKind>,
    t: TTranslate,
    localeHref: (path: string) => string,
    idPrefix: string
): ICatalogRelatedGroupView[] {
    return CATALOG_FAMILIES.flatMap((family) => {
        const group = related.find(g => g.kind === family.kind)

        if (!group || group.kind === ownKind) return []

        const count = group.entries.length
        const isCollapsible = isRelatedGroupCollapsible(count)
        const isOpen = isCollapsible && openKinds.has(family.kind)

        return [{
            kind: family.kind,
            label: t(family.labelKey, family.labelFallback),
            labelId: `${idPrefix}-${family.kind}-label`,
            listId: `${idPrefix}-${family.kind}-list`,
            count: String(count),
            entries: group.entries.map((entry, index) => ({
                slug: entry.slug,
                name: entry.name,
                href: localeHref(`${family.route}/${entry.slug}`),
                isShown: !isCollapsible || isRelatedEntryShown(index, isOpen)
            })),
            isCollapsible,
            isOpen,
            toggleLabel: isOpen
                ? t('catalog_nav.related_show_fewer', 'Show fewer')
                : t('catalog_nav.related_show_all', `Show all ${count}`, { count }),
            toggleIcon: isOpen ? CATALOG_RELATED_ICON_EXPANDED : CATALOG_RELATED_ICON_COLLAPSED
        }]
    })
}
