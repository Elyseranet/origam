import { expect, test } from '@playwright/test'
import type { FrameLocator, Page } from '@playwright/test'

/**
 * OrigamSkeleton — e2e spec (#1073 lot 1, #1074, #1075, #1076)
 *
 * Everything below is measured in a real Chromium against the Histoire
 * story. Nothing is asserted through jsdom, which never resolves `var()`
 * (CLAUDE.md, #398).
 *
 * ## Variants (index 0-based, `grep -E '<Variant' OrigamSkeleton.story.vue`)
 *
 *   0 → Design                     rectangular 200x80, pulse
 *   1 → Design - Shapes            text / rectangular / circular / pill, animation none
 *   2 → Design - Animations        three groups: pulse / wave / none
 *   3 → Functional                 loading text, label key
 *   4 → Functional - Host state    plain elements carrying `.origam--skeleton`
 *   5 → Slots - Default            loading=false
 *   6 → Default (playground)
 *
 * ## Motion
 *
 * `prefers-reduced-motion` IS simulable: `page.emulateMedia({ reducedMotion })`
 * (the previous header of this file said it was not — it was wrong, #1074).
 * The animation itself is observable through `Element.getAnimations()`
 * (name, duration, iteration count, start time), not through keyframe timing.
 *
 * ## Histoire pins the `origam` theme
 *
 * Its `createOrigam` registers `origamTheme`, which is exactly the theme that
 * used to pin `'origam-skeleton': { variant: 'text', rounded: 'sm' }` — so
 * the circle test below reproduces #1075 for real.
 */

const STORY_ID   = 'components-stories-skeleton-origamskeleton-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

const READY = 12000

const sandboxOf = (page: Page): FrameLocator => page.frameLocator('iframe[src*="__sandbox"]')

const open = async (page: Page, idx: number, reducedMotion: 'reduce' | 'no-preference' = 'no-preference') => {
    await page.emulateMedia({ reducedMotion })
    await page.goto(variantUrl(idx), { waitUntil: 'domcontentloaded' })
    const sandbox = sandboxOf(page)
    await expect(sandbox.locator('.origam-skeleton, [data-cy^="skeleton-host"]').first()).toBeVisible({ timeout: READY })
    return sandbox
}

/** Animations running on the page that come from the skeleton rules. */
const skeletonAnimations = (sandbox: FrameLocator, selector: string) =>
    sandbox.locator(selector).first().evaluate((el) => {
        return el.ownerDocument.getAnimations()
            .filter((a) => /skeleton/.test((a as CSSAnimation).animationName ?? ''))
            .map((a) => {
                const timing = a.effect!.getComputedTiming()

                return {
                    name: (a as CSSAnimation).animationName,
                    pseudo: (a.effect as KeyframeEffect).pseudoElement,
                    duration: timing.duration,
                    iterations: timing.iterations,
                    startTime: a.startTime
                }
            })
    })

