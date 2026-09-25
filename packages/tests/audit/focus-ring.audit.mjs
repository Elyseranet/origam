#!/usr/bin/env node
/**
 * focus-ring.audit.mjs — #919 point 5, WIDENED by #924
 *
 * WHAT THIS MEASURES
 * -------------------
 * Was `switch-focus-ring.audit.mjs`: one component (`OrigamSwitch`), one
 * backdrop (whatever the page happened to paint). #924 widened it, because the
 * defect it found is not the Switch's — `--origam-color__border---focus` is a
 * GLOBAL semantic token, and **38 of the 96 component families** paint a ring
 * from it (10 read it directly; 28 more reach it by composing `OrigamBtn`,
 * `OrigamField` or `OrigamSelectionControl`).
 *
 * So it now sweeps, in a real Chromium:
 *
 *   8 identities × 2 modes × 6 semantic BACKDROPS × 3 focusable families
 *   + 2 extra families (Checkbox, TextField) on the 2 commonest backdrops
 *
 * ⛔ WHY BACKDROPS, AND NOT "THE PAGE"
 * A focus ring is not measured against the page background — it is measured
 * against **what surrounds it**. Both `OrigamBtn` and `OrigamSelectionControl`
 * declare
 *
 *     outline: 2px solid var(--origam-color__border---focus, currentColor);
 *     outline-offset: var(--origam-space---1, 2px);
 *
 * — a POSITIVE offset, so the ring paints in a gap OUTSIDE the component's
 * border box. The colour immediately adjacent to the ring on BOTH of its sides
 * (the offset gap inside, the open space outside) is therefore the background
 * of whatever CONTAINS the component: a card, a menu, a toolbar, an alert —
 * the page only when the component sits directly on the page. A ring that
 * clears 3:1 on a neutral page and collapses to 2:1 inside a primary toolbar
 * is not a conformant ring, and a page-only measurement cannot see that.
 *
 * The component's OWN fill is reported alongside (`vs fill`) as secondary
 * adjacency — at a 2 px gap the eye reads both — but the GATE is the backdrop,
 * which is the surface WCAG 1.4.11 calls adjacent.
 *
 * THRESHOLD
 * WCAG 2.1 SC 1.4.11 *Non-text Contrast* — a focus indicator is a non-text UI
 * component boundary and needs **≥ 3:1** against adjacent colour.
 *
 * MEASUREMENT DISCIPLINE (each of these has produced a false verdict here)
 *  • Real `Tab` presses, never `.focus()` — Chromium's `:focus-visible`
 *    heuristic is input-modality driven, and `OrigamSelectionControl` reads
 *    the browser's own verdict via `matchesSelector(e.target, ':focus-visible')`.
 *  • 2 × `requestAnimationFrame` after each Tab — the `--focus-visible`
 *    modifier class is written from inside a Vue event handler and only lands
 *    on the NEXT patch.
 *  • `data-theme` / `data-mode` are re-read INSIDE the measuring `evaluate`
 *    and a mismatch fails loudly rather than returning a plausible number.
 *  • Alpha is composited with `over()`, reused verbatim from
 *    `dark-contrast.audit.mjs` — no re-derived colour maths.
 *  • `body` carries `transition: background-color .2s`; the harness waits
 *    500 ms after ready before any read.
 *  • NEGATIVE CONTROL: the raw resolved value of the token is printed per
 *    identity and the run FAILS if it does not actually differ across
 *    identities — a probe that cannot actuate what it measures returns a
 *    well-formed lie.
 *
 * Usage: node audit/focus-ring.audit.mjs
 *        node audit/focus-ring.audit.mjs --identity cartoon --mode light
 */

import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { existsSync, realpathSync, mkdirSync } from 'node:fs'
import { extname, join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { execFileSync } from 'node:child_process'

import { chromium } from '@playwright/test'

const HERE = dirname(fileURLToPath(import.meta.url))
const APP = join(HERE, 'why-origam-contrast')
const DIST = join(APP, 'dist')

const AA_UI = 3.0

const ALL_IDENTITIES = ['origam', 'apple', 'cartoon', 'ecom', 'editorial', 'geek', 'glass', 'material']
const ALL_MODES = ['light', 'dark']

const args = process.argv.slice(2)
const argOf = (name) => {
    const i = args.indexOf(`--${name}`)
    return i === -1 ? null : args[i + 1]
}
const onlyIdentity = argOf('identity')
const onlyMode = argOf('mode')
const shotDir = argOf('shots')

const PROBE_IDENTITIES = onlyIdentity ? [onlyIdentity] : ALL_IDENTITIES
const PROBE_MODES = onlyMode ? [onlyMode] : ALL_MODES

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8'
}

/**
 * Runs in the page after every Tab press. Identifies whatever is focused, finds
 * the element that actually paints the ring, and measures it against the
 * surface that surrounds it.
 *
 * `expected` is re-checked here, in the same evaluate as the read, so a probe
 * that has drifted onto another identity/mode fails instead of answering a
 * question nobody asked.
 */
