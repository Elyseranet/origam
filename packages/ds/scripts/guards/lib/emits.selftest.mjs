/**
 * Self-test for `emits.mjs` — la résolution `IXxxEmits` PARTAGÉE par
 * `emits-completeness.mjs` (garde 7), `unemitted-declarations.mjs`
 * (garde 18) et le harnais de mesure C5 (`inspection-harness.mjs`).
 *
 * FAUX NÉGATIF REPRODUIT PAR MUTATION, 2026-09-03
 * ---------------------------------------------------------------------
 * Signalé par le coordinateur après mutation manuelle : ajouter un membre
 * en forme "type-based" (`'update:sonde': [v: boolean]`, syntaxe Vue >= 3.3
 * valide pour `defineEmits<T>()`) à `IBtnEmits` (racine, `extends
 * IAdjacentEmits, IGroupEmits {}`) ne faisait ressortir AUCUNE violation —
 * `unemitted-declarations.mjs` répondait `PASS` sur un composant qui déclare
 * réellement un emit jamais émis.
 *
 * `dead-emits.selftest.mjs` (garde 18, cas de cascade d'héritage) ne
 * pouvait PAS attraper ça : ses fixtures construisent l'index
 * d'interfaces À LA MAIN (`fakeIndex(...)`), en cout-circuitant
 * complètement `buildInterfaceIndex()`/`extractEmitNames()` — le code qui
 * PARSE réellement les fichiers `.interface.ts`, et où le bug vivait. Un
 * garde peut avoir un self-test vert et un vrai trou si le self-test ne
 * passe jamais par le vrai chemin de code. Ce fichier ferme cet écart :
 * chaque fixture ici construit son entrée d'index via `extractEmitNames`
 * — la fonction RÉELLE, jamais une liste écrite à la main.
 *
 * CE QUE LA MUTATION A PROUVÉ (voir investigation complète dans le commit)
 * ---------------------------------------------------------------------
 * Le rapport initial du coordinateur cadrait le défaut comme "racine vs
 * hérité" (un membre inline sur l'interface racine échappe, un membre
 * inline sur une interface héritée est vu). Deux mutations isolées prouvent
 * que c'est FAUX comme diagnostic — le vrai clivage est la SYNTAXE, pas la
 * position :
 *   - `IBtnEmits` racine + membre en signature d'appel `(e: 'x', ...)` : VU.
 *   - `IHoverEmits` héritée + membre en forme "type-based" `'x': [...]` :
 *     PAS VU (repris ici en MUST_FLAG "cascade" ci-dessous) — et pire,
 *     transforme les 5 violations DÉJÀ connues qui en dépendent (Alert,
 *     Avatar, AvatarGroup, BottomNav, Card) en entrées STALE, donc en faux
 *     "corrigé".
 * L'ancienne extraction ne cherchait QUE la forme "signature d'appel", sur
 * le corps ENTIER — jamais la forme "type-based", qu'elle soit sur la
 * racine ou sur un parent. `extractEmitNames()` gère maintenant les DEUX
 * formes, membre par membre.
 *
 * Run: node packages/ds/scripts/guards/lib/emits.selftest.mjs
 */

import { extractEmitNames, resolveDeclared, parseEmitsInterfacesFromSource } from './emits.mjs'
import { analyseDeadEmits } from './dead-emits.mjs'

let failures = 0
const fail = (msg) => { console.log(`  FAIL  ${msg}`); failures++ }

console.log('─'.repeat(70))
console.log('Self-test: emits.mjs — extractEmitNames (les deux formes defineEmits<T>())')
console.log('─'.repeat(70))

/* ════════════════════════════════════════════════════════════════════
 * extractEmitNames — rappel : chaque forme doit être trouvée
 * ════════════════════════════════════════════════════════════════════ */
