/**
 * Self-test du detecteur `theme-channel-confiscation` — rappel ET precision.
 *
 * ⛔ POURQUOI LA MOITIE NEGATIVE EST LA PLUS IMPORTANTE ICI. Le motif
 * ressemble trait pour trait a une regle parfaitement legitime : le DS
 * REPOSE sur des redeclarations scopees portees par un modificateur
 * (`&--density-compact`, `&--rounded-large`), et le CLAUDE.md les autorise
 * nommement. Un detecteur trop large signalerait 503 declarations dont 434
 * sont la logique PROPS-FIRST en train de fonctionner — et serait desactive
 * dans la semaine.
 *
 * Les deux discriminants, chacun pinne par un temoin :
 *   - TOUJOURS ACTIF   : `&--density-compact` (conditionnel) ne doit PAS
 *                        sortir ; `&--density-default` sur un composant qui
 *                        declare `density: DENSITY.DEFAULT` DOIT sortir.
 *   - MEME VALEUR      : `12px` contre `var(--origam-space---3)` sont le
 *                        MEME pixel et doivent sortir ; `8px` contre ce meme
 *                        token ne doit PAS sortir (retirer la ligne
 *                        changerait le rendu — c'est un arbitrage, pas un
 *                        correctif).
 *
 * Run: `node packages/ds/scripts/guards/lib/theme-channel-confiscation.selftest.mjs`
 */

import { analyseSources, resolveValue, buildTokenTable } from './theme-channel-confiscation.mjs'

const SHEETS = [
    {
        path: 'primitive.css',
        source: `:root {
            --origam-space---3: 12px;
            --origam-space---4: 16px;
            --origam-space---6: 24px;
            --origam-font__size---md: 0.875rem;
        }`
    },
    {
        path: 'light.css',
        source: `:root, [data-theme="light"] {
            --origam-demo---density: 0px;
            --origam-demo---padding: var(--origam-space---3);
            --origam-demo---font-size: var(--origam-font__size---md);
            --origam-demo---gap: var(--origam-space---4);
            --origam-demo---gutter: var(--origam-space---6);
        }`
    }
]

const ENUMS = [{
    path: 'density.enum.ts',
    source: `export enum DENSITY {\n    DEFAULT = 'default',\n    COMPACT = 'compact'\n}\n`
}]

const SCRIPT = `
    const props = withDefaults(defineProps<IDemoProps>(), {
        tag: 'div',
        density: DENSITY.DEFAULT
    })
`

function sfc (styleBody, { scoped = true, script = SCRIPT } = {}) {
    const attrs = scoped ? ' lang="scss" scoped' : ''
    return `<template><div /></template>\n<script lang="ts" setup>${ script }</script>\n`
        + `<style${ attrs }>\n${ styleBody }\n</style>\n`
}

const MUST_FLAG = [
    [
        'modificateur egal au defaut de withDefaults + valeur identique',
        [{ path: 'A.vue', source: sfc('.origam-demo { &--density-default { --origam-demo---density: 0px; } }') }],
        ['A.vue::--origam-demo---density']
    ],
    [
        'litteral contre var() — meme pixel, ecritures differentes',
        [{ path: 'B.vue', source: sfc('.origam-demo { &--density-default { --origam-demo---padding: 12px; } }') }],
        ['B.vue::--origam-demo---padding']
    ],
    /*
     * ⛔ CONTROLE POSITIF APPARIE de la fixture K de #902 : la MEME
     * declaration, sans `!important`, doit rester detectee. C'est ce qui
     * prouve que l'exclusion `carriesImportant` n'a pas emousse le detecteur
     * — sans cette paire, un `carriesImportant` qui renverrait `true` partout
     * rendrait le garde muet sans qu'aucun test ne bouge.
     */
    [
        '#902 — la meme declaration SANS `!important` reste detectee (le pendant de K)',
        [{ path: 'K2.vue', source: sfc('.origam-demo { --origam-demo---density: 0px; }') }],
        ['K2.vue::--origam-demo---density']
    ],
    [
        'rem contre token de typographie',
        [{ path: 'C.vue', source: sfc('.origam-demo { &--density-default { --origam-demo---font-size: 0.875rem; } }') }],
        ['C.vue::--origam-demo---font-size']
    ],
    [
        'selecteur sans aucune condition',
        [{ path: 'D.vue', source: sfc('.origam-demo { --origam-demo---gap: 16px; }') }],
        ['D.vue::--origam-demo---gap']
    ],
    [
        'bloc <style>:root{} non scope (#569)',
        [{ path: 'E.vue', source: sfc(':root { --origam-demo---gap: 4px; }', { scoped: false }) }],
        ['E.vue::style-root-block']
    ]
]

