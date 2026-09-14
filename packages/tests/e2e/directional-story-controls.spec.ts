import { expect, test, type Page } from '@playwright/test'
import { fillHstText, fillHstNumber, selectHstOption } from './_support/histoire-controls'

/**
 * Story-side counterpart to `TU/components/directional-props.per-component.spec.ts`.
 *
 * That unit spec proves the 13 components wired in 249ac7d1 CONSUME the 16
 * directional surface props. It says nothing about whether a user can reach
 * them: a prop can be perfectly consumed while the story exposes no control
 * for it, which is exactly the state those stories were left in — the axes
 * worked and nobody could see it.
 *
 * This spec closes that half. For each story it drives the newly added
 * control in the right-hand panel and asserts the SANDBOXED component's
 * computed style actually moved. A control that renders but changes nothing
 * fails here — which is the defect the wiring commit removed and the one a
 * story edit could silently reintroduce.
 *
 * Values are deliberately unusual lengths ('37px', '19px') so no theme
 * default or inherited token can coincidentally match them.
 *
 * NOT covered here, and why:
 *   - OrigamMediaScrubber has NO story anywhere in packages/stories, so its
 *     four rounded corners have no control to drive. Reported rather than
 *     faked.
 *   - `padding` / `margin` / `rounded` SHORTHANDS were already exposed and
 *     are already covered by each component's own spec — only the rungs
 *     added by this change are asserted.
 */

const SANDBOX = 'iframe[src*="__sandbox"]'
const TIMEOUT = 40000

const storyId = (slug: string) => `components-stories-${slug}-story-vue`
const variantUrl = (slug: string, idx: number) =>
    `/stories/story/${storyId(slug)}?variantId=${storyId(slug)}-${idx}`

/**
 * Navigate to a variant and wait for the component root to paint.
 *
 * `state` is 'visible' by default because an element that never paints is
 * usually the sign of a routing miss against a stale server. It drops to
 * 'attached' for roots that legitimately have no box of their own — see the
 * OrigamSliderFieldTrack case for the one instance.
 */
async function open (page: Page, slug: string, idx: number, rootSelector: string, state: 'visible' | 'attached' = 'visible') {
    await page.goto(variantUrl(slug, idx), { waitUntil: 'domcontentloaded' })
    const sandbox = page.frameLocator(SANDBOX)
    await sandbox.locator(rootSelector).first().waitFor({ state, timeout: TIMEOUT })

    return sandbox.locator(rootSelector).first()
}

/** Read one resolved CSS property off a sandboxed element. */
async function css (locator: ReturnType<Page['locator']>, prop: string): Promise<string> {
    return locator.evaluate(
        (el, p) => getComputedStyle(el as HTMLElement).getPropertyValue(p).trim(),
        prop
    )
}

interface ICase {
    /** Story slug as it appears in the generated story id. */
    slug: string
    /** Variant index carrying the control. */
    index: number
    /** Selector of the element that paints the axis, inside the sandbox. */
    root: string
    /** Control label in the panel → CSS property it must move. */
    checks: Array<{ label: string; cssProp: string; value: string }>
    /** Override the readiness state when the root has no box of its own. */
    waitState?: 'visible' | 'attached'
}

/**
 * One representative rung per axis per component. Asserting all 16 on all 12
 * stories would be ~190 navigations for no extra information: the rungs share
 * one code path per axis (`usePadding` / `useMargin` / `useRounded`), so a
 * second rung on the same axis re-tests the same branch. What differs
 * per-component — and is therefore what this table varies — is whether the
 * story BINDS the axis at all.
 */
