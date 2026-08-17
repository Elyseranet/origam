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
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const TESTS_ROOT = join(HERE, '..', '..')                 // packages/tests
/**
 * Same rationale as audit-variant-pins.mjs: `vrt/` holds specs that address
 * Variants and lived outside both guards. Keep the two lists in sync.
 */
const SPEC_DIRS = ['e2e', 'vrt']
    .map((d) => join(TESTS_ROOT, d))
    .filter((d) => existsSync(d))
const STORIES_PKG = join(TESTS_ROOT, '..', 'stories')     // packages/stories

const argv = process.argv.slice(2)
const AS_JSON = argv.includes('--json')
const SHOW_SKIPPED = argv.includes('--skipped')

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
 *   - a BARE `'…-story-vue'` string literal anywhere in the file.
 *
 * That last case is the one this auditor was blind to for its whole life,
 * and it was the majority shape. The canonical spec header in this repo is
 *
 *     const STORY_ID   = 'components-stories-btn-origambtn-story-vue'
 *     const STORY_PATH = '/stories/story/' + STORY_ID
 *
 * — the slug never appears literally after `/story/`, it is spliced in by
 * concatenation. Requiring the literal `/story/<slug>` form therefore matched
 * only 85 of 175 specs (measured); the other 90 resolved no slug at all, hit
 * the `if (!slugs.length) continue` in the main loop, and were silently
 * dropped from the audit. Silence then read as "clean" — which is how a
 * "drift résorbé, 55 → 0" claim came to rest on a guard that had never looked
 * at the majority of the suite.
 *
 * Matching any bare `…-story-vue` literal is safe against the opposite
 * failure (inventing drift): every one of the 19 multi-slug specs was checked
 * by hand and genuinely targets each slug it names — none picks up an
 * unrelated story mentioned in passing. It also picks up the slug repeated in
 * a file's doc-comment header, which is the same value and therefore inert.
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

    const bareRe = /(['"`])([a-z0-9][a-z0-9-]*-story-vue)\1/g
    while ((m = bareRe.exec(specSrc)) !== null) slugs.add(m[2])

    return slugs
}

/**
 * Find the index of the `)` matching the `(` at `openParenIdx`, string- and
 * comment-aware. Returns -1 if unterminated.
 *
 * Needed because a helper's PARAMETER LIST can legitimately contain nested
 * parentheses, and the naive `\(([^)]*)\)` this file used to rely on stops at
 * the first one. The shape that broke it is the repo's own idiom for typing a
 * Playwright page without an import statement:
 *
 *     const openVariant = async (page: import('@playwright/test').Page, …) => {
 *
 * `[^)]*` truncates the params at `import('@playwright/test'`, the `=>` no
 * longer follows, the whole helper goes undetected, and every title it clicks
 * silently drops out of the audit. Three specs use that idiom.
 */
function matchParen (src, openParenIdx) {
    let depth = 0
    let inStr = null
    for (let i = openParenIdx; i < src.length; i++) {
        const c = src[i]
        if (inStr) {
            if (c === '\\') { i++; continue }
            if (c === inStr) inStr = null
            continue
        }
        if (c === "'" || c === '"' || c === '`') { inStr = c; continue }
        if (c === '(') depth++
        else if (c === ')') {
            depth--
            if (depth === 0) return i
        }
    }
    return -1
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

/**
 * Split a parameter list on TOP-LEVEL commas only. A plain `split(',')`
 * misaligns the parameter INDEX — and therefore which argument the auditor
 * reads at each call site — as soon as one parameter's type carries a comma
 * of its own (`Record<string, string>`, an inline object type, a default
 * value that is an object literal).
 */
function splitParams (rawParams) {
    if (!rawParams.length) return []
    const out = []
    let depth = 0
    let inStr = null
    let cur = ''
    for (let i = 0; i < rawParams.length; i++) {
        const c = rawParams[i]
        if (inStr) {
            cur += c
            if (c === '\\') { i++; cur += rawParams[i] ?? ''; continue }
            if (c === inStr) inStr = null
            continue
        }
        if (c === "'" || c === '"' || c === '`') { inStr = c; cur += c; continue }
        if (c === '(' || c === '[' || c === '{' || c === '<') { depth++; cur += c; continue }
        if (c === ')' || c === ']' || c === '}' || c === '>') { depth--; cur += c; continue }
        if (c === ',' && depth === 0) { out.push(cur); cur = ''; continue }
        cur += c
    }
    if (cur.trim().length) out.push(cur)
    return out
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
 *
 * RECEIVER IS RESTRICTED TO `page.` — deliberately, not incidentally. The
 * Variant sidebar lives in Histoire's top-level DOM, so a real navigation
 * click can only ever be `page.getByText(…)` / `page.getByRole('link', …)`.
 * Every component under test is rendered inside a sandboxed `<iframe
 * src="…__sandbox…">`, reached via `page.frameLocator(…)` and commonly
 * aliased to a local var (`sandbox`, `sandboxH`, `sb`, or something
 * component-specific like `trigger` / `feedbackSpan` — there is no fixed
 * naming convention, dozens of distinct names exist across specs). A
 * `sandbox.getByText('Index 500').click()` targets an in-iframe CTA button
 * of the component being tested, NOT a Variant title, even though the
 * regex shape is identical. `page.getByText` cannot see inside that
 * iframe at all (Playwright locators don't pierce iframes without an
 * explicit `frameLocator`), so anchoring on the literal `page.` receiver
 * is both necessary and sufficient to tell the two apart — no need to
 * enumerate sandbox alias names. Verified false positive this fixed:
 * virtual-scroll-jump.spec.ts's `sandbox.getByText('Index 500' /
 * 'Top').click()` on OrigamVirtualScroll's jump buttons (no `data-cy`
 * on those buttons at the time of the report). Do NOT drop this filter
 * thinking it's redundant with the `getByRole('link')` role restriction
 * above/below — that one guards against a different receiver (`page`)
 * targeting the wrong ARIA role; this one guards against the right
 * ARIA-shaped call targeting the wrong (in-iframe) receiver.
 */
const CLICK_TARGET_IDENT_RES = [
    /\bpage\.getByText\(\s*([A-Za-z_$][\w$]*)\b[^)]*\)[\s\S]{0,150}?\.click\(/g,
    // Restricted to role 'link' — that's the ARIA role Histoire renders its
    // sidebar Variant navigation entries with. `getByRole('button', …)` /
    // `getByRole('checkbox', …)` target in-sandbox controls and must NOT be
    // mistaken for Variant navigation (false positives were observed on
    // picker-overlay.spec.ts's `getByRole('checkbox', { name: 'active' })`).
    /\bpage\.getByRole\(\s*'link'\s*,\s*\{[^}]*\bname:\s*([A-Za-z_$][\w$]*)\b[^)]*\)[\s\S]{0,150}?\.click\(/g,
    // ES6 SHORTHAND — `{ name, exact: true }`, where the option's value is the
    // same-named local variable and there is no colon at all. The `name:`
    // form above cannot match it, so file-field.spec.ts's ten navigations
    // were invisible. The captured identifier IS `name`, hence the constant
    // capture group.
    /\bpage\.getByRole\(\s*'link'\s*,\s*\{\s*(name)\s*[,}][^)]*\)[\s\S]{0,150}?\.click\(/g
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
    // Only the DECLARATION HEAD is matched by regex; the parameter list is
    // then scanned with balanced parens (see `matchParen`) instead of being
    // captured by `[^)]*`, which truncated on any nested `(`.
    const headRe = /(?:\b(?:async\s+function|function)\s+([A-Za-z_$][\w$]*)\s*\()|(?:\b(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\()/g
    let m
    while ((m = headRe.exec(specSrc)) !== null) {
        const name = m[1] || m[2]
        const openParen = m.index + m[0].length - 1
        const closeParen = matchParen(specSrc, openParen)
        if (closeParen === -1) continue
        const rawParams = specSrc.slice(openParen + 1, closeParen).trim()

        // After the params: an optional return-type annotation, then either
        // `=> {` (arrow) or `{` (function declaration). Anything else — an
        // expression-bodied arrow, a call, a tuple — is not a helper body.
        const after = specSrc.slice(closeParen + 1)
        const bodyRe = m[1] ? /^\s*(?::[^{]*)?\{/ : /^\s*(?::[^={]*)?=>\s*\{/
        const bm = bodyRe.exec(after)
        if (!bm) continue
        const braceIdx = closeParen + 1 + bm[0].length - 1
        headRe.lastIndex = braceIdx

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

        const rawParamList = splitParams(rawParams)
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

    // Direct: page.getByText('Title', { exact: true }) … .click()
    // Receiver restricted to `page.` — see the CLICK_TARGET_IDENT_RES
    // comment above for why. Without it this matched e.g.
    // `sandbox.getByText('Index 500').click()` (an in-iframe CTA click on
    // the component under test, not a Variant sidebar navigation) as a
    // false positive.
    const gbt = /\bpage\.getByText\(\s*'((?:[^'\\]|\\.)*)'\s*(?:,\s*\{[^}]*\})?\s*\)/g
    let m
    while ((m = gbt.exec(specSrc)) !== null) {
        const idx = gbt.lastIndex
        const tail = specSrc.slice(idx, idx + 80)
        if (/\.\s*(first|nth|last)\s*\([^)]*\)\s*\.?\s*click|\.\s*click/.test(tail)) {
            titles.add(m[1].replace(/\\'/g, "'"))
        }
    }
    // Direct: page.getByRole('link', { name: 'Title', exact: true }) … .click()
    // Restricted to role 'link' — see CLICK_TARGET_IDENT_RES note above on
    // why 'button' / 'checkbox' must NOT be treated as Variant navigation —
    // AND restricted to receiver `page.` for the same reason as `gbt` above.
    const gbr = /\bpage\.getByRole\(\s*'link'\s*,\s*\{[^}]*\bname:\s*'((?:[^'\\]|\\.)*)'[^)]*\)/g
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

/**
 * Proof, on synthetic input, that this auditor actually resolves what it
 * claims to — in BOTH directions.
 *
 * A checker nobody has watched fail is indistinguishable from one that always
 * passes, and this file spent its whole life in that state: it reported "no
 * drift" while silently skipping every spec whose helper it could not parse.
 * Two parsing gaps were found that way, both load-bearing, both fixed here,
 * and both pinned below so they cannot regress:
 *
 *   1. a helper whose parameter list contains `import('@playwright/test')`
 *      — nested parens truncated the old `\(([^)]*)\)` capture;
 *   2. `getByRole('link', { name, exact: true })` — the ES6 SHORTHAND, with
 *      no colon for the old `name:\s*IDENT` pattern to match.
 *
 * The negative cases matter as much: an in-iframe click on a component's own
 * button must NOT be mistaken for sidebar navigation.
 *
 * Fixtures are synthetic strings — nothing is read from or written to the
 * shared worktree, where other agents are live.
 */
/**
 * In-file exemption pragma — `@audit-variant-titles:exempt(<raison>)`.
 *
 * A spec whose Variant titles cannot be resolved statically, for a reason that
 * is a property of the spec rather than a defect, declares it IN ITS OWN
 * HEADER. Deliberately not a list living in this script: an opaque allow-list
 * is read by nobody, drifts from reality, and turns into the very thing this
 * guard exists to prevent — a silence that means nothing.
 *
 * Three properties keep the escape hatch from becoming a rubber stamp:
 *   1. the reason is MANDATORY — `exempt()` with an empty reason is itself a
 *      finding, so the pragma cannot be pasted in as a mute silencer;
 *   2. exempted specs are printed on EVERY run, pass or fail, so the debt is
 *      visible rather than archived;
 *   3. they are counted in their own bucket, never folded into `audited` —
 *      the headline denominator keeps saying what was actually VERIFIED.
 */
const EXEMPT_TAG = '@audit-variant-titles:exempt('

/**
 * The reason is delimited by BALANCED parentheses, not by the first `)`.
 * A non-greedy `\(([\s\S]*?)\)` truncates any reason that quotes code —
 * and reasons quote code constantly ("openVariant(page, STORY, titre)").
 * The truncated tail then vanishes from the report, which is precisely the
 * silent-under-reporting failure this guard is supposed to model, reproduced
 * inside the guard itself. Caught in review; keep the depth counter.
 */
function exemptionOf (src) {
    const start = src.indexOf(EXEMPT_TAG)
    if (start === -1) return null
    let depth = 0
    let end = -1
    for (let i = start + EXEMPT_TAG.length - 1; i < src.length; i++) {
        if (src[i] === '(') depth++
        else if (src[i] === ')') {
            depth--
            if (depth === 0) { end = i; break }
        }
    }
    // Unterminated pragma is not an exemption — it is a malformed one, and
    // must land as a finding rather than quietly exempt the whole file.
    if (end === -1) return { reason: '', valid: false, unterminated: true }
    const raw = src.slice(start + EXEMPT_TAG.length, end)
    // JSDoc continuation asterisks are layout, not reason. Strip them.
    const reason = raw.replace(/^\s*\*+\s?/gm, ' ').replace(/\s+/g, ' ').trim()
    return { reason, valid: reason.length > 0 }
}

function selfTest () {
    const cases = [
        {
            name: "helper typé via import('@playwright/test') → titres résolus",
            src: `const openVariant = async (page: import('@playwright/test').Page, path: string, variant: string) => {
                      await page.goto(path)
                      await page.getByText(variant, { exact: true }).first().click()
                  }
                  openVariant(page, P, 'Design')`,
            wantTitles: ['Design']
        },
        {
            name: 'shorthand getByRole(\'link\', { name }) → titres résolus',
            src: `const nav = async (page: import('@playwright/test').Page, name: string) => {
                      await page.getByRole('link', { name, exact: true }).click()
                  }
                  nav(page, 'Prop — showSize')`,
            wantTitles: ['Prop — showSize']
        },
        {
            name: 'forme longue { name: ident } → toujours résolue (non-régression)',
            src: `const nav = async (page, name) => {
                      await page.getByRole('link', { name: name, exact: true }).click()
                  }
                  nav(page, 'Functional')`,
            wantTitles: ['Functional']
        },
        {
            name: 'clic DANS la sandbox (receiver ≠ page) → ignoré',
            src: `const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
                  await sandbox.getByText('Index 500').click()`,
            wantTitles: []
        },
        {
            name: "getByRole('button') → ignoré (pas une nav de Variant)",
            src: `await page.getByRole('button', { name: 'Submit' }).click()`,
            wantTitles: []
        },
        {
            name: 'slug par concaténation de const → story reconnue',
            src: `const STORY_ID = 'components-stories-btn-origambtn-story-vue'
                  const STORY_PATH = '/stories/story/' + STORY_ID`,
            wantSlugs: ['components-stories-btn-origambtn-story-vue']
        },
        {
            name: 'argument dynamique → signalé comme non résolu, jamais comme sain',
            src: `const openVariant = async (page, title: string) => {
                      await page.getByText(title, { exact: true }).click()
                  }
                  for (const t of LIST) openVariant(page, t)`,
            wantUnresolved: 1
        },
        {
            name: 'pragma exempt avec raison → exemption valide',
            src: `/** @audit-variant-titles:exempt(spec multi-stories : l'union des titres
                   * masquerait un miss par story) */`,
            wantExempt: { valid: true, reasonHas: 'multi-stories' }
        },
        {
            name: 'pragma exempt SANS raison → refusé (pas un silencieux muet)',
            src: `/** @audit-variant-titles:exempt() */`,
            wantExempt: { valid: false }
        },
        {
            name: 'aucun pragma → pas d’exemption (défaut = audité)',
            src: `await page.getByText('Design').click()`,
            wantExempt: null
        },
        {
            name: 'raison contenant des parenthèses → lue ENTIÈRE, non tronquée',
            src: `/** @audit-variant-titles:exempt(l'appel openVariant(page, S, t)
                   * associe un titre à une story, fin de la raison ICI) */`,
            wantExempt: { valid: true, reasonHas: 'fin de la raison ICI' }
        },
        {
            name: 'pragma non refermé → refusé, jamais exempté en silence',
            src: `/** @audit-variant-titles:exempt(raison sans parenthèse fermante`,
            wantExempt: { valid: false }
        }
    ]

    let failed = 0
    for (const c of cases) {
        let ok = true
        let got
        if (c.wantExempt !== undefined) {
            const e = exemptionOf(c.src)
            got = e
            if (c.wantExempt === null) ok = e === null
            else ok = e !== null
                && e.valid === c.wantExempt.valid
                && (!c.wantExempt.reasonHas || e.reason.includes(c.wantExempt.reasonHas))
        } else if (c.wantSlugs) {
            got = [...slugsInSpec(c.src)]
            ok = c.wantSlugs.every((s) => got.includes(s))
        } else {
            const r = clickedTitlesOf(c.src)
            if (c.wantUnresolved !== undefined) {
                got = r.unresolved.length
                ok = got === c.wantUnresolved
            } else {
                got = [...r.titles]
                ok = got.length === c.wantTitles.length && c.wantTitles.every((t) => got.includes(t))
            }
        }
        console.log(`${ok ? '✓' : '✗'} ${c.name}`)
        if (!ok) {
            failed++
            console.log(`    attendu ${JSON.stringify(c.wantExempt ?? c.wantSlugs ?? c.wantTitles ?? c.wantUnresolved)}, obtenu ${JSON.stringify(got)}`)
        }
    }
    console.log(`\n${cases.length - failed}/${cases.length} cas passés.`)
    process.exit(failed ? 1 : 0)
}

if (argv.includes('--self-test')) selfTest()

const storyFiles = walk(STORIES_PKG, (f) => f.endsWith('.story.vue'))
const slugToStory = new Map()
for (const f of storyFiles) slugToStory.set(slugForStory(f), f)

const specFiles = SPEC_DIRS.flatMap((d) => walk(d, (f) => f.endsWith('.spec.ts')))

/**
 * Coverage accounting — the part that makes a clean run MEAN something.
 *
 * This auditor's whole failure mode is that a spec it cannot parse is
 * skipped by a bare `continue`, and its absence from the report is
 * indistinguishable from a pass. That is how "drift résorbé, 55 → 0" came to
 * be announced on the strength of a run that had never looked at most of the
 * suite. From here on the auditor publishes its own denominator, on success
 * as well as on failure, so nobody has to reverse-engineer what it examined.
 *
 * `noStory`  — spec resolves no Histoire slug at all. Expected and legitimate
 *              for the marketing/docs specs, which live in the same folder
 *              but drive the Nuxt site (`/components`, `/theming`, …) under a
 *              different config; they are listed, not silently dropped.
 * `noTitles` — spec targets a story but never navigates by title. These
 *              navigate POSITIONALLY (`?variantId=<slug>-<N>`); nothing here
 *              can check them, and saying so is the point — they are the
 *              province of `audit-variant-pins.mjs`, and the two guards
 *              partition the suite rather than overlap.
 */
const coverage = { total: 0, audited: 0, noStory: [], noTitles: [], titlesChecked: 0, exempt: [] }

const report = []
for (const spec of specFiles) {
    const src = readFileSync(spec, 'utf8')
    coverage.total++
    const rel = relative(TESTS_ROOT, spec)

    // Exemption is evaluated BEFORE slug resolution: the whole point of an
    // exempted spec is that something upstream of title-matching (a missing
    // story, a multi-story helper) makes the match undecidable here.
    const exemption = exemptionOf(src)
    if (exemption) {
        if (!exemption.valid) {
            report.push({
                spec: rel,
                slugs: [],
                unresolvedSlugs: [],
                missingTitles: [],
                unresolvedDynamicArgs: [],
                emptyExemption: true,
                availableTitles: []
            })
            continue
        }
        coverage.exempt.push({ spec: rel, reason: exemption.reason })
        continue
    }

    const slugs = [...slugsInSpec(src)]
    if (!slugs.length) { coverage.noStory.push(rel); continue }
    const { titles: clicked, unresolved } = clickedTitlesOf(src)
    if (!clicked.size && !unresolved.length) { coverage.noTitles.push(rel); continue }
    coverage.audited++
    coverage.titlesChecked += clicked.size

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
            spec: rel,
            slugs,
            unresolvedSlugs,
            missingTitles: missing,
            unresolvedDynamicArgs: unresolved,
            availableTitles: [...knownTitles].sort()
        })
    }
}

