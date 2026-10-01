/*
 * OrigamBlockquote — la table de presets LIVREE, et ce que chaque valeur
 * EMET reellement. ADR-005 D7, lot #1015.
 *
 * `variant-preset-resolver.spec.ts` couvre le MECANISME sur un composant
 * synthetique : vider `VARIANT_PRESETS` le laisserait entierement vert.
 * `OrigamKbdVariantPreset.spec.ts` fait la meme chose pour le pilote. Ce
 * fichier epingle l'autre moitie pour Blockquote — que le DS livre bien la
 * table, et que chaque chaine du preset traverse son composable au lieu
 * d'etre silencieusement jetee.
 *
 * ⛔ AUCUNE ASSERTION SUR `getComputedStyle` ICI. Sous jsdom il ne resout
 * JAMAIS un `var()` et rend un `16px` FABRIQUE (CLAUDE.md #398) ; or toute
 * cette surface est pilotee par des tokens. On lit donc l'ATTRIBUT `style`
 * et les classes — les deux outils que le CLAUDE.md declare fiables, un
 * `style` inline litteral se resolvant correctement. Le verdict de rendu
 * est dans `e2e/blockquote.spec.ts`, en vrai navigateur.
 *
 * ⛔ ET C'EST LA RAISON D'ETRE DES CONTROLES NEGATIFS EN FIN DE FICHIER.
 * « Rien n'a ete emis » et « la valeur est correcte » se ressemblent dans
 * une assertion mal posee. Les trois derniers cas prouvent que ces
 * assertions DETECTENT : ils passent des formes que `BORDER_REGEX` rejette
 * (`calc()` en largeur, largeur fractionnaire) ou decoupe (la prop globale
 * `border`), et verifient qu'on le voit.
 */
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { installThemePropsResolver } from '@origam/composables/Commons/theme-props-resolver.composable'
import OrigamBlockquote from '@origam/components/Blockquote/OrigamBlockquote.vue'
import { BLOCKQUOTE_VARIANT_PRESETS, VARIANT_PRESETS, VARIANT_PROP_KEY } from '@origam/consts'
import { BLOCKQUOTE_VARIANT } from '@origam/enums'

import type { IBlockquoteProps } from '@origam/interfaces'

const BLOCKQUOTE_NAME = 'origam-blockquote'

function mountBlockquote (props: Partial<IBlockquoteProps> = {}) {
    return mount(OrigamBlockquote, {
        props,
        global: {
            plugins: [{
                install (app) {
                    installThemePropsResolver(app, new Map(), VARIANT_PRESETS)
                }
            }]
        }
    })
}

const styleOf = (props: Partial<IBlockquoteProps>) => mountBlockquote(props).attributes('style') ?? ''

describe('BLOCKQUOTE_VARIANT_PRESETS — la table que le DS livre', () => {
    it('est enregistree sous son nom kebab dans VARIANT_PRESETS', () => {
        // Le lot 1 livrait un registre VIDE, et le lot 2 n'y avait mis que
        // Kbd. Cette assertion est ce qui empeche un retour silencieux.
        expect(VARIANT_PRESETS[BLOCKQUOTE_NAME]).toBe(BLOCKQUOTE_VARIANT_PRESETS)
    })

    it('couvre les CINQ valeurs de l\'enum, sans en inventer une sixieme', () => {
        // Source unique : l'enum. Une valeur ajoutee a l'enum sans entree
        // dans la table rougit ici plutot qu'au runtime.
        expect(Object.keys(BLOCKQUOTE_VARIANT_PRESETS).sort())
                .toEqual(Object.values(BLOCKQUOTE_VARIANT).sort())
    })

    it('ne pose JAMAIS la cle `variant` — c\'est la garde anti-recursion', () => {
        for (const [variant, preset] of Object.entries(BLOCKQUOTE_VARIANT_PRESETS)) {
            expect(Object.keys(preset), variant).not.toContain(VARIANT_PROP_KEY)
        }
    })

    it('porte un REPLI sur chaque var() de la table — exigence de `ts-token-refs`', () => {
        // Un `var()` assemble en TypeScript sans repli gagne la cascade puis
        // devient `unset` au computed-value time : il EFFACE. Le garde 28
        // l'exige, et ce test le tient comme test plutot que comme prose.
        for (const [variant, preset] of Object.entries(BLOCKQUOTE_VARIANT_PRESETS)) {
            for (const [key, value] of Object.entries(preset)) {
                if (typeof value !== 'string') continue
                for (const ref of value.matchAll(/var\((--[^,)]+)([,)])/g)) {
                    expect(ref[2], `${variant}.${key} -> ${ref[1]}`).toBe(',')
                }
            }
        }
    })

    it('ne RESTATE aucun defaut du composant — `pull` ne repose pas padding-inline', () => {
        // La regle supprimee de `pull` declarait `padding-inline:
        // var(--origam-blockquote---resolved-padding-inline)`, exactement ce
        // que la regle de base pose. L'inscrire ici emettrait une
        // declaration INLINE qui passerait devant la classe utilitaire d'un
        // `padding` du consommateur : la table confisquerait le canal
        // qu'elle est censee servir.
        expect(BLOCKQUOTE_VARIANT_PRESETS.pull).not.toHaveProperty('paddingInline')
    })
})

