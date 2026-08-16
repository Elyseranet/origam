#!/usr/bin/env node
/**
 * Variant-PIN drift auditor — the half `audit-variant-titles.mjs` cannot see.
 *
 * WHAT THE SIBLING GUARD COVERS, AND WHERE IT STOPS
 * --------------------------------------------------
 * `audit-variant-titles.mjs` resolves the titles a spec CLICKS on and checks
 * they still exist in the story. That works for specs that navigate through
 * the sidebar. It is structurally blind to the other half of the suite: specs
 * that navigate POSITIONALLY, via `?variantId=<storyId>-<N>`. There is no
 * title in such a URL, so there is nothing for a title auditor to resolve —
 * it stays silent, and silence reads as "clean".
 *
 * Measured on this repo: 54 of 175 specs address Variants positionally, with
 * 450 distinct index references. None of them were covered by any guard.
 *
 * WHY A POSITIONAL REFERENCE ROTS SILENTLY
 * -----------------------------------------
 * `variantId` is `<storyId>-<index>`, and the index is the Variant's ORDER in
 * the `.story.vue` file. Insert one `<Variant>` in the middle and every index
 * after it shifts by one. The spec keeps navigating successfully, Histoire
 * keeps rendering a real Variant, and the assertions keep running — against
 * the WRONG Variant. Depending on what the neighbour happens to pin, the test
 * goes red for a reason that has nothing to do with the code, or, worse, stays
 * GREEN while observing something it never meant to observe.
 *
 * WHAT THIS GUARD CHECKS — and what it deliberately does NOT
 * ----------------------------------------------------------
 * It checks the beliefs a spec writes down about the Variant it targets, all
 * of which are literal strings on both sides and therefore comparable exactly:
 *
 *   1. RANGE   — index actually exists in the story.
 *   2. TITLE   — the spec's own `N → Some Title` table vs the story's real
 *                ordered titles.
 *   3. PINS    — the spec's `// init: { … }` banner vs the story's real
 *                `useStoryInitState<…>({ … })` at that index, compared
 *                key-by-key on SCALAR values only.
 *
 * It does NOT try to relate an ASSERTION to a pinned value. Going from
 * `bgColor: 'primary'` to `toHaveClass(/origam--bg-primary/)` or to a
 * `getComputedStyle` expectation means modelling the whole prop -> utility
 * class -> token -> computed style pipeline, per prop, per component. Any
 * approximation there would produce false accusations, and a guard that cries
 * wolf gets disabled — which is strictly worse than no guard. That linkage is
 * left to human review, and this file says so rather than pretending coverage
 * it does not have.
 *
 * So: a PARTIAL guard whose findings are exact, not a total guard whose
 * findings are guesses. Everything it cannot decide is reported under
 * "non vérifiable" instead of being counted as clean — the failure mode of
 * the first guard was certifying "no drift" over 55 broken specs.
 *
 * Usage:
 *   node e2e/_support/audit-variant-pins.mjs           # human report
 *   node e2e/_support/audit-variant-pins.mjs --json    # machine output
 *   node e2e/_support/audit-variant-pins.mjs --coverage # + unvisited Variants
 *
 * Exit code is non-zero when a RANGE / TITLE / PINS disagreement is found.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const TESTS_ROOT = join(HERE, '..', '..')
const E2E_DIR = join(TESTS_ROOT, 'e2e')
const STORIES_PKG = join(TESTS_ROOT, '..', 'stories')

const argv = process.argv.slice(2)
const AS_JSON = argv.includes('--json')
const SHOW_COVERAGE = argv.includes('--coverage')

function walk (dir, pred, acc = []) {
    for (const name of readdirSync(dir)) {
        if (name.startsWith('.') || name === 'node_modules') continue
        const full = join(dir, name)
        const st = statSync(full)
        if (st.isDirectory()) walk(full, pred, acc)
        else if (pred(full)) acc.push(full)
    }
    return acc
}

/** Histoire's auto story-id, identical to audit-variant-titles.mjs. */
const slugForStory = (f) =>
    relative(STORIES_PKG, f).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

/** Index of the `>` closing the tag opened at `openIdx`, quote-aware. */
function tagEnd (src, openIdx) {
    let inStr = null
    for (let i = openIdx; i < src.length; i++) {
        const c = src[i]
        if (inStr) { if (c === inStr) inStr = null; continue }
        if (c === '"' || c === "'") { inStr = c; continue }
        if (c === '>') return i
    }
    return -1
}

