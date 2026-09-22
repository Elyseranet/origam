#!/usr/bin/env node
/**
 * dark-contrast.audit.mjs — replays the #871 count.
 *
 * WHAT IT MEASURES
 * ----------------
 * The 30 components that wire `v-contrast`, rendered by Vue, across the 8
 * identities × 2 modes, in BOTH theming scopes:
 *
 *   - `root`    — the identity pinned on `<html>`            (16 pages)
 *   - `subtree` — the identity pinned on an
 *                 `<OrigamThemeProvider>`                     (16 sub-trees)
 *
 * For each element the directive binds to, it reads the computed `color` and
 * the EFFECTIVE painted background (walking ancestors and alpha-compositing,
 * the same walk `contrast.directive.ts` does) and computes the WCAG 2.x ratio.
 * It never writes a colour: the real directive is swapped for a tagging stub
 * through a Vite alias, so instrumenting the DS cannot influence the result.
 *
 * WHY A BROWSER, WHY NOT HISTOIRE, WHY NOT jsdom
 * ----------------------------------------------
 *   - jsdom never resolves `var()` (CLAUDE.md §#398) and this whole surface is
 *     token-driven, so jsdom would measure something else.
 *   - Histoire's `__sandbox` iframe does not recalculate an already-rendered
 *     element after a mutation, and it binds :6006 from whichever of the ~150
 *     worktrees started it. This harness owns an EPHEMERAL port and sets the
 *     theme with `addInitScript`, before the document is parsed.
 *
 * CONTROLS, BOTH DIRECTIONS
 * -------------------------
 * Two control elements live in `index.html` and go through the exact same
 * probe: an opaque fg == bg pair that MUST be flagged at 1.00, and black on
 * white that MUST NOT be flagged. The run fails if either misbehaves — a probe
 * that cannot prove it actuates is not a measurement.
 *
 * Usage:
 *   pnpm -F @origam/tests audit:dark-contrast
 *   pnpm -F @origam/tests audit:dark-contrast -- --json /tmp/before.json
 */

import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { extname, join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

import { chromium } from '@playwright/test'

import { PROBE_IDENTITIES, PROBE_MODES } from './dark-contrast/probe-matrix.const.ts'

const HERE = dirname(fileURLToPath(import.meta.url))
const APP = join(HERE, 'dark-contrast')
const DIST = join(APP, 'dist')

const AA_TEXT = 4.5

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.svg': 'image/svg+xml'
}

/*********************************************************
 * measureInPage
 *
 * @description
 * Runs INSIDE the page. The WCAG maths is the formula of
 * `packages/tests/e2e/token-intent-contrast.spec.ts`, itself validated by
 * hand-computed controls (black/white 21.00 · #767676 4.54 · #777777 4.48).
 * The ancestor walk + alpha compositing mirror `resolvePaintedBackground` in
 * `ds/src/directives/Contrast/contrast.directive.ts`.
 ********************************************************/
function measureInPage (rootSelector) {
    const parse = (s) => {
        const m = String(s ?? '').match(/rgba?\(([^)]+)\)/i)
        if (!m) return null
        const p = m[1].split(',').map((x) => parseFloat(x.trim()))
        if (p.length < 3 || p.slice(0, 3).some(Number.isNaN)) return null
        return { r: p[0], g: p[1], b: p[2], a: p[3] == null || Number.isNaN(p[3]) ? 1 : p[3] }
    }

    const over = (top, bottom) => ({
        r: top.r * top.a + bottom.r * (1 - top.a),
        g: top.g * top.a + bottom.g * (1 - top.a),
        b: top.b * top.a + bottom.b * (1 - top.a),
        a: 1
    })

    const lum = ({ r, g, b }) => {
        const c = (v) => {
            const s = v / 255
            return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
        }
        return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b)
    }

    const ratio = (x, y) => {
        const a = lum(x)
        const b = lum(y)
        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
    }

    const paintedBackground = (el) => {
        const layers = []
        let node = el
        while (node) {
            const parts = parse(getComputedStyle(node).backgroundColor)
            if (parts && parts.a > 0) {
                layers.push(parts)
                if (parts.a >= 1) break
            }
            node = node.parentElement
        }
        if (!layers.length) return null
        const deepest = layers[layers.length - 1]
        let acc = deepest.a >= 1 ? layers.pop() : { r: 255, g: 255, b: 255, a: 1 }
        for (let i = layers.length - 1; i >= 0; i -= 1) acc = over(layers[i], acc)
        return acc
    }

    const rgb = (c) => `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`

    /*** First `origam-*` class, BEM children included (`origam-card__overlay`). ***/
    const familyOf = (el) => {
        const cls = [...el.classList].find((c) => c.startsWith('origam-') && !c.startsWith('origam--'))
        return cls ?? `<${el.tagName.toLowerCase()}>`
    }

    const root = document.querySelector(rootSelector)
    if (!root) return []

    return [...root.querySelectorAll('[data-origam-probe]')].map((el) => {
        const fg = parse(getComputedStyle(el).color)
        const bgLayers = paintedBackground(el)
        if (!fg || !bgLayers) return null
        const fgOver = over(fg, bgLayers)
        return {
            component: familyOf(el),
            control: el.dataset.probeControl ?? null,
            fg: rgb(fgOver),
            bg: rgb(bgLayers),
            ratio: Math.round(ratio(fgOver, bgLayers) * 100) / 100
        }
    }).filter(Boolean)
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
            res.writeHead(404).end('not found')
        }
    })
    await new Promise((ok) => server.listen(0, '127.0.0.1', ok))
    return { server, port: server.address().port }
}

