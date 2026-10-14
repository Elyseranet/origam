import { expect, test } from '@playwright/test'

/*********************************************************
 * Lot 2a (#1080) - a control mid-action keeps its content
 *
 * @description
 * Each story carries a FIXED `Loading` Variant (#1076 point 6). Variant
 * indices are the position of `<Variant title="Loading">` in the story file:
 * Btn 4, Switch 3, Field 3, TextField 3, Select 2, TextareaField 7.
 *
 * @description
 * Real browser, because jsdom never resolves `var()` nor computes an
 * accessible name. A/B: run against the parent commit, the Btn assertions
 * on `aria-disabled`, the click guard and the duplicated class fail.
 ********************************************************/

const url = (story: string, idx: number) => `/stories/story/${story}?variantId=${story}-${idx}`

const BTN = 'components-stories-btn-origambtn-story-vue'
const SWITCH = 'components-stories-switch-origamswitch-story-vue'
const FIELD = 'components-stories-field-origamfield-story-vue'
const TEXTFIELD = 'components-stories-textfield-origamtextfield-story-vue'
const SELECT = 'components-stories-select-origamselect-story-vue'
const TEXTAREA = 'components-stories-textareafield-origamtextareafield-story-vue'

test.describe('OrigamBtn - action in flight', () => {
    test('keeps its accessible name, busy + aria-disabled, focus, a single --loading class', async ({ page }) => {
        await page.goto(url(BTN, 4), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const btn = sandbox.locator('[data-cy="btn-loading-circular-override"]')
        await expect(btn).toBeVisible({ timeout: 12000 })

        // Accessible name = the label, nothing else (no "Loading...").
        await expect(btn).toMatchAriaSnapshot('- button "Circular"')

        await expect(btn).toHaveAttribute('aria-busy', 'true')
        await expect(btn).toHaveAttribute('aria-disabled', 'true')
        expect(await btn.getAttribute('disabled')).toBeNull()

        const shape = await btn.evaluate((el) => ({
            loadingClassCount: (el.getAttribute('class') ?? '').split(/\s+/).filter((c) => c === 'origam-btn--loading').length,
            hasDiv: !!el.querySelector('div'),
            skeleton: !!el.querySelector('.origam-skeleton')
        }))
        expect(shape).toEqual({ loadingClassCount: 1, hasDiv: false, skeleton: false })

        // Not `disabled`: the button can take focus and keeps it.
        await btn.focus()
        expect(await btn.evaluate((el) => el === el.ownerDocument.activeElement)).toBe(true)
    })

    test('width is stable: loading does not move the button width', async ({ page }) => {
        await page.goto(url(BTN, 4), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const btn = sandbox.locator('[data-cy="btn-loading-circular-override"]')
        await expect(btn).toBeVisible({ timeout: 12000 })

        // One evaluate: measure the busy button, then an IDLE clone of it (no
        // loader classes, no spinner node) in the same parent.
        const widths = await btn.evaluate((el) => {
            const loading = el.getBoundingClientRect().width
            const clone = el.cloneNode(true) as HTMLElement
            clone.classList.remove('origam-btn--loading', 'origam-btn--loader-circular')
            clone.querySelector('.origam-btn__progress')?.remove()
            el.parentElement!.appendChild(clone)
            const idle = clone.getBoundingClientRect().width
            clone.remove()

            return { loading, idle }
        })
        expect(widths.loading).toBeCloseTo(widths.idle, 0)
    })

    test('Enter on a busy button does not reach a consumer click handler', async ({ page }) => {
        await page.goto(url(BTN, 4), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const btn = sandbox.locator('[data-cy="btn-loading-circular-override"]')
        await expect(btn).toBeVisible({ timeout: 12000 })

        const clicks = await btn.evaluate((el) => {
            let n = 0
            el.addEventListener('click', () => { n++ })
            el.focus()
            ;(el as HTMLElement).click()

            return n
        })
        expect(clicks).toBe(0)
    })
})

test.describe('Switch / Field / TextField / Select / TextareaField - save in flight', () => {
    test('OrigamSwitch keeps its checkbox, checked state and label', async ({ page }) => {
        await page.goto(url(SWITCH, 3), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const sw = sandbox.locator('[data-cy="switch-loading-circular"]')
        await expect(sw).toBeVisible({ timeout: 12000 })
        await expect(sw.locator('input[type="checkbox"]')).toBeChecked()
        await expect(sw).toContainText('Saving switch')
        await expect(sw.locator('.origam-switch__skeleton')).toHaveCount(0)
    })

    for (const [name, story, idx, cy] of [
        ['OrigamField', FIELD, 3, 'field-loading-line'],
        ['OrigamTextField', TEXTFIELD, 3, 'textfield-loading-line'],
        ['OrigamSelect', SELECT, 2, 'select-loading-line'],
        ['OrigamTextareaField', TEXTAREA, 7, 'textarea-loading-line']
    ] as const) {
        test(`${name} keeps its input and label mounted`, async ({ page }) => {
            await page.goto(url(story, idx), { waitUntil: 'domcontentloaded' })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const root = sandbox.locator(`[data-cy="${cy}"]`)
            await expect(root).toBeVisible({ timeout: 12000 })
            await expect(root.locator('input, textarea').first()).toBeAttached()
            await expect(root.locator('.origam-field__loader')).toBeAttached()
            await expect(root.locator('.origam-field__skeleton, .origam-skeleton')).toHaveCount(0)
            await expect(root).toContainText('Saving')
        })
    }
})
