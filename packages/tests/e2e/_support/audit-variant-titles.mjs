/**
 * Variant-title drift auditor / guardrail.
 *
 * For every e2e spec it derives the Histoire story slug it navigates to
 * (`STORY_PATH` / `open(page, slug, …)`), maps that slug back to the
 * matching `*.story.vue`, extracts the REAL `<Variant title="…">` values,
 * then extracts the titles the spec tries to click on. Two sources of
 * clicked titles are recognised, each supporting the two ways this repo
 * targets a Variant's sidebar entry — `getByText(x)` and
 * `getByRole('link', { name: x })`:
 *
 *   1. Inline: `getByText('…')…click()`, `getByRole('link', { name: '…' })…
 *      click()`, or `open(page, 'slug', '…')`.
 *   2. Local helpers: many specs define their own
 *      `const openVariant = async (page, [storyPath,] title) => { … }`
 *      that internally does `page.getByText(title, …).first().click()` (or
 *      the `getByRole` equivalent — e.g. data-list.spec.ts / sheet.spec.ts
 *      navigate via `getByRole('link', { name: variant })` to avoid
 *      matching iframe contents). The auditor detects this shape
 *      structurally (a function whose body calls one of those two
 *      patterns ending in `.click(`), figures out which parameter position
 *      carries the clicked title, then resolves every call site of that
 *      helper (`openVariant(page, STORY, 'Prop — …')`) back to the literal
 *      string passed at that position — following a same-file
 *      `const NAME = '…'` indirection when the argument isn't inline.
 *
 * Any clicked title that does not exist as a Variant title in the story is
 * reported as drift. Any clicked-title argument that could NOT be resolved
 * to a literal (a genuinely dynamic value — loop variable, computed string,
 * …) is reported separately as "unresolved" so the audit never silently
 * claims a clean bill of health it can't actually vouch for.
 *
 * Usage:
 *   node e2e/_support/audit-variant-titles.mjs            # human report
 *   node e2e/_support/audit-variant-titles.mjs --json     # machine output
 *
 * Exit code is non-zero when drift OR unresolved dynamic titles are found,
 * so it doubles as a CI guard.
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

/**
 * Pull the slug(s) a spec navigates to. Covers:
 *   - inline literals containing `/story/…` (STORY_PATH, open()/goto args).
 *   - `` `${BASE}suffix-story-vue` `` template-literal composition, where
 *     `BASE` is a same-file `const BASE = '/stories/story/prefix-'` — a
 *     handful of multi-story specs (transitions.spec.ts, picker-overlay
 *     .spec.ts) build a map of slugs off one shared prefix.
 */
function slugsInSpec (specSrc) {
    const slugs = new Set()
    // A real Histoire slug always ends in `-story-vue` (from `.story.vue`).
    // A bare `const BASE = '/stories/story/prefix-'` used only as a
    // template-literal building block matches `/story/…` too but isn't
    // itself a navigable target — skip it here, it's resolved below.
    const re = /\/story\/([a-z0-9-]+)/g
    let m
    while ((m = re.exec(specSrc)) !== null) {
        if (m[1].endsWith('-story-vue')) slugs.add(m[1])
    }

    const tplRe = /`\$\{([A-Za-z_$][\w$]*)\}([a-z0-9-]+)`/g
    while ((m = tplRe.exec(specSrc)) !== null) {
        const [, baseIdent, suffix] = m
        const baseRe = new RegExp(`\\bconst\\s+${baseIdent}\\s*=\\s*(['"])((?:[^\\\\]|\\\\.)*?)\\1`)
        const bm = baseRe.exec(specSrc)
        if (!bm) continue
        const baseVal = bm[2]
        const storyIdx = baseVal.indexOf('/story/')
        if (storyIdx === -1) continue
        slugs.add(baseVal.slice(storyIdx + '/story/'.length) + suffix)
    }
    return slugs
}

/**
 * Find the index of the `}` matching the `{` at `openBraceIdx`, honouring
 * strings (single/double/template) and comments so braces inside them
 * don't perturb the depth count. Returns -1 if unterminated.
 */
