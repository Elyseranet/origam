// #1229 — /theming: no live preview collapses to a 0 px wide box.
//
// The Theme Builder canvas centres with `place-items: center`, i.e. it
// shrink-wraps its items. A root with no intrinsic width (a scroller with a
// height, a parallax layer) therefore rendered `0 x 120` / `0 x 200`.
//
// The probe reads what the page RENDERS, for every one of the 220 previews:
// the canvas' own boxes (a `display: contents` root is looked through, as its
// own box is always 0 x 0 while its content paints) and fails on a box that is
// 0 wide yet has a height — the collapsed-on-one-axis signature. A box that is
// 0 x 0 is NOT flagged: closed overlays (dialog, menu, tooltip…) are contained
// in the canvas and legitimately paint nothing until opened.
//
// Not a defect, measured: `media-volume-control` is a 36 x 36 button (the
// scrubber only exists in the hover tooltip; an earlier probe matched it by
// `data-cy` and read 0 x 0), `theme-provider` is `display: contents` around a
// visible button.
//
// A/B: against the parent commit `virtual-scroll` and `parallax-layer` fail
// (width 0) — measured, see the PR body.

import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { requireMarketingDb } from './_support/require-marketing-db'

requireMarketingDb()

const CANVAS = '[data-cy="theming-canvas-light"]'

/*
 * Click through the DOM (the nav items live in collapsed categories) and retry:
 * a click that lands before hydration wires the handler is lost. Then wait two
 * frames — the canvas still shows the PREVIOUS entry until Vue swaps in the
 * « Rendering… » placeholder — and for that placeholder to go.
 */
const open = async (page: Page, slug: string) => {
    await expect(async () => {
        await page.evaluate((s) => {
            ;(document.querySelector(`[data-cy="theming-nav-item-${s}"]`) as HTMLElement).click()
        }, slug)
        await page.waitForFunction((s) => !!document.querySelector(`[data-cy="theming-nav-item-${s}"].tb-nav__item--active`), slug, { timeout: 4_000 })
    }).toPass({ timeout: 20_000 })
    await page.evaluate(() => new Promise<void>(done => requestAnimationFrame(() => requestAnimationFrame(() => done()))))
    await page.waitForFunction((canvas) => {
        const first = document.querySelector(canvas)?.firstElementChild
        return !(first?.matches('.tb-preview__unavailable') && /Rendering/.test(first.textContent ?? ''))
    }, CANVAS, { timeout: 15_000 })
}

/** `[width, height]` of every box the canvas paints, `display: contents` looked through. */
const boxes = (page: Page): Promise<Array<[number, number]>> =>
    page.evaluate((canvas) => {
        const flat = (el: Element): Element[] =>
            getComputedStyle(el).display === 'contents' ? [...el.children].flatMap(flat) : [el]
        return [...document.querySelector(canvas)!.children].flatMap(flat).map((el) => {
            const r = el.getBoundingClientRect()
            return [r.width, r.height] as [number, number]
        })
    }, CANVAS)

test.describe('/theming — previews never collapse to 0 px wide (#1229)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/theming', { waitUntil: 'load' })
        await page.locator('[data-cy="theming-nav-item-btn"]').waitFor({ state: 'attached', timeout: 30_000 })
        await page.waitForFunction(() => Boolean((document.querySelector('#__nuxt') as unknown as { __vue_app__?: unknown } | null)?.__vue_app__))
    })

    test('virtual-scroll and parallax-layer take the canvas width', async ({ page }) => {
        for (const slug of ['virtual-scroll', 'parallax-layer']) {
            await open(page, slug)
            await expect.poll(async () => {
                const tall = (await boxes(page)).filter(([, h]) => h > 0)
                return tall.length > 0 && tall.every(([w]) => w > 0)
            }, { message: slug, timeout: 3_000 }).toBe(true)
        }
    })

    test('media-volume-control and theme-provider render a visible box', async ({ page }) => {
        for (const slug of ['media-volume-control', 'theme-provider']) {
            await open(page, slug)
            await expect.poll(async () => (await boxes(page)).some(([w, h]) => w > 0 && h > 0), { message: slug, timeout: 3_000 }).toBe(true)
        }
    })

    // #1286 — demo fixtures: these five used to be « unavailable » or 0 x 0.
    test('video, media-controller, infinite-scroll-intersect, spacer and chart-bullet render a real box without console error', async ({ page }) => {
        test.setTimeout(120_000)
        const errors: string[] = []
        page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
        for (const slug of ['video', 'media-controller', 'infinite-scroll-intersect', 'spacer', 'chart-bullet']) {
            await open(page, slug)
            await expect.poll(async () => (await boxes(page)).some(([w, h]) => w > 0 && h > 0), { message: slug, timeout: 5_000 }).toBe(true)
        }
        expect(errors).toEqual([])
    })

    test('no preview of the catalogue has a box 0 px wide and taller than 0', async ({ page }) => {
        test.setTimeout(300_000)

        const slugs = await page.locator('[data-cy^="theming-nav-item-"]').evaluateAll(
            els => els.map(e => e.getAttribute('data-cy')!.replace('theming-nav-item-', ''))
        )
        expect(slugs.length).toBeGreaterThan(200)

        const collapsed: string[] = []
        for (const slug of slugs) {
            await open(page, slug)
            /* The first frame after mount can read 0 wide; a real defect stays. */
            const stayed = await expect.poll(
                async () => (await boxes(page)).some(([w, h]) => w === 0 && h > 0),
                { timeout: 1_500 }
            ).toBe(false).then(() => false, () => true)
            if (stayed) collapsed.push(slug)
        }
        expect(collapsed).toEqual([])
    })
})
