import { expect, test } from '@playwright/test'

/**
 * #800 — le plancher de degagement des coins d'`OrigamField` doit etre un
 * CANAL explicite, pas une declaration que le navigateur jette.
 *
 * ⛔ CE QUE CETTE SPEC EPINGLE, ET POURQUOI UN ASSERT SUR LE PADDING NE SUFFIT PAS
 * ---------------------------------------------------------------------------------
 * Avant #800, `OrigamOtpInputField` posait :
 *
 *     --origam-field---padding-start: 0;     // <- SANS UNITE
 *
 * et `OrigamField` lisait ce token comme terme d'un `max()` :
 *
 *     padding-inline: max(var(--…-padding-start), min(var(--…-border-radius), …)) …
 *
 * `0` est un `<number>`, `min(4px, 36px)` une `<length>` : le `max()` est
 * invalide, et la declaration ENTIERE est jetee au computed-value time. Le
 * rendu voulu — zero padding — etait donc obtenu par une ERREUR CSS.
 *
 * ⛔ Un test qui se contenterait d'asserter `padding-inline-start === '0px'`
 * passerait AVANT comme APRES : c'est justement la meme valeur. Il ne prouve
 * rien. La spec interroge donc la VALIDITE de la declaration, pas sa valeur :
 * on force `--origam-field---padding-end` a une valeur temoin AVANT le
 * chargement du document, et on regarde si `padding-inline-end` la suit.
 *
 *   • declaration jetee (avant)  -> `padding-inline-end` ignore le temoin
 *   • declaration valide (apres) -> `padding-inline-end` vaut le temoin
 *
 * A/B mesure (chromium, `E2E_STATIC=1`, port isole) : ROUGE sur le parent,
 * VERT apres.
 *
 * ⚠️ Le temoin est injecte par `addInitScript`, pas par une mutation apres
 * rendu : dans l'iframe `__sandbox` de Histoire, un element deja rendu par Vue
 * ne recalcule pas toujours apres une ecriture inline, et la sonde mesurerait
 * la valeur perimee (cf. CLAUDE.md, « troisieme qualification »).
 *
 * ⚠️ Le second test verifie la consequence VISIBLE de la reparation naive
 * qu'on a ecartee : mettre l'unite SANS neutraliser le plancher donne
 * `padding-inline: 4px 0px` sur une cellule OTP, donc un chiffre decentre de
 * 2px (mesure Chromium). La neutralisation explicite
 * (`--origam-field---corner-clearance: 0px`) garde le rendu au pixel pres.
 */

const OTP_STORY = 'components-stories-otpinputfield-origamotpinputfield-story-vue'
const OTP_URL = `/stories/story/${OTP_STORY}?variantId=${OTP_STORY}-0`

const WITNESS = '7px'

test.describe('#800 — plancher de degagement des coins', () => {
    test('la declaration `padding-inline` d\'une cellule OTP est VALIDE, pas jetee', async ({ page }) => {
        await page.addInitScript((witness) => {
            const inject = () => {
                const style = document.createElement('style')
                style.textContent = `.origam-otp-input-field .origam-field { --origam-field---padding-end: ${witness} !important; }`
                document.head.appendChild(style)
            }
            if (document.head) inject()
            else document.addEventListener('DOMContentLoaded', inject, { once: true })
        }, WITNESS)

        await page.goto(OTP_URL)

        const field = page.frameLocator('iframe[src*="__sandbox"]').locator('.origam-field').first()
        await expect(field).toBeVisible()

        // Si le `max()` etait invalide, TOUTE la declaration `padding-inline`
        // serait jetee et le temoin n'atteindrait jamais le rendu.
        await expect(field).toHaveCSS('padding-inline-end', WITNESS)
    })

    test('le chiffre d\'une cellule OTP reste centre (pas de plancher de 4px)', async ({ page }) => {
        await page.goto(OTP_URL)

        const frame = page.frameLocator('iframe[src*="__sandbox"]')
        const field = frame.locator('.origam-field').first()
        await expect(field).toBeVisible()

        // Le plancher ne doit PAS s'appliquer : une cellule OTP centre son
        // chiffre et n'a ni etiquette ni texte colle au bord.
        await expect(field).toHaveCSS('padding-inline-start', '0px')
        await expect(field).toHaveCSS('padding-inline-end', '0px')
    })
})