/** Coverage banner — printed on EVERY run, pass or fail. */
function printCoverage () {
    const { total, audited, noStory, noTitles, titlesChecked, exempt } = coverage
    const histoireSpecs = total - noStory.length
    console.log(
        `Couverture : ${audited}/${histoireSpecs} specs ciblant une story auditées `
        + `(${titlesChecked} titres cliqués vérifiés) — sur ${total} specs au total.`
    )
    console.log(
        `  ${noTitles.length} ciblent une story mais naviguent par index `
        + `(?variantId=<slug>-N) : hors de portée d'un audit de TITRE, couvertes par `
        + `audit-variant-pins.mjs.`
    )
    console.log(`  ${noStory.length} ne ciblent aucune story (specs marketing/docs).`)
    // Printed unconditionally, pass or fail: an exemption that only shows up
    // when someone thinks to pass a flag is an exemption nobody ever revisits.
    if (exempt.length) {
        console.log(`  ${exempt.length} exemptée(s) par pragma @audit-variant-titles:exempt — NON vérifiée(s) ici :`)
        for (const e of exempt) console.log(`      [exempt] ${e.spec}\n               ↳ ${e.reason}`)
    }
    if (SHOW_SKIPPED) {
        for (const s of noTitles) console.log(`      [index] ${s}`)
        for (const s of noStory) console.log(`      [non-story] ${s}`)
    } else {
        console.log('  (--skipped pour la liste nominative)')
    }
    console.log('')
}

if (AS_JSON) {
    console.log(JSON.stringify({ coverage, report }, null, 2))
} else {
    printCoverage()
    if (!report.length) {
        console.log('✓ No variant-title drift — every clicked title exists in its story.')
    } else {
        console.log(`✗ Variant-title drift in ${report.length} spec(s):\n`)
        for (const r of report) {
            console.log(`• ${r.spec}`)
            if (r.emptyExemption) console.log(`    @audit-variant-titles:exempt() sans raison — une exemption doit se justifier dans le fichier`)
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
