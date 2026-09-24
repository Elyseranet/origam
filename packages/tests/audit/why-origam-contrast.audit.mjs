#!/usr/bin/env node
/**
 * why-origam-contrast.audit.mjs
 *
 * WHAT THIS MEASURES
 * ------------------
 * The contrast matrix behind the /why-origam "live brand-switch" demo, BEFORE
 * it is built: 6 components (`OrigamCard`, `OrigamBtn` primary, `OrigamBtn`
 * outlined, `OrigamChip`, `OrigamAvatar`, `OrigamSwitch`) × 8 theme identities
 * (the DS's own `origam` baseline + the 7 marketing brand themes) × 2 modes
 * (light/dark) = 96 cells. For each cell it measures EVERY real fg/bg pair the
 * component paints — a button's label, a chip's text, an avatar's initials,
 * a card's title AND body, and a switch's label plus its thumb-vs-track UI
 * contrast in both the checked and unchecked state.
 *
 * WHY A REAL BROWSER (not jsdom, not a hand-built probe)
 * -------------------------------------------------------
 *   - `getComputedStyle` under jsdom never resolves `var()` — CLAUDE.md
 *     §"#398". This entire surface is token-driven.
 *   - A hand-made element does not carry the `data-v-<hash>` scoped attribute
 *     Vue stamps on the real render, so a scoped SCSS rule would silently not
 *     match it — "measures a world where the defect does not exist."
 *   - The theme axis is pinned on `<html>` BEFORE the module that mounts Vue
 *     runs (see `why-origam-contrast/main.ts`), never via a post-render
 *     mutation — an already-rendered element does not recalculate under
 *     Histoire's sandbox, and the same caution applies generally.
 *
 * `glass` — SPECIAL CASE, PARTIALLY COVERED (see the console warning this
 * script prints, and the mission report). Its surfaces are translucent over a
 * 4-blob radial-gradient page background. The reference measurement here
 * composites against the OPAQUE resolved `body` background-color (the flat
 * case). A SEPARATE supplementary pass composites the `OrigamCard` (the only
 * probed surface with a translucent background in this theme) against each
 * gradient stop colour declared in `--origam-page---background-image`,
 * reporting the worst ratio found. That is an approximation — the true
 * worst-case is whatever pixel colour the browser paints under the card,
 * which depends on stop geometry/overlap this script does not rasterise —
 * not a per-pixel measurement. Said explicitly rather than silently omitted.
 *
 * Usage:
 *   node audit/why-origam-contrast.audit.mjs [--json /path/to/out.json]
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

const AA_TEXT = 4.5
const AA_UI = 3.0

const PROBE_IDENTITIES = ['origam', 'apple', 'cartoon', 'ecom', 'editorial', 'geek', 'glass', 'material']
const PROBE_MODES = ['light', 'dark']

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
 * PART_SELECTORS — text pairs (fg vs painted ancestor bg), one per measured
 * label/body across the 6 components. `threshold` picks the AA gate to
 * report against (4.5:1 text, 3:1 UI-component).
 ********************************************************/
const PART_SELECTORS = [
    { part: 'card.title', component: 'OrigamCard', kind: 'title', selector: '[data-probe-part="card"] .origam-card-header__title', threshold: AA_TEXT },
    { part: 'card.text', component: 'OrigamCard', kind: 'body', selector: '[data-probe-part="card"] .origam-card__text', threshold: AA_TEXT },
    { part: 'btn.primary.label', component: 'OrigamBtn (primary)', kind: 'label', selector: '[data-probe-part="btn-primary"] .origam-btn__content', threshold: AA_TEXT },
    { part: 'btn.outlined.label', component: 'OrigamBtn (outlined)', kind: 'label', selector: '[data-probe-part="btn-outlined"] .origam-btn__content', threshold: AA_TEXT },
    { part: 'chip.label', component: 'OrigamChip', kind: 'label', selector: '[data-probe-part="chip"] .origam-chip__content', threshold: AA_TEXT },
    { part: 'avatar.initials', component: 'OrigamAvatar', kind: 'initials', selector: '[data-probe-part="avatar"] .origam-avatar__text span', threshold: AA_TEXT },
    { part: 'switch.off.label', component: 'OrigamSwitch', kind: 'label (unchecked)', selector: '[data-probe-part="switch-off"] .origam-label', threshold: AA_TEXT },
    { part: 'switch.on.label', component: 'OrigamSwitch', kind: 'label (checked)', selector: '[data-probe-part="switch-on"] .origam-label', threshold: AA_TEXT }
]

