#!/usr/bin/env node
/**
 * Runs every architecture guard and reports a combined summary. Each guard
 * is a standalone script (`node scripts/guards/{guard}.mjs`) — this file
 * only sequences them so CI and local runs get one exit code and one
 * legible summary instead of four separate invocations.
 *
 * See packages/ds/scripts/guards/README.md for what each guard checks, how
 * to read a failure, and how to retire a baseline entry once fixed.
 */

import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const GUARDS = [
    'no-declarations-in-vue.mjs',
    'no-variant-css.mjs',
    'instance-types.mjs',
    'file-naming.mjs',
    'unconsumed-props.mjs',
    'raw-props-usage.mjs',
    'no-usedefaults-in-components.mjs',
    'emits-completeness.mjs',
    'layer-folders.mjs',
    'seed-source-paths.mjs',
    'comment-format.mjs'
]

/*********************************************************
 * Racine auditee — affichee, et comparee au repertoire courant
 *
 * @description
 * Chaque garde derive sa racine de `__dirname`, c'est-a-dire de l'endroit
 * ou LE SCRIPT est installe — jamais du repertoire courant. Invoquer
 * `node /chemin/absolu/vers/le/depot/principal/.../run-all.mjs` depuis un
 * autre arbre (un worktree, par exemple) audite donc le depot principal et
 * annonce « 11/11 » avec aplomb, alors que le code reellement present dans
 * l'arbre appelant n'a jamais ete regarde.
 *
 * @description
 * C'est le pire genre de faux negatif : il ressemble a un resultat propre
 * et complet. Constate pendant le pilote d'inspection #364 — un agent dont
 * le worktree etait anterieur a l'introduction des gardes a obtenu 11/11 en
 * appelant la copie du depot principal, sur un fichier qui violait
 * activement un garde a baseline zero.
 *
 * @description
 * Le correctif n'est pas de basculer sur `cwd` — `__dirname` est le bon
 * choix, il rend le script appelable de partout. Le correctif est de DIRE
 * quelle racine a ete auditee, et d'avertir bruyamment quand l'appelant
 * n'est pas dedans.
 ********************************************************/
const AUDITED_ROOT = path.resolve(__dirname, '../../../..')
const cwd = process.cwd()

console.log(`Racine auditee : ${AUDITED_ROOT}`)

if (!cwd.startsWith(AUDITED_ROOT)) {
    console.log('')
    console.log('⛔ ATTENTION — le repertoire courant n\'est PAS dans la racine auditee.')
    console.log(`   courant : ${cwd}`)
    console.log('   Les gardes vont analyser la racine ci-dessus, PAS votre arbre.')
    console.log('   Lancez-les depuis une copie qui contient elle-meme scripts/guards/.')
    console.log('')
}

let failed = 0
const started = Date.now()

for (const guard of GUARDS) {
    try {
        execFileSync('node', [path.join(__dirname, guard)], { stdio: 'inherit' })
    } catch {
        failed++
    }
}

const elapsedMs = Date.now() - started
console.log(`\n${GUARDS.length - failed}/${GUARDS.length} guards passed in ${(elapsedMs / 1000).toFixed(1)}s.`)

process.exit(failed > 0 ? 1 : 0)
