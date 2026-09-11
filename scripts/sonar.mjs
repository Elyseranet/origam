/**
 * sonar.mjs — run the SonarQube analysis locally, without going through GitHub.
 *
 * Same scanner as the CI (`sonarsource/sonar-scanner-cli`, the image behind
 * `SonarSource/sonarqube-scan-action`), same `sonar-project.properties`, same
 * project key. The point is that a local run and a CI run cannot disagree:
 * anything that reds the pipeline can be reproduced here first.
 *
 * Coverage is regenerated BEFORE the scan, deliberately. `sonar-project.properties`
 * points `sonar.javascript.lcov.reportPaths` at `coverage/lcov.info`; publishing
 * a stale report would attribute yesterday's numbers to today's code — a lie
 * that then blocks (or wrongly unblocks) the quality gate. Skip it with
 * `--skip-coverage` only when you have just produced the report yourself.
 *
 * Credentials are read from, in order:
 *   1. the process environment (SONAR_TOKEN / SONAR_HOST_URL)
 *   2. ~/.config/origam/sonar.env
 *
 * They are deliberately NOT read from the repository's `.env`: that file is
 * tracked by git and this repository is public — a token written there would be
 * published at the next commit.
 *
 * Usage:
 *   pnpm run sonar
 *   pnpm run sonar -- --skip-coverage
 */

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const ROOT = process.cwd()
const CREDENTIALS_FILE = join(homedir(), '.config', 'origam', 'sonar.env')
const SCANNER_IMAGE = 'sonarsource/sonar-scanner-cli:latest'

function loadCredentials () {
    const env = { ...process.env }

    if ((!env.SONAR_TOKEN || !env.SONAR_HOST_URL) && existsSync(CREDENTIALS_FILE)) {
        for (const line of readFileSync(CREDENTIALS_FILE, 'utf-8').split('\n')) {
            const match = /^([A-Z_]+)=(.*)$/.exec(line.trim())
            if (match && !env[match[1]]) env[match[1]] = match[2]
        }
    }

    const missing = ['SONAR_TOKEN', 'SONAR_HOST_URL'].filter((key) => !env[key])

    if (missing.length > 0) {
        console.error(`\n  Manquant : ${ missing.join(', ') }`)
        console.error(`  Renseigne-les dans l'environnement, ou dans ${ CREDENTIALS_FILE } :`)
        console.error('    SONAR_HOST_URL=http://…')
        console.error('    SONAR_TOKEN=sqp_…')
        console.error("\n  N'utilise PAS le .env du dépôt : il est versionné et le dépôt est public.\n")
        process.exit(1)
    }

    return env
}

function run (command, args, options = {}) {
    execFileSync(command, args, { stdio: 'inherit', cwd: ROOT, ...options })
}

const skipCoverage = process.argv.includes('--skip-coverage')
const env = loadCredentials()

try {
    run('docker', ['info'], { stdio: 'ignore' })
} catch {
    console.error('\n  Docker ne répond pas — le scanner officiel tourne dans son image.')
    console.error('  Démarre Docker, puis relance.\n')
    process.exit(1)
}

if (skipCoverage) {
    console.log('\n▶ Couverture : ignorée (--skip-coverage)')
} else {
    console.log('\n▶ Régénération de la couverture…')
    run('pnpm', ['-F', '@origam/tests', 'run', 'test:coverage'])
}

const lcov = join(ROOT, 'coverage', 'lcov.info')

if (!existsSync(lcov)) {
    console.error(`\n  ${ lcov } introuvable — Sonar publierait 0 % de couverture.`)
    console.error('  Relance sans --skip-coverage.\n')
    process.exit(1)
}

console.log('\n▶ Analyse SonarQube (scanner officiel, conteneur)…')

run('docker', [
    'run', '--rm',
    '-e', `SONAR_HOST_URL=${ env.SONAR_HOST_URL }`,
    '-e', `SONAR_TOKEN=${ env.SONAR_TOKEN }`,
    // The scanner resolves every path in sonar-project.properties relative to
    // this directory, so the whole workspace is mounted — sources, tests and
    // the lcov report all live under it.
    '-v', `${ ROOT }:/usr/src`,
    SCANNER_IMAGE
])

console.log('\n▶ Analyse envoyée. Verdict du gate :\n')

run('node', [join(ROOT, 'scripts', 'sonar-gate.mjs')])