/*********************************************************
 * UI_PAIR_SELECTORS — element-vs-element (no text involved), 3:1 AA gate.
 * Thumb-vs-track: is the moving part distinguishable from the track it sits
 * on? Track-vs-page: is the switch itself distinguishable from the surface
 * it's placed on (no border in the default DS recipe)?
 ********************************************************/
const UI_PAIR_SELECTORS = [
    { part: 'switch.off.thumb-vs-track', component: 'OrigamSwitch', kind: 'thumb vs track (unchecked)', a: '[data-probe-part="switch-off"] .origam-switch__thumb', b: '[data-probe-part="switch-off"] .origam-switch-track', threshold: AA_UI },
    { part: 'switch.on.thumb-vs-track', component: 'OrigamSwitch', kind: 'thumb vs track (checked)', a: '[data-probe-part="switch-on"] .origam-switch__thumb', b: '[data-probe-part="switch-on"] .origam-switch-track', threshold: AA_UI },
    { part: 'switch.off.track-vs-page', component: 'OrigamSwitch', kind: 'track vs page (unchecked)', a: '[data-probe-part="switch-off"] .origam-switch-track', b: 'body', threshold: AA_UI },
    { part: 'switch.on.track-vs-page', component: 'OrigamSwitch', kind: 'track vs page (checked)', a: '[data-probe-part="switch-on"] .origam-switch-track', b: 'body', threshold: AA_UI },
    /*
     * #919 point 5 — disabled / error / indeterminate n'ont PAS été mesurés
     * par la QA initiale (dit explicitement dans le ticket). WCAG 1.4.11
     * exempte un contrôle INACTIF (disabled) du seuil 3:1 — on mesure quand
     * même pour CONSTATER, pas pour supposer, et le rapport le dit
     * explicitement colonne par colonne.
     */
    { part: 'switch.disabled.thumb-vs-track', component: 'OrigamSwitch', kind: 'thumb vs track (disabled — exempté WCAG)', a: '[data-probe-part="switch-disabled"] .origam-switch__thumb', b: '[data-probe-part="switch-disabled"] .origam-switch-track', threshold: AA_UI },
    { part: 'switch.disabled.track-vs-page', component: 'OrigamSwitch', kind: 'track vs page (disabled — exempté WCAG)', a: '[data-probe-part="switch-disabled"] .origam-switch-track', b: 'body', threshold: AA_UI },
    { part: 'switch.error.thumb-vs-track', component: 'OrigamSwitch', kind: 'thumb vs track (error)', a: '[data-probe-part="switch-error"] .origam-switch__thumb', b: '[data-probe-part="switch-error"] .origam-switch-track', threshold: AA_UI },
    { part: 'switch.error.track-vs-page', component: 'OrigamSwitch', kind: 'track vs page (error)', a: '[data-probe-part="switch-error"] .origam-switch-track', b: 'body', threshold: AA_UI },
    { part: 'switch.indeterminate.thumb-vs-track', component: 'OrigamSwitch', kind: 'thumb vs track (indeterminate)', a: '[data-probe-part="switch-indeterminate"] .origam-switch__thumb', b: '[data-probe-part="switch-indeterminate"] .origam-switch-track', threshold: AA_UI },
    { part: 'switch.indeterminate.track-vs-page', component: 'OrigamSwitch', kind: 'track vs page (indeterminate)', a: '[data-probe-part="switch-indeterminate"] .origam-switch-track', b: 'body', threshold: AA_UI }
]

