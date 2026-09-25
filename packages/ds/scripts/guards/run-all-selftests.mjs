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
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { discoverSelftests, findOrphanSelftests } from './lib/selftest-discovery.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SCRIPTS = path.resolve(HERE, '..')

/*********************************************************
 * ⛔ DEUX NIVEAUX, PAS UN SEUL (#964)
 *
 * @description
 * Ce runner ne lisait que `lib/`. Cinq self-tests vivent au niveau `guards/`
 * et n'etaient donc invoques par RIEN — dont celui de `token-var-channels`,
 * le garde le plus sollicite du depot. La decouverte vit desormais dans
 * `lib/selftest-discovery.mjs`, qui porte le detail de la mesure.
 ********************************************************/
const selftests = discoverSelftests(HERE)

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
    console.error(`✗ Aucun *.selftest.mjs trouve sous ${HERE} — le repertoire a bouge, ou les self-tests ont disparu.`)
    process.exit(1)
}

/*********************************************************
 * ⛔ CONTROLE ANTI-RECIDIVE (#964)
 *
 * @description
 * Un `*.selftest.mjs` range ailleurs que sur les deux niveaux decouverts est
 * un detecteur que rien n'execute — exactement l'etat dans lequel cinq
 * fichiers ont vecu jusqu'a #964, sans que personne le sache. On echoue AVANT
 * d'executer quoi que ce soit : un recapitulatif « tout vert » sur une liste
 * incomplete est pire qu'un rouge, puisqu'il affiche une garantie absente.
 ********************************************************/
const orphans = findOrphanSelftests(SCRIPTS, HERE)

if (orphans.length) {
    console.error(
        `✗ ${orphans.length} self-test(s) que ce runner ne decouvrirait PAS :\n`
        + orphans.map((o) => `    scripts/${o}`).join('\n')
        + '\n\n  Un self-test qu\'aucun runner n\'execute est une garantie affichee qui n\'existe pas :'
        + '\n  son detecteur peut avoir regresse depuis des mois, `guards` comme `guards:self`'
        + '\n  resteraient verts (#964). Deplacez-le dans `scripts/guards/` ou `scripts/guards/lib/`,'
        + '\n  ou ajoutez son niveau a DISCOVERED_LEVELS dans lib/selftest-discovery.mjs.\n'
    )
    process.exit(1)
}

const results = []

for (const entry of selftests) {
    const run = spawnSync(process.execPath, [path.join(HERE, entry)], { stdio: 'inherit' })
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
