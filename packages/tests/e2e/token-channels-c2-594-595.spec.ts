import { expect, test } from '@playwright/test'

/**
 * SPEC — C2, canaux de thème ouverts sur Audio (#594) et sur les champs et
 * contrôles SliderField / Field / Switch / Chip (#595)
 *
 * ## Ce que ce spec encode
 *
 * Les deux lots ont déclaré 51 tokens que le SCSS de ces composants **lisait
 * déjà** et qu'aucune feuille ne déclarait. Tant qu'un nom n'est pas déclaré,
 * `var(--nom, repli)` prend silencieusement son repli : un consommateur qui
 * pose ce nom dans son `IOrigamTheme` ne voit **rien** changer, sans erreur ni
 * avertissement. C'est la définition d'un canal de thème mort.
 *
 * Cinq canaux de plus sont résorbés SANS déclaration, par effondrement du site
 * de lecture — voir `COLLAPSED_MUST_STAY_UNDECLARED` plus bas et son contrôle
 * négatif. Total du lot : 51 déclarés + 5 effondrés = 56 canaux.
 *
 * Trois assertions, et elles répondent à trois questions différentes :
 *
 * 1. **Le canal existe** — chaque nom résout maintenant à `:root`. Avant le
 *    correctif, `getPropertyValue()` renvoie la chaîne vide sur les 47.
 * 2. **Le rendu n'a pas bougé** — pour chaque token, la valeur déclarée
 *    produit la MÊME valeur calculée que le repli qu'elle remplace. C'est la
 *    garantie « zéro pixel déplacé » du lot, vérifiée propriété par propriété
 *    plutôt que déduite.
 * 3. **Rien de faux n'est entré dans le canal** — les cinq noms effondrés ne
 *    résolvent PAS. Contrôle négatif : sans lui, un lot qui déclarerait ces
 *    noms « pour faire baisser le compteur » passerait au vert.
 *
 * ## Pourquoi Playwright, et pourquoi un `<div>` neuf
 *
 * ⛔ Sous jsdom, `getComputedStyle` ne résout JAMAIS un `var()` : il renvoie
 * un `16px` fabriqué. Une assertion unitaire passerait au vert sur le code
 * cassé comme sur le code corrigé (CLAUDE.md, #398).
 *
 * ⛔ Et dans l'iframe `__sandbox`, un élément **déjà rendu par Vue** ne
 * recalcule pas toujours après une mutation, alors qu'un `<div>` créé dans le
 * même document répond correctement (CLAUDE.md, mesure du 2026-09-09). Le
 * comparateur d'équivalence crée donc ses propres éléments : ce qu'il mesure
 * est la résolution du token par le navigateur, pas le rendu d'un composant —
 * et c'est exactement la question posée.
 *
 * ## Portée de la preuve, et ce qu'elle ne couvre pas
 *
 * Le troisième test compare, propriété par propriété, la valeur calculée
 * obtenue VIA LE TOKEN à celle obtenue via le repli littéral que le SCSS
 * écrivait avant. C'est la preuve « zéro pixel déplacé » par équivalence de
 * valeurs, et elle vaut pour les deux modes puisque chaque valeur déclarée est
 * identique en light et en dark (vérifié en amont sur les quatre feuilles).
 *
 * Elle ne remplace PAS un contrôle du rendu des composants eux-mêmes : deux
 * valeurs égales ne prouvent pas que le sélecteur qui les consomme matche
 * encore. Ce lot s'appuie pour cela sur le fait qu'aucune RÈGLE n'a été
 * ajoutée ni déplacée — seules des déclarations à `:root` et cinq
 * effondrements de repli inatteignable.
 */

/** Story quelconque : on interroge la feuille de tokens, pas un composant. */
const STORY_ID = 'components-stories-switch-origamswitch-story-vue'
const STORY_PATH = `/stories/story/${STORY_ID}?variantId=${STORY_ID}-0`

/**
 * `token` — le nom déclaré par #594 / #595.
 * `prop`  — la propriété CSS sur laquelle mesurer l'équivalence.
 * `read`  — le longhand à relire (un raccourci renvoie `""` dès qu'il contient
 *           un `var()`).
 * `was`   — le repli EXACT que le SCSS écrivait avant la déclaration.
 */
type TokenCase = { token: string, prop: string, read: string, was: string }