const RECALL_CASES = [
    ['forme 1 — signature d\'appel (convention historique, 196/196 avant ce correctif)',
        `(e: 'foo', v: boolean): void`, ['foo']],
    ['forme 2 — type-based, clé quotée + tuple (le repro du coordinateur)',
        `'update:sonde': [v: boolean]`, ['update:sonde']],
    ['forme 2 — type-based, clé quotée + type fonction',
        `'update:sonde': (v: boolean) => void`, ['update:sonde']],
    ['forme 2 — type-based, clé NUE (identifiant valide, pas de quotes)',
        `click: (id: number) => void`, ['click']],
    ['forme 2 — clé optionnelle (`?`) avant le `:`',
        `mouseenter?: (el: HTMLElement, e: Event) => void`, ['mouseenter']],
    ['mélange forme 1 + forme 2 dans le MÊME corps, séparées par `;`',
        `(e: 'legacy', v: boolean): void; 'modern': [v: boolean]`, ['legacy', 'modern']],
    ['mélange forme 1 + forme 2, séparées par un SAUT DE LIGNE (pas de `;`)',
        `(e: 'legacy', v: boolean): void\n'modern': [v: boolean]`, ['legacy', 'modern']],
    ['plusieurs membres forme 2 sur des lignes séparées',
        `'update:hover': [value: boolean]\n'update:active': [value: boolean]`, ['update:hover', 'update:active']]
]

console.log('\nRAPPEL — chaque forme doit être extraite :')
for (const [label, body, expected] of RECALL_CASES) {
    const got = extractEmitNames(body)
    if (JSON.stringify(got) !== JSON.stringify(expected)) {
        fail(`${label} — attendu ${JSON.stringify(expected)}, obtenu ${JSON.stringify(got)}`)
    } else {
        console.log(`  ok    ${label}`)
    }
}

/* ════════════════════════════════════════════════════════════════════
 * extractEmitNames — précision : ne pas confondre un label de tuple ou
 * un paramètre de type fonction avec un NOUVEAU membre top-level
 * ════════════════════════════════════════════════════════════════════ */
const PRECISION_CASES = [
    ['le label interne d\'un tuple (`value:`) n\'est PAS un second événement',
        `'update:hover': [value: boolean]`, ['update:hover']],
    ['les paramètres d\'un type fonction (`el:`, `e:`) ne sont PAS des événements',
        `mouseenter?: (el: HTMLElement, e: Event) => void`, ['mouseenter']],
    ['tuple à deux éléments — un seul événement, pas un par label',
        `'range-select': [start: Date, end: Date]`, ['range-select']],
    ['corps vide (pure extends, `{}`)', ``, []]
]

console.log('\nPRÉCISION — pas de faux membre depuis l\'intérieur d\'un type :')
for (const [label, body, expected] of PRECISION_CASES) {
    const got = extractEmitNames(body)
    if (JSON.stringify(got) !== JSON.stringify(expected)) {
        fail(`${label} — attendu ${JSON.stringify(expected)}, obtenu ${JSON.stringify(got)}`)
    } else {
        console.log(`  ok    ${label}`)
    }
}

/* ════════════════════════════════════════════════════════════════════
 * Bout en bout — index construit via extractEmitNames (le VRAI chemin),
 * jamais une liste écrite à la main. Les deux cas demandés explicitement
 * par le coordinateur.
 * ════════════════════════════════════════════════════════════════════ */
console.log('\nBOUT EN BOUT (index réel, via extractEmitNames) :')

function realIndexEntry (body, parents = []) {
    return { parents, events: extractEmitNames(body) }
}

const wrapVue = (templateHtml, scriptBody) =>
    `<template>\n${templateHtml}\n</template>\n<script setup lang="ts">\n${scriptBody}\n</script>\n`

// Cas 1 (demandé) — membre inline forme "type-based" sur l'interface
// RACINE, jamais émis -> DOIT être signalé.
{
    const index = new Map()
    index.set('IBtnEmits', realIndexEntry(`'update:sonde': [v: boolean]`))
    const source = wrapVue('<div/>', `defineEmits<IBtnEmits>()`)
    const { neverEmitted } = analyseDeadEmits(source, index)
    if (JSON.stringify(neverEmitted) !== JSON.stringify(['update:sonde'])) {
        fail(`racine forme type-based, jamais émis — attendu ['update:sonde'], obtenu ${JSON.stringify(neverEmitted)}`)
    } else {
        console.log('  ok    racine, membre forme type-based JAMAIS ÉMIS -> signalé (le repro exact du coordinateur)')
    }
}

