import { expect, FrameLocator, test } from '@playwright/test'

/**
 * OrigamDialog — suite e2e calée sur la story réelle.
 *
 * ## STORY_ID & Variants (0-based index)
 *
 *   STORY_ID = 'components-stories-dialog-origamdialog-story-vue'
 *   Navigation : ?variantId=<STORY_ID>-<index>
 *
 *   Index → Titre
 *     0  → Design                  v-model=designOpen, bgColor=surface, size=default
 *     1  → Functional              v-model=functionalOpen, fullscreen/scrollable/persistent/…
 *     2  → Events - update:modelValue   @update:model-value
 *     3  → Events - isRead              @is-read
 *     4  → Events - click:outside       @click:outside
 *     5  → Slots - Activator            #activator custom btn
 *     6  → Slots - Asset                #asset icon
 *     7  → Slots - Content              #content
 *     8  → Slots - Default              #default
 *     9  → Slots - Footer               #footer (Cancel + Confirm buttons)
 *    10  → Slots - Header               #header custom
 *    11  → Slots - Header Append        #header-append icon
 *    12  → Slots - Header Content       #header-content
 *    13  → Slots - Header Prepend       #header-prepend icon
 *    14  → Slots - Header Subtitle      #header-subtitle
 *    15  → Slots - Header Title         #header-title
 *    16  → Slots - Loader               #loader
 *    17  → Slots - Text                 #text
 *    18  → Default (playground)         v-model=playgroundOpen
 *
 * ## DOM / téléport
 *
 *   OrigamDialog délègue à OrigamOverlay qui téléporte son contenu vers
 *   `document.body`. Dans le contexte Histoire (sandbox iframe), `document.body`
 *   est le body DE L'IFRAME — tout le contenu reste donc accessible via
 *   `page.frameLocator('iframe[src*="__sandbox"]')`.
 *
 *   AVANT ouverture : `.origam-dialog` n'est pas dans le DOM (`isMounted &&
 *   hasContent` false — composant lazy).
 *
 *   APRÈS ouverture au clic de l'activateur :
 *   - Root overlay  → `.origam-overlay.origam-dialog.origam-overlay--active`
 *     (le root cumulé porte TOUTES les classes BEM).
 *   - Contenu modal → `.origam-overlay__content` (div téléportée, `v-show`).
 *   - Card interne  → `.origam-card` dans `.origam-overlay__content`.
 *   - `role="dialog"` + `aria-modal="true"` sur `.origam-card`.
 *   - En-tête       → `.origam-card-header`.
 *
 * ## ARIA activateur
 *
 *   - `aria-haspopup="dialog"` — posé avant l'ouverture (dans `activatorProps`).
 *   - `aria-expanded="false"` → `"true"` au clic.
 *
 * ## Mécanismes de fermeture
 *
 *   1. Bouton "Close" interne — `.origam-btn` dont le texte contient "Close".
 *   2. Touche Escape — gérée par l'overlay (non-persistent uniquement).
 *   3. Clic en dehors — `v-click-outside` sur `.origam-overlay__content`,
 *      fire `handleClickOutside` → `isActive = false` (non-persistent).
 *
 * ## Timeouts
 *
 *   Histoire applique `.htw-sandbox-hidden` (display:none) à la sandbox pendant
 *   le chargement initial. Le premier test sur une "cold" story peut prendre
 *   25-30 s avant que le rendu soit révélé — d'où le timeout de 35 s sur
 *   `expect(activator).toBeVisible`. Les tests suivants (cache chaud) sont
 *   bien en-dessous.
 */

const STORY_ID   = 'components-stories-dialog-origamdialog-story-vue'
// Root-relative path (resolves against baseURL). The previous absolute form
// doubled the `/stories/` segment → 404 → the sandbox never rendered.
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

/**
 * Ouvre le dialog dans la sandbox et attend que le contenu soit visible.
 * Retourne les locators { activator, overlayContent }.
 */
const openDialog = async (_page: import('@playwright/test').Page, sandbox: FrameLocator) => {
	const activator = sandbox.locator('.origam-btn').first()
	await expect(activator).toBeVisible({ timeout: 35000 })
	await activator.click()
	const overlayContent = sandbox.locator('.origam-overlay__content')
	await expect(overlayContent).toBeVisible({ timeout: 12000 })
	return { activator, overlayContent }
}

