/**
 * catalog-neighbours.spec.ts — l'ordre de l'index et le voisinage prev / next
 * (#1032). Logique pure : aucune base, aucun serveur.
 *
 * Le point que la mesure a justifié : l'index n'est PAS trié par nom, il est
 * groupé. Un prev / next qui trierait par nom donnerait d'autres voisins que
 * ceux que le visiteur voit côte à côte dans l'index.
 */

import { describe, expect, it } from 'vitest'

import {
    neighboursIn,
    orderCatalogSequence,
    orderSiblings
} from '../../../marketing/src/utils/catalog-neighbours.util'

import type { ICatalogSequenceRow } from '../../../marketing/src/interfaces/catalog-neighbours.interface'

const row = (slug: string, category: string | null, domain: string | null = null, parent: string | null = null): ICatalogSequenceRow => ({
    slug,
    name: slug.toUpperCase(),
    category,
    domain,
    parent_slug: parent
})

const slugs = (rows: ICatalogSequenceRow[]) => rows.map(r => r.slug)

describe('orderCatalogSequence — groupé par catégorie, pas trié par nom', () => {
    // Lignes dans l'ordre du catalogue (par NOM) : a, b, c, d — catégories croisées.
    const rows = [row('a', 'Zeta'), row('b', 'Alpha'), row('c', 'Zeta'), row('d', 'Alpha')]

    it('suit l’ordre des catégories fourni, puis le nom dans chaque catégorie', () => {
        expect(slugs(orderCatalogSequence('interface', rows, ['Alpha', 'Zeta']))).toEqual(['b', 'd', 'a', 'c'])
    })

    it('contrairement à un tri par nom, a et b ne sont PAS voisins', () => {
        const seq = orderCatalogSequence('interface', rows, ['Alpha', 'Zeta'])

        expect(neighboursIn(seq, 'a').prev?.slug).toBe('d')
        expect(neighboursIn(seq, 'a').next?.slug).toBe('c')
    })

    it('exclut les membres de famille de l’index', () => {
        const withSub = [...rows, row('sub', 'Alpha', null, 'a')]

        expect(slugs(orderCatalogSequence('component', withSub, ['Alpha', 'Zeta']))).not.toContain('sub')
    })

    it('garde en queue une entrée sans catégorie plutôt que de la perdre', () => {
        const seq = orderCatalogSequence('util', [...rows, row('orphan', null)], ['Alpha', 'Zeta'])

        expect(slugs(seq).at(-1)).toBe('orphan')
    })
})

describe('orderCatalogSequence — composable : domaines triés par .sort() JS', () => {
    it('reproduit l’ordre de code-points de l’index, pas celui de Postgres', () => {
        // `.sort()` place « Zeta » avant « alpha » (majuscule < minuscule) ;
        // une collation de base de données les inverserait.
        const rows = [row('x', null, 'alpha'), row('y', null, 'Zeta')]

        expect(slugs(orderCatalogSequence('composable', rows, ['ignored']))).toEqual(['y', 'x'])
    })

    it('ignore la liste de catégories : le groupe est le domaine', () => {
        const rows = [row('x', 'Cat', 'B'), row('y', 'Cat', 'A')]

        expect(slugs(orderCatalogSequence('composable', rows, ['Cat']))).toEqual(['y', 'x'])
    })
})

describe('orderCatalogSequence — directive : liste plate', () => {
    it('garde l’ordre du catalogue', () => {
        const rows = [row('contrast', 'z'), row('ripple', 'a')]

        expect(slugs(orderCatalogSequence('directive', rows, ['a', 'z']))).toEqual(['contrast', 'ripple'])
    })
})

describe('orderSiblings — frères d’un composant membre de famille', () => {
    const rows = [
        row('competitor', 'Data', null, 'bracket'),
        row('match', 'Data', null, 'bracket'),
        row('round', 'Data', null, 'bracket'),
        row('other-sub', 'Data', null, 'autre'),
        row('bracket', 'Data')
    ]

    it('suit l’ordre des relations family du parent', () => {
        expect(slugs(orderSiblings(rows, 'bracket', ['round', 'match', 'competitor']))).toEqual(['round', 'match', 'competitor'])
    })

    it('ne mélange jamais les enfants d’un autre parent ni le parent lui-même', () => {
        const seq = slugs(orderSiblings(rows, 'bracket', ['round', 'match', 'competitor']))

        expect(seq).not.toContain('other-sub')
        expect(seq).not.toContain('bracket')
    })

    it('place les frères non listés après les listés, dans l’ordre du catalogue', () => {
        expect(slugs(orderSiblings(rows, 'bracket', ['round']))).toEqual(['round', 'competitor', 'match'])
    })
})

describe('neighboursIn', () => {
    const seq = [row('a', 'x'), row('b', 'x'), row('c', 'x')]

    it('bords : pas de précédent au début, pas de suivant à la fin', () => {
        expect(neighboursIn(seq, 'a')).toEqual({ prev: null, next: { slug: 'b', name: 'B' } })
        expect(neighboursIn(seq, 'c')).toEqual({ prev: { slug: 'b', name: 'B' }, next: null })
    })

    it('slug absent de la séquence : aucun voisin, pas d’exception', () => {
        expect(neighboursIn(seq, 'zzz')).toEqual({ prev: null, next: null })
    })

    it('séquence à un seul élément : ni précédent ni suivant', () => {
        expect(neighboursIn([row('solo', 'x')], 'solo')).toEqual({ prev: null, next: null })
    })
})