/*********************************************************
 * measureInPage — runs INSIDE the page.
 *
 * @description
 * Colour maths mirrors `packages/tests/audit/dark-contrast.audit.mjs`
 * (validated against hand-computed controls: black/white 21.00, #767676
 * 4.54, #777777 4.48) and `contrast.directive.ts`'s `resolvePaintedBackground`
 * (ancestor walk + alpha compositing). Reused rather than re-derived per
 * CLAUDE.md's explicit instruction to reuse `over()` / `resolvePaintedBackground`.
 ********************************************************/
function measureInPage ([partSelectors, uiPairSelectors]) {
    const unparsed = []

    const parse = (s) => {
        const raw = String(s ?? '').trim()
        if (!raw) return null

        const rgbMatch = raw.match(/rgba?\(([^)]+)\)/i)
        if (rgbMatch) {
            const p = rgbMatch[1].split(',').map((x) => parseFloat(x.trim()))
            if (p.length < 3 || p.slice(0, 3).some(Number.isNaN)) {
                unparsed.push(raw)
                return null
            }
            return { r: p[0], g: p[1], b: p[2], a: p[3] == null || Number.isNaN(p[3]) ? 1 : p[3] }
        }

        /*** Same regex as `srgbToRgb` in `contrast.directive.ts` — 0-1 channels. ***/
        const srgb = raw.match(/color\(\s*srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)/i)
        if (srgb) {
            const ch = (v) => Math.min(1, Math.max(0, parseFloat(v))) * 255
            const a = srgb[4] !== undefined ? parseFloat(srgb[4]) : 1
            return { r: ch(srgb[1]), g: ch(srgb[2]), b: ch(srgb[3]), a: Number.isNaN(a) ? 1 : a }
        }

        if (raw === 'transparent' || raw === 'none') return { r: 0, g: 0, b: 0, a: 0 }

        unparsed.push(raw)
        return null
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
        if (!layers.length) return { r: 255, g: 255, b: 255, a: 1 }
        const deepest = layers[layers.length - 1]
        let acc = deepest.a >= 1 ? layers.pop() : { r: 255, g: 255, b: 255, a: 1 }
        for (let i = layers.length - 1; i >= 0; i -= 1) acc = over(layers[i], acc)
        return acc
    }

    const rgb = (c) => `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`

    const measureTextPair = (spec) => {
        const el = document.querySelector(spec.selector)
        if (!el) return { ...spec, missing: true }
        const fg = parse(getComputedStyle(el).color)
        const bg = paintedBackground(el)
        if (!fg) return { ...spec, missing: true }
        const fgOver = over(fg, bg)
        return { ...spec, fg: rgb(fgOver), bg: rgb(bg), ratio: Math.round(ratio(fgOver, bg) * 100) / 100 }
    }

    const measureUiPair = (spec) => {
        const elA = document.querySelector(spec.a)
        const elB = document.querySelector(spec.b)
        if (!elA || !elB) return { ...spec, missing: true }
        const bgA = paintedBackground(elA)
        const bgB = paintedBackground(elB)
        return { ...spec, fg: rgb(bgA), bg: rgb(bgB), ratio: Math.round(ratio(bgA, bgB) * 100) / 100 }
    }

    const textMeasures = partSelectors.map(measureTextPair)
    const uiMeasures = uiPairSelectors.map(measureUiPair)

    /*********************************************************
     * glass supplementary pass — Card over each declared gradient stop
     *
     * @description
     * Reads the RESOLVED `--origam-page---background-image` off `body`
     * (not the source theme string — what the cascade actually produced),
     * extracts every `rgba(...)` stop colour via the same `rgba?\(...\)`
     * form `parse()` already handles, and composites the card's own
     * (possibly translucent) background OVER each stop treated as fully
     * opaque at its peak. This is a worst-case-among-declared-stops
     * approximation, not a per-pixel raster — see the file header.
     ********************************************************/
    let glassStops = null
    const bgImage = getComputedStyle(document.body).backgroundImage
    if (bgImage && bgImage !== 'none') {
        // ⛔ `transparent` in a gradient computes to `rgba(0, 0, 0, 0)` — a real
        // zero-alpha stop, NOT a colour peak. Treating it as opaque black (as
        // an earlier version of this script did) fabricates a fake near-black
        // "worst case" that no pixel on screen ever renders. Only alpha > 0
        // stops are genuine colour peaks worth testing as an opaque worst case.
        const stopMatches = [...bgImage.matchAll(/rgba?\(([^)]+)\)/gi)].filter((m) => {
            const parts = m[1].split(',').map((x) => parseFloat(x.trim()))
            const a = parts[3] == null || Number.isNaN(parts[3]) ? 1 : parts[3]
            return a > 0
        })
        const cardEl = document.querySelector('[data-probe-part="card"] .origam-card')
                ?? document.querySelector('[data-probe-part="card"] [class*="origam-card"]')
        if (stopMatches.length && cardEl) {
            const cardBg = parse(getComputedStyle(cardEl).backgroundColor)
            const titleEl = document.querySelector('[data-probe-part="card"] .origam-card-header__title')
            const fg = titleEl ? parse(getComputedStyle(titleEl).color) : null
            glassStops = stopMatches.map((m) => {
                const stop = parse(`rgba(${m[1]})`)
                const opaqueStop = { ...stop, a: 1 }
                const cardOverStop = cardBg ? over(cardBg, opaqueStop) : opaqueStop
                const fgOverCard = fg ? over(fg, cardOverStop) : null
                return {
                    stop: rgb(opaqueStop),
                    cardOverStop: rgb(cardOverStop),
                    titleRatio: fgOverCard ? Math.round(ratio(fgOverCard, cardOverStop) * 100) / 100 : null
                }
            })
        }
    }

    return { textMeasures, uiMeasures, glassStops, unparsed: [...new Set(unparsed)] }
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