const SWITCH_CASES: TokenCase[] = [
    { token: '--origam-switch__thumb---border-color', prop: 'background-color', read: 'background-color', was: 'rgba(0, 0, 0, 0.18)' },
    { token: '--origam-switch__thumb---color', prop: 'color', read: 'color', was: 'currentColor' },
    { token: '--origam-switch__selection-control---min-height', prop: 'width', read: 'width', was: '56px' },
    { token: '--origam-switch__skeleton---width', prop: 'width', read: 'width', was: '52px' },
    { token: '--origam-switch__skeleton---height', prop: 'width', read: 'width', was: '32px' },
    { token: '--origam-switch__skeleton-track---background-color', prop: 'background-color', read: 'background-color', was: 'color-mix(in srgb, currentColor 14%, transparent)' },
    { token: '--origam-switch__skeleton-thumb---background-color', prop: 'background-color', read: 'background-color', was: 'color-mix(in srgb, currentColor 28%, transparent)' },
    { token: '--origam-switch__track--inset---height', prop: 'width', read: 'width', was: '32px' },
    { token: '--origam-switch__track--inset---width', prop: 'width', read: 'width', was: '52px' }
]

const CHIP_CASES: TokenCase[] = [
    { token: '--origam-chip---height-xs', prop: 'width', read: 'width', was: '20px' },
    { token: '--origam-chip---height-sm', prop: 'width', read: 'width', was: '24px' },
    { token: '--origam-chip---height-md', prop: 'width', read: 'width', was: '32px' },
    { token: '--origam-chip---height-lg', prop: 'width', read: 'width', was: '38px' },
    { token: '--origam-chip---height-xl', prop: 'width', read: 'width', was: '44px' },
    { token: '--origam-chip---border-radius-rounded', prop: 'border-top-left-radius', read: 'border-top-left-radius', was: '16px' },
    { token: '--origam-chip__close---margin-inline-start', prop: 'margin-inline-start', read: 'margin-left', was: '6px' },
    { token: '--origam-chip__close---margin-inline-end', prop: 'margin-inline-end', read: 'margin-right', was: '-4px' }
]

const SLIDER_CASES: TokenCase[] = [
    { token: '--origam-slider-field-thumb__surface---border-color', prop: 'background-color', read: 'background-color', was: 'rgba(0, 0, 0, 0.18)' },
    { token: '--origam-slider-field__buffered---background-color', prop: 'background-color', read: 'background-color', was: 'color-mix(in srgb, currentColor 40%, transparent)' },
    { token: '--origam-slider-field__buffered---opacity', prop: 'opacity', read: 'opacity', was: '0.5' },
    { token: '--origam-slider-field__buffered--bare---background-color', prop: 'background-color', read: 'background-color', was: 'color-mix(in srgb, currentColor 40%, transparent)' },
    { token: '--origam-slider-field__track---transition', prop: 'transition', read: 'transition-duration', was: '0.3s cubic-bezier(0.25, 0.8, 0.5, 1)' },
    { token: '--origam-slider-field__hover-tooltip---background-color', prop: 'background-color', read: 'background-color', was: 'var(--origam-color__surface--inverse---bg, rgba(0, 0, 0, 0.85))' },
    { token: '--origam-slider-field__hover-tooltip---color', prop: 'color', read: 'color', was: 'var(--origam-color__on--inverse---fg, #ffffff)' },
    { token: '--origam-slider-field--bare---accent-color', prop: 'color', read: 'color', was: 'var(--origam-color__action--primary---bg)' },
    { token: '--origam-slider-field--bare---thumb-size', prop: 'width', read: 'width', was: '12px' },
    { token: '--origam-slider-field--bare---track-background-color', prop: 'background-color', read: 'background-color', was: 'color-mix(in srgb, currentColor 25%, transparent)' },
    { token: '--origam-slider-field--bare---track-thickness', prop: 'width', read: 'width', was: '2px' },
    { token: '--origam-slider-field--bare---track-thickness-active', prop: 'width', read: 'width', was: '4px' }
]

