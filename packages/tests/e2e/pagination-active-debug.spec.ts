import { test, expect } from '@playwright/test'

/**
 * Pattern canonique — navigation directe par variantId (cf. btn.spec.ts).
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 *
 * Variants visités (index → titre, 0-based) :
 *   15 → Color — default vs primary
 *   21 → Default
 *
 * Both tests below use variant 15 ("Color — default vs primary"), which
 * renders a truly neutral pagination (`data-cy="pagination-default-look"`,
 * no color prop) side-by-side with a colored one
 * (`data-cy="pagination-primary-look"`, color="primary"). Variant 21 (the
 * "Default" playground) is NOT used for the neutral assertion below: its
 * init-state pre-selects `color: 'primary'`, so it is ALWAYS in colored
 * mode — asserting "neutral gray" against it never reflected reality.
 *
 * ⚠️ The uncolored/ghost-mode assertions below read `.origam-btn__overlay`
 * (a separate absolutely-positioned child element), NOT `.origam-btn`'s own
 * `background-color`. `.origam-btn--variant-text` — the origam baseline
 * theme's default variant for every Btn without an explicit `variant` prop,
 * which is what Pagination's uncolored inner buttons get
 * (`packages/ds/src/themes/origam.theme.ts`, since 9a082b90) — unconditionally
 * forces `background-color: transparent !important` on `.origam-btn`
 * itself. That is a deliberate, tested contract (btn.spec.ts:591,
 * "--variant-text: background-color declaration is transparent !important"),
 * NOT something Pagination (or any consumer) may override by feeding a
 * different value into `--origam-btn---background-color` — verified: it has
 * zero visual effect on `.origam-btn`'s actual rendered background,
 * regardless of what the CSS var resolves to. The only mechanism that CAN
 * still paint a text-variant button is its own `.origam-btn__overlay`
 * (exempt from that rule), which OrigamPagination.vue now drives instead
 * for the uncolored branch's hover/active states.
 */

const STORY_ID   = 'components-stories-pagination-origampagination-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.setTimeout(180_000)

/** Parses `rgb(r, g, b)` / `rgba(r, g, b, a)` / `color(srgb r g b [/ a])`
 *  (r/g/b as 0-1 fractions in the `color()` form) into 0-255 channels. */
function parseColorChannels (value: string): [number, number, number] | null {
    const rgbMatch = value.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
    if (rgbMatch) return [Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3])]
    const srgbMatch = value.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/)
    if (srgbMatch) return [Number(srgbMatch[1]) * 255, Number(srgbMatch[2]) * 255, Number(srgbMatch[3]) * 255]
    return null
}

test('DEBUG pagination — default mode active is neutral gray (not violet), painted via the overlay', async ({ page }) => {
    // "Color — default vs primary" (index 15) exposes the truly neutral
    // pagination via data-cy="pagination-default-look".
    await page.goto(variantUrl(15), { waitUntil: 'domcontentloaded' })

    const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
    await sandbox.locator('.origam-pagination').first().waitFor({ state: 'visible', timeout: 30_000 })

    const neutral = sandbox.locator('[data-cy="pagination-default-look"]')
    await expect(neutral).toBeVisible({ timeout: 12_000 })

    const sample = await neutral.evaluate((root) => {
        const active = root.querySelector('.origam-pagination__item--is-active .origam-btn') as HTMLElement | null
        const inactive = root.querySelector('.origam-pagination__item:not(.origam-pagination__item--is-active) .origam-btn') as HTMLElement | null
        const read = (el: HTMLElement | null) => {
            if (!el) return null
            const overlay = el.querySelector('.origam-btn__overlay') as HTMLElement | null
            const overlayCs = overlay ? getComputedStyle(overlay) : null
            return {
                btnBg: getComputedStyle(el).backgroundColor,
                overlayBg: overlayCs?.backgroundColor ?? null,
                overlayOpacity: overlayCs ? Number(overlayCs.opacity) : null,
                text: el.innerText?.trim(),
            }
        }
        return {
            active: read(active),
            inactive: read(inactive),
        }
    })

    console.log('=== pagination neutral mode: active vs inactive ===')
    console.log(JSON.stringify(sample, null, 2))

    // `.origam-btn` itself stays transparent either way (--variant-text
    // contract) — the CONTRAST lives entirely in the overlay.
    expect(sample.active).not.toBeNull()
    expect(sample.inactive).not.toBeNull()

    // Assert: active item's overlay is visibly opaque (the bug this file
    // was created for: 652a770e — active page indistinguishable from
    // siblings), while the inactive item's overlay stays collapsed.
    expect(sample.active!.overlayOpacity).toBeGreaterThan(0.5)
    expect(sample.inactive!.overlayOpacity ?? 0).toBeLessThan(0.5)

    // Assert the active overlay's colour is specifically the neutral gray
    // token (#e6e6e6 / rgb(230, 230, 230)), NOT the brand-primary violet.
    expect(sample.active!.overlayBg).toBe('rgb(230, 230, 230)')
})

