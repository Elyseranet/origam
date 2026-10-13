/**
 * GET /api/reference/neighbours/:kind/:slug
 *
 * Navigation d'une fiche de détail (#1032) : ses voisins dans l'ordre de
 * l'INDEX de la famille, et les entrées des autres familles qui lui sont
 * reliées.
 *
 * ⛔ Une seule route, un seul endroit où l'ordre est décidé
 * (`orderCatalogSequence`) : un prev / next calculé côté page, avec un autre
 * tri, divergerait de l'index dès que la collation Postgres et `.sort()` JS
 * ne s'accordent plus.
 *
 * `related` ne lit QUE des relations stockées (`doc_relation`), dans les deux
 * sens — jamais de rapprochement par ressemblance de nom.
 *
 * Pas de `?locale=` : noms et slugs sont des identifiants de code, rien de
 * traduisible, donc rien à ajouter à la clé de cache.
 *
 * Cache : 5 min par kind:slug, comme les autres routes /api/reference/**.
 */

import { DocEntry } from '../../../../db/entities'
import {
    neighboursIn,
    orderCatalogSequence,
    orderSiblings,
} from '../../../../utils/catalog-neighbours'
import {
    fetchCatalogRows,
    fetchCategoryOrder,
    fetchFamilyOrder,
    fetchRelatedGroups,
} from '../../../../utils/catalog-queries'
import type { ICatalogNeighbours } from '../../../../../src/interfaces/catalog-neighbours.interface'
import type { TReferenceKind } from '../../../../../src/types/api-reference.type'

const CACHE_TTL_SECONDS = 300

export default defineCachedEventHandler(
    async (event): Promise<ICatalogNeighbours> => {
        const kind = getRouterParam(event, 'kind') ?? ''
        const slug = getRouterParam(event, 'slug') ?? ''
        assertKind(kind)
        assertSlug(slug)

        const db = await useDb()

        const entry: any = await db
            .getRepository(DocEntry)
            .createQueryBuilder('e')
            .where('e.kind = :kind AND e.slug = :slug', { kind, slug })
            .andWhere('e.orphaned_at IS NULL')
            .getOne()

        if (!entry) {
            throw createError({ statusCode: 404, statusMessage: `${kind} '${slug}' not found` })
        }

        const familyKind = kind as TReferenceKind
        const rows = await fetchCatalogRows(db, kind)

        const sequence = entry.parent_slug
            ? orderSiblings(rows, entry.parent_slug, await fetchFamilyOrder(db, entry.parent_slug))
            : orderCatalogSequence(familyKind, rows, await fetchCategoryOrder(db, kind))

        const { prev, next } = neighboursIn(sequence, slug)
        const related = await fetchRelatedGroups(db, familyKind, entry)

        return { prev, next, related }
    },
    {
        maxAge: CACHE_TTL_SECONDS,
        name: 'reference-neighbours',
        getKey: (event) =>
            `neighbours:${getRouterParam(event, 'kind') ?? ''}:${getRouterParam(event, 'slug') ?? ''}`,
    },
)
