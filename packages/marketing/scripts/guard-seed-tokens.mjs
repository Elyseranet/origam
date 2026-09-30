#!/usr/bin/env node
/*********************************************************
 * guard-seed-tokens.mjs — the catalogue may not document a token the design
 * system does not declare, nor name a tool that was removed (#960).
 *
 * @description
 * WHAT IT CHECKS, IN TWO CHANNELS.
 * @description
 * NOTATION — every `kind_extra.tokens.excerpt[].tokenPath` in
 * `server/db/seed/component.json` must be a `--origam-…` variable that one of
 * the hand-maintained sheets really declares, carrying the value the sheet
 * gives it. This channel is HARD: a finding fails the run outright, with no
 * baseline, because the correction is mechanical
 * (`node scripts/sync-token-excerpts.mjs`).
 * @description
 * RETIRED TOOLING — no seed field may name the Style Dictionary / Tokens
 * Studio pipeline, the deleted `packages/ds/tokens/` sources or the deleted
 * `packages/figma-plugin/`. This channel is BASELINED, and the baseline is
 * not empty — see `baseline/seed-tokens.json` for what is in it and why.
 *
 * @description
 * ⛔ THE SCAN COVERS ALL EIGHT SEED FILES, not `component.json` alone. Scoping
 * it to the components missed a real one: `const.json`'s `GRID_GAP_SIZE_VAR`
 * described its five variables as "emitted by Style Dictionary from
 * tokens/component/grid.json" — a generator and a file that both stopped
 * existing on 2026-08-31, in a `description_fallback` the const's own detail
 * page renders. Nothing in the components would ever have shown it.
 *
 * @description
 * WHY A GUARD AT ALL. This data is a COMMITTED ARTEFACT that nothing
 * regenerates from the design system: `kind_extra` is absent from
 * `RESYNC_POLICY.components` in `generate-api-docs.mjs`, so `docs:sync` never
 * looks at it. The pipeline was removed on 2026-08-31 and the catalogue went
 * on describing it for a month — through #922, through its residue PR #959,
 * and through `3626450ca`, which repaired the `sourceFile` paths of these very
 * blocks while leaving the notation beside them untouched. Nothing was going
 * to notice; three passes over the same lines did not.
 *
 * @description
 * WHY IT IS NOT A MEMBER OF `pnpm -F origam guards`. That suite audits
 * `packages/ds/src` — the published component library. This is marketing
 * catalogue data. It follows `guard-migrations.mjs`, which made the same call
 * for the same reason and has its own CI step alongside `i18n-check`.
 *
 * Run:
 *   node scripts/guard-seed-tokens.mjs
 *   node scripts/guard-seed-tokens.mjs --self-test
 ********************************************************/

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { report } from '../../ds/scripts/guards/lib/baseline.mjs'
import { DOC_KINDS } from '../server/db/db.const.mjs'
import { loadDeclared } from './lib/token-sheet.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const SEED_DIR = resolve(HERE, '../server/db/seed')
const BASELINE = resolve(HERE, 'baseline/seed-tokens.json')

/*********************************************************
 * RETIRED
 *
 * @description
 * The names of things that were deleted on 2026-08-31 and can therefore never
 * be true again in this repository. Each is matched case-insensitively against
 * every string the seed carries.
 *
 * @description
 * `packages/ds/tokens/` is listed as a path fragment rather than a bare
 * `tokens` so an honest mention of the surviving token SHEETS is not flagged.
 *
 * @description
 * ⛔ The DTCG sources are matched by TWO patterns, because the seed spells
 * them both ways. `GRID_GAP_SIZE_VAR` cited `tokens/component/grid.json` with
 * no `packages/ds/` prefix, so the repo-relative pattern alone did not see it;
 * it was caught only because the same sentence also said "Style Dictionary",
 * which is luck, not coverage. `tokens/<layer>/<name>.json` is the removed
 * pipeline's own layout and cannot describe anything that exists now.
 ********************************************************/