/*** Resolve `vite`'s binary through `@vitejs/plugin-vue`'s realpath — see the
 * long comment in `dark-contrast.audit.mjs` for why NOT `npx vite`. ***/
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

const outFlag = process.argv.indexOf('--json')
const outPath = outFlag >= 0 ? process.argv[outFlag + 1] : null

buildHarness()

const { server, port } = await serveDist()
const browser = await chromium.launch()
const rows = []
const uiRows = []
const glassByConfig = []
const unparsed = new Set()
const actuation = []

try {
    for (const identity of PROBE_IDENTITIES) {
        for (const mode of PROBE_MODES) {
            const page = await browser.newPage()
            await page.addInitScript(([id, md]) => {
                window.__ORIGAM_PROBE__ = { identity: id, mode: md }
            }, [identity, mode])
            await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'load' })
            await page.waitForFunction(() => window.__ORIGAM_PROBE_READY__ === true)
            /*********************************************************
             * ⛔ `body` (and several component surfaces) carry
             * `transition: background-color 0.2s ease, color 0.2s ease`
             * (`packages/marketing/src/assets/css/base.css`). Two
             * `requestAnimationFrame`s (~33ms) is nowhere near enough for a
             * 200ms transition to settle — measured directly: `body`'s
             * `background-color` for `glass|dark` read `rgb(177, 177, 180)`
             * mid-transition where the settled value is `rgb(7, 6, 15)`
             * (`--origam-color__surface---default`, confirmed correct via
             * `getPropertyValue`). That single artifact fabricated most of
             * this script's first `glass|dark` violations. Wait past the
             * transition, not just past a paint.
             ********************************************************/
            await page.waitForTimeout(500)

            actuation.push(await page.evaluate(() => ({
                attrs: `${document.documentElement.getAttribute('data-theme') ?? '(none)'}|${document.documentElement.getAttribute('data-mode') ?? '(none)'}`,
                surface: getComputedStyle(document.body).backgroundColor
            })))

            const measured = await page.evaluate(measureInPage, [PART_SELECTORS, UI_PAIR_SELECTORS])
            for (const m of measured.textMeasures) rows.push({ identity, mode, ...m })
            for (const m of measured.uiMeasures) uiRows.push({ identity, mode, ...m })
            for (const u of measured.unparsed) unparsed.add(`${identity}|${mode} :: ${u}`)
            if (measured.glassStops) glassByConfig.push({ identity, mode, stops: measured.glassStops })

            // Controls, read from the same page (they don't move with theme).
            if (identity === PROBE_IDENTITIES[0] && mode === PROBE_MODES[0]) {
                const ctl = await page.evaluate(() => {
                    const read = (sel) => {
                        const el = document.querySelector(sel)
                        return { color: getComputedStyle(el).color, bg: getComputedStyle(el).backgroundColor }
                    }
                    return { negative: read('[data-probe-control="negative"]'), positive: read('[data-probe-control="positive"]') }
                })
                globalThis.__controls = ctl
            }

            await page.close()
        }
    }
} finally {
    await browser.close()
    server.close()
}

