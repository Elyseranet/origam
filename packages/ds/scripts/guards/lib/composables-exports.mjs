// Shared source of truth: the REAL list of value symbols exported by the DS
// composables, derived from the filesystem via the TypeScript compiler's own
// AST — never from a regex or a hand-maintained list that can drift.
//
// Provenance: built during the Google Sheet "Composables" tab audit
// (2026-08-21/22) to cross-check a regex-based inventory (colonne-T-2,
// 172 symbols / 135 files) and resolve the sheet's file/symbol row-model
// question. This scan found 174 symbols / 173 distinct names (one
// legitimate collision: `shouldSuppressAutoplay`, exported separately by
// `Media/use-media-player.composable.ts` and `Video/video-player.composable.ts`,
// deliberately kept apart by `composables/index.ts`'s barrel). It also
// caught a real defect independently: a sheet row for `useVModel` pointed
// at `variant.composable.ts` instead of `vModel.composable.ts` (fixed
// upstream, traced in the sheet's R94).
//
// Why AST and not regex: a naive comment/string stripper desyncs on a
// literal URL (`'https://…'` breaks a `//`-line filter) or a `regex`
// literal — this is what undercounted a prior regex-based pass by 2
// symbols (two `export { X } from '…'` re-exports it classified into a
// separate, unprinted bucket). A real parser doesn't have this failure
// mode. Validated against an adversarial fixture containing a URL, a
// regex literal, a comment hiding a fake `//`, and an `export type { X
// as Y }` group re-export (that last one DID break the first version of
// this scanner — `isTypeOnly` lives on the whole `ExportDeclaration` in
// that form, not on each specifier).
//
// Every guard/report that needs "what does this composable file export"
// should import this instead of re-scanning by hand.

import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const DS_ROOT = path.resolve(__dirname, '../../..')
export const COMPOSABLES_DIR = path.join(DS_ROOT, 'src/composables')

function walk (dir) {
    const out = []
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) out.push(...walk(full))
        else if (entry.name.endsWith('.composable.ts')) out.push(full)
    }
    return out
}

// Lists the top-level VALUE exports of one file (function/const/class
// declarations, plus `export { a, b as c }` including the `from '…'`
// re-export form). Deliberately excludes `export type` / `export
// interface` — this inventory answers "what can I call", not "what can I
// type with".
export function listValueExports (file) {
    const source = readFileSync(file, 'utf8')
    const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const exported = []

    for (const stmt of sf.statements) {
        const isExported = stmt.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)

        if (ts.isFunctionDeclaration(stmt) && isExported && stmt.name) {
            exported.push(stmt.name.text)
        } else if (ts.isVariableStatement(stmt) && isExported) {
            for (const decl of stmt.declarationList.declarations) {
                if (ts.isIdentifier(decl.name)) exported.push(decl.name.text)
            }
        } else if (ts.isClassDeclaration(stmt) && isExported && stmt.name) {
            exported.push(stmt.name.text)
        } else if (ts.isExportDeclaration(stmt) && stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
            // `export type { a, b }` carries isTypeOnly on the WHOLE
            // declaration, not per-specifier — miss this and interface/
            // type names leak into a value-only inventory.
            if (stmt.isTypeOnly) continue
            for (const spec of stmt.exportClause.elements) {
                if (spec.isTypeOnly) continue
                exported.push(spec.name.text)
            }
        }
    }

    return exported
}

let cached = null

// Returns [{ file, relFile, symbols }] for every `*.composable.ts` under
// packages/ds/src/composables — `relFile` is relative to COMPOSABLES_DIR,
// matching the "Fichier" column convention used in the audit sheet.
export function getComposableExports () {
    if (cached) return cached
    cached = walk(COMPOSABLES_DIR)
        .sort()
        .map(file => ({
            file,
            relFile: path.relative(COMPOSABLES_DIR, file),
            symbols: listValueExports(file)
        }))
    return cached
}

// Flat (relFile, symbol) pair list — the composite key used by the audit's
// bijection check. One name collision exists across the whole set:
// `shouldSuppressAutoplay` (Media + Video), by design — see header.
export function getComposableExportPairs () {
    const pairs = []
    for (const { relFile, symbols } of getComposableExports()) {
        for (const symbol of symbols) pairs.push({ relFile, symbol })
    }
    return pairs
}
