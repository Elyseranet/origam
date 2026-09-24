import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { expect, test } from '@playwright/test'

/**
 * #871 — a DERIVED token must re-resolve inside a themed SUB-TREE.
 *
 * WHAT WAS BROKEN
 * ---------------
 * ~1 761 of the dark sheet's declarations are DERIVED:
 * `--origam-title---color: var(--origam-color__text---primary)`. A custom
 * property is substituted ON THE ELEMENT THAT DECLARES IT; what descendants
 * inherit is the already-substituted value. So a derived token only re-resolves
 * on an element the declaring SELECTOR matches.
 *
 * The dark block used to be anchored to the root
 * (`:root:not([data-theme])[data-mode="dark"]`). An `<OrigamThemeProvider
 * mode="dark">` sub-tree therefore switched the ~60 SEMANTIC tokens (the
 * runtime theme block does emit `[data-mode="dark"]`) while the 1 761 derived
 * ones stayed FROZEN on the root's light values — dark ink on a dark surface.
 * Measured motif: `rgb(10,10,10)` on `rgb(10,10,10)`.
 *
 * WHY A BROWSER, AND WHY NO SERVER
 * --------------------------------
 * `getComputedStyle` under jsdom never resolves `var()` — it fabricates a
 * default that looks like a measurement (root CLAUDE.md, §#398). And Histoire's
 * `__sandbox` neither re-calculates an already-rendered element nor guarantees
 * which of the ~150 worktrees owns :6006. These pages are written to disk with
 * the attributes ALREADY on the elements, so nothing is mutated after parse.
 *
 * THE A/B THAT GIVES THIS SPEC ITS AUTHORITY
 * ------------------------------------------
 * Every assertion below compares two configurations rather than pinning an
 * absolute colour: a spec that passes against the parent commit proves nothing.
 * Verified red on `origin/develop`'s sheets (the sub-tree token read
 * `rgb(10, 10, 10)`, identical to the light root) and green after.
 */

const __dirname = dirname(fileURLToPath(import.meta.url))
const DS = resolve(__dirname, '..', '..', 'ds')

const SRC_MAIN_CSS = resolve(DS, 'src/assets/css/main.css')
const DIST_MAIN_CSS = resolve(DS, 'dist/src/assets/css/main.css')

/** The stylesheet a consumer of `origam/styles` actually receives. */
const SHIPPED = existsSync(DIST_MAIN_CSS) ? DIST_MAIN_CSS : SRC_MAIN_CSS

/**
 * One derived token per channel, plus the SEMANTIC source they derive from.
 * Reading the source too is what separates "the sub-tree switched nothing" from
 * "the sub-tree switched the source but not the derivation" — the actual defect.
 */
const DERIVED_TOKEN = '--origam-title---color'
const SOURCE_TOKEN = '--origam-color__text---primary'

const PAGE_DIR = mkdtempSync(join(tmpdir(), 'origam-871-'))
const PAGES = new Map<string, string>()

interface ISubtreeAttrs {
    theme?: string
    mode?: string
}

interface IProbeResult {
    derived: string
    source: string
    color: string
}

/*********************************************************
 * documentFor
 *
 * @description
 * Builds a page whose `<html>` carries `rootAttrs` and which holds one probe
 * per entry of `subtrees`. Each probe paints ITS OWN surface — a dark sub-tree
 * sitting on the page's light body would report contrast the DS never produces
 * (the artefact that inflated the first pass of #871 by 101 violations).
 ********************************************************/
