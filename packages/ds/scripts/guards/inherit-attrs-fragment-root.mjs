#!/usr/bin/env node
/*
 * Guard 30 — inherit-attrs-fragment-root: a component whose root vnode can be
 * a fragment, a text node or a `<teleport>` MUST declare `inheritAttrs: false`.
 *
 * BACKGROUND (#916, mechanism from #853) — full writeup in
 * `lib/inherit-attrs-fragment-root.mjs`. Short form: Vue's
 * `renderComponentRoot()` tries to merge fallthrough attributes onto the root
 * vnode and, when that root is not ELEMENT or COMPONENT, warns instead. The
 * warning appends a component trace that SERIALISES each ancestor's props —
 * including Vue Router's `<RouteProvider>`, whose `vnode` prop is the whole
 * page's reactive graph. ~4.4 MB per occurrence. #853 measured 5.5 GB of Nitro
 * log, and a later run 161 MB in 45 min followed by `JS heap out of memory`
 * and HTTP 500 on every route.
 *
 * ⛔ WHY A GUARD AND NOT JUST THE TWELVE FIXES. The symptom is a log file, not
 * a failing test, so the defect is invisible to every other check in this
 * repo — #853 shipped for months. And a component that opens with
 * `<template v-if>`, `<teleport>` or `<slot/>` starts in the defective state
 * by default: there is no equilibrium here for the catalogue to hold on its
 * own.
 *
 * SCOPE — static. It proves the option is DECLARED, never that the attributes
 * still reach the right element afterwards. That second half is the dangerous
 * one (`inheritAttrs: false` with no `v-bind="$attrs"` silently drops `class`,
 * `style`, `id`, `aria-*`, `data-cy` and every listener — #492), and it lives
 * in `packages/tests/TU/components/Commons/
 * inherit-attrs-fragment-roots.spec.ts`. ⛔ A green run of THIS guard says
 * nothing about whether attributes survive.
 *
 * Run: `node packages/ds/scripts/guards/inherit-attrs-fragment-root.mjs`
 *      `node packages/ds/scripts/guards/inherit-attrs-fragment-root.mjs --update-baseline`
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { report, writeBaseline } from './lib/baseline.mjs'
import { getRealComponents } from './lib/components.mjs'
import { analyseSource } from './lib/inherit-attrs-fragment-root.mjs'
import { runFixtures } from './lib/inherit-attrs-fragment-root.selftest.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DS_ROOT = path.resolve(__dirname, '..')
const REPO_ROOT = path.resolve(DS_ROOT, '../..')
const BASELINE_PATH = path.join(__dirname, 'baseline/inherit-attrs-fragment-root.json')

/*
 * ⛔ AUTO-TEST D'ABORD. Ce garde a une baseline VIDE : son etat nominal est
 * « 0 violation », exactement ce qu'afficherait un detecteur devenu aveugle.
 * Sans ce passage prealable, les deux situations seraient indiscernables.
 * Meme disposition que `class-fallthrough.mjs` et `prop-shadowing.mjs`.
 */
function run () {
    const self = runFixtures({ silent: true })
    if (self.failures) {
        console.log('─'.repeat(70))
        console.log('Guard: inherit-attrs-fragment-root — AUTO-TEST EN ECHEC, balayage non effectue')
        console.log('─'.repeat(70))
        console.log(`⛔ ${self.failures}/${self.total} fixture(s) du detecteur echouent.`)
        console.log('   Son verdict sur le catalogue ne vaut rien tant que ces temoins')
        console.log('   ne repassent pas.')
        console.log('   Detail : node packages/ds/scripts/guards/lib/inherit-attrs-fragment-root.selftest.mjs')
        console.log('─'.repeat(70))
        process.exit(1)
    }

    const violations = new Map()

    for (const { pascalName, file } of getRealComponents()) {
        const raw = readFileSync(file, 'utf8')
        const { violates, blocking } = analyseSource(raw, path.basename(file))

        if (!violates) continue

        violations.set(
            pascalName,
            `Origam${pascalName} (${path.relative(REPO_ROOT, file)}) — la racine du template peut etre ${blocking.join(' / ')}, or le composant ne declare pas \`inheritAttrs\`. Vue reessaie sa fusion d'attributs a chaque rendu, echoue, et logue « Extraneous non-props attributes » : la trace de ce warning serialise le vnode de chaque ancetre (~4,4 Mo par occurrence via RouteProvider, cf. #853).`
        )
    }

    if (process.argv.includes('--update-baseline')) {
        const written = writeBaseline(BASELINE_PATH, violations.keys())
        console.log(`Baseline written: ${written.length} entr${written.length === 1 ? 'y' : 'ies'} -> ${BASELINE_PATH}`)
        process.exit(0)
    }

    const exitCode = report({
        guardName: 'inherit-attrs-fragment-root (racine fragment/teleport sans `inheritAttrs: false`)',
        baselinePath: BASELINE_PATH,
        currentIds: violations.keys(),
        detailsById: violations,
        fixHint: 'Ajouter `defineOptions({ inheritAttrs: false })`. ⛔ PUIS DECIDER OU ATTERRISSENT LES ATTRIBUTS, ce n\'est pas un reglage global : (a) si une branche de la racine rend un ELEMENT UNIQUE, la fusion automatique y fonctionne aujourd\'hui et le drapeau seul la casserait en silence — re-binder `v-bind="$attrs"` sur cet element (c\'est le defaut de #492) ; (b) si la racine est un `<teleport>`, poser `v-bind="$attrs"` sur la racine visible a l\'interieur, APRES les autres liaisons pour que la valeur du consommateur gagne ; (c) si toutes les branches sont des fragments sans hote unique (peers, `v-for`, `<slot/>` nu), ne rien transmettre — les attributs n\'y arrivaient deja pas, et en inventer une destination serait une fonctionnalite nouvelle. Verifier le resultat en montant le composant avec un attribut non declare, comme le fait packages/tests/TU/components/Commons/inherit-attrs-fragment-roots.spec.ts.',
        coverageNote: 'Statique : prouve que l\'option est DECLAREE, jamais que les attributs atteignent encore le bon element. Le verdict runtime est dans packages/tests/TU/components/Commons/inherit-attrs-fragment-roots.spec.ts.'
    })
    process.exit(exitCode)
}

run()
