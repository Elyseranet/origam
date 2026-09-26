import { expect, test, type Page } from '@playwright/test'

/**
 * #950 — `padding="6"` / `margin="6"` peignent enfin, sur les 21 composants
 * dont le recensement a mesuré la prop MORTE au navigateur.
 *
 * MESURE, PAS SOUHAIT. Le recensement (`docs/mesures/950-props-utilitaires-
 * mortes.md`, spec `utility-cascade-census-950.spec.ts`) a établi en Chromium
 * réel que 34 couples (composant × prop) sur 24 composants n'appliquaient
 * RIEN : la classe utilitaire était bien émise sur l'élément, et le longhand
 * calculé ne bougeait pas d'un pixel entre `--p-4` et `--p-12`.
 *
 * Cause établie, pas supposée, et ce n'est PAS celle que le ticket nommait
 * d'abord. La spécificité ((0,1,0) contre (0,2,0)) et « longhand > raccourci »
 * sont vraies mais ne discriminent rien — elles valent pour TOUTES les
 * familles d'utilitaires. Le filtre décisif est :
 *
 *   le chemin tokenisé émet-il AUSSI une déclaration inline ?
 *
 * `rounded`, `elevation`, `border`, `bg`, `fg` en émettent une (l'inline bat
 * toujours une règle scopée, donc leur prop peint). `padding` et `margin`
 * sont les deux seules familles dont le chemin tokenisé a été « purifié » en
 * classe-seule : `usePadding` / `useMargin` sautent le rung inline via
 * `if (!isUtilityPaddingScale(…))`. Elles n'avaient donc plus aucun canal
 * capable de gagner la cascade.
 *
 * Fix (décision du propriétaire, retenue contre `@layer` et contre la
 * réduction de portée de la prop) : chaque déclaration PAR DÉFAUT de
 * `padding` / `margin` passe sous `:where(&)`. Vérifié via
 * `@vue/compiler-sfc` — le compilateur scopé insère l'attribut À L'INTÉRIEUR
 * de la pseudo-classe :
 *
 *   `:where(&)`          -> `:where(.origam-sheet[data-v-abc123])`  (0,0,0)
 *   `&:hover`            -> `.origam-sheet[data-v-abc123]:hover`    (0,3,0)
 *   `&--variant-flat`    -> `.origam-sheet--variant-flat[data-v…]`  (0,2,0)
 *   `+ .origam-row`      -> `.origam-row + .origam-row[data-v…]`    (0,3,0)
 *
 * ⛔ Seuls les DÉFAUTS descendent. Les 495 déclarations modificatrices /
 * d'état relevées sur 154 composants gardent leur (0,2,0) — c'est
 * précisément ce qui a fait écarter `@layer`, qui aurait fait perdre un
 * `:hover` ou un `--variant-flat` dès qu'une classe utilitaire est présente,
 * inversant le contrat écrit dans l'en-tête d'`origam-utilities.css`. Le
 * bloc « NON-RÉGRESSION » en fin de fichier épingle ce contrat.
 *
 * Motif déjà éprouvé en production sur la famille Chart (lot C2), épinglé par
 * `chart-family-padding-margin-cascade.spec.ts` — ce fichier en est le jumeau
 * pour les 21 composants du lot #950.
 *
 * jsdom ne résout JAMAIS `var()` (#398) et n'injecte même pas le
 * `<style scoped>` du SFC dans `document.head` : ce test ne peut exister
 * qu'ici, contre un navigateur réel.
 *
 * La mutation porte sur l'élément RÉELLEMENT rendu par Vue dans l'iframe
 * `__sandbox` (il porte le vrai `[data-v-hash]`) ; un élément fabriqué à la
 * main ne matcherait aucun sélecteur scopé et masquerait le défaut. Mutation
 * ET lecture dans un SEUL `evaluate`, parce que la `:class` de la racine est
 * liée à un `computed` : en deux étapes Vue re-patche la liste de classes
 * entre l'écriture et la mesure (piège documenté dans CLAUDE.md, mesuré sur
 * la densité d'`OrigamSwitch`).
 */

const sandboxOf = (page: Page) =>
    page.frameLocator('iframe[src*="__sandbox"]')

const openVariant = async (page: Page, storyUrl: string, title: string) => {
    await page.goto(storyUrl)
    await page.waitForLoadState('networkidle')
    await page.getByText(title, { exact: true }).first().click()
    await page.waitForTimeout(500)
}

