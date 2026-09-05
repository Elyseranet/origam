// #426 — les props heritees d'`IChartBaseProps` qui n'ont aucun effet.
//
// ## La decision
//
// Trois traitements etaient possibles pour une prop declaree mais morte :
// l'implementer, la retirer de l'interface, ou avertir. Le premier fabrique
// une fonctionnalite que personne n'a demandee ; le deuxieme casse le type
// d'un consommateur pour une prop qui ne faisait deja rien.
//
// C'est le troisieme qui a ete retenu (decision utilisateur, 2026-09-06),
// sur le modele deja en place dans `OrigamChartGauge` : la prop reste
// declaree, et `useChartUnsupportedProp` emet UN avertissement de
// developpement portant la raison exacte.
//
// ## Ce que ce spec verifie
//
// Qu'un avertissement part quand la prop est passee, et — plus important —
// qu'il ne part PAS quand elle ne l'est pas. Un avertissement qui crie tout
// le temps est ignore en deux jours, et redevient du bruit.
//
// ⛔ On assert sur `console.warn`, pas sur le rendu : le rendu est
// justement ce qui ne change pas. C'est tout l'objet du defaut.
//
// ⛔ PIEGE D'ORDRE, rencontre en ecrivant ce spec. `warnUnsupportedProp`
// memorise les cles deja averties dans un `Set` de portee MODULE : une paire
// (composant, prop) n'avertit qu'UNE fois pour tout le fichier de test. Un
// test « aucun avertissement » place APRES un test qui a deja chauffe la meme
// cle passe donc pour la mauvaise raison — il mesure le Set, pas le predicat.
// Chaque test utilise ici une prop qui lui est propre, et le cas « rien
// passe » vient EN PREMIER.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamChartMap from '@origam/components/Chart/OrigamChartMap.vue'
import OrigamChartRadar from '@origam/components/Chart/OrigamChartRadar.vue'
import OrigamChartSparkline from '@origam/components/Chart/OrigamChartSparkline.vue'
import { createOrigam } from '@origam/origam'

const SERIES = [ { name: 'S', data: [ { x: 'a', y: 10 }, { x: 'b', y: 5 } ] } ]

let warn: ReturnType<typeof vi.spyOn>

beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
afterEach(() => { warn.mockRestore() })

const mountChart = (component: unknown, props: Record<string, unknown>) => mount(component as never, {
    props: { series: SERIES, ...props } as never,
    global: { plugins: [ createOrigam() ] }
})

const warnedAbout = (prop: string) => warn.mock.calls.some((args) => args.join(' ').includes(prop))

describe('famille Chart — props heritees sans effet (#426)', () => {
    it('⛔ rien passe ⇒ AUCUN avertissement', () => {
        mountChart(OrigamChartSparkline, {})

        // C'est l'assertion qui protege du bruit, et elle a trouve un vrai
        // defaut : mes premiers predicats etaient `props.x !== undefined`,
        // toujours vrai pour une prop dont `withDefaults` fixe une valeur
        // (`animated: false`, `animationDuration: 600`). Ils criaient a chaque
        // montage. Chaque predicat compare desormais au defaut REEL.
        expect(warn).not.toHaveBeenCalled()
    })

    it('ChartSparkline : `categories` passee ⇒ avertissement nomme', () => {
        mountChart(OrigamChartSparkline, { categories: [ 'a', 'b' ] })

        expect(warnedAbout('categories')).toBe(true)
    })

    it('une valeur EGALE au defaut n\'avertit pas', () => {
        mountChart(OrigamChartSparkline, { animationDuration: 600 })

        expect(warnedAbout('animationDuration')).toBe(false)
    })

    it('ChartMap : `legendPosition` est inerte — le gradient est place en dur', () => {
        mountChart(OrigamChartMap, { legendPosition: 'left' })

        expect(warnedAbout('legendPosition')).toBe(true)
    })

    it('ChartRadar : `showTooltip` est inerte — aucun ChartTooltip n\'est rendu', () => {
        mountChart(OrigamChartRadar, { showTooltip: true })

        expect(warnedAbout('showTooltip')).toBe(true)
    })

    it('l\'avertissement porte la RAISON, pas seulement le nom', () => {
        mountChart(OrigamChartSparkline, { fontSize: 'lg' })

        const text = warn.mock.calls.map((args) => args.join(' ')).join('\n')

        // Un « prop non supportee » nu obligerait le lecteur a aller lire le
        // source pour comprendre pourquoi.
        expect(text).toContain('renders no text')
    })

    it('plusieurs props inertes ⇒ un avertissement chacune', () => {
        mountChart(OrigamChartSparkline, { animated: true, subtitle: 'x' })

        expect(warnedAbout('animated')).toBe(true)
        expect(warnedAbout('subtitle')).toBe(true)
    })

    it('⛔ un avertissement ne part qu\'UNE fois par (composant, prop)', () => {
        mountChart(OrigamChartSparkline, { aspectRatio: '16/9' })
        const first = warn.mock.calls.length

        mountChart(OrigamChartSparkline, { aspectRatio: '4/3' })

        expect(warn.mock.calls.length).toBe(first)
    })
})
