import { expect, test } from '@playwright/test'

/**
 * SPEC — OrigamListItem : anneau :focus-visible (#1358)
 * Mesures en navigateur réel (jsdom ne résout pas var()). Focus au clavier (Tab).
 * Le mode est posé sur le document de l'iframe sandbox puis relu en deux temps
 * (recalcul de style avant lecture).
 */
const STORY_ID = 'components-stories-list-origamlistitem-story-vue'
const url = `/stories/story/${STORY_ID}?variantId=${STORY_ID}-4`

const lum = (c: number[]) => {
    const f = c.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 })
    return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2]
}
const ratio = (a: number[], b: number[]) => {
    const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m)
    return (x + 0.05) / (y + 0.05)
}
const rgb = (s: string) => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number)

for (const mode of ['light', 'dark'] as const) {
    test(`ListItem link : anneau de focus visible, contraste >= 3:1 (${mode})`, async ({ page }) => {
        test.setTimeout(45000)
        await page.goto(url, { waitUntil: 'domcontentloaded' })
        const frame = page.frameLocator('iframe[src*="__sandbox"]')
        const row = frame.locator('.origam-list-item--link').first()
        await expect(row).toBeVisible({ timeout: 12000 })
        await row.evaluate((el, m) => el.ownerDocument.documentElement.setAttribute('data-mode', m), mode)
        await page.keyboard.press('Tab')
        await row.focus()
        await page.keyboard.press('Shift+Tab')
        await page.keyboard.press('Tab')
        const r = await row.evaluate((el) => {
            const cs = getComputedStyle(el)
            let bg = ''
            for (let n: Element | null = el; n; n = n.parentElement) {
                const c = getComputedStyle(n).backgroundColor
                if (!/, 0\)$/.test(c) && c !== 'transparent') { bg = c; break }
            }
            return { focused: el.ownerDocument.activeElement === el, width: cs.outlineWidth, style: cs.outlineStyle, color: cs.outlineColor, bg }
        })
        expect(r.focused, JSON.stringify(r)).toBe(true)
        expect(r.style, JSON.stringify(r)).toBe('solid')
        expect(parseFloat(r.width)).toBeGreaterThanOrEqual(2)
        const bg = r.bg ? rgb(r.bg) : (mode === 'dark' ? [10, 10, 10] : [255, 255, 255])
        expect(ratio(rgb(r.color), bg), JSON.stringify(r)).toBeGreaterThanOrEqual(3)
    })
}
