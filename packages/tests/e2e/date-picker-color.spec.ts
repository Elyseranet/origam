import { expect, test } from '@playwright/test'

/**
 * `color` on OrigamDatePickerHeader / OrigamDatePickerMonth — #550, C1.
 *
 * Both props were declared (`IColorProps`) and exposed in their story, and
 * neither was read anywhere: they painted nothing. This spec is the ONLY
 * valid verdict on whether they paint now — `getComputedStyle` under jsdom
 * never resolves a `var()` reference and never sees an SFC's `<style
 * scoped>` at all (CLAUDE.md, #398), and every colour in this DS goes
 * through a token.
 *
 * The method is an A/B between two variants of the SAME story rather than a
 * DOM mutation: the "Design" variant seeds `color: 'primary'`, the
 * "Functional" one passes no colour at all. Comparing the two measures the
 * prop's effect without touching a class list Vue re-patches under us (the
 * `alert.spec.ts` trap documented in CLAUDE.md).
 */

const HEADER_STORY = '/stories/story/components-stories-datepicker-origamdatepickerheader-story-vue'
const MONTH_STORY = '/stories/story/components-stories-datepicker-origamdatepickermonth-story-vue'

async function openVariant (page: import('@playwright/test').Page, story: string, variant: string) {
    await page.goto(story)
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()

    return page.frameLocator('iframe[src*="__sandbox"]')
}

test.describe('OrigamDatePickerHeader — color', () => {
    test('color="primary" paints the header text, absence of the prop does not', async ({ page }) => {
        const design = await openVariant(page, HEADER_STORY, 'Design')
        const designContent = design.locator('.origam-date-picker-header__content').first()
        await expect(designContent).toBeVisible({ timeout: 15000 })

        const painted = await designContent.evaluate((el) => getComputedStyle(el).color)

        const functional = await openVariant(page, HEADER_STORY, 'Functional')
        const functionalContent = functional.locator('.origam-date-picker-header__content').first()
        await expect(functionalContent).toBeVisible({ timeout: 15000 })

        const unpainted = await functionalContent.evaluate((el) => getComputedStyle(el).color)

        // The whole point: the two must differ. Equal values would mean the
        // prop still paints nothing — the exact defect this fixes.
        expect(painted).not.toBe(unpainted)

        // And the painted value must be the intent's OWN hue (`fgSubtle`),
        // not the white-on-saturated `fg` the utility class resolves (#514).
        const expected = await design.locator('.origam-date-picker-header').first().evaluate((el) => {
            const probe = document.createElement('span')
            probe.style.color = 'var(--origam-color__action--primary---fgSubtle)'
            el.appendChild(probe)
            const value = getComputedStyle(probe).color
            probe.remove()

            return value
        })

        expect(painted).toBe(expected)
    })
})

test.describe('OrigamDatePickerMonth — color', () => {
    test('color="primary" repaints the weekday labels and the day buttons', async ({ page }) => {
        const design = await openVariant(page, MONTH_STORY, 'Design')
        const designRoot = design.locator('.origam-date-picker-month').first()
        await expect(designRoot).toBeVisible({ timeout: 15000 })

        const painted = await designRoot.evaluate((root) => {
            const weekday = root.querySelector('.origam-date-picker-month__weekday')
            const dayBtn = root.querySelector('.origam-date-picker-month__day-btn')

            const probe = document.createElement('span')
            probe.style.color = 'var(--origam-color__action--primary---fgSubtle)'
            root.appendChild(probe)
            const expected = getComputedStyle(probe).color
            probe.remove()

            return {
                weekday: weekday ? getComputedStyle(weekday).color : null,
                dayBtn: dayBtn ? getComputedStyle(dayBtn).color : null,
                expected
            }
        })

        const functional = await openVariant(page, MONTH_STORY, 'Functional')
        const functionalRoot = functional.locator('.origam-date-picker-month').first()
        await expect(functionalRoot).toBeVisible({ timeout: 15000 })

        const unpainted = await functionalRoot.evaluate((root) => {
            const weekday = root.querySelector('.origam-date-picker-month__weekday')
            const dayBtn = root.querySelector('.origam-date-picker-month__day-btn')

            return {
                weekday: weekday ? getComputedStyle(weekday).color : null,
                dayBtn: dayBtn ? getComputedStyle(dayBtn).color : null
            }
        })

        expect(painted.weekday).not.toBeNull()
        expect(painted.dayBtn).not.toBeNull()

        // The weekday row reads `--origam-date-picker__day---color`; the day
        // label is an `<origam-btn>` reading `--origam-btn---color`. The prop
        // feeds BOTH, otherwise half the grid would stay untouched.
        expect(painted.weekday).toBe(painted.expected)
        expect(painted.dayBtn).toBe(painted.expected)

        expect(painted.weekday).not.toBe(unpainted.weekday)
        expect(painted.dayBtn).not.toBe(unpainted.dayBtn)
    })
})