function documentFor (rootAttrs: ISubtreeAttrs, subtrees: Array<ISubtreeAttrs>): string {
    const attrsOf = (a: ISubtreeAttrs): string =>
        (a.theme ? ` data-theme="${a.theme}"` : '') + (a.mode ? ` data-mode="${a.mode}"` : '')

    const key = `${attrsOf(rootAttrs)}::${subtrees.map(attrsOf).join('::')}`

    if (!PAGES.has(key)) {
        const probes = subtrees.map((s, i) => `
            <div${attrsOf(s)} data-probe="${i}"
                 style="background-color: var(--origam-color__surface---default)">
                <p data-ink="${i}" style="color: var(${DERIVED_TOKEN})">Aa</p>
            </div>`).join('')

        const file = join(PAGE_DIR, `${key.replace(/[^a-z0-9]+/gi, '_')}.html`)
        writeFileSync(
            file,
            `<!doctype html><html${attrsOf(rootAttrs)}><head><meta charset="utf-8">`
            + `<style>${readFileSync(SHIPPED, 'utf8')}</style></head>`
            + `<body>${probes}</body></html>`
        )
        PAGES.set(key, pathToFileURL(file).href)
    }

    return PAGES.get(key)!
}

async function probe (
    browser: import('@playwright/test').Browser,
    rootAttrs: ISubtreeAttrs,
    subtrees: Array<ISubtreeAttrs>
): Promise<Array<IProbeResult>> {
    const context = await browser.newContext({ colorScheme: 'light' })
    const page = await context.newPage()
    await page.goto(documentFor(rootAttrs, subtrees))

    const results = await page.evaluate(([derivedToken, sourceToken]) =>
        [...document.querySelectorAll('[data-probe]')].map((host) => {
            const cs = getComputedStyle(host)
            const ink = host.querySelector('[data-ink]') as HTMLElement
            return {
                derived: cs.getPropertyValue(derivedToken).trim(),
                source: cs.getPropertyValue(sourceToken).trim(),
                color: getComputedStyle(ink).color
            }
        }), [DERIVED_TOKEN, SOURCE_TOKEN])

    await context.close()

    return results
}

test.describe('#871 — derived tokens re-resolve in a themed sub-tree', () => {
    test('POSITIVE — `mode="dark"` on a SUB-TREE of a light page flips the derived token', async ({ browser }) => {
        const [light, dark] = await probe(browser, { mode: 'light' }, [{ mode: 'light' }, { mode: 'dark' }])

        /*** The source has always flipped — that half was never the defect. ***/
        expect(dark.source, 'semantic source must flip').not.toBe(light.source)

        /*** The half that used to stay frozen. ***/
        expect(dark.derived, 'derived token must flip with the sub-tree').not.toBe(light.derived)
        expect(dark.derived, 'derived token must track its source').toBe(dark.source)

        /*** And an element CONSUMING it must repaint. ***/
        expect(dark.color).not.toBe(light.color)
    })

    test('POSITIVE — the same holds under a BRAND, which is the real consumer shape', async ({ browser }) => {
        const [light, dark] = await probe(
            browser,
            { mode: 'light' },
            [{ theme: 'cartoon', mode: 'light' }, { theme: 'cartoon', mode: 'dark' }]
        )

        expect(dark.derived).not.toBe(light.derived)
        expect(dark.derived).toBe(dark.source)
    })

    test('POSITIVE — a light SUB-TREE inside a dark page flips back (the symmetric case)', async ({ browser }) => {
        const [dark, light] = await probe(browser, { mode: 'dark' }, [{ mode: 'dark' }, { mode: 'light' }])

        expect(light.derived, 'light sub-tree must not inherit the dark derivation').not.toBe(dark.derived)
        expect(light.derived).toBe(light.source)
    })

    test('NEGATIVE CONTROL — `data-theme="light"` + `data-mode="dark"` still stays light (#807)', async ({ browser }) => {
        const [contradictory] = await probe(browser, { theme: 'light', mode: 'dark' }, [{ theme: 'light', mode: 'dark' }])
        const [plainLight] = await probe(browser, { mode: 'light' }, [{ mode: 'light' }])
        const [plainDark] = await probe(browser, { mode: 'dark' }, [{ mode: 'dark' }])

        expect(contradictory.derived, 'the brand axis governs when the two contradict').toBe(plainLight.derived)
        expect(contradictory.derived).not.toBe(plainDark.derived)
    })

    test('NEGATIVE CONTROL — an UNTHEMED sub-tree inherits, it does not flip on its own', async ({ browser }) => {
        const [plain] = await probe(browser, { mode: 'light' }, [{}])
        const [light] = await probe(browser, { mode: 'light' }, [{ mode: 'light' }])

        expect(plain.derived, 'a sub-tree with no attribute must keep the page value').toBe(light.derived)
    })
})

