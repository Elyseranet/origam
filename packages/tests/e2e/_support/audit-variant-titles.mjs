/**
 * Variant-title drift auditor / guardrail.
 *
 * For every e2e spec it derives the Histoire story slug it navigates to
 * (`STORY_PATH` / `open(page, slug, …)`), maps that slug back to the
 * matching `*.story.vue`, extracts the REAL `<Variant title="…">` values,
 * then extracts the titles the spec tries to click on
 * (`getByText('…').click()` and `open(page, slug, '…')`). Any clicked
 * title that does not exist as a Variant title in the story is reported
 * as drift.
 *
 * Usage:
 *   node e2e/_support/audit-variant-titles.mjs            # human report
 *   node e2e/_support/audit-variant-titles.mjs --json     # machine output
 *
 * Exit code is non-zero when drift is found, so it doubles as a CI guard.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const TESTS_ROOT = join(HERE, '..', '..')                 // packages/tests
const E2E_DIR = join(TESTS_ROOT, 'e2e')
const STORIES_PKG = join(TESTS_ROOT, '..', 'stories')     // packages/stories

const argv = process.argv.slice(2)
const AS_JSON = argv.includes('--json')

/** Recursively collect files matching a predicate. */
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

/**
 * Replicate Histoire's auto story-id from a story file path relative to
 * the stories package root: lowercased, every run of non-alphanumerics
 * collapsed to a single '-'. e.g.
 *   components/stories/Avatar/OrigamAvatar.story.vue
 *   -> components-stories-avatar-origamavatar-story-vue
 */
function slugForStory (storyFile) {
    const rel = relative(STORIES_PKG, storyFile)
    return rel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

/** Pull every `<Variant title="…">` value from a story's source. */
function variantTitlesOf (storySrc) {
    const titles = new Set()
    const re = /<Variant\b[^>]*?\btitle\s*=\s*"([^"]*)"/gs
    let m
    while ((m = re.exec(storySrc)) !== null) titles.add(m[1])
    return titles
}

/** Pull the slug a spec navigates to (STORY_PATH or open()/goto literals). */
function slugsInSpec (specSrc) {
    const slugs = new Set()
    const re = /\/story\/([a-z0-9-]+)/g
    let m
    while ((m = re.exec(specSrc)) !== null) slugs.add(m[1])
    // open(page, 'components-stories-…', 'Variant')
    const openRe = /open\s*\(\s*page\s*,\s*['"]([a-z0-9-]+)['"]/g
    while ((m = openRe.exec(specSrc)) !== null) slugs.add(m[1])
    return slugs
}

/** Titles the spec tries to navigate to (click on). */
function clickedTitlesOf (specSrc) {
    const titles = new Set()
    // getByText('Title', { exact: true }) … .click()  — capture the literal
    const gbt = /getByText\(\s*'((?:[^'\\]|\\.)*)'\s*(?:,\s*\{[^}]*\})?\s*\)/g
    let m
    while ((m = gbt.exec(specSrc)) !== null) {
        const idx = gbt.lastIndex
        const tail = specSrc.slice(idx, idx + 80)
        if (/\.\s*(first|nth|last)\s*\([^)]*\)\s*\.?\s*click|\.\s*click/.test(tail)) {
            titles.add(m[1].replace(/\\'/g, "'"))
        }
    }
    // open(page, slug, 'Variant title')
    const openRe = /open\s*\(\s*page\s*,\s*['"][a-z0-9-]+['"]\s*,\s*['"]((?:[^'"\\]|\\.)*)['"]/g
    while ((m = openRe.exec(specSrc)) !== null) titles.add(m[1])
    return titles
}

const storyFiles = walk(STORIES_PKG, (f) => f.endsWith('.story.vue'))
const slugToStory = new Map()
for (const f of storyFiles) slugToStory.set(slugForStory(f), f)

const specFiles = walk(E2E_DIR, (f) => f.endsWith('.spec.ts'))

const report = []
for (const spec of specFiles) {
    const src = readFileSync(spec, 'utf8')
    const slugs = [...slugsInSpec(src)]
    if (!slugs.length) continue
    const clicked = clickedTitlesOf(src)
    if (!clicked.size) continue

    const knownTitles = new Set()
    const unresolvedSlugs = []
    for (const slug of slugs) {
        const story = slugToStory.get(slug)
        if (!story) { unresolvedSlugs.push(slug); continue }
        for (const t of variantTitlesOf(readFileSync(story, 'utf8'))) knownTitles.add(t)
    }
    // Spec may click standard widget chrome ("Default") that every story has.
    const missing = [...clicked].filter((t) => !knownTitles.has(t))
    if (missing.length || unresolvedSlugs.length) {
        report.push({
            spec: relative(TESTS_ROOT, spec),
            slugs,
            unresolvedSlugs,
            missingTitles: missing,
            availableTitles: [...knownTitles].sort()
        })
    }
}

if (AS_JSON) {
    console.log(JSON.stringify(report, null, 2))
} else {
    if (!report.length) {
        console.log('✓ No variant-title drift — every clicked title exists in its story.')
    } else {
        console.log(`✗ Variant-title drift in ${report.length} spec(s):\n`)
        for (const r of report) {
            console.log(`• ${r.spec}`)
            if (r.unresolvedSlugs.length) console.log(`    slug not found in stories: ${r.unresolvedSlugs.join(', ')}`)
            if (r.missingTitles.length) console.log(`    clicked titles absent from story: ${r.missingTitles.map((t) => `"${t}"`).join(', ')}`)
        }
        console.log(`\nRun with --json for the available-titles list per spec.`)
    }
}

process.exit(report.length ? 1 : 0)