const AUDIO_CASES: TokenCase[] = [
    { token: '--origam-audio__header---margin-bottom', prop: 'margin-bottom', read: 'margin-bottom', was: '12px' },
    { token: '--origam-audio__btn---size', prop: 'width', read: 'width', was: '28px' },
    { token: '--origam-audio__btn---icon-size', prop: 'font-size', read: 'font-size', was: '16px' },
    { token: '--origam-audio__playlist---max-height', prop: 'max-height', read: 'max-height', was: '220px' },
    { token: '--origam-audio__playlist---padding-top', prop: 'padding-top', read: 'padding-top', was: '8px' },
    { token: '--origam-audio__playlist---margin-top', prop: 'margin-top', read: 'margin-top', was: '12px' },
    { token: '--origam-audio__playlist---border-color', prop: 'background-color', read: 'background-color', was: 'color-mix(in srgb, currentColor 8%, transparent)' },
    { token: '--origam-audio__playlist-subtitle---color', prop: 'color', read: 'color', was: 'var(--origam-color__text---secondary)' },
    { token: '--origam-audio__playlist-duration---color', prop: 'color', read: 'color', was: 'var(--origam-color__text---secondary)' },
    { token: '--origam-audio__playlist-item__prepend---margin-inline-end', prop: 'margin-inline-end', read: 'margin-right', was: '12px' },
    { token: '--origam-audio--compact__header---gap', prop: 'gap', read: 'row-gap', was: '12px' },
    { token: '--origam-audio--compact__btn---size', prop: 'width', read: 'width', was: '24px' },
    { token: '--origam-audio--compact__btn---icon-size', prop: 'font-size', read: 'font-size', was: '14px' },
    { token: '--origam-audio--compact__play-btn---size', prop: 'width', read: 'width', was: '56px' },
    { token: '--origam-audio--compact__play-btn---icon-size', prop: 'font-size', read: 'font-size', was: '40px' },
    { token: '--origam-audio--compact__progress---height', prop: 'width', read: 'width', was: '3px' }
]

/**
 * Deux tokens réalignés sur la valeur RÉELLEMENT livrée en dur par le SCSS,
 * puis câblés. La feuille annonçait une autre valeur ; la câbler telle quelle
 * aurait déplacé le rendu de toute la famille.
 */
const REALIGNED: { token: string, expected: string, wasAnnouncing: string }[] = [
    { token: '--origam-field---letter-spacing', expected: '0.009375em', wasAnnouncing: 'var(--origam-font__letterSpacing---wide) — 0.0094em' },
    { token: '--origam-slider-field__tick---border-radius', expected: '2px', wasAnnouncing: 'var(--origam-radius---full) — 9999px' }
]

/** Déclarés par une valeur littérale : leur texte calculé est vérifiable tel quel. */
const LITERAL_AT_ROOT: Record<string, string> = {
    '--origam-switch__thumb---border-color': 'rgba(0, 0, 0, 0.18)',
    '--origam-switch__thumb---color': 'currentColor',
    '--origam-switch__selection-control---min-height': '56px',
    '--origam-switch__skeleton---width': '52px',
    '--origam-switch__skeleton---height': '32px',
    '--origam-switch__track--inset---height': '32px',
    '--origam-switch__track--inset---width': '52px',
    '--origam-chip---height-xs': '20px',
    '--origam-chip---height-sm': '24px',
    '--origam-chip---height-md': '32px',
    '--origam-chip---height-lg': '38px',
    '--origam-chip---height-xl': '44px',
    '--origam-chip---border-radius-rounded': '16px',
    '--origam-chip__close---margin-inline-start': '6px',
    '--origam-chip__close---margin-inline-end': '-4px',
    '--origam-slider-field-thumb__surface---border-color': 'rgba(0, 0, 0, 0.18)',
    '--origam-slider-field__buffered---opacity': '0.5',
    '--origam-slider-field--bare---thumb-size': '12px',
    '--origam-slider-field--bare---track-thickness': '2px',
    '--origam-slider-field--bare---track-thickness-active': '4px',
    '--origam-audio__header---margin-bottom': '12px',
    '--origam-audio__btn---size': '28px',
    '--origam-audio__btn---icon-size': '16px',
    '--origam-audio__playlist---max-height': '220px',
    '--origam-audio__playlist---padding-top': '8px',
    '--origam-audio__playlist---margin-top': '12px',
    '--origam-audio__playlist-item__prepend---margin-inline-end': '12px',
    '--origam-audio--compact---padding': '8px 12px',
    '--origam-audio--compact__header---gap': '12px',
    '--origam-audio--compact__btn---size': '24px',
    '--origam-audio--compact__btn---icon-size': '14px',
    '--origam-audio--compact__play-btn---size': '56px',
    '--origam-audio--compact__play-btn---icon-size': '40px',
    '--origam-audio--compact__progress---height': '3px',
    // Field. Les deux premiers sont déclarés par un barreau (`radius---xl`,
    // `space---1`) : une custom property est substituée au calcul de sa valeur,
    // donc `getPropertyValue` rend bien `16px` / `4px`, pas le texte `var(…)`.
    '--origam-field---border-radius-rounded': '16px',
    '--origam-field--inline---padding-inline': '4px',
    '--origam-field--variant-filled---border-opacity': '0.42'
}

