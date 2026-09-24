#!/usr/bin/env node
/**
 * generate-changelog.mjs — Generate CHANGELOG_VERSIONS for the /changelog page
 * from the repository's own CHANGELOG.md.
 *
 * WHY
 *   CHANGELOG_VERSIONS used to be a hand-maintained constant with no link to
 *   CHANGELOG.md. It drifted: the page stopped at 2.6.0 while the DS shipped
 *   2.17.1 — 21 documented versions missing, under a header that reads the
 *   real version dynamically from packages/ds/package.json (issue #740).
 *   Generating it makes that particular drift structurally impossible.
 *
 * WHAT IT GENERATES — and what it deliberately does NOT
 *   Two kinds of information live in a changelog entry:
 *
 *     the SPINE      version, date, release type, i18n key names
 *                    → 100% mechanical, and it is where the drift was.
 *                      THIS SCRIPT OWNS IT.
 *
 *     the EDITORIAL  the human summary and the curated highlights
 *                    → measured compression between CHANGELOG.md and the
 *                      page: 1x to 8.8x (2.0.0 = 35 bullets → 4 highlights).
 *                      That is selection and rewriting, not extraction.
 *                      A script cannot reproduce it. IT IS NOT OWNED HERE.
 *
 *   So every content string is emitted as a `*Key` / `*Fallback` PAIR — the
 *   marketing site's existing maison convention (see scripts/i18n-check.mjs,
 *   "Channel B"), and the contract `useT()` documents:
 *
 *       t(key, fallback)  →  the translation when the key exists in the
 *                            ACTIVE locale, else the fallback.
 *
 *   Consequence, and the reason this shape was chosen:
 *     - the 50 hand-written EN + FR strings that already exist under
 *       `changelog.versions.*` keep winning. NOTHING is overwritten.
 *     - the versions nobody has curated yet render the English text
 *       extracted here instead of a raw i18n key (which is what the page
 *       used to show: `t(summaryKey, summaryKey)`).
 *     - translating one later is a pure addition to en.json / fr.json.
 *       No code change, no regeneration.
 *
 * EXTRACTION RULES (deterministic, documented, testable)
 *   date     from the `## [x.y.z] - YYYY-MM-DD` heading. Both `-` and `—`
 *            are accepted: CHANGELOG.md uses hyphen since 2.13.0 and em
 *            dash before it.
 *   type     derived from semver by diffing against the next OLDER entry.
 *            Verified to reproduce all 9 hand-written types exactly.
 *   key      `v` + digits, e.g. 2.17.1 → `changelog.versions.v2171.*`,
 *            matching the existing v260 / v200 keys. Collisions are fatal.
 *   summary  the lead paragraph under the heading, first sentence, capped.
 *            Only 10 of 31 entries have one; the rest get a synthesized
 *            count line ("3 additions, 7 changes, 8 fixes").
 *            Blockquote preambles are skipped — they are editorial notes,
 *            not summaries.
 *   highlights
 *            `### Added|Changed|Fixed|Deprecated|Removed|Security` → its
 *            bullets. A TITLED section (`### ⚠️ BREAKING — …`,
 *            `### Fixed — …`) contributes its TITLE as one highlight and
 *            none of its bullets: 2.17.0 is 8 such sections and would
 *            otherwise flood the card.
 *            `Internal` / `Tooling` / `Documentation` / `Known issues` /
 *            `Migrating from …` and friends are SKIPPED — housekeeping,
 *            not release highlights. The skip list is exhaustive and any
 *            unrecognised section title is a fatal error, so a new
 *            vocabulary in CHANGELOG.md cannot be silently dropped.
 *            Sections are then round-robined so every category is
 *            represented, and capped at MAX_HIGHLIGHTS. The page links to
 *            the full changelog on GitHub for the rest.
 *
 * USAGE
 *   node scripts/generate-changelog.mjs [--check] [--verbose]
 *   pnpm -F @origam/marketing changelog:generate
 *   pnpm -F @origam/marketing changelog:generate:check
 *
 * FLAGS
 *   --check    dry-run; write nothing. Exit 1 if the committed file differs
 *              from what CHANGELOG.md would produce (CI drift gate).
 *   --verbose  per-version extraction detail.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..')
const SOURCE_FILE = path.join(REPO_ROOT, 'CHANGELOG.md')
const OUT_FILE = path.join(
    REPO_ROOT, 'packages', 'marketing', 'src', 'consts', 'changelog-versions.const.ts'
)
const CURATED_FILE = path.join(
    REPO_ROOT, 'packages', 'marketing', 'src', 'consts', 'changelog-curated.const.ts'
)

const ARGS = process.argv.slice(2)
const CHECK = ARGS.includes('--check')
const VERBOSE = ARGS.includes('--verbose')

/** Highlights shown per release card. The 9 curated entries use 2..6. */
const MAX_HIGHLIGHTS = 6
/**
 * Character budget for one extracted string. The 9 curated entries measure
 * 44..128 for a highlight and 58..182 for a summary; staying close keeps the
 * card's visual rhythm. MIN_* pulls in a second sentence when the first one
 * is a stub ("Hotfix.").
 */
