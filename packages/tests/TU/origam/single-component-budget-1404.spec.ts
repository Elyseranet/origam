// @vitest-environment node
/*********************************************************
 * #1404 — budget JS d'une page qui ne rend qu'un composant
 *
 * Fixture : TU/fixtures/single-component (`createOrigamCore`, le thème du DS,
 * un seul `origam-title`). Le test BUILD la fixture avec Vite (client, minifié)
 * et mesure les octets gzip -9. Le JS inclut Vue lui-même.
 *
 * Mesure du 2026-11-21 : 57,4 Kio gz. Plafond : 62 Kio gz. Ce que la page
 * paie sans l'utiliser (locales fr, adaptateur de dates, tables de variantes) est
 * décrit dans #1404 ; ne relever ce plafond que sur décision du propriétaire.
 ********************************************************/
import { renderToString } from '@vue/server-renderer'
import { gzipSync } from 'node:zlib'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import { build } from 'vite'
import type { Rolldown } from 'vite'

import { createFixtureApp } from '../fixtures/single-component/app'

const FIXTURE = resolve(dirname(fileURLToPath(import.meta.url)), '../fixtures/single-component')
const KIB = 1024
const BUDGET_JS_GZ = 62 * KIB

describe('createOrigamCore — une page, un composant (#1404)', () => {
    let js = ''
    let gz = 0

    beforeAll(async () => {
        const result = await build({
            configFile: resolve(FIXTURE, 'vite.config.ts'),
            logLevel: 'silent',
            mode: 'production',
            define: {'process.env.NODE_ENV': '"production"', __VUE_OPTIONS_API__: 'false', __VUE_PROD_DEVTOOLS__: 'false'},
            build: {write: false}
        }) as Rolldown.RolldownOutput
        const chunks = result.output.filter((o): o is Rolldown.OutputChunk => o.type === 'chunk')
        js = chunks.map(c => c.code).join('\n')
        gz = chunks.reduce((n, c) => n + gzipSync(c.code, {level: 9}).length, 0)
    }, 120_000)

    it('JS client <= 62 Kio gzip', () => {
        expect(gz, `JS gz = ${(gz / KIB).toFixed(1)} Kio`).toBeLessThanOrEqual(BUDGET_JS_GZ)
    })

    it('ni police MDI dans le bundle', () => {
        expect(js).toContain('origam-title')
        expect(js).not.toContain('materialdesignicons')
    })

    it('rend le titre côté serveur', async () => {
        expect(await renderToString(createFixtureApp())).toContain('<h1')
    })
})
