// #1208 — `origam/utils` must load in plain Node: no runtime path from the
// utils barrel may reach a `.vue` file. Static walk of the value-import graph
// (type-only imports are erased by the build, so they are skipped), because a
// real Node import needs a built dist.
import { existsSync, readFileSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = resolve(__dirname, '../../../ds/src')
const IMPORT_RE = /(?:^|\n)\s*(?:import|export)\s+(?!type\b)[^'"\n]*?from\s+['"](\.[^'"]+)['"]|(?:^|\n)\s*import\s+['"](\.[^'"]+)['"]/g

function resolveModule (from: string, spec: string): string | null {
    const base = resolve(dirname(from), spec)
    for (const c of [base, `${base}.ts`, `${base}/index.ts`]) {
        if (existsSync(c) && statSync(c).isFile()) return c
    }
    return null
}

describe('#1208 — utils barrel reaches no .vue', () => {
    it('no value-import path from utils/index.ts ends in an SFC', () => {
        const entry = resolve(SRC, 'utils/index.ts')
        const seen = new Set<string>()
        const offenders: string[] = []
        const stack: Array<[string, string[]]> = [[entry, []]]

        while (stack.length) {
            const [file, chain] = stack.pop()!
            if (seen.has(file)) continue
            seen.add(file)
            const code = readFileSync(file, 'utf8')
            for (const m of code.matchAll(IMPORT_RE)) {
                const spec = m[1] ?? m[2]
                if (spec.endsWith('.vue')) {
                    offenders.push([...chain, file, spec].map((p) => p.replace(SRC, '')).join(' -> '))
                    continue
                }
                const next = resolveModule(file, spec)
                if (next) stack.push([next, [...chain, file]])
            }
        }

        expect(seen.size).toBeGreaterThan(50)
        expect(offenders).toEqual([])
    })
})
