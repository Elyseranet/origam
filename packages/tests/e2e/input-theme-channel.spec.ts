import { expect, test } from '@playwright/test'

/**
 * SPEC — OrigamInput, canal de thème mort sur 4 surfaces (#436, classeur C2)
 *
 * ## Le défaut que ce spec encode
 *
 * `light.css` déclare la table de tokens d'`origam-input` au complet. Le SCSS
 * scopé d'`OrigamInput.vue` ignorait quatre de ces entrées et écrivait la
 * valeur en dur à la place. Le token restait déclaré, typé dans
 * `tokens.type.ts`, documenté — et sans effet.
 *
 * | surface | ce que le SCSS écrivait | conséquence |
 * |---|---|---|
 * | `--origam-input---padding-top` | `--origam-input---padding-top: 16px` posé SUR `.origam-input` | l'écriture locale bat la déclaration `:root` du thème |
 * | `__details` | `padding-top: 6px` | `--origam-input__details---padding-top` déclaré, jamais lu |
 * | `--density-comfortable` | `--origam-input---density: 8px` | aucun token, alors que `default` et `compact` en lisent un |
 * | `--vertical` prepend/append | `margin-block-*: 16px` | aucun token, alors que le jumeau `--horizontal` en lit un |
 *
 * ⛔ Le premier est le plus large : `--origam-input---padding-top` n'est pas lu
 * par `OrigamInput` lui-même, il est lu par `OrigamField` (4 endroits, dont la
 * position du label flottant) et par `OrigamTextareaField` (3 endroits, dont
 * une lecture JS via `getPropertyValue`). Une déclaration locale sur
 * `.origam-input` gagne sur `:root` pour tout le sous-arbre — donc pour toute
 * la famille des champs. Un thème qui nomme ce token ne changeait rien, nulle
 * part, sans le moindre avertissement.
 *
 * ## Pourquoi Playwright et pas Vitest
 *
 * ⛔ Sous jsdom, `getComputedStyle` ne résout JAMAIS un `var()` (CLAUDE.md,
 * #398) : il renvoie une valeur UA fabriquée qui ressemble à une mesure. Un
 * test unitaire passerait au vert sur le code cassé ET sur le code corrigé.
 *
 * ## ⛔ Mutation et mesure dans UN SEUL `evaluate`
 *
 * Patron imposé par `switch-density.spec.ts` : Vue re-patche `class` et
 * `style` entre un `evaluate` et un `toHaveCSS` qui suit, et `toHaveCSS`
 * repolle 5 s — il finit par mesurer l'élément de Vue, pas le nôtre. Toute la
 * séquence tient donc dans un seul tour synchrone.
 *
 * ## ⛔ Piège mesuré : un enfant fabriqué à la main ne porte pas le scope Vue
 *
 * Le SCSS est `<style scoped>` : `#{$this}__prepend { margin-block-start: … }`
 * compile en `.origam-input--vertical .origam-input__prepend[data-v-c4867fc3]`.
 * Un `<span class="origam-input__prepend">` créé par le spec n'a PAS cet
 * attribut, donc AUCUNE règle ne le vise et tout se mesure à `0px` — sur du
 * code correct comme sur du code cassé. C'est exactement le faux rouge que le
 * premier jet de ce spec a produit. `withScope()` recopie donc les attributs
 * `data-v-*` de la racine sur chaque élément fabriqué.
 */

const STORY_ID = 'components-stories-input-origaminput-story-vue'
/*
 * ⛔ La page de story SANS `variantId` ne monte aucune variante : `.origam-input`
 * n'existe pas et le spec échoue en « element not found », ce qui ressemble à
 * un défaut du composant et n'en est pas un.
 */
const VARIANT = 12
const STORY_PATH = `/stories/story/${STORY_ID}?variantId=${STORY_ID}-${VARIANT}`

/** Valeurs sentinelles, choisies pour ne coïncider avec aucune valeur du DS. */
const SENTINEL = {
    paddingTop: '41px',
    detailsPaddingTop: '43px',
    comfortableDensity: '47px',
    prependMarginBlockStart: '51px',
    appendMarginBlockEnd: '53px'
} as const

/**
 * Ce que le SCSS écrivait en dur — le rendu livré ne doit pas bouger.
 *
 * ⛔ `detailsPaddingTop: '6px'` est une valeur HORS ÉCHELLE, assumée, pas un
 * oubli. La feuille de tokens déclarait
 * `--origam-input__details---padding-top: var(--origam-space---2)` = **8px**,
 * alors que le SCSS rendait **6px** depuis toujours. Lire le token tel quel
 * rendait le canal vivant mais déplaçait le rendu de 2px sur TOUTE la famille
 * des champs (Field, TextField, TextareaField, NumberField, PasswordField,
 * Select, OtpInputField…) sans qu'aucun ticket ne le demande. La déclaration
 * a donc été ramenée à `6px` : le canal devient thémable sans régression
 * visuelle. Aucun barreau de `--origam-space---*` ne vaut 6px (1=4px,
 * 2=8px) — décision actée avec le PM, la bascule vers 8px tient en une ligne
 * si le design la tranche un jour.
 */
