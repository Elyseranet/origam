#!/usr/bin/env node
/**
 * switch-focus-ring.audit.mjs — #919 point 5 (états non mesurés)
 *
 * WHAT THIS MEASURES
 * -------------------
 * The QA mission behind #919 explicitly did NOT measure the focus ring. This
 * reuses the exact same probe app as `why-origam-contrast.audit.mjs`
 * (`why-origam-contrast/`) — same 8 identities × 2 modes, same real Chromium,
 * same colour maths (`over()` alpha compositing, reused verbatim) — but
 * focuses the plain (uncoloured, unchecked) switch's hidden checkbox input
 * via the keyboard (`Tab`, not `.focus()` — Chromium's `:focus-visible`
 * heuristic is keystroke-driven, and a programmatic `.focus()` does not
 * reliably reproduce what a real keyboard user sees) and reads the
 * `.origam-selection-control--focus-visible` outline colour against the
 * page, per `OrigamSelectionControl.vue`:
 *
 *     &--focus-visible {
 *       outline: 2px solid var(--origam-color__border---focus, currentColor);
 *     }
 *
 * WCAG 1.4.11 covers focus indicators explicitly — the ring itself is a
 * non-text UI signal and needs ≥3:1 against the surface it sits on.
 *
 * Usage: node audit/switch-focus-ring.audit.mjs
 */

import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync, realpathSync } from 'node:fs'
import { extname, join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'

import { chromium } from '@playwright/test'

const HERE = dirname(fileURLToPath(import.meta.url))
const APP = join(HERE, 'why-origam-contrast')
const DIST = join(APP, 'dist')

const AA_UI = 3.0

const PROBE_IDENTITIES = ['origam', 'apple', 'cartoon', 'ecom', 'editorial', 'geek', 'glass', 'material']
const PROBE_MODES = ['light', 'dark']

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8'
}

/** Same colour maths as `why-origam-contrast.audit.mjs` — reused, not re-derived. */
function measureInPage () {
    const parse = (s) => {
        const raw = String(s ?? '').trim()
        if (!raw) return null
        const rgbMatch = raw.match(/rgba?\(([^)]+)\)/i)
        if (rgbMatch) {
            const p = rgbMatch[1].split(',').map((x) => parseFloat(x.trim()))
            if (p.length < 3 || p.slice(0, 3).some(Number.isNaN)) return null
            return { r: p[0], g: p[1], b: p[2], a: p[3] == null || Number.isNaN(p[3]) ? 1 : p[3] }
        }
        const srgb = raw.match(/color\(\s*srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)/i)
        if (srgb) {
            const ch = (v) => Math.min(1, Math.max(0, parseFloat(v))) * 255
            const a = srgb[4] !== undefined ? parseFloat(srgb[4]) : 1
            return { r: ch(srgb[1]), g: ch(srgb[2]), b: ch(srgb[3]), a: Number.isNaN(a) ? 1 : a }
        }
        if (raw === 'transparent' || raw === 'none') return { r: 0, g: 0, b: 0, a: 0 }
        return null
    }
    const over = (top, bottom) => ({
        r: top.r * top.a + bottom.r * (1 - top.a),
        g: top.g * top.a + bottom.g * (1 - top.a),
        b: top.b * top.a + bottom.b * (1 - top.a),
        a: 1
    })
    const lum = ({ r, g, b }) => {
        const c = (v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 }
        return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b)
    }
    const ratio = (x, y) => { const a = lum(x); const b = lum(y); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) }
    const paintedBackground = (el) => {
        const layers = []
        let node = el
        while (node) {
            const parts = parse(getComputedStyle(node).backgroundColor)
            if (parts && parts.a > 0) { layers.push(parts); if (parts.a >= 1) break }
            node = node.parentElement
        }
        if (!layers.length) return { r: 255, g: 255, b: 255, a: 1 }
        const deepest = layers[layers.length - 1]
        let acc = deepest.a >= 1 ? layers.pop() : { r: 255, g: 255, b: 255, a: 1 }
        for (let i = layers.length - 1; i >= 0; i -= 1) acc = over(layers[i], acc)
        return acc
    }
    const rgb = (c) => `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`

    /*
     * ⛔ TWO wrong-element traps stacked here, found by instrumenting
     * `Element.prototype.matches` / `addEventListener` and reading the SCSS by
     * hand rather than trusting the first plausible selector:
     *   1. The `--focus-visible` MODIFIER CLASS lands on `.origam-selection-
     *      control` (the OUTER root, via `selectionControlClasses`), NOT on
     *      `.origam-selection-control__wrapper` (an inner div with a static,
     *      state-free class list).
     *   2. The `outline` DECLARATION itself is scoped to `#{$this}__input`
     *      (`.origam-selection-control__input`, the ripple/icon carrier div) —
     *      a DIFFERENT element again, a child of the wrapper, sibling of the
     *      `<input>`. Reading `outline-style` off the class-bearing root (or
     *      the wrapper) read `none` — not because no ring paints, but because
     *      neither element is the one the SCSS rule actually targets.
     */
    const controlRoot = document.querySelector('[data-probe-part="switch-off"] .origam-selection-control')
    if (!controlRoot) return { missing: true, reason: 'control root not found' }
    const outlineEl = controlRoot.querySelector('.origam-selection-control__input')
    if (!outlineEl) return { missing: true, reason: 'origam-selection-control__input not found' }
    const isFocusVisible = controlRoot.classList.contains('origam-selection-control--focus-visible')
    const cs = getComputedStyle(outlineEl)
    const outlineColorRaw = cs.outlineColor
    const outlineStyle = cs.outlineStyle
    const outlineWidth = cs.outlineWidth
    const outline = parse(outlineColorRaw)
    const page = paintedBackground(outlineEl)
    if (!outline) return { missing: true, reason: `unparsed outline-color ${outlineColorRaw}`, isFocusVisible, outlineStyle, outlineWidth }
    const outlineOver = over(outline, page)
    return {
        isFocusVisible,
        outlineStyle,
        outlineWidth,
        outlineColorRaw,
        fg: rgb(outlineOver),
        bg: rgb(page),
        ratio: Math.round(ratio(outlineOver, page) * 100) / 100
    }
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
        } catch { res.writeHead(404).end('not found') }
    })
    await new Promise((ok) => server.listen(0, '127.0.0.1', ok))
    return { server, port: server.address().port }
}