test('DEBUG pagination — default mode hover is visible via the overlay (not white-on-white)', async ({ page }) => {
    await page.goto(variantUrl(15), { waitUntil: 'domcontentloaded' })
    const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
    await sandbox.locator('.origam-pagination').first().waitFor({ state: 'visible', timeout: 30_000 })

    const neutral = sandbox.locator('[data-cy="pagination-default-look"]')
    const inactiveBtn = neutral.locator('.origam-pagination__item:not(.origam-pagination__item--is-active) .origam-btn').first()
    await expect(inactiveBtn).toBeVisible({ timeout: 12_000 })

    const before = await inactiveBtn.evaluate((el) => {
        const overlay = el.querySelector('.origam-btn__overlay') as HTMLElement | null
        const cs = overlay ? getComputedStyle(overlay) : null
        return { bg: cs?.backgroundColor ?? null, opacity: cs ? Number(cs.opacity) : null }
    })

    await inactiveBtn.hover({ force: true })
    await page.waitForTimeout(300)

    const after = await inactiveBtn.evaluate((el) => {
        const overlay = el.querySelector('.origam-btn__overlay') as HTMLElement | null
        const cs = overlay ? getComputedStyle(overlay) : null
        return { bg: cs?.backgroundColor ?? null, opacity: cs ? Number(cs.opacity) : null }
    })

    console.log('=== pagination neutral mode: hover overlay before/after ===')
    console.log(JSON.stringify({ before, after }, null, 2))

    // Before Btn's native overlay defaults its paint colour to WHITE
    // (--origam-color__overlay---scrim) at 12 % opacity — imperceptible on
    // a light page. After hover, Pagination repaints it with the neutral
    // hover token (non-white, fully opaque on the overlay layer itself).
    expect(after.opacity).toBeGreaterThan(before.opacity ?? 0)
    expect(after.bg).not.toBe('rgb(255, 255, 255)')
})

test('DEBUG pagination — colored mode active is a darker shade of the primary fill', async ({ page }) => {
    // "Color — default vs primary" (index 15) exposes both default and colored paginations.
    await page.goto(variantUrl(15), { waitUntil: 'domcontentloaded' })

    const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
    // Positive barrier before the escape hatch below. `count()` does NOT wait:
    // without this, the test samples the DOM before the story has mounted,
    // reads 0, takes the early return and passes WITHOUT ASSERTING ANYTHING.
    // That is what happened when the goto stopped waiting for `load`.
    await expect(sandbox.locator('.origam-pagination').first()).toBeVisible({ timeout: 12000 })
    const colored = sandbox.locator('.origam-pagination.origam-pagination--colored').first()
    const exists = await colored.count().catch(() => 0)
    if (!exists) {
        // No colored variant available in the story — that's fine,
        // just log it so the user sees we tried.
        console.log('(no --colored variant exposed in story — skipping colored mode assertion)')
        return
    }
    const sample = await colored.evaluate((root) => {
        const active = root.querySelector('.origam-pagination__item--is-active .origam-btn') as HTMLElement | null
        const inactive = root.querySelector('.origam-pagination__item:not(.origam-pagination__item--is-active) .origam-btn') as HTMLElement | null
        if (!active) return null
        const cs = getComputedStyle(active)
        return {
            bg: cs.backgroundColor,
            color: cs.color,
            inactiveBg: inactive ? getComputedStyle(inactive).backgroundColor : null,
        }
    })

    console.log('=== colored mode active ===', JSON.stringify(sample))
    expect(sample).not.toBeNull()

    // The inactive/resting item in colored mode is the flat primary fill
    // (--origam-color__action--primary---bg, rgb(124, 58, 237) in the
    // origam baseline theme's light mode). Colored mode uses variant="flat"
    // (OrigamPagination.vue: `variant: baseBg ? VARIANT.FLAT : undefined`),
    // which is NOT subject to the text-variant's forced transparency, so
    // `--origam-btn---background-color` paints `.origam-btn` directly here.
    expect(sample?.inactiveBg).toBe('rgb(124, 58, 237)')

    // The active item is NOT the same flat fill — OrigamPagination's
    // "unified color logic" (cb10d654) intentionally derives every
    // interactive state from --bg-base: hover = 20 % darker, active = 30 %
    // darker (`color-mix(in srgb, var(--bg-base), black 30%)`). Assert the
    // real, derived value rather than a flat, undarkened primary — the
    // previous assertion (`toBe('rgb(124, 58, 237)')`) never matched this
    // derivation and failed identically on chromium/firefox/webkit.
    const channels = parseColorChannels(sample!.bg)
    expect(channels, `could not parse color channels from "${sample?.bg}"`).not.toBeNull()
    const [r, g, b] = channels!
    // 70 % of rgb(124, 58, 237) — i.e. mixed with 30 % black — with a small
    // tolerance for cross-engine rounding of the color-mix() output.
    expect(r).toBeCloseTo(124 * 0.7, 0)
    expect(g).toBeCloseTo(58 * 0.7, 0)
    expect(b).toBeCloseTo(237 * 0.7, 0)
    // And still visibly different from the resting/inactive fill.
    expect(sample?.bg).not.toBe(sample?.inactiveBg)
})
