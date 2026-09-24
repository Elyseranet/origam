#!/usr/bin/env node
/*********************************************************
 * Runner — les self-tests des gardes du DS (#574)
 *
 * @description
 * Execute TOUS les `lib/*.selftest.mjs`, agrege leurs codes de sortie, et
 * ne court-circuite jamais. Le gate echoue si UN seul a echoue, et le
 * recapitulatif dit lequel.
 *
 * @description
 * ⛔ POURQUOI CE FICHIER EXISTE. Les 13 self-tests du DS existaient et
 * n'etaient executes par RIEN — ni par `run-all.mjs`, ni par aucun job de
 * `.github/workflows/`. Mesure le 2026-09-16 : un seul `run: … :self` dans
 * tout le repertoire des workflows, et il vise les gardes e2e, pas ceux-ci.
 *
 * @description
 * Le job CI qui couvre les gardes e2e porte deja l'argument, en toutes
 * lettres : « Without this a regression in an extractor makes both guards
 * go quiet — the failure mode that let 55 broken specs pass as "no drift"
 * ». Le raisonnement etait juste ; il n'avait simplement jamais ete
 * applique de ce cote. Un detecteur muet et un depot sain rendent le meme
 * vert — c'est la definition du faux vert que #574 poursuit.
 *
 * @description
 * La liste est DECOUVERTE, pas ecrite. Un self-test ajoute demain est
 * couvert sans que personne n'ait a s'en souvenir : une liste a tenir a
 * jour a la main est precisement le mecanisme par lequel un detecteur
 * finit orphelin.
 *
 * Run: `node packages/ds/scripts/guards/run-all-selftests.mjs`
 ********************************************************/
import { spawnSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const LIB = path.join(HERE, 'lib')

const selftests = readdirSync(LIB)
    .filter((entry) => entry.endsWith('.selftest.mjs'))
    .sort()

console.log(`\n═══ Self-tests des gardes DS (${selftests.length} decouverts, executes tous, codes agreges) ═══\n`)

/*********************************************************
 * Zero self-test decouvert = echec, jamais un silence
 *
 * @description
 * Un repertoire vide — renomme, deplace, exclu d'un build — rendrait
 * « 0/0 verts » et `exit 0`. C'est exactement le faux vert que ce runner
 * existe pour empecher, reproduit dans le runner lui-meme.
 ********************************************************/
if (!selftests.length) {
    console.error(`✗ Aucun *.selftest.mjs trouve dans ${LIB} — le repertoire a bouge, ou les self-tests ont disparu.`)
    process.exit(1)
}

const results = []

for (const entry of selftests) {
    const run = spawnSync(process.execPath, [path.join(LIB, entry)], { stdio: 'inherit' })
    // Un self-test tue par un signal (OOM, timeout) a `status === null`.
    // Le compter comme 0 ferait passer un crash pour un succes.
    results.push({ name: entry, code: run.status === null ? 1 : run.status, signal: run.signal })
}

console.log('\n═══ Recapitulatif ═══\n')

for (const result of results) {
    const state = result.code === 0
        ? '✓ vert'
        : `✗ ROUGE (exit ${result.code}${result.signal ? `, signal ${result.signal}` : ''})`

    console.log(`  ${state.padEnd(28)} ${result.name}`)
}

const failed = results.filter((result) => result.code !== 0)

if (!failed.length) {
    console.log(`\n✓ ${results.length}/${results.length} self-tests verts — les detecteurs des gardes mesurent encore.\n`)
    process.exit(0)
}

console.log(
    `\n✗ ${failed.length}/${results.length} self-test(s) en echec : ${failed.map((f) => f.name).join(', ')}.`
    + '\n  Un detecteur dont le self-test est rouge ne prouve plus rien : son garde'
    + '\n  peut etre vert parce qu\'il ne voit plus rien.\n'
)
process.exit(1)
