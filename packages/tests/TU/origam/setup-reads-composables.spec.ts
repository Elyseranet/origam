/*********************************************************
 * #504 — le détecteur ADR-005 ne regardait AUCUN composable
 *
 * @description
 * CRITÈRE, en une phrase : dans une fonction `use*` exportée, un accès à une
 * propriété du paramètre `props` situé à profondeur de fonction 0 du corps
 * de cette fonction est évalué pendant le `setup()` de l'appelant — donc
 * AVANT que le résolveur ADR-005 n'écrive — et fige une valeur d'avant le
 * thème.
 *
 * @description
 * ⛔ POURQUOI ÇA COMPTE PLUS ICI QUE DANS UN COMPOSANT. Un composable est
 * partagé : `useLink` figeait `tag` dans une chaîne et `useVModel` amorçait
 * sa ref au setup, ce qui a cassé les props thématisées de 16 composants à
 * elles deux. `getRealComponents()` filtre sur `.vue` + préfixe `Origam`, si
 * bien qu'aucun fichier de `src/composables/` n'a jamais été analysé.
 *
 * @description
 * Les fixtures sont un catalogue JETABLE — des sources synthétiques, pas les
 * composables vivants, pour que le test ne change pas de sens quand le
 * catalogue bouge.
 ********************************************************/

import { describe, expect, it } from 'vitest'

import { analyseComposableSource } from '../../../ds/scripts/guards/lib/setup-reads.mjs'

const eagerProps = (src: string, fn = 'useProbe'): Array<string> => {
    const row = analyseComposableSource(src, 'probe.composable.ts').find(r => r.fn === fn)

    return (row?.eager ?? []).map((e: {prop: string}) => e.prop)
}

describe('#504 — À DÉTECTER : lecture évaluée pendant le setup de l appelant', () => {
    it('1. la valeur est capturée dans un local', () => {
        expect(eagerProps(`export function useProbe (props) { const t = props.tag; return t }`))
            .toEqual(['tag'])
    })

    it('2. la valeur est un ARGUMENT évalué à l appel', () => {
        expect(eagerProps(`export function useProbe (props) { return useVModel(props, 'x', props.x) }`))
            .toEqual(['x'])
    })

    it('3. un bloc ne crée pas de profondeur — if / for s exécutent au setup', () => {
        expect(eagerProps(`export function useProbe (props) { if (props.disabled) { doThing() } }`))
            .toEqual(['disabled'])
    })
})

describe('#504 — À NE PAS DÉTECTER : lecture différée au rendu', () => {
    it('1. computed(() => props.x)', () => {
        expect(eagerProps(`export function useProbe (props) { return computed(() => props.tag) }`))
            .toEqual([])
    })

    it('2. watch(() => props.x, cb) et un gestionnaire d évènement', () => {
        expect(eagerProps(`
            export function useProbe (props) {
                watch(() => props.tag, () => {})
                return { onClick: () => props.disabled }
            }
        `)).toEqual([])
    })

    it('3. toRef(props, \'x\') et le passage de props à un autre composable', () => {
        expect(eagerProps(`
            export function useProbe (props) {
                const t = toRef(props, 'tag')
                return useOther(props)
            }
        `)).toEqual([])
    })
})

describe('#504 — portée du scanner', () => {
    it('une const fléchée exportée est analysée comme une déclaration', () => {
        expect(eagerProps(`export const useProbe = (props) => { const t = props.tag }`))
            .toEqual(['tag'])
    })

    it('une fonction NON exportée est hors périmètre', () => {
        const rows = analyseComposableSource(
            `function useHidden (props) { const t = props.tag }`, 'probe.ts'
        )

        expect(rows).toHaveLength(0)
    })

    it('une fonction exportée SANS paramètre props est listée sans candidat', () => {
        const rows = analyseComposableSource(`export function useProbe (options) { return options.x }`, 'probe.ts')

        expect(rows).toHaveLength(1)
        expect(rows[0].param).toBeNull()
        expect(rows[0].eager).toEqual([])
    })
})
