import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/*
 * #1382 — menu ouvert d'OrigamDatePickerField : aria-required-attr (combobox)
 * et aria-required-children (role="menu" sans menuitem). Mesure en navigateur
 * reel, menu ouvert, contre le Histoire statique.
 */
const STORY = 'components-stories-datepickerfield-origamdatepickerfield-story-vue'
const RULES = ['aria-required-attr', 'aria-required-children', 'aria-valid-attr-value', 'aria-allowed-attr', 'aria-dialog-name']

test.describe('OrigamDatePickerField — ARIA du menu ouvert (#1382)', () => {
    test.describe.configure({ timeout: 120_000 })

    test('menu ouvert : combobox <-> dialog, 0 violation ARIA, clavier conserve', async ({ page }) => {
        await page.goto(`/stories/story/${STORY}?variantId=${STORY}-0`, { waitUntil: 'domcontentloaded' })
        const frame = page.frameLocator('iframe').first()
        const input = frame.locator('.origam-date-picker-field input').first()
        await input.waitFor({ state: 'visible', timeout: 60_000 })
        await page.waitForTimeout(1_000)

        await input.click()
        const content = frame.locator('.origam-date-picker-field__content')
        await expect(content).toBeVisible()
        await expect(content).toHaveCSS('opacity', '1')

        const results = await new AxeBuilder({ page }).withRules(RULES).analyze()
        const mine = results.violations.filter((v) => v.nodes.some((n) => n.target.some((t) => String(t).includes('origam') )))
        console.log('[axe]', JSON.stringify(mine.map((v) => ({ id: v.id, impact: v.impact, targets: v.nodes.map((n) => n.target) }))))
        expect(mine.filter((v) => v.impact === 'serious' || v.impact === 'critical')).toEqual([])

        await expect(input).toHaveAttribute('role', 'combobox')
        await expect(input).toHaveAttribute('aria-expanded', 'true')
        const controls = await input.getAttribute('aria-controls')
        expect(controls, 'aria-controls manquant').toBeTruthy()
        const target = frame.locator(`[id="${controls}"]`)
        await expect(target).toHaveAttribute('role', 'dialog')

        await page.keyboard.press('Escape')
        await expect(content).toBeHidden()
        await expect(input).toHaveAttribute('aria-expanded', 'false')
    })
})
