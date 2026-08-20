/*
 * Guard: dead-handlers — un `v-on` (`@click`, `@keydown`, …) doit APPELER le
 * gestionnaire qu'il référence, pas seulement le mentionner.
 *
 * POURQUOI CE GARDE EXISTE (campagne #432 / #434)
 * ------------------------------------------------
 * Cinq composants, cinq écritures différentes, un seul bug : une expression
 * `v-on` dont la VALEUR FINALE (telle que Vue la compile) est une référence
 * de fonction jamais appelée.
 *
 *   OrigamProgressLinear   @click="clickable && handleClick"
 *   OrigamDatePicker       @click="!viewModeIsMonth ? handleClickDate : undefined"
 *   OrigamChip             @keydown="isClickable && !isLink && handleKeydown"
 *   OrigamListItem         @keydown="isClickable && !isLink && handleKeyDown"
 *   OrigamDataTableRow     withModifiers(() => toggleSelect(row), ['stop'])
 *                          — appelé comme instruction nue, son retour jeté
 *
 * Aucun ne lève, aucun n'échoue au type-check (une fonction est une valeur
 * parfaitement valide comme opérande de `&&` / `||` / `?:` — TypeScript ne
 * peut pas deviner que l'auteur voulait l'APPELER). Trouvés à la lecture,
 * composant par composant — c'est exactement le coût que ce fichier retire.
 *
 * CE QUI EST DÉTECTÉ — voir `lib/dead-handlers.mjs` pour le mécanisme complet
 * (vérifié contre le VRAI compilateur `vue/compiler-sfc`, pas reconstruit de
 * mémoire) :
 *   1. Dans le `<template>` : toute directive `v-on` dont l'expression n'est
 *      NI une référence de méthode nue (`handleClick`, `foo.bar`) NI un appel
 *      déjà effectué (`handleClick()`) NI un littéral de fonction, ET qui
 *      contient, en position d'opérande `&&`/`||`/`?:`, une référence nue à
 *      un nom déclaré comme fonction dans le `<script setup>` du même
 *      composant — ou un appel nu à `withModifiers`/`withKeys` non
 *      lui-même invoqué.
 *   2. Dans le `<script setup>` : un appel nu à `withModifiers`/`withKeys`
 *      utilisé comme INSTRUCTION isolée dans un corps de fonction (le motif
 *      `OrigamDataTableRow`), retour jeté.
 *
 * Ne signale JAMAIS `@click="handleClick"` seul — c'est la forme correcte et
 * unique que Vue reconnaît et invoque automatiquement avec `$event`.
 *
 * Run: `node packages/ds/scripts/guards/dead-handlers.mjs`
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getRealComponents } from './lib/components.mjs'
import { report, writeBaseline } from './lib/baseline.mjs'
import { analyseSource } from './lib/dead-handlers.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DS_ROOT = path.resolve(__dirname, '../..')
const REPO_ROOT = path.resolve(DS_ROOT, '../..')
const BASELINE_PATH = path.join(__dirname, 'baseline/dead-handlers.json')

// Stable ID — line numbers are deliberately excluded (a baseline keyed on a
// line number breaks on the next unrelated edit above it). `text` already
// disambiguates two findings in the same component that share `kind`/`name`
// (e.g. OrigamDataTableRow's two `withModifiers(...)` calls) since the two
// statements' source text differs.
function slug (text) {
    return text.replace(/\s+/g, ' ').trim().slice(0, 80)
}

function run () {
    const violations = new Map()

    for (const { pascalName, file } of getRealComponents()) {
        const raw = readFileSync(file, 'utf8')
        const { findings } = analyseSource(raw, path.basename(file))

        for (const f of findings) {
            const id = `${pascalName}:${f.kind}:${f.name}:${slug(f.text)}`
            violations.set(
                id,
                `Origam${pascalName} (${path.relative(REPO_ROOT, file)}:${f.line}) — @${f.event}="${f.text}" référence \`${f.name}\` sans l'appeler [${f.kind}]`
            )
        }
    }

    if (process.argv.includes('--update-baseline')) {
        const written = writeBaseline(BASELINE_PATH, violations.keys())
        console.log(`Baseline written: ${written.length} entr${written.length === 1 ? 'y' : 'ies'} -> ${BASELINE_PATH}`)
        process.exit(0)
    }

    const exitCode = report({
        guardName: 'dead-handlers (un v-on doit APPELER son gestionnaire, pas le référencer)',
        baselinePath: BASELINE_PATH,
        currentIds: violations.keys(),
        detailsById: violations,
        fixHint: 'Remplacer `cond && handler` par `cond ? handler() : undefined` (ou binder toujours `@event="handler"` et garder la condition DANS le handler). Pour un `?:`, appeler explicitement la branche fonction : `cond ? handler() : undefined`. Pour `withModifiers`/`withKeys` utilisé comme instruction nue, soit retirer le wrapper (il ne sert à rien hors template), soit appeler son retour immédiatement.'
    })
    process.exit(exitCode)
}

run()
