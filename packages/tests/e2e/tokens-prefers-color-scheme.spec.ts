import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { expect, test } from '@playwright/test'

/**
 * #794 — the published `./styles` bundle must honour `prefers-color-scheme`.
 *
 * WHY A BROWSER, AND ONLY A BROWSER
 * ---------------------------------
 * A static `grep` on the stylesheet proves the RULE IS WRITTEN, not that it
 * WINS. `:root:not([data-theme])` (0,2,0) has to outrank light.css's
 * `:root, [data-theme="light"]` (0,1,0) while still losing to an explicit
 * `[data-theme="light"]` — that is a cascade question, and only a real engine
 * answers it. `getComputedStyle` under jsdom never resolves `var()` (it
 * fabricates `16px`), so the unit layer is structurally blind here — see the
 * dedicated section in the root CLAUDE.md.
 *
 * WHAT IS MEASURED
 * ----------------
 * The FILE THE PACKAGE EXPORTS, not a convenient source. `./styles` resolves to
 * `dist/src/assets/css/main.css`; when `dist/` is absent (a fresh clone, CI
 * before `build`) the spec falls back to the source `main.css` and pins the two
 * as byte-identical, so the fallback measurement stays honest.
 *
 * THE NEGATIVE CONTROL IS NOT OPTIONAL
 * ------------------------------------
 * "it switches" and "it switches ALWAYS" are indistinguishable without it. A
 * naked `@media (prefers-color-scheme: dark) { :root { … } }` would pass every
 * positive assertion below and silently override a consumer who explicitly
 * asked for `data-theme="light"`. The `data-theme="light"` + OS-dark row is the
 * assertion that separates the two.
 *
 * AND THERE ARE TWO AXES, SO THERE ARE TWO NEGATIVE CONTROLS
 * ---------------------------------------------------------
 * `data-theme` carries the brand, `data-mode` carries light/dark. The second
 * one is the axis a real consumer actually writes — see the block above the
 * `data-mode="light"` test. The original rule guarded only `data-theme`, which
 * left every `useTheme()`/Nuxt consumer repainted against an explicit choice.
 */

const __dirname = dirname(fileURLToPath(import.meta.url))
const DS = resolve(__dirname, '..', '..', 'ds')

const SRC_MAIN_CSS = resolve(DS, 'src/assets/css/main.css')
const DIST_MAIN_CSS = resolve(DS, 'dist/src/assets/css/main.css')

/** Resolves the stylesheet a consumer of `origam/styles` actually receives. */
function resolveShippedStylesheet (): { path: string, origin: 'dist' | 'src' } {
    return existsSync(DIST_MAIN_CSS)
        ? { path: DIST_MAIN_CSS, origin: 'dist' }
        : { path: SRC_MAIN_CSS, origin: 'src' }
}

/** Semantic tokens whose light/dark values differ — the probe reads these. */
const PROBE_MARKUP = `
    <div id="surface" style="background-color: var(--origam-color__surface---default)">surface</div>
    <p id="text" style="color: var(--origam-color__text---primary)">text</p>
`

interface IProbeResult {
    surface: string
    text: string
    attr: string
    mode: string
    osDark: boolean
}

