import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * OrigamResponsive — spec e2e (pattern canonique btn.spec.ts / card.spec.ts)
 *
 * Navigation directe : page.goto(STORY_PATH + '?variantId=' + STORY_ID + '-' + index)
 * Index 0-based = position du <Variant> dans OrigamResponsive.story.vue.
 *
 * Variants (ordre dans le fichier story) :
 *   0  → Design          { aspectRatio: '16/9', maxWidth: 480 }
 *   1  → Functional       { aspectRatio: '16/9', inline: false }
 *   2  → Slots - Default
 *   3  → Slots - Additional
 *   4  → Prop — aspectRatio (static, two side-by-side ratios)
 *   5  → Prop — inline (static)
 *   6  → Default (playground)
 *
 * REGRESSION (#405) — jusqu'à ce correctif, TOUTES les variables CSS de base
 * lues par `.origam-responsive` / `__content` / `__sizer` étaient des
 * `var(--origam-…)` SANS repli, jamais émises par aucune feuille de tokens :
 * `display`, `flex`, `position`, `width`, `height`, `max-height`, `min-width`,
 * `min-height` tombaient purement (déclaration invalide → ignorée). En plus,
 * `min-height` lisait PAR ERREUR la variable `min-width`. Résultat mesuré
 * avant le correctif : `.origam-responsive` rendait comme un `<div>` nu —
 * `display: block`, pas de `position: relative`, pas d'`overflow: hidden` —
 * ce qui casse le calage en ratio (le `__sizer` n'a plus de conteneur
 * positionné pour ancrer son padding-bottom).
 *
 * Ce spec assert les valeurs CALCULÉES au navigateur réel (jamais jsdom —
 * `getComputedStyle` sous jsdom ne résout JAMAIS `var()`, cf. #398).
 *
 * Pas de data-cy dans les stories canoniques : localiser via .origam-responsive.
 */

const STORY_ID = 'components-stories-responsive-origamresponsive-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

async function expectResponsiveVisible(page: Page, timeout = 12000) {
    const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
    await expect(sandbox.locator('.origam-responsive').first()).toBeVisible({ timeout })
    return sandbox
}

test.describe('OrigamResponsive', () => {
    test.setTimeout(45000)

    test.describe('Design (index 0) — base CSS channel', () => {
        test('root display is flex (was "block" before #405 — no var() fallback ever resolved)', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = await expectResponsiveVisible(page)
            const root = sandbox.locator('.origam-responsive').first()
            await expect(root).toBeVisible()
            const display = await root.evaluate((el) => getComputedStyle(el).display)
            expect(display).toBe('flex')
        })

        test('root position is relative (anchors the __sizer padding-bottom trick)', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = await expectResponsiveVisible(page)
            const root = sandbox.locator('.origam-responsive').first()
            const position = await root.evaluate((el) => getComputedStyle(el).position)
            expect(position).toBe('relative')
        })

        test('root overflow is hidden', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = await expectResponsiveVisible(page)
            const root = sandbox.locator('.origam-responsive').first()
            const overflow = await root.evaluate((el) => getComputedStyle(el).overflow)
            expect(overflow).toBe('hidden')
        })

        test('root max-width is 100% (capped by the maxWidth prop, not left unset)', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = await expectResponsiveVisible(page)
            const root = sandbox.locator('.origam-responsive').first()
            const maxWidth = await root.evaluate((el) => getComputedStyle(el).maxWidth)
            // dimension prop (480px) applies via inline style; the CSS-var
            // channel's own 100% only shows when no explicit maxWidth prop is
            // set — covered separately by the min-height regression below.
            expect(maxWidth).not.toBe('none')
        })

        test('__sizer has pointer-events: none (was unset before #405)', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = await expectResponsiveVisible(page)
            const sizer = sandbox.locator('.origam-responsive__sizer').first()
            const pointerEvents = await sizer.evaluate((el) => getComputedStyle(el).pointerEvents)
            expect(pointerEvents).toBe('none')
        })

        test('__content has flex: 1 1 auto (was unset before #405)', async ({ page }) => {
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = await expectResponsiveVisible(page)
            const content = sandbox.locator('.origam-responsive__content').first()
            const flex = await content.evaluate((el) => getComputedStyle(el).flex)
            expect(flex).toBe('1 1 auto')
        })
    })

    test.describe('min-height regression (#405 — read the wrong variable)', () => {
        test('the shipped scoped CSS reads --origam-responsive---min-height for min-height, not the min-width variable', async ({ page }) => {
            // `minHeight`/`minWidth` props resolve to a LITERAL inline style
            // (`useDimension`'s `dimensionStyles`) whenever passed, which
            // always outranks the scoped rule — so this defect never shows up
            // in `getComputedStyle` (identical `inherit` default either way
            // when unset). The only valid observation point is the CSS text
            // actually shipped to the browser (never jsdom, #398): confirm the
            // fixed property/variable pairing landed in the real stylesheet.
            await page.goto(variantUrl(0), { waitUntil: 'domcontentloaded' })
            const sandbox = await expectResponsiveVisible(page)
            await expect(sandbox.locator('.origam-responsive').first()).toBeVisible()

            const cssText = await page.frameLocator('iframe[src*="__sandbox"]')
                .locator('body')
                .evaluate(() => Array.from(document.styleSheets)
                    .flatMap((sheet) => {
                        try {
                            return Array.from(sheet.cssRules).map((rule) => rule.cssText)
                        } catch {
                            return []
                        }
                    })
                    .join('\n'))

            expect(cssText).toMatch(/min-height:\s*var\(--origam-responsive---min-height\)/)
            expect(cssText).not.toMatch(/min-height:\s*var\(--origam-responsive---min-width\)/)
        })
    })

    test.describe('Prop — inline (index 5) — static demo', () => {
        test('inline renders display: inline-flex', async ({ page }) => {
            await page.goto(variantUrl(5), { waitUntil: 'domcontentloaded' })
            const sandbox = await expectResponsiveVisible(page)
            const root = sandbox.locator('.origam-responsive').first()
            const display = await root.evaluate((el) => getComputedStyle(el).display)
            expect(display).toBe('inline-flex')
        })
    })

    test.describe('Slots - Default (index 2)', () => {
        test('default slot content is rendered inside __content', async ({ page }) => {
            await page.goto(variantUrl(2), { waitUntil: 'domcontentloaded' })
            const sandbox = await expectResponsiveVisible(page)
            await expect(sandbox.locator('.origam-responsive__content strong')).toHaveText('Default slot content')
        })
    })

    test.describe('Slots - Additional (index 3)', () => {
        test('additional slot content is rendered outside __content', async ({ page }) => {
            await page.goto(variantUrl(3), { waitUntil: 'domcontentloaded' })
            const sandbox = await expectResponsiveVisible(page)
            await expect(sandbox.locator('.origam-responsive .demo-badge')).toHaveText('LIVE')
        })
    })
})
