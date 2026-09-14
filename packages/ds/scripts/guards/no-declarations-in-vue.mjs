#!/usr/bin/env node
/**
 * Guard 1 — no `interface` / `type` / `enum` / business `const` declared
 * inside a `.vue` file.
 *
 * RULE (CLAUDE.md): interfaces go in `src/interfaces/` (I-prefixed), types
 * in `src/types/` (T-prefixed), enums in `src/enums/`, constants in
 * `src/consts/` (SCREAMING_SNAKE_CASE). A `.vue` file only ever IMPORTS
 * these symbols.
 *
 * WHY AST, NOT REGEX
 * -------------------
 * A first pass grepping for `/\b(interface|type|enum)\b/` in `.vue` files
 * counted 38 matches. The real number is 8. The gap is
 * `import { type StyleValue } from 'vue'` — a type-only import, which is
 * NOT a declaration, but contains the literal token `type`. Any regex-based
 * guard reproduces this false-positive rate and gets disabled within a
 * week. This guard parses the extracted `<script>` block with the real
 * TypeScript compiler and only flags the three unambiguous declaration node
 * kinds (`InterfaceDeclaration`, `TypeAliasDeclaration`, `EnumDeclaration`).
 * A type-only import is a completely different node kind
 * (`ImportDeclaration` with `isTypeOnly`/`ImportSpecifier.isTypeOnly`) and
 * is never visited by the declaration walk below — there is no pattern to
 * miss because we never look at imports at all for this part of the check.
 *
 * CONST DETECTION — SCOPED TO `export const` ONLY (see "what this guard does
 * NOT check" below for why the wider check was rejected)
 * ---------------------------------------------------------------------------
 * `<script setup>` legitimately declares dozens of ordinary `const`
 * bindings (`const props = defineProps<...>()`, `const isOpen = ref(false)`),
 * and — verified against this codebase — ALSO dozens of private,
 * never-exported SCREAMING_SNAKE_CASE constants that are pure rendering
 * implementation detail local to one component (`const SVG_WIDTH = 400`,
 * `const PADDING = 20` inside a Chart component's own layout math). Naively
 * flagging every top-level `const SCREAMING_SNAKE = …` produced 152 hits on
 * this repo, of which a manual sample confirmed 0 were exported and all were
 * single-component rendering constants — not the "business constant shared
 * across the app" the `src/consts/*.const.ts` rule targets. That heuristic
 * would have shipped the exact failure mode this file's header warns about:
 * a guard disabled within a week for crying wolf.
 *
 * The one bright line that IS reliable: a `.vue` file has no business
 * `export`-ing a constant at all — exporting from a component's
 * `<script setup>` is itself already an anti-pattern (nothing should import
 * a value FROM a `.vue` file instead of from `src/consts/`), and it is the
 * one shape that unambiguously signals "this was meant to be reused/shared",
 * which is exactly the intent the `consts/` folder rule protects. So this
 * guard flags `export const IDENTIFIER = …` at top level when IDENTIFIER is
 * SCREAMING_SNAKE_CASE. It does NOT flag private, non-exported
 * SCREAMING_SNAKE_CASE locals — see the README's "known limitations"
 * section for the honest account of what that leaves uncovered.
 *
 * Run: `node packages/ds/scripts/guards/no-declarations-in-vue.mjs`
 * (or `pnpm -F origam guards:declarations`)
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse as parseSFC } from 'vue/compiler-sfc'
import ts from 'typescript'
import { report, writeBaseline } from './lib/baseline.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DS_ROOT = path.resolve(__dirname, '../..')
const REPO_ROOT = path.resolve(DS_ROOT, '../..')
const SRC_DIR = path.join(DS_ROOT, 'src')
const BASELINE_PATH = path.join(__dirname, 'baseline/no-declarations-in-vue.json')

const CONST_NAME_RE = /^[A-Z][A-Z0-9_]*$/

function walkVueFiles (dir) {
    const out = []
    for (const entry of readdirSync(dir)) {
        const full = path.join(dir, entry)
        const st = statSync(full)
        if (st.isDirectory()) out.push(...walkVueFiles(full))
        else if (entry.endsWith('.vue') && !entry.endsWith('.story.vue')) out.push(full)
    }
    return out
}

function lineOf (content, offset) {
    let line = 1
    for (let i = 0; i < offset && i < content.length; i++) {
        if (content[i] === '\n') line++
    }
    return line
}

// Recursively collects InterfaceDeclaration / TypeAliasDeclaration /
// EnumDeclaration anywhere in the block, and top-level SCREAMING_SNAKE_CASE
// `const` VariableStatements.
function scanScriptBlock (block, fileContent, relFile, violations) {
    if (!block) return
    const sourceFile = ts.createSourceFile('inline.ts', block.content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)

    function record (kind, name, node) {
        const absoluteOffset = block.loc.start.offset + node.getStart(sourceFile)
        const line = lineOf(fileContent, absoluteOffset)
        const id = `${relFile}::${kind}::${name}`
        violations.set(id, `${relFile}:${line} — ${kind} \`${name}\``)
    }

    function visit (node) {
        if (ts.isInterfaceDeclaration(node)) {
            record('interface', node.name.text, node)
        } else if (ts.isTypeAliasDeclaration(node)) {
            record('type', node.name.text, node)
        } else if (ts.isEnumDeclaration(node)) {
            record('enum', node.name.text, node)
        }
        ts.forEachChild(node, visit)
    }
    visit(sourceFile)

    // Const check: TOP-LEVEL, EXPORTED statements only — see header comment
    // for why a non-exported SCREAMING_SNAKE_CASE local is out of scope.
    for (const stmt of sourceFile.statements) {
        if (!ts.isVariableStatement(stmt)) continue
        const isExported = !!stmt.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)
        if (!isExported) continue
        if (!(stmt.declarationList.flags & ts.NodeFlags.Const)) continue
        for (const decl of stmt.declarationList.declarations) {
            if (ts.isIdentifier(decl.name) && CONST_NAME_RE.test(decl.name.text)) {
                record('const', decl.name.text, decl)
            }
        }
    }
}

function run () {
    const files = walkVueFiles(SRC_DIR)
    const violations = new Map()

    for (const file of files) {
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
        scanScriptBlock(descriptor.scriptSetup, content, relFile, violations)
        scanScriptBlock(descriptor.script, content, relFile, violations)
    }

    if (process.argv.includes('--update-baseline')) {
        const written = writeBaseline(BASELINE_PATH, violations.keys())
        console.log(`Baseline written: ${written.length} entr${written.length === 1 ? 'y' : 'ies'} -> ${BASELINE_PATH}`)
        process.exit(0)
    }

    const exitCode = report({
        guardName: 'no-declarations-in-vue (interface/type/enum/const must live outside .vue)',
        baselinePath: BASELINE_PATH,
        currentIds: violations.keys(),
        detailsById: new Map([...violations.entries()].map(([id, detail]) => [id, detail])),
        fixHint: 'Move the declaration to src/interfaces/ (I prefix), src/types/ (T prefix), src/enums/, or src/consts/ — the .vue file should only import it.'
    })
    process.exit(exitCode || process.exitCode || 0)
}

run()
