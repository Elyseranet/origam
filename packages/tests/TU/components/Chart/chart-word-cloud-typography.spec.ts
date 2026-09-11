// #546 / #426 — OrigamChartWordCloud, typographie de l'en-tête.
//
// ## Ce que ce spec asserait avant, et pourquoi c'était un faux vert
//
// Écrit pour #426, il vérifiait que `fontSize` et `fontWeight` « atteignent le
// style de la racine » — et il le vérifiait en cherchant, dans l'attribut
// `style`, les chaînes `var(--origam-font__size---2rem)` et
// `var(--origam-font__weight---600)`.
//
// ⛔ **Aucun de ces deux tokens n'existe.** L'échelle des tailles est
// `xs · sm · md · lg · xl · 2xl · 3xl · 4xl · 5xl`, celle des graisses
// `regular · medium · semibold · bold · extrabold · black`. Les deux
// références étaient donc irrésolubles : la déclaration partait bien dans le
// DOM, et ne peignait rien. Le test mesurait la PRÉSENCE d'une chaîne, jamais
// son effet — littéralement vrai, visuellement nul.
//
// ## Le défaut de fond, corrigé par #546
//
// `IChartWordCloudProps` redéclare `fontFamily` et `fontWeight` avec un sens
// MÉTIER : la police et la graisse des mots DANS le nuage, en chaînes et
// nombres libres (`fontWeight: 600` est la valeur par défaut, consommée par le
// `<text>` SVG). `ITypographyProps` désigne autre chose sous ces mêmes noms :
// des tokens de design pour l'en-tête du graphique.
//
// Passer `props` en bloc à `useChartHeaderTypography` faisait donc interpoler
// une valeur métier dans un nom de token — d'où les références mortes que
// l'ancien spec figeait. Le composant ne transmet plus que `fontSize`, seule
// clé héritée d'`IChartBaseProps` avec son sens de token intact.
//
// C'est aussi ce qui cassait `vue-tsc` sur `develop` depuis le 2026-08-29.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamChartWordCloud from '@origam/components/Chart/OrigamChartWordCloud.vue'
import { createOrigam } from '@origam/origam'

const series = [ { name: 'S', data: [ { text: 'hello', value: 10 }, { text: 'world', value: 5 } ] } ]

const mountWith = (props: Record<string, unknown>) => mount(OrigamChartWordCloud, {
    props: { series, title: 'My Cloud', ...props } as never,
    global: { plugins: [ createOrigam() ] }
})

describe('OrigamChartWordCloud — typographie de l\'en-tête (#546)', () => {
    it('route un token de taille RÉEL vers --origam-chart__title---font-size', () => {
        // `2xl` existe dans l'échelle ; `2rem`, que l'ancien spec passait, non.
        const wrapper = mountWith({ fontSize: '2xl' })

        expect(wrapper.attributes('style')).toContain('--origam-chart__title---font-size: var(--origam-font__size---2xl)')
    })

    it('ne route RIEN quand fontSize n\'est pas fourni', () => {
        const wrapper = mountWith({})

        expect(wrapper.attributes('style') ?? '').not.toContain('--origam-chart__title---font-size')
    })

    it('⛔ la graisse MÉTIER des mots ne fuit pas dans le token d\'en-tête', () => {
        // `fontWeight` vaut 600 par défaut et pilote le <text> SVG. Il ne doit
        // produire aucune référence `--origam-font__weight---600`, qui
        // n'existe pas et ne peindrait rien.
        const parDefaut = mountWith({})
        const explicite = mountWith({ fontWeight: 800 })

        for (const wrapper of [ parDefaut, explicite ]) {
            const style = wrapper.attributes('style') ?? ''

            expect(style).not.toContain('--origam-font__weight---600')
            expect(style).not.toContain('--origam-font__weight---800')
            expect(style).not.toContain('--origam-chart__title---font-weight')
        }
    })

    it('⛔ la police MÉTIER des mots ne fuit pas non plus', () => {
        const wrapper = mountWith({ fontFamily: 'Inter, sans-serif' })

        // C'est le cas qui aurait produit `var(--origam-font__family---Inter, sans-serif)`.
        expect(wrapper.attributes('style') ?? '').not.toContain('--origam-font__family---Inter')
    })
})