const CASES: ICase[] = [
    {
        slug: 'card-origamcardheader',
        index: 0,
        root: '.origam-card-header',
        checks: [
            { label: 'Padding Top', cssProp: 'padding-top', value: '37px' },
            { label: 'Margin Left', cssProp: 'margin-left', value: '19px' },
            { label: 'Rounded Top Left', cssProp: 'border-top-left-radius', value: '23px' }
        ]
    },
    {
        slug: 'card-origamcardtext',
        index: 0,
        root: '.origam-card-text',
        // This story predates the shared "Rounded Top Left" wording and
        // labels its corners with a hyphen. Renaming them would be a
        // gratuitous churn of a control users already know — the spec
        // follows the story, not the other way round.
        checks: [
            { label: 'Rounded Bottom-Right', cssProp: 'border-bottom-right-radius', value: '23px' }
        ]
    },
    {
        // OrigamChart is a pure dispatcher: it renders no root of its own and
        // delegates to the family matching `type`. The Design variant pins
        // `type: 'line'`, which resolves to the cartesian family.
        slug: 'chart-origamchart',
        index: 0,
        root: '.origam-chart-cartesian',
        checks: [
            { label: 'Padding Top', cssProp: 'padding-top', value: '37px' },
            { label: 'Margin Left', cssProp: 'margin-left', value: '19px' },
            { label: 'Rounded Top Left', cssProp: 'border-top-left-radius', value: '23px' }
        ]
    },
    {
        slug: 'icon-origamclassicon',
        index: 0,
        root: '.origam-icon',
        checks: [
            { label: 'Padding Top', cssProp: 'padding-top', value: '37px' },
            { label: 'Margin Left', cssProp: 'margin-left', value: '19px' },
            { label: 'Rounded Top Left', cssProp: 'border-top-left-radius', value: '23px' }
        ]
    },
    {
        slug: 'icon-origamcomponenticon',
        index: 0,
        root: '.origam-icon',
        checks: [
            { label: 'Rounded Top Left', cssProp: 'border-top-left-radius', value: '23px' }
        ]
    },
    {
        slug: 'icon-origamligatureicon',
        index: 0,
        root: '.origam-icon',
        checks: [
            { label: 'Rounded Top Left', cssProp: 'border-top-left-radius', value: '23px' }
        ]
    },
    {
        slug: 'icon-origamsvgicon',
        index: 0,
        root: '.origam-icon',
        checks: [
            { label: 'Padding Top', cssProp: 'padding-top', value: '37px' },
            { label: 'Margin Left', cssProp: 'margin-left', value: '19px' },
            { label: 'Rounded Top Left', cssProp: 'border-top-left-radius', value: '23px' }
        ]
    },
    {
        slug: 'counter-origamcounter',
        index: 0,
        root: '.origam-counter',
        checks: [
            { label: 'Padding Top', cssProp: 'padding-top', value: '37px' },
            { label: 'Margin Left', cssProp: 'margin-left', value: '19px' },
            { label: 'Rounded Top Left', cssProp: 'border-top-left-radius', value: '23px' }
        ]
    },
    {
        slug: 'input-origaminput',
        index: 0,
        root: '.origam-input',
        checks: [
            { label: 'Padding Top', cssProp: 'padding-top', value: '37px' },
            { label: 'Margin Left', cssProp: 'margin-left', value: '19px' },
            { label: 'Rounded Top Left', cssProp: 'border-top-left-radius', value: '23px' }
        ]
    },
    {
        slug: 'pagination-origampagination',
        index: 0,
        root: '.origam-pagination',
        checks: [
            { label: 'Padding Top', cssProp: 'padding-top', value: '37px' },
            { label: 'Margin Left', cssProp: 'margin-left', value: '19px' }
        ]
    },
    {
        // The track root is `position: relative` with absolutely-positioned
        // children, so standalone it has no intrinsic box and Playwright
        // reports it hidden. That is structural, not a defect — the corner
        // radius still resolves on it, which is what this asserts.
        slug: 'sliderfield-origamsliderfieldtrack',
        index: 0,
        root: '.origam-slider-field-track',
        waitState: 'attached',
        checks: [
            { label: 'Rounded Top Left', cssProp: 'border-top-left-radius', value: '23px' }
        ]
    }
]

test.describe('Story controls for the directional surface props', () => {
    test.setTimeout(90000)

    for (const { slug, index, root, checks, waitState } of CASES) {
        test(`${slug} — new controls move the rendered surface`, async ({ page }) => {
            const el = await open(page, slug, index, root, waitState)

            for (const { label, cssProp, value } of checks) {
                const before = await css(el, cssProp)
                await fillHstText(page, label, value)
                await expect
                    .poll(() => css(el, cssProp), { timeout: 10000 })
                    .toBe(value)
                expect(before, `${label} was already ${value} — the check proves nothing`).not.toBe(value)
            }
        })
    }

    // OrigamBracket paints its surface onto the MATCH CARD via custom
    // properties, not onto its own root — see bracket-surface.util.ts. The
    // honest assertion is on the emitted custom property, mirroring what the
    // TU spec does. Border widths take NUMBERS (HstNumber): the bracket's
    // width grammar rejects free-form CSS strings, which is why the story
    // exposes a spinbutton rather than the shared BORDER_OPTIONS select.
    test('bracket-origambracket — corners and per-side widths reach the match-card vars', async ({ page }) => {
        const el = await open(page, 'bracket-origambracket', 0, '.origam-bracket')

        await fillHstText(page, 'Rounded Top Left', '23px')
        await expect
            .poll(() => css(el, '--origam-bracket-match---border-top-left-radius'), { timeout: 10000 })
            .toBe('23px')

        await fillHstNumber(page, 'Border Top', 7)
        await expect
            .poll(() => css(el, '--origam-bracket-match---border-top-width'), { timeout: 10000 })
            .toBe('7px')

        await selectHstOption(page, 'Border Left Color', 'Primary')
        await expect
            .poll(() => css(el, '--origam-bracket-match---border-left-color'), { timeout: 10000 })
            .not.toBe('')
    })
})