function matchBrace (src, openBraceIdx) {
    let depth = 0
    let inStr = null
    let inLineComment = false
    let inBlockComment = false
    for (let i = openBraceIdx; i < src.length; i++) {
        const c = src[i]
        const prev = src[i - 1]
        if (inLineComment) {
            if (c === '\n') inLineComment = false
            continue
        }
        if (inBlockComment) {
            if (c === '/' && prev === '*') inBlockComment = false
            continue
        }
        if (inStr) {
            if (c === '\\') { i++; continue }
            if (c === inStr) inStr = null
            continue
        }
        if (c === '/' && src[i + 1] === '/') { inLineComment = true; continue }
        if (c === '/' && src[i + 1] === '*') { inBlockComment = true; continue }
        if (c === "'" || c === '"' || c === '`') { inStr = c; continue }
        if (c === '{') depth++
        else if (c === '}') {
            depth--
            if (depth === 0) return i
        }
    }
    return -1
}

/**
 * Parse a comma-separated argument list starting right after an opening
 * `(`. String/paren/bracket/brace aware, so titles containing `(`/`,`
 * (e.g. "Prop — orientation (horizontal vs vertical)") don't split wrong.
 * Returns { args, endIdx } where endIdx is the index of the matching `)`.
 */
function parseArgs (src, startIdx) {
    let depth = 1
    let i = startIdx
    const args = []
    let cur = ''
    let inStr = null
    for (; i < src.length && depth > 0; i++) {
        const c = src[i]
        if (inStr) {
            cur += c
            if (c === '\\') { i++; cur += src[i] ?? ''; continue }
            if (c === inStr) inStr = null
            continue
        }
        if (c === "'" || c === '"' || c === '`') { inStr = c; cur += c; continue }
        if (c === '(' || c === '[' || c === '{') { depth++; cur += c; continue }
        if (c === ')' || c === ']' || c === '}') {
            depth--
            if (depth === 0) break
            cur += c
            continue
        }
        if (c === ',' && depth === 1) { args.push(cur); cur = ''; continue }
        cur += c
    }
    if (cur.trim().length) args.push(cur)
    return { args: args.map((a) => a.trim()), endIdx: i }
}

/**
 * Extract the literal string of a quoted arg, or resolve it statically:
 *   - a same-file `const NAME = '…'`
 *   - a same-file `const NAME = { prop: '…', … }` accessed as `NAME.prop`
 */
