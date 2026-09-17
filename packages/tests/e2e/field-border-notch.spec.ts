import { expect, test, type Page } from '@playwright/test'
import { selectHstOption } from './_support/histoire-controls'

/**
 * Issue #726 — `border` / `outlined` must feed the FIELD's notched outline,
 * not the OUTER `OrigamInput` root.
 *
 * ## The defect
 *
 * The DOM nesting is the inverse of what the names suggest:
 *
 *     <div class="origam-input">        ← OUTER box, carried `borderClasses`
 *         <div class="origam-field">    ← INNER, owns the label + notched outline
 *
 * `OrigamInput` applies `useBorder(props)` and drops `borderClasses` on its own
 * root — a plain rectangle with no notch. Its top edge sits exactly where the
 * floating label floats, so the border ran straight THROUGH the label.
 *
 * `OrigamField` already owns the Material-style notched outline
 * (`__outline--start` / `--notch` / `--end`), whose `--notch` leg drops its top
 * border to `0` under `--active` / `--focused`. That is the gap the label sits
 * in. The mechanism was never missing — `border` simply bypassed it.
 *
 * ## How this spec judges
 *
 * Not "does it look right": it computes the 2D INTERSECTION AREA between the
 * floating label's box and every painted border band in the component, and
 * asserts it is zero. A border band is the real painted strip (for the top
 * edge: `[left, top] → [right, top + borderTopWidth]`), counted only when the
 * width is > 0 and the style is not `none`.
 *
 * Measured against the parent commit (A/B, chromium, same build pipeline):
 *
 *   | case                        | before  | after |
 *   |-----------------------------|---------|-------|
 *   | TextField, border="thick"   | 61.41   | 0     |
 *   | Select, NO border prop      | 35.59   | 0     |
 *   | Select, border="thick"      | 71.19   | 0     |
 *
 * Select is cut with no user prop at all because `OrigamSelect` declares
 * `border: true` as its OWN default (`OrigamSelect.vue`, `withDefaults`).
 *
 * ⛔ These assertions are only meaningful in a real browser: under jsdom
 * `getComputedStyle` never resolves `var()` and fabricates `16px`, and this
 * whole outline is `var(--origam-field---border-*)`-driven.
 */

const TEXTFIELD = 'components-stories-textfield-origamtextfield-story-vue'
const SELECT    = 'components-stories-select-origamselect-story-vue'
const FIELD     = 'components-stories-field-origamfield-story-vue'
const SWITCH    = 'components-stories-switch-origamswitch-story-vue'

/**
 * Le libelle `BORDER_OPTIONS` de l'echelon utilitaire `thick`.
 *
 * ⛔ IL DOIT CORRESPONDRE AU CARACTERE PRES a l'entree de
 * `packages/stories/const/border.const.ts` : `selectHstOption` clique via
 * `getByText(..., { exact: true })`.
 *
 * Cette constante disait `3px`. `#730` / PR #791 (`fd9c5cbca`, 2026-09-16) a
 * corrige le libelle en `2px` — la valeur reellement rendue —, ce qui a rendu
 * CETTE spec rouge le jour meme : les 4 tests echouaient en
 * `locator.click: Test timeout of 60000ms exceeded`, l'option cliquee
 * n'existant plus. Personne ne l'a su : la spec est hors `GREEN_SPECS`, donc
 * AUCUN job de CI ne l'execute (#824). Elle est restee rouge et muette.
 */
const BORDER_THICK = 'Width — thick (utility, 2px)'

const sandboxOf = (page: Page) => page.frameLocator('iframe[src*="__sandbox"]')

const open = async (page: Page, story: string, variant = 0) => {
    await page.goto(`/stories/story/${story}?variantId=${story}-${variant}`, { waitUntil: 'domcontentloaded' })
    await sandboxOf(page).locator('.origam-input, .origam-field').first().waitFor({ timeout: 20000 })
    await page.waitForTimeout(700)
}

/** Focus the control so the label floats and the notch mechanism engages. */
const floatLabel = async (page: Page) => {
    await sandboxOf(page).locator('input, textarea').first().evaluate((el: HTMLElement) => el.focus())
    await page.waitForTimeout(600)
}

/**
 * Total painted-border area overlapping the floating label, in px².
 * Runs entirely inside one `evaluate` — no DOM mutation involved, so the
 * single-evaluate / two-step distinction documented in CLAUDE.md does not
 * apply here; this only reads geometry Vue has already rendered.
 */
