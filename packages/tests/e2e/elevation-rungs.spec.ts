import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { expect, test } from '@playwright/test'
import { ref } from 'vue'

import { useElevation } from '../../ds/src/composables/Commons/elevation.composable'

/**
 * #813 — `elevation="2xl"` / `"3xl"` n'effacent plus l'ombre du composant.
 *
 * ## Pourquoi ce spec n'utilise PAS Histoire
 *
 * Aucune variante de story n'atteint ces echelons : `ELEVATION_OPTIONS`
 * (94 stories) est une liste NUMERIQUE qui s'arrete a `XL (24)`. Le defaut
 * etait donc hors de portee de toute sonde basee sur les stories — c'est une
 * des raisons pour lesquelles il a survecu.
 *
 * ## Pourquoi la sonde est legitime ici
 *
 * ⚠️ `CLAUDE.md` avertit qu'« un element que vous fabriquez vous-meme n'est
 * pas l'element rendu par Vue » — vrai lorsqu'on teste une regle SCOPEE, dont
 * le selecteur exige un `data-v-<hash>`. Ce n'est pas ce qui est mesure ici :
 * on mesure si la DECLARATION emise par le composable se resout, et cette
 * declaration est un style INLINE, sans cascade scopee.
 *
 * ⛔ Et surtout, la chaine n'est pas retapee : elle est lue depuis le VRAI
 * `useElevation`, ci-dessous. Le spec ne peut donc pas diverger de ce qui est
 * livre — si quelqu'un change la forme emise, c'est cette valeur-la qui part
 * dans le navigateur.
 *
 * ⛔ jsdom ne peut rien dire ici : il ne resout JAMAIS `var()` et fabrique
 * `16px`. Seul un vrai navigateur tranche (#398).
 *
 * ## Mesure AVANT le correctif (Chromium, memes feuilles)
 *
 * ```
 * regle composant seule                rgba(0,0,0,0.9) 0px 1px 2px 0px
 * md   (token declare)      TEMOIN     rgba(0,0,0,0.05) 0px 6px 24px 0px, ...
 * xl   (token declare)      TEMOIN     rgba(0,0,0,0.2) 0px 11px 15px -7px, ...
 * 2xl  (token absent)                  none      <- la regle du composant est EFFACEE
 * 3xl  (token absent)                  none
 * ```
 *
 * ## NON mesure ici
 *
 * Le rendu en theme sombre · le comportement sous un theme de marque qui
 * omettrait un echelon.
 */

const HERE = dirname(fileURLToPath(import.meta.url))
const TOKENS = resolve(HERE, '../../ds/src/assets/css/tokens')

/** Ce qu'une SCSS de composant poserait pour son ombre propre. */
const COMPONENT_RULE = 'rgba(0, 0, 0, 0.9) 0px 1px 2px 0px'

/** La declaration REELLE, lue depuis le composable livre. */
function emittedFor (rung: string): string {
    const {elevationStyles} = useElevation(ref(rung), ref(false), ref('rgb(0,0,0)'), 'origam-card')
    const decl = elevationStyles.value[0]

    expect(decl, `useElevation n'emet rien pour "${rung}"`).toBeTruthy()

    return decl.replace(/^box-shadow:\s*/, '')
}

async function measure (page: import('@playwright/test').Page, rungs: Array<string>) {
    const primitive = readFileSync(`${TOKENS}/primitive.css`, 'utf8')
    const light = readFileSync(`${TOKENS}/light.css`, 'utf8')
    const probes = rungs.map((r) => `<div class="probe" id="${r}" style="box-shadow: ${emittedFor(r)}"></div>`).join('')

    await page.setContent(`<!doctype html><html data-theme="light"><head>
<style>${primitive}</style><style>${light}</style>
<style>.probe { box-shadow: ${COMPONENT_RULE}; }</style>
</head><body><div class="probe" id="bare"></div>${probes}</body></html>`)

    return page.evaluate((ids: Array<string>) => {
        const out: Record<string, string> = {}
        for (const id of ids) out[id] = getComputedStyle(document.getElementById(id) as Element).boxShadow

        return out
    }, ['bare', ...rungs])
}

test.describe('#813 — les echelons d\'elevation peignent, et n\'effacent plus', () => {
    test('2xl et 3xl peignent l\'ombre de xl au lieu de rien', async ({ page }) => {
        const m = await measure(page, ['md', 'xl', '2xl', '3xl'])

        // --- TEMOIN NEGATIF : la regle du composant, sans elevation --------
        expect(m.bare).toBe(COMPONENT_RULE)

        // --- TEMOIN POSITIF : deux echelons qui peignaient DEJA ------------
        // Si ceux-ci tombent en meme temps que 2xl/3xl, c'est la sonde qui
        // est cassee, pas le produit.
        expect(m.md).not.toBe('none')
        expect(m.md).not.toBe(m.bare)
        expect(m.xl).not.toBe('none')
        expect(m.xl).not.toBe(m.bare)

        // --- CE QUE CE COMMIT CORRIGE -------------------------------------
        // AVANT : 'none' — la regle du composant etait EFFACEE.
        expect(m['2xl']).not.toBe('none')
        expect(m['3xl']).not.toBe('none')

        // ⚠️ Et le contrat assume : ils rendent EXACTEMENT comme `xl`, pas
        // deux echelons de plus. Si un vrai token `2xl` est declare un jour,
        // cette assertion doit tomber — c'est voulu, elle documente le repli.
        expect(m['2xl']).toBe(m.xl)
        expect(m['3xl']).toBe(m.xl)
    })

    test('les six echelons declares sont inchanges et tous distincts de la regle', async ({ page }) => {
        const rungs = ['none', 'xs', 'sm', 'md', 'lg', 'xl']
        const m = await measure(page, rungs)

        for (const r of rungs) {
            expect(m[r], `l'echelon "${r}" ne doit pas herister la regle du composant`).not.toBe(m.bare)
        }

        // `none` est un vrai token (une ombre transparente), pas l'absence de
        // declaration : il doit se resoudre, et donc neutraliser la regle.
        expect(m.none).not.toBe('none')

        // Les cinq echelons visibles sont deux a deux distincts — preuve que
        // le repli n'a pas ecrase l'echelle existante.
        const visible = ['xs', 'sm', 'md', 'lg', 'xl'].map((r) => m[r])
        expect(new Set(visible).size).toBe(visible.length)
    })
})