const MUST_NOT_FLAG = [
    [
        'modificateur NON defaut — la classe n\'existe que si on la demande',
        [{ path: 'F.vue', source: sfc('.origam-demo { &--density-compact { --origam-demo---density: 8px; } }') }]
    ],
    [
        'modificateur defaut mais valeur DIFFERENTE — retirer changerait le rendu',
        [{ path: 'G.vue', source: sfc('.origam-demo { &--density-default { --origam-demo---padding: 8px; } }') }]
    ],
    [
        'token qu\'aucune feuille ne declare — rien a confisquer',
        [{ path: 'H.vue', source: sfc('.origam-demo { --origam-demo---inconnu: 12px; }') }]
    ],
    [
        'etat interactif — conditionnel par nature',
        [{ path: 'I.vue', source: sfc('.origam-demo { &:hover { --origam-demo---gap: 16px; } }') }]
    ],
    [
        'derivation d\'instance en calc() — valeur non resolvable, hors verdict',
        [{ path: 'J.vue', source: sfc('.origam-demo { --origam-demo---gap: calc(var(--origam-demo---runtime) * 2); }') }]
    ],

    /*
     * ⛔ LES DEUX FIXTURES DE #902 — les deux corrections que le ticket
     * prescrivait auraient produit ici un faux positif. Mesure du 2026-09-25 :
     * les 5 declarations visees sont PORTEUSES, pas redondantes. Ces deux cas
     * epinglent le refus ; les retirer, c'est reouvrir #902 dans le mauvais
     * sens. Le raisonnement complet est dans `carriesImportant` et dans
     * l'en-tete de `resolveValue`.
     */
    [
        '#902 — `!important` : meme valeur, poids de cascade different (forme OrigamAudio)',
        [{ path: 'K.vue', source: sfc('.origam-demo { --origam-demo---density: 0px !important; }') }]
    ],
    [
        '#902 — calc() DERIVE d\'un token que le composant fait varier (forme OrigamRow)',
        [{
            path: 'L.vue',
            source: sfc(
                '.origam-demo {'
                + ' --origam-demo---padding: calc(var(--origam-demo---gutter) / 2);'
                + ' &--gutter-none { --origam-demo---gutter: 0px; }'
                + ' }'
            )
        }]
    ]
]

let failures = 0
let total = 0

function check (label, ok, detail, silent) {
    total += 1
    if (ok) {
        if (!silent) console.log(`  ✓ ${ label }`)
        return
    }
    failures += 1
    if (!silent) console.log(`  ✗ ${ label }\n      ${ detail }`)
}

export function runFixtures ({ silent = false } = {}) {
    failures = 0
    total = 0

    if (!silent) console.log('\nRAPPEL (le detecteur doit voir le defaut) :')
    for (const [label, files, expected] of MUST_FLAG) {
        const got = analyseSources({ sheets: SHEETS, components: files, enums: ENUMS }).map(v => v.id)
        check(label, expected.every(id => got.includes(id)), `attendu ${ expected.join(', ') } — obtenu [${ got.join(', ') || 'rien' }]`, silent)
    }

    if (!silent) console.log('\nPRECISION (une regle legitime ne doit PAS sortir) :')
    for (const [label, files] of MUST_NOT_FLAG) {
        const got = analyseSources({ sheets: SHEETS, components: files, enums: ENUMS }).map(v => v.id)
        check(label, got.length === 0, `faux positif : [${ got.join(', ') }]`, silent)
    }

    if (!silent) console.log('\nRESOLVEUR (c\'est lui qui rend la comparaison possible) :')
    const table = buildTokenTable(SHEETS)
    check('var() imbriques deroules jusqu\'au primitif',
        resolveValue('var(--origam-demo---padding)', table) === '12px',
        `obtenu ${ resolveValue('var(--origam-demo---padding)', table) }`, silent)
    check('repli utilise quand le nom est inconnu',
        resolveValue('var(--origam-absent, 9px)', table) === '9px',
        `obtenu ${ resolveValue('var(--origam-absent, 9px)', table) }`, silent)
    check('nom inconnu sans repli -> UNRESOLVED, jamais compare a l\'aveugle',
        resolveValue('var(--origam-absent)', table).includes('UNRESOLVED'),
        `obtenu ${ resolveValue('var(--origam-absent)', table) }`, silent)

    return { failures, total }
}

if (import.meta.url === `file://${ process.argv[1] }`) {
    const res = runFixtures()
    if (res.failures) {
        console.log(`\nFAIL — ${ res.failures } cas sur ${ res.total } en echec.\n`)
        process.exit(1)
    }
    console.log(`\nPASS — ${ res.total } cas, rappel et precision pinnes.\n`)
}