function measureFocusedInPage (expected) {
    const parse = (s) => {
        const raw = String(s ?? '').trim()
        if (!raw) return null
        const rgbMatch = raw.match(/rgba?\(([^)]+)\)/i)
        if (rgbMatch) {
            const p = rgbMatch[1].split(',').map((x) => parseFloat(x.trim()))
            if (p.length < 3 || p.slice(0, 3).some(Number.isNaN)) return null
            return { r: p[0], g: p[1], b: p[2], a: p[3] == null || Number.isNaN(p[3]) ? 1 : p[3] }
        }
        // `apple`'s palette emits `color(srgb …)`; a parser blind to it fabricates
        // violations by treating a painted surface as unpainted (#871 post-mortem).
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
     * ⛔ Contamination guard. `.appbar-actions`-style blind clicking flipped the
     * mode under #944 and returned light numbers for dark. Nothing here clicks,
     * but the axes are re-read anyway: a harness that answers a question you did
     * not ask is the failure mode, not the mechanism that caused it once.
     */
    const themeAtRead = document.documentElement.getAttribute('data-theme') ?? 'origam'
    const modeAtRead = document.documentElement.getAttribute('data-mode')
    if (themeAtRead !== expected.identity || modeAtRead !== expected.mode) {
        return { error: `CONTAMINE — asked ${expected.identity}/${expected.mode}, read ${themeAtRead}/${modeAtRead}` }
    }

    const active = document.activeElement
    if (!active || active === document.body) return { skip: 'nothing focused' }

    const slot = active.closest('[data-probe-focus]')
    if (!slot) return { skip: 'focused outside a probe slot' }
    const target = slot.getAttribute('data-probe-focus')
    const backdropEl = slot.closest('[data-probe-backdrop]')
    const backdrop = backdropEl?.getAttribute('data-probe-backdrop') ?? '?'

    /*
     * The ring is NOT always painted by the focused element:
     *  • Btn            — the <button> itself, `:focus-visible` → `outline`
     *  • SelectionControl / Switch / Checkbox — the hidden <input> takes focus,
     *    but the `outline` is declared on `#{$this}__input`, a SIBLING div, and
     *    the `--focus-visible` MODIFIER lands on the outer root. Three different
     *    elements; reading the class-bearing one returns `outline-style: none`.
     *  • Field          — no outline at all: the focused state is a `box-shadow`
     *    underline on the field control. A different mechanism, labelled as such.
     * So: search the focused element, then its ancestors up to the slot, then
     * the slot's subtree, for whichever element actually paints something.
     */
    const candidates = []
    for (let n = active; n && n !== slot.parentElement; n = n.parentElement) candidates.push(n)
    candidates.push(...slot.querySelectorAll('*'))

    let ringEl = null
    let mechanism = null
    let ringRaw = null
    let offset = null

    for (const el of candidates) {
        const cs = getComputedStyle(el)
        if (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) {
            ringEl = el
            mechanism = `outline ${cs.outlineWidth}`
            ringRaw = cs.outlineColor
            offset = cs.outlineOffset
            break
        }
    }
    if (!ringEl) {
        for (const el of candidates) {
            const cs = getComputedStyle(el)
            if (cs.boxShadow && cs.boxShadow !== 'none') {
                const first = cs.boxShadow.match(/(rgba?\([^)]+\)|color\(srgb[^)]+\))/i)
                if (!first) continue
                ringEl = el
                mechanism = 'box-shadow'
                ringRaw = first[1]
                offset = '0px'
                break
            }
        }
    }
    /*
     * NOT a harness failure — a real, distinct outcome. `OrigamField`'s default
     * variant ships `--origam-field---focus-ring-width: 0px` /
     * `…-color: rgba(0,0,0,0)` (light.css), so no ring is painted at all unless a
     * theme turns it on. Reporting that as MISSING would blame the probe for a
     * product state; it is labelled NO-RING and counted separately.
     */
    if (!ringEl) return { target, backdrop, noRing: true }

    const ring = parse(ringRaw)
    if (!ring) return { target, backdrop, missing: true, reason: `unparsed ring colour ${ringRaw}` }

    /*
     * The surface the ring sits ON. With a positive `outline-offset` the ring
     * lives outside `ringEl`'s own box, so the adjacent colour is the painted
     * background of its PARENT — not of `ringEl` itself.
     */
    const backdropColor = paintedBackground(ringEl.parentElement ?? ringEl)
    // Secondary adjacency, informational: the component's own fill across the gap.
    const fillColor = paintedBackground(ringEl)

    const ringOverBackdrop = over(ring, backdropColor)

    return {
        target,
        backdrop,
        mechanism,
        offset,
        ringRaw,
        ring: rgb(ringOverBackdrop),
        bg: rgb(backdropColor),
        fill: rgb(fillColor),
        ratio: Math.round(ratio(ringOverBackdrop, backdropColor) * 100) / 100,
        ratioVsFill: Math.round(ratio(over(ring, fillColor), fillColor) * 100) / 100,
        tokenRaw: getComputedStyle(document.documentElement).getPropertyValue('--origam-color__border---focus').trim()
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

if (shotDir) mkdirSync(shotDir, { recursive: true })

const { server, port } = await serveDist()
const browser = await chromium.launch()
const rows = []
const tokenByIdentity = new Map()
const errors = []

// Enough Tab presses to walk the whole probe once, with headroom for the
// chrome `<origam-app>` renders around it.
const TAB_BUDGET = 80

try {
    for (const identity of PROBE_IDENTITIES) {
        for (const mode of PROBE_MODES) {
            const page = await browser.newPage({ viewport: { width: 1400, height: 1400 } })
            await page.addInitScript(([id, md]) => {
                window.__ORIGAM_PROBE__ = { identity: id, mode: md, surface: 'focus' }
            }, [identity, mode])
            await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' })
            await page.waitForFunction(() => window.__ORIGAM_PROBE_READY__ === true)
            // `body` transitions background-color over .2s — read past it.
            await page.waitForTimeout(500)

            const seen = new Set()
            for (let i = 0; i < TAB_BUDGET; i += 1) {
                await page.keyboard.press('Tab')
                // The `--focus-visible` class is written from inside a Vue handler:
                // it lands on the next patch, not synchronously with the DOM event.
                await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))

                const measured = await page.evaluate(measureFocusedInPage, { identity, mode })
                if (measured.error) { errors.push(`${identity}/${mode}: ${measured.error}`); break }
                if (measured.skip) continue
                if (seen.has(measured.target)) continue
                seen.add(measured.target)
                if (measured.tokenRaw) tokenByIdentity.set(`${identity}/${mode}`, measured.tokenRaw)
                rows.push({ identity, mode, ...measured })

                if (shotDir && measured.target && !measured.missing) {
                    const slot = page.locator(`[data-probe-focus="${measured.target}"]`)
                    await slot.screenshot({
                        path: join(shotDir, `${identity}-${mode}-${measured.target.replace(/\//g, '_')}.png`),
                        scale: 'css'
                    }).catch(() => {})
                }
            }
            await page.close()
        }
    }
} finally {
    await browser.close()
    server.close()
}

