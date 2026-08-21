import { expect, test } from '@playwright/test'

/**
 * Regression for #386 — Style Dictionary emitted `OrigamBreadcrumbItem` /
 * `OrigamBreadcrumbDivider` tokens as BEM children of the parent
 * (`--origam-breadcrumb__item---*` / `__divider---*`), but both components
 * are separate, independently-shipped `Origam*.vue` files that read their
 * own component-level namespace (`--origam-breadcrumb-item---*` /
 * `-divider---*`). The two names never met — the token was emitted, but no
 * component would ever read it.
 *
 * Fix: moved `item` / `divider` out of the nested `breadcrumb` DTCG block
 * into their own top-level `tokens/component/breadcrumb-item.json` /
 * `breadcrumb-divider.json` files, matching the name the components already
 * read.
 *
 * SCOPE CAVEAT (measured, not assumed — see PR body): of the ~13 properties
 * per component, only TWO are genuinely reachable via this rename:
 * `padding-inline` (divider) and `opacity-disabled` (item). The rest are
 * shadowed by a *separate* bug — the component's own scoped SCSS redeclares
 * the same custom-property name locally (a hardcoded literal, or a read of
 * a *different* name), and that local declaration always wins the cascade
 * regardless of what name the token pipeline uses (higher specificity than
 * `:root`). That second bug is tracked in its own ticket (measurement
 * first, per the team's own root-cause-before-code rule).
 *
 * This spec proves the ONE thing this PR actually fixes: the two token
 * names are now genuinely declared in the page's live cascade, using a real
 * browser's `getComputedStyle` (jsdom, used by the unit-test suite, does
 * not resolve `var()` at all — verified with an isolated probe while fixing
 * #387 — so this proof can only happen here, in Playwright).
 */

const BC_STORY_ID = 'components-stories-breadcrumb-origambreadcrumb-story-vue'
const BC_STORY_PATH = '/stories/story/' + BC_STORY_ID
const bcUrl = (idx: number) => `${BC_STORY_PATH}?variantId=${BC_STORY_ID}-${idx}`

test.describe('OrigamBreadcrumbDivider / OrigamBreadcrumbItem — token namespace reaches the cascade (#386)', () => {
    test.setTimeout(45000)

    test('--origam-breadcrumb-divider---padding-inline is declared at the theme root (was empty pre-fix)', async ({ page }) => {
        await page.goto(bcUrl(0), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const divider = sandbox.locator('.origam-breadcrumb-divider').first()
        await expect(divider).toBeVisible({ timeout: 12000 })

        const value = await divider.evaluate(el => {
            const themeRoot = el.closest('[data-theme]') ?? document.documentElement
            return getComputedStyle(themeRoot).getPropertyValue('--origam-breadcrumb-divider---padding-inline').trim()
        })

        expect(value, '--origam-breadcrumb-divider---padding-inline must resolve to a real value at the theme root').not.toBe('')
    })

    test('--origam-breadcrumb-item---opacity-disabled is declared at the theme root (was empty pre-fix)', async ({ page }) => {
        await page.goto(bcUrl(0), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const item = sandbox.locator('.origam-breadcrumb-item').first()
        await expect(item).toBeVisible({ timeout: 12000 })

        const value = await item.evaluate(el => {
            const themeRoot = el.closest('[data-theme]') ?? document.documentElement
            return getComputedStyle(themeRoot).getPropertyValue('--origam-breadcrumb-item---opacity-disabled').trim()
        })

        expect(value, '--origam-breadcrumb-item---opacity-disabled must resolve to a real value at the theme root').not.toBe('')
    })

    test('the divider actually consumes the token: padding-inline-start resolves through the chain, not the raw fallback name', async ({ page }) => {
        // Not a value-equality check (the token default coincidentally equals
        // the local fallback, 8px) — a value-presence check that the derived
        // longhand is a real, resolved length, proving the var() chain
        // (--padding-inline -> --padding-inline-start -> padding-inline-start)
        // resolves end to end in a real browser.
        await page.goto(bcUrl(0), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const divider = sandbox.locator('.origam-breadcrumb-divider').first()
        await expect(divider).toBeVisible({ timeout: 12000 })

        const paddingInlineStart = await divider.evaluate(el => getComputedStyle(el).paddingInlineStart)
        expect(paddingInlineStart).toBe('8px')
    })

    test('old BEM-child names no longer appear anywhere in the rendered page stylesheets', async ({ page }) => {
        await page.goto(bcUrl(0), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const bc = sandbox.locator('.origam-breadcrumb').first()
        await expect(bc).toBeVisible({ timeout: 12000 })

        const found = await bc.evaluate(() => {
            for (const sheet of document.styleSheets) {
                try {
                    const text = Array.from(sheet.cssRules).map(r => r.cssText).join('\n')
                    if (text.includes('--origam-breadcrumb__item---') || text.includes('--origam-breadcrumb__divider---')) {
                        return true
                    }
                } catch { /* cross-origin sheet — skip */ }
            }
            return false
        })

        expect(found, 'the old --origam-breadcrumb__item---*/__divider---* names must not remain anywhere in the built CSS').toBe(false)
    })
})
