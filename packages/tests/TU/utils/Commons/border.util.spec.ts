// TU — border.util.ts

import { describe, expect, it } from 'vitest'
import { BORDER_REGEX } from '@origam/consts/Commons/border.const'
import { BORDER_STYLE } from '@origam/enums'
import {
    formatBorderPositionStylesVar,
    formatBorderStylesVar,
    parseBorderPositionValue,
    resolveBorderSideColor
} from '@origam/utils/Commons/border.util'

describe('formatBorderStylesVar', () => {
    // ── 1 value: shorthand ────────────────────────────────────────────────────
    it('emits a single shorthand border-{type} for 1 value', () => {
        const result = formatBorderStylesVar(['2px'], 'width')
        expect(result).toEqual(['border-width: 2px'])
    })

    it('works with type=color', () => {
        const result = formatBorderStylesVar(['red'], 'color')
        expect(result).toEqual(['border-color: red'])
    })

    it('works with type=style', () => {
        const result = formatBorderStylesVar(['dashed'], 'style')
        expect(result).toEqual(['border-style: dashed'])
    })

    // ── 2 values: block + inline ──────────────────────────────────────────────
    it('emits block + inline declarations for 2 values', () => {
        const result = formatBorderStylesVar(['1px', '3px'], 'width')
        expect(result).toEqual([
            'border-block-width: 1px',
            'border-inline-width: 3px',
        ])
    })

    it('2-value: first value maps to block, second to inline', () => {
        const [block, inline] = formatBorderStylesVar(['solid', 'dashed'], 'style')
        expect(block).toContain('block')
        expect(inline).toContain('inline')
        expect(block).toContain('solid')
        expect(inline).toContain('dashed')
    })

    // ── 4 values: per-side logical properties ─────────────────────────────────
    it('emits 4 logical-property declarations for 4 values', () => {
        const result = formatBorderStylesVar(['1px', '2px', '3px', '4px'], 'width')
        expect(result).toHaveLength(4)
        expect(result).toContain('border-block-start-width: 1px')
        expect(result).toContain('border-inline-start-width: 2px')
        expect(result).toContain('border-block-end-width: 3px')
        expect(result).toContain('border-inline-end-width: 4px')
    })

    it('4-value: order is block-start, inline-start, block-end, inline-end', () => {
        const result = formatBorderStylesVar(['top', 'right', 'bottom', 'left'], 'color')
        expect(result[0]).toContain('block-start')
        expect(result[0]).toContain('top')
        expect(result[1]).toContain('block-end')
        expect(result[1]).toContain('bottom')
        expect(result[2]).toContain('inline-start')
        expect(result[2]).toContain('right')
        expect(result[3]).toContain('inline-end')
        expect(result[3]).toContain('left')
    })

    // ── edge cases ────────────────────────────────────────────────────────────
    it('returns empty array for 0 values', () => {
        expect(formatBorderStylesVar([], 'width')).toEqual([])
    })

    it('returns empty array for unsupported length (3 values)', () => {
        expect(formatBorderStylesVar(['1px', '2px', '3px'], 'width')).toEqual([])
    })

    it('returns empty array for unsupported length (5 values)', () => {
        expect(formatBorderStylesVar(['1px', '2px', '3px', '4px', '5px'], 'width')).toEqual([])
    })

    it('handles CSS custom-property values without modification', () => {
        const result = formatBorderStylesVar(['var(--my-border-width)'], 'width')
        expect(result[0]).toContain('var(--my-border-width)')
    })
})

// ── parseBorderPositionValue (issue #215) ─────────────────────────────────
describe('parseBorderPositionValue', () => {
    it('parses a full "width style color" string into its three facets', () => {
        expect(parseBorderPositionValue('2px dashed red')).toEqual({
            width: '2px',
            style: 'dashed',
            color: 'red',
        })
    })

    it('defaults style to "solid" when omitted', () => {
        expect(parseBorderPositionValue('2px')).toEqual({
            width: '2px',
            style: 'solid',
            color: 'currentColor',
        })
    })

    it('defaults color to "currentColor" when omitted', () => {
        expect(parseBorderPositionValue('2px dashed')).toEqual({
            width: '2px',
            style: 'dashed',
            color: 'currentColor',
        })
    })

    it('accepts a var(--...) custom-property color untouched', () => {
        const result = parseBorderPositionValue('2px solid var(--origam-color__action--primary---bg)')
        expect(result?.color).toBe('var(--origam-color__action--primary---bg)')
    })

    it('returns null for an unparsable / empty string', () => {
        expect(parseBorderPositionValue('')).toBeNull()
        expect(parseBorderPositionValue('not-a-border-value-!!!')).toBeNull()
    })
})

