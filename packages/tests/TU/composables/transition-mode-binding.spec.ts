// #550 C7 — la liaison de `mode` des transitions etait INVERSEE.
//
// `useCssTransition` et `useWindowTransition` choisissent leur composant
// racine ainsi :
//
//     tag = props.group ? TransitionGroup : Transition
//
// ...puis liaient `mode` ainsi :
//
//     if (props.group) { bind.mode = props.mode }
//
// ⛔ `mode` n'est declare QUE sur `Transition` (enfant unique). Vue ne le
// declare PAS sur `TransitionGroup` — la premiere assertion de ce fichier le
// verifie directement sur les composants de Vue, pour que le jour ou cela
// changerait, ce soit ICI que ca casse et pas dans un rendu silencieux.
//
// La condition liait donc `mode` exactement sur le composant qui ne sait pas
// le lire, et jamais sur celui qui le sait : la prop etait morte pour les 12
// composants qui passent par ces deux hooks (8 via `useCssTransition`,
// 4 via `useWindowTransition`).
//
// La forme correcte etait deja livree, avec sa justification, dans
// `OrigamExpandX` / `OrigamExpandY` (`if (!props.group)`) — qui n'utilisent
// pas `transitionProps` mais construisent leur propre `rootProps`. C'est
// cette forme qui a ete reportee dans les deux composables.
//
// ⛔ `mode` doit etre ABSENT de l'objet sur le chemin `group`, pas mis a
// `undefined` : `:mode="undefined"` declenche quand meme l'avertissement
// « Extraneous non-props attributes » de Vue, la cle etant presente dans les
// props du vnode quelle que soit sa valeur. D'ou les assertions `'mode' in …`
// plutot que `toBeUndefined()`.
//
// Test de mutation effectue : en remettant `if (props.group)` dans
// `cssTransition.composable.ts`, les deux `it` correspondants passent au
// rouge (`expected undefined to be 'out-in'`, `expected true to be false`) et
// ceux de `useWindowTransition` restent verts — les deux hooks sont bien
// couverts independamment.

import { describe, expect, it } from 'vitest'
import { Transition, TransitionGroup } from 'vue'

import { useCssTransition } from '@origam/composables/Transition/cssTransition.composable'
import { useWindowTransition } from '@origam/composables/Transition/windowTransition.composable'

import type { ITransitionProps } from '@origam/interfaces'

describe('#550 C7 — liaison de `mode` sur les transitions', () => {

    it('Vue: `Transition` declare `mode`, `TransitionGroup` ne le declare pas', () => {
        expect(Object.keys((Transition as any).props)).toContain('mode')
        expect(Object.keys((TransitionGroup as any).props)).not.toContain('mode')
    })

    describe('useCssTransition', () => {

        it('group=false -> rend `Transition`, et `mode` EST lie', () => {
            const props: ITransitionProps = {mode: 'out-in', group: false}
            const {tag, transitionProps} = useCssTransition(props)

            expect(tag.value).toBe(Transition)
            expect(transitionProps.value.mode).toBe('out-in')
        })

        it('group=true -> rend `TransitionGroup`, et la cle `mode` est ABSENTE', () => {
            const props: ITransitionProps = {mode: 'out-in', group: true}
            const {tag, transitionProps} = useCssTransition(props)

            expect(tag.value).toBe(TransitionGroup)
            expect('mode' in transitionProps.value).toBe(false)
        })
    })

    describe('useWindowTransition', () => {

        it('group=false -> rend `Transition`, et `mode` EST lie', () => {
            const props: ITransitionProps = {mode: 'out-in', group: false}
            const {tag, transitionProps} = useWindowTransition(props)

            expect(tag.value).toBe(Transition)
            expect(transitionProps.value.mode).toBe('out-in')
        })

        it('group=true -> rend `TransitionGroup`, et la cle `mode` est ABSENTE', () => {
            const props: ITransitionProps = {mode: 'out-in', group: true}
            const {tag, transitionProps} = useWindowTransition(props)

            expect(tag.value).toBe(TransitionGroup)
            expect('mode' in transitionProps.value).toBe(false)
        })
    })
})
