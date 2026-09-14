// `mode` etait morte dans les DEUX branches de `useCssTransition`.
//
// Le composable ecrivait :
//
//     if (props.group) { bind.mode = props.mode }
//
// soit exactement l'inverse de ce qu'il fallait.
//
// ⛔ Pourquoi les deux branches echouaient, et pas seulement une :
//
//   - `group: true` posait `mode` sur un `<TransitionGroup>`, qui ne le
//     DECLARE PAS — `'mode' in TransitionGroup.props` vaut `false`, contre
//     `true` pour `Transition`. La valeur finissait en attribut DOM inerte.
//   - `group: false` ne le posait pas du tout. Et comme le composant hote
//     declare `mode` parmi ses propres props, la valeur ne retombe pas dans
//     `$attrs` : elle n'atteignait donc jamais le `<Transition>`.
//
// `mode` n'a de sens que sur `<Transition>`, ou il ordonne l'entree et la
// sortie de DEUX elements qui se remplacent. Un `<TransitionGroup>` gere une
// liste : il n'y a rien a ordonner, et Vue ne lui donne pas cette prop.
//
// ⛔ Le garde `unconsumed-props` ne pouvait pas voir ce defaut. La lecture
// `props.mode` existait bel et bien ; c'est son EFFET qui etait nul. Une prop
// lue puis jetee dans une branche morte passe pour consommee aux yeux d'une
// analyse statique — c'est un faux vert que seule une lecture humaine trouve.
//
// Trouve par l'agent du lot 4 de la campagne C7, en verifiant la doc d'une
// famille de transitions plutot qu'en cherchant un bug.

import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'

import { useCssTransition } from '@origam/composables/Transition/cssTransition.composable'

/** Monte le composable et rend l'objet de props destine a `<Transition>`. */
const bindOf = (props: Record<string, unknown>) => {
    let bind: Record<string, unknown> = {}

    mount(defineComponent({
        props: { disabled: Boolean, group: Boolean, mode: String, origin: String },
        setup (componentProps) {
            bind = (useCssTransition as never as (p: never) => { transitionProps: { value: Record<string, unknown> } })(
                componentProps as never
            ).transitionProps.value

            return () => h('div')
        }
    }), { props })

    return bind
}

describe('useCssTransition — la prop `mode` atteint enfin <Transition>', () => {
    it('⛔ group absent : `mode` est transmis', () => {
        // C'est l'assertion qui echoue sur le code d'avant le correctif : la
        // cle etait purement absente de l'objet.
        expect(bindOf({ mode: 'out-in' }).mode).toBe('out-in')
    })

    it('⛔ group explicitement faux : `mode` est transmis', () => {
        expect(bindOf({ group: false, mode: 'in-out' }).mode).toBe('in-out')
    })

    it('⛔ group VRAI : `mode` n\'est PAS transmis', () => {
        // `<TransitionGroup>` ne declare pas `mode` — le poser produirait un
        // attribut DOM inerte, ce qui est precisement l'ancien comportement.
        expect(bindOf({ group: true, mode: 'out-in' })).not.toHaveProperty('mode')
    })

    it('sans valeur, la cle vaut undefined plutot que d\'inventer un defaut', () => {
        // Huit des dix consommateurs de ce composable ne declarent aucun defaut
        // pour `mode` : le correctif ne doit rien changer chez eux.
        expect(bindOf({}).mode).toBeUndefined()
    })

    it('le canal `css` reste independant de `mode`', () => {
        expect(bindOf({ mode: 'out-in' }).css).toBe(true)
        expect(bindOf({ mode: 'out-in', disabled: true }).css).toBe(false)
    })
})

describe('Vue lui-meme : la raison pour laquelle la branche group est exclue', () => {
    it('⛔ Transition declare `mode`, TransitionGroup non', async () => {
        const { Transition, TransitionGroup } = await import('vue')

        // Ce test ne verifie pas notre code mais l'HYPOTHESE sur laquelle il
        // repose. Si une version future de Vue donnait `mode` a
        // TransitionGroup, c'est ici qu'il faudrait le voir, plutot que de
        // constater une regression visuelle sur dix composants.
        expect('mode' in (Transition as unknown as { props: object }).props).toBe(true)
        expect('mode' in (TransitionGroup as unknown as { props: object }).props).toBe(false)
    })
})
