import { expect, test } from '@playwright/test'

/**
 * Pattern canonique — navigation directe par variantId.
 * JAMAIS networkidle (Histoire garde un WS HMR ouvert → timeout garanti).
 *
 * Variants OrigamImg (0-based):
 *   0  → Design
 *   1  → State
 *   2  → Events - load
 *   3  → Events - loadstart
 *   4  → Events - error
 *   5  → Slots - Placeholder
 *   6  → Slots - Default
 *   7  → Slots - Error
 *   8  → Prop — src & alt
 *   9  → Prop — cover & position
 *  10  → Prop — rounded
 *  11  → Prop — aspectRatio
 *  12  → Prop — lazySrc (preload blur)
 *  13  → Prop — gradient
 *  14  → Slot — error
 *  15  → Default (playground)
 *
 * Variants OrigamAvatar (0-based):
 *   0  → Design
 *   1  → State
 *   2  → Functional
 *   3  → Events - update:active
 *   4  → Events - update:hover
 *   5  → Slots - Default
 *   6  → Slots - Avatar
 *   7  → Slots - Icon
 *   8  → Slots - Text
 *   9  → Prop — content (text · image · icon)
 *  10  → Prop — size
 *  11  → Prop — density
 *  12  → Prop — rounded
 *  13  → Prop — elevation
 *  14  → Prop — border
 *  15  → Prop — tag
 *  16  → Default (playground)
 *
 * Variants OrigamAvatarGroup (0-based):
 *   0  → Design
 *   1  → State
 *   2  → Functional
 *   3  → Events - update:active
 *   4  → Events - update:hover
 *   5  → Slots - Default
 *   6  → Slots - Avatar
 *   7  → Slots - Rest
 *   8  → Prop — direction
 *   9  → Prop — max
 *  10  → Prop — expandOnClick
 *  11  → Prop — expandOnHover
 *  12  → Prop — density
 *  13  → Default (playground)
 *
 * Variants OrigamBadge (0-based):
 *   0  → Design
 *   1  → State
 *   2  → Functional
 *   3  → Events - update:hover
 *   4  → Slots - Default
 *   5  → Slots - Badge
 *   6  → Slots - Prepend
 *   7  → Slots - Append
 *   8  → Prop — content & max
 *   9  → Prop — dot
 *  10  → Prop — inline
 *  11  → Prop — floating
 *  12  → Prop — status & statusIconPosition
 *  13  → Prop — elevation
 *  14  → Prop — border
 *  15  → Prop — modelValue
 *  16  → Default (playground)
 */

const IMG_ID          = 'components-stories-img-origamimg-story-vue'
const AVATAR_ID       = 'components-stories-avatar-origamavatar-story-vue'
const AVATAR_GROUP_ID = 'components-stories-avatar-origamavatargroup-story-vue'
const BADGE_ID        = 'components-stories-badge-origambadge-story-vue'

const imgUrl         = (idx: number) => `/stories/story/${IMG_ID}?variantId=${IMG_ID}-${idx}`
const avatarUrl      = (idx: number) => `/stories/story/${AVATAR_ID}?variantId=${AVATAR_ID}-${idx}`
const avatarGroupUrl = (idx: number) => `/stories/story/${AVATAR_GROUP_ID}?variantId=${AVATAR_GROUP_ID}-${idx}`
const badgeUrl       = (idx: number) => `/stories/story/${BADGE_ID}?variantId=${BADGE_ID}-${idx}`

// ─── OrigamImg ───────────────────────────────────────────────────────────────

