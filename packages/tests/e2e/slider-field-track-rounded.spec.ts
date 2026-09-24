import { expect, FrameLocator, test } from '@playwright/test'

/**
 * #676 — `OrigamSliderFieldTrack` : la prop `rounded` (forme « échelle »)
 * produit-elle un rayon DISTINCT par échelon ?
 *
 * ## Verdict mesuré : OUI. Le ticket décrit un défaut qui n'existe pas.
 *
 * Le ticket affirme que, faute de `:where(&)` autour du `border-radius`
 * scopé, la classe utilitaire `.origam--rounded-lg` (0,1,0) perd contre la
 * règle scopée `[data-v-hash]` (0,2,0) et que la prop est donc « silencieusement
 * inerte ». Le raisonnement de cascade est juste ; la conclusion ne l'est pas,
 * pour deux raisons mesurées :
 *
 * 1. **Le `:where(&)` est déjà sur `develop`** depuis `e89dd86e`.
 * 2. **Ce n'est pas la classe utilitaire qui porte le rayon.** `useRounded`
 *    émet, pour chaque échelon du manifeste utilitaire, un COMPAGNON INLINE —
 *    précisément parce que la classe perd la cascade (le commentaire de
 *    `rounded.composable.ts:140-175` le documente et le mesure). Lu sur
 *    `#probe-rounded-lg` :
 *
 *    ```
 *    style="--origam-slider-field-track---size: 4px;
 *           border-radius: var(--origam-radius---lg, 12px); height: 48px"
 *    + règle useStyle() « #probe-rounded-lg { border-radius: var(--origam-radius---lg, 12px) } »
 *    computed borderTopLeftRadius = 12px
 *    ```
 *
 *    Une déclaration inline / `#id` bat toute règle de classe, `:where()` ou pas.
 *
 * ## Contrôle négatif joué (obligatoire — sinon ce spec ne prouve rien)
 *
 * Le `:where(&)` a été RETIRÉ du composant, Histoire rebâti, CSS servi vérifié
 * (`.origam-slider-field-track[data-v-f76388a4] { border-radius: … }`, soit
 * exactement l'état décrit par le ticket) : les 5 échelons rendent TOUJOURS
 * 9999 / 0 / 4 / 12 / 16 px. Ce spec reste donc VERT sur l'état « pré-fix » du
 * ticket — ce n'est pas un piège, c'est la mesure qui invalide le ticket.
 *
 * ⚠️ Ce spec garde donc le RÉSULTAT (un rayon distinct par échelon), pas le
 * mécanisme. Il tombera le jour où le compagnon inline de `useRounded` sera
 * retiré (retrait prévu en v3.0.0) sans que la classe utilitaire ait été
 * promue dans la cascade — ce qui est exactement le signal qu'on veut.
 *
 * ## Pourquoi ce spec ne peut pas vivre sous Vitest
 *
 * `border-radius` est ici piloté par `var(--origam-radius---lg)`. Sous jsdom,
 * `getComputedStyle` ne résout JAMAIS un `var()` : il renvoie un `16px`
 * fabriqué qui ressemble à une mesure (CLAUDE.md #398). Tout verdict Vitest
 * sur cette prop serait faux, dans les deux sens. Navigateur réel obligatoire.
 *
 * ## Contrôles
 *
 * - POSITIF — la piste sans `rounded` doit rendre le défaut token `9999px`.
 *   Si elle ne le rend pas, le harnais ne lit pas le bon élément et son
 *   verdict sur les autres pistes ne vaut rien.
 * - ACTUATION — `rounded="none"` doit rendre `0px`, et l'élément doit porter
 *   à la fois la classe utilitaire ET la déclaration inline. Le harnais prouve
 *   ainsi qu'il sait ACTUER la prop avant qu'une absence d'effet ailleurs
 *   puisse être imputée au composant.
 *
 * ## Index 0-based du Variant — POSITIONNEL
 *
 * 0 = Design, 1 = Functional, 2 = Slots - item, 3 = Default,
 * 4 = « Rounded scale - cascade probe » (APPENDU EN DERNIER, aucun index
 * préexistant décalé).
 */