/** Ordered `<Variant>` list: { index, title, initRaw }. Order IS the id. */
function variantsOf (src) {
    const out = []
    const re = /<Variant\b/g
    let m
    while ((m = re.exec(src)) !== null) {
        const end = tagEnd(src, m.index)
        if (end === -1) continue
        const tag = src.slice(m.index, end + 1)
        const t = /\btitle\s*=\s*"([^"]*)"/.exec(tag)
        const init = /useStoryInitState\s*<[\s\S]*?>\s*\(\s*([\s\S]*?)\)\s*"/.exec(tag)
        out.push({ index: out.length, title: t ? t[1] : null, initRaw: init ? init[1].trim() : null })
    }
    return out
}

/**
 * `ENUM.MEMBER` -> literal value, harvested from `packages/ds/src/enums/**`.
 *
 * Stories increasingly pin `variant: TAB_VARIANT.DEFAULT` rather than
 * `variant: 'default'` (the magic-string cleanup did this deliberately).
 * Without resolving those, every enum-pinned key looks "no longer pinned"
 * and the guard invents drift where the story is perfectly in sync.
 */
function enumMemberValues () {
    const map = new Map()
    const ENUMS_DIR = join(TESTS_ROOT, '..', 'ds', 'src', 'enums')
    let files = []
    try { files = walk(ENUMS_DIR, (f) => f.endsWith('.enum.ts')) } catch { return map }
    for (const f of files) {
        const src = readFileSync(f, 'utf8')
        const re = /export enum ([A-Z0-9_]+)\s*\{([\s\S]*?)\n\}/g
        let m
        while ((m = re.exec(src)) !== null) {
            const enumName = m[1]
            const memRe = /([A-Z0-9_]+)\s*=\s*'([^']*)'/g
            let mm
            while ((mm = memRe.exec(m[2])) !== null) map.set(`${enumName}.${mm[1]}`, mm[2])
        }
    }
    return map
}
const ENUM_VALUES = enumMemberValues()

/**
 * Parse a flat object literal into scalar key -> value.
 * Nested objects / arrays / arrow functions are recorded as UNCHECKABLE
 * rather than guessed at.
 */
function scalarPins (objSrc) {
    const pins = new Map()
    const skipped = []
    if (!objSrc) return { pins, skipped }
    const inner = objSrc.replace(/^\{/, '').replace(/\}$/, '')
    let depth = 0, inStr = null, cur = '', parts = []
    for (let i = 0; i < inner.length; i++) {
        const c = inner[i]
        if (inStr) { cur += c; if (c === '\\') { i++; cur += inner[i] ?? '' ; continue } if (c === inStr) inStr = null; continue }
        if (c === "'" || c === '"' || c === '`') { inStr = c; cur += c; continue }
        if (c === '{' || c === '[' || c === '(') { depth++; cur += c; continue }
        if (c === '}' || c === ']' || c === ')') { depth--; cur += c; continue }
        if (c === ',' && depth === 0) { parts.push(cur); cur = ''; continue }
        cur += c
    }
    if (cur.trim()) parts.push(cur)

    for (const p of parts) {
        const t = p.trim()
        if (!t) continue
        const colon = (() => {
            let d = 0, s = null
            for (let i = 0; i < t.length; i++) {
                const c = t[i]
                if (s) { if (c === '\\') { i++; continue } if (c === s) s = null; continue }
                if (c === "'" || c === '"' || c === '`') { s = c; continue }
                if (c === '{' || c === '[' || c === '(') d++
                else if (c === '}' || c === ']' || c === ')') d--
                else if (c === ':' && d === 0) return i
            }
            return -1
        })()
        if (colon === -1) { skipped.push(t); continue }
        const key = t.slice(0, colon).trim().replace(/^['"]|['"]$/g, '')
        const raw = t.slice(colon + 1).trim()
        const str = /^'((?:[^'\\]|\\.)*)'$/.exec(raw) || /^"((?:[^"\\]|\\.)*)"$/.exec(raw)
        if (str) { pins.set(key, str[1]); continue }
        if (/^-?\d+(\.\d+)?$/.test(raw)) { pins.set(key, raw); continue }
        if (raw === 'true' || raw === 'false' || raw === 'null') { pins.set(key, raw); continue }
        if (ENUM_VALUES.has(raw)) { pins.set(key, ENUM_VALUES.get(raw)); continue }
        skipped.push(key)
    }
    return { pins, skipped }
}

