/*
 * OrigamKbd — la table de presets LIVREE, et l'invariant de surface.
 *
 * `variant-preset-resolver.spec.ts` couvre le MECANISME sur un composant
 * synthetique. Il ne touche aucune table reelle : vider `VARIANT_PRESETS`
 * le laisserait entierement vert. Ce fichier epingle l'autre moitie — que
 * le DS livre bien la table de Kbd, et que le composant pose ses
 * declarations de surface sur le BON element.
 *
 * ⛔ AUCUNE ASSERTION SUR `getComputedStyle` ICI. Sous jsdom il ne resout
 * JAMAIS un `var()` et rend un `16px` fabrique (CLAUDE.md #398) ; or toute
 * cette surface est pilotee par des tokens. On lit donc l'ATTRIBUT `style`
 * et les classes — les deux outils que le CLAUDE.md declare fiables. Le
 * verdict de rendu, lui, est dans `audit:kbd-preset` et `e2e/kbd.spec.ts`,
 * en vrai navigateur.
 */
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { installThemePropsResolver } from '@origam/composables/Commons/theme-props-resolver.composable'
import { KBD_VARIANT_PRESETS, VARIANT_PRESETS, VARIANT_PROP_KEY } from '@origam/consts'
import OrigamKbd from '@origam/components/Kbd/OrigamKbd.vue'

const KBD_NAME = 'origam-kbd'

function mountKbd (props: Record<string, unknown>) {
    return mount(OrigamKbd, {
        props,
        global: {
            plugins: [{
                install (app) {
                    installThemePropsResolver(app, new Map(), VARIANT_PRESETS)
                }
            }]
        }
    })
}

describe('KBD_VARIANT_PRESETS — la table que le DS livre', () => {
    it('est enregistree sous son nom kebab dans VARIANT_PRESETS', () => {
        // Le lot 1 livrait un registre VIDE. Cette assertion est ce qui
        // empeche un retour silencieux a cet etat.
        expect(VARIANT_PRESETS[KBD_NAME]).toBe(KBD_VARIANT_PRESETS)
        expect(Object.keys(VARIANT_PRESETS[KBD_NAME])).toEqual(['outlined', 'filled', 'tonal'])
    })

    it('ne pose JAMAIS la cle `variant` — c\'est la garde anti-recursion', () => {
        for (const [variant, preset] of Object.entries(KBD_VARIANT_PRESETS)) {
            expect(Object.keys(preset), variant).not.toContain(VARIANT_PROP_KEY)
        }
    })

    it('donne a chaque variant un fond ET une ombre', () => {
        for (const [variant, preset] of Object.entries(KBD_VARIANT_PRESETS)) {
            expect(preset, variant).toHaveProperty('bgColor')
            expect(preset, variant).toHaveProperty('elevation')
        }
    })

    it('porte une chaine var() AVEC REPLI, jamais un echelon semantique', () => {
        // Deux exigences en une. La fidelite : un preset doit porter la meme
        // chaine que la regle portait, sinon le canal
        // `--origam-kbd--{variant}---*` d'un theme de marque est jete. Et le
        // garde `ts-token-refs` : un `var()` construit en TS sans repli est la
        // forme a eviter.
        for (const [variant, preset] of Object.entries(KBD_VARIANT_PRESETS)) {
            const bg = String((preset as Record<string, unknown>).bgColor)
            expect(bg, variant).toMatch(/^var\(--origam-kbd/)
            expect(bg, variant).toMatch(/^var\([^,]+,.+\)$/)
        }
    })

    it('ne pose aucune couleur de bordure sur outlined ni filled', () => {
        // Leurs regles en posaient une, identique au defaut de `key-surface`.
        // L'inscrire ici emettrait une declaration INLINE, donc confisquerait
        // `--origam-kbd---border-color` a tout theme. Mesure : zero ecart de
        // `border-top-color` sur les 16 configurations.
        expect(KBD_VARIANT_PRESETS.outlined).not.toHaveProperty('borderColor')
        expect(KBD_VARIANT_PRESETS.filled).not.toHaveProperty('borderColor')
        expect(KBD_VARIANT_PRESETS.tonal.borderColor).toBe('transparent')
    })
})

describe('OrigamKbd — la surface peinte est la racine OU les __key, jamais les deux', () => {
    it('en forme SIMPLE, la racine porte le fond du preset', () => {
        const wrapper = mountKbd({ variant: 'tonal', text: 'K' })
        const style = wrapper.attributes('style') ?? ''

        expect(style).toContain('--origam-kbd__tonal---background-color')
        expect(wrapper.find('.origam-kbd__key').exists()).toBe(false)
    })

    it('en forme COMBINAISON, chaque __key porte la surface et la racine NON', () => {
        const wrapper = mountKbd({ variant: 'tonal', combination: ['Ctrl', 'S'] })

        const rootStyle = wrapper.attributes('style') ?? ''
        const keys = wrapper.findAll('.origam-kbd__key')

        expect(keys).toHaveLength(2)

        // ⛔ L'INVARIANT DU LOT. `&--combination` neutralise l'enveloppe
        // depuis une regle scopee ; une declaration inline la battrait et
        // ferait peindre un cadre derriere des touches deja peintes.
        expect(rootStyle).not.toContain('--origam-kbd__tonal---background-color')

        for (const key of keys) {
            expect(key.attributes('style') ?? '').toContain('--origam-kbd__tonal---background-color')
        }
    })

    it('un bg-color du site d\'appel remplace le fond du preset sur les touches', () => {
        const wrapper = mountKbd({ variant: 'tonal', combination: ['Ctrl', 'S'], bgColor: '#ff0080' })
        const keyStyle = wrapper.findAll('.origam-kbd__key')[0].attributes('style') ?? ''

        // ⚠️ `rgb(255, 0, 128)`, pas `#ff0080` : la liaison `:style` de Vue
        // passe par le CSSOM, qui NORMALISE la couleur. Asserter sur la forme
        // hexadecimale ecrite par l'appelant echoue sur du code correct — la
        // premiere version de ce test l'a fait.
        expect(keyStyle).toContain('rgb(255, 0, 128)')
        expect(keyStyle).not.toContain('--origam-kbd__tonal---background-color')
    })

    it('tonal emet exactement les tokens que la mesure annonce', () => {
        // Corrobore au niveau unitaire les deux substitutions que la table
        // documente : `border: 'none'` -> le token de largeur 0, et
        // `elevation: 'none'` -> `--origam-shadow---none`, que
        // `primitive.css` declare `0px 0px 0px 0px rgba(0,0,0,0)` et NON le
        // mot-cle — c'est l'unique ecart de valeur calculee du lot.
        const wrapper = mountKbd({ variant: 'tonal', text: 'K' })
        const style = wrapper.attributes('style') ?? ''

        expect(style).toContain('border-width: var(--origam-border__width---0)')
        expect(style).toContain('box-shadow: var(--origam-shadow---none)')
        expect(style).toContain('border-color: transparent')
    })

    it('emet la classe de variant, que le DS ne style plus', () => {
        const wrapper = mountKbd({ variant: 'filled', text: 'K' })

        expect(wrapper.classes()).toContain('origam-kbd--variant-filled')
    })
})
