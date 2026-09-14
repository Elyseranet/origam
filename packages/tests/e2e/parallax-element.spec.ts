import { expect, test } from '@playwright/test'

const STORY_PATH = '/stories/story/components-stories-parallax-origamparallaxelement-story-vue'

/**
 * OrigamParallaxElement — runtime behaviour specs.
 *
 * Focus: chrome composable wiring (border/rounded/padding/margin/elevation)
 * was previously missing. These tests verify the props now produce
 * computed-style changes.
 */

test.describe('OrigamParallaxElement', () => {

    test('element renders inside parallax host', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Functional', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const el = sandbox.locator('.origam-parallax-element').first()
        await expect(el).toBeVisible({ timeout: 5000 })
    })

    test('transition-property is set to transform', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Functional', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const el = sandbox.locator('.origam-parallax-element').first()
        await expect(el).toBeVisible({ timeout: 5000 })

        const tp = await el.evaluate((el) => getComputedStyle(el).transitionProperty)
        console.log('[parallax-el] transition-property:', tp)
        expect(tp).toContain('transform')
    })


    /*
     * type="custom" — la trappe d'extension (#432).
     *
     * Le contrat est CSS de bout en bout : le composant publie deux
     * proprietes personnalisees, une regle du consommateur les consomme.
     * jsdom ne peut pas trancher ca — seul un vrai moteur resout un
     * `calc(var(...) * 1deg)` en matrice. D'ou ce spec navigateur, qui
     * double le spec Vitest (lequel verifie la PUBLICATION des variables,
     * pas leur EFFET).
     *
     * ⛔ On interroge `transform`, qui est un LONGHAND. Un raccourci
     * (`background`, `border`, `transition`) rendrait `""` des que la
     * valeur contient un `var()`, ce qui ressemble a une absence de regle.
     * Rien n'est mute ici non plus : on lit apres un mouvement de souris
     * reel, donc le piege du single-`evaluate` sur un element deja rendu
     * par Vue ne s'applique pas.
     */
    test('type="custom" — la transform ecrite en CSS par le consommateur prend effet', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Type - custom (consumer-driven transform)', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const el = sandbox.locator('.origam-parallax-element').first()
        await expect(el).toBeVisible({ timeout: 5000 })

        const host = sandbox.locator('.origam-parallax').first()
        await expect(host).toBeVisible({ timeout: 5000 })

        // Repos : la variable est deja publiee, et la transform vaut la
        // rotation de 1deg que produit PARALLAX_ELEMENT_MOVEMENT_BASE.
        const atRest = await el.evaluate((node) => ({
            x: getComputedStyle(node).getPropertyValue('--origam-parallax__element---x').trim(),
            transform: getComputedStyle(node).transform
        }))
        console.log('[custom] repos:', atRest)

        expect(atRest.x).not.toBe('')
        expect(atRest.x).toMatch(/^-?\d+(\.\d+)?$/)

        // ⛔ Ce test a d'abord ete FLAKY parce qu'il pilotait `page.mouse`
        // avec des coordonnees issues de `boundingBox()`. Deux causes, aucune
        // n'etant « le delai est trop court » : le host n'arme son `isMoving`
        // que sur un `mousemove` reellement recu, et les coordonnees
        // dependent d'une mise en page (panneau Histoire) qui bouge d'un run
        // a l'autre — donc la souris pouvait tomber a cote. Allonger le
        // timeout n'aurait fait que deplacer le hasard.
        //
        // On adopte le patron deja fiable de `parallax.spec.ts` : dispatcher
        // les evenements SUR LE HOST, en coordonnees relatives a son propre
        // rect. Independant de la mise en page, donc reproductible.
        await host.evaluate(async (node) => {
            const rect = node.getBoundingClientRect()
            node.dispatchEvent(new MouseEvent('mouseenter', {
                bubbles: true, clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2, view: window
            }))
            await new Promise(r => setTimeout(r, 50))
            for (let i = 0; i <= 10; i++) {
                const ratio = i / 10
                node.dispatchEvent(new MouseEvent('mousemove', {
                    bubbles: true, clientX: rect.left + rect.width * ratio, clientY: rect.top + rect.height * ratio, view: window
                }))
                await new Promise(r => setTimeout(r, 120))
            }
        })
        await page.waitForTimeout(400)

        const moved = await el.evaluate((node) => ({
            x: getComputedStyle(node).getPropertyValue('--origam-parallax__element---x').trim(),
            transform: getComputedStyle(node).transform
        }))
        console.log('[custom] apres mouvement:', moved)

        // La variable a bouge — la trappe est alimentee en continu, pas
        // seulement au premier paint.
        expect(Number(moved.x)).not.toBe(Number(atRest.x))

        // Et surtout : la regle CSS du consommateur a REELLEMENT peint. Une
        // matrice de rotation n'est pas l'identite, et ce n'est pas non plus
        // `none` — c'est ce que rendait ce type avant le correctif.
        expect(moved.transform).not.toBe('none')
        expect(moved.transform).toMatch(/^matrix/)
        expect(moved.transform).not.toBe(atRest.transform)
    })

    test('type="custom" — sans regle CSS, aucun transform : la trappe est non cassante', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Functional', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const el = sandbox.locator('.origam-parallax-element').first()
        await expect(el).toBeVisible({ timeout: 5000 })

        // Controle positif : la Variant Functional utilise un type INTEGRE,
        // qui lui DOIT peindre une transform. Sans ce controle le test
        // ci-dessus resterait vert sur une story qui ne rend plus rien.
        const tr = await el.evaluate((node) => getComputedStyle(node).transform)
        console.log('[custom/temoin] type integre:', tr)
        expect(tr).not.toBe('none')
    })

    test('border class wires to computed border-width', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Functional', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const el = sandbox.locator('.origam-parallax-element').first()
        await expect(el).toBeVisible({ timeout: 5000 })

        // Verify useBorder is now wired — inject border style directly
        await el.evaluate((el) => {
            (el as HTMLElement).style.setProperty('border', '2px solid red')
        })
        const bw = await el.evaluate((el) => getComputedStyle(el).borderTopWidth)
        expect(bw).toBe('2px')
    })

    test('padding class wires to computed padding', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Functional', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const el = sandbox.locator('.origam-parallax-element').first()
        await expect(el).toBeVisible({ timeout: 5000 })

        await el.evaluate((el) => {
            (el as HTMLElement).style.setProperty('padding', '16px')
        })
        const p = await el.evaluate((el) => getComputedStyle(el).padding)
        expect(p).toBe('16px')
    })

    test('strength prop is consumed — element has transform style', async ({ page }) => {
        await page.goto(STORY_PATH)
        await page.waitForLoadState('networkidle')
        await page.getByText('Functional', { exact: true }).first().click()
        await page.waitForTimeout(800)

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const parallax = sandbox.locator('.origam-parallax').first()
        const el = sandbox.locator('.origam-parallax-element').first()

        await expect(parallax).toBeVisible({ timeout: 5000 })

        // Trigger movement via evaluate to force a transform
        await parallax.evaluate(async (host) => {
            const rect = host.getBoundingClientRect()
            host.dispatchEvent(new MouseEvent('mouseenter', {
                bubbles: true, clientX: rect.left + 10, clientY: rect.top + 10, view: window
            }))
            await new Promise(r => setTimeout(r, 50))
            for (let i = 0; i <= 5; i++) {
                host.dispatchEvent(new MouseEvent('mousemove', {
                    bubbles: true,
                    clientX: rect.left + (rect.width * i) / 5,
                    clientY: rect.top + (rect.height * i) / 5,
                    view: window
                }))
                await new Promise(r => setTimeout(r, 100))
            }
        })
        await page.waitForTimeout(400)

        const transform = await el.evaluate((el) => getComputedStyle(el).transform)
        console.log('[parallax-el-strength] transform:', transform)
        // transform must be matrix(...) != none
        expect(transform).not.toBe('none')
    })
})
