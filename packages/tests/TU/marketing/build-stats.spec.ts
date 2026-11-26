import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { afterAll, describe, expect, it } from 'vitest'

// @ts-expect-error script .mjs sans déclaration de types
import { measure, render } from '../../../marketing/scripts/generate-build-stats.mjs'

const tmp = mkdtempSync(join(tmpdir(), 'build-stats-'))
afterAll(() => rmSync(tmp, { recursive: true, force: true }))

/** Mini-dépôt minimal et valide : 2 familles, 2 types de graphique, 1 story, 1 garde. */
function fixture (name: string, tweak: (root: string) => void = () => {}) {
    const root = join(tmp, name)
    const put = (rel: string, body: string) => {
        mkdirSync(dirname(join(root, rel)), { recursive: true })
        writeFileSync(join(root, rel), body)
    }
    put('packages/ds/package.json', '{"license":"MIT","version":"1.2.3"}')
    put('packages/ds/src/components/A/OrigamA.vue', '')
    put('packages/ds/src/components/B/OrigamB.vue', '')
    put('packages/ds/src/components/index.ts', "export * from './A'\nexport * from './B'\n")
    put('packages/ds/src/enums/Chart/chart.enum.ts', "export enum CHART_TYPE {\n  LINE = 'line',\n  BAR = 'bar'\n}\n")
    put('packages/tests/a11y/components.spec.ts', "const SWEPT_STORIES: readonly string[] = [\n  'components/stories/A/OrigamA.story.vue'\n]\n")
    put('packages/ds/scripts/guards/run-all.mjs', "const GUARDS = [\n  'a.mjs'\n]\n")
    put('packages/tests/TU/x.spec.ts', '')
    put('packages/tests/e2e/y.spec.ts', '')
    put('packages/ds/src/composables/Z/use-z.composable.ts', '')
    put('packages/ds/src/directives/H/h.directive.ts', '')
    tweak(root)
    return root
}

describe('generate-build-stats', () => {
    it('mesure chaque chiffre selon sa définition', () => {
        expect(measure(fixture('ok'), new Date('2026-11-26T23:30:00Z'))).toEqual({
            componentFamilies: 2, chartTypes: 2, a11ySweptStories: 1, unitTestFiles: 1,
            e2eTestFiles: 1, composables: 1, directives: 1, architectureGuards: 1,
            license: 'MIT', version: '1.2.3', measuredOn: '2026-11-26'
        })
    })

    it('échoue si les dossiers de composants et les export * divergent', () => {
        const root = fixture('diverge', r => writeFileSync(join(r, 'packages/ds/src/components/index.ts'), "export * from './A'\n"))
        expect(() => measure(root)).toThrow(/familles/)
    })

    it('échoue (jamais 0 en repli) si une mesure est vide', () => {
        const root = fixture('empty', r => writeFileSync(join(r, 'packages/ds/scripts/guards/run-all.mjs'), 'const GUARDS = [\n]\n'))
        expect(() => measure(root)).toThrow(/architectureGuards = 0/)
    })

    it('échoue si une source a changé de forme', () => {
        const root = fixture('moved', r => writeFileSync(join(r, 'packages/tests/a11y/components.spec.ts'), ''))
        expect(() => measure(root)).toThrow(/SWEPT_STORIES/)
    })

    it('render produit un module typé portant les valeurs mesurées', () => {
        const out = render(measure(fixture('render')))
        expect(out).toContain('export const BUILD_STATS: IBuildStats')
        expect(out).toContain('"componentFamilies": 2')
    })
})
