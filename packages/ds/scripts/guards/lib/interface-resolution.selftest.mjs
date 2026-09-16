/*********************************************************
 * Fixtures de la traversee d'interfaces — LOSANGE vs CYCLE (#723)
 *
 * @description
 * ⛔ CES FIXTURES TOURNENT. `guards/unconsumed-props.mjs` appelle
 * `runInterfaceResolutionSelfTest()` AVANT de calculer quoi que ce soit et
 * sort en 1 si une seule echoue. Un jeu de fixtures que rien n'execute
 * decore ; celui-ci est sur le chemin du garde bloquant.
 *
 * @description
 * Ce qu'elles epinglent, dans les DEUX directions :
 *
 *   - RAPPEL — un LOSANGE doit ACCUMULER. Deux branches qui atteignent la
 *     meme base avec des `Pick<>` differents apportent chacune leur
 *     selection. C'est le defaut mesure de #723 : `IRatingFieldProps`
 *     perdait `letterSpacing` parce que la branche `IInputProps`, arrivee la
 *     premiere avec un `Pick` plus etroit, marquait `ITypographyProps` comme
 *     vue et coupait la branche `ILabelProps`.
 *
 *   - PRECISION — un `Pick<>` ne credite que ses cles, un `Omit<>` ne rend
 *     jamais une cle omise. Corriger le losange en creditant tout le parent
 *     serait un echec symetrique.
 *
 *   - CONTROLE NEGATIF — un vrai CYCLE doit toujours etre coupe. Cycle
 *     direct, cycle mutuel, cycle a trois noeuds, cycle via un `Pick`, et
 *     cycle COHABITANT avec un losange. Reintroduire une boucle infinie en
 *     reparant le losange serait un echec.
 *
 *   - MEMO — le resultat ne doit pas dependre de l'ORDRE des requetes. Le
 *     memo n'est pose que sur un sous-arbre acyclique ; une fixture entre
 *     par la base puis par le sommet, et l'inverse, et exige le meme
 *     resultat.
 *
 * Run: node packages/ds/scripts/guards/lib/interface-resolution.selftest.mjs
 ********************************************************/

import { makeInterfaceResolver } from '../../audit-unconsumed-props.mjs'

/** Petit constructeur de graphe : `iface('IA', ['a'], ['IB'], [pick('IC', 'x')])` */
const iface = (own = [], ext = [], narrowed = []) => ({
    own: new Set(own),
    extends: ext,
    narrowed
})
const pick = (base, ...keys) => ({ kind: 'pick', base, keys })
const omit = (base, ...keys) => ({ kind: 'omit', base, keys })

const graph = (obj) => new Map(Object.entries(obj))

/**
 * Chaque cas : { title, defs, query, expect, forbid?, order? }
 *  - `expect` : cles qui DOIVENT etre resolues (rappel)
 *  - `forbid` : cles qui ne doivent PAS l'etre (precision)
 *  - `order`  : requetes a jouer AVANT `query`, pour exercer le memo
 */
