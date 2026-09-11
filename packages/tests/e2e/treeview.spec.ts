import { expect, test } from '@playwright/test'

/**
 * OrigamTreeview — e2e spec
 *
 * Story variants (0-based index → title):
 *   0 → Design         (color, bgColor, size, density; defaultExpanded=['src','src/components','tokens'])
 *   1 → Functional     (selectMode, selectableNodes, showLines, expandOnClick; defaultExpanded idem)
 *   2 → Events - select
 *   3 → Events - toggle
 *   4 → Events - update:expandedValue
 *   5 → Events - update:modelValue
 *   6 → Slots - Node
 *   7 → Default        (playground)
 *
 * defaultExpanded = ['src', 'src/components', 'tokens']
 * → src/components/Btn.vue et src/components/Card.vue sont visibles dès le chargement des variants
 *   qui utilisent defaultExpanded (0,1,2,3,4,5,6,7).
 *
 * data-cy disponibles (vérifiés dans OrigamTreeview.vue + OrigamTreeviewNode.vue) :
 *   - treeview-node-{id} → wrapper div du nœud (présent sur root ET children)
 *   - treeview-row-{id}  → div[role="treeitem"] du nœud (cliquable, focusable)
 *
 * Classes BEM utiles :
 *   .origam-treeview                       — racine
 *   .origam-treeview-node                  — wrapper nœud
 *   .origam-treeview-node--expanded        — nœud développé
 *   .origam-treeview-node--selected        — nœud sélectionné
 *   .origam-treeview-node--disabled        — nœud désactivé
 *   .origam-treeview-node__row             — ligne du nœud
 *   .origam-treeview-node__row--selected   — ligne sélectionnée
 *   .origam-treeview-node__row--disabled   — ligne désactivée
 *   .origam-treeview-node__chevron         — icône expand/collapse
 *   .origam-treeview-node__chevron--expanded — chevron tourné
 *   .origam-treeview-node__children        — conteneur enfants (absent si collapsed)
 *   .origam-treeview-node__guide           — trait de guidage vertical (showLines=true)
 */

test.setTimeout(45000)

const STORY_ID   = 'components-stories-treeview-origamtreeview-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID

const variantUrl = (idx: number) => `${STORY_PATH}?variantId=${STORY_ID}-${idx}`

// Variants
const VARIANT = {
    DESIGN:                   0,
    FUNCTIONAL:               1,
    EVENTS_SELECT:            2,
    EVENTS_TOGGLE:            3,
    EVENTS_UPDATE_EXPANDED:   4,
    EVENTS_UPDATE_MODEL:      5,
    SLOTS_NODE:               6,
    DEFAULT:                  7
} as const

/**
 * Navigue vers un variant et attend que le treeview soit visible dans le sandbox.
 * Utilise domcontentloaded (pas networkidle — Histoire garde un WS HMR ouvert).
 * Timeout de 20000ms pour absorber la montée du sandbox iframe après un test précédent
 * ayant laissé l'iframe en cours de transition.
 */
async function gotoVariant(page: import('@playwright/test').Page, idx: number) {
    await page.goto(variantUrl(idx))
    await page.waitForLoadState('domcontentloaded')
    const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
    await expect(sandbox.locator('.origam-treeview')).toBeVisible({ timeout: 20000 })
    return sandbox
}