const SHIPPED = {
    paddingTop: '16px',
    detailsPaddingTop: '6px',
    comfortableDensity: '8px',
    prependMarginBlockStart: '16px',
    appendMarginBlockEnd: '16px'
} as const

/**
 * Prépare l'élément pour la mesure et renvoie les 5 valeurs, en UN tour.
 * `sentinel` à `null` mesure le rendu livré, sans thème.
 */
const MEASURE = (el: Element, sentinel: typeof SENTINEL | null) => {
    const doc = el.ownerDocument
    const root = doc.documentElement

    if (sentinel) {
        root.style.setProperty('--origam-input---padding-top', sentinel.paddingTop)
        root.style.setProperty('--origam-input__details---padding-top', sentinel.detailsPaddingTop)
        root.style.setProperty('--origam-input---density-comfortable-density', sentinel.comfortableDensity)
        root.style.setProperty('--origam-input__prepend---margin-block-start', sentinel.prependMarginBlockStart)
        root.style.setProperty('--origam-input__append---margin-block-end', sentinel.appendMarginBlockEnd)
    }

    const scopeAttrs = Array.from(el.attributes)
        .map((a) => a.name)
        .filter((n) => n.startsWith('data-v-'))

    const withScope = <T extends HTMLElement>(node: T): T => {
        for (const attr of scopeAttrs) node.setAttribute(attr, '')
        return node
    }

    const ensure = (selector: string, tag: string, className: string): HTMLElement => {
        const found = el.querySelector(selector) as HTMLElement | null
        if (found) return found

        const made = withScope(doc.createElement(tag))
        made.className = className
        el.appendChild(made)
        return made
    }

    el.classList.remove('origam-input--density-default', 'origam-input--density-compact')
    el.classList.add('origam-input--density-comfortable')
    el.classList.remove('origam-input--horizontal')
    el.classList.add('origam-input--vertical')

    const details = ensure('.origam-input__details', 'div', 'origam-input__details')
    const prepend = ensure('.origam-input__prepend', 'span', 'origam-input__prepend')
    const append = ensure('.origam-input__append', 'span', 'origam-input__append')

    return {
        paddingTop: getComputedStyle(el).getPropertyValue('--origam-input---padding-top').trim(),
        comfortableDensity: getComputedStyle(el).getPropertyValue('--origam-input---density').trim(),
        detailsPaddingTop: getComputedStyle(details).paddingTop,
        prependMarginBlockStart: getComputedStyle(prepend).marginBlockStart,
        appendMarginBlockEnd: getComputedStyle(append).marginBlockEnd
    }
}

test.describe('OrigamInput — canal de thème (#436, C2)', () => {
    test.setTimeout(45000)

    test('les 4 surfaces suivent le token posé par le thème', async ({ page }) => {
        await page.goto(STORY_PATH, { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const input = sandbox.locator('.origam-input').first()
        await expect(input).toBeVisible({ timeout: 15000 })

        const measured = await input.evaluate(MEASURE, SENTINEL)

        expect(measured.paddingTop, '--origam-input---padding-top résolue sur .origam-input')
            .toBe(SENTINEL.paddingTop)
        expect(measured.detailsPaddingTop, 'padding-top de .origam-input__details')
            .toBe(SENTINEL.detailsPaddingTop)
        expect(measured.comfortableDensity, '--origam-input---density sous --density-comfortable')
            .toBe(SENTINEL.comfortableDensity)
        expect(measured.prependMarginBlockStart, 'margin-block-start de __prepend sous --vertical')
            .toBe(SENTINEL.prependMarginBlockStart)
        expect(measured.appendMarginBlockEnd, 'margin-block-end de __append sous --vertical')
            .toBe(SENTINEL.appendMarginBlockEnd)
    })

    test('sans thème, le rendu livré ne bouge pas', async ({ page }) => {
        await page.goto(STORY_PATH, { waitUntil: 'domcontentloaded' })

        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        const input = sandbox.locator('.origam-input').first()
        await expect(input).toBeVisible({ timeout: 15000 })

        /*
         * Contre-épreuve : la correction rend le canal vivant SANS déplacer le
         * rendu par défaut. Ces cinq valeurs sont celles que le SCSS écrivait
         * en dur — si l'une bouge, c'est une régression visuelle sur toute la
         * famille des champs, pas une correction de token.
         */
        const measured = await input.evaluate(MEASURE, null)

        expect(measured.paddingTop, '--origam-input---padding-top livrée').toBe(SHIPPED.paddingTop)
        expect(measured.detailsPaddingTop, 'padding-top de __details livré').toBe(SHIPPED.detailsPaddingTop)
        expect(measured.comfortableDensity, 'densité comfortable livrée').toBe(SHIPPED.comfortableDensity)
        expect(measured.prependMarginBlockStart, 'margin-block-start de __prepend livré').toBe(SHIPPED.prependMarginBlockStart)
        expect(measured.appendMarginBlockEnd, 'margin-block-end de __append livré').toBe(SHIPPED.appendMarginBlockEnd)
    })
})