function resolveLiteral (argStr, fileSrc) {
    let m = /^'((?:[^'\\]|\\.)*)'$/.exec(argStr)
    if (m) return m[1].replace(/\\'/g, "'")
    m = /^"((?:[^"\\]|\\.)*)"$/.exec(argStr)
    if (m) return m[1].replace(/\\"/g, '"')
    if (/^[A-Za-z_$][\w$]*$/.test(argStr)) {
        const constRe = new RegExp(`\\bconst\\s+${argStr}\\s*=\\s*(['"])((?:[^\\\\]|\\\\.)*?)\\1`)
        const cm = constRe.exec(fileSrc)
        if (cm) return cm[2].replace(/\\(['"])/g, '$1')
    }
    m = /^([A-Za-z_$][\w$]*)\.([A-Za-z_$][\w$]*)$/.exec(argStr)
    if (m) {
        const [, objName, prop] = m
        const objRe = new RegExp(`\\bconst\\s+${objName}\\s*=\\s*\\{`)
        const om = objRe.exec(fileSrc)
        if (om) {
            const braceIdx = om.index + om[0].length - 1
            const bodyEnd = matchBrace(fileSrc, braceIdx)
            if (bodyEnd !== -1) {
                const body = fileSrc.slice(braceIdx, bodyEnd + 1)
                const propRe = new RegExp(`\\b${prop}\\s*:\\s*(['"])((?:[^\\\\]|\\\\.)*?)\\1`)
                const pm = propRe.exec(body)
                if (pm) return pm[2].replace(/\\(['"])/g, '$1')
            }
        }
    }
    return null
}

/** Normalise a raw param-list entry ("title: string", "variant = 'x'") down to its bare name. */
function paramName (raw) {
    return raw.split(':')[0].split('=')[0].trim()
}

/** Extract a param's default-value literal ("variantTitle = 'Default'" -> "Default"), or null. */
function paramDefaultLiteral (raw) {
    const eqIdx = raw.indexOf('=')
    if (eqIdx === -1) return null
    const m = /^\s*'((?:[^'\\]|\\.)*)'\s*$/.exec(raw.slice(eqIdx + 1))
    return m ? m[1].replace(/\\'/g, "'") : null
}

/**
 * Both ways Playwright specs in this repo target a Variant's sidebar
 * entry by a dynamic value: `getByText(PARAM, …)` and
 * `getByRole('link', { name: PARAM, … })`. Both are followed (possibly a
 * few chained calls later) by `.click(`. Checked in this order against a
 * helper body / direct call site.
 */
const CLICK_TARGET_IDENT_RES = [
    /getByText\(\s*([A-Za-z_$][\w$]*)\b[^)]*\)[\s\S]{0,150}?\.click\(/g,
    // Restricted to role 'link' — that's the ARIA role Histoire renders its
    // sidebar Variant navigation entries with. `getByRole('button', …)` /
    // `getByRole('checkbox', …)` target in-sandbox controls and must NOT be
    // mistaken for Variant navigation (false positives were observed on
    // picker-overlay.spec.ts's `getByRole('checkbox', { name: 'active' })`).
    /getByRole\(\s*'link'\s*,\s*\{[^}]*\bname:\s*([A-Za-z_$][\w$]*)\b[^)]*\)[\s\S]{0,150}?\.click\(/g
]

/**
 * Detect local helpers of the shape:
 *   const NAME = async (page, [otherParams...]) => { … getByText(PARAM)….click( … }
 *   function NAME (page, [otherParams...]) { … getByRole('link', { name: PARAM })….click( … }
 * Returns Map<helperName, { idx: paramIndex, defaultLiteral: string|null }>
 * — `defaultLiteral` covers `variantTitle = 'Default'`-style params so a
 * call site that omits the argument still resolves to the right title.
 */
function localHelpersOf (specSrc) {
    const helpers = new Map()
    const defRe = /(?:\b(?:async\s+function|function)\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)\s*(?::[^{]*)?\{)|(?:\b(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*async\s*\(([^)]*)\)\s*(?::[^={]*)?=>\s*\{)/g
    let m
    while ((m = defRe.exec(specSrc)) !== null) {
        const name = m[1] || m[3]
        const rawParams = (m[2] ?? m[4] ?? '').trim()
        const braceIdx = m.index + m[0].length - 1
        const bodyEnd = matchBrace(specSrc, braceIdx)
        if (bodyEnd === -1) continue
        const body = specSrc.slice(braceIdx, bodyEnd + 1)

        let foundIdent = null
        for (const re of CLICK_TARGET_IDENT_RES) {
            re.lastIndex = 0
            const cm = re.exec(body)
            if (cm) { foundIdent = cm[1]; break }
        }
        if (!foundIdent) continue

        const rawParamList = rawParams.length ? rawParams.split(',') : []
        const params = rawParamList.map(paramName)
        const idx = params.indexOf(foundIdent)
        if (idx !== -1) helpers.set(name, { idx, defaultLiteral: paramDefaultLiteral(rawParamList[idx]) })
    }
    return helpers
}

/**
 * Titles the spec tries to navigate to (click on): direct literals AND
 * literals resolved through local helper call sites.
 */
function clickedTitlesOf (specSrc) {
    const titles = new Set()
    const unresolved = []

    // Direct: getByText('Title', { exact: true }) … .click()
    const gbt = /getByText\(\s*'((?:[^'\\]|\\.)*)'\s*(?:,\s*\{[^}]*\})?\s*\)/g
    let m
    while ((m = gbt.exec(specSrc)) !== null) {
        const idx = gbt.lastIndex
        const tail = specSrc.slice(idx, idx + 80)
        if (/\.\s*(first|nth|last)\s*\([^)]*\)\s*\.?\s*click|\.\s*click/.test(tail)) {
            titles.add(m[1].replace(/\\'/g, "'"))
        }
    }
    // Direct: getByRole('link', { name: 'Title', exact: true }) … .click()
    // Restricted to role 'link' — see CLICK_TARGET_IDENT_RES note above on
    // why 'button' / 'checkbox' must NOT be treated as Variant navigation.
    const gbr = /getByRole\(\s*'link'\s*,\s*\{[^}]*\bname:\s*'((?:[^'\\]|\\.)*)'[^)]*\)/g
    while ((m = gbr.exec(specSrc)) !== null) {
        const idx = gbr.lastIndex
        const tail = specSrc.slice(idx, idx + 80)
        if (/\.\s*(first|nth|last)\s*\([^)]*\)\s*\.?\s*click|\.\s*click/.test(tail)) {
            titles.add(m[1].replace(/\\'/g, "'"))
        }
    }
    // Direct: open(page, 'slug', 'Variant title')
    const openRe = /\bopen\s*\(\s*page\s*,\s*['"][a-z0-9-]+['"]\s*,\s*['"]((?:[^'"\\]|\\.)*)['"]/g
    while ((m = openRe.exec(specSrc)) !== null) titles.add(m[1])

    // Local helpers: resolve every call site's title-position argument.
    const helpers = localHelpersOf(specSrc)
    for (const [helperName, { idx: paramIdx, defaultLiteral }] of helpers) {
        const callRe = new RegExp(`\\b${helperName}\\s*\\(`, 'g')
        let cm
        while ((cm = callRe.exec(specSrc)) !== null) {
            // Skip the definition site itself (immediately preceded by
            // `function NAME` / `const NAME =`, not a real call).
            const before = specSrc.slice(Math.max(0, cm.index - 40), cm.index)
            if (/\b(?:function|const|let)\s+$/.test(before)) continue

            const startIdx = cm.index + cm[0].length
            const { args, endIdx } = parseArgs(specSrc, startIdx)
            callRe.lastIndex = endIdx + 1
            if (paramIdx >= args.length) {
                // Argument omitted at this call site — falls through to the
                // parameter's own default value, if it has a literal one.
                if (defaultLiteral !== null) titles.add(defaultLiteral)
                continue
            }
            const literal = resolveLiteral(args[paramIdx], specSrc)
            if (literal !== null) titles.add(literal)
            else unresolved.push({ helper: helperName, arg: args[paramIdx] })
        }
    }

    return { titles, unresolved }
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
    const { titles: clicked, unresolved } = clickedTitlesOf(src)
    if (!clicked.size && !unresolved.length) continue

    const knownTitles = new Set()
    const unresolvedSlugs = []
    for (const slug of slugs) {
        const story = slugToStory.get(slug)
        if (!story) { unresolvedSlugs.push(slug); continue }
        for (const t of variantTitlesOf(readFileSync(story, 'utf8'))) knownTitles.add(t)
    }
    // Spec may click standard widget chrome ("Default") that every story has.
    const missing = [...clicked].filter((t) => !knownTitles.has(t))
    if (missing.length || unresolvedSlugs.length || unresolved.length) {
        report.push({
            spec: relative(TESTS_ROOT, spec),
            slugs,
            unresolvedSlugs,
            missingTitles: missing,
            unresolvedDynamicArgs: unresolved,
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
            if (r.unresolvedDynamicArgs.length) {
                const uniq = [...new Set(r.unresolvedDynamicArgs.map((u) => `${u.helper}(${u.arg})`))]
                console.log(`    dynamic title arg could not be resolved statically: ${uniq.join(', ')}`)
            }
        }
        console.log(`\nRun with --json for the available-titles list per spec.`)
    }
}

process.exit(report.length ? 1 : 0)
