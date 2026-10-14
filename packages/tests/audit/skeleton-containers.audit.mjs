#!/usr/bin/env node
/**
 * skeleton-containers.audit.mjs — poids DOM et annonces des conteneurs en
 * chargement `skeleton` (OrigamCard, OrigamExpansionPanel, OrigamDataTable).
 *
 * CE QU'IL MESURE
 * ---------------
 * Pour chaque conteneur, rendu par Vue dans Chromium avec
 * `loading={ type: 'skeleton' }` :
 *   - le nombre d'elements DOM sous la racine de la sonde ;
 *   - le nombre de `role="status"` (= annonces lecteur d'ecran) ;
 *   - le nombre d'elements `aria-hidden="true"` ;
 *   - le nombre de `<style>` du document (un par instance etait injecte
 *     avant le lot 1 de #1073) ;
 *   - le nombre d'elements portant la classe hote `.origam--skeleton`.
 *
 * C'est la meme sonde pour le code AVANT et APRES : lancee sur un commit
 * puis sur l'autre, la difference est le resultat.
 *
 * Usage:
 *   pnpm -F @origam/tests audit:skeleton-containers
 *   pnpm -F @origam/tests audit:skeleton-containers -- --json /tmp/apres.json
 */

import { createServer } from 'node:http'
import { readFile, writeFile } from 'node:fs/promises'
import { existsSync, realpathSync } from 'node:fs'
import { extname, join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'

import { chromium } from '@playwright/test'

const HERE = dirname(fileURLToPath(import.meta.url))
const APP = join(HERE, 'skeleton-containers')
const DIST = join(APP, 'dist')

const SCENARIOS = ['card', 'panel', 'table']

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json'
}

function measureInPage () {
    const root = document.getElementById('probe-root')
    const within = (selector) => root.querySelectorAll(selector).length
    const rows = Array.from(root.querySelectorAll('tbody tr'))

    return {
        elements: root.querySelectorAll('*').length,
        status: within('[role="status"]'),
        ariaHidden: within('[aria-hidden="true"]'),
        ariaBusy: within('[aria-busy="true"]'),
        hostClass: within('.origam--skeleton'),
        skeletonComponents: within('.origam-skeleton'),
        styleTags: document.querySelectorAll('style').length,
        statusInRows: root.querySelectorAll('tbody [role="status"]').length,
        tbodyRows: rows.length,
        tbodyCells: root.querySelectorAll('tbody td').length
    }
}

function resolveViteBin () {
    const req = createRequire(import.meta.url)
    const pluginPkg = req.resolve('@vitejs/plugin-vue/package.json', { paths: [resolve(HERE, '..')] })
    const fromPlugin = createRequire(realpathSync(pluginPkg))
    return join(dirname(fromPlugin.resolve('vite/package.json')), 'bin', 'vite.js')
}

function buildHarness () {
    process.stdout.write('construction du harnais … ')
    execFileSync(process.execPath, [resolveViteBin(), 'build', '--config', join(APP, 'vite.config.mjs')], {
        cwd: resolve(HERE, '..'),
        stdio: ['ignore', 'ignore', 'inherit']
    })
    process.stdout.write('ok\n')
}

async function serveDist () {
    const server = createServer(async (req, res) => {
        const url = new URL(req.url, 'http://x')
        let file = join(DIST, decodeURIComponent(url.pathname))
        if (url.pathname === '/' || !existsSync(file)) file = join(DIST, 'index.html')
        try {
            const body = await readFile(file)
            res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' })
            res.end(body)
        } catch {
            res.writeHead(404)
            res.end()
        }
    })
    await new Promise((ok) => server.listen(0, '127.0.0.1', ok))
    return { server, port: server.address().port }
}

const outFlag = process.argv.indexOf('--json')
const outPath = outFlag >= 0 ? process.argv[outFlag + 1] : null

buildHarness()

const { server, port } = await serveDist()
const browser = await chromium.launch()
const result = {}

try {
    for (const scenario of SCENARIOS) {
        const page = await browser.newPage()
        const errors = []
        page.on('pageerror', (e) => errors.push(String(e)))
        await page.addInitScript((s) => {
            window.__ORIGAM_SKELETON_CONTAINERS__ = { scenario: s, mode: 'light' }
        }, scenario)
        await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' })
        await page.waitForFunction(() => window.__ORIGAM_SKELETON_CONTAINERS_READY__ === true)
        await page.evaluate(() => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok))))
        await page.waitForTimeout(400)

        result[scenario] = { ...(await page.evaluate(measureInPage)), errors }
        await page.close()
    }
} finally {
    await browser.close()
    server.close()
}

const cols = ['elements', 'status', 'ariaHidden', 'ariaBusy', 'hostClass', 'skeletonComponents', 'styleTags', 'statusInRows', 'tbodyRows', 'tbodyCells']
console.log(['scenario'.padEnd(8), ...cols.map((c) => c.padStart(18))].join(' '))
for (const s of SCENARIOS) {
    console.log([s.padEnd(8), ...cols.map((c) => String(result[s][c]).padStart(18))].join(' '))
    if (result[s].errors.length) console.log(`  erreurs page : ${result[s].errors.join(' | ')}`)
}

if (outPath) {
    await writeFile(outPath, JSON.stringify(result, null, 2), 'utf8')
    console.log(`ecrit : ${outPath}`)
}
