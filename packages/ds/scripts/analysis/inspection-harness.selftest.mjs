/**
 * Self-test — C5 (`lib/dead-emits.mjs`) et C8 (`lib/hardcoded-strings.mjs`).
 *
 * C4 N'EST PAS RE-TESTÉ ICI. Ce critère délègue entièrement à
 * `guards/lib/setup-reads.mjs`, déjà épinglé par 20 fixtures dans
 * `guards/lib/setup-reads.selftest.mjs` (rappel ET précision). Réécrire ces
 * 20 cas ici serait une duplication, pas une vérification supplémentaire —
 * ce fichier appelle `setup-reads.selftest.mjs` en sous-processus pour
 * PROUVER qu'il passe, plutôt que de le supposer silencieusement.
 *
 * Chaque cas MUST_FLAG est un vrai piège de RAPPEL (un défaut réel que le
 * détecteur DOIT voir) ; chaque cas MUST_NOT_FLAG est un vrai piège de
 * PRÉCISION (un cas correct que le détecteur DOIT laisser tranquille). La
 * précision compte plus que le rappel (cf. header du dépôt sur
 * `pnpm-tree-integrity.selftest.mjs`) : un détecteur qui crie sur du code
 * correct est ignoré en une semaine.
 *
 * Run: node packages/ds/scripts/analysis/inspection-harness.selftest.mjs
 */

import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { analyseDeadEmits } from './lib/dead-emits.mjs'
import { analyseHardcodedStrings } from './lib/hardcoded-strings.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let failures = 0
const fail = (msg) => { console.log(`  FAIL  ${msg}`); failures++ }

console.log('─'.repeat(70))
console.log('Self-test: inspection-harness (C5 + C8)')
console.log('─'.repeat(70))

/* ════════════════════════════════════════════════════════════════════
 * C4 — délégation prouvée, pas redemontrée
 * ════════════════════════════════════════════════════════════════════ */
console.log('\nC4 (délégué à setup-reads.mjs) — preuve que son propre self-test passe :')
try {
    const out = execFileSync('node', [path.join(__dirname, '../guards/lib/setup-reads.selftest.mjs')], { stdio: 'pipe' }).toString()
    // Ne PAS recopier un chiffre à la main : lire la ligne PASS que le
    // self-test délégué imprime lui-même, pour ne jamais afficher un
    // compte inventé si son nombre de fixtures change un jour.
    const passLine = out.trim().split('\n').at(-1)
    console.log(`  ok    setup-reads.selftest.mjs — ${passLine}`)
} catch (err) {
    fail(`setup-reads.selftest.mjs a échoué — sortie:\n${err.stdout}${err.stderr}`)
}

/* ════════════════════════════════════════════════════════════════════
 * C5 — dead-emits
 * ════════════════════════════════════════════════════════════════════ */

/** Construit un index d'interfaces minimal et hermétique — aucune
 *  dépendance au vrai `src/interfaces/`, pour que ces fixtures ne dérivent
 *  jamais avec le catalogue réel. */
function fakeIndex (events, parents = []) {
    const index = new Map()
    index.set('ITestEmits', { parents, events })
    return index
}

const wrapVue = (templateHtml, scriptBody) =>
    `<template>\n${templateHtml}\n</template>\n<script setup lang="ts">\n${scriptBody}\n</script>\n`

const C5_MUST_FLAG = [
    [
        'événement déclaré, jamais appelé littéralement, aucun relais',
        wrapVue('<div/>', `
            const emit = defineEmits<ITestEmits>()
            emit('foo')
        `),
        fakeIndex(['foo', 'bar']),
        ['bar']
    ],
    [
        'defineEmits<T>() nu (pas de variable captée) — aucun appel littéral n\'est possible',
        wrapVue('<div/>', `
            defineEmits<ITestEmits>()
        `),
        fakeIndex(['foo']),
        ['foo']
    ],
    [
        'useActive(props) appelé MAIS `onActive` jamais déstructuré/câblé — le cas useHover',
        wrapVue('<div/>', `
            defineEmits<ITestEmits>()
            const { isActive } = useActive(props)
        `),
        fakeIndex(['update:active']),
        ['update:active']
    ],
    [
        'useAdjacent(props) appelé MAIS le handler retourné n\'est câblé nulle part',
        wrapVue('<div/>', `
            defineEmits<ITestEmits>()
            const { onClickPrepend } = useAdjacent(props)
        `),
        fakeIndex(['click:prepend']),
        ['click:prepend']
    ]
]

