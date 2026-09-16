#!/usr/bin/env node
/*********************************************************
 * Self-test — vrt-lockstep (#606)
 *
 * @description
 * Un garde qui ne signale rien est indiscernable d'un garde qui ne mesure
 * rien. Ce fichier est le temoin : des textes dont on SAIT ce que
 * l'extraction doit en tirer, et des cas ou elle doit voir la DIVERGENCE.
 *
 * Run: `node packages/ds/scripts/guards/lib/vrt-lockstep.selftest.mjs`
 ********************************************************/
import {
    playwrightVersionFromLock,
    extractJobBlock,
    imageVersionFromJob,
    pnpmStepsFromJob,
    pnpmStepsFromDockerScript,
    PLUMBING_PREFIXES,
    isPlumbing
} from './vrt-lockstep.mjs'

const YML = [
    'jobs:',
    '  build:',
    '    runs-on: ubuntu-latest',
    '    steps:',
    '      - run: pnpm -F origam build',
    '  vrt:',
    '    name: Visual regression',
    '    container:',
    '      image: mcr.microsoft.com/playwright:v1.59.1-jammy',
    '    steps:',
    '      - uses: actions/checkout@v7',
    '      - name: Install',
    '        run: pnpm install --frozen-lockfile',
    '      - name: Build',
    '        run: pnpm -F @origam/stories build',
    '      - name: Run',
    '        run: pnpm -F @origam/tests exec playwright test --config=playwright.vrt.config.ts',
    '  after:',
    '    runs-on: ubuntu-latest'
].join('\n')

const SH = [
    'CONTAINER_CMD=\'',
    'set -euo pipefail',
    'corepack enable',
    'pnpm install --frozen-lockfile',
    'pnpm -F @origam/stories build',
    '\'',
    '',
    'if [ "$MODE" = "update" ]; then',
    '    CONTAINER_CMD+=\'pnpm -F @origam/tests exec playwright test --config=playwright.vrt.config.ts --update-snapshots\'',
    'else',
    '    CONTAINER_CMD+=\'pnpm -F @origam/tests exec playwright test --config=playwright.vrt.config.ts\'',
    'fi'
].join('\n')

const EXPECTED = [
    'pnpm install --frozen-lockfile',
    'pnpm -F @origam/stories build',
    'pnpm -F @origam/tests exec playwright test --config=playwright.vrt.config.ts'
]

let failures = 0

/** Compare deux valeurs serialisees et compte l'ecart. */
function check (label, actual, expected) {
    const a = JSON.stringify(actual)
    const e = JSON.stringify(expected)

    if (a === e) return

    console.error(`✘ ${label}\n    attendu : ${e}\n    obtenu  : ${a}`)
    failures++
}

/*********************************************************
 * RAPPEL — les formes qui doivent etre lues correctement
 ********************************************************/
const job = extractJobBlock(YML, 'vrt')

check('le bloc du job `vrt` s\'arrete avant le job suivant', job !== null && !job.includes('after:'), true)
check('le bloc du job `vrt` n\'avale pas le job precedent', job !== null && !job.includes('pnpm -F origam build'), true)
check('version de l\'image du job', imageVersionFromJob(job), '1.59.1')
check('commandes pnpm du job, dans l\'ordre', pnpmStepsFromJob(job), EXPECTED)
check('commandes pnpm du script, mode test', pnpmStepsFromDockerScript(SH, 'test'), EXPECTED)
check('commandes pnpm du script, mode update', pnpmStepsFromDockerScript(SH, 'update'), [
    EXPECTED[0],
    EXPECTED[1],
    `${EXPECTED[2]} --update-snapshots`
])
check('version verrouillee dans le lockfile', playwrightVersionFromLock("  '@playwright/test@1.59.1':\n").versions, ['1.59.1'])

/*********************************************************
 * PRECISION — les divergences que l'extraction doit rendre VISIBLES
 *
 * @description
 * C'est la moitie qui compte. Un extracteur qui normalise tout finirait
 * par declarer identiques deux surfaces qui ont diverge, et le garde
 * deviendrait le faux vert qu'il est cense empecher.
 ********************************************************/
const DRIFTED_YML = YML.replace('v1.59.1-jammy', 'v1.60.0-jammy')
check('une image qui derive est vue', imageVersionFromJob(extractJobBlock(DRIFTED_YML, 'vrt')), '1.60.0')

const DEAD_STEP_SH = SH.replace('pnpm -F @origam/stories build', 'pnpm -F origam tokens:build\npnpm -F @origam/stories build')
check('une etape en trop dans le script est vue', pnpmStepsFromDockerScript(DEAD_STEP_SH, 'test'), [
    EXPECTED[0],
    'pnpm -F origam tokens:build',
    EXPECTED[1],
    EXPECTED[2]
])

const REORDERED_YML = YML
    .replace('        run: pnpm install --frozen-lockfile', '        run: pnpm -F @origam/stories build')
    .replace('        run: pnpm -F @origam/stories build\n      - name: Run', '        run: pnpm install --frozen-lockfile\n      - name: Run')
check('un ordre inverse est vu', pnpmStepsFromJob(extractJobBlock(REORDERED_YML, 'vrt'))[0], 'pnpm -F @origam/stories build')

const MULTILINE_YML = YML.replace(
    '        run: pnpm install --frozen-lockfile',
    '        run: |\n          pnpm install --frozen-lockfile'
)
check('la forme `run: |` est lue comme la forme en ligne', pnpmStepsFromJob(extractJobBlock(MULTILINE_YML, 'vrt')), EXPECTED)

check('deux versions de playwright dans le lockfile sont toutes deux vues',
    playwrightVersionFromLock("  '@playwright/test@1.59.1':\n  '@playwright/test@1.60.0':\n").versions,
    ['1.59.1', '1.60.0'])

/*********************************************************
 * PLOMBERIE — l'exclusion doit etre etroite, et le rester
 *
 * @description
 * `pnpm config set store-dir` n'a pas d'equivalent en commande cote CI
 * (c'est le `cache: pnpm` de setup-node) : le comparer rougirait en
 * permanence sur deux surfaces alignees. Mais l'exclusion doit s'arreter
 * la — d'ou le cas negatif : un `pnpm config set` est ecarte, un
 * `pnpm install` reste compare. Elargir la liste pour faire taire un rouge
 * fabriquerait le faux vert que le garde existe pour empecher.
 ********************************************************/
check('la liste d\'exclusion n\'a qu\'une entree', PLUMBING_PREFIXES, ['pnpm config set '])
check('`pnpm config set store-dir` est de la plomberie', isPlumbing('pnpm config set store-dir /pnpm-store'), true)
check('`pnpm install --frozen-lockfile` n\'en est PAS', isPlumbing('pnpm install --frozen-lockfile'), false)
check('`pnpm -F origam tokens:build` n\'en est PAS', isPlumbing('pnpm -F origam tokens:build'), false)

const PLUMBED_SH = SH.replace(
    'pnpm install --frozen-lockfile',
    'pnpm config set store-dir /pnpm-store\npnpm install --frozen-lockfile'
)
check('la plomberie du script ne cree pas de fausse divergence',
    pnpmStepsFromDockerScript(PLUMBED_SH, 'test'), EXPECTED)

const total = 18

if (failures) {
    console.error(`\nvrt-lockstep self-test : ${failures}/${total} cas en echec.`)
    process.exit(1)
}

console.log(`✔ vrt-lockstep self-test : ${total}/${total} cas (7 rappel, 6 precision, 5 plomberie).`)