describe('Ce que chaque preset EMET reellement', () => {
    it('default — filet d\'accent + decalage, les deux canaux de token intacts', () => {
        const style = styleOf({ variant: 'default' })

        expect(style).toContain('border-inline-start-width: var(--origam-blockquote__accent---width, 4px)')
        expect(style).toContain('border-inline-start-style: solid')
        expect(style).toContain('border-inline-start-color: var(--origam-blockquote---resolved-accent-color, currentColor)')
        expect(style).toContain('padding-inline-start: calc(var(--origam-blockquote---padding-inline, 24px) + var(--origam-blockquote__accent---width, 4px))')
    })

    it('elegant — la typographie passe par les proprietes custom que la regle de base lit', () => {
        const style = styleOf({ variant: 'elegant' })

        // `useTypography` n'ecrit JAMAIS `font-size` : il ecrit
        // `--origam-blockquote---font-size`, que la regle de base consomme.
        // C'est precisement pourquoi la regle de variant supprimee — qui
        // declarait `font-size` en direct — rendait la prop inerte.
        expect(style).toContain('--origam-blockquote---font-family: var(--origam-font__family---serif)')
        expect(style).toContain('--origam-blockquote---font-size: var(--origam-font__size---xl)')
        expect(style).toContain('--origam-blockquote---line-height: var(--origam-font__lineHeight---loose)')
        expect(style).toContain('--origam-blockquote---font-style: var(--origam-blockquote__elegant---font-style, italic)')
        expect(style).toContain('padding-block: var(--origam-blockquote__elegant---padding-block, 24px)')
    })

    it('quoted — monte le glyphe ET sur-remplit le haut', () => {
        const wrapper = mountBlockquote({ variant: 'quoted' })

        expect(wrapper.find('.origam-blockquote__mark--bg').exists()).toBe(true)
        expect(wrapper.attributes('style'))
                .toContain('padding-top: calc(var(--origam-blockquote---padding-block, 16px) + var(--origam-blockquote--quoted---glyph-padding-extra, 1rem))')
    })

    it('minimal — padding-inline AVANT padding-inline-start, sinon l\'axe ecraserait le cote', () => {
        const style = styleOf({ variant: 'minimal' })

        // `padding-inline` est un raccourci qui pose les DEUX cotes ; le
        // `padding-inline-start` qui suit doit donc venir APRES pour gagner.
        // `usePadding` emet le rang d'axe avant le rang par cote — cet ordre
        // est le contrat, pas un hasard.
        const axis = style.indexOf('padding-inline: var(--origam-blockquote__minimal---padding-inline, 12px)')
        const side = style.indexOf('padding-inline-start: calc(')

        expect(axis).toBeGreaterThanOrEqual(0)
        expect(side).toBeGreaterThan(axis)
        expect(style).toContain('padding-block: 0px')
    })

    it('minimal — porte le token MORT de #1014 telle quelle, sans le corriger', () => {
        // `--origam-blockquote--minimal---accent-width` n'est declare par
        // aucune feuille (grammaire divergente, double tiret). La fidelite
        // est le travail : le preset porte la chaine verbatim et `minimal`
        // tombe sur son repli `2px`, exactement comme avant la conversion.
        // Corriger le nom ici ferait passer le filet de 2px a autre chose
        // sans que personne ne l'ait demande. -> #1014.
        expect(styleOf({ variant: 'minimal' }))
                .toContain('border-inline-start-width: var(--origam-blockquote--minimal---accent-width, 2px)')
    })

    it('pull — DEUX filets par une seule prop d\'axe, et le centrage', () => {
        const wrapper = mountBlockquote({ variant: 'pull' })
        const style = wrapper.attributes('style') ?? ''

        // Les deux regles supprimees (`border-block-start` et
        // `border-block-end`) portaient la MEME largeur et la MEME couleur,
        // donc une prop d'AXE les exprime toutes les deux.
        expect(style).toContain('border-block-width: var(--origam-blockquote__pull---rule-width, 2px)')
        expect(style).toContain('border-block-color: var(--origam-blockquote---resolved-accent-color, currentColor)')
        expect(wrapper.classes()).toContain('origam-blockquote--align-center')
    })

    it('la classe de variant est TOUJOURS emise — c\'est le crochet du consommateur', () => {
        for (const variant of Object.values(BLOCKQUOTE_VARIANT)) {
            expect(mountBlockquote({ variant }).classes(), variant)
                    .toContain(`origam-blockquote--variant-${variant}`)
        }
    })
})