const MAX_TEXT = 150
const MIN_TEXT = 40
const MAX_SUMMARY = 190
const MIN_SUMMARY = 60

/**
 * Keep-a-Changelog section vocabulary → IChangelogHighlight['type'].
 * TChangelogHighlightType only has 4 members; `Removed` and `Security` are
 * folded onto the nearest one rather than inventing a type the page cannot
 * colour or icon.
 */
const SECTION_TYPE = {
    added: 'added',
    changed: 'changed',
    fixed: 'fixed',
    deprecated: 'deprecated',
    removed: 'deprecated',
    security: 'fixed'
}

/**
 * Section families that are NOT release highlights. Matched on the part of
 * the title before any ` — `, lowercased. Exhaustive as of 2.18.0; an
 * unknown title aborts the run (see classifySection).
 */
const SKIP_SECTIONS = [
    'internal',
    'tooling',
    'documentation',
    'known issues',
    'known limits',
    'notes for consumers',
    'outstanding',
    'deep import paths are not a supported api',
    /*
     * 2.18.0 — la note rétrospective qui recense les 9 ruptures entrées par
     * des versions mineures. C'est de la prose éditoriale, pas un fait de
     * release : les ruptures elles-mêmes remontent déjà en highlights depuis
     * leurs propres sections `### ⚠️ BREAKING` de la 2.17.0 et de la 2.18.0,
     * et les faire remonter une seconde fois par cette note les compterait
     * deux fois sur la carte de version.
     */
    '⛔ note rétrospective'
]

/** Section titles that are prose prefixes rather than a vocabulary word. */
const SKIP_PREFIXES = ['migrating from']

/** A `### ⚠️ BREAKING — …` section. Its title is the highlight. */
const BREAKING_RE = /^\s*(?:⚠️|:warning:)\s*BREAKING\b/i

// ---------------------------------------------------------------------------
// Markdown → plain text
// ---------------------------------------------------------------------------

/**
 * Reduce inline markdown to the text a Vue mustache can render. The page
 * interpolates with `{{ }}`, so any markup left here shows up literally.
 */
function stripMd (input) {
    // Code spans are lifted out FIRST and restored LAST. This corpus names
    // components as `<OrigamResponsive>` / `<origam-avatar>`; strip the code
    // fences before the HTML-tag pass and the tag pass eats the component
    // name, leaving "inline removed from IResponsiveProps (so from , , )".
    const spans = []
    let s = input.replace(/`{1,3}([^`]*)`{1,3}/g, (_, code) => {
        spans.push(code)
        return `\u0000${spans.length - 1}\u0000`
    })

    // images before links (they share the bracket syntax)
    s = s.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    s = s.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    // reference links [x][y]
    s = s.replace(/\[([^\]]+)\]\[[^\]]*\]/g, '$1')
    s = s.replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
    s = s.replace(/\*\*([^*]+)\*\*/g, '$1')
    s = s.replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1$2')
    s = s.replace(/(^|[\s(])_([^_\n]+)_/g, '$1$2')
    s = s.replace(/~~([^~]+)~~/g, '$1')
    // html comments / stray tags (outside code spans only, by construction)
    s = s.replace(/<!--[\s\S]*?-->/g, '')
    s = s.replace(/<\/?[a-zA-Z][^>]*>/g, '')

    s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => spans[Number(i)])
    return s.replace(/\s+/g, ' ').trim()
}

/**
 * First sentence of a block, capped. Abbreviations are not an issue in this
 * corpus; the guard that matters is not cutting inside a version number
 * (`2.17.1`) or an ellipsis, so a sentence end requires a following space +
 * uppercase/end-of-string.
 */
function firstSentence (text, cap, min = 0) {
    const s = text.trim()
    if (!s) return ''

    // Keep taking sentences until there is something worth reading. "Hotfix."
    // is a legitimate first sentence in this corpus and a useless summary.
    let out = ''
    let rest = s
    do {
        const m = rest.match(/^([\s\S]*?[.!?])(?=\s+[A-ZÀ-ÜŒ«"'(]|\s*$)/)
        const piece = m ? m[1].trim() : rest.trim()
        out = out ? `${out} ${piece}` : piece
        rest = m ? rest.slice(m[1].length).trim() : ''
    } while (rest && out.length < min && out.length < cap)

    if (out.length > cap) {
        const cut = out.slice(0, cap)
        const sp = cut.lastIndexOf(' ')
        out = `${(sp > cap * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,;:.–—-]+$/, '')}…`
    }
    return out
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

/** `## [2.17.1] - 2026-09-14` / `## [2.12.1] — 2026-07-31` / `## [Unreleased]` */
const VERSION_RE = /^##\s+\[([^\]]+)\]\s*(?:[-–—]\s*(\d{4}-\d{2}-\d{2}))?\s*$/

