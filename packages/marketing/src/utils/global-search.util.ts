/**
 * Construction et filtrage des commandes de la palette ⌘K.
 *
 * Fonctions pures, sans Vue : le composable `useGlobalSearch` les branche sur
 * l'état réactif, les tests les appellent directement.
 *
 * Pourquoi un pré-filtre ici alors que `OrigamCommandPalette` filtre déjà :
 * le composant rend UN `<button>` par commande retenue et sa recherche floue
 * (sous-séquence) retient presque tout dès 2 caractères. Avec ~2 800 entrées
 * c'est des milliers de nœuds. On lui transmet donc une liste déjà restreinte
 * à la famille choisie, à la requête, et plafonnée — il n'a plus qu'à
 * ré-ordonner quelques dizaines de lignes.
 */
import type { ICommand } from 'origam/interfaces'

import { CATALOG_FAMILIES } from '../consts/catalog-family.const'
import { GLOBAL_SEARCH_FAMILY_ICONS } from '../consts/global-search.const'
import type { ICatalogFamily } from '../interfaces/catalog-family.interface'
import type { IGlobalSearchEntry, IGlobalSearchStaticPage } from '../interfaces/global-search.interface'
import type { TTranslate } from '../types/global-search.type'

/** Identifiant stable d'une commande : `{kind}-{slug}`. */
export function globalSearchCommandId (kind: string, slug: string): string {
    return `${kind}-${slug}`
}

/** Chemin applicatif brut (sans préfixe de locale) d'une commande de famille, ou `null`. */
export function globalSearchFamilyHref (commandId: string): string | null {
    const family = CATALOG_FAMILIES.find(f => commandId.startsWith(`${f.kind}-`))

    if (!family) return null

    return `${family.route}/${commandId.slice(family.kind.length + 1)}`
}

/** Commandes d'une famille. Les membres de famille de composant (sans page) sont écartés. */
export function buildFamilyCommands (
    family: ICatalogFamily,
    entries: ReadonlyArray<IGlobalSearchEntry>,
    t: TTranslate
): ICommand[] {
    const group = t(family.labelKey, family.labelFallback)
    const commands: ICommand[] = []

    for (const entry of entries) {
        if (entry.parentSlug) continue

        commands.push({
            id: globalSearchCommandId(family.kind, entry.slug),
            label: entry.name,
            description: entry.descriptionFallback,
            icon: entry.icon || GLOBAL_SEARCH_FAMILY_ICONS[family.kind],
            group,
            keywords: [entry.slug, (entry.category ?? entry.domain ?? '').toLowerCase(), family.kind],
            perform: () => undefined
        })
    }

    return commands
}

/** Commandes des pages statiques, libellé et description traduits. */
export function buildStaticPageCommands (
    pages: ReadonlyArray<IGlobalSearchStaticPage>,
    group: string,
    t: TTranslate
): ICommand[] {
    return pages.map(page => ({
        id: page.id,
        label: t(page.labelKey, page.labelFallback),
        description: t(page.descriptionKey, page.descriptionFallback),
        icon: page.icon,
        group,
        keywords: page.keywords,
        perform: () => undefined
    }))
}

/** Rang d'une commande pour une requête : plus petit = meilleur, `-1` = écartée. */
function rank (command: ICommand, needle: string): number {
    const label = command.label.toLowerCase()

    if (label.startsWith(needle)) return 0
    if (label.includes(needle)) return 1
    if ((command.keywords ?? []).some(k => k.toLowerCase().includes(needle))) return 2
    if ((command.description ?? '').toLowerCase().includes(needle)) return 3

    return -1
}

/**
 * Restreint `pool` à la requête et au plafond.
 *
 * - requête vide : les `cap` premières commandes (ordre du catalogue) ;
 * - sinon : sous-chaîne sur le libellé, les mots-clés puis la description,
 *   triées par rang (préfixe d'abord), tri stable.
 */
export function searchCommands (pool: ReadonlyArray<ICommand>, query: string, cap: number): ICommand[] {
    const needle = query.trim().toLowerCase()

    if (!needle) return pool.slice(0, cap)

    const ranked: Array<{ command: ICommand, rank: number, index: number }> = []

    pool.forEach((command, index) => {
        const r = rank(command, needle)

        if (r >= 0) ranked.push({ command, rank: r, index })
    })

    ranked.sort((a, b) => a.rank - b.rank || a.index - b.index)

    return ranked.slice(0, cap).map(r => r.command)
}
