// `<OrigamParallaxElement type="custom">` — la trappe d'extension (#432).
//
// AVANT : `PARALLAX_ELEMENT_TYPE.CUSTOM` existait dans l'enum, la doc
// l'annonçait (« Reserved hatch for consumer-supplied transforms »), et le
// `switch` de `useParallaxTransform` ne le couvrait pas — `transformStyles`
// rendait `undefined`. L'élément restait figé, sans erreur ni avertissement.
// Ce n'était pas un cas manquant dans un switch : il n'existait AUCUNE
// surface d'API par laquelle fournir une transform.
//
// APRÈS (arbitrage du mainteneur, option CSS-first) : le composant publie
// deux variables CSS et le consommateur écrit sa transform en CSS.
//
// LE CONTRAT, tel que teste ci-dessous :
//
//   nom     `--origam-parallax__element---x` / `---y`, grammaire BEM-enfant
//           alignee sur `--origam-parallax__layer---offset-x` que le runtime
//           publie deja.
//   valeur  le montant de mouvement PAR AXE, APRES application de `strength`
//           (et de `axis` / `min` / `max` / `cycle` en amont) — exactement ce
//           que les 7 types integres passent a translate3d / rotate / scale.
//           Publier la valeur BRUTE rendrait toutes les autres props mortes
//           en mode custom : c'est le point que ces tests verrouillent.
//   unite   AUCUNE, nombre nu. Le meme nombre vaut des px pour `translate`,
//           des deg pour `rotate`, un ratio pour `scale` : imposer `px`
//           fermerait la trappe aux deux autres. Le consommateur multiplie.
//   pose    uniquement quand `type === 'custom'` — chemin chaud intact pour
//           les 7 autres types.
//   defaut  aucun `transform` n'est ecrit, soit le comportement EXACT
//           d'avant : la trappe est non cassante.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'

import OrigamParallax from '@origam/components/Parallax/OrigamParallax.vue'
import OrigamParallaxElement from '@origam/components/Parallax/OrigamParallaxElement.vue'
import { createOrigam } from '@origam/origam'

import { PARALLAX_ELEMENT_TYPE } from '@origam/enums'
import {
    PARALLAX_ELEMENT_VAR_X,
    PARALLAX_ELEMENT_VAR_Y
} from '@origam/consts/Parallax/parallax-element.const'

function mountElement (elementProps: Record<string, unknown>) {
    const Host = defineComponent({
        setup () {
            return () => h(OrigamParallax, null, {
                default: () => h(OrigamParallaxElement, elementProps as never, {
                    default: () => h('span', 'content')
                })
            })
        }
    })

    return mount(Host, { global: { plugins: [createOrigam()] }, attachTo: document.body })
}

function styleAttr (wrapper: ReturnType<typeof mountElement>) {
    return wrapper.find('.origam-parallax-element').attributes('style') ?? ''
}

describe('OrigamParallaxElement type="custom" — les variables du contrat', () => {
    it('publie --origam-parallax__element---x et ---y', () => {
        const wrapper = mountElement({ type: PARALLAX_ELEMENT_TYPE.CUSTOM, strength: 10 })
        const style = styleAttr(wrapper)

        expect(style).toContain(PARALLAX_ELEMENT_VAR_X)
        expect(style).toContain(PARALLAX_ELEMENT_VAR_Y)
    })

    it('les noms sont exactement ceux du contrat (grammaire BEM-enfant du DS)', () => {
        // VALEUR ABSOLUE : un renommage silencieux casserait toutes les
        // feuilles de style des consommateurs sans qu'aucun test ne bouge.
        expect(PARALLAX_ELEMENT_VAR_X).toBe('--origam-parallax__element---x')
        expect(PARALLAX_ELEMENT_VAR_Y).toBe('--origam-parallax__element---y')
    })

    it('la valeur est un nombre NU — aucune unité, sinon rotate et scale deviennent inatteignables', () => {
        const wrapper = mountElement({ type: PARALLAX_ELEMENT_TYPE.CUSTOM, strength: 10 })
        const style = styleAttr(wrapper)

        const match = new RegExp(`${ PARALLAX_ELEMENT_VAR_X }:\\s*([^;]+)`).exec(style)

        expect(match).not.toBeNull()

        const raw = match![1].trim()

        expect(raw).toMatch(/^-?\d+(\.\d+)?$/)
        expect(raw).not.toMatch(/px|deg|rem|%/)
    })

    it('n\'écrit AUCUN transform : la trappe est non cassante', () => {
        const wrapper = mountElement({ type: PARALLAX_ELEMENT_TYPE.CUSTOM, strength: 10 })

        // Comportement identique a celui d'avant le correctif — le
        // consommateur qui n'ecrit aucune regle CSS ne voit rien changer.
        expect(styleAttr(wrapper)).not.toMatch(/(^|[;\s])transform:/)
    })

    it('ne publie PAS les variables pour les 7 autres types (chemin chaud intact)', () => {
        for (const type of [
            PARALLAX_ELEMENT_TYPE.TRANSLATE,
            PARALLAX_ELEMENT_TYPE.ROTATE,
            PARALLAX_ELEMENT_TYPE.DEPTH,
            PARALLAX_ELEMENT_TYPE.DEPTH_INV,
            PARALLAX_ELEMENT_TYPE.SCALE,
            PARALLAX_ELEMENT_TYPE.SCALE_X,
            PARALLAX_ELEMENT_TYPE.SCALE_Y
        ]) {
            const wrapper = mountElement({ type, strength: 10 })
            const style = styleAttr(wrapper)

            expect(style, `type=${ type }`).not.toContain(PARALLAX_ELEMENT_VAR_X)
            // Contrôle positif dans la même boucle : ces types-là DOIVENT,
            // eux, écrire un transform. Sans lui, ce test resterait vert sur
            // un composant qui ne rend plus rien du tout.
            expect(style, `type=${ type }`).toMatch(/transform:/)
        }
    })
})

describe('OrigamParallaxElement type="custom" — strength reste vivant', () => {
    it('la valeur publiée SUIT strength (sinon toutes les props seraient mortes en custom)', () => {
        const read = (s: string) => {
            const m = new RegExp(`${ PARALLAX_ELEMENT_VAR_X }:\\s*([^;]+)`).exec(s)

            return Number(m![1].trim())
        }

        const weak = read(styleAttr(mountElement({ type: PARALLAX_ELEMENT_TYPE.CUSTOM, strength: 0 })))
        const strong = read(styleAttr(mountElement({ type: PARALLAX_ELEMENT_TYPE.CUSTOM, strength: 80 })))

        // VALEURS ABSOLUES. Au repos le mouvement d'entree vaut 0, et
        // `toMovement(0) = (strength * 0) / 10 + 1 = 1` quelle que soit la
        // force : c'est le terme constant PARALLAX_ELEMENT_MOVEMENT_BASE.
        // Assertion exacte plutôt que « les deux diffèrent » — ici ils NE
        // diffèrent pas, et un test écrit en « ça change » aurait échoué en
        // accusant à tort le câblage de strength.
        expect(weak).toBe(1)
        expect(strong).toBe(1)
    })
})
