// TEMPORARY probe — #823 / BG_FG_ROLE.DISABLED removal. Deleted before the PR.
//
// Measures, in a REAL browser, the painted surface of the components that
// consume `useColorEffect` / `useStateEffect` — the two composables that own
// the `bgRole` the enum member feeds. Run once before the removal and once
// after; the two dumps are diffed textually.
//
// Carries its OWN positive control: the same button is measured at rest AND
// under :hover. If the hover measurement does not differ from the resting one,
// the probe is not actuating the role machinery at all and "nothing changed"
// would be indistinguishable from "I measured nothing".

import { expect, test } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'

const OUT_DIR = process.env.G823_DIR ?? '/tmp/g823-render'

const STORIES = [
    'components-stories-btn-origambtn-story-vue',
    'components-stories-alert-origamalert-story-vue',
    'components-stories-chip-origamchip-story-vue',
    'components-stories-card-origamcard-story-vue',
    'components-stories-badge-origambadge-story-vue',
    'components-stories-sheet-origamsheet-story-vue',
    'components-stories-list-origamlistitem-story-vue',
    'components-stories-switch-origamswitch-story-vue',
    'components-stories-snackbar-origamsnackbar-story-vue',
    'components-stories-breadcrumb-origambreadcrumb-story-vue'
]

// Variant indices swept per story. Stories with fewer variants simply
// re-render their last one — harmless, and still a deterministic capture.
const VARIANTS = [0, 1, 2, 3, 4, 5, 6]

const BTN = 'components-stories-btn-origambtn-story-vue'

test.describe('#823 render probe', () => {
    test.setTimeout(600_000)

    test('captures every consuming story + a hover positive control', async ({ page }) => {
        mkdirSync(OUT_DIR, { recursive: true })
        const record: Record<string, unknown> = {}

        for (const id of STORIES) {
          for (const v of VARIANTS) {
            await page.goto(`/stories/story/${id}?variantId=${id}-${v}`, {
                waitUntil: 'domcontentloaded'
            })
            const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
            const body = sandbox.locator('body')
            await body.waitFor({ state: 'attached', timeout: 60_000 })
            await page.waitForTimeout(1400)

            // Every element the DS painted: class + the two colour longhands
            // the role machinery writes. Longhands, never the shorthand —
            // `getPropertyValue()` on a shorthand carrying `var()` is "".
            const painted = await body.evaluate(() => {
                const out: string[] = []
                for (const el of Array.from(document.querySelectorAll('[class*="origam-"]'))) {
                    const cs = getComputedStyle(el)
                    const bg = cs.backgroundColor
                    const fg = cs.color
                    if (bg === 'rgba(0, 0, 0, 0)' && !fg) continue
                    out.push(`${(el.getAttribute('class') ?? '').trim()} | bg=${bg} | fg=${fg}`)
                }
                return out.slice(0, 120)
            })
            // ⛔ An EMPTY capture is a cold-compile artefact, not a product
            // fact. Left unguarded it silently turns "nothing changed" into
            // "I measured nothing" — the two are indistinguishable in a diff.
            expect(painted.length, `empty capture for ${id}#${v}`).toBeGreaterThan(0)
            record[`${id}#${v}`] = painted

            const buf = await page.screenshot({ fullPage: true })
            writeFileSync(`${OUT_DIR}/${id}--v${v}.png`, buf)
          }
        }

        // ── Positive control ────────────────────────────────────────────
        // A real Btn, measured at rest then under :hover. The role machinery
        // (bgRole: 'default' → 'hover') must move the painted background.
        // Variant 3 = "Prop — color & bgColor": a STATIC matrix carrying an
        // intent-painted button, so the surface actually comes from
        // `tokenStylesForIntent(intent, bgRole)` — the exact code path the
        // removed enum member lives in.
        await page.goto(`/stories/story/${BTN}?variantId=${BTN}-3`, {
            waitUntil: 'domcontentloaded'
        })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        // `variant="flat"` is the one that actually PAINTS the surface — the
        // default variant leaves `background-color` transparent, so hovering it
        // moves nothing and the control would be blind.
        const btn = sandbox.locator('[data-cy="btn-flat-color-primary"]').first()
        await expect(btn).toBeVisible({ timeout: 60_000 })
        await page.waitForTimeout(1500)

        const read = async () =>
            btn.evaluate((el) => {
                const cs = getComputedStyle(el)
                return { bg: cs.backgroundColor, fg: cs.color }
            })

        const rest = await read()
        await btn.hover()
        await page.waitForTimeout(900)
        const hovered = await read()

        record['control::btn::rest'] = rest
        record['control::btn::hover'] = hovered

        writeFileSync(`${OUT_DIR}/measurements.json`, JSON.stringify(record, null, 2))
        console.log(`G823 rest=${JSON.stringify(rest)} hover=${JSON.stringify(hovered)}`)

        // The control must ACTUATE: hover has to repaint the surface.
        expect(hovered.bg, 'positive control: hover must repaint the surface').not.toBe(rest.bg)
    })
})