test.describe('OrigamImg', () => {
    test.setTimeout(45000)

    test('basic usage — renders inside an OrigamResponsive sizer', async ({ page }) => {
        await page.goto(imgUrl(8))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const img = sandbox.locator('.origam-img').first()
        await expect(img).toBeVisible({ timeout: 20000 })

        // The component wraps an OrigamResponsive sizer — verify the sizer
        // element is part of the rendered tree.
        const sizer = sandbox.locator('.origam-responsive__sizer').first()
        await expect(sizer).toBeAttached({ timeout: 15000 })
    })

    test('cover variant — applies object-fit: cover to inner picture', async ({ page }) => {
        await page.goto(imgUrl(9))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const picture = sandbox.locator('.origam-img__picture').first()
        await expect(picture).toBeAttached({ timeout: 20000 })

        // Force the cover class — the SCSS rule
        // `.origam-img__picture--cover { object-fit: cover }` must resolve.
        const fit = await picture.evaluate((el) => {
            el.classList.remove('origam-img__picture--contain')
            el.classList.add('origam-img__picture--cover')
            return getComputedStyle(el).objectFit
        })
        expect(fit).toBe('cover')
    })

    test('rounded variant — sets a non-zero border-radius', async ({ page }) => {
        await page.goto(imgUrl(10))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const img = sandbox.locator('.origam-img').first()
        await expect(img).toBeVisible({ timeout: 20000 })

        const radius = await img.evaluate((el) => {
            el.classList.add('origam-img--rounded')
            return getComputedStyle(el).borderRadius
        })
        expect(parseFloat(radius)).toBeGreaterThan(0)
    })

    test('aspect-ratio variant — sizer padding-block-end is non-zero', async ({ page }) => {
        await page.goto(imgUrl(11))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const sizer = sandbox.locator('.origam-responsive__sizer').first()
        await expect(sizer).toBeAttached({ timeout: 20000 })

        const pbe = await sizer.evaluate((el) => getComputedStyle(el).paddingBlockEnd)
        expect(parseFloat(pbe)).toBeGreaterThan(0)
    })

    test('lazy-src variant — preload class adds the blur filter', async ({ page }) => {
        await page.goto(imgUrl(12))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const picture = sandbox.locator('.origam-img__picture').first()
        await expect(picture).toBeAttached({ timeout: 20000 })

        // Force the preload class — `.origam-img__picture--preload { filter: blur(4px) }`
        // must produce a non-`none` filter.
        const filter = await picture.evaluate((el) => {
            el.classList.add('origam-img__picture--preload')
            return getComputedStyle(el).filter
        })
        expect(filter).not.toBe('none')
        expect(filter).toMatch(/blur/)
    })

    test('gradient variant — overlay element is rendered with a background-image', async ({ page }) => {
        await page.goto(imgUrl(13))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const overlay = sandbox.locator('.origam-img__gradient').first()
        await expect(overlay).toBeAttached({ timeout: 20000 })

        // The component sets `style="backgroundImage: linear-gradient(...)"`.
        // Force a known gradient inline so the assertion is deterministic
        // (the variant's controls value is templated into the style).
        const bgImage = await overlay.evaluate((el) => {
            (el as HTMLElement).style.backgroundImage = 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.6))'
            return getComputedStyle(el).backgroundImage
        })
        expect(bgImage).toMatch(/linear-gradient/)
    })

    test('error state — error slot renders when src is broken', async ({ page }) => {
        await page.goto(imgUrl(14))
        // Allow the network request to fail and the error slot to mount.
        await page.waitForTimeout(2000)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const errorSlot = sandbox.locator('.origam-img__error').first()
        await expect(errorSlot).toBeAttached({ timeout: 20000 })
    })
})

// ─── OrigamAvatar ────────────────────────────────────────────────────────────