/*********************************************************
 * Controls gate
 ********************************************************/
const parseSimple = (s) => {
    const m = String(s).match(/rgba?\(([^)]+)\)/i)
    if (!m) return null
    const p = m[1].split(',').map((x) => parseFloat(x.trim()))
    return { r: p[0], g: p[1], b: p[2] }
}
const lumSimple = ({ r, g, b }) => {
    const c = (v) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4 }
    return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b)
}
const ratioSimple = (x, y) => {
    const a = lumSimple(x); const b = lumSimple(y)
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}
const ctl = globalThis.__controls
const negRatio = ctl ? Math.round(ratioSimple(parseSimple(ctl.negative.color), parseSimple(ctl.negative.bg)) * 100) / 100 : null
const posRatio = ctl ? Math.round(ratioSimple(parseSimple(ctl.positive.color), parseSimple(ctl.positive.bg)) * 100) / 100 : null
const negativeOk = negRatio !== null && negRatio >= 20.9
const positiveOk = posRatio !== null && posRatio <= 1.01

console.log('')
console.log(`control NEGATIVE (black on white)    : ratio ${negRatio} — ${negativeOk ? 'not flagged ✔' : 'FLAGGED ✘'}`)
console.log(`control POSITIVE (fg == bg, opaque)   : ratio ${posRatio} — ${positiveOk ? 'FLAGGED ✔' : 'NOT FLAGGED ✘'}`)

/*********************************************************
 * Actuation gate — every config actually painted something different
 ********************************************************/
let actuationOk = actuation.length === PROBE_IDENTITIES.length * PROBE_MODES.length
for (let i = 0; i < actuation.length; i += 2) {
    const [lightCfg, darkCfg] = [actuation[i], actuation[i + 1]]
    if (!lightCfg.attrs.endsWith('|light') || !darkCfg.attrs.endsWith('|dark')) actuationOk = false
    if (lightCfg.surface === darkCfg.surface) actuationOk = false
}
console.log(`actuation (${actuation.length / 2} light/dark pairs)     : ${actuationOk ? 'each config pinned and repainted ✔' : 'A CONFIG DID NOT ACTUATE ✘'}`)
if (!actuationOk) for (const a of actuation) console.log(`   ${a.attrs.padEnd(20)} ${a.surface}`)

/*********************************************************
 * Legibility gate
 ********************************************************/
const legibilityOk = unparsed.size === 0
console.log(`colour strings read                  : ${legibilityOk ? 'all parsed ✔' : `${unparsed.size} UNREADABLE FORM(S) ✘`}`)
if (!legibilityOk) for (const u of unparsed) console.log(`   ${u}`)

/*********************************************************
 * Missing-selector gate — every part must exist in every config, else the
 * component's markup structure changed and the selector list is stale.
 *********************************************************/