/* ── report ────────────────────────────────────────────────────────────── */

const pad = (s, n) => String(s).padEnd(n)

console.log('')
console.log(
    pad('identity', 10) + pad('mode', 7) + pad('backdrop', 15) + pad('family', 19) +
    pad('mechanism', 13) + pad('offset', 8) +
    'ratio'.padStart(7) + pad('  gate', 8) + pad('vs fill', 10) + '  ring / backdrop'
)

let anyMissing = false
let worst = Infinity
let fails = 0
let noRing = 0

for (const r of rows) {
    const [, family] = r.target.split('/')
    if (r.missing) {
        anyMissing = true
        console.log(pad(r.identity, 10) + pad(r.mode, 7) + pad(r.backdrop, 15) + pad(family, 19) + `MISSING — ${r.reason}`)
        continue
    }
    if (r.noRing) {
        noRing += 1
        console.log(pad(r.identity, 10) + pad(r.mode, 7) + pad(r.backdrop, 15) + pad(family, 19) + 'NO-RING — nothing painted on focus (not a measurement failure)')
        continue
    }
    const gate = r.ratio < AA_UI ? 'FAIL' : 'ok'
    if (gate === 'FAIL') fails += 1
    worst = Math.min(worst, r.ratio)
    console.log(
        pad(r.identity, 10) + pad(r.mode, 7) + pad(r.backdrop, 15) + pad(family, 19) +
        pad(r.mechanism, 13) + pad(r.offset, 8) +
        String(r.ratio).padStart(7) + pad(`  ${gate}`, 8) + pad(r.ratioVsFill, 10) +
        `  ${r.ring} / ${r.bg}`
    )
}

console.log('')
console.log(`rows: ${rows.length}   measured: ${rows.length - noRing}   FAIL (<${AA_UI}:1): ${fails}   NO-RING: ${noRing}   worst: ${worst === Infinity ? 'n/a' : worst}`)

/* ── negative control ──────────────────────────────────────────────────── */

console.log('')
console.log('NEGATIVE CONTROL — resolved --origam-color__border---focus per config')
for (const [key, value] of tokenByIdentity) console.log(`  ${pad(key, 20)}${value}`)

const distinct = new Set(tokenByIdentity.values())
console.log(`  distinct values: ${distinct.size} over ${tokenByIdentity.size} configs`)

if (errors.length) {
    console.error('\n⛔ contamination / harness errors:')
    for (const e of errors) console.error(`  ${e}`)
    process.exitCode = 1
}
if (anyMissing) {
    console.error('\n⛔ Some rows could not be measured — see MISSING lines above.')
    process.exitCode = 1
}
if (tokenByIdentity.size > 2 && distinct.size < 2) {
    console.error('\n⛔ NEGATIVE CONTROL FAILED — the token reads identically on every identity.')
    console.error('   The probe is not actuating what it measures; the ratios above mean nothing.')
    process.exitCode = 1
}