/**
 * Slugs a spec targets. Two shapes, BOTH required — the majority of specs
 * use the second, which the sibling auditor's `/story/<slug>` regex cannot
 * see because the slug is a bare const spliced in by concatenation:
 *     const STORY_ID   = 'components-stories-btn-origambtn-story-vue'
 *     const STORY_PATH = '/stories/story/' + STORY_ID
 */
function slugsInSpec (src) {
    const slugs = new Set()
    let m
    const re = /\/story\/([a-z0-9-]+)/g
    while ((m = re.exec(src)) !== null) if (m[1].endsWith('-story-vue')) slugs.add(m[1])
    const bare = /(['"])([a-z0-9-]+-story-vue)\1/g
    while ((m = bare.exec(src)) !== null) slugs.add(m[2])
    return [...slugs]
}

/** Variant indices a spec navigates to. */
function indicesInSpec (src) {
    const idxs = new Set()
    let m
    for (const re of [
        /variantId=\$\{[A-Za-z_$][\w$]*\}-(\d+)/g,
        /variantId=[a-z0-9-]*-story-vue-(\d+)/g,
        /\bvariantUrl\s*\(\s*(\d+)/g
    ]) while ((m = re.exec(src)) !== null) idxs.add(Number(m[1]))
    return [...idxs].sort((a, b) => a - b)
}

/**
 * What the spec DOCUMENTS about each index. Two conventions in this repo:
 *     ` *   5  → Default (playground)`     (recipe table in the file header)
 *     ` // DEFAULT / PLAYGROUND (index 9)` followed by ` // init: { … }`
 */
function claimsInSpec (src) {
    const titles = new Map()
    const inits = new Map()
    let m

    const reArrow = /^[ \t]*\*?[ \t]*(\d+)[ \t]*(?:→|->)[ \t]*(.+?)[ \t]*$/gm
    while ((m = reArrow.exec(src)) !== null) {
        const i = Number(m[1])
        if (!titles.has(i)) titles.set(i, m[2].trim())
    }

    /*
     * An `init: { … }` banner is written INSIDE a comment block, so the
     * object literal is interleaved with the `//` / `*` line markers:
     *
     *     // init: { color: 'primary',
     *     //         text: 'Body text.' }
     *
     * Splicing that straight into an object parser yields keys like
     * `//\n//         text`. Strip the line markers first, and only accept a
     * SINGLE-LINE object — a continuation line whose marker cannot be
     * stripped unambiguously is left unparsed rather than guessed at.
     */
    const stripMarkers = (block) => block
        .split('\n')
        .map((l) => l.replace(/^[ \t]*(?:\/\/+|\*)[ \t]?/, ''))
        .join('\n')

    const reBanner = /\(index[ \t]+(\d+)\)([\s\S]{0,400}?)(?:\n[ \t]*\/\/[ \t]*-{5,}|\n[ \t]*\n)/g
    while ((m = reBanner.exec(src)) !== null) {
        const i = Number(m[1])
        const init = /init[ \t]*:[ \t]*(\{[^\n}]*\})/.exec(stripMarkers(m[2]))
        if (init && !inits.has(i)) inits.set(i, init[1])
    }
    const reRecipe = /^[ \t]*\*?[ \t]*(\d+)[ \t]*(?:→|->)[^\n]*?init[ \t]*:[ \t]*(\{[^\n}]*\})/gm
    while ((m = reRecipe.exec(src)) !== null) {
        const i = Number(m[1])
        if (!inits.has(i)) inits.set(i, m[2])
    }
    return { titles, inits }
}

/** Compare a documented title to the real one, ignoring human glosses. */
const normTitle = (s) => s
    .replace(/\binit\s*:.*$/i, '')
    .replace(/\(([^)]*)\)\s*$/, '')
    .toLowerCase().replace(/[—–]/g, '-').replace(/\s+/g, ' ').trim()

/**
 * The whole decision for ONE index reference, isolated so `--self-test` can
 * exercise it on synthetic input. Returns { findings, unverifiable }.
 */
