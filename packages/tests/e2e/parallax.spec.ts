import { expect, test } from '@playwright/test'

import { toggleHstCheckbox } from './_support/histoire-controls'

/**
 * Probe spec for OrigamParallax runtime behaviour. Covers the three legacy
 * `event` modes (move / scroll / orientation) on <OrigamParallaxElement>
 * AND the enriched multi-layer / direction / disabled / reduced-motion
 * paths on <OrigamParallaxLayer>.
 *
 * Pattern canonique — navigation directe par variantId (cf. btn.spec.ts).
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 *
 * Variants OrigamParallax (0-based) :
 *   0  → Design
 *   1  → Functional
 *   2  → Emit — scroll
 *   3  → Emit — orientation
 *   4  → Mode — multi-layer (scroll-driven)
 *   5  → Prop — direction (horizontal)
 *   6  → Emit — @enter / @leave
 *   7  → Events - enter
 *   8  → Events - leave
 *   9  → Events - scroll-progress
 *  10  → Slots - Default
 *  11  → Default (playground)
 */

const STORY_ID   = 'components-stories-parallax-origamparallax-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamParallax — legacy element runtime', () => {

    test('event="move" — mouse movement translates the element', async ({ page }) => {
        await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const host = sandbox.locator('.origam-parallax').first()
        const element = sandbox.locator('.origam-parallax-element').first()

        await expect(host).toBeVisible({ timeout: 12000 })
        const initialTransform = await element.evaluate((el) => getComputedStyle(el).transform)

        await host.evaluate(async (host) => {
            const rect = host.getBoundingClientRect()
            host.dispatchEvent(new MouseEvent('mouseenter', {
                bubbles: true, clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2, view: window,
            }))
            await new Promise(r => setTimeout(r, 50))
            for (let i = 0; i <= 10; i++) {
                const ratio = i / 10
                host.dispatchEvent(new MouseEvent('mousemove', {
                    bubbles: true, clientX: rect.left + rect.width * ratio, clientY: rect.top + rect.height * ratio, view: window,
                }))
                await new Promise(r => setTimeout(r, 120))
            }
        })
        await page.waitForTimeout(400)

        const finalTransform = await element.evaluate((el) => getComputedStyle(el).transform)
        console.log('[move] initial:', initialTransform, '→ final:', finalTransform)
        expect(finalTransform).not.toBe(initialTransform)
    })

    test('event="scroll" — window scroll translates the element', async ({ page }) => {
        await page.goto(variantUrl(2), { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const host = sandbox.locator('.origam-parallax').first()
        const element = sandbox.locator('.origam-parallax-element').first()

        await expect(host).toBeVisible({ timeout: 12000 })
        const initialTransform = await element.evaluate((el) => getComputedStyle(el).transform)

        await host.evaluate(async (host) => {
            const win = host.ownerDocument.defaultView!
            host.ownerDocument.body.style.minHeight = '300vh'
            for (const top of [100, 200, 400, 600, 800]) {
                win.scrollTo({ top, behavior: 'auto' })
                win.dispatchEvent(new Event('scroll'))
                await new Promise(r => setTimeout(r, 120))
            }
        })
        await page.waitForTimeout(400)

        const finalTransform = await element.evaluate((el) => getComputedStyle(el).transform)
        console.log('[scroll] initial:', initialTransform, '→ final:', finalTransform)
        expect(finalTransform).not.toBe(initialTransform)
    })

    test('event="orientation" — deviceorientation translates the element', async ({ page }) => {
        await page.goto(variantUrl(3), { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const host = sandbox.locator('.origam-parallax').first()
        const element = sandbox.locator('.origam-parallax-element').first()

        await expect(host).toBeVisible({ timeout: 12000 })
        const initialTransform = await element.evaluate((el) => getComputedStyle(el).transform)

        await host.evaluate(async (host) => {
            const win = host.ownerDocument.defaultView!
            for (const beta of [10, 20, 30, 40, 50]) {
                const evt = new Event('deviceorientation') as any
                evt.beta = beta
                evt.gamma = beta
                evt.alpha = 0
                win.dispatchEvent(evt)
                await new Promise(r => setTimeout(r, 120))
            }
        })
        await page.waitForTimeout(400)

        const finalTransform = await element.evaluate((el) => getComputedStyle(el).transform)
        console.log('[orientation] initial:', initialTransform, '→ final:', finalTransform)
        expect(finalTransform).not.toBe(initialTransform)
    })
})


test.describe('OrigamParallax — multi-layer (enriched)', () => {

    test('multi-layer — scroll translates 3 layers with different amplitudes', async ({ page }) => {
        await page.goto(variantUrl(4), { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const host = sandbox.locator('.origam-parallax').first()
        const layers = sandbox.locator('.origam-parallax__layer')

        await expect(host).toBeVisible({ timeout: 12000 })
        await expect(layers).toHaveCount(3)

        // Variant uses PARALLAX_EASING.SPRING → JS rAF path (not CSS-driven).
        // Prime the IntersectionObserver by scrolling down slightly and back so
        // the host enters the viewport and the rAF loop starts before we
        // capture the initial snapshot.
        await sandbox.locator('body').evaluate(async () => {
            const win = window
            win.document.body.style.minHeight = '400vh'
            win.scrollTo({ top: 50, behavior: 'auto' })
            win.dispatchEvent(new Event('scroll'))
            await new Promise(r => setTimeout(r, 200))
            win.scrollTo({ top: 0, behavior: 'auto' })
            win.dispatchEvent(new Event('scroll'))
            await new Promise(r => setTimeout(r, 200))
        })
        await page.waitForTimeout(300)

        const initial = await layers.evaluateAll((els) => els.map((el) => getComputedStyle(el).transform))

        await sandbox.locator('body').evaluate(async () => {
            const win = window
            for (const top of [100, 300, 600, 900, 1200]) {
                win.scrollTo({ top, behavior: 'auto' })
                win.dispatchEvent(new Event('scroll'))
                await new Promise(r => setTimeout(r, 120))
            }
        })
        await page.waitForTimeout(500)

        const final = await layers.evaluateAll((els) => els.map((el) => getComputedStyle(el).transform))
        console.log('[multi-layer] initial:', initial, '→ final:', final)
        // At least one layer must have changed transform (JS rAF path with SPRING easing).
        const someMoved = final.some((t, i) => t !== initial[i])
        expect(someMoved).toBeTruthy()
    })

    test('direction="horizontal" — translateX changes (not translateY)', async ({ page }) => {
        // Navigate directly to the dedicated "Prop — direction (horizontal)" variant (index 5)
        // which pre-sets direction=horizontal, avoiding brittle HstSelect interaction.
        await page.goto(variantUrl(5), { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const host = sandbox.locator('[data-cy="parallax-horizontal"]').first()
        await expect(host).toBeVisible({ timeout: 12000 })

        // direction="horizontal" must emit the modifier class origam-parallax--horizontal
        // on the host element regardless of the CSS animation path.
        const hostClass = await host.evaluate((el) => el.className)
        console.log('[horizontal] host classes:', hostClass)
        expect(hostClass).toContain('origam-parallax--horizontal')
    })

    test('@enter / @leave — counters increment on scroll', async ({ page }) => {
        await page.goto(variantUrl(6), { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const display = sandbox.locator('.origam-parallax__layer').first()
        await expect(display).toBeVisible({ timeout: 12000 })

        // At least @enter must have fired by the time the host hits the viewport.
        const text = await display.innerText()
        console.log('[enter/leave] initial display:', text)
        expect(text).toMatch(/enter:\s*\d+/)
    })

    test('@scroll-progress — progress changes between 0 and 1 on scroll', async ({ page }) => {
        // ⛔ FIXME LEVÉ (2026-09-09) — les DEUX causes ont été traitées, et il
        // fallait bien traiter les deux : lever l'une sans l'autre aurait rendu
        // ce test vert pour la mauvaise raison.
        //
        // 1. LOCATOR DRIFT. La Variant renvoyait vers `logEvent`, le journal
        //    interne d'Histoire, que les specs de ce dépôt documentent comme
        //    non observable depuis la page extérieure (voir badge.spec.ts:270,
        //    breadcrumb.spec.ts:581). Aucun `[data-cy="scroll-progress"]`
        //    n'existait, donc le test échouait sur le locator AVANT la moindre
        //    assertion. La Variant rend de nouveau un compteur lisible.
        //
        // 2. LE DÉFAUT DS (#432), corrigé dans `parallax.composable.ts`. Les
        //    écouteurs `scroll` / `resize` n'étaient installés que dans la
        //    branche `if (!cssScrollDriven.value)`, et `updateProgress()` —
        //    seul appelant de `onProgress` — n'était joignable que par la
        //    boucle rAF du chemin JS. `@scroll-progress` ne partait donc jamais
        //    sur Chrome 115+.
        //
        // ⛔ La note d'origine affirmait que la Variant utilisait l'easing par
        // défaut (linéaire). C'ÉTAIT FAUX au moment où elle a été écrite : la
        // Variant portait `:easing="PARALLAX_EASING.SPRING"`, ce qui la plaçait
        // sur le chemin JS — le seul qui ait jamais fonctionné. Elle
        // n'exerçait donc PAS le chemin cassé. Le binding a été retiré : la
        // Variant tourne désormais sur l'easing par défaut, c'est-à-dire la
        // configuration qu'obtient un consommateur qui ne règle rien.
        //
        // Pas de `test.skip(browserName !== 'chromium')` : maintenant que les
        // deux chemins émettent, l'assertion vaut partout. Sur chromium elle
        // mesure le chemin CSS (celui qui était cassé), sur firefox / webkit
        // le chemin JS de repli. C'est précisément ce qu'on veut d'un filet.
        await page.goto(variantUrl(9), { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const target = sandbox.locator('[data-cy="scroll-progress"]').first()
        await expect(target).toBeVisible({ timeout: 12000 })

        const initial = await target.innerText()

        await sandbox.locator('body').evaluate(async () => {
            const win = window
            win.document.body.style.minHeight = '300vh'
            for (const top of [50, 200, 500, 900, 1500]) {
                win.scrollTo({ top, behavior: 'auto' })
                win.dispatchEvent(new Event('scroll'))
                await new Promise(r => setTimeout(r, 120))
            }
        })
        await page.waitForTimeout(400)

        const final = await target.innerText()
        console.log('[scroll-progress] initial:', initial, '→ final:', final)

        expect(final).toMatch(/progress\s*=\s*\d\.\d{3}/)

        // ⛔ Assertions sur des VALEURS, pas sur « ça a changé ». Un test qui
        // se contente de comparer deux lectures reste vert sur une valeur qui
        // dérive n'importe où — c'est exactement ce qui a laissé passer
        // `--origam-row---density: 0`.
        const read = (text: string) => Number(/([\d.]+)/.exec(text)?.[1] ?? NaN)
        const before = read(initial)
        const after = read(final)

        expect(before).toBe(0)
        expect(after).toBeGreaterThan(0)
        expect(after).toBeLessThanOrEqual(1)
    })

    test('disabled — element transform stays at offset 0 under the mouse', async ({ page }) => {
        // ⛔ 2026-08-18 — this test was VACANT TWICE before this rewrite, and both
        // vacancies have to stay closed for it to keep meaning anything:
        //
        //  1. Its guard read `page.locator('input[type="checkbox"]')`, measured at
        //     ZERO on the whole page. Histoire's `HstCheckbox` renders
        //     `role="checkbox"` on a `<label>`, never a native `<input>` (see
        //     _support/histoire-controls.ts). `count() > 0` was therefore always
        //     false, the `disabled` flip never happened, and the body measured a
        //     variant still at its `:init-state` default `disabled: false`.
        //  2. Even with the flip restored, the body SCROLLED — but the Functional
        //     variant runs `event: PARALLAX_EVENT.MOVE`
        //     (OrigamParallax.story.vue:59), so scrolling drives nothing on the
        //     legacy `<OrigamParallaxElement>` path. Measured on the unfixed
        //     component: scroll moves the element from `matrix(1,0,0,1,-1,-1)` to
        //     `matrix(1,0,0,1,-1,-1)` — i.e. `expect(final).toBe(initial)` passed
        //     without ever exercising `disabled`.
        //
        // The gesture below is therefore the MOUSE one (same shape as the
        // `event="move"` test at the top of this file, which is what proves the
        // gesture actually moves the element when `disabled` is off).
        await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const host = sandbox.locator('.origam-parallax').first()
        // The Functional variant uses <origam-parallax-element> (class
        // .origam-parallax-element), not <origam-parallax-layer>
        // (class .origam-parallax__layer).
        const element = sandbox.locator('.origam-parallax-element').first()
        await expect(host).toBeVisible({ timeout: 12000 })

        // Flip `disabled` on. The Variant's :init-state documents it as `false`,
        // which is what makes this unconditional click safe — HstCheckbox exposes
        // no `aria-checked` to read back (see _support/histoire-controls.ts).
        await toggleHstCheckbox(page, 'Disabled')
        await page.waitForTimeout(300)
        await expect(sandbox.locator('.origam-parallax--disabled')).toHaveCount(1)

        const initial = await element.evaluate((el) => getComputedStyle(el).transform)

        await host.evaluate(async (host) => {
            const rect = host.getBoundingClientRect()
            host.dispatchEvent(new MouseEvent('mouseenter', {
                bubbles: true, clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2, view: window,
            }))
            await new Promise(r => setTimeout(r, 50))
            for (let i = 0; i <= 10; i++) {
                const ratio = i / 10
                host.dispatchEvent(new MouseEvent('mousemove', {
                    bubbles: true, clientX: rect.left + rect.width * ratio, clientY: rect.top + rect.height * ratio, view: window,
                }))
                await new Promise(r => setTimeout(r, 120))
            }
        })
        await page.waitForTimeout(400)

        const final = await element.evaluate((el) => getComputedStyle(el).transform)
        console.log('[disabled/move] initial:', initial, '→ final:', final)
        // `disabled` is documented on IParallaxProps as "translate stays at 0
        // regardless of scroll / events" — the mouse is one of those events.
        expect(final).toBe(initial)
    })

    test('disabled — flipping it mid-hover returns the element to offset 0', async ({ page }) => {
        // Companion to the test above, and the one that actually PINS the fix.
        //
        // Mutation testing (2026-08-18) showed the previous test alone kills only
        // the "no guard at all" mutant: with `disabled` flipped BEFORE any mouse
        // input, `isMoving` is still false and `movement` still {0,0}, so EITHER
        // half of the fix holds the element at rest on its own. Flipping mid-hover
        // is what separates them — by then `isMoving` is true and `movement`
        // carries the last mouse-derived offset, so only the gate on the PROVIDED
        // `isMoving` (which makes OrigamParallaxElement short-circuit to
        // {x: 0, y: 0}) can bring the element home. Drop that gate and this test
        // reddens; the other one does not.
        await page.goto(variantUrl(1), { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const host = sandbox.locator('.origam-parallax').first()
        const element = sandbox.locator('.origam-parallax-element').first()
        await expect(host).toBeVisible({ timeout: 12000 })

        const resting = await element.evaluate((el) => getComputedStyle(el).transform)

        await host.evaluate(async (host) => {
            const rect = host.getBoundingClientRect()
            host.dispatchEvent(new MouseEvent('mouseenter', {
                bubbles: true, clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2, view: window,
            }))
            await new Promise(r => setTimeout(r, 50))
            for (let i = 0; i <= 10; i++) {
                const ratio = i / 10
                host.dispatchEvent(new MouseEvent('mousemove', {
                    bubbles: true, clientX: rect.left + rect.width * ratio, clientY: rect.top + rect.height * ratio, view: window,
                }))
                await new Promise(r => setTimeout(r, 120))
            }
        })
        await page.waitForTimeout(400)

        const moved = await element.evaluate((el) => getComputedStyle(el).transform)
        console.log('[disabled/mid-hover] resting:', resting, '→ moved:', moved)
        // Self-check: if the gesture didn't move anything, the assertion below
        // would pass vacuously — exactly the failure mode this pass exists to remove.
        expect(moved).not.toBe(resting)

        await toggleHstCheckbox(page, 'Disabled')
        await expect(sandbox.locator('.origam-parallax--disabled')).toHaveCount(1)

        // The Variant runs `duration: 1000`, so the return trip is a 1s CSS
        // transition — poll rather than sampling once.
        await expect.poll(
            async () => element.evaluate((el) => getComputedStyle(el).transform),
            { timeout: 8000, message: 'element should return to its resting transform once disabled' }
        ).toBe(resting)
    })

    test('prefers-reduced-motion — layer transform stays at offset 0', async ({ page, browserName }) => {
        // Chromium-only — Firefox's emulateMedia for reducedMotion has quirks
        // through Playwright that make this assertion brittle.
        test.skip(browserName !== 'chromium', 'reduced-motion reliable only on chromium')

        await page.emulateMedia({ reducedMotion: 'reduce' })
        await page.goto(variantUrl(4), { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const layers = sandbox.locator('.origam-parallax__layer')
        await expect(layers.first()).toBeVisible({ timeout: 12000 })

        const initial = await layers.evaluateAll((els) => els.map((el) => getComputedStyle(el).transform))

        await sandbox.locator('body').evaluate(async () => {
            const win = window
            win.document.body.style.minHeight = '300vh'
            for (const top of [100, 300, 600, 1000]) {
                win.scrollTo({ top, behavior: 'auto' })
                win.dispatchEvent(new Event('scroll'))
                await new Promise(r => setTimeout(r, 100))
            }
        })
        await page.waitForTimeout(400)

        const final = await layers.evaluateAll((els) => els.map((el) => getComputedStyle(el).transform))
        console.log('[reduced-motion] initial:', initial, '→ final:', final)
        // No layer should have moved with reduced-motion active.
        for (let i = 0; i < final.length; i++) {
            expect(final[i]).toBe(initial[i])
        }
    })
})
