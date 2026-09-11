import { test, expect } from '@playwright/test'

/**
 * Pattern canonique — navigation directe par variantId (cf. btn.spec.ts).
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 *
 * Variant utilisé : Color — default vs primary (index 15) — expose les
 * deux paginations (default + colored) sur la même page, idéal pour
 * auditer le contraste fg/bg en mode coloré.
 */

const STORY_ID   = 'components-stories-pagination-origampagination-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.setTimeout(180_000)

test('DEBUG pagination — colored mode: white text on primary bg, NOT violet on violet', async ({ page }) => {
    await page.goto(variantUrl(15))

    const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
    const allRoots = await sandbox.locator('.origam-pagination').all()
    const coloredRoots = await sandbox.locator('.origam-pagination--colored').all()

    console.log(`found ${allRoots.length} pagination roots total, ${coloredRoots.length} colored`)
    // Look at the FIRST pagination root (whether colored or not) — that's
    // the Playground which init-state seeds with color: 'primary'.
    const playground = allRoots[0]
    if (playground) {
        const isColored = await playground.evaluate((el) => el.classList.contains('origam-pagination--colored'))

        console.log(`playground (root #0) has --colored class: ${isColored}`)
        await playground.screenshot({ path: '/tmp/pagination-playground.png' })
    }
    for (let i = 0; i < coloredRoots.length; i++) {
        await coloredRoots[i].screenshot({ path: `/tmp/pagination-colored-${i}.png` })
    }

    if (coloredRoots.length === 0) {
        console.log('No colored variant exposed — skipping')
        return
    }

    const samples = []
    for (const root of coloredRoots) {
        const sample = await root.evaluate((el) => {
            const inactive = el.querySelector('.origam-pagination__item:not(.origam-pagination__item--is-active) .origam-btn') as HTMLElement | null
            const active = el.querySelector('.origam-pagination__item--is-active .origam-btn') as HTMLElement | null
            // Also dump all attributes — Vue passes unknown props as DOM attrs
            const dumpAttrs = (e: HTMLElement | null) => e ? Array.from(e.attributes).map((a) => `${a.name}="${a.value.slice(0, 40)}"`).join(' | ') : null
            ;(inactive as any).__attrs_dump = dumpAttrs(inactive)
            const read = (e: HTMLElement | null) => e ? {
                bg: getComputedStyle(e).backgroundColor,
                color: getComputedStyle(e).color,
                inlineStyle: e.getAttribute('style') ?? '(no inline style)',
                classes: e.className,
                attrs: Array.from(e.attributes).map((a) => a.name).join(','),
                text: e.innerText?.trim(),
            } : null
            return { inactive: read(inactive), active: read(active) }
        })
        samples.push(sample)
    }

    console.log(JSON.stringify(samples, null, 2))

    await coloredRoots[0].screenshot({ path: '/tmp/pagination-colored.png' })

    // Assert: in colored mode, fg should be WHITE-ish (or at least NOT
    // the same hue as bg). We test the first colored row's inactive btn:
    const inactive = samples[0]?.inactive
    if (inactive) {
        // Must NOT be primary-fgSubtle (rgb 109, 40, 217 = #6d28d9 = primary 700)
        expect(inactive.color).not.toBe('rgb(109, 40, 217)')
        // Should be white-ish — let's assert rgb is light (avg > 200)
        const m = inactive.color.match(/rgb\(([\d, ]+)\)/) || inactive.color.match(/rgba\(([\d, ]+),/)
        if (m) {
            const [r, g, b] = m[1].split(',').map((s) => parseInt(s.trim(), 10))
            const avg = (r + g + b) / 3

            console.log(`inactive fg avg = ${avg}`)
            expect(avg).toBeGreaterThan(200)
        }
    }
})
