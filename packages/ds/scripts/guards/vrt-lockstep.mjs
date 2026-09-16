#!/usr/bin/env node
/*********************************************************
 * Guard — vrt-lockstep (#606)
 *
 * @description
 * `packages/tests/vrt/vrt-docker.sh` et le job `vrt` de
 * `.github/workflows/ci.yml` doivent executer LA MEME recette : la meme
 * image Playwright, et la meme suite ordonnee de commandes `pnpm`. C'est
 * ce qui fait qu'un verdict local et un verdict CI sont le meme verdict.
 *
 * @description
 * ⛔ POURQUOI CE GARDE EXISTE. #606 : « un script d'outillage que rien
 * n'exerce est une doc mensongere executable ». La CI n'appelle pas ce
 * script — elle rejoue ses etapes en ligne — donc seul un lancement local
 * l'exerce, et il a derive sans que personne ne le voie : un
 * `pnpm -F origam tokens:build` supprime le 2026-08-31 y est reste plus de
 * deux semaines, sans jamais faire echouer quoi que ce soit.
 *
 * @description
 * Le script ne PEUT pas etre cable a la CI : le job `vrt` tourne deja dans
 * le conteneur epingle, il ne peut donc pas lancer un `docker run`. Ce
 * garde est la reponse a cette contrainte — il surveille le CONTRAT entre
 * les deux surfaces, ce qui est le seul angle par lequel la CI peut tenir
 * un fichier qu'elle n'execute jamais.
 *
 * @description
 * Le script portait deja l'assertion, en toutes lettres dans son en-tete :
 * « The container steps below MUST stay in lockstep with the `vrt` job in
 * .github/workflows/ci.yml ». Elle n'etait verifiee par personne. Une
 * assertion que rien ne verifie est un commentaire, pas une garantie.
 *
 * @description
 * La version de Playwright est lue dans `pnpm-lock.yaml` et non dans
 * `package.json` : la plage `^1.48.0` qui y est declaree n'est pas ce que
 * `--frozen-lockfile` installera, et le script lui-meme resout la version
 * INSTALLEE, precisement pour eviter cet ecart. Le lockfile est aussi
 * toujours versionne, donc lisible sans `node_modules`.
 *
 * Run: `node packages/ds/scripts/guards/vrt-lockstep.mjs`
 ********************************************************/
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
    playwrightVersionFromLock,
    extractJobBlock,
    imageVersionFromJob,
    pnpmStepsFromJob,
    pnpmStepsFromDockerScript
} from './lib/vrt-lockstep.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(HERE, '../../../..')

const WORKFLOW = path.join(ROOT, '.github', 'workflows', 'ci.yml')
const SCRIPT = path.join(ROOT, 'packages', 'tests', 'vrt', 'vrt-docker.sh')
const LOCKFILE = path.join(ROOT, 'pnpm-lock.yaml')

const offenders = []

console.log('──────────────────────────────────────────────────────────────────────')
console.log('Guard: vrt-lockstep (le script VRT local et le job CI executent la meme recette)')
console.log('──────────────────────────────────────────────────────────────────────')

/*********************************************************
 * Absence d'une surface = echec, jamais un silence
 *
 * @description
 * Un garde qui se tait quand son entree manque rend `exit 0` sur un depot
 * ou le fichier surveille a ete supprime ou renomme. C'est le faux vert
 * que #574 decrit, reproduit dans l'outil cense le prevenir.
 ********************************************************/
for (const [label, file] of [['workflow CI', WORKFLOW], ['script VRT', SCRIPT], ['lockfile', LOCKFILE]]) {
    if (!existsSync(file)) offenders.push(`${label} introuvable : ${path.relative(ROOT, file)}`)
}

if (!offenders.length) {
    const yml = readFileSync(WORKFLOW, 'utf8')
    const sh = readFileSync(SCRIPT, 'utf8')
    const lock = readFileSync(LOCKFILE, 'utf8')

    const job = extractJobBlock(yml, 'vrt')

    if (!job) {
        offenders.push('aucun job `vrt` dans .github/workflows/ci.yml — le job a ete renomme ou retire')
    } else {
        const { versions } = playwrightVersionFromLock(lock)
        const imageVersion = imageVersionFromJob(job)

        if (!imageVersion) {
            offenders.push('le job `vrt` ne reference aucune image `mcr.microsoft.com/playwright:vX.Y.Z-*`')
        } else if (versions.length !== 1) {
            offenders.push(
                `pnpm-lock.yaml resout ${versions.length} version(s) de @playwright/test (${versions.join(', ') || 'aucune'})`
                + ' — impossible de dire laquelle le conteneur installera'
            )
        } else if (versions[0] !== imageVersion) {
            offenders.push(
                `image du job \`vrt\` = v${imageVersion}, mais pnpm-lock.yaml installera @playwright/test ${versions[0]}.`
                + ' Les baselines ont ete capturees dans UNE image ; comparer dans une autre reintroduit'
                + ' exactement la derive de police/anti-aliasing que ce job existe pour eliminer.'
            )
        }

        const ciSteps = pnpmStepsFromJob(job)
        const shSteps = pnpmStepsFromDockerScript(sh, 'test')

        if (JSON.stringify(ciSteps) !== JSON.stringify(shSteps)) {
            offenders.push(
                'les commandes `pnpm` du conteneur ont diverge de celles du job CI.\n'
                + `      job CI (.github/workflows/ci.yml) :\n${ciSteps.map((s) => `        ${s}`).join('\n') || '        (aucune)'}\n`
                + `      script (packages/tests/vrt/vrt-docker.sh, mode test) :\n${shSteps.map((s) => `        ${s}`).join('\n') || '        (aucune)'}`
            )
        }
    }
}

if (offenders.length) {
    for (const offender of offenders) console.error(`  ✘ ${offender}`)

    console.error('')
    console.error(`FAIL — ${offenders.length} divergence(s) entre le script VRT local et le job CI.`)
    console.error('  La CI n\'execute PAS vrt-docker.sh : elle rejoue ses etapes en ligne.')
    console.error('  Rien d\'autre que ce garde ne rapproche les deux — c\'est ainsi qu\'un')
    console.error('  `tokens:build` supprime y a survecu plus de deux semaines (#606).')
    console.error('──────────────────────────────────────────────────────────────────────')
    process.exit(1)
}

console.log('PASS — image epinglee et suite de commandes identiques des deux cotes.')
console.log('──────────────────────────────────────────────────────────────────────')