/**
 * ⛔ CINQ canaux résorbés autrement : par EFFONDREMENT du site de lecture, pas
 * par une déclaration. Chacun était l'échelon 2 d'un `var(RUNG1, var(RUNG2, T))`
 * dont le RUNG1 est déclaré light ET dark — l'échelon 2 était donc
 * INATTEIGNABLE par construction, il ne peignait rien et ne pouvait rien
 * peindre. Ils ne doivent PAS résoudre à `:root` : les déclarer graverait dans
 * le canal public des noms que rien ne consomme (et pour trois d'entre eux, des
 * noms d'une grammaire qui n'existe pas).
 */
const COLLAPSED_MUST_STAY_UNDECLARED = [
    // Famille fantôme : zéro déclaration de `--origam-color__status--*` dans
    // tout `assets/`, et `--error--bg` écrivait même `--bg` au lieu de `---bg`.
    '--origam-color__status--error---color',
    '--origam-color__status--error--bg',
    // Nom à occurrence unique dans tout le dépôt (son propre site de lecture),
    // et `--origam-theme` n'est pas un bloc de composant.
    '--origam-theme---elevation',
    // Toujours lus, mais par la FEUILLE (déclaration de
    // `--origam-slider-field__hover-tooltip---*`), plus par le composant.
    '--origam-color__on--inverse---fg',
    '--origam-color__surface--inverse---bg'
]

/**
 * Field — quatre canaux que le premier passage du lot avait laissés (#595
 * nomme `Field` dans son périmètre et zéro canal Field n'y avait été résorbé).
 *
 * `16px` et `4px` coïncident EXACTEMENT avec `radius---xl` et `space---1`
 * (vérifié sur `primitive.css`), ils sont donc déclarés par leur barreau
 * plutôt qu'en dur — la valeur calculée reste la même, et un thème qui règle
 * l'échelle est désormais suivi. `0.42` n'a aucun barreau d'opacité
 * (l'échelle va 0/12/26/32/50/60/70/87/100) : littéral assumé.
 */
const FIELD_CASES: TokenCase[] = [
    { token: '--origam-field---border-radius-rounded', prop: 'border-top-left-radius', read: 'border-top-left-radius', was: '16px' },
    { token: '--origam-field--inline---padding-inline', prop: 'padding-inline', read: 'padding-left', was: '4px' },
    { token: '--origam-field--variant-filled---background-color', prop: 'background-color', read: 'background-color', was: 'color-mix(in srgb, currentColor 12%, transparent)' },
    { token: '--origam-field--variant-filled---border-opacity', prop: 'opacity', read: 'opacity', was: '.42' }
]

const ALL_CASES = [ ...SWITCH_CASES, ...CHIP_CASES, ...SLIDER_CASES, ...AUDIO_CASES, ...FIELD_CASES ]

/** Les deux noms non couverts par `ALL_CASES` : `content` et le raccourci `padding`. */
const EXTRA_TOKENS = [ '--origam-audio__meta-separator---content', '--origam-audio--compact---padding' ]

