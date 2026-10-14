#!/usr/bin/env node
/**
 * skeleton-contrast.audit.mjs — contraste du remplissage d'un OrigamSkeleton.
 *
 * CE QU'IL MESURE
 * ---------------
 * Un `OrigamSkeleton` rectangulaire AU REPOS (animation coupee), rendu par
 * Vue sous les 8 identites x 2 modes, sur deux surfaces : la surface de page
 * et une `OrigamCard`. Il releve la couleur de remplissage reellement
 * peinte (le `::after` du code courant, le fond de l'element pour le parent
 * d'avant le lot), la compose sur la pile de fonds des ancetres, et rend le
 * rapport de contraste WCAG entre le remplissage et la surface.
 *
 * Cible visee : environ 1.25 a 1.5:1. Un placeholder est DECORATIF, pas du
 * texte : il ne doit pas atteindre 4.5:1, et il ne doit pas non plus
 * disparaitre (1.00:1 = invisible, mesure sur geek dark et ecom dark avant
 * #1073).
 *
 * POURQUOI CETTE FORME
 * --------------------
 * Meme raisonnement que `kbd-preset.audit.mjs` : jsdom ne resout jamais
 * `var()`, Histoire est epingle `data-theme="light"` et n'enregistre que
 * `origamTheme`. Le harnais possede son propre port ephemere.
 *
 * ⛔ Les couleurs ne sont PAS parsees a la main : `color-mix(…)`,
 * `color(srgb …)` (l'identite `apple` en emet) et `rgb()` sont toutes
 * converties par un `<canvas>` — c'est le navigateur qui compose. Un
 * parseur maison qui ignore `color(srgb …)` a deja fabrique 4 violations
 * de contraste fictives dans ce depot (#871).
 *
 * CONTROLE D'ACTUATION — OBLIGATOIRE
 * ----------------------------------
 * Le run ECHOUE si les 16 configurations rendent la meme surface de page :
 * l'identite n'aurait pas ete appliquee.
 *
 * Usage:
 *   pnpm -F @origam/tests audit:skeleton-contrast
 *   pnpm -F @origam/tests audit:skeleton-contrast -- --json /tmp/contraste.json
 */

import { createServer } from 'node:http'
import { readFile, writeFile } from 'node:fs/promises'
import { existsSync, realpathSync } from 'node:fs'
import { extname, join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'

import { chromium } from '@playwright/test'

import { PROBE_IDENTITIES, PROBE_MODES } from './dark-contrast/probe-matrix.const.ts'

const HERE = dirname(fileURLToPath(import.meta.url))
const APP = join(HERE, 'skeleton-contrast')
const DIST = join(APP, 'dist')

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.svg': 'image/svg+xml'
}

/*********************************************************
 * measureInPage
 *
 * @description
 * Tourne DANS la page. Relit `data-theme` / `data-mode` dans le MEME
 * `evaluate` que les styles et rend une erreur des qu'ils divergent de ce
 * qui a ete demande.
 ********************************************************/
