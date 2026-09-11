import { expect, test } from '@playwright/test'

/**
 * RECIPE — Pattern canonique origam / Histoire (réf. btn.spec.ts)
 *
 * Navigation directe avec variantId query param (index 0-based).
 * STORY_ID = 'components-stories-avatar-origamavatar-story-vue'
 *
 * Index → Titre (ordre dans le fichier story)
 *   0  → Design         (bgColor + color + size + density + shape + border + spacing)
 *   1  → State          (hover / active surface)
 *   2  → Functional     (tag prop)
 *   3  → Events - update:active
 *   4  → Events - update:hover
 *   5  → Slots - Default
 *   6  → Slots - Avatar
 *   7  → Slots - Icon
 *   8  → Slots - Text
 *   9  → Default (playground)
 *
 * ⚠️  JAMAIS waitForLoadState('networkidle') : Histoire garde un websocket HMR
 * ouvert → networkidle ne résout JAMAIS → timeout garanti.
 * ⚠️  Pas de data-cy dans les stories canoniques Avatar → .origam-avatar BEM.
 * ⚠️  Chaque test a sa propre page Playwright. Pour éviter les problèmes de
 * timing liés au chargement d'Histoire (image externe pravatar.cc, init cold),
 * on regroupe toutes les assertions d'une variante dans un seul test avec
 * une seule navigation. C'est le pattern le plus robuste pour ce projet.
 */

const STORY_ID   = 'components-stories-avatar-origamavatar-story-vue'
// Histoire is configured with base: '/stories/' in histoire.config.js → vite.base.
// In dev mode the base is also active, so the correct path prefix is /stories/story/.
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