const STORY_ID = 'components-stories-sliderfield-origamsliderfieldtrack-story-vue'
const STORY_PATH = '/stories/story/' + STORY_ID
const PROBE_VARIANT = 4

const variantUrl = (idx: number) => `${ STORY_PATH }?variantId=${ STORY_ID }-${ idx }`

/** Échelons attendus, lus dans `primitive.css` (`--origam-radius---*`). */
const RUNGS: Array<{ id: string, expected: string }> = [
    { id: 'probe-rounded-default', expected: '9999px' },
    { id: 'probe-rounded-none', expected: '0px' },
    { id: 'probe-rounded-sm', expected: '4px' },
    { id: 'probe-rounded-lg', expected: '12px' },
    { id: 'probe-rounded-xl', expected: '16px' }
]

interface IRadius {
    id: string
    classes: string
    inlineBorderRadius: string
    topLeft: string
    topRight: string
    bottomLeft: string
    bottomRight: string
}

const readRadius = async (sandbox: FrameLocator, id: string): Promise<IRadius> =>
    sandbox.locator(`#${ id }`).evaluate((el) => {
        const he = el as HTMLElement
        const cs = getComputedStyle(he)

        return {
            id: he.id,
            classes: he.className,
            inlineBorderRadius: he.style.borderRadius,
            topLeft: cs.borderTopLeftRadius,
            topRight: cs.borderTopRightRadius,
            bottomLeft: cs.borderBottomLeftRadius,
            bottomRight: cs.borderBottomRightRadius
        }
    })

test.describe('OrigamSliderFieldTrack — rounded (échelle) #676', () => {
    test.setTimeout(60000)

    test('mesure géométrique : chaque échelon rend un rayon distinct', async ({ page }) => {
        await page.goto(variantUrl(PROBE_VARIANT), { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')

        await expect(sandbox.locator('#probe-rounded-default')).toBeVisible({ timeout: 35000 })

        const measured: Array<IRadius> = []
        for (const rung of RUNGS) {
            measured.push(await readRadius(sandbox, rung.id))
        }

        // Trace lisible dans la sortie Playwright — c'est la mesure versée au ticket.
        console.log('#676 rayons mesures :', JSON.stringify(measured, null, 2))

        // --- CONTRÔLE POSITIF : le harnais lit bien l'élément du composant ---
        const baseline = measured.find((m) => m.id === 'probe-rounded-default')!
        expect(baseline.classes).toContain('origam-slider-field-track')
        expect(baseline.classes).not.toContain('origam--rounded-')
        expect(baseline.inlineBorderRadius, 'aucun compagnon inline sans `rounded`').toBe('')
        expect(baseline.topLeft).toBe('9999px')

        // --- ACTUATION : le harnais sait actuer la prop, et on sait PAR QUOI ---
        const none = measured.find((m) => m.id === 'probe-rounded-none')!
        expect(none.classes).toContain('origam--rounded-none')
        expect(none.inlineBorderRadius, 'compagnon inline emis par useRounded').not.toBe('')
        expect(none.topLeft).toBe('0px')
        expect(none.topLeft).not.toBe(baseline.topLeft)

        // --- Le critère du ticket : un rayon DISTINCT par échelon ---
        for (const rung of RUNGS) {
            const m = measured.find((x) => x.id === rung.id)!
            expect(m.topLeft, `${ rung.id } topLeft`).toBe(rung.expected)
            expect(m.topRight, `${ rung.id } topRight`).toBe(rung.expected)
            expect(m.bottomLeft, `${ rung.id } bottomLeft`).toBe(rung.expected)
            expect(m.bottomRight, `${ rung.id } bottomRight`).toBe(rung.expected)
        }

        // Deux échelons qui rendent la même valeur = prop inerte.
        const distinct = new Set(measured.map((m) => m.topLeft))
        expect(distinct.size, `echelons distincts (mesures: ${ [ ...distinct ].join(', ') })`).toBe(RUNGS.length)
    })
})