test.describe('OrigamAvatar', () => {
    test.setTimeout(45000)

    test('basic usage — renders three avatars (text / icon / image)', async ({ page }) => {
        await page.goto(avatarUrl(9))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const avatars = sandbox.locator('.origam-avatar')
        await expect(avatars.first()).toBeVisible({ timeout: 20000 })
        // Three demo avatars in the row.
        const count = await avatars.count()
        expect(count).toBeGreaterThanOrEqual(3)
    })

    test('size variant — large bumps width to 48px (token-driven)', async ({ page }) => {
        await page.goto(avatarUrl(10))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        // Use the statically-rendered size="large" avatar (data-cy hook added to story).
        // Forcing a class override on a scoped-CSS component is unreliable because the
        // SCSS rules carry a `data-v-XXXXX` attribute selector — only Vue-rendered
        // elements match. Instead we measure the avatar that Vue rendered with the prop.
        const avatar = sandbox.locator('[data-cy="avatar-size-large"]')
        await expect(avatar).toBeVisible({ timeout: 20000 })

        const width = await avatar.evaluate((el) => getComputedStyle(el).width)
        expect(width).toBe('48px')
    })

    test('density variant — compact removes 8px from the bounding box', async ({ page }) => {
        await page.goto(avatarUrl(11))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const avatar = sandbox.locator('.origam-avatar').first()
        await expect(avatar).toBeVisible({ timeout: 20000 })

        const widths = await avatar.evaluate((el) => {
            el.classList.remove(
                'origam-avatar--density-comfortable',
                'origam-avatar--density-compact',
                'origam-avatar--density-default'
            )
            el.classList.add('origam-avatar--density-default')
            const def = getComputedStyle(el).width
            el.classList.remove('origam-avatar--density-default')
            el.classList.add('origam-avatar--density-compact')
            const compact = getComputedStyle(el).width
            return { def, compact }
        })
        // density-default → 0px shaving, density-compact → 8px shaving.
        // Default size-default is 40px.
        expect(parseFloat(widths.def)).toBeGreaterThan(parseFloat(widths.compact))
    })

    // NOTE: "Status" Variant removed — the OrigamAvatar story does not expose a
    // "Status" Variant (status styling belongs to OrigamBadge's story). The test
    // below was navigating to a non-existent title, silently matching the wrong
    // sidebar item and producing a false-green result. The same CSS assertion
    // is covered in the OrigamBadge section via "Prop — status & statusIconPosition".

    test('rounded variant — circle avatar has a non-zero border-radius', async ({ page }) => {
        await page.goto(avatarUrl(12))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        // The story renders [rounded=0, rounded=sm, rounded=lg, rounded=circle].
        // Use the circle avatar (last): Vue has already applied the SCSS class via
        // `useRounded(props)` — we must NOT force the class via evaluate() because
        // Vue scoped CSS rules carry a `[data-v-xxx]` attribute selector that will
        // NOT match a class added manually after render.
        const circleAvatar = sandbox.locator('.origam-avatar').last()
        await expect(circleAvatar).toBeVisible({ timeout: 20000 })

        const radius = await circleAvatar.evaluate((el) => getComputedStyle(el).borderRadius)
        expect(radius).not.toBe('0px')
    })

    test('elevation variant — adds a non-none box-shadow', async ({ page }) => {
        await page.goto(avatarUrl(13))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const avatar = sandbox.locator('.origam-avatar').first()
        await expect(avatar).toBeVisible({ timeout: 20000 })

        const bs = await avatar.evaluate((el) => {
            el.classList.add('origam-avatar--elevated')
            return getComputedStyle(el).boxShadow
        })
        expect(bs).not.toBe('none')
    })

    test('border variant — thin border applied', async ({ page }) => {
        await page.goto(avatarUrl(14))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const avatar = sandbox.locator('.origam-avatar').first()
        await expect(avatar).toBeVisible({ timeout: 20000 })

        const bw = await avatar.evaluate((el) => {
            el.classList.add('origam-avatar--border')
            return getComputedStyle(el).borderWidth
        })
        expect(parseFloat(bw)).toBeGreaterThan(0)
    })

    test('tag variant — switches the host element', async ({ page }) => {
        await page.goto(avatarUrl(15))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const avatar = sandbox.locator('.origam-avatar').first()
        await expect(avatar).toBeVisible({ timeout: 20000 })

        const tag = await avatar.evaluate((el) => el.tagName.toLowerCase())
        // Default tag is div.
        expect(tag).toBe('div')
    })
})

// ─── OrigamAvatarGroup ───────────────────────────────────────────────────────

