/**
 * Self-test for `dead-emits.mjs` — C5, "un emit DÉCLARÉ n'est jamais ÉMIS".
 *
 * Extrait de `analysis/inspection-harness.selftest.mjs` au moment où
 * `dead-emits.mjs` a déménagé de `analysis/lib/` vers `guards/lib/` (voir
 * le header du fichier déplacé) : il alimente maintenant le garde CI
 * `guards/unemitted-declarations.mjs` en plus du harnais de mesure C5/C8, et
 * chaque consommateur d'un fichier sous `guards/lib/` a son propre
 * `*.selftest.mjs` à côté — convention du dépôt (`dead-handlers.selftest.mjs`,
 * `setup-reads.selftest.mjs`, `id-forwarding.selftest.mjs`).
 * `inspection-harness.selftest.mjs` délègue désormais ici pour C5, au lieu
 * de dupliquer ces fixtures — même mécanique que sa délégation C4 vers
 * `setup-reads.selftest.mjs`.
 *
 * Chaque cas MUST_FLAG est un vrai piège de RAPPEL (un défaut réel que le
 * détecteur DOIT voir) ; chaque cas MUST_NOT_FLAG est un vrai piège de
 * PRÉCISION (un cas correct que le détecteur DOIT laisser tranquille). La
 * précision compte plus que le rappel (cf. header du dépôt sur
 * `pnpm-tree-integrity.selftest.mjs`) : un détecteur qui crie sur du code
 * correct est ignoré en une semaine.
 *
 * Run: node packages/ds/scripts/guards/lib/dead-emits.selftest.mjs
 */

import { analyseDeadEmits } from './dead-emits.mjs'

let failures = 0
const fail = (msg) => { console.log(`  FAIL  ${msg}`); failures++ }

console.log('─'.repeat(70))
console.log('Self-test: dead-emits analyser (C5 — un emit déclaré doit être émis)')
console.log('─'.repeat(70))

/** Construit un index d'interfaces minimal et hermétique — aucune
 *  dépendance au vrai `src/interfaces/`, pour que ces fixtures ne dérivent
 *  jamais avec le catalogue réel. */
function fakeIndex (entries) {
    const index = new Map()
    for (const [name, { events = [], parents = [] }] of Object.entries(entries)) {
        index.set(name, { parents, events })
    }
    return index
}

const wrapVue = (templateHtml, scriptBody) =>
    `<template>\n${templateHtml}\n</template>\n<script setup lang="ts">\n${scriptBody}\n</script>\n`

const MUST_FLAG = [
    [
        'événement déclaré, jamais appelé littéralement, aucun relais — le composant émet et déclare pour de vrai, mais PAS celui-ci',
        wrapVue('<div/>', `
            const emit = defineEmits<ITestEmits>()
            emit('foo')
        `),
        fakeIndex({ ITestEmits: { events: ['foo', 'bar'] } }),
        ['bar']
    ],
    [
        'defineEmits<T>() nu (pas de variable captée) — aucun appel littéral n\'est possible',
        wrapVue('<div/>', `
            defineEmits<ITestEmits>()
        `),
        fakeIndex({ ITestEmits: { events: ['foo'] } }),
        ['foo']
    ],
    [
        'useActive(props) appelé MAIS `onActive` jamais déstructuré/câblé — le cas useHover',
        wrapVue('<div/>', `
            defineEmits<ITestEmits>()
            const { isActive } = useActive(props)
        `),
        fakeIndex({ ITestEmits: { events: ['update:active'] } }),
        ['update:active']
    ],
    [
        'useAdjacent(props) appelé MAIS le handler retourné n\'est câblé nulle part',
        wrapVue('<div/>', `
            defineEmits<ITestEmits>()
            const { onClickPrepend } = useAdjacent(props)
        `),
        fakeIndex({ ITestEmits: { events: ['click:prepend'] } }),
        ['click:prepend']
    ],
    [
        // Le cas exact de la mission : IBottomNavEmits extends ICommonsComponentEmits,
        // IActiveEmits, IHoverEmits — un événement DÉCLARÉ deux niveaux plus
        // haut dans la chaîne d'héritage (IHoverEmits -> update:hover, jamais
        // câblé) doit être vu, pas seulement ce que l'interface NOMMÉE porte
        // directement dans `defineEmits<...>()`.
        'emit hérité en CASCADE (2 niveaux) — déclaré par le grand-parent de l\'interface nommée, jamais émis',
        wrapVue('<div/>', `
            defineEmits<IBottomNavEmits>()
            const { isActive, onActive } = useActive(props)
        `),
        fakeIndex({
            IBottomNavEmits: { parents: ['ICommonsComponentEmits', 'IActiveEmits', 'IHoverEmits'] },
            ICommonsComponentEmits: { events: ['update:modelValue'] },
            IActiveEmits: { events: ['update:active'] },
            IHoverEmits: { events: ['update:hover'] }
        }),
        // update:active est câblé (onActive utilisé) -> pas un défaut.
        // update:modelValue n'est déclenché par rien ici -> défaut.
        // update:hover n'est déclenché par rien (useHover n'est même pas
        // appelé) -> défaut, ET c'est celui venu de deux niveaux d'héritage
        // plus haut que l'interface nommée dans defineEmits<>.
        ['update:hover', 'update:modelValue']
    ]
]

