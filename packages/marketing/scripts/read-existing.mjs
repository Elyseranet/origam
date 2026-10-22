/**
 * read-existing.mjs — load the curated object out of an existing
 * src/consts/<domain>/<slug>.const.ts file WITHOUT executing project code.
 *
 * The files are pure data modules. Their only real imports are TYPE-ONLY
 * `import type { IXxxDoc } from '~/...'` (the '~' alias node cannot resolve),
 * but example `code` strings frequently contain `import … from 'vue'` lines at
 * column 0 INSIDE template literals — a naïve regex strip would corrupt them.
 *
 * So we parse with the TypeScript compiler and remove ONLY the real top-level
 * `import` declarations by their AST span (single- AND multi-line), leaving
 * string contents untouched. The cleaned module is transpiled TS→JS and
 * imported as a data: URL. The returned object holds the curated fields
 * (descriptions, examples, usedBy…) we must preserve across regeneration.
 */

import { createRequire } from 'node:module'
import fs from 'node:fs'

const require = createRequire(import.meta.url)
/** @type {import('typescript')} */
const ts = require('typescript')

/**
 * @param {string} filePath absolute path to the existing .const.ts
 * @returns {Promise<{ exportName: string, doc: any } | null>}
 */
export async function readExistingDoc (filePath) {
    let src
    try { src = fs.readFileSync(filePath, 'utf-8') } catch { return null }

    // Remove every real top-level import declaration by its exact source span,
    // so multi-line `import type { … }` blocks go cleanly and in-string example
    // `import …` lines are preserved.
    const sf = ts.createSourceFile(filePath, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const ranges = []
    sf.forEachChild((node) => {
        if (ts.isImportDeclaration(node) || ts.isImportEqualsDeclaration(node)) {
            ranges.push([node.getStart(sf), node.getEnd()])
        }
    })
    let cleaned = src
    for (const [start, end] of ranges.sort((a, b) => b[0] - a[0])) {
        cleaned = cleaned.slice(0, start) + cleaned.slice(end)
    }

    const out = ts.transpileModule(cleaned, {
        compilerOptions: {
            target: ts.ScriptTarget.ES2022,
            module: ts.ModuleKind.ESNext,
            removeComments: false,
        },
    })

    const dataUrl = 'data:text/javascript;base64,' + Buffer.from(out.outputText).toString('base64')
    let mod
    try { mod = await import(dataUrl) } catch { return null }

    const exportName = Object.keys(mod).find(k => k.endsWith('_DOC'))
    if (!exportName) return null
    return { exportName, doc: mod[exportName] }
}