function resolveViteBin () {
    const req = createRequire(import.meta.url)
    const pluginPkg = req.resolve('@vitejs/plugin-vue/package.json', { paths: [resolve(HERE, '..')] })
    const fromPlugin = createRequire(realpathSync(pluginPkg))
    return join(dirname(fromPlugin.resolve('vite/package.json')), 'bin', 'vite.js')
}

function buildHarness () {
    process.stdout.write('building harness … ')
    execFileSync(process.execPath, [resolveViteBin(), 'build', '--config', join(APP, 'vite.config.mjs')], {
        cwd: resolve(HERE, '..'),
        stdio: ['ignore', 'ignore', 'inherit']
    })
    process.stdout.write('ok\n')
}

buildHarness()

const { server, port } = await serveDist()
const browser = await chromium.launch()
const rows = []

try {
    for (const identity of PROBE_IDENTITIES) {
        for (const mode of PROBE_MODES) {
            const page = await browser.newPage()
            await page.addInitScript(([id, md]) => {
                window.__ORIGAM_PROBE__ = { identity: id, mode: md }
            }, [identity, mode])
            await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' })
            await page.waitForFunction(() => window.__ORIGAM_PROBE_READY__ === true)
            await page.waitForTimeout(500)

            /*
             * Real keyboard focus, not `.focus()` — Chromium's `:focus-visible`
             * heuristic is driven by input modality (last interaction was a key
             * press vs a pointer click), and OrigamSelectionControl's own
             * `isFocusVisible` ref is set from `matchesSelector(e.target,
             * ':focus-visible')` inside its native `focus` handler — it reflects
             * whatever the browser itself decided, not a prop or a class we can
             * set directly.
             */
            const checkbox = page.locator('[data-probe-part="switch-off"] input[type="checkbox"]')
            await checkbox.waitFor({ state: 'attached' })
            await page.keyboard.press('Tab')
            // Chromium needs the tab order to actually land on the checkbox —
            // verify, and if not, keep tabbing a bounded number of times.
            let landed = await checkbox.evaluate((el) => el === document.activeElement)
            let guard = 0
            while (!landed && guard < 10) {
                await page.keyboard.press('Tab')
                landed = await checkbox.evaluate((el) => el === document.activeElement)
                guard += 1
            }

            /*
             * ⛔ The native `:focus-visible` match on the DOM element is
             * synchronous with the keypress, but `OrigamSelectionControl`'s OWN
             * `isFocusVisible` ref (and the `--focus-visible` class it drives)
             * is set from INSIDE a Vue 'focus' event handler — that write is
             * reactive, and the class only lands on the NEXT render patch, not
             * synchronously with the DOM focus event. Reading immediately catches
             * the pre-patch DOM. Wait for the class itself instead of a fixed
             * timeout — same family of trap as the alert.spec.ts single-vs-two-
             * step lesson (CLAUDE.md), just the other direction: here the
             * mutation is EXTERNAL (a real key press) and Vue's reaction is what
             * lags, so waiting for Vue's own output is the correct fix, not
             * reading in the same tick.
             */
            const controlRoot = page.locator('[data-probe-part="switch-off"] .origam-selection-control')
            await controlRoot.evaluate((el) => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))

            const measured = await page.evaluate(measureInPage)
            rows.push({ identity, mode, landed, ...measured })
            await page.close()
        }
    }
} finally {
    await browser.close()
    server.close()
}

console.log('')
console.log(
    'identity'.padEnd(10) + 'mode'.padEnd(7) + 'landed'.padEnd(8) + 'focus-visible'.padEnd(15) +
    'outline-style'.padEnd(15) + 'outline-width'.padEnd(15) +
    'ratio'.padStart(7) + '  gate'.padEnd(8) + '  outline / page'
)
let anyMissing = false
let worst = Infinity
for (const r of rows) {
    if (r.missing) {
        anyMissing = true
        console.log(`${r.identity.padEnd(10)}${r.mode.padEnd(7)}${String(r.landed).padEnd(8)}${'?'.padEnd(15)}${String(r.outlineStyle).padEnd(15)}${String(r.outlineWidth).padEnd(15)}   MISSING  (${r.reason})`)
        continue
    }
    const gate = r.ratio < AA_UI ? 'FAIL' : 'ok'
    worst = Math.min(worst, r.ratio)
    console.log(
        r.identity.padEnd(10) + r.mode.padEnd(7) + String(r.landed).padEnd(8) + String(r.isFocusVisible).padEnd(15) +
        String(r.outlineStyle).padEnd(15) + String(r.outlineWidth).padEnd(15) +
        String(r.ratio).padStart(7) + `  ${gate}`.padEnd(8) + `  ${r.fg} / ${r.bg}`
    )
}
console.log('')
console.log(`worst ratio: ${worst === Infinity ? 'n/a' : worst}`)
if (anyMissing) {
    console.error('\n⛔ Some rows could not be measured — see MISSING lines above.')
    process.exitCode = 1
}