describe('Le rang du preset dans la chaine', () => {
    it('un prop du site d\'appel BAT le preset — rang 1 contre rang 4', () => {
        // Le defaut dormant que ce lot repare : avant la conversion, la
        // regle `--variant-elegant` declarait `font-size` en direct et
        // gagnait sur la propriete custom que la prop ecrit. Mesure
        // navigateur avant/apres : 18px inerte -> la prop peint.
        expect(styleOf({ variant: 'elegant', fontSize: 'sm' }))
                .toContain('--origam-blockquote---font-size: var(--origam-font__size---sm)')
    })

    it('un align du site d\'appel BAT le centrage de pull', () => {
        expect(mountBlockquote({ variant: 'pull', align: 'left' }).classes())
                .toContain('origam-blockquote--align-left')
    })

    it('`align` retombe sur son plancher withDefaults hors de `pull`', () => {
        expect(mountBlockquote({ variant: 'default' }).classes())
                .toContain('origam-blockquote--align-left')
    })

    it('`quoteMark` est atteignable HORS de `quoted` — le glyphe suit la prop', () => {
        // Consequence voulue de l'exemption famille B : l'effet structurel
        // passe par une prop, donc il se combine librement avec n'importe
        // quel variant. Le modele SCSS rendait cette combinaison
        // impossible.
        expect(mountBlockquote({ variant: 'pull', quoteMark: true })
                .find('.origam-blockquote__mark--bg').exists()).toBe(true)
        expect(mountBlockquote({ variant: 'quoted', quoteMark: false })
                .find('.origam-blockquote__mark--bg').exists()).toBe(false)
    })
})

describe('Controles negatifs — la preuve que les assertions ci-dessus DETECTENT', () => {
    it('BORDER_REGEX rejette un `calc()` en largeur : RIEN n\'est emis', () => {
        expect(styleOf({ borderBlock: 'calc(2px + 1px) solid red' })).not.toContain('border-block-width')
    })

    it('BORDER_REGEX rejette une largeur FRACTIONNAIRE : RIEN n\'est emis', () => {
        // Son groupe `width` est `[0-9]+` + unite, sans decimale. Limite
        // partagee avec `borderLeft` / `borderBlock`, heritee, non corrigee.
        expect(styleOf({ borderBlock: '0.5rem solid red' })).not.toContain('border-block-width')
    })

    it('la prop GLOBALE `border` DECOUPE une largeur var() a repli — d\'ou le choix des props d\'axe', () => {
        // `useBorder` fait `split(' ')` sur la prop globale pour distribuer
        // ses 1/2/4 valeurs, et coupe donc `var(--x, 2px)` en deux
        // fragments invalides. C'est la raison pour laquelle `pull` vise
        // `borderBlock` et non `border`.
        const style = styleOf({ border: 'var(--origam-blockquote__pull---rule-width, 2px) solid red' })

        expect(style).toContain('var(--origam-blockquote__pull---rule-width,')
        expect(style).not.toContain('var(--origam-blockquote__pull---rule-width, 2px)')
    })
})
