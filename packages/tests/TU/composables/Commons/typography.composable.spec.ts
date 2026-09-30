// TU — typography.composable.ts

import { describe, expect, it } from 'vitest'
import { useTypography } from '@origam/composables/Commons/typography.composable'

/*********************************************************
 * useTypography — les deux canaux
 *
 * @description
 * Cinq props sont des CLES DE TOKEN, enveloppees en
 * `var(--origam-font__{groupe}---{valeur})`. La sixieme, `fontStyle`, est un
 * PASSTHROUGH rendu verbatim. Ces tests pinnent la frontiere : une prop de
 * token qui cesserait d'etre enveloppee, ou un passthrough qui se mettrait a
 * l'etre, sont les deux regressions possibles et chacune a son test.
 ********************************************************/
describe('useTypography — token channel', () => {
    it('wraps each token prop into its primitive var, namespaced by the prefix', () => {
        const { typographyStyles } = useTypography({
            fontFamily: 'serif',
            fontSize: 'xl',
            fontWeight: 'medium',
            lineHeight: 'loose',
            letterSpacing: 'wide'
        }, 'blockquote')

        expect(typographyStyles.value).toEqual({
            '--origam-blockquote---font-family': 'var(--origam-font__family---serif)',
            '--origam-blockquote---font-size': 'var(--origam-font__size---xl)',
            '--origam-blockquote---font-weight': 'var(--origam-font__weight---medium)',
            '--origam-blockquote---line-height': 'var(--origam-font__lineHeight---loose)',
            '--origam-blockquote---letter-spacing': 'var(--origam-font__letterSpacing---wide)'
        })
    })

    it('emits nothing at all when no prop is set', () => {
        expect(useTypography({}, 'blockquote').typographyStyles.value).toBeNull()
    })
})

describe('useTypography — fontStyle passthrough', () => {
    it('emits the keyword VERBATIM, never wrapped in a var()', () => {
        const { typographyStyles } = useTypography({ fontStyle: 'italic' }, 'blockquote')

        expect(typographyStyles.value).toEqual({
            '--origam-blockquote---font-style': 'italic'
        })
    })

    /*********************************************************
     * @description
     * ⛔ LE CONTROLE QUI COMPTE. Passee par le canal token, la valeur
     * sortirait en `var(--origam-font__style---italic)` — un nom que NULLE
     * feuille du depot ne declare (verifie : zero occurrence de
     * `font__style` dans `primitive.css`), donc une declaration invalide qui
     * ne peindrait rien. Ce test echoue si quelqu'un deplace `fontStyle`
     * dans `TYPOGRAPHY_TOKEN_MAP`.
     ********************************************************/
    it('never produces a --origam-font__style--- reference', () => {
        const { typographyStyles } = useTypography({ fontStyle: 'italic' }, 'blockquote')

        expect(JSON.stringify(typographyStyles.value)).not.toContain('font__style')
    })

    it.each(['italic', 'normal', 'oblique', 'oblique 10deg'])('passes %j through unchanged', (value) => {
        expect(useTypography({ fontStyle: value }, 'blockquote').typographyStyles.value).toEqual({
            '--origam-blockquote---font-style': value
        })
    })

    it('honours the varPrefix, including a BEM-child namespace', () => {
        expect(useTypography({ fontStyle: 'italic' }, 'bracket-competitor').typographyStyles.value).toEqual({
            '--origam-bracket-competitor---font-style': 'italic'
        })
    })

    it('composes with the token channel without either clobbering the other', () => {
        const { typographyStyles } = useTypography({ fontSize: 'xl', fontStyle: 'italic' }, 'blockquote')

        expect(typographyStyles.value).toEqual({
            '--origam-blockquote---font-size': 'var(--origam-font__size---xl)',
            '--origam-blockquote---font-style': 'italic'
        })
    })

    it('emits nothing for an empty or unset fontStyle', () => {
        expect(useTypography({ fontStyle: '' }, 'blockquote').typographyStyles.value).toBeNull()
        expect(useTypography({ fontStyle: undefined }, 'blockquote').typographyStyles.value).toBeNull()
    })
})