/**
 * Split CHANGELOG.md into version blocks, each with its lead paragraph and
 * its `###` sections (title + top-level bullets).
 */
function parseChangelog (md) {
    const lines = md.split('\n')
    const heads = []

    lines.forEach((line, i) => {
        const m = line.match(VERSION_RE)
        if (m) heads.push({ version: m[1].trim(), date: m[2] || null, start: i })
    })

    if (!heads.length) {
        throw new Error(`No "## [version]" heading found in ${SOURCE_FILE}`)
    }

    return heads.map((head, i) => {
        const end = i + 1 < heads.length ? heads[i + 1].start : lines.length
        const body = lines.slice(head.start + 1, end)

        const leadLines = []
        const sections = []
        let current = null
        let inFence = false

        for (const line of body) {
            if (/^\s*(```|~~~)/.test(line)) {
                inFence = !inFence
                continue
            }
            if (inFence) continue

            const h3 = line.match(/^###\s+(.*)$/)
            if (h3) {
                current = { title: h3[1].trim(), bullets: [] }
                sections.push(current)
                continue
            }
            // deeper headings inside a section are content, not new sections
            if (/^#{4,}\s/.test(line)) continue

            // blockquote = editorial preamble, never a summary
            if (/^\s*>/.test(line)) continue

            if (/^-\s+\S/.test(line)) {
                const text = line.replace(/^-\s+/, '')
                if (current) current.bullets.push([text])
                continue
            }

            // continuation of the bullet currently being read
            if (current && current.bullets.length && /^\s+\S/.test(line)) {
                current.bullets[current.bullets.length - 1].push(line.trim())
                continue
            }

            if (!current && line.trim()) leadLines.push(line.trim())
        }

        return {
            version: head.version,
            date: head.date,
            lead: leadLines.join(' '),
            sections: sections.map(s => ({
                title: s.title,
                bullets: s.bullets.map(parts => parts.join(' '))
            }))
        }
    })
}

/**
 * Decide what a `###` section contributes.
 *   { kind: 'skip' }                       housekeeping
 *   { kind: 'title', type }                titled section → its title
 *   { kind: 'bullets', type }              plain section → its bullets
 * Throws on an unknown title so a new vocabulary cannot pass unnoticed.
 */
function classifySection (title) {
    // `### ⚠️ BREAKING — <what broke>`: the label after the dash is the
    // highlight; the marker itself carries no information the `deprecated`
    // badge does not already show.
    if (BREAKING_RE.test(title)) {
        const label = title.replace(BREAKING_RE, '').replace(/^\s*[-–—:]\s*/, '').trim()
        return { kind: 'title', type: 'deprecated', label: label || title.trim() }
    }

    const parts = title.split(/\s+[-–—]\s+/)
    const headWord = parts[0].trim().toLowerCase()
    const titled = parts.length > 1

    if (SKIP_PREFIXES.some(p => headWord.startsWith(p))) return { kind: 'skip' }
    if (SKIP_SECTIONS.some(p => headWord.startsWith(p))) return { kind: 'skip' }

    const type = SECTION_TYPE[headWord]
    if (!type) {
        throw new Error(
            `Unknown CHANGELOG.md section title: "### ${title}".\n` +
            'Add it to SECTION_TYPE or SKIP_SECTIONS in scripts/generate-changelog.mjs.\n' +
            'Refusing to silently drop it.'
        )
    }
    // `### Fixed — dead aria-describedby on input fields`: drop the "Fixed —"
    // prefix, the highlight already carries a "Fixed" badge next to it.
    return { kind: titled ? 'title' : 'bullets', type, label: parts.slice(1).join(' — ').trim() }
}

/** One highlight string from a raw bullet. */
function bulletText (raw) {
    const bold = raw.match(/^\*\*(.+?)\*\*/)
    if (bold) {
        const lead = stripMd(bold[1]).replace(/[\s.:—–-]+$/, '')
        // A bold lead that is just an identifier ("OrigamBtnGroup",
        // "OrigamSliderField") is a label, not a highlight — it tells the
        // reader nothing. Require a real phrase before trusting it.
        const words = lead.split(/\s+/).filter(Boolean).length
        if (lead.length >= 12 && words >= 3) return firstSentence(lead, MAX_TEXT)
    }
    return firstSentence(stripMd(raw), MAX_TEXT, MIN_TEXT)
}

// ---------------------------------------------------------------------------
// Derivation
// ---------------------------------------------------------------------------

function parseSemver (v) {
    const m = v.match(/^(\d+)\.(\d+)\.(\d+)/)
    return m ? { major: +m[1], minor: +m[2], patch: +m[3] } : null
}

/** Release type by diffing against the next OLDER documented version. */
function releaseType (version, olderVersion) {
    const cur = parseSemver(version)
    if (!cur) return 'unreleased'
    const prev = olderVersion ? parseSemver(olderVersion) : null
    if (!prev) {
        if (cur.minor === 0 && cur.patch === 0) return 'major'
        return cur.patch === 0 ? 'minor' : 'patch'
    }
    if (cur.major !== prev.major) return 'major'
    if (cur.minor !== prev.minor) return 'minor'
    return 'patch'
}

/** 2.17.1 → v2171 ; Unreleased → unreleased. Matches the existing keys. */
function keyBase (version) {
    if (!parseSemver(version)) {
        return version.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
    }
    return `v${version.replace(/[^0-9]/g, '')}`
}

/** Round-robin across sections so every category is represented, then cap. */
function pickHighlights (buckets, cap) {
    const out = []
    let round = 0
    while (out.length < cap) {
        let took = false
        for (const b of buckets) {
            if (round < b.items.length) {
                out.push({ type: b.type, text: b.items[round] })
                took = true
                if (out.length >= cap) break
            }
        }
        if (!took) break
        round++
    }
    return out
}

/**
 * Read CHANGELOG_CURATED out of its .ts file. The array is plain object
 * literals, so stripping the type surface leaves valid JS — more robust than
 * regex-scraping a file humans edit, and it fails loudly on a syntax error
 * instead of silently matching nothing.
 */
function loadCurated () {
    if (!fs.existsSync(CURATED_FILE)) return []
    const src = fs.readFileSync(CURATED_FILE, 'utf-8')
    const body = src
        .replace(/^\s*import\s[\s\S]*?$/m, '')
        .replace(/export const CHANGELOG_CURATED\s*:\s*[A-Za-z]+\[\]\s*=/, 'return')
    try {
        const value = new Function(body)()
        if (!Array.isArray(value)) throw new Error('CHANGELOG_CURATED is not an array')
        return value
    } catch (e) {
        throw new Error(`Cannot read ${path.relative(REPO_ROOT, CURATED_FILE)}: ${e.message}`)
    }
}

function buildEntries (blocks, curated) {
    const entries = []
    const byVersion = new Map(curated.map(c => [c.version, c]))
    const usedCurated = new Set()

    blocks.forEach((block, i) => {
        const older = blocks.slice(i + 1).find(b => parseSemver(b.version))
        const type = releaseType(block.version, older ? older.version : null)

        const buckets = []
        for (const section of block.sections) {
            const cls = classifySection(section.title)
            if (cls.kind === 'skip') continue

            if (cls.kind === 'title') {
                const text = firstSentence(stripMd(cls.label || section.title), MAX_TEXT)
                if (text) buckets.push({ type: cls.type, items: [text] })
                continue
            }

            const items = section.bullets.map(bulletText).filter(Boolean)
            if (items.length) buckets.push({ type: cls.type, items })
        }

        // 2.13.0 states "useStyle() no longer overwrites a consumer id" twice:
        // once as a BREAKING section title, once as a Fixed bullet. Showing it
        // twice on one card reads as a bug in the page.
        const seenText = new Set()
        for (const b of buckets) {
            b.items = b.items.filter(t => {
                const k = t.toLowerCase().replace(/[^a-z0-9]+/g, '')
                if (seenText.has(k)) return false
                seenText.add(k)
                return true
            })
        }

        const highlights = pickHighlights(buckets.filter(b => b.items.length), MAX_HIGHLIGHTS)

        // Summary: the lead paragraph when there is one, else a count line
        // built from what the entry actually contains.
        let summary = firstSentence(stripMd(block.lead), MAX_SUMMARY, MIN_SUMMARY)
        if (!summary) {
            const totals = new Map()
            for (const b of buckets) totals.set(b.type, (totals.get(b.type) || 0) + b.items.length)
            const NOUN = {
                added: ['addition', 'additions'],
                changed: ['change', 'changes'],
                fixed: ['fix', 'fixes'],
                deprecated: ['breaking change', 'breaking changes']
            }
            const parts = ['added', 'changed', 'fixed', 'deprecated']
                .filter(t => totals.get(t))
                .map(t => `${totals.get(t)} ${NOUN[t][totals.get(t) > 1 ? 1 : 0]}`)
            summary = parts.length
                ? `${parts.join(', ').replace(/, ([^,]*)$/, ' and $1')}. See the full changelog for detail.`
                : 'See the full changelog for detail.'
            summary = summary.charAt(0).toUpperCase() + summary.slice(1)
        }

        // `## [Unreleased]` sits empty in CHANGELOG.md between releases.
        // Emitting it would put a contentless "Next" card in the picker — and
        // the entry the page carried until now described work that had ALREADY
        // shipped (ADR-004 brand themes, glassmorphism tokens). Drop it while
        // it holds nothing; it comes back by itself the day someone writes
        // under the heading.
        if (type === 'unreleased' && !highlights.length && !block.lead.trim()) return

        // A curated entry replaces the extracted text wholesale — summary,
        // highlights, their types and their key names. Splicing it in per-slot
        // instead would be a silent mis-pairing: the curated highlight order
        // is editorial and does not match the extraction order, so curated
        // `h2` text would land under the extracted `h2`'s type badge. Measured
        // on 2.6.0: the badge read "changed" over text describing an ADDED
        // feature. Version, date and type always stay with CHANGELOG.md.
        const cur = byVersion.get(block.version)
        if (cur) {
            usedCurated.add(block.version)
            entries.push({
                version: block.version,
                date: block.date,
                type,
                keyBase: keyBase(block.version),
                summary: cur.summaryFallback,
                summaryKey: cur.summaryKey,
                curated: true,
                highlights: cur.highlights.map(h => ({
                    type: h.type,
                    textKey: h.textKey,
                    text: h.textFallback
                }))
            })
            return
        }

        entries.push({
            version: block.version,
            date: block.date,
            type,
            keyBase: keyBase(block.version),
            summary,
            summaryKey: `changelog.versions.${keyBase(block.version)}.summary`,
            curated: false,
            highlights: highlights.map((h, i) => ({
                type: h.type,
                textKey: `changelog.versions.${keyBase(block.version)}.h${i + 1}`,
                text: h.text
            }))
        })
    })

    // A curated entry for a version CHANGELOG.md does not document would
    // describe a release that does not exist. Fail rather than drop it.
    const orphans = curated.filter(c => !usedCurated.has(c.version))
    if (orphans.length) {
        throw new Error(
            `changelog-curated.const.ts lists version(s) absent from CHANGELOG.md: ` +
            `${orphans.map(o => o.version).join(', ')}`
        )
    }

    // Key collisions would make two versions share their translations.
    const seen = new Map()
    for (const e of entries) {
        if (seen.has(e.keyBase)) {
            throw new Error(
                `i18n key collision: "${e.version}" and "${seen.get(e.keyBase)}" both map to ` +
                `changelog.versions.${e.keyBase}.*`
            )
        }
        seen.set(e.keyBase, e.version)
    }

    return entries
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

/** Single-quoted TS string literal. */
function q (s) {
    return `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

function render (entries) {
    const body = entries.map(e => {
        const hs = e.highlights.map(h =>
            `            { type: ${q(h.type)}, textKey: ${q(h.textKey)}, textFallback: ${q(h.text)} }`
        )
        return `    {
        // ${e.curated ? 'curated — from changelog-curated.const.ts' : 'extracted from CHANGELOG.md'}
        version: ${q(e.version)},
        date: ${e.date ? q(e.date) : 'null'},
        type: ${q(e.type)},
        summaryKey: ${q(e.summaryKey)},
        summaryFallback: ${q(e.summary)},
        highlights: [
${hs.join(',\n')}
        ]
    }`
    })

    return `import type { IChangelogVersion } from '~/interfaces/changelog.interface'

/**
 * CHANGELOG_VERSIONS — every release documented in the repository's CHANGELOG.md.
 *
 * GÉNÉRÉ depuis /CHANGELOG.md par packages/marketing/scripts/generate-changelog.mjs.
 * NE PAS ÉDITER À LA MAIN — toute modification est écrasée. Régénérer via:
 *   pnpm -F @origam/marketing changelog:generate
 * La dérive est gardée par:
 *   pnpm -F @origam/marketing changelog:generate:check   (exit 1 si périmé)
 *
 * Chaque chaîne est une PAIRE clé/repli (convention maison "*Key" / "*Fallback",
 * cf. scripts/i18n-check.mjs). \`useT().t(key, fallback)\` rend la traduction
 * quand la clé existe dans la locale active, sinon le repli anglais extrait ici.
 * Traduire une version = AJOUTER sa clé dans en.json / fr.json. Rien à
 * régénérer, et les traductions à la main ne sont jamais écrasées.
 */
export const CHANGELOG_VERSIONS: IChangelogVersion[] = [
${body.join(',\n')}
]
`
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

async function run () {
    if (!fs.existsSync(SOURCE_FILE)) {
        console.error(`[generate-changelog] source not found: ${SOURCE_FILE}`)
        process.exit(2)
    }

    const md = fs.readFileSync(SOURCE_FILE, 'utf-8')
    const blocks = parseChangelog(md)
    const curated = loadCurated()
    const entries = buildEntries(blocks, curated)
    const output = render(entries)

    const released = entries.filter(e => e.type !== 'unreleased')
    const nCurated = entries.filter(e => e.curated).length
    console.log(`[generate-changelog] source     : ${path.relative(REPO_ROOT, SOURCE_FILE)}`)
    console.log(`[generate-changelog] entries    : ${entries.length} (${released.length} released + ${entries.length - released.length} unreleased)`)
    console.log(`[generate-changelog] newest     : ${released[0] ? `${released[0].version} (${released[0].date})` : 'n/a'}`)
    console.log(`[generate-changelog] oldest     : ${released.length ? `${released[released.length - 1].version} (${released[released.length - 1].date})` : 'n/a'}`)
    console.log(`[generate-changelog] highlights : ${entries.reduce((n, e) => n + e.highlights.length, 0)} (cap ${MAX_HIGHLIGHTS}/version)`)
    console.log(`[generate-changelog] content    : ${nCurated} curated (hand-written, translated) + ${entries.length - nCurated} extracted from CHANGELOG.md`)

    if (VERBOSE) {
        console.log('')
        for (const e of entries) {
            console.log(`  ${e.version.padEnd(11)} ${String(e.date).padEnd(11)} ${e.type.padEnd(10)} ${e.highlights.length} highlights  [${e.keyBase}]`)
            console.log(`      summary: ${e.summary}`)
            for (const h of e.highlights) console.log(`      - (${h.type}) ${h.text}`)
        }
    }

    const norm = s => s.replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n').trim()

    if (CHECK) {
        if (!fs.existsSync(OUT_FILE)) {
            console.log('\n[generate-changelog] --check: file DOES NOT EXIST (would be created).')
            process.exit(1)
        }
        const existing = fs.readFileSync(OUT_FILE, 'utf-8')
        if (norm(existing) === norm(output)) {
            console.log('\n[generate-changelog] --check: file is UP TO DATE.')
            return
        }
        console.log('\n[generate-changelog] --check: file WOULD CHANGE — CHANGELOG.md and the')
        console.log('[generate-changelog] committed constant have drifted apart. Run:')
        console.log('[generate-changelog]   pnpm -F @origam/marketing changelog:generate')
        process.exit(1)
    }

    fs.writeFileSync(OUT_FILE, output, 'utf-8')
    console.log(`\n[generate-changelog] Written → ${path.relative(REPO_ROOT, OUT_FILE)}`)
}

run().catch(e => { console.error(e.message || e); process.exit(2) })
