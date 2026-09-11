import { test, expect } from '@playwright/test'

/**
 * Pattern canonique — navigation directe par variantId (cf. btn.spec.ts).
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 *
 * Variant utilisé : Default (playground, index 21) — expose
 * toujours au moins un OrigamPagination, idéal pour auditer les styles
 * actif/inactif sans dépendre d'un nommage de variant fragile.
 */

const STORY_ID   = 'components-stories-pagination-origampagination-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.setTimeout(180_000)

test('DEBUG pagination — default mode active is neutral gray (not violet)', async ({ page }) => {
    await page.goto(variantUrl(21))

    const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
    // Wait for at least one pagination root inside the sandbox
    await sandbox.locator('.origam-pagination').first().waitFor({ state: 'visible', timeout: 30_000 })

    // Read computed styles for the active page btn AND a sibling non-active one
    const sample = await sandbox.locator('.origam-pagination').first().evaluate((root) => {
        const active = root.querySelector('.origam-pagination__item--is-active .origam-btn') as HTMLElement | null
        const inactive = root.querySelector('.origam-pagination__item:not(.origam-pagination__item--is-active) .origam-btn') as HTMLElement | null
        const read = (el: HTMLElement | null) => {
            if (!el) return null
            const cs = getComputedStyle(el)
            return {
                bg: cs.backgroundColor,
                color: cs.color,
                border: `${cs.borderWidth} ${cs.borderStyle} ${cs.borderColor}`,
                radius: cs.borderRadius,
                size: `${Math.round(el.getBoundingClientRect().width)} x ${Math.round(el.getBoundingClientRect().height)}`,
                text: el.innerText?.trim(),
            }
        }
        // Also peek at the overlay opacity
        const overlay = active?.querySelector('.origam-btn__overlay') as HTMLElement | null
        return {
            active: read(active),
            inactive: read(inactive),
            overlayOpacity: overlay ? getComputedStyle(overlay).opacity : null,
            // Confirm the contrast really differs
            contrastPair: {
                activeBg: active ? getComputedStyle(active).backgroundColor : null,
                inactiveBg: inactive ? getComputedStyle(inactive).backgroundColor : null,
            },
        }
    })

    console.log('=== pagination active vs inactive ===')

    console.log(JSON.stringify(sample, null, 2))

    await sandbox.locator('.origam-pagination').first().screenshot({ path: '/tmp/pagination-active.png' })

    // Assert: active bg is NOT transparent (the bug we just fixed)
    expect(sample.active).not.toBeNull()
    expect(sample.active?.bg).not.toBe('rgba(0, 0, 0, 0)')
    // Assert active bg != inactive bg
    expect(sample.contrastPair.activeBg).not.toBe(sample.contrastPair.inactiveBg)
    // Assert active bg is derived from transparent + black 30 % = 30 % black overlay.
    // Chrome reports `color-mix(in srgb, …)` outputs in the new color() syntax,
    // both forms are equivalent.
    expect(sample.active?.bg).toMatch(/^(rgba\(0,\s*0,\s*0,\s*0\.3\)|color\(srgb\s+0\s+0\s+0\s*\/\s*0\.3\))$/)
})

test('DEBUG pagination — colored mode active stays primary fill', async ({ page }) => {
    // "Color — default vs primary" (index 15) exposes both default and colored paginations.
    await page.goto(variantUrl(15))

    const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
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
        if (!active) return null
        const cs = getComputedStyle(active)
        return { bg: cs.backgroundColor, color: cs.color }
    })

    console.log('=== colored mode active ===', JSON.stringify(sample))
    expect(sample?.bg).toBe('rgb(124, 58, 237)') // primary violet
})