function buildHarness () {
    process.stdout.write('building harness … ')
    execFileSync('npx', ['vite', 'build', '--config', join(APP, 'vite.config.mjs')], {
        cwd: resolve(HERE, '..'),
        stdio: ['ignore', 'ignore', 'inherit']
    })
    process.stdout.write('ok\n')
}

const outFlag = process.argv.indexOf('--json')
const outPath = outFlag >= 0 ? process.argv[outFlag + 1] : null

buildHarness()

const { server, port } = await serveDist()
const browser = await chromium.launch()
const rows = []
const controls = []
const actuation = []

try {
    /*** ROOT theming — the identity pinned on <html>, one page per config ***/
    for (const identity of PROBE_IDENTITIES) {
        for (const mode of PROBE_MODES) {
            const page = await browser.newPage()
            /*** The config only — `main.ts` writes the <html> attributes, ***/
            /*** because `documentElement` is still null at this point.    ***/
            await page.addInitScript(([id, md]) => {
                window.__ORIGAM_PROBE__ = { scope: 'root', identity: id, mode: md }
            }, [identity, mode])
            await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' })
            await page.waitForFunction(() => window.__ORIGAM_PROBE_READY__ === true)
            await page.evaluate(() => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok))))

            actuation.push(await page.evaluate(() => ({
                attrs: `${document.documentElement.getAttribute('data-theme') ?? '(none)'}|${document.documentElement.getAttribute('data-mode') ?? '(none)'}`,
                surface: getComputedStyle(document.querySelector('.probe-surface')).backgroundColor
            })))

            const measured = await page.evaluate(measureInPage, '#app')
            for (const m of measured) rows.push({ scope: 'root', identity, mode, ...m })

            const ctl = await page.evaluate(measureInPage, '#controls')
            for (const m of ctl) controls.push({ scope: 'root', identity, mode, ...m })

            await page.close()
        }
    }

    /*** SUB-TREE theming — the 16 combinations as <OrigamThemeProvider> ***/
    const page = await browser.newPage()
    await page.addInitScript(() => {
        window.__ORIGAM_PROBE__ = { scope: 'subtree' }
    })
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' })
    await page.waitForFunction(() => window.__ORIGAM_PROBE_READY__ === true)
    await page.evaluate(() => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok))))

    for (const identity of PROBE_IDENTITIES) {
        for (const mode of PROBE_MODES) {
            const sel = `[data-probe-config="${identity}|${mode}"]`
            actuation.push(await page.evaluate((s) => {
                const host = document.querySelector(s)
                return {
                    attrs: `${host?.getAttribute('data-theme') ?? '(none)'}|${host?.getAttribute('data-mode') ?? '(none)'}`,
                    surface: getComputedStyle(host.querySelector('.probe-surface')).backgroundColor
                }
            }, sel))
            const measured = await page.evaluate(measureInPage, sel)
            for (const m of measured) rows.push({ scope: 'subtree', identity, mode, ...m })
        }
    }
    await page.close()
} finally {
    await browser.close()
    server.close()
}

/*********************************************************
 * Controls gate — both directions, before any number is trusted
 ********************************************************/
const positives = controls.filter((c) => c.control === 'positive')
const negatives = controls.filter((c) => c.control === 'negative')
const positiveOk = positives.length > 0 && positives.every((c) => c.ratio < AA_TEXT && c.ratio <= 1.01)
const negativeOk = negatives.length > 0 && negatives.every((c) => c.ratio >= 20.9)

