#!/usr/bin/env node
/**
 * i18n-check.mjs — static audit of the marketing site's i18n surface.
 *
 * WHY
 *   No i18n check existed before this script: 400+ keys referenced by the
 *   code have no definition in any locale file, with nothing catching it.
 *   A third of those references don't even go through `t()` directly — they
 *   flow through the project's "*Key" / "*Fallback" prop convention
 *   (`labelKey: 'theming.group.color', labelFallback: 'Color'`, translated
 *   later by a receiving component). An extractor that only looks for
 *   `t(` misses that entire channel.
 *
 * FOUR CHECKS
 *   1. Key referenced without a definition       (WARNING — see gating note)
 *   2. EN/FR parity: same leaf keys + same {placeholders} (WARNING)
 *   3. Zero hardcoded strings in templates        (BLOCKING)
 *   4. Hygiene: dead keys, snake_case, unescaped @ (WARNING, informational)
 *
 * GATING (sequencing, see project ticket)
 *   Checks 1 and 2 run in WARNING mode for now: ~400 keys are missing and
 *   ~93 FR values disagree with EN today. Flipping the gate to blocking
 *   immediately would make the job red on day one — a red job nobody can
 *   action is a job everyone ignores (see #296 / #308). Check 3 is BLOCKING:
 *   only 7 static attributes + 1 static text node exist in the whole
 *   codebase today (already fixed as of this script landing), so it starts
 *   clean and stays enforced from day one.
 *
 * EXTRACTION STRATEGY
 *   Channel A — `t('key', 'fallback'[, {named}])` calls, via `useT()`.
 *     Regex-extracted directly from source text (works uniformly for
 *     <script>/<script setup> blocks in .vue AND plain .ts files).
 *   Channel B — the "*Key" / "*Fallback" maison prop convention. A literal
 *     object property named `fooKey` (or `i18nKey`) holding a dotted
 *     snake_case string is an i18n key reference, even though no `t(` call
 *     appears at that exact source location — the key is threaded through a
 *     prop/const and translated later by a *different* component. Detected
 *     by requiring the literal to look like a real key (at least one `.`,
 *     every segment lowercase snake_case) — this also naturally excludes the
 *     unrelated `errorKey` (holds error CODES like 'wrong_password', no dot)
 *     and `componentKey`/`compKey` (hold identifiers like 'origam-btn', no
 *     dot) found during the codebase survey.
 *   Channel C — a short, explicit allowlist for the few call sites that
 *     build a key via template-literal interpolation from a small closed
 *     set of suffixes (see DYNAMIC_KEY_ALLOWLIST below). These can't be
 *     statically resolved from the call site; the allowlist documents
 *     exactly which concrete keys they resolve to and why.
 *
 * CHECK 3 IMPLEMENTATION NOTE
 *   Uses `@vue/compiler-sfc`'s `parse()` to isolate the raw `<template>`
 *   block source, then `@vue/compiler-dom`'s `parse()` directly on that
 *   source — NOT `compileTemplate()`. `compileTemplate()` runs the full
 *   transform/codegen pipeline, which hoists and merges adjacent text
 *   nodes; that would make the text-node scan under/over-count. The raw
 *   `compiler-dom` AST preserves nodes exactly as authored.
 *
 * USAGE
 *   node scripts/i18n-check.mjs [--json] [--strict-warnings]
 *   pnpm -F @origam/marketing i18n:check
 *
 * FLAGS
 *   --json             machine-readable report on stdout instead of the
 *                       human summary.
 *   --strict-warnings  also fail (exit 1) on WARNING-level findings —
 *                       intended for a future ticket once checks 1/2 are
 *                       cleaned up, NOT for day-to-day CI.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse as parseSFC } from '@vue/compiler-sfc'
import { parse as parseTemplate, NodeTypes } from '@vue/compiler-dom'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MARKETING_ROOT = path.resolve(__dirname, '..')
const SRC_DIR = path.join(MARKETING_ROOT, 'src')
const LOCALES_DIR = path.join(SRC_DIR, 'assets', 'locales')
const LOCALE_CODES = ['en', 'fr']

const ARGS = process.argv.slice(2)
const JSON_OUTPUT = ARGS.includes('--json')
const STRICT_WARNINGS = ARGS.includes('--strict-warnings')

// Attributes that carry genuinely user-facing text when static. Everything
// else (class, id, tag, href, item-title, data-cy, role, …) is layout/wiring,
// not copy — deliberately NOT included, or every config-string prop in the
// codebase (e.g. `item-title="title"` telling <origam-select> which field to
// read) would false-positive.
const TRANSLATABLE_ATTRS = new Set(['aria-label', 'title', 'placeholder', 'alt'])

// Channel C — explicit allowlist for keys built via template-literal
// interpolation the static scan can't resolve from the call site. Each entry
// documents exactly where it comes from so a future reader can re-verify it
// against the source rather than trusting this list blindly.
const DYNAMIC_KEY_ALLOWLIST = [
    // src/pages/changelog.vue:36-45 — `t(`changelog.type.${type}`, ...)`,
    // `type` ranges over the literal keys of the local `fallbacks` map.
    'changelog.type.unreleased',
    'changelog.type.major',
    'changelog.type.minor',
    'changelog.type.patch',
    // src/pages/changelog.vue:47-56 — `t(`changelog.highlight.${type}`, ...)`
    'changelog.highlight.added',
    'changelog.highlight.changed',
    'changelog.highlight.fixed',
    'changelog.highlight.deprecated'
]

// Fields whose translation is resolved at runtime from the database (doc
// reference tables), not from any static string in this repo — see
// `server/utils/reference-mappers.ts` (`descriptionKey: row.description_key`).
// Static extraction cannot enumerate these; documented here so check 1 does
// not misreport them, rather than silently missing them without explanation.
const DB_BACKED_KEY_FIELDS_NOTE =
    'descriptionKey/descriptionFallback on components|directives|types|enums|interfaces|consts|composables|utils ' +
    'catalog pages are populated from server/db (reference-mappers.ts) at runtime, not from static literals in src/. ' +
    'Out of scope for static extraction by design.'

function listFiles(dir, extensions, out = []) {
    if (!fs.existsSync(dir)) return out

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)

        if (entry.isDirectory()) {
            listFiles(full, extensions, out)
        } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
            out.push(full)
        }
    }

    return out
}

function flatten(obj, prefix = '', out = {}) {
    for (const [key, value] of Object.entries(obj)) {
        const flatKey = prefix ? `${prefix}.${key}` : key

        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            flatten(value, flatKey, out)
        } else {
            out[flatKey] = value
        }
    }

    return out
}

function loadLocaleMessages(code) {
    const file = `${code}.json`
    const filePath = path.join(LOCALES_DIR, file)

    if (!fs.existsSync(filePath)) {
        return { merged: {}, file: null }
    }

    const merged = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

    return { merged, file }
}

function extractPlaceholders(value) {
    if (typeof value !== 'string') return []

    const matches = value.match(/\{[a-zA-Z_][a-zA-Z0-9_]*\}/g) ?? []

    return [...new Set(matches)].sort()
}

function isLikelyI18nKey(literal) {
    return /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(literal)
}

function lineAt(source, offset) {
    return source.slice(0, offset).split('\n').length
}

// ---------------------------------------------------------------------------
// Channel A — t('key', 'fallback'[, {named}]) via useT()
// ---------------------------------------------------------------------------
function extractChannelA(source, filePath, refs) {
    const re = /\$?\bt\(\s*(['"`])((?:(?!\1)[^\\]|\\.)*)\1/g
    let match

    while ((match = re.exec(source)) !== null) {
        const key = match[2]

        if (!key) continue

        addRef(refs, key, filePath, lineAt(source, match.index), 'A')
    }
}

// ---------------------------------------------------------------------------
// Channel B — the "*Key" maison prop convention: fooKey: 'namespace.leaf'
// ---------------------------------------------------------------------------
function extractChannelB(source, filePath, refs) {
    const re = /\b(\w*Key)\s*:\s*(['"`])((?:(?!\2)[^\\]|\\.)*)\2/g
    let match

    while ((match = re.exec(source)) !== null) {
        const literal = match[3]

        if (!isLikelyI18nKey(literal)) continue

        addRef(refs, literal, filePath, lineAt(source, match.index), 'B')
    }
}

function addRef(refs, key, filePath, line, channel) {
    if (!refs.has(key)) {
        refs.set(key, [])
    }

    refs.get(key).push({ file: path.relative(MARKETING_ROOT, filePath), line, channel })
}

// ---------------------------------------------------------------------------
// Check 3 — zero hardcoded strings in .vue templates (AST-based)
// ---------------------------------------------------------------------------
function walkTemplateAst(node, cb) {
    if (!node) return

    cb(node)

    if (node.children) {
        for (const child of node.children) walkTemplateAst(child, cb)
    }
}

function checkHardcodedStrings(vueFiles) {
    const violations = []

    for (const filePath of vueFiles) {
        const source = fs.readFileSync(filePath, 'utf-8')
        let descriptor

        try {
            ;({ descriptor } = parseSFC(source, { filename: filePath }))
        } catch (e) {
            violations.push({
                file: path.relative(MARKETING_ROOT, filePath),
                line: 0,
                kind: 'parse-error',
                detail: e.message
            })
            continue
        }

        if (!descriptor.template) continue

        const templateContent = descriptor.template.content
        const templateStartOffset = descriptor.template.loc.start.offset
        let ast

        try {
            ast = parseTemplate(templateContent, { comments: true })
        } catch (e) {
            violations.push({
                file: path.relative(MARKETING_ROOT, filePath),
                line: 0,
                kind: 'parse-error',
                detail: e.message
            })
            continue
        }

        walkTemplateAst(ast, (node) => {
            if (node.type === NodeTypes.ELEMENT) {
                for (const prop of node.props ?? []) {
                    if (
                        prop.type === NodeTypes.ATTRIBUTE &&
                        TRANSLATABLE_ATTRS.has(prop.name) &&
                        prop.value &&
                        prop.value.content.trim().length > 0
                    ) {
                        const absoluteOffset = templateStartOffset + prop.loc.start.offset

                        violations.push({
                            file: path.relative(MARKETING_ROOT, filePath),
                            line: lineAt(source, absoluteOffset),
                            kind: 'static-attribute',
                            detail: `${node.tag} ${prop.name}="${prop.value.content}"`
                        })
                    }
                }
            }

            if (node.type === NodeTypes.TEXT && node.content.trim().length > 0 && /[a-zA-Z]{2,}/.test(node.content)) {
                const absoluteOffset = templateStartOffset + node.loc.start.offset

                violations.push({
                    file: path.relative(MARKETING_ROOT, filePath),
                    line: lineAt(source, absoluteOffset),
                    kind: 'static-text',
                    detail: JSON.stringify(node.content.trim().slice(0, 80))
                })
            }
        })
    }

    return violations
}

// ---------------------------------------------------------------------------
// Check 4 — hygiene (warnings)
// ---------------------------------------------------------------------------
function checkSnakeCase(flatKeys) {
    const bad = []

    for (const key of Object.keys(flatKeys)) {
        for (const segment of key.split('.')) {
            if (!/^[a-z][a-z0-9_]*$/.test(segment)) {
                bad.push({ key, segment })
                break
            }
        }
    }

    return bad
}

function checkUnescapedAt(flatKeys, code) {
    const bad = []

    for (const [key, value] of Object.entries(flatKeys)) {
        if (typeof value !== 'string') continue

        const withoutEscaped = value.replaceAll("{'@'}", '')

        if (withoutEscaped.includes('@')) {
            bad.push({ code, key, value })
        }
    }

    return bad
}

function main() {
    const vueFiles = listFiles(SRC_DIR, ['.vue'])
    const tsFiles = listFiles(SRC_DIR, ['.ts'])
    const allSourceFiles = [...vueFiles, ...tsFiles]

    // -------- extraction (channels A + B) --------
    const refs = new Map()

    for (const filePath of allSourceFiles) {
        const source = fs.readFileSync(filePath, 'utf-8')

        extractChannelA(source, filePath, refs)
        extractChannelB(source, filePath, refs)
    }

    for (const key of DYNAMIC_KEY_ALLOWLIST) {
        if (!refs.has(key)) {
            refs.set(key, [{ file: '(allowlist)', line: 0, channel: 'C' }])
        }
    }

    // -------- load locales --------
    const locales = {}

    for (const code of LOCALE_CODES) {
        const { merged, file } = loadLocaleMessages(code)

        locales[code] = { merged, file, flat: flatten(merged) }
    }

    // -------- check 1: referenced but undefined --------
    const missingByLocale = {}

    for (const code of LOCALE_CODES) {
        const flat = locales[code].flat
        const missing = []

        for (const [key, sites] of refs.entries()) {
            if (!(key in flat)) {
                missing.push({ key, sites })
            }
        }

        missingByLocale[code] = missing.sort((a, b) => a.key.localeCompare(b.key))
    }

    // -------- check 2: EN/FR parity (leaf keys + placeholders) --------
    const [baseCode, compareCode] = LOCALE_CODES
    const baseFlat = locales[baseCode].flat
    const compareFlat = locales[compareCode].flat
    const baseKeys = new Set(Object.keys(baseFlat))
    const compareKeys = new Set(Object.keys(compareFlat))

    const onlyInBase = [...baseKeys].filter((k) => !compareKeys.has(k)).sort()
    const onlyInCompare = [...compareKeys].filter((k) => !baseKeys.has(k)).sort()

    const placeholderMismatches = []

    for (const key of baseKeys) {
        if (!compareKeys.has(key)) continue

        const basePlaceholders = extractPlaceholders(baseFlat[key])
        const comparePlaceholders = extractPlaceholders(compareFlat[key])

        if (JSON.stringify(basePlaceholders) !== JSON.stringify(comparePlaceholders)) {
            placeholderMismatches.push({
                key,
                [baseCode]: basePlaceholders,
                [compareCode]: comparePlaceholders
            })
        }
    }

    const parityGapCount = onlyInBase.length + onlyInCompare.length + placeholderMismatches.length

    // -------- check 3: hardcoded strings (blocking) --------
    const hardcodedViolations = checkHardcodedStrings(vueFiles)

    // -------- check 4: hygiene (warnings) --------
    const referencedKeys = new Set(refs.keys())
    const deadKeys = {}

    for (const code of LOCALE_CODES) {
        deadKeys[code] = Object.keys(locales[code].flat)
            .filter((k) => !referencedKeys.has(k))
            .sort()
    }

    const snakeCaseIssues = {}
    const unescapedAt = []

    for (const code of LOCALE_CODES) {
        snakeCaseIssues[code] = checkSnakeCase(locales[code].flat)
        unescapedAt.push(...checkUnescapedAt(locales[code].flat, code))
    }

    // -------- report --------
    const totalMissing = missingByLocale[baseCode].length + missingByLocale[compareCode].length
    const report = {
        summary: {
            referencedKeysTotal: refs.size,
            channelBReferencedKeys: [...refs.values()].filter((sites) => sites.some((s) => s.channel === 'B')).length,
            localeFiles: Object.fromEntries(LOCALE_CODES.map((c) => [c, locales[c].file])),
            missingKeysByLocale: Object.fromEntries(LOCALE_CODES.map((c) => [c, missingByLocale[c].length])),
            parityGaps: parityGapCount,
            hardcodedStringViolations: hardcodedViolations.length,
            deadKeysByLocale: Object.fromEntries(LOCALE_CODES.map((c) => [c, deadKeys[c].length])),
            snakeCaseIssuesByLocale: Object.fromEntries(LOCALE_CODES.map((c) => [c, snakeCaseIssues[c].length])),
            unescapedAtCount: unescapedAt.length
        },
        check1_missingKeys: missingByLocale,
        check2_parity: {
            onlyIn: { [baseCode]: onlyInBase, [compareCode]: onlyInCompare },
            placeholderMismatches
        },
        check3_hardcodedStrings: hardcodedViolations,
        check4_hygiene: {
            deadKeys,
            snakeCaseIssues,
            unescapedAt,
            note: DB_BACKED_KEY_FIELDS_NOTE
        }
    }

    if (JSON_OUTPUT) {
        console.log(JSON.stringify(report, null, 2))
    } else {
        printHumanReport(report)
    }

    const blockingFailure = hardcodedViolations.length > 0
    const warningFailure = totalMissing > 0 || parityGapCount > 0

    if (blockingFailure) {
        process.exitCode = 1
    } else if (STRICT_WARNINGS && warningFailure) {
        process.exitCode = 1
    } else {
        process.exitCode = 0
    }
}

function printHumanReport(report) {
    const s = report.summary

    console.log('i18n check — packages/marketing\n')
    console.log(`Referenced keys (all channels): ${s.referencedKeysTotal}`)
    console.log(`  of which via channel B (*Key/*Fallback prop convention): ${s.channelBReferencedKeys}`)
    console.log(`Locale files: ${JSON.stringify(s.localeFiles)}\n`)

    console.log('[1] Missing key definitions (WARNING — non-blocking):')
    for (const [code, count] of Object.entries(s.missingKeysByLocale)) {
        console.log(`  ${code}: ${count} referenced key(s) with no definition`)
    }
    if (s.missingKeysByLocale.en + s.missingKeysByLocale.fr > 0) {
        const sampleCode = Object.keys(report.check1_missingKeys)[0]
        const sample = report.check1_missingKeys[sampleCode].slice(0, 10)
        console.log(`  sample (${sampleCode}): ${sample.map((m) => m.key).join(', ')}${report.check1_missingKeys[sampleCode].length > 10 ? ', …' : ''}`)
    }

    console.log('\n[2] EN/FR parity (WARNING — non-blocking):')
    console.log(`  only in en: ${report.check2_parity.onlyIn.en.length}`)
    console.log(`  only in fr: ${report.check2_parity.onlyIn.fr.length}`)
    console.log(`  placeholder mismatches: ${report.check2_parity.placeholderMismatches.length}`)
    console.log(`  total parity gaps: ${s.parityGaps}`)

    console.log('\n[3] Hardcoded strings in templates (BLOCKING):')
    console.log(`  violations: ${s.hardcodedStringViolations}`)
    for (const v of report.check3_hardcodedStrings.slice(0, 20)) {
        console.log(`  ${v.file}:${v.line} [${v.kind}] ${v.detail}`)
    }

    console.log('\n[4] Hygiene (WARNING — informational):')
    console.log(`  dead keys: ${JSON.stringify(s.deadKeysByLocale)}`)
    console.log(`  snake_case issues: ${JSON.stringify(s.snakeCaseIssuesByLocale)}`)
    console.log(`  unescaped @ values: ${s.unescapedAtCount}`)
    console.log(`  note: ${report.check4_hygiene.note}`)

    console.log('')
    if (s.hardcodedStringViolations > 0) {
        console.log(`FAIL — ${s.hardcodedStringViolations} blocking hardcoded-string violation(s).`)
    } else {
        console.log('PASS — no blocking hardcoded-string violations (checks 1/2/4 are warnings for now).')
    }
}

main()
