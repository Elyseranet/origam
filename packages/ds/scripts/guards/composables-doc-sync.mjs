#!/usr/bin/env node
/*********************************************************
 * Guard — composables-doc-sync
 *
 * @description
 * La reference des composables sous `packages/docs/composables/` est GENEREE
 * depuis les sources. Ce garde verifie qu'elle correspond encore a ce que le
 * code declare : ajouter, retirer ou renommer un export doit se refleter dans
 * la page, sinon la doc ment.
 *
 * @description
 * ⛔ C'est ce garde qui rend l'affirmation « page generee » vraie. Sans lui,
 * elle serait le meme mensonge que celui deja mesure dans ce depot :
 * `docs/guide/directives.md` se terminait par « cette liste est extraite
 * automatiquement de votre dossier src/directives » alors que RIEN ne
 * l'extrayait, et il manquait quatre directives sur six (corrige le
 * 2026-09-02). Une doc qui se declare generee et ne l'est pas est pire
 * qu'une doc absente : elle se fait croire.
 *
 * @description
 * Le garde compare les NOMS exportes et rien d'autre. Il n'essaie pas de
 * verifier les descriptions — celles-la vivent dans les bannieres du code,
 * et c'est la seule source. Regenerer :
 *
 *   node packages/ds/scripts/analysis/gen-composables-doc.mjs --write
 *
 * Run: `node packages/ds/scripts/guards/composables-doc-sync.mjs`
 ********************************************************/
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const REPO = path.resolve(HERE, '../../../..')
const COMPOSABLES = path.join(REPO, 'packages/ds/src/composables')
const DOCS = path.join(REPO, 'packages/docs/composables')

const walk = (dir, acc = []) => {
    for (const entry of readdirSync(dir)) {
        const full = path.join(dir, entry)
        if (statSync(full).isDirectory()) walk(full, acc)
        else if (full.endsWith('.composable.ts')) acc.push(full)
    }

    return acc
}

const expected = new Map()

for (const file of walk(COMPOSABLES)) {
    const domain = path.relative(COMPOSABLES, file).split(path.sep)[0]
    const source = readFileSync(file, 'utf8')

    for (const m of source.matchAll(/^export (?:function|const) ([A-Za-z0-9_]+)/gm)) {
        if (!expected.has(domain)) expected.set(domain, new Set())
        expected.get(domain).add(m[1])
    }
}

const problems = []

for (const [ domain, symbols ] of expected) {
    const page = path.join(DOCS, `${ domain }.md`)

    if (!existsSync(page)) {
        problems.push(`page absente : packages/docs/composables/${ domain }.md (${ symbols.size } symbole(s))`)
        continue
    }

    const documented = new Set(
        [ ...readFileSync(page, 'utf8').matchAll(/^## `([A-Za-z0-9_]+)`$/gm) ].map((m) => m[1])
    )

    for (const s of symbols) if (!documented.has(s)) problems.push(`${ domain }.md : \`${ s }\` exporte mais absent de la page`)
    for (const d of documented) if (!symbols.has(d)) problems.push(`${ domain }.md : \`${ d }\` documente mais plus exporte`)
}

const BAR = '─'.repeat(70)

console.log(BAR)
console.log('Guard: composables-doc-sync (la reference generee suit-elle les sources ?)')
console.log(BAR)

if (!problems.length) {
    const total = [ ...expected.values() ].reduce((a, s) => a + s.size, 0)
    console.log(`PASS — ${ total } symbole(s) sur ${ expected.size } domaine(s), tous presents dans la reference.`)
    console.log(BAR)
    process.exit(0)
}

for (const p of problems) console.log(`  ✗ ${ p }`)
console.log('')
console.log(`FAIL — ${ problems.length } ecart(s). Regenerer :`)
console.log('  node packages/ds/scripts/analysis/gen-composables-doc.mjs --write')
console.log(BAR)
process.exit(1)
