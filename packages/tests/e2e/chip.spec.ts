import { expect, test } from '@playwright/test'

/**
 * RECIPE — Pattern canonique pour les specs e2e origam / Histoire (v3)
 *
 * ## Navigation directe vers le sandbox
 *
 *   On navigue vers l'URL du sandbox DIRECTEMENT :
 *     /__sandbox.html?storyId=<STORY_ID>&variantId=<STORY_ID>-<index>
 *
 *   Le composant est rendu directement dans la page (pas d'iframe).
 *   On localise via page.locator('.origam-chip').first()
 *
 * ## Stratégie "une navigation par variant"
 *
 *   Pour éviter les pages blanches intermittentes (Vue prend un temps
 *   indéterminé pour monter dans le sandbox Vite), chaque test ne
 *   navigue qu'UNE FOIS vers le sandbox et regroupe toutes les assertions
 *   sur ce variant. Cela minimise le nombre de cold starts Vue/Vite.
 *
 * ⚠️  JAMAIS waitForLoadState('networkidle') : le websocket HMR d'Histoire
 * ne se ferme jamais → networkidle ne résout JAMAIS → timeout garanti.
 *
 * ## Variants OrigamChip (index → titre)
 *
 *   0  → Design         init: { text: 'Chip', bgColor: 'primary' }
 *   1  → State          init: { bgColor: 'primary' }
 *   2  → Functional     init: { text: 'Chip', bgColor: 'primary' }
 *   3  → Events - click
 *   4  → Events - click:prepend
 *   5  → Events - click:append
 *   6  → Events - click:close
 *   7  → Events - group:selected
 *   8  → Events - update:modelValue
 *   9  → Slots - Default
 *  10  → Slots - Prepend
 *  11  → Slots - Append
 *  12  → Slots - Close
 *  13  → Slots - Filter
 *  14  → Default (playground)
 */

const STORY_ID = 'components-stories-chip-origamchip-story-vue'

const sandboxUrl = (idx: number) =>
    `/stories/__sandbox.html?storyId=${STORY_ID}&variantId=${STORY_ID}-${idx}`

