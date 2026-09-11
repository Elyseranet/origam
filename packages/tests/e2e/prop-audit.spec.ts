import { expect, test, type Page } from '@playwright/test'

/**
 * Comprehensive prop-family runtime audit.
 *
 * For each story-exposed component, every prop family declared in its
 * IXxxProps interface is exercised via class-mutation on the live DOM.
 * This tests the SCSS contract (does the rule exist and produce a measurable
 * CSS change?) independently from the HstSelect dropdown.
 *
 * Pattern (mirrors chip-design.spec.ts):
 *  1. Navigate to the component's canonical story variant.
 *  2. Grab the root element.
 *  3. Swap classes programmatically.
 *  4. Assert getComputedStyle() changed in the expected direction.
 *
 * ROUNDED rungs:  x-small(2px) < small(4px) < default(8px) < medium(12px) < large(16px) < x-large(24px)
 * ELEVATION:      0 → no shadow; 1+ → non-none box-shadow
 * SIZE:           x-small < small < default < large < x-large in height
 * DENSITY:        comfortable height > compact height
 * BORDER:         off → 0px per side; on → ~1px per side
 */

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, path: string, variant: string) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(800)
}

const RUNGS = ['x-small', 'small', 'default', 'medium', 'large', 'x-large'] as const
const RUNG_PX = { 'x-small': 2, small: 4, default: 8, medium: 12, large: 16, 'x-large': 24 }

/** Utility rounded classes emitted by useRounded when rounded=xs|sm|md|lg|xl|none|full.
 *  These must also be stripped in borderRadiusAt so the cascade doesn't let
 *  `.origam--rounded-sm { border-radius: ... }` (spec 0,1,0) bleed through when
 *  the component's scoped rule resolves to an unset custom property.
 */
const UTILITY_RUNGS = ['none', 'xs', 'sm', 'md', 'lg', 'xl', 'full'] as const

/** Swap a modifier class on el and return computed borderRadius.
 *  Disables transitions before the class swap to get the final computed value
 *  immediately (avoids mid-transition reads when the component has
 *  `transition: all` or `transition-property: border-radius`).
 *
 *  Neutralises both the ID-scoped style tag injected by useStyle (spec 1,0,0)
 *  AND any utility rounded class (origam--rounded-xs/sm/md/lg/xl, spec 0,1,0)
 *  left on the node from the story init-state, so the component-local scoped
 *  rung rule (spec 0,2,0) is the only remaining source for border-radius.
 */

const borderRadiusAt = async (
    page: Page,
    selector: string,
    prefix: string,
    rung: string
): Promise<number> => {
    const sandbox = sandboxOf(page)
    const el = sandbox.locator(selector).first()
    const r = await el.evaluate((node, { prefix, rungs, utilityRungs, rung }) => {
        // 0. Strip any border-radius injected by useStyle into a <style> tag
        //    in the document head. The rule looks like:
        //    `#origam-btn-3 { border-radius: var(--origam-radius---sm, 4px); }`
        //    It has ID specificity (1,0,0) and wins over any class rule.
        //    We blank the border-radius declaration inside that rule so the class
        //    swap below can be observed by getComputedStyle().
        const elId = node.id
        if (elId) {
            document.querySelectorAll<HTMLStyleElement>('head style').forEach((st) => {
                const content = st.textContent ?? ''
                if (content.includes(`#${elId}`) && content.includes('border-radius')) {
                    st.textContent = content.replace(/border-radius\s*:[^;]+;?\s*/g, '')
                }
            })
        }

        // 1. Disable all transitions on the node so getComputedStyle()
        //    returns the final value, not the mid-animation interpolated one.
        const prev = node.style.transition
        node.style.setProperty('transition', 'none', 'important')

        // 2. Swap classes — remove both component-local rung classes AND the global
        //    utility rounded classes (origam--rounded-xs, origam--rounded-sm, etc.)
        //    so neither interferes with the class we're about to inject.
        rungs.forEach(r => node.classList.remove(`${prefix}--rounded-${r}`, `${prefix}--rounded`))
        utilityRungs.forEach(u => node.classList.remove(`origam--rounded-${u}`))
        // Also strip any inline border-radius so it cannot override the class-driven value.
        node.style.removeProperty('border-radius')
        if (rung) node.classList.add(`${prefix}--rounded-${rung}`)

        // 3. Force layout recalc
        void node.getBoundingClientRect()

        // 4. Read computed style with transitions disabled
        const radius = parseFloat(getComputedStyle(node).borderTopLeftRadius)

        // 5. Restore transition
        node.style.transition = prev

        return radius
    }, { prefix, rungs: [...RUNGS], utilityRungs: [...UTILITY_RUNGS], rung })
    return r
}

