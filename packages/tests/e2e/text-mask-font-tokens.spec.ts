import { expect, test, type Page } from '@playwright/test'

/**
 * OrigamTextMask — VAGUE 3, critere C2 annonce « bloquant ».
 *
 * LE CONSTAT A VERIFIER (classeur, VAGUE3-majeurs.md) :
 *   « font-size/font-weight/line-height n'ont AUCUNE valeur resolue
 *     (ni le var principal ni son fallback -default ne sont dans le CSS
 *     genere), alors que le composant en depend pour son rendu par
 *     defaut. Pas teste par le e2e existant. »
 *
 * Le SCSS lit (OrigamTextMask.vue:141-144) :
 *   font-size:   var(--origam-text-mask---font-size,   var(--origam-text-mask---font-size-default));
 *   font-weight: var(--origam-text-mask---font-weight, var(--origam-text-mask---font-weight-default));
 *   line-height: var(--origam-text-mask---line-height, var(--origam-text-mask---line-height-default));
 *
 * Comptage sur disque des declarations (`grep -c`) :
 *   font-size            light=0 dark=0   ← le var PRINCIPAL n'est pas declare
 *   font-size-default    light=1 dark=2   ← le FALLBACK, lui, l'est
 *   (idem font-weight / line-height)
 *
 * Le principal absent est le patron « crochet d'extension » : c'est ce qui
 * rend le fallback ATTEIGNABLE. Le constat semble donc faux sur sa seconde
 * moitie. Mais `getComputedStyle` sous jsdom ne resout jamais `var()` (il
 * fabrique 16px), donc seul un vrai navigateur peut trancher — d'ou ce
 * spec plutot qu'un TU.
 *
 * ⛔ VALEURS ABSOLUES, pas un ecart : on verifie que la police RESOLUE vaut
 * ce que le token -default annonce, pas qu'elle « differe » de quelque
 * chose. Un test qui compare deux valeurs entre elles serait vert meme si
 * les deux etaient la valeur de repli fabriquee par le navigateur.
 */

const STORY = '/stories/story/components-stories-textmask-origamtextmask-story-vue'

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, variant: string) => {
    await page.goto(STORY)
    await page.waitForLoadState('networkidle')
    await page.getByText(variant, { exact: true }).first().click()
    await page.waitForTimeout(800)
}

test.describe('OrigamTextMask — la police par defaut est reellement resolue (C2)', () => {
    test('font-size / font-weight / line-height ont une valeur calculee non vide', async ({ page }) => {
        await openVariant(page, 'Design')

        const mask = sandboxOf(page).locator('[data-cy="origam-text-mask"]').first()
        await expect(mask).toBeVisible({ timeout: 5000 })

        const measured = await mask.evaluate((el) => {
            const cs = getComputedStyle(el)

            return {
                fontSize: cs.fontSize,
                fontWeight: cs.fontWeight,
                lineHeight: cs.lineHeight,
                // Les tokens eux-memes, lus sur l'element : c'est ce qui
                // distingue « le composant ne lit pas le token » de
                // « le token n'existe pas ».
                sizeDefault: cs.getPropertyValue('--origam-text-mask---font-size-default').trim(),
                weightDefault: cs.getPropertyValue('--origam-text-mask---font-weight-default').trim(),
                heightDefault: cs.getPropertyValue('--origam-text-mask---line-height-default').trim(),
                // Le var PRINCIPAL : vide quand le consommateur ne passe pas
                // la prop (le fallback -default prend alors la main), rempli
                // quand il la passe.
                weightPrincipal: cs.getPropertyValue('--origam-text-mask---font-weight').trim(),
                // Le token est ecrit en `rem`, la valeur calculee ressort en
                // `px` : on convertit avec la taille racine REELLE plutot que
                // de supposer 16px.
                rootFontSize: getComputedStyle(el.ownerDocument.documentElement).fontSize
            }
        })

        // 1. Les tokens -default existent bel et bien dans la feuille servie.
        expect(measured.sizeDefault, '--origam-text-mask---font-size-default doit etre declare').not.toBe('')
        expect(measured.weightDefault, '--origam-text-mask---font-weight-default doit etre declare').not.toBe('')
        expect(measured.heightDefault, '--origam-text-mask---line-height-default doit etre declare').not.toBe('')

        // 2. La propriete consommatrice resout bien vers ce token — valeur
        //    ABSOLUE, comparee au token lu sur le meme element, apres
        //    conversion rem -> px.
        //    Mesure reelle : token = "2.25rem", calcule = "36px", racine =
        //    "16px" — 2.25 x 16 = 36. Le canal resout donc correctement, et
        //    c'est ce que la premiere version de ce test avait pris pour un
        //    defaut en comparant "36px" a "2.25rem" tels quels.
        const rootPx = Number.parseFloat(measured.rootFontSize)
        const expectedPx = measured.sizeDefault.endsWith('rem')
            ? Number.parseFloat(measured.sizeDefault) * rootPx
            : Number.parseFloat(measured.sizeDefault)

        expect(Number.parseFloat(measured.fontSize)).toBeCloseTo(expectedPx, 2)

        // font-weight : la Variant « Design » de la story passe
        // `fontWeight: 'black'` (OrigamTextMask.story.vue:12), qui remplit le
        // var PRINCIPAL. Le poids rendu doit donc suivre le principal (900),
        // PAS le -default (700). Asserter l'egalite avec le -default ici
        // serait un faux defaut fabrique par la story — le piege « c'est la
        // STORY qui fabrique le bug » signale par le brief.
        const expectedWeight = measured.weightPrincipal || measured.weightDefault
        expect(measured.fontWeight).toBe(expectedWeight)

        // 3. Et surtout : rien n'est vide ni « normal » par abandon.
        expect(measured.fontSize).not.toBe('')
        expect(measured.lineHeight).not.toBe('')
        expect(Number.parseFloat(measured.fontSize)).toBeGreaterThan(0)
    })

    test('surcharger le token -default deplace reellement le rendu', async ({ page }) => {
        await openVariant(page, 'Design')

        const mask = sandboxOf(page).locator('[data-cy="origam-text-mask"]').first()
        await expect(mask).toBeVisible({ timeout: 5000 })

        const before = await mask.evaluate((el) => getComputedStyle(el).fontSize)

        // Preuve par MUTATION que le canal est vivant : si le composant
        // n'ecoutait pas ce token, la valeur ne bougerait pas.
        const after = await mask.evaluate((el) => {
            el.style.setProperty('--origam-text-mask---font-size-default', '77px')

            return getComputedStyle(el).fontSize
        })

        expect(after, 'le token -default doit piloter la taille rendue').toBe('77px')
        expect(after).not.toBe(before)
    })
})
