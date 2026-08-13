#!/usr/bin/env node
/**
 * Guard 2 — the DS ships no CSS rule that targets a `--variant-*` class,
 * and no `!important` inside such a rule.
 *
 * SOURCE OF THE RULE: ADR-005 (packages/docs/internal/adr-005-variant-as-props-preset.md),
 * decision D3 — "The class survives; the DS ships no rule for it". The
 * `--variant-{value}` class (emitted by `useVariant()`) is kept as a pure
 * consumer override hook: the DS itself must never attach styling to it.
 * ADR-005 spells out the exact grep this guard formalises:
 *
 *   grep -rE '--variant-' packages/ds/src --include='*.vue' --include='*.scss'
 *   must return no *selector* (comments excepted).
 *
 * WHY THIS MATTERS (the incident that motivated the ADR): OrigamBtn shipped
 * `&--variant-outlined { background-color: transparent !important; }`. Per
 * the CSS cascade, an `!important` author rule outranks a normal inline
 * style, so no prop the consumer could set would ever paint over it — the
 * exact bug ADR-005 exists to fix. Re-introducing either half (a
 * variant-target selector, or `!important` inside one) reopens it.
 *
 * WHAT COUNTS AS "IN CURRENT SCOPE" TODAY (documented, not silent)
 * -------------------------------------------------------------------
 * As of this guard's introduction, ADR-005's migration has NOT landed on
 * `develop` yet (only the ADR itself, and the guard, have). `OrigamBtn`,
 * `OrigamBtnGroup` and `OrigamKbd` (the ADR's own pilot!) all still carry
 * `&--variant-*` blocks. Those are grandfathered in the baseline — this
 * guard does not perform or claim to perform the migration; it only stops
 * the debt from growing while ADR-005 D7's migration is executed
 * component by component.
 *
 * DETECTION — see lib/scss-scan.mjs for the "why not a bare regex" story
 * (SCSS `#{$this}` interpolation braces would desync a naive brace
 * counter). Comments are stripped first so a `--variant-` mention inside a
 * `//` or `/* *\/` comment never counts, matching the ADR's "comments
 * excepted" clause literally.
 *
 * Scans every `<style>` block of every `.vue` file under `packages/ds/src`
 * (there are currently no standalone `.scss` component files, but the glob
 * covers them too for the same reason ADR-005's grep does).
 *
 * Run: `node packages/ds/scripts/guards/no-variant-css.mjs`
 * (or `pnpm -F origam guards:variant-css`)
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse as parseSFC } from 'vue/compiler-sfc'
import { stripComments, findBlocks, lineOf } from './lib/scss-scan.mjs'
import { report, writeBaseline } from './lib/baseline.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DS_ROOT = path.resolve(__dirname, '../..')
const REPO_ROOT = path.resolve(DS_ROOT, '../..')
const SRC_DIR = path.join(DS_ROOT, 'src')
const BASELINE_PATH = path.join(__dirname, 'baseline/no-variant-css.json')

const VARIANT_SELECTOR_RE = /--variant-[a-z0-9-]+/

function walkFiles (dir, predicate) {
    const out = []
    for (const entry of readdirSync(dir)) {
        const full = path.join(dir, entry)
        const st = statSync(full)
        if (st.isDirectory()) out.push(...walkFiles(full, predicate))
        else if (predicate(full)) out.push(full)
    }
    return out
}

function scanStyleContent (rawContent, fileContent, blockOffsetInFile, relFile, violations) {
    const stripped = stripComments(rawContent)
    const blocks = findBlocks(stripped)

    for (const block of blocks) {
        if (!VARIANT_SELECTOR_RE.test(block.header)) continue

        const absoluteOpen = blockOffsetInFile + block.openIndex
        const line = lineOf(fileContent, absoluteOpen)
        const selectorId = `${relFile}::selector::${block.header.replace(/\s+/g, ' ')}`
        violations.set(selectorId, `${relFile}:${line} — selector targets a variant class: \`${block.header}\``)

        const blockBody = stripped.slice(block.openIndex, block.closeIndex + 1)
        if (blockBody.includes('!important')) {
            let searchFrom = 0
            let idx
            let occurrence = 0
            while ((idx = blockBody.indexOf('!important', searchFrom)) !== -1) {
                occurrence++
                const absoluteIdx = blockOffsetInFile + block.openIndex + idx
                const impLine = lineOf(fileContent, absoluteIdx)
                const impId = `${relFile}::important::${block.header.replace(/\s+/g, ' ')}::${occurrence}`
                violations.set(impId, `${relFile}:${impLine} — !important inside a variant-targeting block (\`${block.header}\`)`)
                searchFrom = idx + 1
            }
        }
    }
}

function run () {
    const vueFiles = walkFiles(SRC_DIR, f => f.endsWith('.vue') && !f.endsWith('.story.vue'))
    const scssFiles = walkFiles(SRC_DIR, f => f.endsWith('.scss'))
    const violations = new Map()

    for (const file of vueFiles) {
        const content = readFileSync(file, 'utf8')
        const relFile = path.relative(REPO_ROOT, file)
        let descriptor
        try {
            ;({ descriptor } = parseSFC(content, { filename: file }))
        } catch (err) {
            console.error(`Failed to parse SFC ${relFile}: ${err.message}`)
            process.exitCode = 1
            continue
        }
        for (const styleBlock of descriptor.styles) {
            scanStyleContent(styleBlock.content, content, styleBlock.loc.start.offset, relFile, violations)
        }
    }

    for (const file of scssFiles) {
        const content = readFileSync(file, 'utf8')
        const relFile = path.relative(REPO_ROOT, file)
        scanStyleContent(content, content, 0, relFile, violations)
    }

    if (process.argv.includes('--update-baseline')) {
        const written = writeBaseline(BASELINE_PATH, violations.keys())
        console.log(`Baseline written: ${written.length} entr${written.length === 1 ? 'y' : 'ies'} -> ${BASELINE_PATH}`)
        process.exit(0)
    }

    const exitCode = report({
        guardName: 'no-variant-css (no DS rule may target a --variant-* class; no !important inside one)',
        baselinePath: BASELINE_PATH,
        currentIds: violations.keys(),
        detailsById: violations,
        fixHint: 'Per ADR-005 D1-D3: express the variant as a props preset (consts/{Component}/{component}-variant.const.ts) instead of a CSS rule. The --variant-{value} class must remain a bare, unstyled override hook.'
    })
    process.exit(exitCode || process.exitCode || 0)
}

run()
