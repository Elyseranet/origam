// Playground external driving (#1441) — a scene handed over by URL, measured
// in a REAL browser against the standalone host. This is the contract the MCP
// server codes against: `?scene=` / `?component=&props=&slot=`,
// `data-playground-ready`, `data-playground-error`, `data-playground-instance`.
//
// A/B: on the parent commit the host ignores the query string — no ready
// flag, no error flag, no instance attribute: every test below fails.

import { expect, test } from '@playwright/test'
import { encodeSceneParam, encodeTextParam } from '../../playground/src/utils/Commons/scene-param.util'
import { SCENE_VERSION } from '../../playground/src/consts/Commons/scene.const'

const ready = (page: import('@playwright/test').Page) => page.locator('html[data-playground-ready="true"]')
const errorCode = (page: import('@playwright/test').Page) => page.locator('html').getAttribute('data-playground-error')

const button = (id: string, props: Record<string, unknown>, slotContent?: string) => ({ id, componentName: 'OrigamBtn', props, slotContent })

const backgroundOf = (page: import('@playwright/test').Page) =>
    page.locator('[data-playground-instance]').first().evaluate(element => getComputedStyle(element).backgroundColor)

test.describe('playground — external scene (#1441)', () => {
    test('?scene= loads a multi-root scene and stamps every instance', async ({ page }) => {
        const scene = {
            version: SCENE_VERSION,
            roots: [button('first', { variant: 'flat' }, 'Premier'), button('second', { variant: 'outlined' }, 'Été 日本')],
            selectedInstanceId: null
        }

        await page.goto(`/?scene=${encodeSceneParam(scene)}`)
        await expect(ready(page)).toBeAttached()

        await expect(page.locator('[data-playground-instance="first"]')).toHaveText('Premier')
        await expect(page.locator('[data-playground-instance="second"]')).toHaveText('Été 日本')
        await expect(page.locator('[data-playground-instance]')).toHaveCount(2)
        expect(await errorCode(page)).toBeNull()
    })

    test('?component=&props= really changes the render', async ({ page }) => {
        const open = async (variant: string) => {
            await page.goto(`/?component=origam-btn&props=${encodeSceneParam({ variant })}&slot=${encodeTextParam('Go')}`)
            await expect(ready(page)).toBeAttached()

            return backgroundOf(page)
        }

        const flat = await open('flat')
        const outlined = await open('outlined')

        expect(flat).not.toBe(outlined)
        await expect(page.locator('[data-playground-instance]')).toHaveText('Go')
    })

    test('an unknown component shows a visible error and never flags ready', async ({ page }) => {
        await page.goto('/?component=origam-does-not-exist')

        await expect(page.locator('html[data-playground-error="unknown_component"]')).toBeAttached()
        await expect(page.locator('[data-cy="host-scene-error"]')).toBeVisible()
        await expect(page.locator('html[data-playground-ready]')).toHaveCount(0)
    })

    test('a corrupt ?scene= reports decode_failed', async ({ page }) => {
        await page.goto('/?scene=***not-base64***')

        await expect(page.locator('html[data-playground-error="decode_failed"]')).toBeAttached()
        await expect(page.locator('[data-cy="host-scene-error"]')).toBeVisible()
    })

    test('a scene from another version reports version_mismatch', async ({ page }) => {
        await page.goto(`/?scene=${encodeSceneParam({ version: 999, roots: [], selectedInstanceId: null })}`)

        await expect(page.locator('html[data-playground-error="version_mismatch"]')).toBeAttached()
    })
})