const labelCrossingArea = (page: Page) =>
    sandboxOf(page).locator('.origam-input, .origam-field').first().evaluate(() => {
        const rect = (el: Element) => {
            const b = el.getBoundingClientRect()
            return { x0: b.left, y0: b.top, x1: b.right, y1: b.bottom }
        }
        type R = { x0: number, y0: number, x1: number, y1: number }
        const overlap = (a: R | null, b: R) => {
            if (!a) return 0
            const w = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)
            const h = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0)
            return (w > 0 && h > 0) ? w * h : 0
        }
        const bands = (el: Element | null): R[] => {
            if (!el) return []
            const s = getComputedStyle(el)
            const r = rect(el)
            const out: R[] = []
            const sides: Array<[string, string, string]> = [
                ['top', 'borderTopWidth', 'borderTopStyle'],
                ['bottom', 'borderBottomWidth', 'borderBottomStyle'],
                ['left', 'borderLeftWidth', 'borderLeftStyle'],
                ['right', 'borderRightWidth', 'borderRightStyle'],
            ]
            for (const [side, wKey, sKey] of sides) {
                const w = parseFloat((s as unknown as Record<string, string>)[wKey]) || 0
                const style = (s as unknown as Record<string, string>)[sKey]
                if (w <= 0 || style === 'none' || style === 'hidden') continue
                if (side === 'top') out.push({ x0: r.x0, y0: r.y0, x1: r.x1, y1: r.y0 + w })
                if (side === 'bottom') out.push({ x0: r.x0, y0: r.y1 - w, x1: r.x1, y1: r.y1 })
                if (side === 'left') out.push({ x0: r.x0, y0: r.y0, x1: r.x0 + w, y1: r.y1 })
                if (side === 'right') out.push({ x0: r.x1 - w, y0: r.y0, x1: r.x1, y1: r.y1 })
            }
            return out
        }

        const notch = document.querySelector('.origam-field__outline--notch')
        const label = notch?.querySelector('.origam-label, .origam-field__label') ?? null
        const labelRect = label ? rect(label) : null

        const sources = [
            document.querySelector('.origam-input'),
            document.querySelector('.origam-field'),
            document.querySelector('.origam-field__outline--start'),
            notch,
            document.querySelector('.origam-field__outline--end'),
        ]

        let total = 0
        for (const el of sources) for (const band of bands(el)) total += overlap(labelRect, band)
        return { area: +total.toFixed(2), labelFound: !!label }
    })

const cssOf = (page: Page, selector: string, property: string) =>
    sandboxOf(page).locator(selector).first().evaluate(
        (el, prop) => getComputedStyle(el).getPropertyValue(prop),
        property,
    )

test.describe('#726 — border feeds the field notch, not the input root', () => {
    test.setTimeout(60000)

    test('TextField: border="thick" never crosses the floating label', async ({ page }) => {
        await open(page, TEXTFIELD, 0)
        await floatLabel(page)

        // Baseline: no border prop, label already uncrossed.
        const baseline = await labelCrossingArea(page)
        expect(baseline.labelFound).toBe(true)
        expect(baseline.area).toBe(0)

        await selectHstOption(page, 'Border', BORDER_THICK)
        await floatLabel(page)

        const withBorder = await labelCrossingArea(page)
        expect(withBorder.labelFound).toBe(true)
        // Pre-fix this was 61.41 px² — the input root's 2px top border.
        expect(withBorder.area).toBe(0)

        // The border left the OUTER input root entirely...
        expect(await cssOf(page, '.origam-input', 'border-top-width')).toBe('0px')
        // ...and landed on the outline leg instead (1px default → 2px).
        expect(await cssOf(page, '.origam-field__outline--start', 'border-top-width')).toBe('2px')
        // The notch stays OPEN while the label floats — that is the mechanism.
        expect(await cssOf(page, '.origam-field__outline--notch', 'border-top-width')).toBe('0px')
    })

    test('Select: uncrossed by default AND with border="thick"', async ({ page }) => {
        await open(page, SELECT, 0)
        await floatLabel(page)

        // OrigamSelect declares `border: true` as its own default, so pre-fix
        // EVERY Select shipped with its label cut (35.59 px²) — no user prop.
        const byDefault = await labelCrossingArea(page)
        expect(byDefault.labelFound).toBe(true)
        expect(byDefault.area).toBe(0)
        expect(await cssOf(page, '.origam-input', 'border-top-width')).toBe('0px')

        await selectHstOption(page, 'Border', BORDER_THICK)
        await floatLabel(page)

        const withBorder = await labelCrossingArea(page)
        expect(withBorder.area).toBe(0)           // pre-fix: 71.19 px²
        expect(await cssOf(page, '.origam-input', 'border-top-width')).toBe('0px')
        expect(await cssOf(page, '.origam-field__outline--start', 'border-top-width')).toBe('2px')
    })

    test('Field WITHOUT a label still paints its outline (no regression)', async ({ page }) => {
        await open(page, FIELD, 0)
        await selectHstOption(page, 'Border', BORDER_THICK)
        await page.waitForTimeout(400)

        // Clear the label → the "no label" case the fix must not break.
        await page.getByRole('textbox', { name: 'Label', exact: true }).fill('')
        await page.waitForTimeout(600)

        const field = sandboxOf(page).locator('.origam-field').first()
        await expect(field).toHaveClass(/origam-field--no-label/)

        // The outline is still drawn, at the requested width, all the way round.
        expect(await cssOf(page, '.origam-field__outline--start', 'border-top-width')).toBe('2px')
        expect(await cssOf(page, '.origam-field__outline--end', 'border-top-width')).toBe('2px')
        expect(await cssOf(page, '.origam-field__outline--end', 'border-bottom-width')).toBe('2px')

        // With no label the notch collapses to zero width, so the outline reads
        // as one continuous line rather than a rectangle with a hole in it.
        const notchWidth = await sandboxOf(page).locator('.origam-field__outline--notch').first()
            .evaluate(el => el.getBoundingClientRect().width)
        expect(notchWidth).toBe(0)
    })

    test('Switch: a field-less OrigamInput keeps its own root border (no regression)', async ({ page }) => {
        await open(page, SWITCH, 0)

        expect(await cssOf(page, '.origam-input', 'border-top-width')).toBe('0px')

        await selectHstOption(page, 'Border', BORDER_THICK)
        await page.waitForTimeout(500)

        // No field here, so nothing was re-routed: useBorder still paints the
        // input root, exactly as before #726.
        const hasField = await sandboxOf(page).locator('.origam-input').first()
            .evaluate(() => !!document.querySelector('.origam-field'))
        expect(hasField).toBe(false)
        expect(await cssOf(page, '.origam-input', 'border-top-width')).toBe('2px')
        expect(await cssOf(page, '.origam-input', 'border-top-style')).toBe('solid')
    })
})