/*********************************************************
 * BORDER_REGEX — table de verite du groupe `width`
 *
 * @description
 * Le groupe `width` accepte un `var()` DEPUIS ce lot, et seulement quand un
 * mot-cle de style le suit. Cette table pinne les deux moities du contrat :
 * les formes que le lookahead debloque, et les CONTROLES NEGATIFS qu'il doit
 * laisser intacts.
 *
 * @description
 * ⛔ LES CONTROLES NEGATIFS SONT LA PARTIE QUI COMPTE, et ce n'est pas une
 * precaution de principe. Mesure a l'ecriture : une alternative `var()` NUE
 * dans `width` (sans lookahead) ne diverge sur AUCUNE des valeurs `border*`
 * reellement presentes dans le depot — 0 divergence sur 81 valeurs
 * distinctes — parce qu'aucun fichier ne passe aujourd'hui une couleur
 * `var()` SEULE a une prop de bordure. Le corpus reel n'aurait donc pas
 * attrape la regression ; `var(--c)` ci-dessous est ce qui l'attrape.
 ********************************************************/
describe('BORDER_REGEX — width accepts var() only before a style keyword', () => {
    const shape = (value: string) => {
        const g = BORDER_REGEX.exec(value)?.groups

        return g ? { width: g.width, style: g.style.trim(), color: g.color } : null
    }

    it.each([
        ['var(--w) solid var(--c)', 'var(--w)', 'solid', 'var(--c)'],
        ['var(--w) solid', 'var(--w)', 'solid', ''],
        ['var(--w) dashed var(--c)', 'var(--w)', 'dashed', 'var(--c)'],
    ])('parses %j as width=%j style=%j color=%j', (value, width, style, color) => {
        expect(shape(value)).toEqual({ width, style, color })
    })

    // ── CONTROLES NEGATIFS — un var() SEUL reste une couleur ──────────────
    it.each([
        ['var(--c)', '', '', 'var(--c)'],
        ['4px solid var(--c)', '4px', 'solid', 'var(--c)'],
        ['red', '', '', 'red'],
        ['solid', '', 'solid', ''],
        ['2px', '2px', '', ''],
    ])('NEG %j stays width=%j style=%j color=%j', (value, width, style, color) => {
        expect(shape(value)).toEqual({ width, style, color })
    })

    it('a lone var() colour never lands in the width group', () => {
        expect(shape('var(--origam-color__action--primary---bg)')).toEqual({
            width: '',
            style: '',
            color: 'var(--origam-color__action--primary---bg)',
        })
    })

    /*********************************************************
     * Les deux chaines reelles que ce lot existe pour debloquer
     *
     * @description
     * Portees aujourd'hui par la SCSS de variant de `OrigamBlockquote`
     * (`--variant-default` / `--variant-elegant`, et `--variant-pull` pour
     * la seconde). Avant ce lot elles tombaient ENTIEREMENT dans le groupe
     * `color`, donc `useBorder` emettait un `border-*-color` invalide que le
     * navigateur jetait : bord absent, sans le moindre diagnostic.
     ********************************************************/
    it.each([
        'var(--origam-blockquote__accent---width, 4px) solid var(--origam-blockquote---resolved-accent-color)',
        'var(--origam-blockquote__pull---rule-width, 2px) solid var(--origam-blockquote---resolved-accent-color)',
    ])('routes a tokenised width to width, not color: %j', (value) => {
        const parsed = parseBorderPositionValue(value)

        expect(parsed?.width).toMatch(/^var\(--origam-blockquote/)
        expect(parsed?.style).toBe('solid')
        expect(parsed?.color).toBe('var(--origam-blockquote---resolved-accent-color)')
        expect(formatBorderPositionStylesVar('left', parsed!)).toEqual([
            `border-left-width: ${parsed!.width}`,
            'border-left-style: solid',
            'border-left-color: var(--origam-blockquote---resolved-accent-color)',
        ])
    })

    it('keeps the documented nested-fallback limitation (var() with an inner paren)', () => {
        // `[^)]+` stops at the first `)`, so the whole value is rejected. Already
        // true before this lot; pinned so a future widening is a deliberate act.
        expect(shape('1px solid var(--origam-color__border---subtle, rgba(0, 0, 0, 0.12))')).toBeNull()
    })

    /*********************************************************
     * ⛔ LA FRONTIERE ENTRE LES DEUX CHEMINS — a lire avant d'ecrire un preset
     *
     * @description
     * `BORDER_REGEX` sert DEUX consommateurs qui ne traitent pas ses groupes
     * de la meme facon, et la difference decide quelle prop un preset doit
     * viser.
     * @description
     * • PAR COTE (`parseBorderPositionValue` -> `borderLeft` / `borderBlock`
     *   / …) prend `match.width` EN ENTIER. Une largeur `var()` contenant une
     *   espace (`var(--x, 4px)`) passe intacte.
     * @description
     * • GLOBAL (`useBorder` sur la prop `border`) fait
     *   `String(match[key]).split(' ')` pour distribuer 1/2/4 valeurs sur les
     *   axes. Une largeur `var()` avec une espace y est donc COUPEE EN DEUX
     *   et produit deux declarations invalides.
     * @description
     * Mesure : `var(--x, 4px) solid var(--c)` -> le chemin global scinde la
     * largeur en `['var(--x,', '4px)']`. Avant ce lot la MEME valeur tombait
     * entiere dans `color` et y etait scindee en QUATRE — donc aucun bord
     * dans les deux cas, ce n'est pas une regression visible, mais ce n'est
     * pas repare pour autant.
     * @description
     * Consequence pratique : un preset de variant qui porte une largeur
     * tokenisee doit viser une prop PAR COTE ou D'AXE, jamais la prop
     * globale `border`. Les valeurs de Blockquote contiennent `, 4px`.
     ********************************************************/
    it('per-side path keeps a space-bearing var() width intact', () => {
        const parsed = parseBorderPositionValue('var(--origam-blockquote__accent---width, 4px) solid var(--c)')

        expect(parsed?.width).toBe('var(--origam-blockquote__accent---width, 4px)')
    })

    it('global-shorthand path still splits a space-bearing var() width (documented limit)', () => {
        const width = BORDER_REGEX.exec('var(--origam-blockquote__accent---width, 4px) solid var(--c)')?.groups?.width

        // `useBorder`'s global path splits on ' ' to distribute across axes,
        // so this value yields 2 fragments rather than 1 usable width.
        expect(String(width).trim().split(' ')).toHaveLength(2)
    })

    it('a space-FREE var() width survives both paths', () => {
        expect(parseBorderPositionValue('var(--w) solid var(--c)')?.width).toBe('var(--w)')
        expect(String(BORDER_REGEX.exec('var(--w) solid var(--c)')?.groups?.width).trim().split(' ')).toHaveLength(1)
    })

    it('style keywords come from BORDER_STYLE, so the two copies cannot drift', () => {
        for (const keyword of Object.values(BORDER_STYLE)) {
            expect(shape(`var(--w) ${keyword} var(--c)`)).toEqual({
                width: 'var(--w)',
                style: keyword,
                color: 'var(--c)',
            })
        }
    })
})

// ── formatBorderPositionStylesVar (issue #215) ────────────────────────────
describe('formatBorderPositionStylesVar', () => {
    it('emits physical border-{position}-{type} declarations for width/style/color', () => {
        const result = formatBorderPositionStylesVar('top', { width: '2px', style: 'dashed', color: 'red' })
        expect(result).toEqual([
            'border-top-width: 2px',
            'border-top-style: dashed',
            'border-top-color: red',
        ])
    })

    it('honours the requested physical position (not a logical property)', () => {
        const result = formatBorderPositionStylesVar('left', { width: '1px', style: 'solid', color: 'blue' })
        expect(result).toContain('border-left-width: 1px')
        expect(result.some(d => d.includes('inline'))).toBe(false)
    })

    it('omits a facet when absent', () => {
        const result = formatBorderPositionStylesVar('right', { width: '2px' })
        expect(result).toEqual(['border-right-width: 2px'])
    })

    it('returns an empty array when no facet is provided', () => {
        expect(formatBorderPositionStylesVar('bottom', {})).toEqual([])
    })
})

// ── resolveBorderSideColor (issue #215) ───────────────────────────────────
describe('resolveBorderSideColor', () => {
    it('resolves a semantic intent to its foreground token', () => {
        const result = resolveBorderSideColor('primary')
        expect(result).toContain('var(--origam-color')
    })

    it('passes through a raw CSS color untouched', () => {
        expect(resolveBorderSideColor('#ff0000')).toBe('#ff0000')
        expect(resolveBorderSideColor('rgb(1, 2, 3)')).toBe('rgb(1, 2, 3)')
    })

    it('returns null for a gradient value (unsupported on border-color)', () => {
        expect(resolveBorderSideColor('linear-gradient(red, blue)')).toBeNull()
    })

    it('returns null for a falsy / empty value', () => {
        expect(resolveBorderSideColor(undefined)).toBeNull()
        expect(resolveBorderSideColor('')).toBeNull()
        expect(resolveBorderSideColor(false as unknown as string)).toBeNull()
    })
})
