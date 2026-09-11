/*********************************************************
 * #499 — le scanner ne doit pas confondre une CHAÎNE et un IDENTIFIANT
 *
 * @description
 * CRITÈRE, en une phrase : une prop n'est créditée comme consommée que par
 * une forme de lecture MODÉLISÉE — un accès `props.x` / `props['x']`, un
 * `toRef` ou une déstructuration depuis `props`, un identifiant dans une
 * expression de template ou dans le code (hors chaîne), un composable à qui
 * l'on passe `props` en entier, ou un NOM DE PROP passé en chaîne à un tel
 * composable — jamais parce que son nom apparaît quelque part entre
 * guillemets.
 *
 * @description
 * ⛔ LE SENS QUI COMPTE. Un garde qui ACCUSE à tort bloque une PR innocente ;
 * un garde qui CRÉDITE à tort excuse silencieusement de la vraie dette et
 * fait baisser son propre compteur sans que rien ne soit réparé. Le second
 * ne se voit dans aucune sortie — c'est pour ça qu'il a survécu.
 *
 * @description
 * MESURÉ sur le catalogue réel : 177 paires (composant, prop) sur 4820
 * créditées ne tenaient leur crédit que d'une chaîne. 169 sont de vraies
 * lectures via une forme qui n'était simplement pas modélisée ; 8 perdaient
 * tout crédit, 7 sont revenues par les canaux ajoutés ici, et la dernière —
 * `OrigamCode.class` — était bel et bien morte (vérifié au montage : la
 * classe du consommateur n'atteignait pas le `<figure>` rendu).
 *
 * @description
 * Les fixtures ci-dessous sont un catalogue JETABLE : des sources
 * synthétiques, jamais les composants vivants, pour que le test ne change
 * pas de sens quand le catalogue change.
 ********************************************************/

import { describe, expect, it } from 'vitest'

import {
    blankStringBodies,
    scanPropNameArgs,
    scanPropReads,
    scriptIdentifiers
} from '../../../ds/scripts/audit-unconsumed-props.mjs'

const ids = (src: string) => scriptIdentifiers(src).ids
const reads = (src: string) => scanPropReads(src, src).direct

describe('#499 — À DÉTECTER : le nom n existe que dans une chaîne', () => {
    it('1. un nom de classe CSS ne crédite pas la prop homonyme', () => {
        expect(ids(`const c = ['origam-x', 'filter']`)).not.toContain('filter')
    })

    it('2. une clé i18n / un nom d évènement ne créditent pas', () => {
        expect(ids(`emit('active'); t('density_label')`)).not.toContain('active')
    })

    it('3. un segment de chemin d import ne crédite pas', () => {
        expect(ids(`import { x } from '../composables/Commons/activator.composable'`))
            .not.toContain('activator')
    })
})

describe('#499 — À NE PAS DÉTECTER : la chaîne EST la lecture', () => {
    it('1. useX(props, \'nom\') — le nom passé à un composable qui reçoit props', () => {
        expect(scanPropNameArgs(`useBackgroundColor(props, 'bgColor')`).get('useBackgroundColor'))
            .toContain('bgColor')
    })

    it('2. useX(props, { state: \'active\' }) — la forme objet d options', () => {
        expect(scanPropNameArgs(`useStateFlag(props, {state: 'active', source: 'modelValue'})`).get('useStateFlag'))
            .toEqual(new Set(['active', 'modelValue']))
    })

    it('3. toRef(props, \'x\') et pick(props, [\'a\', \'b\'])', () => {
        expect(reads(`useBothColor(toRef(props, 'bgColor'), toRef(props, 'color'))`))
            .toEqual(new Set(['bgColor', 'color']))
        expect(reads(`const p = pick(props, ['contentClass', 'maxHeight'])`))
            .toEqual(new Set(['contentClass', 'maxHeight']))
    })

    it('bonus — props[key] itérant une table locale de noms', () => {
        const src = `
            const table = { bp: ['sm', 'md', 'lg'] }
            for (const k of table.bp) { const v = props[k as keyof typeof props] }
        `
        for (const k of ['sm', 'md', 'lg']) expect(reads(src)).toContain(k)
    })
})

describe('#499 — blankStringBodies : effacer le CONTENU, garder la forme', () => {
    it('vide la chaîne sans décaler les positions', () => {
        const src = `const a = 'active'`

        expect(blankStringBodies(src)).toHaveLength(src.length)
        expect(blankStringBodies(src)).toBe(`const a = '      '`)
    })

    it('ne touche pas au code hors chaîne', () => {
        expect(blankStringBodies(`props.active + "x"`)).toBe(`props.active + " "`)
    })

    it('⛔ la source RENDUE aux autres scanners n est PAS effacée', () => {
        // scriptIdentifiers renvoie {ids, src} : `ids` ignore les chaînes,
        // `src` les conserve — sinon `props['x']` et `useX(props, 'x')`
        // deviendraient invisibles et le défaut changerait simplement de sens.
        const { src } = scriptIdentifiers(`const v = props['density']`)

        expect(src).toContain(`'density'`)
    })
})