/**
 * Valeur ABSOLUE, pas un simple écart : `.origam--p-6` / `.origam--m-6`
 * résolvent `var(--origam-space---6)`, déclaré à `24px` dans `primitive.css`
 * (relu dans la feuille, pas cité de mémoire). Un test qui vérifierait
 * seulement que deux rendus diffèrent passerait sur un canal mort dans le
 * mauvais sens.
 */
const SCALE_6_PX = '24px'

const STORY = (slug: string) => `/stories/story/components-stories-${ slug }-story-vue`

type TChannel = {
    /** `p` -> `.origam--p-6`, `m` -> `.origam--m-6` */
    fam: 'p' | 'm'
    /** Longhand lu — jamais le raccourci : `getPropertyValue()` sur un
     *  raccourci renvoie `""` dès que la valeur contient `var()`. */
    prop: 'paddingTop' | 'marginTop' | 'marginBottom'
    /** Pourquoi CE côté-là, quand ce n'est pas le côté par défaut. */
    why?: string
}

type TCase = [name: string, slug: string, selector: string, channels: TChannel[]]

const CASES: TCase[] = [
    ['OrigamAlert', 'alert-origamalert', '.origam-alert', [{ fam: 'p', prop: 'paddingTop' }, { fam: 'm', prop: 'marginTop' }]],
    ['OrigamAudio', 'audio-origamaudio', '.origam-audio', [{ fam: 'p', prop: 'paddingTop' }]],
    [
        'OrigamBlockquote', 'blockquote-origamblockquote', '.origam-blockquote',
        [
            {
                fam: 'p',
                prop: 'paddingTop',
                // `variant` vaut `'default'`, donc `--variant-default` est
                // TOUJOURS présente et possède `padding-inline-start` à
                // (0,2,0) : le côté inline-start reste tenu par le
                // modificateur, par décision. Le canal block répond.
                why: 'padding-inline-start appartient au modificateur --variant-default'
            },
            { fam: 'm', prop: 'marginTop' }
        ]
    ],
    ['OrigamBracket', 'bracket-origambracket', '.origam-bracket', [{ fam: 'p', prop: 'paddingTop' }]],
    ['OrigamBreadcrumb', 'breadcrumb-origambreadcrumb', '.origam-breadcrumb', [{ fam: 'p', prop: 'paddingTop' }, { fam: 'm', prop: 'marginTop' }]],
    ['OrigamBreadcrumbDivider', 'breadcrumb-origambreadcrumbdivider', '.origam-breadcrumb-divider', [{ fam: 'p', prop: 'paddingTop' }, { fam: 'm', prop: 'marginTop' }]],
    ['OrigamBreadcrumbItem', 'breadcrumb-origambreadcrumbitem', '.origam-breadcrumb-item', [{ fam: 'p', prop: 'paddingTop' }, { fam: 'm', prop: 'marginTop' }]],
    ['OrigamCalendar', 'calendar-origamcalendar', '.origam-calendar', [{ fam: 'p', prop: 'paddingTop' }]],
    ['OrigamCard', 'card-origamcard', '.origam-card', [{ fam: 'p', prop: 'paddingTop' }, { fam: 'm', prop: 'marginTop' }]],
    ['OrigamContainer', 'grids-origamcontainer', '.origam-container', [{ fam: 'p', prop: 'paddingTop' }, { fam: 'm', prop: 'marginTop' }]],
    ['OrigamDataList', 'datalist-origamdatalist', '.origam-data-list', [{ fam: 'p', prop: 'paddingTop' }]],
    // Divider n'appelle jamais `usePadding` : aucun canal `padding` à ouvrir,
    // et le recensement ne l'a listé que sur `margin`.
    ['OrigamDivider', 'divider-origamdivider', '.origam-divider', [{ fam: 'm', prop: 'marginTop' }]],
    ['OrigamExpansionPanels', 'expansionpanel-origamexpansionpanels', '.origam-expansion-panels', [{ fam: 'p', prop: 'paddingTop' }]],
    ['OrigamList', 'list-origamlist', '.origam-list', [{ fam: 'p', prop: 'paddingTop' }]],
    ['OrigamListItem', 'list-origamlistitem', '.origam-list-item', [{ fam: 'p', prop: 'paddingTop' }, { fam: 'm', prop: 'marginTop' }]],
    ['OrigamMessages', 'messages-origammessages', '.origam-messages', [{ fam: 'p', prop: 'paddingTop' }]],
    // `margin` était mesurée VIVANTE sur Pagination (la racine n'en déclare
    // aucune) — rien n'y a été abaissé, donc rien n'est épinglé ici.
    ['OrigamPagination', 'pagination-origampagination', '.origam-pagination', [{ fam: 'p', prop: 'paddingTop' }]],
    ['OrigamQrCode', 'qrcode-origamqrcode', '.origam-qr-code', [{ fam: 'p', prop: 'paddingTop' }]],
    [
        'OrigamRow', 'grids-origamrow', '.origam-row',
        [
            { fam: 'p', prop: 'paddingTop' },
            {
                fam: 'm',
                prop: 'marginBottom',
                // `.origam-row + .origam-row` est à (0,3,0) et écrase
                // `margin-block-start` de tout Row qui suit un autre Row
                // (c'est la gouttière, et elle doit rester). On lit donc le
                // côté block-end, qu'aucune règle ne dispute.
                why: 'margin-block-start est disputé par la règle de gouttière + .origam-row (0,3,0)'
            }
        ]
    ],
    ['OrigamSheet', 'sheet-origamsheet', '.origam-sheet', [{ fam: 'p', prop: 'paddingTop' }, { fam: 'm', prop: 'marginTop' }]],
    ['OrigamTitle', 'title-origamtitle', '.origam-title', [{ fam: 'm', prop: 'marginTop' }]]
]

