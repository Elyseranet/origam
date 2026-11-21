// @vitest-environment node
/*********************************************************
 * #1395 — plafond CSS d'OrigamBlockquote
 *
 * Mesure : la feuille d'un build Vite (client, minifié) d'une app qui
 * n'importe QUE `OrigamBlockquote` : 7,9 Kio bruts, ~1 Kio gzip, aucune règle
 * d'un autre composant. Les ~50 Ko vus dans Elysera ne sont pas ceux de
 * Blockquote : ce fichier porte le nom du composant, mais Vite/Nuxt y fusionne
 * le CSS de tout ce que la page importe avec lui (Btn 18 Kio, Progress, Avatar,
 * Img…). Plafonds : 9 Kio bruts, 2 Kio gzip. Ne pas relever sans décision du
 * propriétaire.
 ********************************************************/
import { gzipSync } from 'node:zlib'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import { build } from 'vite'
import type { Rolldown } from 'vite'

const FIXTURE = resolve(dirname(fileURLToPath(import.meta.url)), '../fixtures/blockquote-only')
const KIB = 1024

describe('OrigamBlockquote — CSS (#1395)', () => {
    let css = ''

    beforeAll(async () => {
        const result = await build({
            configFile: resolve(FIXTURE, 'vite.config.ts'),
            logLevel: 'silent',
            build: {write: false}
        }) as Rolldown.RolldownOutput

        css = result.output
            .filter(o => o.fileName.endsWith('.css'))
            .map(o => o.type === 'asset' ? String(o.source) : '')
            .join('')
    }, 120_000)

    it('CSS <= 9 Kio bruts et <= 2 Kio gzip', () => {
        expect(css.length).toBeGreaterThan(0)
        expect(css.length, `brut = ${(css.length / KIB).toFixed(1)} Kio`).toBeLessThanOrEqual(9 * KIB)
        expect(gzipSync(css, {level: 9}).length).toBeLessThanOrEqual(2 * KIB)
    })

    it('n\'embarque le CSS d\'aucun autre composant', () => {
        expect(css).toContain('origam-blockquote')
        for (const other of ['origam-btn', 'origam-progress', 'origam-avatar', 'origam-img']) {
            expect(css, other).not.toContain(other)
        }
    })
})