test.describe('#871 — surfaces pinned to a primitive keep a readable foreground', () => {
    /**
     * `system-bar` and `tooltip` paint a DARK surface in BOTH modes
     * (`neutral---700` / `neutral---800`) and used to read `text---inverse`,
     * which is white in light and INK in dark — invisible the moment the page
     * switched. The dark sheet now reads `text---primary` there.
     *
     * ⛔ The first attempt moved BOTH sheets to `text---onColor` ("white in both
     * modes"). It measured +2 violations in LIGHT: a brand may redefine
     * `onColor`, and `cartoon` sets it to `#3a2a2e`. Hence the light-mode leg
     * of this test.
     */
    const PAIRS = [
        { name: 'system-bar', bg: '--origam-system-bar---background', fg: '--origam-system-bar---color' },
        { name: 'tooltip', bg: '--origam-tooltip---background-color', fg: '--origam-tooltip---color' }
    ]

    async function ratioOf (
        browser: import('@playwright/test').Browser,
        mode: 'light' | 'dark',
        pair: { bg: string, fg: string }
    ): Promise<number> {
        const context = await browser.newContext({ colorScheme: 'light' })
        const page = await context.newPage()

        const file = join(PAGE_DIR, `pair_${pair.fg.replace(/[^a-z0-9]+/gi, '_')}_${mode}.html`)
        writeFileSync(
            file,
            `<!doctype html><html data-mode="${mode}"><head><meta charset="utf-8">`
            + `<style>${readFileSync(SHIPPED, 'utf8')}</style></head>`
            + `<body><div id="bar" style="background-color: var(${pair.bg}); color: var(${pair.fg})">Aa</div></body></html>`
        )
        await page.goto(pathToFileURL(file).href)

        /*** WCAG 2.x, the formula of `token-intent-contrast.spec.ts`. ***/
        const ratio = await page.evaluate(() => {
            const el = document.getElementById('bar')!
            const parse = (s: string) => (s.match(/[\d.]+/g) ?? []).map(Number)
            const lum = ([r, g, b]: number[]) => {
                const c = (v: number) => {
                    const x = v / 255
                    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
                }
                return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b)
            }
            const cs = getComputedStyle(el)
            const a = lum(parse(cs.color))
            const b = lum(parse(cs.backgroundColor))
            return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
        })

        await context.close()

        return ratio
    }

    for (const pair of PAIRS) {
        test(`POSITIVE — ${pair.name} holds AA in BOTH modes`, async ({ browser }) => {
            expect(await ratioOf(browser, 'light', pair), `${pair.name} light`).toBeGreaterThanOrEqual(4.5)
            expect(await ratioOf(browser, 'dark', pair), `${pair.name} dark`).toBeGreaterThanOrEqual(4.5)
        })
    }

    test('POSITIVE — bottom-nav no longer paints a light slab in dark mode', async ({ browser }) => {
        const bg = async (mode: 'light' | 'dark') => {
            const context = await browser.newContext({ colorScheme: 'light' })
            const page = await context.newPage()
            const file = join(PAGE_DIR, `bottomnav_${mode}.html`)
            writeFileSync(
                file,
                `<!doctype html><html data-mode="${mode}"><head><meta charset="utf-8">`
                + `<style>${readFileSync(SHIPPED, 'utf8')}</style></head>`
                + `<body><div id="nav" style="background-color: var(--origam-bottom-nav---background)"></div></body></html>`
            )
            await page.goto(pathToFileURL(file).href)
            const value = await page.evaluate(() => getComputedStyle(document.getElementById('nav')!).backgroundColor)
            await context.close()
            return value
        }

        expect(await bg('dark'), 'the bottom nav background must follow the mode').not.toBe(await bg('light'))
    })
})
