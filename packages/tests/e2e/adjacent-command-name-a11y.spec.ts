import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * `aria-command-name` / `button-name` sweep on the ADJACENT zones — #747 / #653 / #660
 *
 * ## What this measures, and why it did not already exist
 *
 * `a11y/components.spec.ts` scans the **Default Variant** of 30 components
 * and only fails on `critical`. Neither condition catches this family:
 *
 * - the defect needs a `@click:prepend` / `@click:append` listener actually
 *   attached, which a Default Variant does not do — the `role="button"` is
 *   never emitted there, so the sweep scans an inert `<div>`;
 * - `aria-command-name` is `serious`, not `critical`, so even when it fires
 *   it does not fail that suite.
 *
 * Every variant listed in `TARGETS` below is an `Events - click:*` Variant,
 * i.e. the exact DOM shape a consumer gets the moment they use the public
 * `click:prepend` / `click:append` event API.
 *
 * ## Positive control (mandatory)
 *
 * An axe run that scans nothing and a conformant component are
 * indistinguishable from their (empty) violation list. `positive control`
 * below injects a KNOWN-BAD node into the same sandbox document, through the
 * same `runAxe()` helper, and asserts `aria-command-name` fires on it. If
 * that test goes green-by-silence the whole file is worthless, and it says so.
 *
 * ## Scoping
 *
 * axe scans the whole page, Histoire chrome included. Violations are kept
 * only when at least one node targets `origam-`-prefixed DOM, mirroring
 * `a11y/components.spec.ts`. Histoire's sandbox iframe is traversed by axe
 * automatically.
 */

const STORY_BASE = '/stories/story'

interface ITarget {
    /** Component name as reported in the per-component count. */
    name: string
    story: string
    /** Variant indices — positional, read from the built `histoire.json`. */
    variants: number[]
}

/**
 * `Events - click:prepend` / `click:append` Variants, by component.
 *
 * ⛔ `Select` is deliberately absent — another work stream owns
 * `OrigamSelect` / `OrigamMenu` and this branch must not touch it.
 */
const TARGETS: ITarget[] = [
    { name: 'Badge', story: 'components-stories-badge-origambadge-story-vue', variants: [16, 17] },
    { name: 'BreadcrumbItem', story: 'components-stories-breadcrumb-origambreadcrumbitem-story-vue', variants: [3, 4] },
    { name: 'Card', story: 'components-stories-card-origamcard-story-vue', variants: [3, 4] },
    { name: 'CardHeader', story: 'components-stories-card-origamcardheader-story-vue', variants: [2, 3] },
    { name: 'Chip', story: 'components-stories-chip-origamchip-story-vue', variants: [4, 5] },
    { name: 'ConfirmWrapper', story: 'components-stories-confirmwrapper-origamconfirmwrapper-story-vue', variants: [11, 12] },
    { name: 'DataText', story: 'components-stories-datalist-origamdatatext-story-vue', variants: [2, 3] },
    { name: 'DataTitle', story: 'components-stories-datalist-origamdatatitle-story-vue', variants: [2, 3] },
    { name: 'DataTableHeadersCellMobile', story: 'components-stories-datatable-origamdatatableheaderscellmobile-story-vue', variants: [2, 3] },
    { name: 'DatePickerField', story: 'components-stories-datepickerfield-origamdatepickerfield-story-vue', variants: [6, 7, 8, 9] },
    { name: 'ExpansionPanelHeader', story: 'components-stories-expansionpanel-origamexpansionpanelheader-story-vue', variants: [3, 4] },
    { name: 'Field', story: 'components-stories-field-origamfield-story-vue', variants: [6, 7] },
    { name: 'Input', story: 'components-stories-input-origaminput-story-vue', variants: [3, 4, 16] },
    { name: 'ListItem', story: 'components-stories-list-origamlistitem-story-vue', variants: [4, 5] },
    { name: 'NumberField', story: 'components-stories-numberfield-origamnumberfield-story-vue', variants: [7, 8] },
    { name: 'OtpInputField', story: 'components-stories-otpinputfield-origamotpinputfield-story-vue', variants: [6, 7] },
    { name: 'TextField', story: 'components-stories-textfield-origamtextfield-story-vue', variants: [9, 10, 11, 12] }
]