function measureInPage ({ expected, trough }) {
    const themeAtRead = document.documentElement.getAttribute('data-theme') ?? 'native'
    const modeAtRead = document.documentElement.getAttribute('data-mode') ?? ''

    if (themeAtRead !== expected.identity || modeAtRead !== expected.mode) {
        return { error: `CONTAMINE — demande ${expected.identity}/${expected.mode}, lu ${themeAtRead}/${modeAtRead}` }
    }

    const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
    ctx.canvas.width = 1
    ctx.canvas.height = 1

    const SENTINEL = '#010203'
    const paint = (css, alpha = 1) => {
        ctx.fillStyle = SENTINEL
        ctx.fillStyle = css
        if (ctx.fillStyle === SENTINEL && css.replace(/\s/g, '').toLowerCase() !== SENTINEL) {
            throw new Error(`couleur non interpretee par le canvas : ${css}`)
        }
        ctx.globalAlpha = alpha
        ctx.fillRect(0, 0, 1, 1)
        ctx.globalAlpha = 1
    }
    const reset = () => {
        ctx.clearRect(0, 0, 1, 1)
        paint('#ffffff')
    }
    const pixel = () => Array.from(ctx.getImageData(0, 0, 1, 1).data.slice(0, 3))
    const luminance = ([r, g, b]) => {
        const lin = (v) => {
            const c = v / 255
            return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
        }
        return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
    }
    const ratio = (a, b) => {
        const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
        return (hi + 0.05) / (lo + 0.05)
    }

    const out = []
    const notes = []

    for (const el of Array.from(document.querySelectorAll('[data-probe-skeleton]'))) {
        const key = el.getAttribute('data-probe-skeleton')

        const chain = []
        for (let node = el.parentElement; node; node = node.parentElement) {
            const cs = getComputedStyle(node)
            const bg = cs.backgroundColor
            if (cs.backgroundImage !== 'none') notes.push(`${key}: ${node.tagName.toLowerCase()} porte un background-image`)
            if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') chain.unshift(bg)
        }

        const after = getComputedStyle(el, '::after')
        const hasAfter = after.content !== 'none' && after.content !== 'normal'
        const fill = hasAfter ? after.backgroundColor : getComputedStyle(el).backgroundColor

        reset()
        chain.forEach((c) => paint(c))
        const surface = pixel()

        paint(fill)
        const atRest = pixel()

        reset()
        chain.forEach((c) => paint(c))
        paint(fill, trough)
        const atTrough = pixel()

        out.push({
            surface: key,
            source: hasAfter ? '::after' : 'element',
            fill,
            surfaceRgb: surface,
            restRgb: atRest,
            restRatio: ratio(atRest, surface),
            troughRatio: ratio(atTrough, surface)
        })
    }

    return { rows: out, notes }
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
const TROUGH_OPACITY = 0.55

buildHarness()

const { server, port } = await serveDist()
const browser = await chromium.launch()
const rows = []
const notes = new Set()

try {
    for (const identity of PROBE_IDENTITIES) {
        for (const mode of PROBE_MODES) {
            const page = await browser.newPage()
            await page.addInitScript(([id, md]) => {
                window.__ORIGAM_SKELETON_PROBE__ = { identity: id, mode: md }
            }, [identity, mode])
            await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' })
            await page.waitForFunction(() => window.__ORIGAM_SKELETON_PROBE_READY__ === true)
            await page.evaluate(() => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok))))

            const got = await page.evaluate(measureInPage, { expected: { identity, mode }, trough: TROUGH_OPACITY })

            if (got.error) throw new Error(`${identity}/${mode} — ${got.error}`)

            got.notes.forEach((n) => notes.add(n))
            for (const r of got.rows) rows.push({ identity, mode, ...r })
            await page.close()
        }
    }
} finally {
    await browser.close()
    server.close()
}

const expected = PROBE_IDENTITIES.length * PROBE_MODES.length * 2
if (rows.length !== expected) {
    console.error(`collecte incomplete : ${rows.length} lignes pour ${expected} attendues`)
    process.exit(1)
}

const pageSurfaces = new Set(rows.filter((r) => r.surface === 'page').map((r) => r.surfaceRgb.join(',')))
console.log(`lignes relevees : ${rows.length}`)
console.log(`actuation — surfaces de page distinctes : ${pageSurfaces.size} / 16`)

if (pageSurfaces.size < 2) {
    console.error('ECHEC ACTUATION — l\'identite ne change rien, la sonde ne mesure pas ce qu\'elle croit')
    process.exit(1)
}

const f = (n) => n.toFixed(2).padStart(5)
console.log('\nidentite   mode   surface  source     repos   creux(.55)   fond-surface -> remplissage')
for (const r of rows) {
    console.log(
        `${r.identity.padEnd(10)} ${r.mode.padEnd(6)} ${r.surface.padEnd(8)} ${r.source.padEnd(10)} ${f(r.restRatio)}   ${f(r.troughRatio)}        rgb(${r.surfaceRgb}) -> rgb(${r.restRgb})`
    )
}

const worst = rows.reduce((a, b) => (b.restRatio < a.restRatio ? b : a))
const best = rows.reduce((a, b) => (b.restRatio > a.restRatio ? b : a))
console.log(`\nminimum au repos : ${f(worst.restRatio)}:1 (${worst.identity}/${worst.mode}/${worst.surface})`)
console.log(`maximum au repos : ${f(best.restRatio)}:1 (${best.identity}/${best.mode}/${best.surface})`)
console.log(`sous 1.10:1 (quasi invisible) : ${rows.filter((r) => r.restRatio < 1.1).length} / ${rows.length}`)
console.log(`au-dessus de 3:1 (concurrence le contenu) : ${rows.filter((r) => r.restRatio > 3).length} / ${rows.length}`)
if (notes.size) console.log(`\nnotes : ${[...notes].join(' ; ')}`)

if (outPath) {
    await writeFile(outPath, JSON.stringify({ rows }, null, 2), 'utf8')
    console.log(`ecrit : ${outPath}`)
}