const C5_MUST_NOT_FLAG = [
    [
        'appel littéral direct',
        wrapVue('<div/>', `
            const emit = defineEmits<ITestEmits>()
            emit('foo')
        `),
        fakeIndex(['foo']),
        'neverEmitted'
    ],
    [
        'appel littéral dans le TEMPLATE, pas dans le script (cas OrigamAudio play/pause)',
        wrapVue('<button @click="emit(\'foo\')">go</button>', `
            const emit = defineEmits<ITestEmits>()
        `),
        fakeIndex(['foo']),
        'neverEmitted'
    ],
    [
        'relais useVModel — écrit .value=, jamais un emit(...) littéral',
        wrapVue('<div/>', `
            defineEmits<ITestEmits>()
            const model = useVModel(props, 'modelValue')
            model.value = 1
        `),
        fakeIndex(['update:modelValue']),
        'neverEmitted'
    ],
    [
        'relais useActive AVEC onActive câblé (@click="onActive")',
        wrapVue('<div @click="onActive"/>', `
            defineEmits<ITestEmits>()
            const { isActive, onActive } = useActive(props)
        `),
        fakeIndex(['update:active']),
        'neverEmitted'
    ],
    [
        'relais useAdjacent AVEC le handler renommé et câblé',
        wrapVue('<div @click="handlePrepend"/>', `
            defineEmits<ITestEmits>()
            const { onClickPrepend: handlePrepend } = useAdjacent(props)
        `),
        fakeIndex(['click:prepend']),
        'neverEmitted'
    ],
    [
        'relais useGroup (relais-d\'un-relais : useVModel interne à useGroup, jamais dans le .vue)',
        wrapVue('<div/>', `
            defineEmits<ITestEmits>()
            const { selected } = useGroup(props, KEY)
        `),
        fakeIndex(['update:modelValue']),
        'neverEmitted'
    ],
    [
        'appel dynamique présent — événement non prouvé bascule en indéterminé, PAS en neverEmitted',
        wrapVue('<div/>', `
            const emit = defineEmits<ITestEmits>()
            emit(dynamicName, payload)
        `),
        fakeIndex(['foo']),
        'neverEmitted' // doit être vide ; le test vérifie aussi indeterminate séparément
    ]
]

console.log('\nC5 — MUST FLAG (rappel) :')
for (const [label, source, index, expected] of C5_MUST_FLAG) {
    const { neverEmitted } = analyseDeadEmits(source, index)
    const got = [...neverEmitted].sort()
    const want = [...expected].sort()
    if (JSON.stringify(got) !== JSON.stringify(want)) {
        fail(`${label} — attendu [${want}], obtenu [${got}]`)
    } else {
        console.log(`  ok    ${label}`)
    }
}

console.log('\nC5 — MUST NOT FLAG (précision) :')
for (const [label, source, index, field] of C5_MUST_NOT_FLAG) {
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
    const [, source, index] = C5_MUST_NOT_FLAG.at(-1)
    const { indeterminate, hasDynamicEmit } = analyseDeadEmits(source, index)
    if (!hasDynamicEmit || JSON.stringify(indeterminate) !== JSON.stringify(['foo'])) {
        fail(`appel dynamique — attendu indeterminate=['foo'], obtenu ${JSON.stringify(indeterminate)} (hasDynamicEmit=${hasDynamicEmit})`)
    } else {
        console.log('  ok    appel dynamique reporté en indeterminate=[\'foo\'], pas en neverEmitted')
    }
}

/* ════════════════════════════════════════════════════════════════════
 * C8 — hardcoded-strings
 * ════════════════════════════════════════════════════════════════════ */