test.describe('OrigamDialog', () => {
	test.setTimeout(60000)

	// ------------------------------------------------------------------ //
	// DESIGN (index 0)                                                     //
	// init: title=Dialog, bgColor=surface, size=default                   //
	// ------------------------------------------------------------------ //

	test.describe('Design (index 0)', () => {
		test('activateur .origam-btn est visible dans la sandbox', async ({ page }) => {
			await page.goto(variantUrl(0))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			await expect(sandbox.locator('.origam-btn').first()).toBeVisible({ timeout: 35000 })
		})

		test('aria-haspopup="dialog" est posé sur l activateur avant ouverture', async ({ page }) => {
			await page.goto(variantUrl(0))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const activator = sandbox.locator('.origam-btn').first()
			await expect(activator).toBeVisible({ timeout: 35000 })
			const ariaHaspopup = await activator.evaluate(el => el.getAttribute('aria-haspopup'))
			expect(ariaHaspopup).toBe('dialog')
		})

		test('aria-expanded passe de false a true au clic de l activateur', async ({ page }) => {
			await page.goto(variantUrl(0))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const { activator } = await openDialog(page, sandbox)
			const ariaExpanded = await activator.evaluate(el => el.getAttribute('aria-expanded'))
			expect(ariaExpanded).toBe('true')
		})

		test('le contenu .origam-overlay__content apparait au clic', async ({ page }) => {
			await page.goto(variantUrl(0))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const { overlayContent } = await openDialog(page, sandbox)
			await expect(overlayContent).toBeVisible()
		})

		test('la card interne porte role="dialog" et aria-modal="true"', async ({ page }) => {
			await page.goto(variantUrl(0))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			await openDialog(page, sandbox)
			const card = sandbox.locator('[role="dialog"]')
			await expect(card).toBeVisible({ timeout: 5000 })
			const ariaModal = await card.evaluate(el => el.getAttribute('aria-modal'))
			expect(ariaModal).toBe('true')
		})

		test('le root overlay porte la classe origam-dialog apres ouverture', async ({ page }) => {
			await page.goto(variantUrl(0))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			await openDialog(page, sandbox)
			const dialogRoot = sandbox.locator('.origam-dialog')
			await expect(dialogRoot).toBeAttached()
			await expect(dialogRoot).toHaveClass(/origam-overlay--active/)
		})

		test('fermeture via le bouton Close — dialog dispara t apres clic', async ({ page }) => {
			await page.goto(variantUrl(0))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const { overlayContent } = await openDialog(page, sandbox)

			const closeBtn = sandbox.locator('.origam-btn').filter({ hasText: 'Close' }).first()
			await expect(closeBtn).toBeVisible({ timeout: 5000 })
			await closeBtn.click()
			await expect(overlayContent).not.toBeVisible({ timeout: 5000 })
		})

		test('fermeture via clic en dehors — dialog dispara t apres click outside', async ({ page }) => {
			await page.goto(variantUrl(0))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const { overlayContent } = await openDialog(page, sandbox)

			// Clic sur le body de l'iframe en dehors du contenu du dialog
			const sandboxFrame = page.frames().find(f => f.url().includes('__sandbox'))
			if (!sandboxFrame) throw new Error('sandbox frame not found')
			await sandboxFrame.click('body', { position: { x: 10, y: 10 } })
			await expect(overlayContent).not.toBeVisible({ timeout: 5000 })
		})
	})

	// ------------------------------------------------------------------ //
	// FUNCTIONAL (index 1)                                                 //
	// init: fullscreen=false, scrollable=false, retainFocus=true,         //
	//       persistent=false, disabled=false                               //
	// ------------------------------------------------------------------ //

	test.describe('Functional (index 1)', () => {
		test('le dialog s ouvre au clic sur l activateur', async ({ page }) => {
			await page.goto(variantUrl(1))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const { overlayContent } = await openDialog(page, sandbox)
			await expect(overlayContent).toBeVisible()
		})

		test('le titre du dialog est presente dans le card-header', async ({ page }) => {
			await page.goto(variantUrl(1))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			await openDialog(page, sandbox)
			const header = sandbox.locator('.origam-card-header')
			await expect(header).toBeVisible({ timeout: 5000 })
			await expect(header).toContainText('Functional dialog')
		})

		test('fermeture via Escape — dialog dispara t apres la touche Escape', async ({ page }) => {
			await page.goto(variantUrl(1))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const { overlayContent } = await openDialog(page, sandbox)
			await page.keyboard.press('Escape')
			await expect(overlayContent).not.toBeVisible({ timeout: 5000 })
		})

		test('le contenu liste 8 lignes via la prop Content slot', async ({ page }) => {
			await page.goto(variantUrl(1))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			await openDialog(page, sandbox)
			// La variant Functional contient : <p v-for="n in 8">Line {{ n }} of content.</p>
			await expect(sandbox.locator('.origam-overlay__content')).toContainText('Line 1 of content.')
			await expect(sandbox.locator('.origam-overlay__content')).toContainText('Line 8 of content.')
		})
	})

	// ------------------------------------------------------------------ //
	// EVENTS - update:modelValue (index 2)                                 //
	// ------------------------------------------------------------------ //

	test.describe('Events - update:modelValue (index 2)', () => {
		test('activateur porte aria-haspopup="dialog" et texte descriptif', async ({ page }) => {
			await page.goto(variantUrl(2))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const activator = sandbox.locator('.origam-btn').first()
			await expect(activator).toBeVisible({ timeout: 35000 })
			const ariaHaspopup = await activator.evaluate(el => el.getAttribute('aria-haspopup'))
			expect(ariaHaspopup).toBe('dialog')
			await expect(activator).toContainText('Toggle')
		})

		test('aria-expanded reflate l etat du dialog (proxy de l emit update:modelValue)', async ({ page }) => {
			await page.goto(variantUrl(2))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const activator = sandbox.locator('.origam-btn').first()
			await expect(activator).toBeVisible({ timeout: 35000 })

			const expandedBefore = await activator.evaluate(el => el.getAttribute('aria-expanded'))
			expect(expandedBefore).toBe('false')

			await activator.click()
			await expect(sandbox.locator('.origam-overlay__content')).toBeVisible({ timeout: 12000 })
			const expandedAfter = await activator.evaluate(el => el.getAttribute('aria-expanded'))
			expect(expandedAfter).toBe('true')
		})
	})

	// ------------------------------------------------------------------ //
	// EVENTS - isRead (index 3)                                            //
	// ------------------------------------------------------------------ //

	test.describe('Events - isRead (index 3)', () => {
		test('activateur visible et dialog s ouvre', async ({ page }) => {
			await page.goto(variantUrl(3))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const { overlayContent } = await openDialog(page, sandbox)
			await expect(overlayContent).toBeVisible()
		})
	})

	// ------------------------------------------------------------------ //
	// EVENTS - click:outside (index 4)                                     //
	// ------------------------------------------------------------------ //

	test.describe('Events - click:outside (index 4)', () => {
		test('activateur visible et dialog s ouvre', async ({ page }) => {
			await page.goto(variantUrl(4))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const { overlayContent } = await openDialog(page, sandbox)
			await expect(overlayContent).toBeVisible()
		})

		test('clic en dehors ferme le dialog non-persistent', async ({ page }) => {
			await page.goto(variantUrl(4))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const { overlayContent } = await openDialog(page, sandbox)

			const sandboxFrame = page.frames().find(f => f.url().includes('__sandbox'))
			if (!sandboxFrame) throw new Error('sandbox frame not found')
			await sandboxFrame.click('body', { position: { x: 10, y: 10 } })
			await expect(overlayContent).not.toBeVisible({ timeout: 5000 })
		})
	})

	// ------------------------------------------------------------------ //
	// SLOTS - ACTIVATOR (index 5)                                          //
	// #activator: origam-btn text="Open (custom activator)"               //
	// ------------------------------------------------------------------ //

	test.describe('Slots - Activator (index 5)', () => {
		test('le slot #activator rend un bouton personnalise', async ({ page }) => {
			await page.goto(variantUrl(5))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const btn = sandbox.locator('.origam-btn').first()
			await expect(btn).toBeVisible({ timeout: 35000 })
			await expect(btn).toContainText('Open (custom activator)')
		})

		test('le dialog s ouvre depuis le slot activateur custom', async ({ page }) => {
			await page.goto(variantUrl(5))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const { overlayContent } = await openDialog(page, sandbox)
			await expect(overlayContent).toBeVisible()
		})
	})

	// ------------------------------------------------------------------ //
	// SLOTS - ASSET (index 6)                                              //
	// #asset: origam-icon star size=48                                     //
	// ------------------------------------------------------------------ //

	test.describe('Slots - Asset (index 6)', () => {
		test('le dialog s ouvre et l icone asset est presente', async ({ page }) => {
			await page.goto(variantUrl(6))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const { overlayContent } = await openDialog(page, sandbox)
			await expect(overlayContent).toBeVisible()
			// Le slot #asset contient origam-icon qui produit un <svg> ou <i>
			const icon = overlayContent.locator('.origam-icon, svg, i').first()
			await expect(icon).toBeAttached()
		})
	})

	// ------------------------------------------------------------------ //
	// SLOTS - CONTENT (index 7)                                            //
	// #content: <span>Custom content slot.</span>                          //
	// ------------------------------------------------------------------ //

	test.describe('Slots - Content (index 7)', () => {
		test('le slot #content rend du contenu personnalise', async ({ page }) => {
			await page.goto(variantUrl(7))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const { overlayContent } = await openDialog(page, sandbox)
			await expect(overlayContent).toContainText('Custom content slot.')
		})
	})

	// ------------------------------------------------------------------ //
	// SLOTS - DEFAULT (index 8)                                            //
	// #default: <span>Custom default slot content.</span>                  //
	// ------------------------------------------------------------------ //

	test.describe('Slots - Default (index 8)', () => {
		test('le slot #default rend du contenu directement dans l overlay', async ({ page }) => {
			await page.goto(variantUrl(8))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const { overlayContent } = await openDialog(page, sandbox)
			await expect(overlayContent).toContainText('Custom default slot content.')
		})
	})

	// ------------------------------------------------------------------ //
	// SLOTS - FOOTER (index 9)                                             //
	// #footer: Cancel + Confirm buttons                                    //
	// ------------------------------------------------------------------ //

	test.describe('Slots - Footer (index 9)', () => {
		test('le slot #footer rend deux boutons (Cancel + Confirm)', async ({ page }) => {
			await page.goto(variantUrl(9))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const { overlayContent } = await openDialog(page, sandbox)
			// La variant footer expose deux boutons Cancel + Confirm
			await expect(overlayContent).toContainText('Cancel')
			await expect(overlayContent).toContainText('Confirm')
		})

		test('Cancel ferme le dialog', async ({ page }) => {
			await page.goto(variantUrl(9))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const { overlayContent } = await openDialog(page, sandbox)
			const cancelBtn = sandbox.locator('.origam-btn').filter({ hasText: 'Cancel' }).first()
			await expect(cancelBtn).toBeVisible({ timeout: 5000 })
			await cancelBtn.click()
			await expect(overlayContent).not.toBeVisible({ timeout: 5000 })
		})
	})

	// ------------------------------------------------------------------ //
	// SLOTS - HEADER (index 10)                                            //
	// #header: <div style>Custom header slot</div>                         //
	// ------------------------------------------------------------------ //

	test.describe('Slots - Header (index 10)', () => {
		test('le slot #header rend un header personnalise', async ({ page }) => {
			await page.goto(variantUrl(10))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const { overlayContent } = await openDialog(page, sandbox)
			await expect(overlayContent).toContainText('Custom header slot')
		})
	})

	// ------------------------------------------------------------------ //
	// SLOTS - HEADER APPEND (index 11)                                     //
	// #header-append: origam-icon heart size=20                            //
	// ------------------------------------------------------------------ //

	test.describe('Slots - Header Append (index 11)', () => {
		test('le dialog s ouvre avec le header-append slot', async ({ page }) => {
			await page.goto(variantUrl(11))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const { overlayContent } = await openDialog(page, sandbox)
			await expect(overlayContent).toBeVisible()
			await expect(overlayContent).toContainText('Header append slot')
		})
	})

	// ------------------------------------------------------------------ //
	// SLOTS - HEADER CONTENT (index 12)                                    //
	// #header-content: <span style="font-style:italic">…</span>           //
	// ------------------------------------------------------------------ //

	test.describe('Slots - Header Content (index 12)', () => {
		test('le dialog s ouvre depuis la variant Slots-Header Content', async ({ page }) => {
			await page.goto(variantUrl(12))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const { overlayContent } = await openDialog(page, sandbox)
			await expect(overlayContent).toBeVisible()
		})

		/**
		 * BUG DS — OrigamCard ne route pas le slot #header-content.
		 *
		 * OrigamDialog déclare le slot `header-content` (line 87-90 de
		 * OrigamDialog.vue) et le passe comme `#header-content` à OrigamCard.
		 * Mais OrigamCard ne possède aucune directive `v-if="slots['header-content']"`
		 * ni `<template #header-content>` de routage — le contenu du slot est
		 * silencieusement ignoré. Le `.origam-overlay__content` ne contient que
		 * `"Content here."` (le `#content` slot) au lieu d'inclure
		 * `"Custom header-content slot"` (le `#header-content` slot).
		 *
		 * Ticket de remédiation : corriger `OrigamCard` pour router ce slot.
		 */
		test.fixme('le slot #header-content rend du markup personnalise dans le header [DS BUG - OrigamCard ne route pas #header-content]', async ({ page }) => {
			await page.goto(variantUrl(12))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const { overlayContent } = await openDialog(page, sandbox)
			await expect(overlayContent).toContainText('Custom header-content slot')
		})
	})

	// ------------------------------------------------------------------ //
	// SLOTS - HEADER PREPEND (index 13)                                    //
	// #header-prepend: origam-icon information size=28                     //
	// ------------------------------------------------------------------ //

	test.describe('Slots - Header Prepend (index 13)', () => {
		test('le dialog s ouvre avec le header-prepend slot', async ({ page }) => {
			await page.goto(variantUrl(13))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const { overlayContent } = await openDialog(page, sandbox)
			await expect(overlayContent).toBeVisible()
		})

		test('le texte du header inclut le titre With prepend icon', async ({ page }) => {
			await page.goto(variantUrl(13))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const { overlayContent } = await openDialog(page, sandbox)
			await expect(overlayContent).toContainText('With prepend icon')
		})
	})

	// ------------------------------------------------------------------ //
	// SLOTS - HEADER SUBTITLE (index 14)                                   //
	// #header-subtitle: <span>Custom subtitle slot</span>                  //
	// ------------------------------------------------------------------ //

	test.describe('Slots - Header Subtitle (index 14)', () => {
		test('le dialog s ouvre et affiche le titre With subtitle', async ({ page }) => {
			await page.goto(variantUrl(14))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const { overlayContent } = await openDialog(page, sandbox)
			// Le titre de la story est "With subtitle" — c'est ce qui est rendu
			await expect(overlayContent).toContainText('With subtitle')
		})

		/**
		 * BUG DS — OrigamCard ne route pas le slot #header-subtitle.
		 *
		 * Même problème que #header-content : OrigamDialog passe le slot à
		 * OrigamCard mais OrigamCard ignore le routage. Le texte
		 * "Custom subtitle slot" n'apparait pas dans le rendu — seul le titre
		 * de la card ("With subtitle") est visible.
		 *
		 * Ticket de remédiation : corriger `OrigamCard` pour router ce slot.
		 */
		test.fixme('le slot #header-subtitle rend du contenu dans la zone sous-titre [DS BUG - OrigamCard ne route pas #header-subtitle]', async ({ page }) => {
			await page.goto(variantUrl(14))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const { overlayContent } = await openDialog(page, sandbox)
			await expect(overlayContent).toContainText('Custom subtitle slot')
		})
	})

	// ------------------------------------------------------------------ //
	// SLOTS - HEADER TITLE (index 15)                                      //
	// #header-title: <strong>Custom title slot</strong>                    //
	// ------------------------------------------------------------------ //

	test.describe('Slots - Header Title (index 15)', () => {
		test('le dialog s ouvre depuis la variant Slots-Header Title', async ({ page }) => {
			await page.goto(variantUrl(15))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const { overlayContent } = await openDialog(page, sandbox)
			await expect(overlayContent).toBeVisible()
		})

		/**
		 * BUG DS — OrigamCard ne route pas le slot #header-title.
		 *
		 * OrigamDialog définit le slot `header-title` (lines 69-77 de
		 * OrigamDialog.vue) avec un `v-if="slots['header-title']"` conditionnel
		 * et le passe à OrigamCard. Cependant OrigamCard ne possède pas de
		 * `<template #header-title>` de routage — le markup riche
		 * `<strong>Custom title slot</strong>` n'est pas rendu.
		 * Le `.origam-overlay__content` contient uniquement `"Content here."`.
		 *
		 * Note : ce slot est nécessaire pour remplacer le texte du titre par du
		 * markup arbitraire (liens, icônes inlines, etc.).
		 *
		 * Ticket de remédiation : corriger `OrigamCard` pour router #header-title.
		 */
		test.fixme('le slot #header-title rend du markup riche dans le titre [DS BUG - OrigamCard ne route pas #header-title]', async ({ page }) => {
			await page.goto(variantUrl(15))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const { overlayContent } = await openDialog(page, sandbox)
			const strong = overlayContent.locator('strong')
			await expect(strong).toHaveText('Custom title slot')
		})
	})

	// ------------------------------------------------------------------ //
	// SLOTS - LOADER (index 16)                                            //
	// #loader: <span>Loading…</span>                                       //
	// ------------------------------------------------------------------ //

	test.describe('Slots - Loader (index 16)', () => {
		test('le dialog s ouvre depuis la variant Slots-Loader', async ({ page }) => {
			await page.goto(variantUrl(16))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const { overlayContent } = await openDialog(page, sandbox)
			await expect(overlayContent).toBeVisible()
		})
	})

	// ------------------------------------------------------------------ //
	// SLOTS - TEXT (index 17)                                              //
	// #text: <span>Custom text slot content.</span>                        //
	// ------------------------------------------------------------------ //

	test.describe('Slots - Text (index 17)', () => {
		test('le slot #text rend du contenu personnalise', async ({ page }) => {
			await page.goto(variantUrl(17))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const { overlayContent } = await openDialog(page, sandbox)
			await expect(overlayContent).toContainText('Custom text slot content.')
		})
	})

	// ------------------------------------------------------------------ //
	// DEFAULT / PLAYGROUND (index 18)                                      //
	// init: title=Dialog, fullscreen=false, scrollable=false,              //
	//       retainFocus=true                                               //
	// ------------------------------------------------------------------ //

	test.describe('Default / Playground (index 18)', () => {
		test('activateur visible avec le texte Open playground', async ({ page }) => {
			await page.goto(variantUrl(18))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const btn = sandbox.locator('.origam-btn').first()
			await expect(btn).toBeVisible({ timeout: 35000 })
			await expect(btn).toContainText('Open playground')
		})

		test('le dialog s ouvre et affiche le titre Dialog', async ({ page }) => {
			await page.goto(variantUrl(18))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const { overlayContent } = await openDialog(page, sandbox)
			await expect(overlayContent).toBeVisible()
			const header = sandbox.locator('.origam-card-header')
			await expect(header).toContainText('Dialog')
		})

		test('le dialog se ferme via le bouton Close', async ({ page }) => {
			await page.goto(variantUrl(18))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const { overlayContent } = await openDialog(page, sandbox)
			const closeBtn = sandbox.locator('.origam-btn').filter({ hasText: 'Close' }).first()
			await expect(closeBtn).toBeVisible({ timeout: 5000 })
			await closeBtn.click()
			await expect(overlayContent).not.toBeVisible({ timeout: 5000 })
		})

		test('aria-haspopup="dialog" est posé sur l activateur du playground', async ({ page }) => {
			await page.goto(variantUrl(18))
			const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
			const activator = sandbox.locator('.origam-btn').first()
			await expect(activator).toBeVisible({ timeout: 35000 })
			const ariaHaspopup = await activator.evaluate(el => el.getAttribute('aria-haspopup'))
			expect(ariaHaspopup).toBe('dialog')
		})
	})
})
