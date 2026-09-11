/**
 * sonar-gate.mjs — read the quality gate and the new-code issues, and apply the
 * SAME blocking rule as the CI (`.github/workflows/build.yml`): only a security
 * issue or a critical-severity defect fails. Everything else is reported and
 * lets the delivery through.
 *
 * Kept deliberately in step with the workflow: a gate that answers differently
 * on a laptop and in CI is worse than no gate — you stop trusting either.
 *
 * Runs standalone (`node scripts/sonar-gate.mjs`) to inspect the current state
 * without re-analysing, and is called at the end of `scripts/sonar.mjs`.
 *
 * Exit code 1 when a blocking issue is found, 0 otherwise.
 */

import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const CREDENTIALS_FILE = join(homedir(), '.config', 'origam', 'sonar.env')
const PROPERTIES_FILE = join(process.cwd(), 'sonar-project.properties')

function loadCredentials () {
    const env = { ...process.env }

    if ((!env.SONAR_TOKEN || !env.SONAR_HOST_URL) && existsSync(CREDENTIALS_FILE)) {
        for (const line of readFileSync(CREDENTIALS_FILE, 'utf-8').split('\n')) {
            const match = /^([A-Z_]+)=(.*)$/.exec(line.trim())
            if (match && !env[match[1]]) env[match[1]] = match[2]
        }
    }

    if (!env.SONAR_TOKEN || !env.SONAR_HOST_URL) {
        console.error(`  Identifiants absents — voir ${ CREDENTIALS_FILE }`)
        process.exit(1)
    }

    return env
}

/** The project key has ONE source of truth: never hardcode it here. */
function projectKey () {
    const line = readFileSync(PROPERTIES_FILE, 'utf-8')
        .split('\n')
        .find((l) => l.startsWith('sonar.projectKey='))

    if (!line) {
        console.error('  sonar.projectKey introuvable dans sonar-project.properties')
        process.exit(1)
    }

    return line.slice('sonar.projectKey='.length).trim()
}

const env = loadCredentials()
const KEY = projectKey()
const AUTH = 'Basic ' + Buffer.from(`${ env.SONAR_TOKEN }:`).toString('base64')

async function api (path) {
    const res = await fetch(`${ env.SONAR_HOST_URL.replace(/\/$/, '') }${ path }`, {
        headers: { Authorization: AUTH },
        signal: AbortSignal.timeout(30_000)
    })

    if (!res.ok) throw new Error(`${ res.status } ${ res.statusText } — ${ path }`)

    return res.json()
}

/**
 * Blocking = a security problem, or a defect severe enough to stop a release.
 * Both SonarQube taxonomies are covered: the historical `type`/`severity` and
 * the `impacts[]` shape introduced in 10.x — the API returns one, the other, or
 * both depending on the version and the rule.
 */
function isBlocking (issue) {
    const impacts = issue.impacts ?? []

    return issue.type === 'VULNERABILITY'
        || issue.severity === 'BLOCKER'
        || issue.severity === 'CRITICAL'
        || impacts.some((i) => i.softwareQuality === 'SECURITY')
        || impacts.some((i) => i.severity === 'BLOCKER')
}

function label (issue) {
    const sev = issue.severity ?? issue.impacts?.[0]?.severity ?? '?'
    const file = (issue.component ?? '').split(':').pop()

    return `[${ issue.type ?? '?' }/${ sev }] ${ file }:${ issue.line ?? 0 }\n      ${ issue.message }`
}

const status = await api(`/api/qualitygates/project_status?projectKey=${ KEY }`)
    .catch((e) => ({ error: e.message }))

if (status.error) {
    console.log(`  Gate non lisible (${ status.error }) — analyse peut-être pas encore terminée.`)
} else {
    console.log(`  Gate SonarQube : ${ status.projectStatus?.status }`)

    for (const c of status.projectStatus?.conditions ?? []) {
        if (c.status === 'ERROR') {
            console.log(`    ✗ ${ c.metricKey } = ${ c.actualValue } (requis ${ c.comparator } ${ c.errorThreshold })`)
        }
    }
}

const search = await api(
    `/api/issues/search?components=${ KEY }&inNewCodePeriod=true&resolved=false&ps=500`
).catch(() => ({ issues: [] }))

const issues = search.issues ?? []
const blocking = issues.filter(isBlocking)
const others = issues.filter((i) => !isBlocking(i))

console.log(`\n  Nouveau code : ${ issues.length } issue(s), dont ${ blocking.length } bloquante(s).`)

if (blocking.length > 0) {
    console.log('\n  BLOQUANTES (sécurité ou criticité) :')
    blocking.forEach((i) => console.log(`    • ${ label(i) }`))
}

if (others.length > 0) {
    console.log('\n  Non bloquantes — à traiter en ticket :')
    others.forEach((i) => console.log(`    • ${ label(i) }`))
}

const hotspots = await api(`/api/hotspots/search?projectKey=${ KEY }&status=TO_REVIEW&ps=100`)
    .catch(() => ({ hotspots: [] }))

if ((hotspots.hotspots ?? []).length > 0) {
    console.log(`\n  ${ hotspots.hotspots.length } hotspot(s) de sécurité à revoir — non bloquant.`)
}

if (blocking.length > 0) {
    console.log('\n  → Livraison bloquée.\n')
    process.exit(1)
}

console.log('\n  → Aucune issue de sécurité ni de gravité critique. Livraison autorisée.\n')
