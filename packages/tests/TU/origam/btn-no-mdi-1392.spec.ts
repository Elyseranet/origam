// @vitest-environment node
/*********************************************************
 * #1392 — un Btn sans icône n'embarque pas le jeu d'icônes MDI
 *
 * Le budget se mesure sur le GRAPHE D'IMPORTS, pas sur un bundle : un
 * bundler qui tree-shake bien (Rolldown, Rollup) masque le défaut, un autre
 * le garde. `consts/Commons/mdi.const.ts` étale `MDI_ICONS` (~7 000 alias,
 * ~430 Kio) dans un objet de premier niveau : le bundler ne peut pas l'écarter
 * à coup sûr. Aucun composant qui n'a besoin que de `useIcon` ne doit donc
 * l'atteindre.
 ********************************************************/
import { existsSync, readFileSync } from 'node:fs'
import { dirname, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), '../../../ds/src')
const IMPORT = /(?:import|export)\s[^'"]*?from\s+['"]([^'"]+)['"]|import\s+['"]([^'"]+)['"]/g

function reachable (entry: string): string[] {
    const seen = new Set<string>()
    const walk = (file: string) => {
        if (seen.has(file)) return
        seen.add(file)
        for (const m of readFileSync(file, 'utf8').matchAll(IMPORT)) {
            const spec = m[1] ?? m[2]
            if (!spec.startsWith('.')) continue
            const base = normalize(resolve(dirname(file), spec))
            const hit = [`${base}.ts`, `${base}.vue`, `${base}/index.ts`, base].find(c => /\.(ts|vue)$/.test(c) && existsSync(c))
            if (hit) walk(hit)
        }
    }
    walk(resolve(SRC, entry))
    return [...seen].map(f => f.slice(SRC.length + 1))
}

describe('graphe d\'imports sans icône (#1392)', () => {
    for (const entry of ['components/Btn/index.ts', 'components/Icon/index.ts', 'components/Avatar/index.ts']) {
        it(`${entry} n'atteint ni mdi.const.ts ni createIcons`, () => {
            const files = reachable(entry)
            expect(files.length).toBeGreaterThan(10) // témoin : le parcours a bien lieu
            expect(files).not.toContain('consts/Commons/mdi.const.ts')
            expect(files).not.toContain('composables/Icon/iconsFull.composable.ts')
        })
    }

    it('témoin : le barrel des composables, lui, atteint createIcons', () => {
        expect(reachable('composables/index.ts')).toContain('composables/Icon/iconsFull.composable.ts')
    })
})
