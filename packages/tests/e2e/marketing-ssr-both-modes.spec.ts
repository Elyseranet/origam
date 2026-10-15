/**
 * #1103 — plus de flash clair -> sombre à la première visite.
 *
 * Sans cookie de mode, le serveur n'épingle aucun mode : il omet `data-mode` et
 * inline les DEUX modes de la marque active, le sombre sous
 * `@media (prefers-color-scheme: dark)`. Un visiteur au système sombre reçoit
 * donc des tokens sombres dès le paint serveur (JavaScript désactivé), et le
 * même rendu après hydratation. Un mode ÉPINGLÉ (cookie) l'emporte sur le @media.
 *
 * Les props de composants (`theme.components`) ne peuvent pas suivre le @media :
 * elles sont amorcées en CLAIR côté serveur ET pour l'hydratation, puis passent
 * au mode système juste après (décision propriétaire, #1103).
 *
 * Run :
 *   MARKETING_BASE_URL=http://localhost:3011 pnpm -F @origam/tests exec \
 *     playwright test --config=playwright.marketing.config.ts marketing-ssr-both-modes
 */

import { expect, test, type Browser } from '@playwright/test'

type TScheme = 'light' | 'dark'

interface IPaint {
    dataMode: string | null
    bg: string
    surface: string
    classSignature: string
}

const DARK_BG = { geek: 'rgb(10, 6, 18)', editorial: 'rgb(10, 10, 10)' }
const LIGHT_BG = { geek: 'rgb(246, 240, 255)', editorial: 'rgb(251, 247, 238)' }

/** Lit le paint courant : tout se fait dans UN evaluate (pas d'état Vue entre deux). */
function readPaint (): IPaint {
    const cs = getComputedStyle(document.body)
    return {
        dataMode: document.documentElement.getAttribute('data-mode'),
        bg: cs.backgroundColor,
        surface: cs.getPropertyValue('--origam-color__surface---default').trim(),
        classSignature: [...document.querySelectorAll('[class*="origam-"]')].map(e => e.className).join('|')
    }
}

async function paint (browser: Browser, baseURL: string, opts: {
    js: boolean
    scheme: TScheme
    cookies?: Record<string, string>
}): Promise<{ paint: IPaint, hydrationWarnings: string[] }> {
    const ctx = await browser.newContext({ javaScriptEnabled: opts.js, colorScheme: opts.scheme })
    const host = new URL(baseURL).hostname
    await ctx.addCookies(Object.entries(opts.cookies ?? {}).map(([name, value]) => ({ name, value, domain: host, path: '/' })))
    const page = await ctx.newPage()
    const hydrationWarnings: string[] = []
    page.on('console', m => {
        if (/hydrat|mismatch/i.test(m.text())) hydrationWarnings.push(m.text().slice(0, 200))
    })
    await page.goto(baseURL + '/', { waitUntil: opts.js ? 'networkidle' : 'load' })
    if (opts.js) await page.waitForTimeout(1500)
    const result = await page.evaluate(readPaint)
    await ctx.close()
    return { paint: result, hydrationWarnings }
}

// NB : Vue émet les avertissements d'hydratation uniquement dans un build de DEV ;
// contre un build de production `hydrationWarnings` vaut [] sans rien prouver.
test.describe('SSR — les deux modes, sans flash (#1103)', () => {
    test('système sombre, sans cookie : sombre dès le paint serveur (JS off) et après hydratation (JS on)', async ({ browser }) => {
        const baseURL = test.info().project.use.baseURL!
        const off = await paint(browser, baseURL, { js: false, scheme: 'dark' })
        const on = await paint(browser, baseURL, { js: true, scheme: 'dark' })

        expect(off.paint.dataMode, 'le serveur n\'épingle aucun mode').toBeNull()
        expect(off.paint.bg, 'fond du body au paint serveur').toBe(DARK_BG.geek)
        expect(off.paint.surface).toBe('#0a0612')
        expect(on.paint.bg, 'fond du body après hydratation').toBe(off.paint.bg)
        expect(on.paint.surface).toBe(off.paint.surface)
        expect(on.paint.dataMode, 'le client épingle le mode système').toBe('dark')
        expect(on.hydrationWarnings).toEqual([])
    })

    test('système clair, sans cookie : clair partout', async ({ browser }) => {
        const baseURL = test.info().project.use.baseURL!
        const off = await paint(browser, baseURL, { js: false, scheme: 'light' })
        const on = await paint(browser, baseURL, { js: true, scheme: 'light' })

        expect(off.paint.bg).toBe(LIGHT_BG.geek)
        expect(on.paint.bg).toBe(LIGHT_BG.geek)
        expect(on.hydrationWarnings).toEqual([])
    })

    test('mode ÉPINGLÉ clair + système sombre : le cookie l\'emporte sur le @media', async ({ browser }) => {
        const baseURL = test.info().project.use.baseURL!
        const off = await paint(browser, baseURL, { js: false, scheme: 'dark', cookies: { 'origam-mode': 'light' } })
        const on = await paint(browser, baseURL, { js: true, scheme: 'dark', cookies: { 'origam-mode': 'light' } })

        expect(off.paint.dataMode).toBe('light')
        expect(off.paint.bg).toBe(LIGHT_BG.geek)
        expect(on.paint.bg).toBe(LIGHT_BG.geek)
    })

    test('mode ÉPINGLÉ sombre + système clair : le cookie l\'emporte', async ({ browser }) => {
        const baseURL = test.info().project.use.baseURL!
        const off = await paint(browser, baseURL, { js: false, scheme: 'light', cookies: { 'origam-mode': 'dark' } })
        const on = await paint(browser, baseURL, { js: true, scheme: 'light', cookies: { 'origam-mode': 'dark' } })

        expect(off.paint.dataMode).toBe('dark')
        expect(off.paint.bg).toBe(DARK_BG.geek)
        expect(on.paint.bg).toBe(DARK_BG.geek)
    })

    test('editorial (props clair/sombre différentes), système sombre : tokens sombres au serveur, props sombres après hydratation', async ({ browser }) => {
        const baseURL = test.info().project.use.baseURL!
        const cookies = { 'origam-theme': 'editorial' }
        const serverUnpinned = await paint(browser, baseURL, { js: false, scheme: 'dark', cookies })
        const serverLight = await paint(browser, baseURL, { js: false, scheme: 'light', cookies })
        const hydratedUnpinned = await paint(browser, baseURL, { js: true, scheme: 'dark', cookies })
        const hydratedPinnedDark = await paint(browser, baseURL, { js: true, scheme: 'dark', cookies: { ...cookies, 'origam-mode': 'dark' } })

        // tokens : sombres dès le serveur
        expect(serverUnpinned.paint.bg).toBe(DARK_BG.editorial)
        expect(hydratedUnpinned.paint.bg).toBe(DARK_BG.editorial)
        // props : amorcées en clair côté serveur (même rendu que le serveur en système clair)…
        expect(serverUnpinned.paint.classSignature).toBe(serverLight.paint.classSignature)
        // …puis passées au mode système après hydratation (= rendu d'un mode sombre épinglé)
        expect(hydratedUnpinned.paint.classSignature).toBe(hydratedPinnedDark.paint.classSignature)
        expect(hydratedUnpinned.hydrationWarnings).toEqual([])
    })
})