const CASES = [
    /* ---------------- RAPPEL — le losange accumule ---------------- */
    {
        title: 'losange: deux Pick<> differents sur la meme base — le jumeau synthetique de #723',
        defs: graph({
            ITypography: iface(['fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'fontFamily']),
            IInput: iface(['modelValue'], [], [pick('ITypography', 'fontSize', 'fontWeight', 'lineHeight')]),
            ILabel: iface(['text'], [], [pick('ITypography', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing')]),
            IRatingField: iface([], ['IInput', 'ILabel'])
        }),
        query: 'IRatingField',
        expect: ['modelValue', 'text', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing'],
        forbid: ['fontFamily']
    },
    {
        title: 'losange: la branche LARGE arrive en premier — l etroite ne doit rien retirer',
        defs: graph({
            ITypography: iface(['fontSize', 'letterSpacing', 'fontFamily']),
            IWide: iface([], [], [pick('ITypography', 'fontSize', 'letterSpacing')]),
            INarrow: iface([], [], [pick('ITypography', 'fontSize')]),
            IRoot: iface([], ['IWide', 'INarrow'])
        }),
        query: 'IRoot',
        expect: ['fontSize', 'letterSpacing'],
        forbid: ['fontFamily']
    },
    {
        title: 'losange via Omit<>: deux omissions differentes — l union des restes',
        defs: graph({
            IBase: iface(['a', 'b', 'c', 'd']),
            IL: iface([], [], [omit('IBase', 'a', 'b')]),
            IR: iface([], [], [omit('IBase', 'c', 'd')]),
            IRoot: iface([], ['IL', 'IR'])
        }),
        query: 'IRoot',
        expect: ['a', 'b', 'c', 'd']
    },
    {
        title: 'losange a trois branches, profondeur 2',
        defs: graph({
            IBase: iface(['p', 'q', 'r', 's']),
            IA: iface([], [], [pick('IBase', 'p')]),
            IB: iface([], [], [pick('IBase', 'q')]),
            IC: iface([], [], [pick('IBase', 'r')]),
            IMid1: iface([], ['IA', 'IB']),
            IMid2: iface([], ['IC']),
            IRoot: iface([], ['IMid1', 'IMid2'])
        }),
        query: 'IRoot',
        expect: ['p', 'q', 'r'],
        forbid: ['s']
    },

    /* ---------------- PRECISION ---------------- */
    {
        title: 'precision: un Pick<> ne credite pas une cle absente de la base',
        defs: graph({
            IBase: iface(['a']),
            IRoot: iface([], [], [pick('IBase', 'a', 'inexistante')])
        }),
        query: 'IRoot',
        expect: ['a'],
        forbid: ['inexistante']
    },
    {
        title: 'precision: un Omit<> ne rend jamais la cle omise, meme atteint deux fois',
        defs: graph({
            IBase: iface(['a', 'secret']),
            IL: iface([], [], [omit('IBase', 'secret')]),
            IR: iface([], [], [omit('IBase', 'secret')]),
            IRoot: iface([], ['IL', 'IR'])
        }),
        query: 'IRoot',
        expect: ['a'],
        forbid: ['secret']
    },
    {
        title: 'precision: un parent inconnu n invente rien',
        defs: graph({ IRoot: iface(['a'], ['IAbsente']) }),
        query: 'IRoot',
        expect: ['a']
    },

    /* ---------------- CONTROLE NEGATIF — les cycles restent coupes ---------------- */
    {
        title: 'cycle direct: A extends A — termine, ne perd pas ses membres propres',
        defs: graph({ IA: iface(['a'], ['IA']) }),
        query: 'IA',
        expect: ['a']
    },
    {
        title: 'cycle mutuel: A <-> B — termine, chacun garde ses membres',
        defs: graph({
            IA: iface(['a'], ['IB']),
            IB: iface(['b'], ['IA'])
        }),
        query: 'IA',
        expect: ['a', 'b']
    },
    {
        title: 'cycle a trois noeuds: A -> B -> C -> A',
        defs: graph({
            IA: iface(['a'], ['IB']),
            IB: iface(['b'], ['IC']),
            IC: iface(['c'], ['IA'])
        }),
        query: 'IB',
        expect: ['a', 'b', 'c']
    },
    {
        title: 'cycle a travers un Pick<>',
        defs: graph({
            IA: iface(['a'], [], [pick('IB', 'b')]),
            IB: iface(['b'], [], [pick('IA', 'a')])
        }),
        query: 'IA',
        expect: ['a', 'b']
    },
    {
        title: 'cycle ET losange dans le meme graphe — le cycle coupe, le losange accumule',
        defs: graph({
            ITypography: iface(['fontSize', 'letterSpacing']),
            ILoopA: iface(['la'], ['ILoopB']),
            ILoopB: iface(['lb'], ['ILoopA']),
            IL: iface([], ['ILoopA'], [pick('ITypography', 'fontSize')]),
            IR: iface([], ['ILoopB'], [pick('ITypography', 'letterSpacing')]),
            IRoot: iface([], ['IL', 'IR'])
        }),
        query: 'IRoot',
        expect: ['fontSize', 'letterSpacing', 'la', 'lb']
    },

    /* ---------------- MEMO — independance a l ordre des requetes ---------------- */
    {
        title: 'memo: resoudre la base AVANT le sommet ne tronque pas le losange',
        defs: graph({
            ITypography: iface(['fontSize', 'letterSpacing', 'fontFamily']),
            IInput: iface([], [], [pick('ITypography', 'fontSize')]),
            ILabel: iface([], [], [pick('ITypography', 'fontSize', 'letterSpacing')]),
            IRoot: iface([], ['IInput', 'ILabel'])
        }),
        order: ['IInput', 'ITypography', 'ILabel'],
        query: 'IRoot',
        expect: ['fontSize', 'letterSpacing'],
        forbid: ['fontFamily']
    },
    {
        title: 'memo: un noeud cyclique interroge depuis deux entrees rend le meme resultat',
        defs: graph({
            IA: iface(['a'], ['IB']),
            IB: iface(['b'], ['IA']),
            IRoot: iface(['r'], ['IA'])
        }),
        order: ['IB', 'IA'],
        query: 'IRoot',
        expect: ['r', 'a', 'b']
    },

    /* ---------------- membres propres ---------------- */
    {
        title: 'un membre propre l emporte sur celui herite (attribution de declaration)',
        defs: graph({
            IBase: iface(['a']),
            IRoot: iface(['a'], ['IBase'])
        }),
        query: 'IRoot',
        expect: ['a'],
        declaredBy: { a: 'IRoot' }
    }
]

export function runInterfaceResolutionSelfTest ({ verbose = false } = {}) {
    const failures = []

    for (const c of CASES) {
        const resolve = makeInterfaceResolver(c.defs)

        /*
         * Garde-fou anti-boucle-infinie : un cycle mal coupe ne rend pas un
         * mauvais resultat, il ne rend RIEN. Un `RangeError: Maximum call
         * stack size exceeded` est donc un echec, pas un crash a laisser
         * remonter tel quel.
         */
        let members
        try {
            for (const pre of c.order ?? []) resolve(pre)
            members = resolve(c.query)
        } catch (err) {
            failures.push(`${c.title}\n      la traversee a jete : ${err.name}: ${err.message}`)
            continue
        }

        const missing = (c.expect ?? []).filter((k) => !members.has(k))
        const extra = (c.forbid ?? []).filter((k) => members.has(k))
        const badOwner = Object.entries(c.declaredBy ?? {})
            .filter(([k, v]) => members.get(k) !== v)
            .map(([k, v]) => `${k} attendu declare par ${v}, obtenu ${members.get(k)}`)

        if (missing.length || extra.length || badOwner.length) {
            failures.push([
                c.title,
                missing.length ? `      RAPPEL manquant : ${missing.join(', ')}` : '',
                extra.length ? `      PRECISION, credite a tort : ${extra.join(', ')}` : '',
                badOwner.length ? `      DECLARANT : ${badOwner.join(' ; ')}` : ''
            ].filter(Boolean).join('\n'))
        } else if (verbose) {
            console.log(`  ok    ${c.title}`)
        }
    }

    return { total: CASES.length, failures }
}

const invokedDirectly = process.argv[1] && import.meta.url === `file://${process.argv[1]}`
if (invokedDirectly) {
    const line = '─'.repeat(70)
    console.log(line)
    console.log('Self-test: interface resolution — losange vs cycle (#723)')
    console.log(line)
    const { total, failures } = runInterfaceResolutionSelfTest({ verbose: true })
    for (const f of failures) console.log(`  FAIL  ${f}`)
    console.log(line)
    console.log(failures.length === 0
        ? `PASS — ${total} fixtures.`
        : `FAIL — ${failures.length}/${total} fixtures en echec.`)
    process.exit(failures.length === 0 ? 0 : 1)
}
