// #1032 — construction des commandes de la palette ⌘K et filtrage par famille.
import { describe, expect, it } from 'vitest'

import { CATALOG_FAMILIES } from '~/consts/catalog-family.const'
import { GLOBAL_SEARCH_FAMILY_ICONS } from '~/consts/global-search.const'
import {
    buildFamilyCommands,
    globalSearchCommandId,
    globalSearchFamilyHref,
    searchCommands
} from '~/utils/global-search.util'

import type { IGlobalSearchEntry } from '~/interfaces/global-search.interface'

const t = (_key: string, fallback?: string) => `T:${fallback}`
const family = (kind: string) => CATALOG_FAMILIES.find(f => f.kind === kind)!

const entries: IGlobalSearchEntry[] = [
    { slug: 'i-btn-props', name: 'IBtnProps', category: 'Core', descriptionFallback: 'Props of the button' },
    { slug: 'i-chip-props', name: 'IChipProps', category: 'Core', descriptionFallback: 'Chip surface' },
    { slug: 'member', name: 'Member', parentSlug: 'btn' },
    { slug: 'i-color-props', name: 'IColorProps', category: 'Commons' }
]

describe('CATALOG_FAMILIES (palette)', () => {
    it('couvre les 8 familles exactement une fois', () => {
        expect(CATALOG_FAMILIES.map(f => f.kind).sort()).toEqual(
            ['component', 'composable', 'const', 'directive', 'enum', 'interface', 'type', 'util']
        )
    })

    it('aucun kind n\'est préfixe d\'un autre (sinon le routage par id serait ambigu)', () => {
        for (const a of CATALOG_FAMILIES) {
            for (const b of CATALOG_FAMILIES) {
                if (a !== b) expect(`${b.kind}-x`.startsWith(`${a.kind}-`)).toBe(false)
            }
        }
    })
})

describe('buildFamilyCommands', () => {
    const commands = buildFamilyCommands(family('interface'), entries, t)

    it('écarte les membres de famille (sans page propre)', () => {
        expect(commands.map(c => c.label)).toEqual(['IBtnProps', 'IChipProps', 'IColorProps'])
    })

    it('groupe sous le libellé traduit de la famille, id {kind}-{slug}', () => {
        expect(commands[0]!.group).toBe('T:Interfaces')
        expect(commands[0]!.id).toBe(globalSearchCommandId('interface', 'i-btn-props'))
    })

    it('retombe sur l\'icône de la famille quand l\'entrée n\'en a pas', () => {
        expect(commands[0]!.icon).toBe(GLOBAL_SEARCH_FAMILY_ICONS.interface)
    })
})

describe('globalSearchFamilyHref', () => {
    it.each(CATALOG_FAMILIES.map(f => [f.kind, f.route] as const))('%s -> %s/{slug}', (kind, route) => {
        expect(globalSearchFamilyHref(globalSearchCommandId(kind, 'a-b'))).toBe(`${route}/a-b`)
    })

    it('ignore les ids de pages statiques', () => {
        expect(globalSearchFamilyHref('page-installation')).toBeNull()
    })
})

describe('searchCommands', () => {
    const pool = buildFamilyCommands(family('interface'), entries, t)

    it('requête vide : les premières commandes, plafonnées', () => {
        expect(searchCommands(pool, '', 2).map(c => c.label)).toEqual(['IBtnProps', 'IChipProps'])
    })

    it('trouve par sous-chaîne, insensible à la casse', () => {
        expect(searchCommands(pool, 'CHIP', 10).map(c => c.label)).toEqual(['IChipProps'])
    })

    it('classe : préfixe du libellé, puis sous-chaîne, puis mot-clé, puis description', () => {
        const mixed = buildFamilyCommands(family('util'), [
            { slug: 'z', name: 'zzz', descriptionFallback: 'mentions chip here' },
            { slug: 'chip-kw', name: 'other', category: 'chip' },
            { slug: 'a', name: 'xchipx' },
            { slug: 'b', name: 'chipper' }
        ], t)

        expect(searchCommands(mixed, 'chip', 10).map(c => c.label)).toEqual(['chipper', 'xchipx', 'other', 'zzz'])
    })

    it('plafonne le résultat', () => {
        const many = buildFamilyCommands(family('const'), Array.from({ length: 500 }, (_, i) => ({ slug: `c-${i}`, name: `C_${i}` })), t)

        expect(searchCommands(many, 'c', 50)).toHaveLength(50)
    })

    it('ne retient rien quand rien ne correspond', () => {
        expect(searchCommands(pool, 'qqq', 10)).toEqual([])
    })
})
