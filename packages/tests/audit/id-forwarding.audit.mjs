#!/usr/bin/env node
/**
 * id-forwarding.audit.mjs — le compagnon RUNTIME de la garde 15.
 *
 * `packages/ds/scripts/guards/lib/id-forwarding.mjs` renvoyait deja vers ce
 * fichier, deux fois, comme s'il existait. Il n'existait pas. Une reference a
 * un artefact inexistant se lit comme une couverture existante : un lecteur de
 * la garde en conclut « le reste est couvert ailleurs ». Non — le mecanisme
 * qu'elle exclut n'avait aucune couverture, ni statique ni runtime.
 *
 * CE QU'IL DECIDE, QUE LA GARDE NE PEUT PAS DECIDER
 * -------------------------------------------------
 * La garde est une analyse statique : elle detecte un id GENERE qui ecrase
 * celui du consommateur, via la forme textuelle `:id="id"`. Le mecanisme
 * restant se caracterise par l'ABSENCE de binding — il n'a aucune forme a
 * detecter. Seul un montage tranche.
 *
 * Sortie : tableau par verdict, liste des composants qui PERDENT l'id, et
 * code de sortie non nul s'il y en a. Un audit qui ne peut pas echouer
 * n'observe rien.
 *
 * Usage :
 *   pnpm -F @origam/tests audit:id-forwarding
 *   pnpm -F @origam/tests audit:id-forwarding -- --json /tmp/id.json
 *
 * Pas de sharding, contrairement a l'audit inert-props : celui-ci monte
 * chaque composant UNE fois (~190 montages), la ou l'autre en fait ~10 000.
 */

import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const PKG = join(HERE, '..')

const outFlag = process.argv.indexOf('--json')
const outPath = outFlag >= 0 ? process.argv[outFlag + 1] : null

const tmp = mkdtempSync(join(tmpdir(), 'origam-idfwd-'))
const report = join(tmp, 'report.json')

/*
 * On distingue deux echecs que `execFileSync` confond en un seul code non nul :
 * la sonde a PLANTE (rien a interpreter) ou la sonde a TOURNE et trouve des
 * defauts. Confondre les deux ferait passer un audit casse pour un audit qui
 * accuse — l'inverse exact de ce qu'un audit doit garantir.
 */
let rows
try {
    try {
        execFileSync(
            'npx',
            ['vitest', '--run', '--config=vitest.audit.config.ts', 'audit/id-forwarding-sweep.spec.ts'],
            {
                cwd: PKG,
                stdio: ['ignore', 'ignore', 'inherit'],
                env: { ...process.env, ID_FORWARDING_REPORT: report }
            }
        )
    } catch {
        // laisse la lecture du rapport trancher : s'il existe, la sonde est
        // allee au bout et l'echec vitest est secondaire.
    }
    try {
        rows = JSON.parse(readFileSync(report, 'utf8')).rows
    } catch {
        console.error('')
        console.error('ERREUR — la sonde n a produit aucun rapport : elle a plante avant la fin.')
        console.error('Ce n est PAS un verdict sur les composants. Voir la sortie vitest ci-dessus.')
        process.exit(2)
    }
} finally {
    rmSync(tmp, { recursive: true, force: true })
}

const by = (v) => rows.filter((r) => r.verdict === v).map((r) => r.component).sort()

const lost = by('lost')
const undecided = [...by('unmountable'), ...by('not-rendered')]
const timingTrap = rows.filter((r) => !r.immediate && (r.verdict === 'root' || r.verdict === 'descendant'))

console.log('')
console.log(`composants declarant une prop id : ${rows.length}`)
console.log('')
console.log('verdict'.padEnd(16) + 'n'.padStart(4))
for (const v of ['root', 'descendant', 'lost', 'unmountable', 'not-rendered']) {
    console.log(v.padEnd(16) + String(by(v).length).padStart(4))
}

console.log('')
console.log('root       — l id est celui de l element racine')
console.log('descendant — l id est ailleurs dans l arbre (legitime : un champ')
console.log('             le pose sur son <input>, cible du <label for>)')
console.log('lost       — DEFAUT : prop acceptee, jetee')

if (timingTrap.length) {
    console.log('')
    console.log(`PIEGE DE TIMING — ${timingTrap.length} composant(s) n ont PAS l id au premier`)
    console.log('rendu et l ont apres stabilisation. Un audit qui lit le DOM sans')
    console.log('attendre les declarerait morts a tort :')
    for (const r of timingTrap) console.log(`  ${r.component}`)
}

if (undecided.length) {
    console.log('')
    console.log(`INDECIDABLES — ${undecided.length} (non montables isolement, ou ne rendent rien).`)
    console.log('Ils ne sont NI sains NI defectueux : ils ne sont pas mesures.')
    for (const c of undecided) console.log(`  ${c}`)
}

if (outPath) {
    writeFileSync(outPath, JSON.stringify({ rows }, null, 2))
    console.log(`\nwrote ${outPath}`)
}

console.log('')
if (lost.length) {
    console.log(`FAIL — ${lost.length} composant(s) acceptent une prop id et la jettent :`)
    for (const c of lost) console.log(`  ${c}`)
    console.log('')
    console.log('Correctif type : passer `() => props.id` en 2e argument de useStyle,')
    console.log('et binder `:id="id"` sur la racine.')
    process.exit(1)
}

console.log('PASS — chaque composant qui declare une prop id la fait atteindre le DOM.')
