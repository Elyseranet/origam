import { expect, test } from '@playwright/test'

/**
 * RECIPE — Pattern canonique origam / Histoire (réf. avatar.spec.ts)
 *
 * STORY_ID = 'components-stories-avatar-origamavatargroup-story-vue'
 *
 * Index → Titre (ordre dans le fichier story)
 *   0  → Design (max=4, 7 people → a "+N" `__rest` overflow chip is rendered)
 *
 * ⚠️  JAMAIS waitForLoadState('networkidle') : Histoire garde un websocket HMR
 * ouvert → networkidle ne résout JAMAIS → timeout garanti.
 *
 * Scope: the DS-level, theme-agnostic structural ring introduced for #263
 * (`--origam-avatar-group__item---outline-*`). The theme-specific
 * border-preservation regression (glass/cartoon/geek) is covered separately
 * in `home-showcase.spec.ts` (marketing e2e), since Histoire only ships the
 * neutral DS baseline theme.
 */

const STORY_ID   = 'components-stories-avatar-origamavatargroup-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamAvatarGroup — separation ring (#263)', () => {
    test.setTimeout(60000)

    test('every `__item` AND the `__rest` overflow chip carry the outline-based separation ring', async ({ page }) => {
        await page.goto(variantUrl(0))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        const items = sandbox.locator('.origam-avatar-group__item')
        await expect(items.first()).toBeVisible({ timeout: 20000 })
        const itemCount = await items.count()
        expect(itemCount).toBeGreaterThan(0)

        for (let i = 0; i < itemCount; i++) {
            const style = await items.nth(i).evaluate((el) => {
                const cs = getComputedStyle(el)
                return { outlineWidth: cs.outlineWidth, outlineStyle: cs.outlineStyle }
            })
            expect(style.outlineWidth, `item[${i}] outlineWidth`).toBe('2px')
            expect(style.outlineStyle, `item[${i}] outlineStyle`).toBe('solid')
        }

        const rest = sandbox.locator('.origam-avatar-group__rest')
        await expect(rest).toBeVisible()
        const restStyle = await rest.evaluate((el) => {
            const cs = getComputedStyle(el)
            return { outlineWidth: cs.outlineWidth, outlineStyle: cs.outlineStyle }
        })
        expect(restStyle.outlineWidth).toBe('2px')
        expect(restStyle.outlineStyle).toBe('solid')
    })
})