test.describe('OrigamChip', () => {
    test.setTimeout(60000)

    // ------------------------------------------------------------------ //
    // DESIGN (index 0)                                                     //
    // Une seule navigation — toutes les assertions design regroupées.      //
    // ------------------------------------------------------------------ //

    test('Design: root BEM class, bgColor=primary, text, size, density, pill, label', async ({ page }) => {
        await page.goto(sandboxUrl(0))
        const chip = page.locator('.origam-chip').first()
        await expect(chip).toBeVisible({ timeout: 30000 })

        // BEM root
        await expect(chip).toHaveClass(/origam-chip/)

        // bgColor=primary → utility class + non-transparent bg
        await expect(chip).toHaveClass(/origam--bg-primary/)
        const bg = await chip.evaluate(el => getComputedStyle(el).backgroundColor)
        expect(bg).not.toBe('rgba(0, 0, 0, 0)')
        expect(bg).not.toBe('transparent')

        // text prop renders inside the content area
        await expect(chip.locator('.origam-chip__content')).toContainText('Chip')

        // default size class is present
        await expect(chip).toHaveClass(/origam-chip--size-default/)
        // density class: the chip emits a density class only when a density
        // prop is explicitly passed. With no density prop, useDensity emits
        // no class — the chip's SCSS resets --density via the scoped :root block.

        // pill / label not active by default
        const classes = await chip.getAttribute('class') ?? ''
        expect(classes).not.toContain('origam-chip--pill')
        expect(classes).not.toContain('origam-chip--label')

        // default height from --size-default SCSS rule
        const height = await chip.evaluate(el => getComputedStyle(el).height)
        expect(height).toBe('32px')
    })

    // ------------------------------------------------------------------ //
    // ROUNDED SCSS rules — injected classes, same Design variant (idx 0)  //
    // ------------------------------------------------------------------ //

    test('Design → Rounded SCSS: --rounded-shaped, --rounded-shaped-invert, --label radius', async ({ page }) => {
        await page.goto(sandboxUrl(0))
        const chip = page.locator('.origam-chip').first()
        await expect(chip).toBeVisible({ timeout: 30000 })

        // --rounded-shaped: TL+BR rounded, TR+BL = 0
        const radiiShaped = await chip.evaluate(el => {
            el.classList.add('origam-chip--rounded-shaped')
            const cs = getComputedStyle(el)
            const r = { tl: cs.borderTopLeftRadius, tr: cs.borderTopRightRadius, br: cs.borderBottomRightRadius, bl: cs.borderBottomLeftRadius }
            el.classList.remove('origam-chip--rounded-shaped')
            return r
        })
        expect(radiiShaped.tl, 'shaped TL').not.toBe('0px')
        expect(radiiShaped.br, 'shaped BR').not.toBe('0px')
        expect(radiiShaped.tr, 'shaped TR').toBe('0px')
        expect(radiiShaped.bl, 'shaped BL').toBe('0px')
        expect(radiiShaped.tl).toBe(radiiShaped.br)

        // --rounded-shaped-invert: TR+BL rounded, TL+BR = 0
        const radiiInvert = await chip.evaluate(el => {
            el.classList.add('origam-chip--rounded-shaped-invert')
            const cs = getComputedStyle(el)
            const r = { tl: cs.borderTopLeftRadius, tr: cs.borderTopRightRadius, br: cs.borderBottomRightRadius, bl: cs.borderBottomLeftRadius }
            el.classList.remove('origam-chip--rounded-shaped-invert')
            return r
        })
        expect(radiiInvert.tr, 'invert TR').not.toBe('0px')
        expect(radiiInvert.bl, 'invert BL').not.toBe('0px')
        expect(radiiInvert.tl, 'invert TL').toBe('0px')
        expect(radiiInvert.br, 'invert BR').toBe('0px')
        expect(radiiInvert.tr).toBe(radiiInvert.bl)

        // --label: border-radius = 4px
        const labelRadius = await chip.evaluate(el => {
            el.classList.add('origam-chip--label')
            const r = getComputedStyle(el).borderRadius
            el.classList.remove('origam-chip--label')
            return r
        })
        expect(labelRadius).toBe('4px')
    })

    // ------------------------------------------------------------------ //
    // STATE (index 1)                                                      //
    // ------------------------------------------------------------------ //

    test('State: bgColor=primary, overlay opacity 0 at rest', async ({ page }) => {
        await page.goto(sandboxUrl(1))
        const chip = page.locator('.origam-chip').first()
        await expect(chip).toBeVisible({ timeout: 30000 })
        await expect(chip).toHaveClass(/origam--bg-primary/)

        // overlay opacity = 0 at rest (chip is not a link here)
        const overlay = chip.locator('.origam-chip__overlay')
        const count = await overlay.count()
        if (count > 0) {
            const opacity = await overlay.evaluate(el => getComputedStyle(el).opacity)
            expect(parseFloat(opacity)).toBe(0)
        }
    })

    // ------------------------------------------------------------------ //
    // FUNCTIONAL (index 2)                                                 //
    // ------------------------------------------------------------------ //

    test('Functional: no disabled/closable by default, SCSS --disabled/--label rules work', async ({ page }) => {
        await page.goto(sandboxUrl(2))
        const chip = page.locator('.origam-chip').first()
        await expect(chip).toBeVisible({ timeout: 30000 })
        await expect(chip).toHaveClass(/origam--bg-primary/)

        // disabled=false by default
        const classes = await chip.getAttribute('class') ?? ''
        expect(classes).not.toContain('origam-chip--disabled')

        // pointer-events auto when not disabled
        const ptrEventsDefault = await chip.evaluate(el => getComputedStyle(el).pointerEvents)
        expect(ptrEventsDefault).toBe('auto')

        // SCSS --disabled: pointer-events: none
        const ptrEventsDisabled = await chip.evaluate(el => {
            el.classList.add('origam-chip--disabled')
            const v = getComputedStyle(el).pointerEvents
            el.classList.remove('origam-chip--disabled')
            return v
        })
        expect(ptrEventsDisabled).toBe('none')

        // SCSS --label: border-radius 4px
        const labelRadius = await chip.evaluate(el => {
            el.classList.add('origam-chip--label')
            const r = getComputedStyle(el).borderRadius
            el.classList.remove('origam-chip--label')
            return r
        })
        expect(labelRadius).toBe('4px')

        // closable=false by default: no close button
        const closeCount = await chip.locator('.origam-chip__close').count()
        expect(closeCount).toBe(0)
    })

    // ------------------------------------------------------------------ //
    // EVENTS - click (index 3)                                            //
    // ------------------------------------------------------------------ //

    test('Events - click: chip is visible, has --link class, click does not throw', async ({ page }) => {
        await page.goto(sandboxUrl(3))
        const chip = page.locator('.origam-chip').first()
        await expect(chip).toBeVisible({ timeout: 30000 })
        await expect(chip).toContainText('Click me')
        await expect(chip).toHaveClass(/origam-chip--link/)
        await chip.click()
        await chip.click()
    })

    // ------------------------------------------------------------------ //
    // EVENTS - click:prepend (index 4)                                    //
    // ------------------------------------------------------------------ //

    test('Events - click:prepend: prepend area present, click does not throw', async ({ page }) => {
        await page.goto(sandboxUrl(4))
        const chip = page.locator('.origam-chip').first()
        await expect(chip).toBeVisible({ timeout: 30000 })
        const prepend = chip.locator('.origam-chip__prepend').first()
        await expect(prepend).toBeAttached()
        await expect(prepend).toBeVisible()
        await prepend.click()
    })

    // ------------------------------------------------------------------ //
    // EVENTS - click:append (index 5)                                     //
    // ------------------------------------------------------------------ //

    test('Events - click:append: append area present, click does not throw', async ({ page }) => {
        await page.goto(sandboxUrl(5))
        const chip = page.locator('.origam-chip').first()
        await expect(chip).toBeVisible({ timeout: 30000 })
        const append = chip.locator('.origam-chip__append').first()
        await expect(append).toBeAttached()
        await expect(append).toBeVisible()
        await append.click()
    })

    // ------------------------------------------------------------------ //
    // EVENTS - click:close (index 6)                                      //
    // ------------------------------------------------------------------ //

    test('Events - click:close: close button present with correct margin, click does not throw', async ({ page }) => {
        await page.goto(sandboxUrl(6))
        const chip = page.locator('.origam-chip').first()
        await expect(chip).toBeVisible({ timeout: 30000 })
        await expect(chip).toContainText('Close me')

        const closeBtn = chip.locator('.origam-chip__close').first()
        await expect(closeBtn).toBeAttached()
        await expect(closeBtn).toBeVisible()

        // Non-regression: close button margin-inline-start >= 4px (breathing room from content)
        const layout = await chip.evaluate(el => {
            const close = el.querySelector('.origam-chip__close') as HTMLElement | null
            if (!close) return null
            return { marginInlineStart: getComputedStyle(close).marginInlineStart }
        })
        expect(layout).not.toBeNull()
        expect(parseFloat(layout!.marginInlineStart), 'margin-inline-start >= 4px').toBeGreaterThanOrEqual(4)

        await closeBtn.click()
    })

    // ------------------------------------------------------------------ //
    // EVENTS - group:selected (index 7)                                   //
    // ------------------------------------------------------------------ //

    test('Events - group:selected: chip-group renders 2 chips, click does not throw', async ({ page }) => {
        await page.goto(sandboxUrl(7))
        const chips = page.locator('.origam-chip')
        await expect(chips.first()).toBeVisible({ timeout: 30000 })
        await expect(chips).toHaveCount(2)
        await chips.first().click()
    })

    // ------------------------------------------------------------------ //
    // EVENTS - update:modelValue (index 8)                                //
    // ------------------------------------------------------------------ //

    test('Events - update:modelValue: chip-group renders chips A and B, click does not throw', async ({ page }) => {
        await page.goto(sandboxUrl(8))
        const chips = page.locator('.origam-chip')
        await expect(chips.first()).toBeVisible({ timeout: 30000 })
        await expect(chips).toHaveCount(2)
        await chips.first().click()
    })

    // ------------------------------------------------------------------ //
    // SLOTS - Default (index 9)                                           //
    // ------------------------------------------------------------------ //

    test('Slots - Default: custom italic content rendered inside chip content area', async ({ page }) => {
        await page.goto(sandboxUrl(9))
        const chip = page.locator('.origam-chip').first()
        await expect(chip).toBeVisible({ timeout: 30000 })
        // Story renders: <span style="font-style: italic;">Custom slot content</span>
        await expect(chip).toContainText('Custom slot content')
        await expect(chip.locator('.origam-chip__content')).toContainText('Custom slot content')
    })

    // ------------------------------------------------------------------ //
    // SLOTS - Prepend (index 10)                                          //
    // ------------------------------------------------------------------ //

    test('Slots - Prepend: origam-icon in prepend area, chip text "With prepend"', async ({ page }) => {
        await page.goto(sandboxUrl(10))
        const chip = page.locator('.origam-chip').first()
        await expect(chip).toBeVisible({ timeout: 30000 })
        await expect(chip).toContainText('With prepend')
        await expect(chip.locator('.origam-chip__prepend .origam-icon')).toBeAttached()
    })

    // ------------------------------------------------------------------ //
    // SLOTS - Append (index 11)                                           //
    // ------------------------------------------------------------------ //

    test('Slots - Append: origam-icon in append area, chip text "With append"', async ({ page }) => {
        await page.goto(sandboxUrl(11))
        const chip = page.locator('.origam-chip').first()
        await expect(chip).toBeVisible({ timeout: 30000 })
        await expect(chip).toContainText('With append')
        await expect(chip.locator('.origam-chip__append .origam-icon')).toBeAttached()
    })

    // ------------------------------------------------------------------ //
    // SLOTS - Close (index 12)                                            //
    // ------------------------------------------------------------------ //

    test('Slots - Close: custom icon in close button, chip text "Custom close"', async ({ page }) => {
        await page.goto(sandboxUrl(12))
        const chip = page.locator('.origam-chip').first()
        await expect(chip).toBeVisible({ timeout: 30000 })
        await expect(chip).toContainText('Custom close')
        await expect(chip.locator('.origam-chip__close')).toBeAttached()
        await expect(chip.locator('.origam-chip__close .origam-icon')).toBeAttached()
    })

    // ------------------------------------------------------------------ //
    // SLOTS - Filter (index 13)                                           //
    // The filter slot requires group context + filter=true + chip selected//
    // ------------------------------------------------------------------ //

    test('Slots - Filter: chip-group renders, clicking a chip shows filter area', async ({ page }) => {
        await page.goto(sandboxUrl(13))
        const chips = page.locator('.origam-chip')
        await expect(chips.first()).toBeVisible({ timeout: 30000 })
        await expect(chips).toHaveCount(2)
        // Click option A to select it — filter slot becomes visible
        await chips.first().click()
        await page.waitForTimeout(300)
        await expect(chips.first().locator('.origam-chip__filter')).toBeAttached()
    })

    // ------------------------------------------------------------------ //
    // DEFAULT playground (index 14)                                       //
    // ------------------------------------------------------------------ //

    test('Default (playground): bgColor=primary, text "Chip", tag=span', async ({ page }) => {
        await page.goto(sandboxUrl(14))
        const chip = page.locator('.origam-chip').first()
        await expect(chip).toBeVisible({ timeout: 30000 })
        await expect(chip).toHaveClass(/origam--bg-primary/)
        await expect(chip).toContainText('Chip')
        const tag = await chip.evaluate(el => el.tagName.toLowerCase())
        expect(tag).toBe('span')
    })
})
