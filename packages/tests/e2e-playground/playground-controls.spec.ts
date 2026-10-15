// Playground lot B (#1142) — editable inspector controls + emits log,
// measured in a REAL browser against the standalone host
// (`pnpm -F @origam/playground dev`, see `playwright.playground.config.ts`).
//
// What this pins, and why each assertion reads the RENDERED component rather
// than the inspector:
//
//   1. Changing `variant` of OrigamBtn through its SELECT changes what the
//      button renders — the variant class AND a computed style the class
//      drives (`background-color`, `border-top-width`). A control that only
//      updated its own field would pass a "the select shows outlined" check
//      while the component never received the prop.
//   2. Reset removes the prop: the class goes away and the computed style
//      returns to the value measured BEFORE any edit — the default rendering,
//      not a copy of a default written into the scene.
//   3. The ambiguous `['Boolean','Number','String']` prop (`padding`) renders
//      a TEXT field, never a checkbox (PR #1048).
//   4. An emit of the rendered instance lands in the events panel.
//
// A/B: run against the parent commit (no controls in the inspector), every
// test here fails at its first locator — see the PR body for the measured run.

import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const openComponent = async (page: Page, name: string) => {
    await page.goto('/')
    await page.locator('[data-cy="playground-catalog-open"]').click()
    await page.locator(`[data-cy="playground-drawer-item-${name}"]`).click()
    await expect(page.locator('[data-cy="playground-preview-instance"]')).toBeVisible()
}

const chooseOption = async (page: Page, field: Locator, label: string) => {
    await field.click()
    await page.getByRole('option', { name: label, exact: true }).click()
}

const renderedStyle = (instance: Locator) => instance.evaluate(el => {
    const style = getComputedStyle(el)

    return { backgroundColor: style.backgroundColor, borderTopWidth: style.borderTopWidth }
})

test.describe('playground — editable controls (#1142)', () => {
    test('OrigamBtn: setting variant changes the render, reset restores the default render', async ({ page }) => {
        await openComponent(page, 'OrigamBtn')

        const instance = page.locator('[data-cy="playground-preview-instance"]')
        const control = page.locator('[data-cy="playground-control-variant"]')
        const state = page.locator('[data-cy="playground-control-state-variant"]')

        await expect(instance).not.toHaveClass(/origam-btn--variant-/)
        await expect(control).toHaveAttribute('data-set', 'false')
        const before = await renderedStyle(instance)

        await chooseOption(page, page.locator('[data-cy="playground-control-input-variant"]'), 'outlined')

        await expect(instance).toHaveClass(/origam-btn--variant-outlined/)
        await expect(control).toHaveAttribute('data-set', 'true')
        await expect(state).not.toHaveText(/default/)
        await expect.poll(() => renderedStyle(instance)).not.toEqual(before)
        const outlined = await renderedStyle(instance)
        expect(outlined.borderTopWidth).not.toBe(before.borderTopWidth)

        await page.locator('[data-cy="playground-control-reset-variant"]').click()

        await expect(instance).not.toHaveClass(/origam-btn--variant-/)
        await expect(control).toHaveAttribute('data-set', 'false')
        await expect(state).toHaveText(/default/)
        await expect.poll(() => renderedStyle(instance)).toEqual(before)
    })

    test('OrigamBtn: the variant select offers exactly the 7 members of the resolved union', async ({ page }) => {
        await openComponent(page, 'OrigamBtn')

        await page.locator('[data-cy="playground-control-input-variant"]').click()
        const options = page.getByRole('option')

        await expect(options).toHaveText(['text', 'flat', 'elevated', 'tonal', 'outlined', 'plain', 'ghost'])
    })

    test('OrigamBtn: an ambiguous [Boolean,Number,String] prop is a text field, never a checkbox', async ({ page }) => {
        await openComponent(page, 'OrigamBtn')

        const control = page.locator('[data-cy="playground-control-padding"]')

        await expect(control.locator('input[type="checkbox"]')).toHaveCount(0)
        await expect(control.locator('[data-cy="playground-control-input-padding"] input')).toBeVisible()
        await expect(page.locator('[data-cy="playground-control-coercion-padding"]')).toBeVisible()
    })

    test('OrigamBtn: padding written as NUMBER reaches the component as 40px, reset restores it', async ({ page }) => {
        await openComponent(page, 'OrigamBtn')

        const instance = page.locator('[data-cy="playground-preview-instance"]')
        const before = await instance.evaluate(el => getComputedStyle(el).paddingLeft)

        await page.locator('[data-cy="playground-control-input-padding"] input').fill('40')
        await chooseOption(page, page.locator('[data-cy="playground-control-coercion-padding"]'), 'number')

        await expect(instance).toHaveCSS('padding-left', '40px')

        await page.locator('[data-cy="playground-control-reset-padding"]').click()

        await expect(instance).toHaveCSS('padding-left', before)
        await expect(page.locator('[data-cy="playground-control-input-padding"] input')).toHaveValue('')
    })

    test('OrigamSwitch: an emit of the rendered instance lands in the events panel', async ({ page }) => {
        await openComponent(page, 'OrigamSwitch')

        await page.locator('[data-cy="playground-dock-handle"]').click()
        await expect(page.locator('[data-cy="playground-event-log-empty"]')).toBeVisible()

        await page.locator('[data-cy="playground-preview-instance"] input').first().click({ force: true })

        const entry = page.locator('[data-cy="playground-event-update:modelValue"]').first()
        await expect(entry).toBeVisible()
        await expect(entry).toContainText('true')

        await page.locator('[data-cy="playground-event-log-clear"]').click()
        await expect(page.locator('[data-cy="playground-event-log-empty"]')).toBeVisible()
    })
})