function compareIndex ({ claimTitle, claimInit, variant }) {
    const findings = []
    const unverifiable = []

    if (claimTitle != null) {
        const a = normTitle(claimTitle), b = normTitle(variant.title ?? '')
        if (a !== b && !b.startsWith(a) && !a.startsWith(b)) {
            findings.push({ kind: 'TITLE', detail: `la spec annonce "${claimTitle}", la story porte "${variant.title}"` })
        }
    }

    if (claimInit != null) {
        const claimed = scalarPins(claimInit)
        const real = scalarPins(variant.initRaw)
        for (const [k, want] of claimed.pins) {
            if (!real.pins.has(k)) {
                unverifiable.push({ why: `la spec documente ${k}=${JSON.stringify(want)} mais "${variant.title}" ne le pinne pas dans init-state (template ? gloss ?) — non décidable statiquement` })
            } else if (real.pins.get(k) !== want) {
                findings.push({ kind: 'PINS', detail: `${k} : la spec attend ${JSON.stringify(want)}, la story pinne ${JSON.stringify(real.pins.get(k))} sur "${variant.title}"` })
            }
        }
        if (real.skipped.length) {
            unverifiable.push({ why: `valeurs non scalaires non comparées (${real.skipped.slice(0, 4).join(', ')})` })
        }
    }
    return { findings, unverifiable }
}

/**
 * Proof, in both directions, that this guard actually guards. A checker that
 * is never shown to fail is indistinguishable from one that always passes —
 * the exact trap the `tsc` deprecation abort sprang earlier in this session,
 * where a clean run had type-checked nothing at all.
 *
 * Runs on synthetic fixtures so it never touches a shared file: three other
 * agents are live in this worktree.
 */
function selfTest () {
    const cases = [
        {
            name: 'couple correct (titre + pins identiques) → silencieux',
            input: {
                claimTitle: 'Design',
                claimInit: "{ color: 'primary', text: 'Button' }",
                variant: { title: 'Design', initRaw: "{ color: 'primary', text: 'Button' }" }
            },
            wantFindings: 0
        },
        {
            name: 'gloss humaine "(playground)" tolérée → silencieux',
            input: { claimTitle: 'Default (playground)', claimInit: null, variant: { title: 'Default', initRaw: null } },
            wantFindings: 0
        },
        {
            name: 'TITRE dérivé (Variant inséré avant) → détecté',
            input: { claimTitle: 'Default (playground)', claimInit: null, variant: { title: 'Prop — content', initRaw: null } },
            wantFindings: 1, wantKind: 'TITLE'
        },
        {
            name: 'VALEUR de pin changée → détecté',
            input: {
                claimTitle: 'Design',
                claimInit: "{ bgColor: 'primary' }",
                variant: { title: 'Design', initRaw: "{ bgColor: 'secondary' }" }
            },
            wantFindings: 1, wantKind: 'PINS'
        },
        {
            name: 'pin exprimé par membre d\'enum, même valeur → silencieux',
            input: {
                claimTitle: 'Design',
                claimInit: "{ direction: 'horizontal' }",
                variant: { title: 'Design', initRaw: '{ direction: DIRECTION.HORIZONTAL }' }
            },
            wantFindings: 0
        },
        {
            name: 'pin par membre d\'enum, valeur DIFFÉRENTE → détecté',
            input: {
                claimTitle: 'Design',
                claimInit: "{ direction: 'horizontal' }",
                variant: { title: 'Design', initRaw: '{ direction: DIRECTION.VERTICAL }' }
            },
            wantFindings: 1, wantKind: 'PINS'
        },
        {
            name: 'clé absente de init-state → PAS une accusation',
            input: {
                claimTitle: 'Design',
                claimInit: "{ columns: 3 }",
                variant: { title: 'Design', initRaw: '{}' }
            },
            wantFindings: 0, wantUnverifiable: 1
        }
    ]

    let failed = 0
    for (const c of cases) {
        const { findings, unverifiable } = compareIndex(c.input)
        const okCount = findings.length === c.wantFindings
        const okKind = c.wantKind == null || (findings[0] && findings[0].kind === c.wantKind)
        const okUnv = c.wantUnverifiable == null || unverifiable.length === c.wantUnverifiable
        const ok = okCount && okKind && okUnv
        if (!ok) failed++
        console.log(`${ok ? '✓' : '✗'} ${c.name}`)
        if (!ok) console.log(`    attendu ${c.wantFindings} finding(s)${c.wantKind ? ' ' + c.wantKind : ''}, obtenu ${findings.length} [${findings.map((f) => f.kind).join(',')}], unverifiable=${unverifiable.length}`)
    }
    console.log(`\n${cases.length - failed}/${cases.length} cas de contrôle OK`)
    return failed ? 1 : 0
}

