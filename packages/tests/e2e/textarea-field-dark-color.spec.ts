import { expect, test } from '@playwright/test'

/**
 * #1150 — le <textarea> doit suivre la couleur du champ (clair ET sombre),
 * comme l'<input> de OrigamTextField. Le mode est injecte avant le chargement
 * (addInitScript), jamais mute apres rendu.
 */
const STORY = 'components-stories-textareafield-origamtextareafield-story-vue'
const URL = `/stories/story/${STORY}?variantId=${STORY}-2`

const lum = (c: number[]) => {
    const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2])
}
const rgb = (s: string) => (s.match(/[\d.]+/g) ?? []).map(Number)
const contrast = (a: number[], b: number[]) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
    return (hi + 0.05) / (lo + 0.05)
}

for (const mode of ['dark', 'light'] as const) {
    test(`#1150 textarea text contrast >= 4.5 (${mode})`, async ({ page }) => {
        await page.addInitScript((m) => {
            // Histoire's sandbox pins data-theme/data-mode itself: re-assert ours.
            try { localStorage.setItem('origam-mode', m) } catch { /* noop */ }
            const apply = () => {
                const root = document.documentElement
                if (root.getAttribute('data-mode') !== m) root.setAttribute('data-mode', m)
                if (m === 'dark' && root.hasAttribute('data-theme')) root.removeAttribute('data-theme')
            }
            apply()
            setInterval(apply, 5)
        }, mode)
        await page.goto(URL, { waitUntil: 'domcontentloaded' })
        const sb = page.frameLocator('iframe[src*="__sandbox"]')
        const ta = sb.locator('.origam-textarea-field textarea').first()
        await expect(ta).toBeAttached({ timeout: 15000 })
        const m = await ta.evaluate((el) => {
            let bg = 'rgb(255, 255, 255)'
            let n: Element | null = el
            while (n) {
                const b = getComputedStyle(n).backgroundColor
                if (b !== 'rgba(0, 0, 0, 0)' && b !== 'transparent') { bg = b; break }
                n = n.parentElement
            }
            return { color: getComputedStyle(el).color, bg, mode: document.documentElement.getAttribute('data-mode'), theme: document.documentElement.getAttribute('data-theme'), href: location.href }
        })
        console.log(JSON.stringify(m))
        expect(m.mode).toBe(mode)
        expect(contrast(rgb(m.color), rgb(m.bg))).toBeGreaterThanOrEqual(4.5)
    })
}