/** Rules owned by the Histoire shell, not by any component under test. */
const IGNORED_RULES = new Set<string>([
    'frame-title',
    'region',
    'page-has-heading-one',
    'landmark-one-main',
    'document-title',
    'html-has-lang',
    'html-lang-valid',
    'aria-tooltip-name'
])

/** The two rules this family produces. Everything else is out of scope here. */
const NAME_RULES = new Set<string>(['aria-command-name', 'button-name', 'link-name'])

const variantUrl = (story: string, idx: number) => `${STORY_BASE}/${story}?variantId=${story}-${idx}`

interface IViolation {
    id: string
    impact: string
    nodes: number
}

async function runAxe (page: Page): Promise<IViolation[]> {
    const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

    return results.violations
        .filter((v) => !IGNORED_RULES.has(v.id))
        .map((v) => ({
            id: v.id,
            impact: String(v.impact),
            // Count only nodes that belong to component DOM — Histoire's own
            // sidebar / toolbar markup is not what this file is measuring.
            nodes: v.nodes.filter((n) => n.target.some((t) => String(t).includes('origam-'))).length
        }))
        .filter((v) => v.nodes > 0)
}

async function gotoVariant (page: Page, story: string, idx: number) {
    await page.goto(variantUrl(story, idx), { waitUntil: 'domcontentloaded' })
    await page.locator('iframe[id="host"], iframe').first().waitFor({ state: 'attached', timeout: 60_000 })
    // The sandbox mounts asynchronously; axe on a half-mounted tree is the
    // documented false-negative trap in this repo's CLAUDE.md.
    await page.waitForTimeout(1_500)
}

test.describe('adjacent zones — accessible name (#747 / #653 / #660)', () => {
    test.describe.configure({ timeout: 180_000 })

    test('positive control — axe reports aria-command-name on a known-bad node', async ({ page }) => {
        await gotoVariant(page, TARGETS[3].story, TARGETS[3].variants[0])

        const frame = page.frameLocator('iframe').first()
        await frame.locator('body').evaluate((body) => {
            const probe = document.createElement('div')
            probe.setAttribute('role', 'button')
            probe.setAttribute('tabindex', '0')
            probe.className = 'origam-a11y-positive-control'
            body.appendChild(probe)
        })

        const violations = await runAxe(page)
        const hit = violations.find((v) => v.id === 'aria-command-name')

         
        console.log('[positive-control]', JSON.stringify(violations))

        expect(hit, 'axe must report aria-command-name on the injected probe — otherwise this harness is blind and every other assertion in this file is meaningless').toBeTruthy()
        expect(hit!.impact).toBe('serious')
    })

    for (const target of TARGETS) {
        test(`${target.name} — no unnamed ARIA command in the adjacent zones`, async ({ page }) => {
            const found: Array<{ variant: number, id: string, impact: string, nodes: number }> = []

            for (const idx of target.variants) {
                await gotoVariant(page, target.story, idx)
                const violations = await runAxe(page)
                for (const v of violations) {
                    if (NAME_RULES.has(v.id)) found.push({ variant: idx, ...v })
                }
            }

             
            console.log(`[axe] ${target.name}: ${JSON.stringify(found)}`)

            expect(found, `${target.name}: ${found.length} accessible-name violation(s) across variants ${target.variants.join(', ')}`).toEqual([])
        })
    }

    /*
     * ⛔ Counter-test — without this, the suite above is satisfiable by a DS
     * that simply stopped emitting `role="button"` altogether, which would
     * trade a `serious` 4.1.2 failure for a silently unusable feature.
     *
     * The `Events - click:prepend` Variants now pass `prepend-aria-label`,
     * which is the SUPPORTED path: the zone must come back as a real,
     * reachable, NAMED control. Measured in the browser, not in jsdom.
     */
    test('counter-test — a LABELLED zone is a real named button in the browser', async ({ page }) => {
        await gotoVariant(page, 'components-stories-card-origamcardheader-story-vue', 3)

        const zone = page.frameLocator('iframe').first().locator('.origam-card-header__prepend')

        await expect(zone).toHaveAttribute('role', 'button')
        await expect(zone).toHaveAttribute('tabindex', '0')
        await expect(zone).toHaveAttribute('aria-label', 'Open details')
    })
})