test.describe('OrigamAvatar', () => {
    test.setTimeout(60000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // init: { bgColor: 'primary', color: 'white' }                        //
    // Renders three avatars: text / image / icon                          //
    // ------------------------------------------------------------------ //

    test('Design — BEM class, bgColor token, size, text content, three avatars', async ({ page }) => {
        await page.goto(variantUrl(0))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const firstAvatar = sandbox.locator('.origam-avatar').first()

        // Wait for the root element (timeout covers Histoire cold-start + image fetch)
        await expect(firstAvatar).toBeVisible({ timeout: 20000 })

        // BEM root class
        await expect(firstAvatar).toHaveClass(/origam-avatar/)

        // bgColor=primary utility class
        await expect(firstAvatar).toHaveClass(/origam--bg-primary/)

        // bgColor=primary token produces a non-transparent, non-gray background
        const bg = await firstAvatar.evaluate(el => getComputedStyle(el).backgroundColor)
        expect(bg).not.toBe('rgba(0, 0, 0, 0)')
        expect(bg).not.toBe('transparent')
        expect(bg).not.toBe('rgb(230, 230, 230)')

        // size-default
        await expect(firstAvatar).toHaveClass(/origam-avatar--size-default/)

        // size-default CSS: 40×40px
        const dims = await firstAvatar.evaluate(el => ({
            w: getComputedStyle(el).width,
            h: getComputedStyle(el).height
        }))
        expect(dims.w).toBe('40px')
        expect(dims.h).toBe('40px')

        // Text avatar (first) renders "AP"
        await expect(firstAvatar.locator('.origam-avatar__text')).toContainText('AP')

        // Three avatars rendered (text / image / icon)
        const count = await sandbox.locator('.origam-avatar').count()
        expect(count).toBe(3)

        // SCSS --rounded injects a non-zero border-radius
        const radius = await firstAvatar.evaluate(el => {
            el.classList.add('origam-avatar--rounded')
            return getComputedStyle(el).borderRadius
        })
        expect(radius).not.toBe('0px')
    })

    // ------------------------------------------------------------------ //
    // STATE (index 1)                                                      //
    // init: { bgColor: 'primary' }                                        //
    // ------------------------------------------------------------------ //

    test('State — resting: bgColor token, non-transparent bg, wrapper present', async ({ page }) => {
        await page.goto(variantUrl(1))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const avatar = sandbox.locator('.origam-avatar').first()
        await expect(avatar).toBeVisible({ timeout: 20000 })

        // bgColor=primary utility class
        await expect(avatar).toHaveClass(/origam--bg-primary/)

        // Non-transparent background
        const bg = await avatar.evaluate(el => getComputedStyle(el).backgroundColor)
        expect(bg).not.toBe('rgba(0, 0, 0, 0)')
        expect(bg).not.toBe('transparent')

        // Wrapper child present
        await expect(avatar.locator('.origam-avatar__wrapper')).toBeVisible()
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 2)                                                 //
    // init: { tag: 'div' }                                                 //
    // ------------------------------------------------------------------ //

    test('Functional — tag=div as root, text "AP" rendered', async ({ page }) => {
        await page.goto(variantUrl(2))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const avatar = sandbox.locator('.origam-avatar').first()
        await expect(avatar).toBeVisible({ timeout: 20000 })

        // tag=div renders a <div> as root
        const tag = await avatar.evaluate(el => el.tagName.toLowerCase())
        expect(tag).toBe('div')

        // text "AP" via the text prop
        await expect(avatar.locator('.origam-avatar__text')).toContainText('AP')
    })

    // ------------------------------------------------------------------ //
    // EVENTS - update:active (index 3)                                    //
    // ------------------------------------------------------------------ //

    test('Events - update:active — button-tagged, clickable without error', async ({ page }) => {
        await page.goto(variantUrl(3))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const avatar = sandbox.locator('.origam-avatar').first()
        await expect(avatar).toBeVisible({ timeout: 20000 })

        // tag="button" in this variant
        const tag = await avatar.evaluate(el => el.tagName.toLowerCase())
        expect(tag).toBe('button')

        // NOTE: update:active is fired by Histoire's logEvent — not assertable from
        // the outer page. We verify only that clicking does not throw.
        await avatar.click()
        await avatar.click()
    })

    // ------------------------------------------------------------------ //
    // EVENTS - update:hover (index 4)                                     //
    // ------------------------------------------------------------------ //

    test('Events - update:hover — button-tagged, hoverable without error', async ({ page }) => {
        await page.goto(variantUrl(4))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const avatar = sandbox.locator('.origam-avatar').first()
        await expect(avatar).toBeVisible({ timeout: 20000 })

        // tag="button" in this variant
        const tag = await avatar.evaluate(el => el.tagName.toLowerCase())
        expect(tag).toBe('button')

        // NOTE: update:hover fired via mouseenter/mouseleave — not assertable from outer page.
        await avatar.hover()
    })

    // ------------------------------------------------------------------ //
    // SLOTS - Default (index 5)                                            //
    // ------------------------------------------------------------------ //

    test('Slots - Default — custom content renders inside wrapper', async ({ page }) => {
        await page.goto(variantUrl(5))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const avatar = sandbox.locator('.origam-avatar').first()
        await expect(avatar).toBeVisible({ timeout: 20000 })

        // Story injects <span>Custom slot content</span> as the default slot.
        await expect(avatar).toContainText('Custom slot content')

        // Wrapper still present even when the default slot is overridden
        await expect(avatar.locator('.origam-avatar__wrapper')).toBeVisible()
    })

    // ------------------------------------------------------------------ //
    // SLOTS - Avatar (index 6)                                             //
    // ------------------------------------------------------------------ //

    test('Slots - Avatar — avatar renders with bg-color=primary, token resolves', async ({ page }) => {
        await page.goto(variantUrl(6))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const avatar = sandbox.locator('.origam-avatar').first()
        await expect(avatar).toBeVisible({ timeout: 20000 })

        // Story passes text="AP" (no image prop) so hasImage=false;
        // the #avatar named-slot is never entered in this case.
        // The avatar still renders correctly via the text fallback.
        await expect(avatar).toHaveClass(/origam--bg-primary/)

        // Background token resolves (non-transparent)
        const bg = await avatar.evaluate(el => getComputedStyle(el).backgroundColor)
        expect(bg).not.toBe('rgba(0, 0, 0, 0)')
    })

    // ------------------------------------------------------------------ //
    // SLOTS - Icon (index 7)                                               //
    // ------------------------------------------------------------------ //

    test('Slots - Icon — __icon wrapper and origam-icon element present', async ({ page }) => {
        await page.goto(variantUrl(7))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const avatar = sandbox.locator('.origam-avatar').first()
        await expect(avatar).toBeVisible({ timeout: 20000 })

        // Story passes :icon="accountIcon" so hasIcon=true,
        // then overrides #icon with <origam-icon :icon="heartIcon"/>.
        await expect(avatar.locator('.origam-avatar__icon')).toBeVisible()
        await expect(avatar.locator('.origam-icon')).toBeVisible()
    })

    // ------------------------------------------------------------------ //
    // SLOTS - Text (index 8)                                               //
    // ------------------------------------------------------------------ //

    test('Slots - Text — custom label "Custom" with italic font-style', async ({ page }) => {
        await page.goto(variantUrl(8))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const avatar = sandbox.locator('.origam-avatar').first()
        await expect(avatar).toBeVisible({ timeout: 20000 })

        // Story overrides #text with <span style="font-style: italic;">Custom</span>
        await expect(avatar.locator('.origam-avatar__text')).toContainText('Custom')

        const fontStyle = await avatar.locator('.origam-avatar__text span').evaluate(
            el => getComputedStyle(el).fontStyle
        )
        expect(fontStyle).toBe('italic')
    })

    // ------------------------------------------------------------------ //
    // DEFAULT / PLAYGROUND (index 9)                                      //
    // init: { text: 'AP', bgColor: 'primary' }                           //
    // ------------------------------------------------------------------ //

    test('Default (playground) — text "AP", bgColor primary, hover wired', async ({ page }) => {
        await page.goto(variantUrl(9))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const avatar = sandbox.locator('.origam-avatar').first()
        await expect(avatar).toBeVisible({ timeout: 20000 })

        // Text "AP"
        await expect(avatar.locator('.origam-avatar__text')).toContainText('AP')

        // bgColor=primary
        await expect(avatar).toHaveClass(/origam--bg-primary/)

        // Both emits wired without throwing
        await avatar.hover()
    })
})
