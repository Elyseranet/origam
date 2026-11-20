// @vitest-environment node
/*********************************************************
 * #1384 — entrée allégée `createOrigamCore`
 *
 * Fixture : TU/fixtures/lite-entry (4 composants + un thème portant un bloc
 * `components`). Le test BUILD la fixture avec Vite (client, minifié) et mesure
 * les octets gzip -9 des fichiers produits, puis rend la même app côté serveur.
 *
 * Budget : 105 Kio gz de JS et 10 Kio gz de CSS (valeurs du ticket). Le JS
 * inclut Vue lui-même. Ne pas relever ces plafonds sans décision du
 * propriétaire : abaisser après #366.
 ********************************************************/
import { renderToString } from '@vue/server-renderer'
import { gzipSync } from 'node:zlib'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import { build } from 'vite'
import type { Rolldown } from 'vite'

import { createFixtureApp } from '../fixtures/lite-entry/app'

const FIXTURE = resolve(dirname(fileURLToPath(import.meta.url)), '../fixtures/lite-entry')
const KIB = 1024
const BUDGET_JS_GZ = 105 * KIB
const BUDGET_CSS_GZ = 10 * KIB

interface IAsset { fileName: string, text: string, gz: number }

const text = (source: string | Uint8Array) => typeof source === 'string' ? source : Buffer.from(source).toString('utf8')

describe('createOrigamCore — build de la fixture (#1384)', () => {
    let js: IAsset[] = []
    let css: IAsset[] = []

    beforeAll(async () => {
        const result = await build({
            configFile: resolve(FIXTURE, 'vite.config.ts'),
            logLevel: 'silent',
            build: {write: false}
        }) as Rolldown.RolldownOutput
        const assets = result.output.map((o): IAsset => {
            const body = o.type === 'chunk' ? o.code : text(o.source)
            return {fileName: o.fileName, text: body, gz: gzipSync(body, {level: 9}).length}
        })
        js = assets.filter(a => a.fileName.endsWith('.js'))
        css = assets.filter(a => a.fileName.endsWith('.css'))
    }, 120_000)

    const total = (list: IAsset[]) => list.reduce((n, a) => n + a.gz, 0)

    it('JS client <= 105 Kio gzip', () => {
        expect(js.length).toBeGreaterThan(0)
        expect(total(js), `JS gz = ${(total(js) / KIB).toFixed(1)} Kio`).toBeLessThanOrEqual(BUDGET_JS_GZ)
    })

    it('CSS <= 10 Kio gzip', () => {
        expect(css.length).toBeGreaterThan(0)
        expect(total(css), `CSS gz = ${(total(css) / KIB).toFixed(1)} Kio`).toBeLessThanOrEqual(BUDGET_CSS_GZ)
    })

    it('ni police MDI ni composant non importé ni enum MDI_ICONS dans le bundle', () => {
        const all = [...js, ...css].map(a => a.text).join('\n')
        // Témoin : le composant importé, lui, y est.
        expect(all).toContain('origam-blockquote')
        for (const absent of ['materialdesignicons', 'origam-calendar', 'origam-data-table', 'origam-color-picker', 'mdi-ab-testing']) {
            expect(all, absent).not.toContain(absent)
        }
    })
})

describe('createOrigamCore — rendu serveur (#1384)', () => {
    it('les props du bloc `components` du thème s\'appliquent', async () => {
        const html = await renderToString(createFixtureApp())

        expect(html).toContain('origam-blockquote--variant-pull')
        expect(html).toContain('origam-blockquote--align-center')
        expect(html).toContain('origam--rounded-lg')
    })

    it('témoin : sans thème, ces classes sont absentes', async () => {
        const html = await renderToString(createFixtureApp([]))

        expect(html).not.toContain('origam-blockquote--variant-pull')
        expect(html).not.toContain('origam--rounded-lg')
    })
})