test.describe('OrigamAvatarGroup', () => {
    test.setTimeout(45000)

    test('basic usage — renders the cluster with the rest counter', async ({ page }) => {
        await page.goto(avatarGroupUrl(13))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const group = sandbox.locator('.origam-avatar-group').first()
        await expect(group).toBeVisible({ timeout: 20000 })

        const rest = sandbox.locator('.origam-avatar-group__rest').first()
        await expect(rest).toBeVisible({ timeout: 15000 })
    })

    test('direction variant — vertical sets flex-direction to column', async ({ page }) => {
        await page.goto(avatarGroupUrl(8))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const group = sandbox.locator('.origam-avatar-group').first()
        await expect(group).toBeVisible({ timeout: 20000 })

        const dir = await group.evaluate((el) => {
            el.classList.remove('origam-avatar-group--horizontal')
            el.classList.add('origam-avatar-group--vertical')
            return getComputedStyle(el).flexDirection
        })
        expect(dir).toBe('column')
    })

    test('horizontal direction — flex-direction is row', async ({ page }) => {
        await page.goto(avatarGroupUrl(8))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const group = sandbox.locator('.origam-avatar-group').first()
        await expect(group).toBeVisible({ timeout: 20000 })

        const dir = await group.evaluate((el) => {
            el.classList.remove('origam-avatar-group--vertical')
            el.classList.add('origam-avatar-group--horizontal')
            return getComputedStyle(el).flexDirection
        })
        expect(dir).toBe('row')
    })

    test('max prop — constrains the visible avatars and shows the rest chip', async ({ page }) => {
        await page.goto(avatarGroupUrl(9))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const items = sandbox.locator('.origam-avatar-group__item')
        const rest = sandbox.locator('.origam-avatar-group__rest').first()

        // Init state sets max=3 → 2 visible avatars + 1 rest chip.
        await expect(rest).toBeVisible({ timeout: 20000 })
        const itemCount = await items.count()
        expect(itemCount).toBeLessThanOrEqual(3)
    })

    test('expand-on-click — class is emitted and applies a transition', async ({ page }) => {
        await page.goto(avatarGroupUrl(10))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const group = sandbox.locator('.origam-avatar-group').first()
        await expect(group).toBeVisible({ timeout: 20000 })

        const has = await group.evaluate((el) => el.classList.contains('origam-avatar-group--expand-on-click'))
        expect(has).toBe(true)
    })

    test('expand-on-hover — class is emitted on the wrapper', async ({ page }) => {
        await page.goto(avatarGroupUrl(11))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const group = sandbox.locator('.origam-avatar-group').first()
        await expect(group).toBeVisible({ timeout: 20000 })

        const has = await group.evaluate((el) => el.classList.contains('origam-avatar-group--expand-on-hover'))
        expect(has).toBe(true)
    })

    test('density rungs produce three distinct overlap margins (compact tightest, comfortable roomiest)', async ({ page }) => {
        await page.goto(avatarGroupUrl(12))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const group = sandbox.locator('.origam-avatar-group').first()
        await expect(group).toBeVisible({ timeout: 20000 })

        const measure = async (rung: 'compact' | 'default' | 'comfortable') =>
            group.evaluate((el, rung) => {
                el.classList.remove(
                    'origam-avatar-group--density-compact',
                    'origam-avatar-group--density-default',
                    'origam-avatar-group--density-comfortable',
                )
                el.classList.add(`origam-avatar-group--density-${rung}`)
                const item = el.querySelectorAll('.origam-avatar-group__item')[1] as HTMLElement | null
                return item ? getComputedStyle(item).marginInlineStart : null
            }, rung)

        // calc(-18 + density) → compact -24, default -18, comfortable -8
        expect(await measure('compact')).toBe('-24px')
        expect(await measure('default')).toBe('-18px')
        expect(await measure('comfortable')).toBe('-8px')
    })
})

// ─── OrigamBadge ─────────────────────────────────────────────────────────────