test.describe('OrigamSkeleton', () => {
    test.setTimeout(60000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // ------------------------------------------------------------------ //

    test.describe('Design', () => {
        test('rectangular applies the modifier class and its 200x80 dimension', async ({ page }) => {
            const sandbox = await open(page, 0)
            const el = sandbox.locator('.origam-skeleton').first()

            await expect(el).toHaveClass(/origam-skeleton--rectangular/)
            expect(await el.evaluate((e) => getComputedStyle(e).width)).toBe('200px')
            expect(await el.evaluate((e) => getComputedStyle(e).height)).toBe('80px')
        })

        test('the fill is painted by ::after from the token, not by the element itself (#1076)', async ({ page }) => {
            const sandbox = await open(page, 0)
            const el = sandbox.locator('.origam-skeleton').first()

            const fill = await el.evaluate((e) => getComputedStyle(e, '::after').backgroundColor)
            expect(fill).not.toBe('rgba(0, 0, 0, 0)')
            expect(fill).not.toBe('transparent')
        })

        test('no <style id="origam-skeleton…"> is injected in <head> (#1076)', async ({ page }) => {
            const sandbox = await open(page, 0)
            const count = await sandbox.locator('.origam-skeleton').first()
                .evaluate((e) => e.ownerDocument.head.querySelectorAll('style[id^="origam-skeleton"]').length)

            expect(count).toBe(0)
        })

        test('the placeholder is a single status zone with an accessible name', async ({ page }) => {
            const sandbox = await open(page, 0)
            const el = sandbox.locator('.origam-skeleton').first()

            expect(await el.getAttribute('role')).toBe('status')
            expect(await el.getAttribute('aria-busy')).toBe('true')
            expect(await el.getAttribute('aria-label')).toBe('Loading...')
        })
    })

    // ------------------------------------------------------------------ //
    // SHAPES (index 1)                                                     //
    // ------------------------------------------------------------------ //

    test.describe('Design - Shapes (primitives)', () => {
        test('circular renders a true circle under the origam theme (#1075)', async ({ page }) => {
            const sandbox = await open(page, 1)
            const circle = sandbox.locator('[data-cy="skeleton-shape-circular-sized"]')

            const m = await circle.evaluate((e) => {
                const cs = getComputedStyle(e)
                const box = e.getBoundingClientRect()

                return {
                    width: box.width,
                    height: box.height,
                    radius: parseFloat(cs.borderTopLeftRadius)
                }
            })

            expect(m.width).toBe(48)
            expect(m.height).toBe(m.width)
            // `radius-full` is 9999px: the browser clamps it to 50 % of the box.
            expect(m.radius).toBeGreaterThanOrEqual(m.width / 2)
        })

        test('circular without width falls back to the 36px token and stays square', async ({ page }) => {
            const sandbox = await open(page, 1)
            const m = await sandbox.locator('[data-cy="skeleton-shape-circular"]').evaluate((e) => {
                const box = e.getBoundingClientRect()

                return { w: box.width, h: box.height }
            })

            expect(m).toEqual({ w: 36, h: 36 })
        })

        test('circular follows the common animation: pulse, no rotation, no conic-gradient (#1075)', async ({ page }) => {
            const sandbox = await open(page, 1)
            const m = await sandbox.locator('[data-cy="skeleton-shape-circular"]').evaluate((e) => ({
                after: getComputedStyle(e, '::after').animationName,
                names: e.ownerDocument.getAnimations().map((a) => (a as CSSAnimation).animationName ?? ''),
                image: getComputedStyle(e).backgroundImage,
                transform: getComputedStyle(e).transform
            }))

            expect(m.after).toBe('origam-skeleton-pulse')
            expect(m.names.filter((n) => /spin/.test(n))).toEqual([])
            expect(m.image).toBe('none')
            expect(m.transform).toBe('none')
        })

        test('text is a pill bar of 0.7em with a block margin', async ({ page }) => {
            const sandbox = await open(page, 1)
            const m = await sandbox.locator('[data-cy="skeleton-shape-text"]').evaluate((e) => {
                const cs = getComputedStyle(e)
                const fontSize = parseFloat(cs.fontSize)

                return {
                    heightEm: parseFloat(cs.height) / fontSize,
                    marginEm: parseFloat(cs.marginTop) / fontSize,
                    radius: parseFloat(cs.borderTopLeftRadius),
                    height: parseFloat(cs.height)
                }
            })

            expect(m.heightEm).toBeCloseTo(0.7, 2)
            expect(m.marginEm).toBeCloseTo(0.35, 2)
            expect(m.radius).toBeGreaterThanOrEqual(m.height / 2)
        })

        test('pill is a fully rounded capsule', async ({ page }) => {
            const sandbox = await open(page, 1)
            const m = await sandbox.locator('[data-cy="skeleton-shape-pill"]').evaluate((e) => {
                const cs = getComputedStyle(e)

                return {
                    width: parseFloat(cs.width),
                    height: parseFloat(cs.height),
                    radius: parseFloat(cs.borderTopLeftRadius)
                }
            })

            expect(m.width).toBeGreaterThan(m.height)
            expect(m.radius).toBeGreaterThanOrEqual(m.height / 2)
        })

        test('rectangular keeps its explicit dimension and a small radius', async ({ page }) => {
            const sandbox = await open(page, 1)
            const m = await sandbox.locator('[data-cy="skeleton-shape-rectangular"]').evaluate((e) => {
                const cs = getComputedStyle(e)

                return { width: cs.width, height: cs.height, radius: parseFloat(cs.borderTopLeftRadius) }
            })

            expect(m.width).toBe('120px')
            expect(m.height).toBe('60px')
            expect(m.radius).toBeLessThan(30)
        })
    })

    // ------------------------------------------------------------------ //
    // ANIMATIONS (index 2)                                                 //
    // ------------------------------------------------------------------ //

    test.describe('Design - Animations', () => {
        test('pulse is the default: the GROUP container animates, 1.6 s', async ({ page }) => {
            const sandbox = await open(page, 2)
            const group = sandbox.locator('[data-cy="skeleton-group-pulse"]')

            const m = await group.evaluate((e) => {
                const anims = e.getAnimations().map((a) => ({
                    name: (a as CSSAnimation).animationName,
                    duration: a.effect!.getComputedTiming().duration
                }))

                return { anims, nameOnGroup: getComputedStyle(e).animationName }
            })

            expect(m.nameOnGroup).toBe('origam-skeleton-pulse')
            expect(m.anims).toHaveLength(1)
            expect(m.anims[0].duration).toBe(1600)
        })

        test('the blocks of a pulse group do not animate on their own (one clock)', async ({ page }) => {
            const sandbox = await open(page, 2)
            const names = await sandbox.locator('[data-cy="skeleton-group-pulse"] .origam-skeleton')
                .evaluateAll((els) => els.map((e) => getComputedStyle(e, '::after').animationName))

            expect(names).toHaveLength(3)
            names.forEach((n) => expect(n).toBe('none'))
        })

        test('the animation is FINITE and capped at about 10 s (WCAG 2.2.2)', async ({ page }) => {
            const sandbox = await open(page, 2)
            const anims = await skeletonAnimations(sandbox, '[data-cy="skeleton-group-pulse"]')

            expect(anims.length).toBeGreaterThan(0)
            anims.forEach((a) => {
                expect(Number.isFinite(a.iterations)).toBe(true)
                expect((a.duration as number) * a.iterations).toBeLessThanOrEqual(10000)
                expect((a.duration as number) * a.iterations).toBeGreaterThanOrEqual(8000)
            })
        })

        test('wave: each block sweeps a highlight (::before translateX), blocks start together', async ({ page }) => {
            const sandbox = await open(page, 2)
            const anims = await sandbox.locator('[data-cy="skeleton-group-wave"]').evaluate((g) => {
                return g.ownerDocument.getAnimations()
                    .filter((a) => (a as CSSAnimation).animationName === 'origam-skeleton-wave')
                    .map((a) => ({
                        pseudo: (a.effect as KeyframeEffect).pseudoElement,
                        duration: a.effect!.getComputedTiming().duration,
                        iterations: a.effect!.getComputedTiming().iterations,
                        startTime: a.startTime
                    }))
            })

            expect(anims).toHaveLength(3)
            anims.forEach((a) => {
                expect(a.pseudo).toBe('::before')
                expect(a.duration).toBe(1600)
                expect(Number.isFinite(a.iterations as number)).toBe(true)
            })
            expect(new Set(anims.map((a) => a.startTime)).size).toBe(1)
        })

        test('wave moves with transform, never with background-position', async ({ page }) => {
            const sandbox = await open(page, 2)
            const props = await sandbox.locator('[data-cy="skeleton-group-wave"] .origam-skeleton').first().evaluate((e) => {
                const wave = e.ownerDocument.getAnimations()
                    .find((a) => (a as CSSAnimation).animationName === 'origam-skeleton-wave')!

                return (wave.effect as KeyframeEffect).getKeyframes().flatMap((k) => Object.keys(k))
            })

            expect(props).toContain('transform')
            expect(props).not.toContain('backgroundPosition')
        })

        test('none: nothing animates', async ({ page }) => {
            const sandbox = await open(page, 2)
            const names = await sandbox.locator('[data-cy="skeleton-group-none"]').evaluate((g) => {
                const own = getComputedStyle(g).animationName
                const blocks = [...g.querySelectorAll('.origam-skeleton')].flatMap((b) => [
                    getComputedStyle(b, '::after').animationName,
                    getComputedStyle(b, '::before').animationName
                ])

                return [own, ...blocks]
            })

            names.forEach((n) => expect(n).toBe('none'))
        })

        test('REDUCED MOTION stops every animation (#1074)', async ({ page }) => {
            const sandbox = await open(page, 2, 'reduce')
            const count = await sandbox.locator('.origam-skeleton').first()
                .evaluate((e) => e.ownerDocument.getAnimations().length)

            expect(count).toBe(0)
        })

        test('control: without the preference the same page DOES animate (#1074)', async ({ page }) => {
            const sandbox = await open(page, 2, 'no-preference')
            const count = await sandbox.locator('.origam-skeleton').first()
                .evaluate((e) => e.ownerDocument.getAnimations().length)

            expect(count).toBeGreaterThan(0)
        })
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 3)                                                 //
    // ------------------------------------------------------------------ //

    test.describe('Functional', () => {
        test('loading=true renders the placeholder, not the slot', async ({ page }) => {
            const sandbox = await open(page, 3)

            await expect(sandbox.locator('.origam-skeleton').first()).toBeVisible()
            await expect(sandbox.locator('p').filter({ hasText: 'Content loaded' })).not.toBeVisible()
        })

        test('variant=text carries its modifier and a token-driven height', async ({ page }) => {
            const sandbox = await open(page, 3)
            const el = sandbox.locator('.origam-skeleton').first()

            await expect(el).toHaveClass(/origam-skeleton--text/)
            expect(await el.evaluate((e) => getComputedStyle(e).height)).not.toBe('0px')
        })

        test('the animation class is the host mechanism, with no legacy pulse class', async ({ page }) => {
            const sandbox = await open(page, 3)
            const classes = await sandbox.locator('.origam-skeleton').first().getAttribute('class')

            expect(classes).toContain('origam--skeleton')
            expect(classes).not.toMatch(/--pulse/)
        })
    })

    // ------------------------------------------------------------------ //
    // HOST STATE (index 4)                                                 //
    // ------------------------------------------------------------------ //

    test.describe('Functional - Host state (.origam--skeleton)', () => {
        test('a plain element paints itself as a placeholder through ::after', async ({ page }) => {
            const sandbox = await open(page, 4)
            const m = await sandbox.locator('[data-cy="skeleton-host-div"]').evaluate((e) => {
                const after = getComputedStyle(e, '::after')

                return {
                    content: after.content,
                    fill: after.backgroundColor,
                    animation: after.animationName,
                    position: getComputedStyle(e).position,
                    childVisibility: getComputedStyle(e.querySelector('span')!).visibility,
                    textFill: getComputedStyle(e).webkitTextFillColor,
                    nodes: e.children.length
                }
            })

            expect(m.content).toBe('""')
            expect(m.fill).not.toBe('rgba(0, 0, 0, 0)')
            expect(m.animation).toBe('origam-skeleton-pulse')
            expect(m.position).toBe('relative')
            expect(m.childVisibility).toBe('hidden')
            expect(m.textFill).toBe('rgba(0, 0, 0, 0)')
            expect(m.nodes).toBe(1)
        })

        test('it is inert: the host cannot be clicked', async ({ page }) => {
            const sandbox = await open(page, 4)
            const pe = await sandbox.locator('[data-cy="skeleton-host-button"]')
                .evaluate((e) => getComputedStyle(e).pointerEvents)

            expect(pe).toBe('none')
        })

        test('wave and none modifiers apply to a host too', async ({ page }) => {
            const sandbox = await open(page, 4)
            const m = await sandbox.locator('[data-cy="skeleton-host-wave"]').evaluate((e) => ({
                before: getComputedStyle(e, '::before').animationName,
                after: getComputedStyle(e, '::after').animationName,
                none: getComputedStyle(e.ownerDocument.querySelector('[data-cy="skeleton-host-none"]')!, '::after').animationName
            }))

            expect(m.before).toBe('origam-skeleton-wave')
            expect(m.after).toBe('none')
            expect(m.none).toBe('none')
        })

        test('a host gets the same finite loop and the same reduced-motion rule', async ({ page }) => {
            const sandbox = await open(page, 4)
            const anims = await skeletonAnimations(sandbox, '[data-cy="skeleton-host-div"]')

            expect(anims.length).toBeGreaterThan(0)
            anims.forEach((a) => expect(Number.isFinite(a.iterations as number)).toBe(true))

            const reduced = await open(page, 4, 'reduce')
            const count = await reduced.locator('[data-cy="skeleton-host-div"]')
                .evaluate((e) => e.ownerDocument.getAnimations().length)

            expect(count).toBe(0)
        })
    })

    // ------------------------------------------------------------------ //
    // SLOTS - DEFAULT (index 5)                                            //
    // ------------------------------------------------------------------ //

    test.describe('Slots - Default', () => {
        test('loading=false renders the slot and no placeholder', async ({ page }) => {
            await page.goto(variantUrl(5), { waitUntil: 'domcontentloaded' })
            const sandbox = sandboxOf(page)
            const slot = sandbox.locator('span').filter({ hasText: 'Custom slot content visible when not loading' })

            await expect(slot).toBeVisible({ timeout: READY })
            await expect(sandbox.locator('.origam-skeleton')).toHaveCount(0)
        })
    })

    // ------------------------------------------------------------------ //
    // DEFAULT playground (index 6)                                         //
    // ------------------------------------------------------------------ //

    test.describe('Default playground', () => {
        test('renders text, 200px wide, pulsing', async ({ page }) => {
            const sandbox = await open(page, 6)
            const el = sandbox.locator('.origam-skeleton').first()

            await expect(el).toHaveClass(/origam-skeleton--text/)
            expect(await el.evaluate((e) => getComputedStyle(e).width)).toBe('200px')
            expect(await el.evaluate((e) => getComputedStyle(e, '::after').animationName)).toBe('origam-skeleton-pulse')
        })
    })
})
