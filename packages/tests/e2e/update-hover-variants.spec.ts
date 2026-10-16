// #1152 — the `Events - update:hover` Variants added alongside the
// `IHoverEmits` declaration on Btn, BreadcrumbItem, BracketMatch,
// BracketCompetitor and Sheet.
//
// What this spec can and cannot see, said up front:
//
//   - It CAN prove each Variant renders the component it advertises, and
//     that a real pointer enter / leave drives the hover state the emit is
//     written from. On the three components that bind `useStateFlag`'s
//     `classes` (BracketMatch, BracketCompetitor, Sheet), that state is
//     visible as the `--hover` modifier — asserted ON and then OFF.
//   - It CANNOT see the defect itself. The warning ("Component emitted event
//     'update:hover' but it is neither declared…") is a Vue DEV warning, and
//     this suite runs against the static Histoire build. `logEvent()` is an
//     Histoire-internal side-effect, not observable from the page either.
//     The verdict on the declaration lives in two places that do see it:
//       • TU/origam/relay-emits-declaration.spec.ts (`emitsOptions`,
//         warn spy, `$attrs`), red on the parent commit;
//       • e2e-playground/playground-console.spec.ts (Vite DEV server,
//         real console), red on the parent commit.
//
// Navigation is by Variant TITLE, never by index (cf. audit-variant-pins).

import { expect, test } from '@playwright/test'
import type { FrameLocator, Page } from '@playwright/test'

interface IHoverVariantCase {
    story: string
    selector: string
    hoverClass?: string
}

const CASES: Array<[string, IHoverVariantCase]> = [
    ['OrigamBtn', { story: 'components-stories-btn-origambtn-story-vue', selector: '[data-cy="btn-emit-update-hover"]' }],
    ['OrigamBreadcrumbItem', { story: 'components-stories-breadcrumb-origambreadcrumbitem-story-vue', selector: '[data-cy="breadcrumb-item-emit-update-hover"]' }],
    ['OrigamBracketMatch', { story: 'components-stories-bracket-origambracketmatch-story-vue', selector: '[data-cy="match-emit-update-hover"] .origam-bracket-match', hoverClass: 'origam-bracket-match--hover' }],
    ['OrigamBracketCompetitor', { story: 'components-stories-bracket-origambracketcompetitor-story-vue', selector: '[data-cy="competitor-emit-update-hover"] .origam-bracket-competitor', hoverClass: 'origam-bracket-competitor--hover' }],
    ['OrigamSheet', { story: 'components-stories-sheet-origamsheet-story-vue', selector: '[data-cy="sheet-emit-update-hover"]', hoverClass: 'origam-sheet--hover' }]
]

const VARIANT_TITLE = 'Events - update:hover'

async function gotoVariant (page: Page, story: string): Promise<FrameLocator> {
    await page.goto(`/stories/story/${story}`)
    await page.waitForLoadState('networkidle')
    await page.getByRole('link', { name: VARIANT_TITLE, exact: true }).click()

    return page.frameLocator('iframe[src*="__sandbox"]')
}

test.describe(`${VARIANT_TITLE} Variants (#1152)`, () => {
    for (const [name, { story, selector, hoverClass }] of CASES) {
        test(`${name}: the Variant renders the component and a real pointer drives its hover state`, async ({ page }) => {
            const sandbox = await gotoVariant(page, story)
            const target = sandbox.locator(selector).first()

            await expect(target).toBeVisible({ timeout: 30000 })

            await target.hover()
            if (hoverClass) await expect(target).toHaveClass(new RegExp(`\\b${hoverClass}\\b`))

            await page.mouse.move(0, 0)
            if (hoverClass) await expect(target).not.toHaveClass(new RegExp(`\\b${hoverClass}\\b`))
        })
    }
})