test.describe('OrigamTreeview', () => {

    // ─────────────────────────────────────────────────────────────────────
    // Design variant (idx 0)
    // ─────────────────────────────────────────────────────────────────────

    test('Design — racine .origam-treeview rendue', async ({ page }) => {
        const sandbox = await gotoVariant(page, VARIANT.DESIGN)
        await expect(sandbox.locator('.origam-treeview')).toBeVisible()
    })

    test('Design — 3 nœuds racine (src, tokens, README.md)', async ({ page }) => {
        const sandbox = await gotoVariant(page, VARIANT.DESIGN)
        const rootNodes = sandbox.locator('.origam-treeview > .origam-treeview-node')
        await expect(rootNodes).toHaveCount(3)
    })

    test('Design — nœuds pre-expanded portent la classe --expanded', async ({ page }) => {
        const sandbox = await gotoVariant(page, VARIANT.DESIGN)
        // src et tokens sont dans defaultExpanded → classe --expanded attendue
        await expect(sandbox.locator('[data-cy="treeview-node-src"]'))
            .toHaveClass(/origam-treeview-node--expanded/)
        await expect(sandbox.locator('[data-cy="treeview-node-tokens"]'))
            .toHaveClass(/origam-treeview-node--expanded/)
    })

    test('Design — noeud README.md (feuille) sans classe --expanded', async ({ page }) => {
        const sandbox = await gotoVariant(page, VARIANT.DESIGN)
        await expect(sandbox.locator('[data-cy="treeview-node-README.md"]'))
            .not.toHaveClass(/origam-treeview-node--expanded/)
    })

    test('Design — enfants de src/components visibles car pre-expanded', async ({ page }) => {
        const sandbox = await gotoVariant(page, VARIANT.DESIGN)
        // Btn.vue et Card.vue sont enfants de src/components qui est dans defaultExpanded
        await expect(sandbox.locator('[data-cy="treeview-row-src/components/Btn.vue"]'))
            .toBeVisible({ timeout: 5000 })
        await expect(sandbox.locator('[data-cy="treeview-row-src/components/Card.vue"]'))
            .toBeVisible({ timeout: 5000 })
    })

    // ─────────────────────────────────────────────────────────────────────
    // Expand / collapse (Design variant — idx 0)
    // ─────────────────────────────────────────────────────────────────────

    test('Expand — clic chevron ouvre un nœud collapsé', async ({ page }) => {
        const sandbox = await gotoVariant(page, VARIANT.DESIGN)
        // src/types n'est PAS dans defaultExpanded → collapsé au départ
        const typesNode = sandbox.locator('[data-cy="treeview-node-src/types"]')
        await expect(typesNode).not.toHaveClass(/origam-treeview-node--expanded/)

        const chevron = typesNode.locator(':scope > .origam-treeview-node__row .origam-treeview-node__chevron')
        await chevron.click()
        await page.waitForTimeout(300)

        await expect(typesNode).toHaveClass(/origam-treeview-node--expanded/)
        await expect(typesNode.locator(':scope > .origam-treeview-node__children')).toBeVisible()
    })

    test('Collapse — clic chevron ferme un nœud ouvert', async ({ page }) => {
        const sandbox = await gotoVariant(page, VARIANT.DESIGN)
        const srcNode = sandbox.locator('[data-cy="treeview-node-src"]')
        await expect(srcNode).toHaveClass(/origam-treeview-node--expanded/)

        const chevron = srcNode.locator(':scope > .origam-treeview-node__row .origam-treeview-node__chevron')
        await chevron.click()
        await page.waitForTimeout(300)

        await expect(srcNode).not.toHaveClass(/origam-treeview-node--expanded/)
        await expect(srcNode.locator(':scope > .origam-treeview-node__children')).toHaveCount(0)
    })

    test('Collapse — enfants masqués après collapse du parent', async ({ page }) => {
        const sandbox = await gotoVariant(page, VARIANT.DESIGN)
        const srcNode = sandbox.locator('[data-cy="treeview-node-src"]')
        const chevron = srcNode.locator(':scope > .origam-treeview-node__row .origam-treeview-node__chevron')
        await chevron.click()
        await page.waitForTimeout(300)

        await expect(sandbox.locator('[data-cy="treeview-row-src/components/Btn.vue"]')).toHaveCount(0)
    })

    test('Chevron tourne : classe --expanded sur le chevron après ouverture', async ({ page }) => {
        const sandbox = await gotoVariant(page, VARIANT.DESIGN)
        const typesNode = sandbox.locator('[data-cy="treeview-node-src/types"]')
        const chevron = typesNode.locator(':scope > .origam-treeview-node__row .origam-treeview-node__chevron')
        await expect(chevron).not.toHaveClass(/origam-treeview-node__chevron--expanded/)

        await chevron.click()
        await page.waitForTimeout(300)

        await expect(chevron).toHaveClass(/origam-treeview-node__chevron--expanded/)
    })

    // ─────────────────────────────────────────────────────────────────────
    // Functional variant — showLines (idx 1, init-state showLines=true)
    // ─────────────────────────────────────────────────────────────────────

    test('Functional — showLines=true (init) : guides rendus dans les nœuds enfants', async ({ page }) => {
        const sandbox = await gotoVariant(page, VARIANT.FUNCTIONAL)
        // Les nœuds à depth > 0 ont des guides (depth=1 → 1 guide, depth=2 → 2 guides)
        const guides = sandbox.locator('.origam-treeview-node__guide')
        const count = await guides.count()
        expect(count).toBeGreaterThan(0)
    })

    // ─────────────────────────────────────────────────────────────────────
    // Events - select variant (idx 2) — selectMode="single"
    // ─────────────────────────────────────────────────────────────────────

    test('Events/select — clic sur feuille sélectionne la ligne', async ({ page }) => {
        const sandbox = await gotoVariant(page, VARIANT.EVENTS_SELECT)
        const btnRow = sandbox.locator('[data-cy="treeview-row-src/components/Btn.vue"]')
        await expect(btnRow).toBeVisible({ timeout: 5000 })
        await btnRow.click()
        await page.waitForTimeout(300)

        await expect(btnRow).toHaveClass(/origam-treeview-node__row--selected/)
    })

    test('Events/select — selectionner une autre feuille deselectionne la precedente (single)', async ({ page }) => {
        const sandbox = await gotoVariant(page, VARIANT.EVENTS_SELECT)
        const btnRow  = sandbox.locator('[data-cy="treeview-row-src/components/Btn.vue"]')
        const cardRow = sandbox.locator('[data-cy="treeview-row-src/components/Card.vue"]')
        await expect(btnRow).toBeVisible({ timeout: 5000 })

        await btnRow.click()
        await page.waitForTimeout(200)
        await expect(btnRow).toHaveClass(/origam-treeview-node__row--selected/)

        await cardRow.click()
        await page.waitForTimeout(200)
        await expect(cardRow).toHaveClass(/origam-treeview-node__row--selected/)
        await expect(btnRow).not.toHaveClass(/origam-treeview-node__row--selected/)
    })

    test('Events/select — clic sur feuille selectionnee la deselectionne (toggle)', async ({ page }) => {
        const sandbox = await gotoVariant(page, VARIANT.EVENTS_SELECT)
        const btnRow = sandbox.locator('[data-cy="treeview-row-src/components/Btn.vue"]')
        await expect(btnRow).toBeVisible({ timeout: 5000 })

        await btnRow.click()
        await page.waitForTimeout(200)
        await expect(btnRow).toHaveClass(/origam-treeview-node__row--selected/)

        await btnRow.click()
        await page.waitForTimeout(200)
        await expect(btnRow).not.toHaveClass(/origam-treeview-node__row--selected/)
    })

    // ─────────────────────────────────────────────────────────────────────
    // Events - update:modelValue variant (idx 5) — selectMode="multiple"
    // ─────────────────────────────────────────────────────────────────────

    test('Events/update:modelValue — selection multiple : deux feuilles simultanement', async ({ page }) => {
        const sandbox = await gotoVariant(page, VARIANT.EVENTS_UPDATE_MODEL)
        const btnRow  = sandbox.locator('[data-cy="treeview-row-src/components/Btn.vue"]')
        const cardRow = sandbox.locator('[data-cy="treeview-row-src/components/Card.vue"]')
        await expect(btnRow).toBeVisible({ timeout: 5000 })

        await btnRow.click()
        await page.waitForTimeout(200)
        await cardRow.click()
        await page.waitForTimeout(200)

        await expect(btnRow).toHaveClass(/origam-treeview-node__row--selected/)
        await expect(cardRow).toHaveClass(/origam-treeview-node__row--selected/)
    })

    // ─────────────────────────────────────────────────────────────────────
    // Events - toggle variant (idx 3)
    // ─────────────────────────────────────────────────────────────────────

    test('Events/toggle — clic chevron change etat expanded du noeud', async ({ page }) => {
        const sandbox = await gotoVariant(page, VARIANT.EVENTS_TOGGLE)
        const srcNode = sandbox.locator('[data-cy="treeview-node-src"]')
        await expect(srcNode).toHaveClass(/origam-treeview-node--expanded/)

        const chevron = srcNode.locator(':scope > .origam-treeview-node__row .origam-treeview-node__chevron')
        await chevron.click()
        await page.waitForTimeout(300)

        await expect(srcNode).not.toHaveClass(/origam-treeview-node--expanded/)
    })

    // ─────────────────────────────────────────────────────────────────────
    // Slots - Node variant (idx 6)
    // ─────────────────────────────────────────────────────────────────────

    // DS BUG — slot #node défini sur <origam-treeview> n'est pas propagé aux OrigamTreeviewNode.
    // OrigamTreeview.vue itère les items avec <origam-treeview-node v-for> sans passer le slot #node.
    // Le slot est consommé par le composant racine (qui ne l'utilise pas lui-même) et n'est jamais
    // forwardé aux nœuds fils. Dans le DOM tous les emplacements slot sont <!--v-if-->.
    // Fix requis : ajouter <template #node="slotProps"><slot name="node" v-bind="slotProps"/></template>
    // sur chaque <origam-treeview-node> dans OrigamTreeview.vue.
    test.fixme('Slots/Node — slot personnalise rend le texte [slot]', async ({ page }) => {
        const sandbox = await gotoVariant(page, VARIANT.SLOTS_NODE)
        // Le slot #node de la story produit un <span style="fontStyle:italic"> avec "[slot] {label}"
        const slotSpans = sandbox.locator('.origam-treeview-node > span[style*="italic"]')
        await expect(slotSpans.first()).toBeVisible({ timeout: 5000 })
        const firstText = await slotSpans.first().textContent()
        expect(firstText).toMatch(/\[slot\]/)
    })

    // ─────────────────────────────────────────────────────────────────────
    // Keyboard navigation (Design variant — idx 0)
    // ─────────────────────────────────────────────────────────────────────

    test('Keyboard — ArrowDown deplacement focus vers treeitem suivant', async ({ page }) => {
        const sandbox = await gotoVariant(page, VARIANT.DESIGN)
        const treeitems = sandbox.locator('[role="treeitem"]')
        await treeitems.first().focus()
        await page.waitForTimeout(100)

        await page.keyboard.press('ArrowDown')
        await page.waitForTimeout(200)

        await expect(treeitems.nth(1)).toBeFocused()
    })

    test('Keyboard — ArrowRight sur noeud collapse ouvre ses enfants', async ({ page }) => {
        const sandbox = await gotoVariant(page, VARIANT.DESIGN)
        const typesRow  = sandbox.locator('[data-cy="treeview-row-src/types"]')
        const typesNode = sandbox.locator('[data-cy="treeview-node-src/types"]')
        await typesRow.focus()
        await page.keyboard.press('ArrowRight')
        await page.waitForTimeout(300)

        await expect(typesNode).toHaveClass(/origam-treeview-node--expanded/)
    })

    test('Keyboard — ArrowLeft sur nœud ouvert le ferme', async ({ page }) => {
        const sandbox = await gotoVariant(page, VARIANT.DESIGN)
        const componentsRow  = sandbox.locator('[data-cy="treeview-row-src/components"]')
        const componentsNode = sandbox.locator('[data-cy="treeview-node-src/components"]')
        await expect(componentsNode).toHaveClass(/origam-treeview-node--expanded/)

        await componentsRow.focus()
        await page.keyboard.press('ArrowLeft')
        await page.waitForTimeout(300)

        await expect(componentsNode).not.toHaveClass(/origam-treeview-node--expanded/)
    })

    test('Keyboard — Enter sur feuille selectionnable la selectionne', async ({ page }) => {
        const sandbox = await gotoVariant(page, VARIANT.EVENTS_SELECT)
        const btnRow  = sandbox.locator('[data-cy="treeview-row-src/components/Btn.vue"]')
        const btnNode = sandbox.locator('[data-cy="treeview-node-src/components/Btn.vue"]')
        await expect(btnRow).toBeVisible({ timeout: 5000 })

        await btnRow.focus()
        await page.waitForTimeout(150)
        await page.keyboard.press('Enter')
        await page.waitForTimeout(300)

        await expect(btnNode).toHaveClass(/origam-treeview-node--selected/)
    })

    // ─────────────────────────────────────────────────────────────────────
    // ARIA (Design variant — idx 0)
    // ─────────────────────────────────────────────────────────────────────

    test('ARIA — racine a role="tree"', async ({ page }) => {
        const sandbox = await gotoVariant(page, VARIANT.DESIGN)
        await expect(sandbox.locator('[role="tree"]')).toBeVisible()
    })

    test('ARIA — nœuds ont role="treeitem"', async ({ page }) => {
        const sandbox = await gotoVariant(page, VARIANT.DESIGN)
        const treeitems = sandbox.locator('[role="treeitem"]')
        const count = await treeitems.count()
        expect(count).toBeGreaterThan(0)
    })

    test('ARIA — nœud expanded a aria-expanded="true"', async ({ page }) => {
        const sandbox = await gotoVariant(page, VARIANT.DESIGN)
        const srcRow = sandbox.locator('[data-cy="treeview-row-src"]')
        await expect(srcRow).toHaveAttribute('aria-expanded', 'true')
    })

    test('ARIA — nœud collapsé a aria-expanded="false"', async ({ page }) => {
        const sandbox = await gotoVariant(page, VARIANT.DESIGN)
        const typesRow = sandbox.locator('[data-cy="treeview-row-src/types"]')
        await expect(typesRow).toHaveAttribute('aria-expanded', 'false')
    })

    test('ARIA — feuille sans attribut aria-expanded', async ({ page }) => {
        const sandbox = await gotoVariant(page, VARIANT.DESIGN)
        const readmeRow = sandbox.locator('[data-cy="treeview-row-README.md"]')
        await expect(readmeRow).not.toHaveAttribute('aria-expanded')
    })

    // ─────────────────────────────────────────────────────────────────────
    // Default / playground variant (idx 7)
    // ─────────────────────────────────────────────────────────────────────

    test('Default — playground rend 3 noeuds racine', async ({ page }) => {
        const sandbox = await gotoVariant(page, VARIANT.DEFAULT)
        // Sélecteur enfant direct pour ne compter que les racines (pas les descendants)
        await expect(sandbox.locator('.origam-treeview > .origam-treeview-node')).toHaveCount(3)
    })
})
