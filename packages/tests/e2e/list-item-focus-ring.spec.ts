import { expect, test, type Page } from '@playwright/test'

/**
 * SPEC — OrigamListItem : anneau :focus-visible (#1358)
 * Mesures en navigateur réel (jsdom ne résout pas var()). Focus au clavier (Tab).
 * Le mode est posé par `addInitScript` AVANT le rendu (muter data-mode sur un
 * élément déjà rendu dans l'iframe __sandbox ne recalcule pas), puis relu dans
 * le même evaluate que la couleur : le test échoue si le mode lu != demandé.
 * Histoire pose data-theme=light : on pose aussi data-theme, sinon l'axe marque (clair) gagne.
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

async function measure (page: Page, mode: 'light' | 'dark') {
    await page.addInitScript((m) => {
        const set = () => { document.documentElement?.setAttribute('data-mode', m); document.documentElement?.setAttribute('data-theme', m) }
        set()
        document.addEventListener('DOMContentLoaded', set)
    }, mode)
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    const row = page.frameLocator('iframe[src*="__sandbox"]').locator('.origam-list-item--link').first()
    await expect(row).toBeVisible({ timeout: 12000 })
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
        return { modeRead: el.ownerDocument.documentElement.dataset.mode, themeRead: el.ownerDocument.documentElement.dataset.theme, focused: el.ownerDocument.activeElement === el, width: cs.outlineWidth, style: cs.outlineStyle, color: cs.outlineColor, bg }
    })
    if (r.modeRead !== mode || r.themeRead !== mode) throw new Error(`CONTAMINE — demandé ${mode}, lu ${r.modeRead}/${r.themeRead}`)
    const surface = r.bg ? rgb(r.bg) : (mode === 'dark' ? [10, 10, 10] : [255, 255, 255])
    return { ...r, ratio: ratio(rgb(r.color), surface) }
}

test('ListItem link : anneau de focus visible, >= 3:1, et distinct clair/sombre', async ({ browser }) => {
    test.setTimeout(90000)
    const out: Record<string, Awaited<ReturnType<typeof measure>>> = {}
    for (const mode of ['light', 'dark'] as const) {
        const ctx = await browser.newContext()
        out[mode] = await measure(await ctx.newPage(), mode)
        await ctx.close()
    }
    console.log(JSON.stringify(out))
    for (const mode of ['light', 'dark'] as const) {
        const r = out[mode]
        expect(r.focused, JSON.stringify(r)).toBe(true)
        expect(r.style, JSON.stringify(r)).toBe('solid')
        expect(parseFloat(r.width)).toBeGreaterThanOrEqual(2)
        expect(r.ratio, `${mode} ${JSON.stringify(r)}`).toBeGreaterThanOrEqual(3)
    }
    expect(out.light.color, 'le test ne discrimine pas clair/sombre').not.toBe(out.dark.color)
})