// Cas 2 (demandé) — même membre, mais RÉELLEMENT émis -> NE DOIT PAS
// être signalé (pas de faux positif introduit par le correctif).
{
    const index = new Map()
    index.set('IBtnEmits', realIndexEntry(`'update:sonde': [v: boolean]`))
    const source = wrapVue('<div/>', `
        const emit = defineEmits<IBtnEmits>()
        emit('update:sonde', true)
    `)
    const { neverEmitted } = analyseDeadEmits(source, index)
    if (neverEmitted.length) {
        fail(`racine forme type-based, ÉMIS — faussement signalé : ${JSON.stringify(neverEmitted)}`)
    } else {
        console.log('  ok    racine, membre forme type-based ÉMIS -> pas signalé (pas de faux positif)')
    }
}

// Cas 3 — la cascade d'héritage EXACTE que la mutation du coordinateur a
// cassée : IHoverEmits (forme type-based) étendue par une interface
// racine. Doit rester détecté quand jamais émis.
{
    const index = new Map()
    index.set('IBtnEmits', realIndexEntry(``, ['IHoverEmits']))
    index.set('IHoverEmits', realIndexEntry(`'update:hover': [value: boolean]`))
    const declared = resolveDeclared('IBtnEmits', index)
    if (!declared.has('update:hover')) {
        fail(`cascade héritée, forme type-based — resolveDeclared n'a pas vu update:hover (obtenu ${[...declared]})`)
    } else {
        console.log('  ok    interface HÉRITÉE en forme type-based -> vue par resolveDeclared (la cascade ne casse plus)')
    }
    const source = wrapVue('<div/>', `defineEmits<IBtnEmits>()`)
    const { neverEmitted } = analyseDeadEmits(source, index)
    if (JSON.stringify(neverEmitted) !== JSON.stringify(['update:hover'])) {
        fail(`cascade héritée, forme type-based, jamais émis — attendu ['update:hover'], obtenu ${JSON.stringify(neverEmitted)}`)
    } else {
        console.log('  ok    cascade héritée, forme type-based, JAMAIS ÉMIS -> signalé')
    }
}

/* ════════════════════════════════════════════════════════════════════
 * `export type IXxxEmits = <RHS>` — angle mort trouvé le 2026-09-04 :
 * `buildInterfaceIndex()` ne matchait QUE `export interface`, donc un alias
 * de type n'entrait JAMAIS dans l'index. Reproduit par mutation par le
 * coordinateur : `export type IChartGaugeEmits = IChartBaseEmits` (garde :
 * PASS, 0 violation) vs `export interface IChartGaugeEmits extends
 * IChartBaseEmits {}` (garde : FAIL, 3 NOUVELLES violations) — même
 * sémantique TypeScript, verdict du garde opposé.
 *
 * Les cas ci-dessous appellent `parseEmitsInterfacesFromSource()` — la
 * fonction RÉELLEMENT utilisée par `buildInterfaceIndex()` sur le contenu
 * d'un fichier — sur une chaîne fabriquée, JAMAIS un index construit à la
 * main. C'est le même principe que la section "BOUT EN BOUT" ci-dessus,
 * un cran plus bas : celle-là exerçait déjà `extractEmitNames()` en bout
 * réel, mais construisait l'entrée d'index EX-NIHILO (`index.set(...)`),
 * court-circuitant la regex `export interface …` / `export type …` — donc
 * incapable de reproduire CE bug précis, qui vit dans cette regex, pas
 * dans `extractEmitNames()`.
 * ════════════════════════════════════════════════════════════════════ */
console.log('\nALIAS DE TYPE (`export type IXxxEmits = …`) — via parseEmitsInterfacesFromSource réel :')