function run () {
    const storyBySlug = new Map()
    for (const f of walk(STORIES_PKG, (x) => x.endsWith('.story.vue'))) {
        storyBySlug.set(slugForStory(f), { file: f, variants: variantsOf(readFileSync(f, 'utf8')) })
    }

    const findings = []
    const unverifiable = []
    const coverage = []
    let specsBound = 0, refsChecked = 0, titlesChecked = 0, pinsChecked = 0

    for (const sf of walk(E2E_DIR, (f) => f.endsWith('.spec.ts'))) {
        const src = readFileSync(sf, 'utf8')
        const rel = relative(TESTS_ROOT, sf)
        const idxs = indicesInSpec(src)
        if (!idxs.length) continue

        const slugs = slugsInSpec(src)
        if (slugs.length !== 1) {
            unverifiable.push({ spec: rel, why: `${slugs.length} story slugs pour ${idxs.length} index — l'index ne peut pas être attribué sans ambiguïté` })
            continue
        }
        const story = storyBySlug.get(slugs[0])
        if (!story) {
            unverifiable.push({ spec: rel, why: `slug introuvable dans les stories : ${slugs[0]}` })
            continue
        }
        specsBound++

        const { titles: claimTitles, inits: claimInits } = claimsInSpec(src)
        const visited = new Set()

        for (const i of idxs) {
            refsChecked++
            visited.add(i)
            const v = story.variants[i]
            if (!v) {
                findings.push({ spec: rel, index: i, kind: 'RANGE', detail: `la story ne porte que ${story.variants.length} Variants (0..${story.variants.length - 1})` })
                continue
            }

            const ct = claimTitles.get(i)
            const ci = claimInits.get(i)
            if (ct != null) titlesChecked++
            if (ci != null) pinsChecked += scalarPins(ci).pins.size

            const res = compareIndex({ claimTitle: ct, claimInit: ci, variant: v })
            for (const f of res.findings) findings.push({ spec: rel, index: i, ...f })
            for (const u of res.unverifiable) unverifiable.push({ spec: rel, why: `index ${i} : ${u.why}` })
        }

        const never = story.variants.filter((v) => !visited.has(v.index))
        if (never.length) coverage.push({ spec: rel, story: relative(STORIES_PKG, story.file), unvisited: never.map((v) => `${v.index}:${v.title}`) })
    }

    if (AS_JSON) {
        console.log(JSON.stringify({ findings, unverifiable, coverage, counts: { specsBound, refsChecked, titlesChecked, pinsChecked } }, null, 2))
        return findings.length ? 1 : 0
    }

    console.log('Audit des PINS de Variant (specs adressant par index)')
    console.log('─'.repeat(70))
    console.log(`specs liés à une story unique : ${specsBound}`)
    console.log(`références d'index vérifiées  : ${refsChecked}`)
    console.log(`  dont titre auto-documenté   : ${titlesChecked}`)
    console.log(`  dont pins auto-documentés   : ${pinsChecked}`)
    console.log('─'.repeat(70))

    if (!findings.length) {
        console.log('✓ Aucun désaccord index → titre / pins.')
    } else {
        console.log(`✗ ${findings.length} désaccord(s) :\n`)
        for (const f of findings) console.log(`• ${f.spec} [index ${f.index}] ${f.kind}\n    ${f.detail}`)
    }

    if (unverifiable.length) {
        console.log(`\n⚠ ${unverifiable.length} point(s) NON VÉRIFIABLES (ni sains ni fautifs — hors de portée statique) :`)
        for (const u of unverifiable.slice(0, 20)) console.log(`  · ${u.spec} — ${u.why}`)
        if (unverifiable.length > 20) console.log(`  … et ${unverifiable.length - 20} de plus (--json pour la liste complète)`)
    }

    if (SHOW_COVERAGE && coverage.length) {
        console.log('\n── Variants JAMAIS visités par leur spec ──')
        for (const c of coverage) console.log(`  ${c.spec}\n    ${c.unvisited.join('\n    ')}`)
    }

    console.log('\nCe garde ne relie PAS une assertion à une valeur pinnée — voir l\'en-tête du fichier.')
    return findings.length ? 1 : 0
}

process.exit(argv.includes('--self-test') ? selfTest() : run())
