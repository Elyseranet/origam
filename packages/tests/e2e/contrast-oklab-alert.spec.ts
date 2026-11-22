import { expect, test } from '@playwright/test'

/**
 * #1131 — v-contrast ne doit jamais forcer #000/#fff parce qu'un fond d'origam-alert est
 * calcule en oklab() (transition 1e-05s sous reduced-motion, hydratation).
 * Releve chaque frame le backgroundColor calcule de l'alerte des le chargement, puis
 * verifie l'etat final : pas de couleur forcee quand le ratio texte/fond atteint le seuil.
 * Temoin : l'oklab() transitoire n'a PAS ete observe (4 Variants), cette spec n'est donc pas rouge sur le parent.
 */
const STORY_ID = 'components-stories-alert-origamalert-story-vue'
for (const idx of [0, 1, 2, 13]) test(`Alert variant ${idx} sous reduced-motion : aucune couleur forcee a tort (#1131)`, async ({ page }) => {
    const url = `/stories/story/${STORY_ID}?variantId=${STORY_ID}-${idx}`
    test.setTimeout(60000)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.addInitScript(() => {
        const w = window as unknown as { __bg: string[] }
        w.__bg = []
        const tick = () => {
            const el = document.querySelector('.origam-alert')
            if (el) {
                const bg = getComputedStyle(el).backgroundColor
                if (w.__bg[w.__bg.length - 1] !== bg) w.__bg.push(bg)
            }
            requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
    })
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    const frame = page.frameLocator('iframe[src*="__sandbox"]')
    const alert = frame.locator('.origam-alert').first()
    await expect(alert).toBeVisible({ timeout: 20000 })
    await page.waitForTimeout(1500)

    const r = await alert.evaluate((el) => {
        const lum = (rgb: string) => {
            const [r, g, b] = (rgb.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number).map(c => {
                const s = c / 255
                return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
            })
            return 0.2126 * r + 0.7152 * g + 0.0722 * b
        }
        const body = (el.querySelector('.origam-alert__body') as HTMLElement | null) ?? (el as HTMLElement)
        const fg = getComputedStyle(body).color
        const bg = getComputedStyle(el).backgroundColor
        const [a, b] = [lum(fg), lum(bg)]
        return {
            seen: (window as unknown as { __bg: string[] }).__bg,
            bg, fg,
            ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
            fixed: (el as HTMLElement).dataset.origamContrastFixed ?? null,
            inlineColor: (el as HTMLElement).style.getPropertyPriority('color')
        }
    })
    console.log(JSON.stringify(r))
    if (r.ratio >= 4.5) expect(r.fixed).toBeNull()
})