// ──────────────────────────────────────────────────────────────────────────────
// OrigamBtn — ALREADY PASSING (regression guard)
// ──────────────────────────────────────────────────────────────────────────────

const BTN_STORY = '/stories/story/components-stories-btn-origambtn-story-vue'

test.describe('OrigamBtn — rounded rungs', () => {
    test('OK: x-small(2)→small(4)→default(8)→medium(12)→large(16)→x-large(24)', async ({ page }) => {
        await openVariant(page, BTN_STORY, 'Prop — rounded')
        const sandbox = sandboxOf(page)
        const btn = sandbox.locator('.origam-btn').first()
        await expect(btn).toBeVisible({ timeout: 8000 })

        for (const [rung, expected] of Object.entries(RUNG_PX)) {
            const r = await borderRadiusAt(page, '.origam-btn', 'origam-btn', rung)
            expect(r, `BUG origam-btn --rounded-${rung} expected ${expected}px got ${r}px`).toBe(expected)
        }
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// OrigamSheet — ALREADY PASSING (regression guard)
// ──────────────────────────────────────────────────────────────────────────────

const SHEET_STORY = '/stories/story/components-stories-sheet-origamsheet-story-vue'

test.describe('OrigamSheet — rounded rungs', () => {
    test('OK: x-small(2)→small(4)→default(8)→medium(12)→large(16)→x-large(24)', async ({ page }) => {
        await openVariant(page, SHEET_STORY, 'Prop — rounded')
        const sandbox = sandboxOf(page)
        const sheet = sandbox.locator('.origam-sheet').first()
        await expect(sheet).toBeVisible({ timeout: 8000 })

        for (const [rung, expected] of Object.entries(RUNG_PX)) {
            const r = await borderRadiusAt(page, '.origam-sheet', 'origam-sheet', rung)
            expect(r, `BUG origam-sheet --rounded-${rung} expected ${expected}px got ${r}px`).toBe(expected)
        }
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// OrigamChip — BUG: no &--rounded / &--rounded-{rung} rules at all
// ──────────────────────────────────────────────────────────────────────────────

const CHIP_STORY = '/stories/story/components-stories-chip-origamchip-story-vue'

test.describe('OrigamChip — rounded rungs', () => {
    test('boolean true should set non-pill radius; rungs should produce distinct values', async ({ page }) => {
        await openVariant(page, CHIP_STORY, 'Prop — rounded')
        const sandbox = sandboxOf(page)
        const chip = sandbox.locator('.origam-chip').first()
        await expect(chip).toBeVisible({ timeout: 8000 })

        // Base radius (9999px pill default)
        const baseRadius = await chip.evaluate(node => parseFloat(getComputedStyle(node).borderTopLeftRadius))
        expect(baseRadius, 'chip default border-radius should be 9999px').toBeGreaterThan(100)

        // boolean --rounded should reduce to 4px (legacy)
        await chip.evaluate(node => {
            node.classList.add('origam-chip--rounded')
        })
        await page.waitForTimeout(60)
        const boolRadius = await chip.evaluate(node => parseFloat(getComputedStyle(node).borderTopLeftRadius))
        expect(boolRadius, `BUG origam-chip --rounded (bool) expected 4px got ${boolRadius}px`).toBe(4)

        // rung x-small → 2px
        for (const [rung, expected] of Object.entries(RUNG_PX)) {
            const r = await borderRadiusAt(page, '.origam-chip', 'origam-chip', rung)
            expect(r, `BUG origam-chip --rounded-${rung} expected ${expected}px got ${r}px`).toBe(expected)
        }
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// OrigamAlert — BUG: has &--rounded (bool) but no rung rules
// ──────────────────────────────────────────────────────────────────────────────

const ALERT_STORY = '/stories/story/components-stories-alert-origamalert-story-vue'

test.describe('OrigamAlert — rounded rungs', () => {
    test('rungs produce distinct border-radius values', async ({ page }) => {
        await openVariant(page, ALERT_STORY, 'Prop — rounded')
        const sandbox = sandboxOf(page)
        const alert = sandbox.locator('.origam-alert').first()
        await expect(alert).toBeVisible({ timeout: 8000 })

        for (const [rung, expected] of Object.entries(RUNG_PX)) {
            const r = await borderRadiusAt(page, '.origam-alert', 'origam-alert', rung)
            expect(r, `BUG origam-alert --rounded-${rung} expected ${expected}px got ${r}px`).toBe(expected)
        }
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// OrigamBtnGroup — BUG: has &--rounded (bool) but no rung rules
// ──────────────────────────────────────────────────────────────────────────────

const BTN_GROUP_STORY = '/stories/story/components-stories-btn-origambtngroup-story-vue'

test.describe('OrigamBtnGroup — rounded rungs', () => {
    test('rungs produce distinct border-radius values', async ({ page }) => {
        await openVariant(page, BTN_GROUP_STORY, 'Prop — rounded')
        const sandbox = sandboxOf(page)
        const group = sandbox.locator('.origam-btn-group').first()
        await expect(group).toBeVisible({ timeout: 8000 })

        for (const [rung, expected] of Object.entries(RUNG_PX)) {
            const r = await borderRadiusAt(page, '.origam-btn-group', 'origam-btn-group', rung)
            expect(r, `BUG origam-btn-group --rounded-${rung} expected ${expected}px got ${r}px`).toBe(expected)
        }
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// OrigamBottomNav — BUG: has &--rounded (bool) but no rung rules
// ──────────────────────────────────────────────────────────────────────────────

const BOTTOM_NAV_STORY = '/stories/story/components-stories-bottomnav-origambottomnav-story-vue'

test.describe('OrigamBottomNav — rounded rungs', () => {
    test('rungs produce distinct border-radius values', async ({ page }) => {
        await openVariant(page, BOTTOM_NAV_STORY, 'Prop — rounded')
        const sandbox = sandboxOf(page)
        const nav = sandbox.locator('.origam-bottom-nav').first()
        await expect(nav).toBeVisible({ timeout: 8000 })

        for (const [rung, expected] of Object.entries(RUNG_PX)) {
            const r = await borderRadiusAt(page, '.origam-bottom-nav', 'origam-bottom-nav', rung)
            expect(r, `BUG origam-bottom-nav --rounded-${rung} expected ${expected}px got ${r}px`).toBe(expected)
        }
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// OrigamBreadcrumb — BUG: has &--rounded (bool) but no rung rules
// ──────────────────────────────────────────────────────────────────────────────

const BREADCRUMB_STORY = '/stories/story/components-stories-breadcrumb-origambreadcrumb-story-vue'

test.describe('OrigamBreadcrumb — rounded rungs', () => {
    test('rungs produce distinct border-radius values', async ({ page }) => {
        await openVariant(page, BREADCRUMB_STORY, 'Prop — rounded')
        const sandbox = sandboxOf(page)
        const bc = sandbox.locator('.origam-breadcrumb').first()
        await expect(bc).toBeVisible({ timeout: 8000 })

        for (const [rung, expected] of Object.entries(RUNG_PX)) {
            const r = await borderRadiusAt(page, '.origam-breadcrumb', 'origam-breadcrumb', rung)
            expect(r, `BUG origam-breadcrumb --rounded-${rung} expected ${expected}px got ${r}px`).toBe(expected)
        }
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// OrigamList — BUG: has &--rounded (bool) but no rung rules
// ──────────────────────────────────────────────────────────────────────────────

const LIST_STORY = '/stories/story/components-stories-list-origamlist-story-vue'

test.describe('OrigamList — rounded rungs', () => {
    test('rungs produce distinct border-radius values', async ({ page }) => {
        await openVariant(page, LIST_STORY, 'Prop — rounded')
        const sandbox = sandboxOf(page)
        const list = sandbox.locator('.origam-list').first()
        await expect(list).toBeVisible({ timeout: 8000 })

        for (const [rung, expected] of Object.entries(RUNG_PX)) {
            const r = await borderRadiusAt(page, '.origam-list', 'origam-list', rung)
            expect(r, `BUG origam-list --rounded-${rung} expected ${expected}px got ${r}px`).toBe(expected)
        }
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// OrigamExpansionPanels — BUG: useRounded is called but NO border-radius CSS rule on root
// ──────────────────────────────────────────────────────────────────────────────

const EXPANSION_STORY = '/stories/story/components-stories-expansionpanel-origamexpansionpanels-story-vue'

test.describe('OrigamExpansionPanels — rounded rungs', () => {
    test('rungs produce distinct border-radius values on root', async ({ page }) => {
        await openVariant(page, EXPANSION_STORY, 'Prop — rounded')
        const sandbox = sandboxOf(page)
        const panels = sandbox.locator('.origam-expansion-panels').first()
        await expect(panels).toBeVisible({ timeout: 8000 })

        for (const [rung, expected] of Object.entries(RUNG_PX)) {
            const r = await borderRadiusAt(page, '.origam-expansion-panels', 'origam-expansion-panels', rung)
            expect(r, `BUG origam-expansion-panels --rounded-${rung} expected ${expected}px got ${r}px`).toBe(expected)
        }
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// OrigamSystemBar — BUG: has &--rounded (bool) at 0px, no rung rules
// ──────────────────────────────────────────────────────────────────────────────

const SYSTEM_BAR_STORY = '/stories/story/components-stories-systembar-origamsystembar-story-vue'

test.describe('OrigamSystemBar — rounded rungs', () => {
    test('rungs produce distinct border-radius values', async ({ page }) => {
        await openVariant(page, SYSTEM_BAR_STORY, 'Prop — rounded')
        const sandbox = sandboxOf(page)
        const bar = sandbox.locator('.origam-system-bar').first()
        await expect(bar).toBeVisible({ timeout: 8000 })

        for (const [rung, expected] of Object.entries(RUNG_PX)) {
            const r = await borderRadiusAt(page, '.origam-system-bar', 'origam-system-bar', rung)
            expect(r, `BUG origam-system-bar --rounded-${rung} expected ${expected}px got ${r}px`).toBe(expected)
        }
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// OrigamImg — BUG: has &--rounded (bool) but no rung rules
// ──────────────────────────────────────────────────────────────────────────────

const IMG_STORY = '/stories/story/components-stories-img-origamimg-story-vue'

test.describe('OrigamImg — rounded rungs', () => {
    test('rungs produce distinct border-radius values', async ({ page }) => {
        await openVariant(page, IMG_STORY, 'Prop — rounded')
        const sandbox = sandboxOf(page)
        const img = sandbox.locator('.origam-img').first()
        await expect(img).toBeVisible({ timeout: 8000 })

        for (const [rung, expected] of Object.entries(RUNG_PX)) {
            const r = await borderRadiusAt(page, '.origam-img', 'origam-img', rung)
            expect(r, `BUG origam-img --rounded-${rung} expected ${expected}px got ${r}px`).toBe(expected)
        }
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// OrigamAvatar — ALREADY PASSING (regression guard)
// ──────────────────────────────────────────────────────────────────────────────

const AVATAR_STORY = '/stories/story/components-stories-avatar-origamavatar-story-vue'

test.describe('OrigamAvatar — rounded rungs', () => {
    test('OK: rungs produce distinct border-radius values', async ({ page }) => {
        await openVariant(page, AVATAR_STORY, 'Prop — rounded')
        const sandbox = sandboxOf(page)
        const avatar = sandbox.locator('.origam-avatar').first()
        await expect(avatar).toBeVisible({ timeout: 8000 })

        for (const [rung, expected] of Object.entries(RUNG_PX)) {
            const r = await borderRadiusAt(page, '.origam-avatar', 'origam-avatar', rung)
            expect(r, `BUG origam-avatar --rounded-${rung} expected ${expected}px got ${r}px`).toBe(expected)
        }
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// OrigamTable — ALREADY PASSING (regression guard)
// ──────────────────────────────────────────────────────────────────────────────

const TABLE_STORY = '/stories/story/components-stories-table-origamtable-story-vue'

test.describe('OrigamTable — rounded rungs', () => {
    test('OK: rungs produce distinct border-radius values', async ({ page }) => {
        await openVariant(page, TABLE_STORY, 'Prop — rounded')
        const sandbox = sandboxOf(page)
        const table = sandbox.locator('.origam-table').first()
        await expect(table).toBeVisible({ timeout: 8000 })

        for (const [rung, expected] of Object.entries(RUNG_PX)) {
            const r = await borderRadiusAt(page, '.origam-table', 'origam-table', rung)
            expect(r, `BUG origam-table --rounded-${rung} expected ${expected}px got ${r}px`).toBe(expected)
        }
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// OrigamChip — SIZE contract (regression guard from chip-design.spec.ts)
// ──────────────────────────────────────────────────────────────────────────────

test.describe('OrigamChip — size rungs', () => {
    test('x-small < small < default < large < x-large in height', async ({ page }) => {
        await openVariant(page, CHIP_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const chip = sandbox.locator('.origam-chip').first()
        await expect(chip).toBeVisible({ timeout: 8000 })

        const sizeRungs = ['x-small', 'small', 'default', 'large', 'x-large']
        const heights: Record<string, number> = {}
        for (const s of sizeRungs) {
            await chip.evaluate((el, sz) => {
                el.classList.remove(
                    'origam-chip--size-x-small', 'origam-chip--size-small',
                    'origam-chip--size-default', 'origam-chip--size-large', 'origam-chip--size-x-large'
                )
                el.classList.add(`origam-chip--size-${sz}`)
            }, s)
            await page.waitForTimeout(60)
            heights[s] = (await chip.boundingBox())!.height
        }
        expect(heights['x-small']).toBeLessThan(heights['small'])
        expect(heights['small']).toBeLessThan(heights['default'])
        expect(heights['default']).toBeLessThan(heights['large'])
        expect(heights['large']).toBeLessThan(heights['x-large'])
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// OrigamAlert — DENSITY contract
// ──────────────────────────────────────────────────────────────────────────────

test.describe('OrigamAlert — density', () => {
    test('comfortable height > compact height', async ({ page }) => {
        await openVariant(page, ALERT_STORY, 'Default')
        const sandbox = sandboxOf(page)
        const alert = sandbox.locator('.origam-alert').first()
        await expect(alert).toBeVisible({ timeout: 8000 })

        const heights: Record<string, number> = {}
        for (const d of ['compact', 'default', 'comfortable']) {
            await alert.evaluate((el, density) => {
                el.classList.remove('origam-alert--density-compact', 'origam-alert--density-default', 'origam-alert--density-comfortable')
                el.classList.add(`origam-alert--density-${density}`)
            }, d)
            await page.waitForTimeout(80)
            heights[d] = (await alert.boundingBox())!.height
        }
        expect(heights['comfortable']).toBeGreaterThan(heights['compact'])
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// OrigamBtnGroup — DENSITY contract
// ──────────────────────────────────────────────────────────────────────────────

test.describe('OrigamBtnGroup — density', () => {
    test('comfortable height > compact height', async ({ page }) => {
        await openVariant(page, BTN_GROUP_STORY, 'Prop — density')
        const sandbox = sandboxOf(page)
        const group = sandbox.locator('.origam-btn-group').first()
        await expect(group).toBeVisible({ timeout: 8000 })

        const heights: Record<string, number> = {}
        for (const d of ['compact', 'default', 'comfortable']) {
            await group.evaluate((el, density) => {
                el.classList.remove('origam-btn-group--density-compact', 'origam-btn-group--density-default', 'origam-btn-group--density-comfortable')
                el.classList.add(`origam-btn-group--density-${density}`)
            }, d)
            await page.waitForTimeout(80)
            heights[d] = (await group.boundingBox())!.height
        }
        expect(heights['comfortable']).toBeGreaterThan(heights['compact'])
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// OrigamSheet — ELEVATION contract
// Note: useElevation emits inline box-shadow via elevationStyles (not a class),
// so we drive it via direct style mutation, not classList.
// ──────────────────────────────────────────────────────────────────────────────

test.describe('OrigamSheet — elevation', () => {
    test('elevation=0 → no shadow token; elevation=4 → non-none shadow token', async ({ page }) => {
        await openVariant(page, SHEET_STORY, 'Prop — elevation')
        const sandbox = sandboxOf(page)
        const sheet = sandbox.locator('.origam-sheet').first()
        await expect(sheet).toBeVisible({ timeout: 8000 })

        // elevation = 0: useElevation resolves to --origam-shadow---none (0-opacity)
        await sheet.evaluate(node => {
            node.style.boxShadow = 'var(--origam-shadow---none, none)'
        })
        await page.waitForTimeout(60)
        const shadow0 = await sheet.evaluate(node => getComputedStyle(node).boxShadow)
        // --origam-shadow---none should be 'none' or 0-opacity
        const noShadow = shadow0 === 'none' || shadow0.includes('rgba(0, 0, 0, 0)')
        expect(noShadow, `elevation-0 produced non-zero shadow: "${shadow0}"`).toBe(true)

        // elevation = 4: useElevation resolves to --origam-shadow---md (real shadow)
        await sheet.evaluate(node => {
            node.style.boxShadow = 'var(--origam-shadow---md)'
        })
        await page.waitForTimeout(60)
        const shadowMd = await sheet.evaluate(node => getComputedStyle(node).boxShadow)
        expect(shadowMd, `elevation-4 produced no shadow (got '${shadowMd}')`).not.toBe('none')
    })
})

// ──────────────────────────────────────────────────────────────────────────────
// OrigamSheet — BORDER contract
// ──────────────────────────────────────────────────────────────────────────────

test.describe('OrigamSheet — border', () => {
    test('default → 0px border-width; --border → 1px border-width', async ({ page }) => {
        await openVariant(page, SHEET_STORY, 'Prop — border & rounded (modifiers)')
        const sandbox = sandboxOf(page)
        const sheet = sandbox.locator('.origam-sheet').first()
        await expect(sheet).toBeVisible({ timeout: 8000 })

        // No border class → border-width should be 0
        await sheet.evaluate(node => {
            node.classList.remove('origam-sheet--border')
        })
        await page.waitForTimeout(60)
        const bw0 = await sheet.evaluate(node => parseFloat(getComputedStyle(node).borderTopWidth))
        expect(bw0, `BUG: no-border class produced non-zero border: ${bw0}px`).toBe(0)

        // Add --border → expect ~1px
        await sheet.evaluate(node => node.classList.add('origam-sheet--border'))
        await page.waitForTimeout(60)
        const bw1 = await sheet.evaluate(node => parseFloat(getComputedStyle(node).borderTopWidth))
        expect(bw1, `BUG: --border class produced 0px border`).toBeGreaterThan(0)
    })
})
