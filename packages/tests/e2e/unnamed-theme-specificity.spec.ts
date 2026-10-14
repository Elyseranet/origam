import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { expect, test } from '@playwright/test'

import type { IOrigamTheme } from '../../ds/src/interfaces/Commons/theme.interface'
import { themeToCss } from '../../ds/src/utils/Commons/apply-theme.util'

/**
 * #1102 — a theme with NO `name` must beat the built-in palette of its mode.
 *
 * WHAT WAS BROKEN
 * ---------------
 * `themeSelector({ mode: 'dark' })` emitted `[data-mode="dark"]` (0,1,0) while
 * `dark.css` declares `[data-mode="dark"]:not([data-theme="light"])` (0,2,0):
 * the consumer's dark theme lost, silently, on every attribute set.
 *
 * WHY THIS SHAPE
 * --------------
 * Pages are written to disk with the attributes already on `<html>` and the
 * runtime rule produced by the REAL `themeToCss` appended after the shipped
 * sheet (what `applyTheme` does at install time), so nothing is mutated after
 * parse (root CLAUDE.md, Histoire `__sandbox` trap). `getComputedStyle` is read
 * in a real Chromium — jsdom never resolves `var()` (#398).
 */

const __dirname = dirname(fileURLToPath(import.meta.url))
const DS = resolve(__dirname, '..', '..', 'ds')
const SRC_MAIN_CSS = resolve(DS, 'src/assets/css/main.css')
const DIST_MAIN_CSS = resolve(DS, 'dist/src/assets/css/main.css')
const SHIPPED = existsSync(DIST_MAIN_CSS) ? DIST_MAIN_CSS : SRC_MAIN_CSS

const TOKEN = '--origam-color__action--primary---bg'
const THEME_VALUE = '#123456'
const BRAND_VALUE = '#abcdef'

const PAGE_DIR = mkdtempSync(join(tmpdir(), 'origam-1102-'))
let counter = 0

interface IAttrs { theme?: string, mode?: string }

const unnamed = (mode: 'light' | 'dark'): IOrigamTheme => ({ mode, cssVars: { [TOKEN]: THEME_VALUE } })
const brand = (mode?: 'light' | 'dark'): IOrigamTheme => ({ name: 'brand', ...(mode ? { mode } : {}), cssVars: { [TOKEN]: BRAND_VALUE } })

async function read (browser: import('@playwright/test').Browser, attrs: IAttrs, themes: IOrigamTheme[], themesFirst = false): Promise<string> {
    const attrsOf = (a: IAttrs): string =>
        (a.theme ? ` data-theme="${a.theme}"` : '') + (a.mode ? ` data-mode="${a.mode}"` : '')
    const themeStyles = themes.map(t => `<style>${themeToCss(t)}</style>`).join('')
    const file = join(PAGE_DIR, `p${counter++}.html`)
    writeFileSync(
        file,
        `<!doctype html><html${attrsOf(attrs)}><head><meta charset="utf-8">`
        + (themesFirst ? themeStyles : '')
        + `<style>${readFileSync(SHIPPED, 'utf8')}</style>`
        + (themesFirst ? '' : themeStyles)
        + `</head><body><div id="sub"${attrsOf(attrs)}></div></body></html>`
    )
    const context = await browser.newContext({ colorScheme: 'light' })
    const page = await context.newPage()
    await page.goto(pathToFileURL(file).href)
    const value = await page.evaluate(
        token => getComputedStyle(document.documentElement).getPropertyValue(token).trim(), TOKEN)
    await context.close()
    return value
}

const SETS: Record<'light' | 'dark', IAttrs[]> = {
    dark: [{ theme: 'dark', mode: 'dark' }, { mode: 'dark' }, { theme: 'site', mode: 'dark' }],
    light: [{ theme: 'light', mode: 'light' }, { mode: 'light' }, { theme: 'site', mode: 'light' }]
}

for (const mode of ['dark', 'light'] as const) {
    test.describe(`#1102 — unnamed ${mode} theme`, () => {
        for (const attrs of SETS[mode]) {
            test(`WINS over the built-in palette — ${JSON.stringify(attrs)}`, async ({ browser }) => {
                const palette = await read(browser, attrs, [])
                const themed = await read(browser, attrs, [unnamed(mode)])
                expect(palette, 'control: the palette declares something else').not.toBe(THEME_VALUE)
                expect(themed).toBe(THEME_VALUE)
            })
        }

        test('WINS even when the theme is injected BEFORE the sheet (no reliance on source order)', async ({ browser }) => {
            for (const attrs of SETS[mode]) {
                expect(await read(browser, attrs, [unnamed(mode)], true), JSON.stringify(attrs)).toBe(THEME_VALUE)
            }
        })

        test('LOSES to a named brand, whichever is injected last', async ({ browser }) => {
            for (const b of [brand(), brand(mode)]) {
                const attrs = { theme: 'brand', mode }
                expect(await read(browser, attrs, [unnamed(mode), b])).toBe(BRAND_VALUE)
                expect(await read(browser, attrs, [b, unnamed(mode)])).toBe(BRAND_VALUE)
            }
        })
    })
}

test('#807 — data-theme="light" data-mode="dark" stays light with an unnamed dark theme', async ({ browser }) => {
    const attrs = { theme: 'light', mode: 'dark' }
    const plainLight = await read(browser, { mode: 'light' }, [])
    const withDark = await read(browser, attrs, [unnamed('dark')])
    expect(withDark).toBe(plainLight)
    expect(withDark).not.toBe(THEME_VALUE)
})