const missingText = rows.filter((r) => r.missing)
const missingUi = uiRows.filter((r) => r.missing)
if (missingText.length || missingUi.length) {
    console.log('')
    console.log(`⛔ ${missingText.length + missingUi.length} selector(s) matched nothing — numbers below EXCLUDE these:`)
    for (const m of [...missingText, ...missingUi]) console.log(`   ${m.identity}|${m.mode} :: ${m.part} :: ${m.selector ?? `${m.a} / ${m.b}`}`)
}

if (!positiveOk || !negativeOk || !actuationOk || !legibilityOk) {
    console.error('\n⛔ Control failed — the probe does not actuate, or could not read what it measured.')
    console.error('   Numbers below are meaningless.')
    process.exitCode = 1
}

/*********************************************************
 * Report
 *********************************************************/
const allRows = [...rows.filter((r) => !r.missing), ...uiRows.filter((r) => !r.missing)]
const violations = allRows.filter((r) => r.ratio < r.threshold)

console.log('')
console.log(`instances probed : ${allRows.length}  (text: ${rows.filter((r) => !r.missing).length}, UI: ${uiRows.filter((r) => !r.missing).length})`)
console.log(`violations       : ${violations.length}`)
console.log('')

console.log('FULL MATRIX — worst ratio is the row itself (each row already is one pair)'.padEnd(0))
console.log(
    'identity'.padEnd(10) + 'mode'.padEnd(7) + 'component'.padEnd(20) + 'part'.padEnd(28) +
    'ratio'.padStart(7) + '  gate'.padEnd(8) + '  fg / bg'
)
for (const identity of PROBE_IDENTITIES) {
    for (const mode of PROBE_MODES) {
        const list = allRows.filter((r) => r.identity === identity && r.mode === mode).sort((a, b) => a.ratio - b.ratio)
        for (const r of list) {
            const gate = r.ratio < r.threshold ? 'FAIL' : 'ok'
            console.log(
                identity.padEnd(10) + mode.padEnd(7) + r.component.padEnd(20) + r.part.padEnd(28) +
                String(r.ratio).padStart(7) + `  ${gate}`.padEnd(8) + `  ${r.fg} / ${r.bg}`
            )
        }
    }
}

console.log('')
console.log(`cells under 4.5:1 (text)  : ${allRows.filter((r) => r.threshold === AA_TEXT && r.ratio < AA_TEXT).length}`)
console.log(`cells under 3:1 (UI)      : ${allRows.filter((r) => r.threshold === AA_UI && r.ratio < AA_UI).length}`)

if (violations.length) {
    console.log('')
    console.log('VIOLATIONS')
    for (const v of violations) {
        console.log(`   ${v.identity}|${v.mode} :: ${v.component} :: ${v.kind} :: ${v.ratio}:1 (needs ${v.threshold}:1) :: ${v.fg} on ${v.bg}`)
    }
}

if (glassByConfig.length) {
    console.log('')
    console.log('GLASS SUPPLEMENTARY — card title composited over each declared gradient stop (approximation, see file header)')
    for (const g of glassByConfig) {
        console.log(`  ${g.identity}|${g.mode}:`)
        for (const s of g.stops) {
            const flag = s.titleRatio !== null && s.titleRatio < AA_TEXT ? '  ⛔ FAIL' : ''
            console.log(`     stop ${s.stop.padEnd(20)} card-over-stop ${s.cardOverStop.padEnd(20)} title ratio ${s.titleRatio}${flag}`)
        }
    }
} else {
    console.log('')
    console.log('⚠️  No glass gradient stops were read (body background-image empty/none) — the blob-background case was NOT covered.')
}

if (outPath) {
    const { writeFileSync } = await import('node:fs')
    writeFileSync(outPath, JSON.stringify({ rows, uiRows, glassByConfig }, null, 2))
    console.log(`\njson → ${outPath}`)
}