test.describe('C2 — canaux de thème d\'Audio et des champs / contrôles (#594, #595)', () => {
    test.setTimeout(60000)

    test('les 51 tokens déclarés résolvent tous à :root', async ({ page }) => {
        await page.goto(STORY_PATH, { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-switch').first()).toBeVisible({ timeout: 15000 })

        const names = [ ...ALL_CASES.map((c) => c.token), ...EXTRA_TOKENS, ...REALIGNED.map((r) => r.token) ]

        const frame = page.frames().find((f) => f.url().includes('__sandbox'))
        expect(frame, 'iframe __sandbox introuvable').toBeTruthy()

        const resolved = await frame!.evaluate((list: string[]) => {
            const cs = getComputedStyle(document.documentElement)
            const out: Record<string, string> = {}
            for (const n of list) out[n] = cs.getPropertyValue(n).trim()

            return out
        }, names)

        const empty = Object.entries(resolved).filter(([ , v ]) => v === '').map(([ n ]) => n)

        expect(empty, 'tokens encore non déclarés (canal de thème mort)').toEqual([])
        expect(Object.keys(resolved)).toHaveLength(53)
    })

    /**
     * Contrôle NÉGATIF. Sans lui, le spec ne distingue pas « le lot a résorbé
     * ces cinq canaux en effondrant leur site de lecture » de « quelqu'un les a
     * déclarés à tout hasard » — deux états que la garde compte pareil, parce
     * qu'elle compare des noms et non des chaînes de repli.
     */
    test('les cinq canaux effondrés restent NON déclarés', async ({ page }) => {
        await page.goto(STORY_PATH, { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-switch').first()).toBeVisible({ timeout: 15000 })

        const frame = page.frames().find((f) => f.url().includes('__sandbox'))
        expect(frame, 'iframe __sandbox introuvable').toBeTruthy()

        const resolved = await frame!.evaluate((list: string[]) => {
            const cs = getComputedStyle(document.documentElement)
            const out: Record<string, string> = {}
            for (const n of list) out[n] = cs.getPropertyValue(n).trim()

            return out
        }, COLLAPSED_MUST_STAY_UNDECLARED)

        const declared = Object.entries(resolved).filter(([ , v ]) => v !== '').map(([ n ]) => n)

        expect(declared, 'un nom effondré a été déclaré : il ne doit pas entrer dans le canal public').toEqual([])
    })

    test('les valeurs littérales déclarées sont exactement celles que le SCSS livrait', async ({ page }) => {
        await page.goto(STORY_PATH, { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-switch').first()).toBeVisible({ timeout: 15000 })

        const frame = page.frames().find((f) => f.url().includes('__sandbox'))
        const names = [ ...Object.keys(LITERAL_AT_ROOT), ...REALIGNED.map((r) => r.token) ]

        const resolved = await frame!.evaluate((list: string[]) => {
            const cs = getComputedStyle(document.documentElement)
            const out: Record<string, string> = {}
            for (const n of list) out[n] = cs.getPropertyValue(n).trim()

            return out
        }, names)

        const expected: Record<string, string> = { ...LITERAL_AT_ROOT }
        for (const r of REALIGNED) expected[r.token] = r.expected

        expect(resolved).toEqual(expected)
    })

    test('déclarer le token produit la même valeur calculée que le repli remplacé', async ({ page }) => {
        await page.goto(STORY_PATH, { waitUntil: 'domcontentloaded' })
        const sandbox = page.frameLocator('iframe[src*="__sandbox"]')
        await expect(sandbox.locator('.origam-switch').first()).toBeVisible({ timeout: 15000 })

        const frame = page.frames().find((f) => f.url().includes('__sandbox'))

        const diffs = await frame!.evaluate((cases: TokenCase[]) => {
            const host = document.createElement('div')
            // Une couleur d'hôte connue : `currentColor` et `color-mix(… currentColor …)`
            // doivent se résoudre sur la MÊME base des deux côtés de la comparaison.
            host.style.color = 'rgb(17, 34, 51)'
            host.style.font = '16px sans-serif'
            document.body.appendChild(host)

            const out: { token: string, viaToken: string, viaFallback: string }[] = []

            for (const c of cases) {
                const a = document.createElement('div')
                const b = document.createElement('div')
                host.append(a, b)

                a.style.setProperty(c.prop, `var(${c.token})`)
                b.style.setProperty(c.prop, c.was)

                const viaToken = getComputedStyle(a).getPropertyValue(c.read).trim()
                const viaFallback = getComputedStyle(b).getPropertyValue(c.read).trim()

                if (viaToken !== viaFallback || viaToken === '') out.push({ token: c.token, viaToken, viaFallback })

                a.remove()
                b.remove()
            }

            host.remove()

            return out
        }, ALL_CASES)

        expect(diffs, 'un token déclaré ne rend pas ce que son repli rendait').toEqual([])
    })
})