console.log('')
console.log(`control POSITIVE (fg == bg, opaque)  : ${positives.length} probed, ratio ${positives[0]?.ratio} — ${positiveOk ? 'FLAGGED ✔' : 'NOT FLAGGED ✘'}`)
console.log(`control NEGATIVE (black on white)    : ${negatives.length} probed, ratio ${negatives[0]?.ratio} — ${negativeOk ? 'not flagged ✔' : 'FLAGGED ✘'}`)

/*********************************************************
 * Actuation gate — "prove your harness can actuate the axis"
 *
 * @description
 * The first pass of this harness pinned `<html data-mode>` from
 * `addInitScript`, where `document.documentElement` is still null: the
 * attribute was never written and all 16 root configurations silently
 * rendered LIGHT — 0 violations, which looked like good news. This gate makes
 * that failure mode loud: every configuration must carry its own attributes,
 * and a dark surface must not equal its light twin.
 ********************************************************/
const halves = actuation.length / 2
let actuationOk = actuation.length === 32
for (let i = 0; i < actuation.length; i += 2) {
    const [lightCfg, darkCfg] = [actuation[i], actuation[i + 1]]
    if (!lightCfg.attrs.endsWith('|light') || !darkCfg.attrs.endsWith('|dark')) actuationOk = false
    if (lightCfg.surface === darkCfg.surface) actuationOk = false
}
console.log(`actuation (${halves} light/dark pairs)       : ${actuationOk ? 'each config pinned and repainted ✔' : 'A CONFIG DID NOT ACTUATE ✘'}`)
if (!actuationOk) {
    for (const a of actuation) console.log(`   ${a.attrs.padEnd(24)} ${a.surface}`)
}

if (!positiveOk || !negativeOk || !actuationOk) {
    console.error('\n⛔ Control failed — the probe does not actuate. Numbers below are meaningless.')
    process.exitCode = 1
}

/*********************************************************
 * Report
 ********************************************************/
const violations = rows.filter((r) => r.ratio < AA_TEXT)
const pair = (r) => `${r.fg} on ${r.bg}`
const distinctPairs = new Set(violations.map(pair))

const byMode = (m) => rows.filter((r) => r.mode === m)
const violationsIn = (list) => list.filter((r) => r.ratio < AA_TEXT).length

console.log('')
console.log(`instances probed : ${rows.length}`)
console.log(`violations       : ${violations.length}  (${((violations.length / rows.length) * 100).toFixed(1)} %)`)
console.log(`distinct fg/bg pairs : ${distinctPairs.size}`)
console.log(`under 2:1        : ${violations.filter((r) => r.ratio < 2).length}`)
console.log('')
console.log(`dark  : ${violationsIn(byMode('dark'))} / ${byMode('dark').length}`)
console.log(`light : ${violationsIn(byMode('light'))} / ${byMode('light').length}`)
console.log('')

for (const scope of ['root', 'subtree']) {
    const list = rows.filter((r) => r.scope === scope)
    console.log(`scope ${scope.padEnd(8)}: ${violationsIn(list)} / ${list.length}`)
}

console.log('')
console.log('by identity'.padEnd(14) + 'viol'.padStart(6) + 'total'.padStart(7))
for (const identity of PROBE_IDENTITIES) {
    const list = rows.filter((r) => r.identity === identity)
    console.log(identity.padEnd(14) + String(violationsIn(list)).padStart(6) + String(list.length).padStart(7))
}

console.log('')
console.log('by component'.padEnd(34) + 'viol'.padStart(6) + 'total'.padStart(7))
const families = [...new Set(rows.map((r) => r.component))].sort()
for (const family of families) {
    const list = rows.filter((r) => r.component === family)
    const v = violationsIn(list)
    if (v > 0) console.log(family.padEnd(34) + String(v).padStart(6) + String(list.length).padStart(7))
}

console.log('')
console.log('top pairs'.padEnd(50) + 'count'.padStart(6))
const counted = new Map()
for (const v of violations) counted.set(pair(v), (counted.get(pair(v)) ?? 0) + 1)
for (const [p, n] of [...counted].sort((a, b) => b[1] - a[1]).slice(0, 12)) {
    console.log(p.padEnd(50) + String(n).padStart(6))
}

if (outPath) {
    const { writeFileSync } = await import('node:fs')
    writeFileSync(outPath, JSON.stringify({ rows, controls }, null, 2))
    console.log(`\njson → ${outPath}`)
}