const C8_MUST_FLAG = [
    [
        'attribut statique aria-label (cas réel OrigamDialog)',
        wrapVue('<button aria-label="Close dialog">x</button>', 'defineProps<{}>()'),
        r => r.static.length === 1
    ],
    [
        'attribut lié dont l\'expression est un littéral pur (cas réel OrigamSnackbarGroup)',
        wrapVue('<div :aria-label="\'Notifications\'"/>', 'defineProps<{}>()'),
        r => r.boundLiteral.length === 1
    ],
    [
        'fallback littéral dans un `||` (cas réel OrigamDrawer)',
        wrapVue('<div :aria-label="name || \'Navigation\'"/>', 'const props = defineProps<{ name?: string }>()\nconst { name } = props'),
        r => r.boundLiteral.length === 1
    ],
    [
        'texte statique dans le template (cas réel : famille OrigamChart*)',
        wrapVue('<span>No data to display</span>', 'defineProps<{}>()'),
        r => r.templateText.length === 1
    ],
    [
        'valeur par défaut withDefaults qui transporte du texte affiché (cas réel OrigamCommandPalette)',
        wrapVue('<div/>', `
            const props = withDefaults(defineProps<{ emptyText?: string }>(), { emptyText: 'No results' })
        `),
        r => r.withDefaults.length === 1
    ],
    [
        'fragment fixe autour d\'une substitution de gabarit (cas réel OrigamTreeviewNode)',
        wrapVue('<div :alt="`${name} avatar`"/>', 'const props = defineProps<{ name: string }>()\nconst { name } = props'),
        r => r.boundLiteral.length === 1
    ]
]

const C8_MUST_NOT_FLAG = [
    [
        'clé i18n en withDefaults (piège central — cas réel OrigamAlert closeLabel)',
        wrapVue('<div/>', `
            const props = withDefaults(defineProps<{ closeLabel?: string }>(), { closeLabel: 'origam.close' })
        `),
        r => r.withDefaults.length === 0
    ],
    [
        'jeton technique en withDefaults, pas une clé ni un texte (cas réel OrigamList/Select itemTitle)',
        wrapVue('<div/>', `
            const props = withDefaults(defineProps<{ itemTitle?: string }>(), { itemTitle: 'title' })
        `),
        r => r.withDefaults.length === 0
    ],
    [
        'valeur CSS multi-mots dont le nom de prop ne signale pas du texte affiché (cas réel OrigamDialog origin)',
        wrapVue('<div/>', `
            const props = withDefaults(defineProps<{ origin?: string }>(), { origin: 'center center' })
        `),
        r => r.withDefaults.length === 0
    ],
    [
        'valeur à un seul caractère (cas réel OrigamQrCode errorCorrectionLevel)',
        wrapVue('<div/>', `
            const props = withDefaults(defineProps<{ errorCorrectionLevel?: string }>(), { errorCorrectionLevel: 'M' })
        `),
        r => r.withDefaults.length === 0
    ],
    [
        'attribut lié vers un identifiant pur — pas un littéral',
        wrapVue('<div :aria-label="ariaLabel"/>', 'const props = defineProps<{ ariaLabel: string }>()'),
        r => r.boundLiteral.length === 0
    ],
    [
        'attribut statique vide — image décorative légitime',
        wrapVue('<img alt="">', 'defineProps<{}>()'),
        r => r.static.length === 0
    ],
    [
        'interpolation pure, aucun texte statique autour',
        wrapVue('<span>{{ label }}</span>', 'const props = defineProps<{ label: string }>()'),
        r => r.templateText.length === 0
    ],
    [
        'attribut statique avec un jeton technique (pas un mot de langue naturelle)',
        wrapVue('<div title="menu"/>', 'defineProps<{}>()'),
        r => r.static.length === 0
    ]
]

console.log('\nC8 — MUST FLAG (rappel) :')
for (const [label, source, check] of C8_MUST_FLAG) {
    const result = analyseHardcodedStrings(source)
    if (!check(result)) {
        fail(`${label} — résultat inattendu: ${JSON.stringify(result)}`)
    } else {
        console.log(`  ok    ${label}`)
    }
}

console.log('\nC8 — MUST NOT FLAG (précision) :')
for (const [label, source, check] of C8_MUST_NOT_FLAG) {
    const result = analyseHardcodedStrings(source)
    if (!check(result)) {
        fail(`${label} — faussement signalé: ${JSON.stringify(result)}`)
    } else {
        console.log(`  ok    ${label}`)
    }
}

console.log('')
const total = C5_MUST_FLAG.length + C5_MUST_NOT_FLAG.length + 1 + C8_MUST_FLAG.length + C8_MUST_NOT_FLAG.length
if (failures) {
    console.log(`FAIL — ${failures}/${total} cas en échec (+ la délégation C4).`)
    process.exit(1)
}
console.log(`PASS — ${total} cas C5+C8 (+ délégation C4 vérifiée), précision et rappel pinnés des deux côtés.`)
