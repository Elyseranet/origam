/**
 * Self-test — C4/C5 délégués, C8 (`lib/hardcoded-strings.mjs`) testé ici.
 *
 * NI C4 NI C5 NE SONT RE-TESTÉS ICI. Les deux délèguent entièrement à un
 * fichier `guards/lib/*.selftest.mjs` déjà épinglé par ses propres
 * fixtures (rappel ET précision) :
 *   - C4 -> `guards/lib/setup-reads.selftest.mjs` (20 fixtures)
 *   - C5 -> `guards/lib/dead-emits.selftest.mjs` (déménagé avec
 *     `dead-emits.mjs` lui-même quand le garde CI
 *     `guards/unemitted-declarations.mjs` en a fait un second consommateur)
 * Réécrire ces cas ici serait une duplication, pas une vérification
 * supplémentaire — ce fichier appelle chaque self-test délégué en
 * sous-processus pour PROUVER qu'il passe, plutôt que de le supposer
 * silencieusement.
 *
 * Chaque cas MUST_FLAG (C8, ci-dessous) est un vrai piège de RAPPEL (un
 * défaut réel que le détecteur DOIT voir) ; chaque cas MUST_NOT_FLAG est un
 * vrai piège de PRÉCISION (un cas correct que le détecteur DOIT laisser
 * tranquille). La précision compte plus que le rappel (cf. header du dépôt
 * sur `pnpm-tree-integrity.selftest.mjs`) : un détecteur qui crie sur du
 * code correct est ignoré en une semaine.
 *
 * Run: node packages/ds/scripts/analysis/inspection-harness.selftest.mjs
 */

import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { analyseHardcodedStrings } from './lib/hardcoded-strings.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let failures = 0
const fail = (msg) => { console.log(`  FAIL  ${msg}`); failures++ }

console.log('─'.repeat(70))
console.log('Self-test: inspection-harness (C4 + C5 délégués, C8)')
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
 * C5 — délégation prouvée, pas redemontrée
 * ════════════════════════════════════════════════════════════════════ */
console.log('\nC5 (délégué à dead-emits.mjs) — preuve que son propre self-test passe :')
try {
    const out = execFileSync('node', [path.join(__dirname, '../guards/lib/dead-emits.selftest.mjs')], { stdio: 'pipe' }).toString()
    const passLine = out.trim().split('\n').at(-1)
    console.log(`  ok    dead-emits.selftest.mjs — ${passLine}`)
} catch (err) {
    fail(`dead-emits.selftest.mjs a échoué — sortie:\n${err.stdout}${err.stderr}`)
}

const wrapVue = (templateHtml, scriptBody) =>
    `<template>\n${templateHtml}\n</template>\n<script setup lang="ts">\n${scriptBody}\n</script>\n`

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
const total = C8_MUST_FLAG.length + C8_MUST_NOT_FLAG.length
if (failures) {
    console.log(`FAIL — ${failures}/${total} cas C8 en échec (+ délégations C4/C5).`)
    process.exit(1)
}
console.log(`PASS — ${total} cas C8 (+ délégations C4/C5 vérifiées), précision et rappel pinnés des deux côtés.`)