const MUST_NOT_FLAG = [
    [
        'appel littéral direct — déclaré ET émis',
        wrapVue('<div/>', `
            const emit = defineEmits<ITestEmits>()
            emit('foo')
        `),
        fakeIndex({ ITestEmits: { events: ['foo'] } }),
        'neverEmitted'
    ],
    [
        'appel littéral dans le TEMPLATE, pas dans le script (cas OrigamAudio play/pause)',
        wrapVue('<button @click="emit(\'foo\')">go</button>', `
            const emit = defineEmits<ITestEmits>()
        `),
        fakeIndex({ ITestEmits: { events: ['foo'] } }),
        'neverEmitted'
    ],
    [
        'relais useVModel — écrit .value=, jamais un emit(...) littéral',
        wrapVue('<div/>', `
            defineEmits<ITestEmits>()
            const model = useVModel(props, 'modelValue')
            model.value = 1
        `),
        fakeIndex({ ITestEmits: { events: ['update:modelValue'] } }),
        'neverEmitted'
    ],
    [
        'relais useActive AVEC onActive câblé (@click="onActive")',
        wrapVue('<div @click="onActive"/>', `
            defineEmits<ITestEmits>()
            const { isActive, onActive } = useActive(props)
        `),
        fakeIndex({ ITestEmits: { events: ['update:active'] } }),
        'neverEmitted'
    ],
    [
        'relais useAdjacent AVEC le handler renommé et câblé',
        wrapVue('<div @click="handlePrepend"/>', `
            defineEmits<ITestEmits>()
            const { onClickPrepend: handlePrepend } = useAdjacent(props)
        `),
        fakeIndex({ ITestEmits: { events: ['click:prepend'] } }),
        'neverEmitted'
    ],
    [
        'relais useGroup (relais-d\'un-relais : useVModel interne à useGroup, jamais dans le .vue)',
        wrapVue('<div/>', `
            defineEmits<ITestEmits>()
            const { selected } = useGroup(props, KEY)
        `),
        fakeIndex({ ITestEmits: { events: ['update:modelValue'] } }),
        'neverEmitted'
    ],
    [
        // Même chaîne d'héritage que le cas MUST_FLAG ci-dessus, mais cette
        // fois les trois événements hérités en cascade sont RÉELLEMENT
        // couverts : update:active par le relais useActive câblé,
        // update:modelValue par le relais useVModel, et update:hover par un
        // appel LITTÉRAL — `useHover(props)` seul ne relaie jamais rien (cf.
        // header de dead-emits.mjs), donc ce n'est PAS le moyen de couvrir
        // update:hover ici. Aucun des trois ne doit ressortir.
        'emit hérité en CASCADE (2 niveaux) — tous les événements du grand-parent sont réellement couverts',
        wrapVue('<div @click="onActive"/>', `
            const emit = defineEmits<IBottomNavEmits>()
            const { isActive, onActive } = useActive(props)
            const model = useVModel(props, 'modelValue')
            model.value = 1
            function notifyHover (v: boolean) { emit('update:hover', v) }
        `),
        fakeIndex({
            IBottomNavEmits: { parents: ['ICommonsComponentEmits', 'IActiveEmits', 'IHoverEmits'] },
            ICommonsComponentEmits: { events: ['update:modelValue'] },
            IActiveEmits: { events: ['update:active'] },
            IHoverEmits: { events: ['update:hover'] }
        }),
        'neverEmitted'
    ],
    [
        'appel dynamique présent — événement non prouvé bascule en indéterminé, PAS en neverEmitted',
        wrapVue('<div/>', `
            const emit = defineEmits<ITestEmits>()
            emit(dynamicName, payload)
        `),
        fakeIndex({ ITestEmits: { events: ['foo'] } }),
        'neverEmitted' // doit être vide ; le test vérifie aussi indeterminate séparément
    ]
]

console.log('\nMUST FLAG (rappel) :')
for (const [label, source, index, expected] of MUST_FLAG) {
    const { neverEmitted } = analyseDeadEmits(source, index)
    const got = [...neverEmitted].sort()
    const want = [...expected].sort()
    if (JSON.stringify(got) !== JSON.stringify(want)) {
        fail(`${label} — attendu [${want}], obtenu [${got}]`)
    } else {
        console.log(`  ok    ${label}`)
    }
}

console.log('\nMUST NOT FLAG (précision) :')
for (const [label, source, index, field] of MUST_NOT_FLAG) {
    const result = analyseDeadEmits(source, index)
    if (result[field].length) {
        fail(`${label} — faussement signalé dans ${field}: [${result[field]}]`)
    } else {
        console.log(`  ok    ${label}`)
    }
}

// Cas séparé : l'appel dynamique doit REPORTER l'événement en indéterminé,
// pas le faire disparaître silencieusement.
{
    const [, source, index] = MUST_NOT_FLAG.at(-1)
    const { indeterminate, hasDynamicEmit } = analyseDeadEmits(source, index)
    if (!hasDynamicEmit || JSON.stringify(indeterminate) !== JSON.stringify(['foo'])) {
        fail(`appel dynamique — attendu indeterminate=['foo'], obtenu ${JSON.stringify(indeterminate)} (hasDynamicEmit=${hasDynamicEmit})`)
    } else {
        console.log('  ok    appel dynamique reporté en indeterminate=[\'foo\'], pas en neverEmitted')
    }
}

console.log('')
const total = MUST_FLAG.length + MUST_NOT_FLAG.length + 1
if (failures) {
    console.log(`FAIL — ${failures}/${total} cas en échec.`)
    process.exit(1)
}
console.log(`PASS — ${total} cas C5, précision et rappel pinnés des deux côtés (dont la cascade d'héritage à 2 niveaux).`)
