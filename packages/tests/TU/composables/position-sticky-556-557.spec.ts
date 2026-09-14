// #556 et #557 — deux defauts trouves en DOCUMENTANT les composables (#545),
// pas en les testant. Les deux ont la meme forme : une valeur qui traverse le
// code sans jamais produire l'effet qu'elle annonce.
//
// ## #557 — usePosition n'appliquait pas `convertToUnit`
//
// Le composable interpolait `top` / `bottom` / `left` / `right` tels quels :
// `top="8"` produisait la declaration `top: 8`, sans unite, donc invalide —
// ignoree en silence par le navigateur.
//
// `useDimension`, son voisin immediat, fait passer ses SEPT props par
// `convertToUnit`. Deux composables cote a cote, deux contrats differents pour
// la meme forme de valeur, et rien qui le signale au consommateur.
//
// ## #556 — useSticky lisait un nom sous une autre grammaire
//
// `--v-body-scroll-y` : prefixe `--v-`, la grammaire d'un AUTRE design
// system, vestige de portage. Le nom n'existe nulle part dans ce depot.
// `getPropertyValue` rendait la chaine vide, `parseFloat('')` un `NaN`, et le
// `|| 0` le convertissait en zero.
//
// ⛔ C'est le `|| 0` qui rendait le defaut invisible : sans lui un `NaN` se
// serait propage dans le calcul de position et la panne aurait saute aux
// yeux. La garde defensive a transforme une erreur bruyante en comportement
// silencieusement faux.
//
// Le nom correct — `--origam-body-scroll-y` — est bien pose par
// `utils/Commons/scroll.util.ts`. Meme motif que les 86 tokens morts de
// `list` : un nom ecrit sous deux grammaires qui ne se rencontrent jamais.

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'

import { usePosition } from '@origam/composables/Commons/position.composable'

/** Monte le composable et rend les declarations qu'il produit. */
const stylesFor = (props: Record<string, unknown>) => {
    let styles: Array<string> = []

    mount(defineComponent({
        props: { top: [ String, Number ], bottom: [ String, Number ], left: [ String, Number ], right: [ String, Number ], position: String },
        setup (componentProps) {
            styles = usePosition(componentProps as never).positionStyles.value

            return () => h('div')
        }
    }), { props })

    return styles
}

describe('#557 — usePosition applique convertToUnit', () => {
    it('⛔ une valeur NUMERIQUE recoit son unite', () => {
        // Avant le correctif : `top: 8` — declaration invalide, ignoree.
        expect(stylesFor({ top: 8 })).toContain('top: 8px')
    })

    it('une chaine numerique aussi', () => {
        expect(stylesFor({ left: '16' })).toContain('left: 16px')
    })

    it('une longueur CSS deja unitee passe intacte', () => {
        expect(stylesFor({ bottom: '2rem' })).toContain('bottom: 2rem')
    })

    it('un pourcentage passe intact', () => {
        expect(stylesFor({ right: '50%' })).toContain('right: 50%')
    })

    it('les quatre cotes sont traites, pas seulement le premier', () => {
        const styles = stylesFor({ top: 1, bottom: 2, left: 3, right: 4 })

        expect(styles).toEqual([ 'top: 1px', 'bottom: 2px', 'left: 3px', 'right: 4px' ])
    })

    it('un cote absent ne produit aucune declaration', () => {
        expect(stylesFor({ top: 8 })).toHaveLength(1)
    })
})

describe('#556 — le nom lu par useSticky existe bel et bien', () => {
    // `process.cwd()` vaut `packages/tests` sous vitest — chemin stable, la
    // ou `import.meta.url` n'est pas garanti etre une URL `file:`.
    const dsSource = (rel: string) => readFileSync(path.resolve(process.cwd(), '../ds/src', rel), 'utf8')

    it('⛔ scroll.util pose --origam-body-scroll-y, pas --v-body-scroll-y', () => {
        const source = dsSource('utils/Commons/scroll.util.ts')

        expect(source).toContain('--origam-body-scroll-y')
        expect(source).not.toContain('--v-body-scroll-y')
    })

    it('⛔ useSticky lit le MEME nom que celui qui est pose', () => {
        const source = dsSource('composables/Commons/sticky.composable.ts')

        // C'est l'assertion qui echoue sur le code d'avant #556. Elle est
        // volontairement statique : la valeur ne se mesure qu'avec un overlay
        // bloquant reellement le defilement, ce que jsdom ne produit pas —
        // et `getComputedStyle` n'y resout de toute facon jamais un `var()`.
        // Ce que ce test verrouille, c'est l'accord des deux noms.
        expect(source).toContain("getPropertyValue('--origam-body-scroll-y')")
        expect(source).not.toContain("getPropertyValue('--v-body-scroll-y')")
    })
})
