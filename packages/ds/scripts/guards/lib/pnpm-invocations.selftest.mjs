#!/usr/bin/env node
/*********************************************************
 * Self-test — pnpm-invocations (#574)
 *
 * @description
 * Un garde qui ne signale rien est indiscernable d'un garde qui ne mesure
 * rien. C'est exactement le defaut que #574 decrit ; le reproduire en le
 * corrigeant serait couteux. Ce fichier est le temoin : des lignes dont on
 * SAIT ce que l'analyseur doit en tirer, dans les deux sens.
 *
 * @description
 * RAPPEL (MUST_PARSE) — les formes qui doivent produire un couple
 * `{ target, script }` verifiable. PRECISION (MUST_IGNORE) — les formes qui
 * ne doivent RIEN produire a verifier : sous-commandes natives, appels non
 * filtres, `--if-present`, variables de shell.
 *
 * Run: `node packages/ds/scripts/guards/lib/pnpm-invocations.selftest.mjs`
 ********************************************************/
import { parseFilteredPnpmCalls, normaliseFilterTarget, isCommentLine } from './pnpm-invocations.mjs'

/** Couples `{target, script}` de kind `script` extraits d'une ligne. */
function scriptCalls (line) {
    if (isCommentLine(line)) return []

    return parseFilteredPnpmCalls(line).filter((call) => call.kind === 'script')
}

const MUST_PARSE = [
    ['forme courte', 'pnpm -F origam build', 'origam', 'build'],
    ['forme longue', 'pnpm --filter @origam/tests test:unit:run', '@origam/tests', 'test:unit:run'],
    ['filtre colle', 'pnpm --filter=@origam/docs dev', '@origam/docs', 'dev'],
    ['sous-commande run explicite', 'pnpm -F origam run type-check', 'origam', 'type-check'],
    ['flag recursif avant le filtre', 'pnpm -r -F @origam/tests test:coverage', '@origam/tests', 'test:coverage'],
    ['valeur JSON avec guillemet et virgule', '    "test:e2e": "pnpm -F @origam/tests test:e2e",', '@origam/tests', 'test:e2e'],
    ['arguments apres le script', 'pnpm -F @origam/tests test:unit --coverage', '@origam/tests', 'test:unit'],
    ['dans une chaine de shell', 'corepack enable && pnpm -F origam tokens:build', 'origam', 'tokens:build'],
    ['selecteur de dependances', 'pnpm -F origam... build', 'origam', 'build'],
    ['redirection apres le script', 'pnpm -F @origam/marketing docs:sync 2>/dev/null', '@origam/marketing', 'docs:sync']
]

const MUST_IGNORE = [
    ['sous-commande exec', 'pnpm -F @origam/tests exec playwright test --project=chromium'],
    ['sous-commande install', 'pnpm -F @origam/marketing install'],
    ['sous-commande add', 'pnpm -F origam add lodash'],
    ['appel NON filtre (pnpm y sort deja 1)', 'pnpm run build:lib'],
    ['appel recursif sans filtre', 'pnpm -r build'],
    ['--if-present autorise explicitement l absence', 'pnpm -F origam --if-present rien'],
    ['nom de script interpole', 'pnpm -F origam $SCRIPT'],
    ['ligne entierement commentee (YAML)', '    # nothing here ever ran `pnpm -F @origam/marketing build`'],
    ['ligne entierement commentee (shell)', '# pnpm -F origam tokens:build'],
    ['mention sans filtre dans une commande docker', 'docker run --rm image bash -c "pnpm install --frozen-lockfile"']
]

let failures = 0

for (const [label, line, target, script] of MUST_PARSE) {
    const calls = scriptCalls(line)
    const hit = calls.find((call) => normaliseFilterTarget(call.target).target === target && call.script === script)

    if (hit) continue

    console.error(`✘ RAPPEL manque — « ${label} » : attendu ${target} / ${script}, obtenu ${JSON.stringify(calls)}`)
    failures++
}

for (const [label, line] of MUST_IGNORE) {
    const calls = scriptCalls(line)

    if (!calls.length) continue

    console.error(`✘ PRECISION perdue — « ${label} » : faux positif ${JSON.stringify(calls)}`)
    failures++
}

const total = MUST_PARSE.length + MUST_IGNORE.length

if (failures) {
    console.error(`\npnpm-invocations self-test : ${failures}/${total} cas en echec.`)
    process.exit(1)
}

console.log(`✔ pnpm-invocations self-test : ${total}/${total} cas (${MUST_PARSE.length} rappel, ${MUST_IGNORE.length} precision).`)
