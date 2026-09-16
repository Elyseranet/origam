/*********************************************************
 * #620 — OrigamDialogConfirmation jetait `class` ET `style`
 *
 * MECANISME. `ICommonsComponentProps` declare `class` et `style`. DECLARER
 * un attribut comme prop le RETIRE de `$attrs` : le fallthrough automatique
 * de Vue ne s'applique plus, et le composant doit re-binder la valeur A LA
 * MAIN. 189 composants du catalogue le font ; celui-ci ne le faisait pas.
 *
 * Pire que l'oubli passif : le composant EXCLUAIT explicitement les deux
 * canaux de ce qu'il transmettait a son `<origam-dialog>` interne —
 * `filterProps(props, ['class', 'style', 'id', 'modelValue'])`. Un
 * consommateur qui ecrivait `class="ma-modale"` ne peignait rien, et rien ne
 * l'avertissait.
 *
 * ⛔ CE QUE MESURE CE SPEC, ET POURQUOI IL EST ECRIT COMME CA.
 *
 * 1. TEMOIN POSITIF — `<origam-dialog>` nu subit la meme sonde. Il re-binde
 *    correctement (`props.class` dans `dialogClasses`, OrigamDialog.vue:395),
 *    donc il doit rester VERT meme quand les assertions sur Confirmation sont
 *    rouges. Sans ce temoin, « la classe est absente du DOM » et « ma sonde
 *    ne regarde pas le bon DOM » sont indiscernables — c'est l'erreur qui a
 *    coute le plus cher a cette campagne.
 *
 * 2. LECTURE SYNCHRONE, VOLONTAIREMENT. Le dialogue est teleporte, donc on
 *    lit `document.body.innerHTML` plutot que la racine du wrapper. La
 *    lecture se fait AVANT tout `nextTick`, et c'est le coeur du choix de
 *    correctif :
 *
 *      - Correctif envisage A — retirer 'class'/'style' de la liste
 *        d'exclusion de `filterProps`. MESURE : vert APRES un tick, rouge en
 *        synchrone. C'est le delta d'un tick documente en tete de
 *        `props.composable.ts` : `dialogProps` passe par une TEMPLATE REF,
 *        `undefined` pendant le premier rendu, donc le rendu 1 ne binde rien.
 *      - Correctif retenu B — binder `:class` / `:style` explicitement sur
 *        `<origam-dialog>` depuis deux `computed`. MESURE : vert des le
 *        PREMIER rendu, sans dependre de la ref.
 *
 *    Les deux ont ete appliques et mesures ; B est retenu parce qu'il ne
 *    depend d'aucun ordre de resolution, et parce que le fichier binde DEJA
 *    `:id="id"` explicitement pour exactement la meme raison. L'assertion
 *    synchrone est ce qui distingue les deux : rendue asynchrone, elle
 *    validerait aussi le correctif A et ne protegerait plus ce choix.
 ********************************************************/

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamDialog from '@origam/components/Dialog/OrigamDialog.vue'
import OrigamDialogConfirmation from '@origam/components/Dialog/OrigamDialogConfirmation.vue'
import { createOrigam } from '@origam/origam'

const CASES = [
    [ 'OrigamDialog (TEMOIN POSITIF)', OrigamDialog ],
    [ 'OrigamDialogConfirmation', OrigamDialogConfirmation ]
] as const

const renderWith = (component: unknown, extra: Record<string, unknown>) => {
    const wrapper = mount(component as never, {
        props: { modelValue: true, title: 'Sur ?', ...extra } as never,
        attachTo: document.body,
        global: { plugins: [ createOrigam() ] }
    })
    // Lecture SYNCHRONE — aucun `nextTick`. Voir l'en-tete : c'est ce qui
    // separe le correctif retenu de celui qui ne peint qu'au second rendu.
    const html = document.body.innerHTML
    wrapper.unmount()
    return html
}

describe('Dialog — `class` / `style` declarees en prop doivent etre re-bindees (#620)', () => {
    for (const [ name, component ] of CASES) {
        it(`${name} : la classe du consommateur atteint le DOM rendu`, () => {
            expect(renderWith(component, { class: 'sonde-consommateur' }))
                .toContain('sonde-consommateur')
        })

        it(`${name} : le style du consommateur atteint le DOM rendu`, () => {
            // Assertion sur le MARKUP brut, jamais `getComputedStyle` : sous
            // jsdom celui-ci ne resout pas `var()` et fabrique un `16px` qui
            // ressemble a une vraie mesure.
            expect(renderWith(component, { style: 'outline: 2px solid red' }))
                .toContain('outline')
        })
    }
})
