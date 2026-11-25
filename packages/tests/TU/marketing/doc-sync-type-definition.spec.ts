/********************************************************
 *  DOC SYNC — `definition` of a type is rebuilt from the source (#1088)
 *
 *  @description
 *  A type's `definition` is the declaration line plus, for every enum
 *  interpolated as a whole (`${X}`), a `// Where X is:` block carrying that
 *  enum as it is in the CURRENT source. Positive controls: removing an enum
 *  member / a union member makes it disappear from the definition.
 ********************************************************/

import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

import { extractFile } from '../../../marketing/scripts/extract.mjs'

const ts = createRequire(import.meta.url)('typescript')
const dir = mkdtempSync(join(tmpdir(), 'doc-sync-type-'))
afterAll(() => rmSync(dir, { recursive: true, force: true }))

/** Extract the `types` domain from a throwaway enum + type file pair. */
function extract (enumBody: string, typeSrc: string) {
    const enumFile = join(dir, 'x.enum.ts')
    const typeFile = join(dir, 'x.type.ts')
    writeFileSync(enumFile, `export enum MODE {\n${enumBody}\n}\n`)
    writeFileSync(typeFile, `import { MODE } from './x.enum'\n\n${typeSrc}\n`)
    const program = ts.createProgram([enumFile, typeFile], { noEmit: true, skipLibCheck: true, types: [] })
    return extractFile('types', typeFile, program, program.getTypeChecker())
}

describe('docs:sync — type definition (#1088)', () => {
    it('appends the interpolated enum, verbatim from the current source', () => {
        const [t] = extract("    A = 'a',\n    B = 'b'", 'export type TMode = `${MODE}`')
        expect(t.definition).toBe(
            "export type TMode = `${MODE}`\n\n// Where MODE is:\nexport enum MODE {\n    A = 'a',\n    B = 'b'\n}"
        )
    })

    it('POSITIVE CONTROL: a removed enum member disappears from the expansion', () => {
        const [t] = extract("    A = 'a'", 'export type TMode = `${MODE}`')
        expect(t.definition).toContain("A = 'a'")
        expect(t.definition).not.toContain("B = 'b'")
    })

    it('POSITIVE CONTROL: a removed union member disappears from the definition line', () => {
        const [before] = extract("    A = 'a'", "export type TU = 'x' | 'y'")
        const [after] = extract("    A = 'a'", "export type TU = 'x'")
        expect(before.definition).toContain("'y'")
        expect(after.definition).not.toContain("'y'")
    })

    it('a type with no interpolated enum is the source line alone', () => {
        const [t] = extract("    A = 'a'", "export type TU = 'x' | 'y'")
        expect(t.definition).toBe("export type TU = 'x' | 'y'")
    })

    it('a qualified member `${MODE.A}` adds no expansion', () => {
        const [t] = extract("    A = 'a'", 'export type TU = `${MODE.A}`')
        expect(t.definition).toBe('export type TU = `${MODE.A}`')
    })
})