test.describe('#950 — la forme d\'echelle de padding/margin gagne la cascade (:where sur le defaut)', () => {
    for (const [name, slug, selector, channels] of CASES) {
        for (const { fam, prop, why } of channels) {
            const utility = `origam--${ fam }-6`
            const label = fam === 'p' ? 'padding="6"' : 'margin="6"'

            test(`${ name } : ${ label } peint ${ SCALE_6_PX } (.${ utility } bat la regle scopee)${ why ? ' — ' + why : '' }`, async ({ page }) => {
                await openVariant(page, STORY(slug), 'Design')
                const host = sandboxOf(page).locator(selector).first()
                await expect(host).toBeVisible({ timeout: 8000 })

                // Mutation ET lecture dans un seul `evaluate` : la `:class`
                // de la racine est liee a un `computed`, donc Vue re-patche
                // la liste entre deux etapes.
                const measured = await host.evaluate((el, args) => {
                    const target = el as HTMLElement
                    const shorthand = args.fam === 'p' ? 'padding' : 'margin'

                    // ⛔ On neutralise d'abord le canal INLINE, et il faut
                    // dire pourquoi, sinon ce test mesure autre chose que
                    // #950.
                    //
                    // Plusieurs stories posent un `style="padding: 16px"` EN
                    // DUR sur le composant (Sheet/Design en est le cas le
                    // plus visible) — un vestige d'avant l'existence du
                    // controle `Padding`, qui rend ce controle inerte. Or une
                    // declaration inline bat TOUJOURS une regle de feuille,
                    // classe utilitaire comprise.
                    //
                    // Ce canal n'a jamais ete le defaut de #950 : le
                    // recensement a prouve qu'il gagne deja (`ctl=37px` sur
                    // les 42 elements mesures), ce qui est exactement
                    // pourquoi `:padding="6"` (nombre) et `padding="6px 8px"`
                    // (custom) fonctionnaient pendant que `padding="6"`
                    // (echelle) ne peignait rien. #950 porte sur UNE bataille
                    // precise : la classe utilitaire contre la regle scopee
                    // du composant. C'est celle-la qu'on mesure ici.
                    const inlineBefore = target.style.getPropertyValue(shorthand)
                        || target.style.getPropertyValue(args.cssProp)
                    target.style.removeProperty(shorthand)
                    target.style.removeProperty(args.cssProp)

                    // Meme raison cote classes : si la story a deja seme une
                    // valeur d'echelle, deux utilitaires a (0,1,0) se
                    // departageraient par l'ordre de la feuille. On part
                    // propre pour que l'assertion porte sur notre cran.
                    const seeded: string[] = []
                    for (const cls of Array.from(target.classList)) {
                        if (new RegExp(`^origam--${ args.fam }-`).test(cls)) {
                            seeded.push(cls)
                            target.classList.remove(cls)
                        }
                    }

                    const before = getComputedStyle(target)[args.prop as never] as string

                    target.classList.add(args.utility)
                    const after = getComputedStyle(target)[args.prop as never] as string

                    // Controle par element : une declaration INLINE du meme
                    // longhand doit bouger la valeur. Si elle ne bouge pas,
                    // l'element ne recalcule pas et la lecture ne vaut RIEN
                    // — c'est le garde-fou qui a ecarte Main / BottomNav /
                    // ExpansionPanel du recensement.
                    target.style.setProperty(args.cssProp, '37px')
                    const ctl = getComputedStyle(target)[args.prop as never] as string
                    target.style.removeProperty(args.cssProp)

                    return { before, after, ctl, inlineBefore, seeded }
                }, {
                    prop,
                    utility,
                    fam,
                    cssProp: prop.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())
                })

                // 1. L'element recalcule vraiment (sinon tout le reste est du bruit).
                expect(measured.ctl, `sonde aveugle sur ${ name } : le canal inline lui-meme ne bouge pas`).toBe('37px')

                // 2. Contre-epreuve : le defaut EXISTAIT et differait, sinon
                //    l'assertion positive ne prouverait rien.
                expect(measured.before, `${ name } rendait deja ${ SCALE_6_PX } au repos : ce cas ne prouve rien`).not.toBe(SCALE_6_PX)

                // 3. Le fait attendu : l'utilitaire gagne desormais.
                expect(measured.after).toBe(SCALE_6_PX)
            })
        }
    }
})