// Forme 1 — alias vers une AUTRE interface (18 cas Chart réels :
// `IChartXxxEmits = IChartBaseEmits`). Doit résoudre la chaîne complète.
{
    const src = `
        export interface IChartBaseEmits {
            (e: 'point-click', point: unknown): void
        }
        export type IChartGaugeEmits = IChartBaseEmits
    `
    const index = new Map(parseEmitsInterfacesFromSource(src))
    const declared = resolveDeclared('IChartGaugeEmits', index)
    if (!declared.has('point-click')) {
        fail(`alias vers une interface — resolveDeclared('IChartGaugeEmits') n'a pas vu point-click (obtenu ${[...declared]})`)
    } else {
        console.log('  ok    alias `= IChartBaseEmits` -> resolveDeclared voit point-click à travers l\'alias')
    }

    // MUST_FLAG — jamais émis -> le garde doit le voir.
    const sourceNeverEmitted = `<template><div/></template>\n<script setup lang="ts">\ndefineEmits<IChartGaugeEmits>()\n</script>`
    const { neverEmitted } = analyseDeadEmits(sourceNeverEmitted, index)
    if (JSON.stringify(neverEmitted) !== JSON.stringify(['point-click'])) {
        fail(`alias vers une interface, jamais émis — attendu ['point-click'], obtenu ${JSON.stringify(neverEmitted)} (repro exact du ticket : IChartGaugeEmits = IChartBaseEmits)`)
    } else {
        console.log('  ok    alias `= IChartBaseEmits`, JAMAIS ÉMIS -> signalé (le vrai bug ChartGauge)')
    }

    // MUST_NOT_FLAG — réellement émis -> pas de faux positif introduit.
    const sourceEmitted = `<template><div/></template>\n<script setup lang="ts">\nconst emit = defineEmits<IChartGaugeEmits>()\nemit('point-click', {})\n</script>`
    const { neverEmitted: neverEmittedWhenEmitted } = analyseDeadEmits(sourceEmitted, index)
    if (neverEmittedWhenEmitted.length) {
        fail(`alias vers une interface, RÉELLEMENT émis — faussement signalé : ${JSON.stringify(neverEmittedWhenEmitted)}`)
    } else {
        console.log('  ok    alias `= IChartBaseEmits`, RÉELLEMENT ÉMIS -> pas signalé (pas de faux positif)')
    }
}

// Forme 2 — alias vers une signature de fonction NUE, pas vers une autre
// interface (le cas réel `IDatePickerHeaderEmits`).
{
    const src = `export type IDatePickerHeaderEmits = (e: 'click', event?: MouseEvent) => void`
    const index = new Map(parseEmitsInterfacesFromSource(src))
    const declared = resolveDeclared('IDatePickerHeaderEmits', index)
    if (!declared.has('click')) {
        fail(`alias vers une signature de fonction nue — resolveDeclared n'a pas vu 'click' (obtenu ${[...declared]})`)
    } else {
        console.log('  ok    alias `= (e: \'click\', …) => void` -> resolveDeclared voit click (forme signature nue, pas une interface)')
    }

    const sourceNeverEmitted = `<template><div/></template>\n<script setup lang="ts">\ndefineEmits<IDatePickerHeaderEmits>()\n</script>`
    const { neverEmitted } = analyseDeadEmits(sourceNeverEmitted, index)
    if (JSON.stringify(neverEmitted) !== JSON.stringify(['click'])) {
        fail(`alias vers signature nue, jamais émis — attendu ['click'], obtenu ${JSON.stringify(neverEmitted)}`)
    } else {
        console.log('  ok    alias `= (e: \'click\', …) => void`, JAMAIS ÉMIS -> signalé')
    }

    const sourceEmitted = `<template><div/></template>\n<script setup lang="ts">\nconst emit = defineEmits<IDatePickerHeaderEmits>()\nemit('click')\n</script>`
    const { neverEmitted: neverEmittedWhenEmitted } = analyseDeadEmits(sourceEmitted, index)
    if (neverEmittedWhenEmitted.length) {
        fail(`alias vers signature nue, RÉELLEMENT émis — faussement signalé : ${JSON.stringify(neverEmittedWhenEmitted)}`)
    } else {
        console.log('  ok    alias `= (e: \'click\', …) => void`, RÉELLEMENT ÉMIS -> pas signalé (pas de faux positif)')
    }
}

console.log('')
const total = RECALL_CASES.length + PRECISION_CASES.length + 4 + 6
if (failures) {
    console.log(`FAIL — ${failures}/${total} cas en échec.`)
    process.exit(1)
}
console.log(`PASS — ${total} cas, les deux formes defineEmits<T>() ET les deux formes d'alias de type reconnues des deux côtés (rappel/précision), bout en bout via le vrai extractEmitNames / parseEmitsInterfacesFromSource.`)
