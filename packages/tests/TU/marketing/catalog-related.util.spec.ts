// #1172 — lignes de l'encart « Same subject in the other families » : ordre des familles, repli au-delà de 12.
import { describe, expect, it } from 'vitest'

import { CATALOG_RELATED_LIMIT } from '~/consts/catalog-detail-nav.const'
import { buildRelatedGroupViews, isRelatedEntryShown, isRelatedGroupCollapsible } from '~/utils/catalog-related.util'

import type { ICatalogRelatedGroup } from '~/interfaces/catalog-neighbours.interface'
import type { TReferenceKind } from '~/types/api-reference.type'

const t = (key: string, fallback?: string, named?: Record<string, unknown>) => `${key}|${fallback}|${named ? JSON.stringify(named) : ''}`
const localeHref = (path: string) => `/fr${path}`

const entries = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => ({ slug: `${prefix}-${i}`, name: `${prefix}${String(i).padStart(2, '0')}` }))

const related: ICatalogRelatedGroup[] = [
    { kind: 'const', entries: entries('C', 3) },
    { kind: 'interface', entries: entries('I', 22) },
    { kind: 'directive', entries: entries('d', 2) },
    { kind: 'component', entries: entries('btn', 1) }
]

const build = (open: TReferenceKind[] = []) => buildRelatedGroupViews(related, 'component', new Set(open), t, localeHref, 'p')

describe('catalog-related.util', () => {
    it('la limite vaut 12', () => {
        expect(CATALOG_RELATED_LIMIT).toBe(12)
    })

    it('replie strictement au-delà de la limite', () => {
        expect(isRelatedGroupCollapsible(12)).toBe(false)
        expect(isRelatedGroupCollapsible(13)).toBe(true)
    })

    it('montre les 12 premières entrées repliées, toutes une fois dépliée', () => {
        expect(isRelatedEntryShown(11, false)).toBe(true)
        expect(isRelatedEntryShown(12, false)).toBe(false)
        expect(isRelatedEntryShown(21, true)).toBe(true)
    })

    it('suit l’ordre du catalogue et écarte la famille de la fiche lue', () => {
        expect(build().map(g => g.kind)).toEqual(['directive', 'interface', 'const'])
    })

    it('garde l’ordre des entrées tel que l’API le livre', () => {
        expect(build().find(g => g.kind === 'interface')!.entries.map(e => e.name)).toEqual(related[1].entries.map(e => e.name))
    })

    it('replie la ligne de 22 : 12 entrées montrées, les 10 autres gardées mais masquées', () => {
        const group = build().find(g => g.kind === 'interface')!

        expect(group.entries).toHaveLength(22)
        expect(group.entries.filter(e => e.isShown)).toHaveLength(12)
        expect(group.isCollapsible).toBe(true)
        expect(group.isOpen).toBe(false)
        expect(group.toggleLabel).toBe('catalog_nav.related_show_all|Show all 22|{"count":22}')
        expect(group.toggleIcon).toBe('mdi-chevron-down')
    })

    it('déplie la ligne demandée, et elle seule', () => {
        const groups = build(['interface'])
        const group = groups.find(g => g.kind === 'interface')!

        expect(group.isOpen).toBe(true)
        expect(group.entries.every(e => e.isShown)).toBe(true)
        expect(group.toggleLabel).toBe('catalog_nav.related_show_fewer|Show fewer|')
        expect(group.toggleIcon).toBe('mdi-chevron-up')
        expect(groups.find(g => g.kind === 'const')!.isOpen).toBe(false)
    })

    it('une ligne sous la limite n’a pas de repli, même demandée ouverte', () => {
        const group = build(['const']).find(g => g.kind === 'const')!

        expect(group.isCollapsible).toBe(false)
        expect(group.isOpen).toBe(false)
        expect(group.entries.every(e => e.isShown)).toBe(true)
    })

    it('construit les liens localisés, les ids et le compteur', () => {
        const group = build().find(g => g.kind === 'directive')!

        expect(group.entries[0].href).toBe('/fr/directives/d-0')
        expect(group.labelId).toBe('p-directive-label')
        expect(group.listId).toBe('p-directive-list')
        expect(group.count).toBe('2')
        expect(group.label).toBe('nav.directives|Directives|')
    })
})