const RETIRED = [
    { label: 'Style Dictionary', re: /style dictionary/i },
    { label: '@tokens-studio/sd-transforms', re: /tokens-studio/i },
    { label: 'packages/ds/tokens/ (removed DTCG sources)', re: /packages\/ds\/tokens\//i },
    { label: 'a removed DTCG token file (tokens/<layer>/<name>.json)', re: /\btokens\/[a-z-]+\/[a-z0-9-]+\.json/i },
    { label: 'packages/figma-plugin/ (removed)', re: /packages\/figma-plugin/i }
]

/*********************************************************
 * scanSeed
 *
 * @description
 * Walks the parsed seed once and returns both channels' findings. Split out of
 * the entry point so the self-test can drive it on fabricated data instead of
 * on the real file — a detector only checked against a repository that happens
 * to be clean is a detector nobody has checked.
 ********************************************************/
export function scanSeed (seed, declared, kind = 'component') {
    const notation = []
    const retired = []

    const walkStrings = (value, path, visit) => {
        if (typeof value === 'string') return visit(value, path)
        if (value === null || typeof value !== 'object') return
        for (const [k, v] of Object.entries(value)) walkStrings(v, `${path}.${k}`, visit)
    }

    for (const record of seed.entries ?? []) {
        const slug = record.entry?.slug ?? '?'

        walkStrings(record.entry ?? {}, `${kind}/${slug}`, (text, path) => {
            for (const { label, re } of RETIRED) {
                if (re.test(text)) retired.push({ id: `${path} names ${label}`, detail: text.slice(0, 160) })
            }
        })

        for (const line of (record.entry?.kind_extra?.tokens?.excerpt ?? [])) {
            const name = String(line.tokenPath ?? '')
            const value = String(line.value ?? '')

            if (!name.startsWith('--origam-')) {
                notation.push({ id: `${kind}/${slug}: ${name}`, detail: 'tokenPath is not a CSS variable name — removed-pipeline notation.' })
                continue
            }
            if (!declared.has(name)) {
                notation.push({ id: `${kind}/${slug}: ${name}`, detail: 'no token sheet declares this variable.' })
                continue
            }
            if (declared.get(name) !== value) {
                notation.push({ id: `${kind}/${slug}: ${name}`, detail: `value drifted — seed "${value}", sheet "${declared.get(name)}".` })
            }
        }
    }

    return { notation, retired }
}

/*********************************************************
 * runSelfTest
 *
 * @description
 * Mutation-checks the detector: each case feeds `scanSeed` a seed built to
 * carry exactly one defect (or none) and asserts it is seen, and seen in the
 * right channel. Without this a regression in `scanSeed` would go quiet, and a
 * silent detector reads exactly like a clean repository.
 ********************************************************/
function runSelfTest () {
    const declared = new Map([['--origam-btn---background-color', 'var(--origam-color__action--primary---bg)']])
    const entry = (kindExtra) => ({ entries: [{ entry: { slug: 'btn', kind_extra: kindExtra } }] })
    const good = { tokens: { excerpt: [{ tokenPath: '--origam-btn---background-color', value: 'var(--origam-color__action--primary---bg)' }], sourceFile: 'packages/ds/src/assets/css/tokens/light.css' } }

    const cases = []
    const check = (name, fn) => {
        try { fn(); cases.push({ name, pass: true }) } catch (e) { cases.push({ name, pass: false, error: e.message }) }
    }
    const eq = (actual, expected, what) => {
        if (actual !== expected) throw new Error(`${what} — attendu ${expected}, obtenu ${actual}`)
    }

    check('un bloc correct ne declenche rien', () => {
        const r = scanSeed(entry(good), declared)
        eq(r.notation.length, 0, 'notation')
        eq(r.retired.length, 0, 'retired')
    })

    check('tokenPath en notation pointee -> notation', () => {
        const r = scanSeed(entry({ tokens: { excerpt: [{ tokenPath: 'btn.background-color', value: '{color.action.primary.bg}' }] } }), declared)
        eq(r.notation.length, 1, 'notation')
    })

    check('variable qu-aucune feuille ne declare -> notation', () => {
        const r = scanSeed(entry({ tokens: { excerpt: [{ tokenPath: '--origam-btn---inventee', value: 'red' }] } }), declared)
        eq(r.notation.length, 1, 'notation')
    })

    check('valeur qui a derive de la feuille -> notation', () => {
        const r = scanSeed(entry({ tokens: { excerpt: [{ tokenPath: '--origam-btn---background-color', value: 'hotpink' }] } }), declared)
        eq(r.notation.length, 1, 'notation')
    })

    check('Style Dictionary nomme -> retired', () => {
        const r = scanSeed(entry({ tokens: { ...good.tokens, pipelineNote: 'Built with Style Dictionary v4.' } }), declared)
        eq(r.notation.length, 0, 'notation')
        eq(r.retired.length, 1, 'retired')
    })

    check('packages/figma-plugin nomme -> retired', () => {
        const r = scanSeed(entry({ tokens: { ...good.tokens, pipelineNote: 'Sync via packages/figma-plugin.' } }), declared)
        eq(r.retired.length, 1, 'retired')
    })

    /*********************************************************
     * @description
     * DEUX signalements attendus, pas un : un chemin complet
     * `packages/ds/tokens/component/btn.json` porte a la fois le repertoire
     * supprime et la disposition de fichier DTCG supprimee. Les deux motifs
     * matchent, et c-est voulu — ils couvrent deux ecritures reellement
     * presentes dans le seed, l-une avec prefixe et l-autre sans.
     ********************************************************/
    check('packages/ds/tokens/ nomme -> retired (les deux motifs)', () => {
        const r = scanSeed(entry({ tokens: { ...good.tokens, sourceFile: 'packages/ds/tokens/component/btn.json' } }), declared)
        eq(r.retired.length, 2, 'retired')
    })

    check('un fichier DTCG sans prefixe packages/ds est vu quand meme', () => {
        const r = scanSeed(entry({ tokens: { ...good.tokens, pipelineNote: 'Shares tokens/component/chip.json.' } }), declared)
        eq(r.retired.length, 1, 'retired')
    })

    check('la feuille survivante n-est PAS confondue avec les sources supprimees', () => {
        const r = scanSeed(entry(good), declared)
        eq(r.retired.length, 0, 'retired')
    })

    check('le balayage descend hors du bloc tokens', () => {
        const r = scanSeed(entry({ anatomy: { note: 'Generated by Style Dictionary v4.' }, ...good }), declared)
        eq(r.retired.length, 1, 'retired')
    })

    /*********************************************************
     * @description
     * Le defaut reel que le perimetre « component.json seulement » ratait :
     * la prose fautive vivait sur `entry.description_fallback` d-un CONST,
     * hors de `kind_extra`. Les deux cas ci-dessous epinglent la couverture
     * qui l-attrape — le champ, et le prefixe de kind qui rend l-id unique
     * entre les huit fichiers.
     ********************************************************/
    check('une prose fautive hors kind_extra est vue', () => {
        const seed = { entries: [{ entry: { slug: 'grid-gap-size-var', description_fallback: 'Emitted by Style Dictionary from tokens/component/grid.json.' } }] }
        const r = scanSeed(seed, declared, 'const')
        eq(r.retired.length, 2, 'retired')
    })

    check('l-id porte le kind, donc ne collisionne pas entre fichiers', () => {
        const seed = { entries: [{ entry: { slug: 'x', description_fallback: 'Style Dictionary' } }] }
        eq(scanSeed(seed, declared, 'const').retired[0].id.startsWith('const/x'), true, 'prefixe const')
        eq(scanSeed(seed, declared, 'util').retired[0].id.startsWith('util/x'), true, 'prefixe util')
    })

    console.log('─'.repeat(72))
    console.log('Self-test — guard-seed-tokens')
    console.log('─'.repeat(72))
    for (const c of cases) console.log(`  ${c.pass ? '✓' : '✗ ROUGE'}  ${c.name}${c.pass ? '' : `\n      ${c.error}`}`)

    const failed = cases.filter(c => !c.pass)
    console.log('')
    if (failed.length > 0) {
        console.log(`✗ ${failed.length}/${cases.length} self-test(s) en echec — le detecteur ne mesure plus ce qu-il pretend mesurer.`)
        process.exit(1)
    }
    console.log(`✓ ${cases.length}/${cases.length} self-test(s) verts — self-test PASSED.`)
    process.exit(0)
}

/*********************************************************
 * CLI entry point
 *
 * @description
 * Gated on being the process's own entry module. Without the gate, importing
 * `scanSeed` — which the self-test harness and any future tooling will want to
 * do — RUNS the guard as a side effect and can call `process.exit`.
 ********************************************************/
const INVOKED_DIRECTLY = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (!INVOKED_DIRECTLY) {
    // imported for `scanSeed` — do nothing
} else if (process.argv.includes('--self-test')) {
    runSelfTest()
} else {
    const declared = loadDeclared()
    const notation = []
    const retired = []

    for (const kind of DOC_KINDS) {
        const file = resolve(SEED_DIR, `${kind}.json`)
        let raw
        try {
            raw = readFileSync(file, 'utf8')
        } catch {
            continue
        }
        const found = scanSeed(JSON.parse(raw), declared, kind)
        notation.push(...found.notation)
        retired.push(...found.retired)
    }

    console.log('─'.repeat(70))
    console.log('Guard: seed-tokens — notation (hard)')
    console.log('─'.repeat(70))
    if (notation.length === 0) {
        console.log('PASS — every documented token names a variable the sheets declare, with the sheet value.')
        console.log('─'.repeat(70))
    } else {
        console.log(`\nFAIL — ${notation.length} excerpt line(s) the design system cannot honour:\n`)
        for (const n of notation.slice(0, 40)) console.log(`  ✗ ${n.id}\n      ${n.detail}`)
        if (notation.length > 40) console.log(`  … ${notation.length - 40} more`)
        console.log('\nFix: node packages/marketing/scripts/sync-token-excerpts.mjs')
    }

    const retiredCode = report({
        guardName: 'seed-tokens — retired tooling (baselined)',
        baselinePath: BASELINE,
        currentIds: retired.map(r => r.id),
        detailsById: new Map(retired.map(r => [r.id, r.detail])),
        fixHint: 'These strings name tools deleted on 2026-08-31. Rewrite or remove them, then delete the matching baseline lines.'
    })

    process.exit(notation.length > 0 || retiredCode !== 0 ? 1 : 0)
}