test.describe('#794 — `origam/styles` honours prefers-color-scheme', () => {
    const shipped = resolveShippedStylesheet()

    // One real HTML document per `data-theme` value, written to disk with the
    // bundle INLINED and the attribute already on `<html>`. Nothing is mutated
    // after parse: no `addStyleTag` race, no attribute written onto a tree the
    // engine has already laid out, no stale computed value to misread as a dead
    // rule. The page is then loaded under each OS preference.
    const pageDir = mkdtempSync(join(tmpdir(), 'origam-794-'))
    const pageUrls = new Map<string, string>()

    function documentFor (dataTheme: 'light' | 'dark' | 'brand-x' | null, dataMode: 'light' | 'dark' | null = null): string {
        const key = `${dataTheme ?? 'auto'}--${dataMode ?? 'auto'}`

        if (!pageUrls.has(key)) {
            const file = join(pageDir, `${key}.html`)
            const attr = (dataTheme ? ` data-theme="${dataTheme}"` : '')
                + (dataMode ? ` data-mode="${dataMode}"` : '')

            writeFileSync(
                file,
                `<!doctype html><html${attr}><head><meta charset="utf-8"><style>${readFileSync(shipped.path, 'utf8')}</style></head><body>${PROBE_MARKUP}</body></html>`
            )
            pageUrls.set(key, pathToFileURL(file).href)
        }

        return pageUrls.get(key)!
    }

    /** Renders the probe under a given OS preference and returns RESOLVED colours. */
    async function probe (
        browser: import('@playwright/test').Browser,
        colorScheme: 'light' | 'dark',
        dataTheme: 'light' | 'dark' | 'brand-x' | null,
        dataMode: 'light' | 'dark' | null = null
    ): Promise<IProbeResult> {
        const context = await browser.newContext({ colorScheme })
        const page = await context.newPage()

        await page.goto(documentFor(dataTheme, dataMode))

        const result = await page.evaluate(() => ({
            surface: getComputedStyle(document.getElementById('surface')!).backgroundColor,
            text: getComputedStyle(document.getElementById('text')!).color,
            attr: document.documentElement.getAttribute('data-theme') ?? '(none)',
            mode: document.documentElement.getAttribute('data-mode') ?? '(none)',
            osDark: matchMedia('(prefers-color-scheme: dark)').matches
        }))

        await context.close()

        return result
    }

    test('the measured stylesheet is the one the package ships', () => {
        // When both exist they MUST be the same bytes: `build` copies the source
        // file into `dist/` untouched. If they ever diverge, every other
        // assertion in this file would be measuring the wrong artefact.
        if (existsSync(DIST_MAIN_CSS) && existsSync(SRC_MAIN_CSS)) {
            expect(readFileSync(DIST_MAIN_CSS)).toEqual(readFileSync(SRC_MAIN_CSS))
        }

        expect(existsSync(shipped.path), `no shipped stylesheet at ${shipped.path}`).toBe(true)
    })

    test('the media query survives minification into the bundle', () => {
        // `main.css` is emitted by `sass --style=compressed`: one single line,
        // and the minifier strips the quotes. A `grep -c` counts LINES here and
        // answers 0/1 whatever the truth is; `data-theme="dark"` matches nothing
        // because the shipped text reads `data-theme=dark`. Both traps are the
        // reason #794 was under-measured for weeks.
        const css = readFileSync(shipped.path, 'utf8')
        const occurrences = (needle: string) => css.split(needle).length - 1

        expect(occurrences('prefers-color-scheme'), 'no auto dark-mode rule in the shipped bundle').toBeGreaterThan(0)
        expect(occurrences('data-theme=dark') + occurrences('data-theme="dark"')).toBeGreaterThan(0)
    })

    test('light and dark are actually different — the matrix is not vacuous', async ({ browser }) => {
        const light = await probe(browser, 'light', 'light')
        const dark = await probe(browser, 'light', 'dark')

        expect(light.surface).not.toBe(dark.surface)
        expect(light.text).not.toBe(dark.text)
    })

    test('POSITIVE — OS dark + no data-theme renders the dark theme', async ({ browser }) => {
        const auto = await probe(browser, 'dark', null)
        const explicitDark = await probe(browser, 'light', 'dark')

        expect(auto.osDark).toBe(true)
        expect(auto.attr).toBe('(none)')
        expect(auto.surface).toBe(explicitDark.surface)
        expect(auto.text).toBe(explicitDark.text)
    })

    test('POSITIVE — OS light + no data-theme stays on the light theme', async ({ browser }) => {
        const auto = await probe(browser, 'light', null)
        const explicitLight = await probe(browser, 'light', 'light')

        expect(auto.osDark).toBe(false)
        expect(auto.surface).toBe(explicitLight.surface)
        expect(auto.text).toBe(explicitLight.text)
    })

    test('NEGATIVE CONTROL — data-theme="light" pins light even under OS dark', async ({ browser }) => {
        const pinned = await probe(browser, 'dark', 'light')
        const explicitLight = await probe(browser, 'light', 'light')
        const explicitDark = await probe(browser, 'light', 'dark')

        expect(pinned.osDark).toBe(true)
        expect(pinned.surface).toBe(explicitLight.surface)
        expect(pinned.text).toBe(explicitLight.text)
        // Without this the auto rule could be a blanket override.
        expect(pinned.surface).not.toBe(explicitDark.surface)
    })

    // ── THE SECOND AXIS ────────────────────────────────────────────────────
    // The negative control above tests `data-theme="light"`. That is NOT the
    // shape a real consumer produces. This DS is two-axis: `useTheme()`'s
    // `applyModeToDocument()` ALWAYS writes a concrete `data-mode`, and the
    // Nuxt plugin OMITS `data-theme` when the brand resolves to `'auto'`. A
    // page that pinned light therefore reads `<html data-mode="light">`, with
    // no `data-theme` at all — which `:root:not([data-theme])` matches.
    // Measured in Chromium on the shipped bundle, OS dark:
    //   :not([data-theme])                   → rgb(10, 10, 10)    ⛔ repainted
    //   :not([data-theme]):not([data-mode])  → rgb(255, 255, 255) ✅ pinned
    // Without this test the guard on the second axis can be deleted and every
    // other assertion in this file still passes.
    test('NEGATIVE CONTROL — data-mode="light" pins light even under OS dark', async ({ browser }) => {
        const pinned = await probe(browser, 'dark', null, 'light')
        const explicitLight = await probe(browser, 'light', 'light')
        const explicitDark = await probe(browser, 'light', 'dark')

        expect(pinned.osDark).toBe(true)
        expect(pinned.attr).toBe('(none)')
        expect(pinned.mode).toBe('light')
        expect(pinned.surface).toBe(explicitLight.surface)
        expect(pinned.text).toBe(explicitLight.text)
        expect(pinned.surface).not.toBe(explicitDark.surface)
    })

    test('NEGATIVE CONTROL — a brand theme + data-mode="light" stays light under OS dark', async ({ browser }) => {
        // The realistic shape for a consumer who registered a brand theme.
        const pinned = await probe(browser, 'dark', 'brand-x', 'light')
        const explicitLight = await probe(browser, 'light', 'light')

        expect(pinned.osDark).toBe(true)
        expect(pinned.surface).toBe(explicitLight.surface)
    })

    // ── #807 — FIXED ─────────────────────────────────────────────────────
    // `data-mode="dark"` ALONE used to paint nothing: `[data-mode="…"]` rules
    // used to be emitted only by the runtime theme matrix
    // (`apply-theme.util.ts`, injected by `createOrigam()`), and the static
    // `origam/styles` bundle had ZERO occurrence of `data-mode`. The fix
    // widens the explicit `[data-theme="dark"]` block's SELECTOR LIST —
    // `:root:not([data-theme])[data-mode="dark"]` — rather than duplicating
    // its ~2731 declarations a third time. This test used to be a PINNED
    // GAP (asserted the defect, so a future fix would turn it red on
    // purpose); it now asserts the fix and would go red again on a
    // regression.
    test('POSITIVE — data-mode="dark" alone (#807) now renders the dark theme', async ({ browser }) => {
        const css = readFileSync(shipped.path, 'utf8')
        // Was exactly 1 (the auto-mode media query's `:not([data-mode])`)
        // before #807 — now the explicit block's added selector contributes
        // a second occurrence.
        expect(css.split('data-mode').length - 1, 'no data-mode rule found in the shipped bundle').toBeGreaterThan(1)

        const modeOnly = await probe(browser, 'light', null, 'dark')
        const explicitDark = await probe(browser, 'light', 'dark')
        const explicitLight = await probe(browser, 'light', 'light')

        expect(modeOnly.attr).toBe('(none)')
        expect(modeOnly.mode).toBe('dark')
        expect(modeOnly.surface).toBe(explicitDark.surface)
        expect(modeOnly.text).toBe(explicitDark.text)
        expect(modeOnly.surface).not.toBe(explicitLight.surface)
    })

    // The fix must not make `data-mode` outrank an explicitly pinned brand:
    // `data-theme` carries the brand and governs the moment it is written,
    // `data-mode` alone only ever fills in for an ABSENT brand.
    test('NEGATIVE CONTROL — data-theme="light" + data-mode="dark" stays light (brand governs)', async ({ browser }) => {
        const both = await probe(browser, 'light', 'light', 'dark')
        const explicitLight = await probe(browser, 'light', 'light')
        const explicitDark = await probe(browser, 'light', 'dark')

        expect(both.attr).toBe('light')
        expect(both.mode).toBe('dark')
        expect(both.surface).toBe(explicitLight.surface)
        expect(both.surface).not.toBe(explicitDark.surface)
    })

    test('NEGATIVE CONTROL — data-theme="dark" stays dark under OS light', async ({ browser }) => {
        const pinned = await probe(browser, 'light', 'dark')
        const auto = await probe(browser, 'dark', null)

        expect(pinned.osDark).toBe(false)
        expect(pinned.surface).toBe(auto.surface)
    })
})