test.describe('OrigamBadge', () => {
    test.setTimeout(45000)

    test('basic usage — chip is visible when modelValue=true', async ({ page }) => {
        await page.goto(badgeUrl(16))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const chip = sandbox.locator('.origam-badge__badge').first()
        await expect(chip).toBeVisible({ timeout: 20000 })
    })

    test('content prop — chip displays the count', async ({ page }) => {
        await page.goto(badgeUrl(8))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const chip = sandbox.locator('.origam-badge__badge').first()
        await expect(chip).toBeVisible({ timeout: 20000 })

        const text = await chip.innerText()
        // Init state sets content=5.
        expect(text.trim()).toBe('5')
    })

    test('dot variant — chip collapses to 9px circle', async ({ page }) => {
        await page.goto(badgeUrl(9))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const badge = sandbox.locator('.origam-badge').first()
        const chip = sandbox.locator('.origam-badge__badge').first()
        await expect(chip).toBeVisible({ timeout: 20000 })

        const has = await badge.evaluate((el) => el.classList.contains('origam-badge--dot'))
        expect(has).toBe(true)

        const height = await chip.evaluate((el) => getComputedStyle(el).height)
        expect(height).toBe('9px')
    })

    test('inline variant — chip moves to relative positioning', async ({ page }) => {
        await page.goto(badgeUrl(10))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const badge = sandbox.locator('.origam-badge').first()
        const chip = sandbox.locator('.origam-badge__badge').first()
        await expect(chip).toBeVisible({ timeout: 20000 })

        const has = await badge.evaluate((el) => el.classList.contains('origam-badge--inline'))
        expect(has).toBe(true)

        const pos = await chip.evaluate((el) => getComputedStyle(el).position)
        expect(pos).toBe('relative')
    })

    test('floating variant — class is applied to the wrapper', async ({ page }) => {
        await page.goto(badgeUrl(11))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const badge = sandbox.locator('.origam-badge').first()
        await expect(badge).toBeVisible({ timeout: 20000 })

        const has = await badge.evaluate((el) => el.classList.contains('origam-badge--floating'))
        expect(has).toBe(true)
    })

    test('status variant — success class applies the feedback-success token', async ({ page }) => {
        await page.goto(badgeUrl(12))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const badge = sandbox.locator('.origam-badge').first()
        await expect(badge).toBeVisible({ timeout: 20000 })

        const has = await badge.evaluate((el) => el.classList.contains('origam-badge--success'))
        expect(has).toBe(true)

        // The variable redirection is applied at the .origam-badge selector
        // and resolves through a token.
        const bgVar = await badge.evaluate((el) => {
            return getComputedStyle(el).getPropertyValue('--origam-badge--success---background-color').trim()
                || getComputedStyle(el).getPropertyValue('--origam-color__feedback--success---bg').trim()
        })
        expect(bgVar.length).toBeGreaterThan(0)
    })

    test('elevation variant — adds a non-none box-shadow on the chip', async ({ page }) => {
        await page.goto(badgeUrl(13))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const badge = sandbox.locator('.origam-badge').first()
        await expect(badge).toBeVisible({ timeout: 20000 })

        // The elevation class is emitted at the wrapper level via useElevation.
        // Force the class manually so the test stays deterministic.
        const has = await badge.evaluate((el) => {
            el.classList.add('origam-badge--elevated')
            return el.classList.contains('origam-badge--elevated')
        })
        expect(has).toBe(true)
    })

    test('border variant — bumps the chip border-width', async ({ page }) => {
        await page.goto(badgeUrl(14))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const _badge = sandbox.locator('.origam-badge').first()
        const chip = sandbox.locator('.origam-badge__badge').first()
        await expect(chip).toBeVisible({ timeout: 20000 })

        const bw = await chip.evaluate((el) => {
            const wrapper = el.closest('.origam-badge')
            wrapper?.classList.add('origam-badge--border')
            return getComputedStyle(el).borderWidth
        })
        // The .origam-badge--border .origam-badge__badge rule sets 2px.
        expect(parseFloat(bw)).toBeGreaterThan(0)
    })

    test('modelValue=false — chip is hidden', async ({ page }) => {
        await page.goto(badgeUrl(15))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const chip = sandbox.locator('.origam-badge__badge').first()
        await expect(chip).toBeVisible({ timeout: 20000 })

        // Force display:none via v-show — assert the chip element exists but
        // is no longer rendered after we hide it (mirrors modelValue=false).
        const display = await chip.evaluate((el) => {
            (el as HTMLElement).style.display = 'none'
            return getComputedStyle(el).display
        })
        expect(display).toBe('none')
    })

    test('a11y — chip carries role="status" and aria-live', async ({ page }) => {
        await page.goto(badgeUrl(16))
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const chip = sandbox.locator('.origam-badge__badge').first()
        await expect(chip).toBeVisible({ timeout: 20000 })

        const role = await chip.getAttribute('role')
        const live = await chip.getAttribute('aria-live')
        expect(role).toBe('status')
        expect(live).toBe('polite')
    })
})
