import { test } from '@playwright/test'

/**
 * Pattern canonique — navigation directe par variantId (cf. btn.spec.ts).
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 *
 * Variants OrigamPagination (0-based) :
 *  19  → With info
 *  20  → Prop — size (small / default / large)
 *  21  → Default (playground)
 */

const STORY_ID   = 'components-stories-pagination-origampagination-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.setTimeout(180_000)

test('DEBUG pagination — size cascade + withInfo Prev/Next text', async ({ page }) => {
    // ── Sizes Variant ───────────────────────────────────────────────
    await page.goto(variantUrl(20))

    const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

    for (const size of ['small', 'default', 'large']) {
        const report = await sandbox.locator(`[data-cy="pagination-size-${size}"]`).first().evaluate((el) => {
            const firstBtn = el.querySelector('.origam-btn') as HTMLElement | null
            // Check what attributes Vue actually applied to the btn.
            const btnAllAttrs = firstBtn
                ? Array.from(firstBtn.attributes).map((a) => `${a.name}="${a.value.slice(0, 60)}"`)
                : []
            return {
                rootClasses: el.className,
                btnClasses: firstBtn?.className ?? null,
                btnSize: firstBtn ? `${firstBtn.getBoundingClientRect().width.toFixed(1)} × ${firstBtn.getBoundingClientRect().height.toFixed(1)}` : null,
                btnFontSize: firstBtn ? getComputedStyle(firstBtn).fontSize : null,
                btnAttrs: btnAllAttrs,
            }
        })

        console.log(`\n=== size="${size}" ===`)

        console.log(JSON.stringify(report, null, 2))
    }

    // ── With Info Variant ───────────────────────────────────────────
    await page.goto(variantUrl(19))

    const info = await sandbox.locator('[data-cy="pagination-with-info"]').first().evaluate((el) => {
        const infoLabel = el.querySelector('.origam-pagination__info')
        const prev = el.querySelector('.origam-pagination__prev .origam-btn') as HTMLElement | null
        const next = el.querySelector('.origam-pagination__next .origam-btn') as HTMLElement | null
        const pageItems = el.querySelectorAll('.origam-pagination__item')
        const pageBtn = el.querySelector('.origam-pagination__item .origam-btn') as HTMLElement | null
        const shape = (b: HTMLElement | null) => b ? ({
            classes: b.className,
            hasIconClass: b.classList.contains('origam-btn--icon'),
            borderRadius: getComputedStyle(b).borderRadius,
            size: `${b.getBoundingClientRect().width.toFixed(1)} × ${b.getBoundingClientRect().height.toFixed(1)}`,
        }) : null
        return {
            hasInfoLabel: !!infoLabel,
            infoText: infoLabel?.textContent?.trim() ?? null,
            prevText: prev?.innerText?.trim() ?? null,
            prevShape: shape(prev),
            nextText: next?.innerText?.trim() ?? null,
            nextShape: shape(next),
            visiblePageItems: pageItems.length,
            pageItemTexts: Array.from(pageItems).map((el) => (el as HTMLElement).innerText.trim()),
            pageBtnShape: shape(pageBtn),
        }
    })

    console.log(`\n=== withInfo ===`)

    console.log(JSON.stringify(info, null, 2))
})