/**
 * ⛔ NON-RÉGRESSION SUR LES MODIFICATEURS — la moitié qui compte.
 *
 * `:where(&)` n'a de valeur que si elle NE descend QUE les défauts. Si un
 * modificateur ou un état se mettait à perdre contre une classe utilitaire,
 * le remède serait pire que le mal : c'est exactement le reproche mesuré
 * contre `@layer` (495 déclarations d'état sur 154 composants).
 *
 * Les trois cas ci-dessous posent la classe utilitaire ET le modificateur sur
 * le même élément, et vérifient que c'est le MODIFICATEUR qui peint.
 */
test.describe('#950 — non-regression : un modificateur garde sa (0,2,0) face a l\'utilitaire', () => {
    test('OrigamAudio : &--compact garde son padding malgre .origam--p-6', async ({ page }) => {
        await openVariant(page, STORY('audio-origamaudio'), 'Design')
        const host = sandboxOf(page).locator('.origam-audio').first()
        await expect(host).toBeVisible({ timeout: 8000 })

        const measured = await host.evaluate((el) => {
            el.classList.add('origam--p-6')
            const utilityOnly = getComputedStyle(el).paddingTop

            el.classList.add('origam-audio--compact')

            return { utilityOnly, withModifier: getComputedStyle(el).paddingTop }
        })

        // L'utilitaire gagne quand le modificateur est absent…
        expect(measured.utilityOnly).toBe(SCALE_6_PX)
        // … et le perd des que `--compact` est la : `padding: var(
        // --origam-audio--compact---padding, 8px 12px)` a (0,2,0). Le token
        // n'est declare dans aucune feuille, donc le fallback s'applique.
        expect(measured.withModifier).toBe('8px')
    })

    test('OrigamDivider : &--inset garde son margin-inline-start malgre .origam--m-6', async ({ page }) => {
        await openVariant(page, STORY('divider-origamdivider'), 'Design')
        const host = sandboxOf(page).locator('.origam-divider').first()
        await expect(host).toBeVisible({ timeout: 8000 })

        const measured = await host.evaluate((el) => {
            el.classList.add('origam--m-6')
            const utilityOnly = getComputedStyle(el).marginLeft

            el.classList.add('origam-divider--inset')

            return { utilityOnly, withModifier: getComputedStyle(el).marginLeft }
        })

        expect(measured.utilityOnly).toBe(SCALE_6_PX)
        // `--origam-divider--inset---margin-inline-start` n'est declare dans
        // aucune feuille : le fallback `16px` de la regle scopee s'applique.
        expect(measured.withModifier).toBe('16px')
    })

    test('OrigamBlockquote : &--variant-minimal garde son padding-block malgre .origam--p-6', async ({ page }) => {
        await openVariant(page, STORY('blockquote-origamblockquote'), 'Design')
        const host = sandboxOf(page).locator('.origam-blockquote').first()
        await expect(host).toBeVisible({ timeout: 8000 })

        const measured = await host.evaluate((el) => {
            el.classList.add('origam--p-6')
            const utilityOnly = getComputedStyle(el).paddingTop

            el.classList.remove('origam-blockquote--variant-default')
            el.classList.add('origam-blockquote--variant-minimal')

            return { utilityOnly, withModifier: getComputedStyle(el).paddingTop }
        })

        expect(measured.utilityOnly).toBe(SCALE_6_PX)
        // `--variant-minimal` declare `padding-block: 0` en litteral a
        // (0,2,0) : il bat l'utilitaire (0,1,0).
        expect(measured.withModifier).toBe('0px')
    })
})
