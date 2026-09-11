import { test } from '@playwright/test'

/**
 * Pattern canonique — navigation directe par variantId (cf. btn.spec.ts).
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 *
 * Variants OrigamTimeline (0-based) :
 *   0  → Design
 *   1  → Functional
 *   2  → Size / Density
 *   3  → Prop — orientation (horizontal, scroll-snap slider)
 *   4  → Slots - Default
 *   5  → Default (playground)
 */

const STORY_ID   = 'components-stories-timeline-origamtimeline-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.setTimeout(180_000)

test('DEBUG timeline — size cascade + horizontal orientation', async ({ page }) => {
    // ── Size / Density variant ────────────────────────────────────────
    await page.goto(variantUrl(2))

    const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

    for (const size of ['x-small', 'small', 'default', 'large', 'x-large']) {
        await sandbox.locator('[data-cy="timeline-size-density"]').first().evaluate((el, sz) => {
            el.classList.remove(
                'origam-timeline--size-x-small',
                'origam-timeline--size-small',
                'origam-timeline--size-default',
                'origam-timeline--size-large',
                'origam-timeline--size-x-large',
            )
            el.classList.add(`origam-timeline--size-${sz}`)
        }, size)

        const report = await sandbox.locator('[data-cy="timeline-size-density"]').first().evaluate((el) => {
            const cs = getComputedStyle(el)
            const dot = el.querySelector('.origam-timeline-item__dot') as HTMLElement | null
            const track = el.querySelector('.origam-timeline-item__track') as HTMLElement | null
            const title = el.querySelector('.origam-timeline-item__title') as HTMLElement | null
            return {
                dotSizeVar: cs.getPropertyValue('--origam-timeline---dot-size').trim(),
                trackWidthVar: cs.getPropertyValue('--origam-timeline---track-width').trim(),
                gapVar: cs.getPropertyValue('--origam-timeline---gap').trim(),
                titleFontVar: cs.getPropertyValue('--origam-timeline---title-font-size').trim(),
                dotComputed: dot ? `${getComputedStyle(dot).width} × ${getComputedStyle(dot).height}` : null,
                trackComputed: track ? getComputedStyle(track).width : null,
                titleComputed: title ? getComputedStyle(title).fontSize : null,
            }
        })

        console.log(`\n=== size="${size}" ===`)

        console.log(JSON.stringify(report, null, 2))
    }

    // ── Horizontal variant ──────────────────────────────────────────
    await page.goto(variantUrl(3))

    const h = await sandbox.locator('[data-cy="timeline-horizontal"]').first().evaluate((el) => {
        const wrapper = el.querySelector('.origam-timeline__track-wrapper') as HTMLElement | null
        const items = Array.from(el.querySelectorAll('.origam-timeline-item')) as HTMLElement[]
        const firstItem = items[0]
        const lastItem = items[items.length - 1]
        const firstTrack = firstItem?.querySelector('.origam-timeline-item__track') as HTMLElement | null
        const lastConnector = lastItem?.querySelector('.origam-timeline-item__connector') as HTMLElement | null
        return {
            rootClasses: el.className,
            rootFlexDirection: getComputedStyle(el).flexDirection,
            hasWrapper: !!wrapper,
            wrapperFlexDirection: wrapper ? getComputedStyle(wrapper).flexDirection : null,
            wrapperScrollSnap: wrapper ? getComputedStyle(wrapper).scrollSnapType : null,
            wrapperOverflowX: wrapper ? getComputedStyle(wrapper).overflowX : null,
            itemCount: items.length,
            firstItemClasses: firstItem?.className ?? null,
            firstItemFlexDirection: firstItem ? getComputedStyle(firstItem).flexDirection : null,
            firstItemSnapAlign: firstItem ? getComputedStyle(firstItem).scrollSnapAlign : null,
            firstTrackFlexDirection: firstTrack ? getComputedStyle(firstTrack).flexDirection : null,
            lastConnectorDisplay: lastConnector ? getComputedStyle(lastConnector).display : null,
        }
    })

    console.log(`\n=== orientation="horizontal" ===`)

    console.log(JSON.stringify(h, null, 2))
})
