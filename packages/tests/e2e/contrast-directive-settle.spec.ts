import { expect, test } from '@playwright/test'

import { writeContrastHarnessPage } from './_support/contrast-harness'

/**
 * #1092 — `v-contrast`: ONE measure, taken after the real end of the surface's
 * transition, and no log in a production build.
 *
 * Before: a rAF pass plus a `setTimeout(250)`. The DS's Btn transition lasts
 * 280 ms, so the second read still landed mid-transition and reported a colour
 * the element never settles on (measured in production on the marketing site:
 * two warnings per button, the second one against `rgb(125, 60, 237)` for a
 * fill that settles at `rgb(124, 58, 237)`).
 *
 * Same technique as `contrast-directive.spec.ts`: the REAL directive source,
 * compiled and run in Chromium (jsdom has neither transitions nor
 * `getAnimations`). `dev` picks the build the bundler would produce: the
 * production one has `import.meta.env?.DEV` replaced by `false`.
 */
const DEV_PAGE = writeContrastHarnessPage(true, 'origam-1092-dev-')
const PROD_PAGE = writeContrastHarnessPage(false, 'origam-1092-prod-')

const TRANSITION_MS = 280
/** Dark fill the element settles on, with the black text it started with. */
const SETTLED_BG = 'rgb(10, 10, 10)'

interface IWarnRecord {
    at: number
    text: string
}

type TWindow = Window & typeof globalThis & {
    __origamContrast: { vContrast: { mounted: (el: HTMLElement, binding: { value: undefined }) => void } }
    __warns: IWarnRecord[]
    __changedAt: number
}

/**
 * White fill + black text (21:1, fine) that TRANSITIONS to a dark fill
 * (black on dark: unreadable). The directive is mounted in the same task as
 * the change, exactly what Vue does when a component's surface changes.
 */
async function changeSurfaceAndMount (page: import('@playwright/test').Page, transitionMs: number): Promise<void> {
    await page.evaluate(({ ms, settled }) => {
        const w = window as TWindow

        w.__warns = []
        console.warn = (...args: unknown[]) => {
            w.__warns.push({ at: performance.now(), text: String(args[0]) })
        }

        const el = document.createElement('div')

        el.id = '__case'
        el.textContent = 'Aa'
        el.style.cssText = `background-color: rgb(255, 255, 255); color: rgb(0, 0, 0); transition: background-color ${ms}ms linear, color ${ms}ms linear;`
        document.body.appendChild(el)
        // Commit the starting state: reading the computed value applies the style.
        if (!getComputedStyle(el).backgroundColor) throw new Error('starting state not applied')

        w.__changedAt = performance.now()
        el.style.backgroundColor = settled
        w.__origamContrast.vContrast.mounted(el, { value: undefined })
    }, { ms: transitionMs, settled: SETTLED_BG })
}

test.describe('#1092 — v-contrast waits for the real end of the transition', () => {
    test('a 280 ms transition: ONE measure, after it ends, against the settled colour', async ({ page }) => {
        await page.goto(`file://${DEV_PAGE}`)
        await changeSurfaceAndMount(page, TRANSITION_MS)

        await page.waitForTimeout(TRANSITION_MS + 700)

        const { warns, changedAt, color } = await page.evaluate(() => {
            const w = window as TWindow

            return {
                warns: w.__warns,
                changedAt: w.__changedAt,
                color: getComputedStyle(document.getElementById('__case') as HTMLElement).color
            }
        })

        // One measure => one warning, not two.
        expect(warns, JSON.stringify(warns)).toHaveLength(1)
        // Taken after the transition ended (a mid-transition read would be earlier)…
        expect(warns[0].at - changedAt).toBeGreaterThanOrEqual(TRANSITION_MS - 5)
        // …so it sees the colour the surface settles on, not a transient one.
        expect(warns[0].text).toContain(SETTLED_BG.replace('rgb(', '').replace(')', ''))
        expect(color).toBe('rgb(255, 255, 255)')
    })

    test('no transition: measured on the next frame, not after a fixed delay', async ({ page }) => {
        await page.goto(`file://${DEV_PAGE}`)
        await changeSurfaceAndMount(page, 0)

        await page.waitForTimeout(400)

        const { warns, changedAt } = await page.evaluate(() => ({
            warns: (window as TWindow).__warns,
            changedAt: (window as TWindow).__changedAt
        }))

        expect(warns).toHaveLength(1)
        // Far below the old 250 ms constant: nothing to wait for.
        expect(warns[0].at - changedAt).toBeLessThan(150)
    })

    test('production build: the fix stays active, the console stays silent', async ({ page }) => {
        const messages: string[] = []

        page.on('console', (msg) => messages.push(msg.text()))

        await page.goto(`file://${PROD_PAGE}`)
        await changeSurfaceAndMount(page, TRANSITION_MS)
        // `changeSurfaceAndMount` replaced console.warn with a recorder; the
        // recorder is what must stay empty in a production build.
        await page.waitForTimeout(TRANSITION_MS + 700)

        const { warns, color } = await page.evaluate(() => ({
            warns: (window as TWindow).__warns,
            color: getComputedStyle(document.getElementById('__case') as HTMLElement).color
        }))

        expect(color, 'the correction is active in production').toBe('rgb(255, 255, 255)')
        expect(warns).toEqual([])
        expect(messages.filter((text) => text.includes('Low text contrast'))).toEqual([])
    })
})
