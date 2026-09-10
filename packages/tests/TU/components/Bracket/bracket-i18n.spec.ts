// Famille Bracket — critère C8 : libellés anglais en dur, intraduisibles.
//
// Mesuré sur develop avant correction : AUCUN des quatre composants Bracket
// n'appelait `useLocale`, et treize chaînes destinées à l'utilisateur étaient
// écrites en dur en anglais — dont deux comme VALEUR PAR DÉFAUT DE PROP
// (`winnersLabel: 'Winners bracket'`, `losersLabel: 'Losers bracket'`), un cas
// que les conventions du dépôt couvrent explicitement, et plusieurs dans des
// `aria-label` lus par les lecteurs d'écran.
//
// La table `STATUS_LABELS` était en outre une `const` déclarée DANS le `.vue`.
//
// Ce spec asserte sur des VALEURS ABSOLUES — la chaîne rendue dans chaque
// locale — et non sur « une clé a été appelée » : c'est la seule façon de
// distinguer une traduction réellement branchée d'un `t()` qui retomberait sur
// sa clé. Le contrôle de non-régression du bas prouve que le chemin
// « le consommateur passe sa propre chaîne » n'a pas été cassé.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamBracketCompetitor from '@origam/components/Bracket/OrigamBracketCompetitor.vue'
import OrigamBracketMatch from '@origam/components/Bracket/OrigamBracketMatch.vue'
import { createOrigam } from '@origam/origam'

import { BRACKET_MATCH_STATUS } from '@origam/enums'

function mountCompetitor (props: Record<string, unknown>, locale = 'en') {
    return mount(OrigamBracketCompetitor, {
        props: props as never,
        global: { plugins: [createOrigam({ locale: { locale } } as never)] }
    })
}

function mountMatch (props: Record<string, unknown>, locale = 'en') {
    return mount(OrigamBracketMatch, {
        props: props as never,
        global: { plugins: [createOrigam({ locale: { locale } } as never)] }
    })
}

const MATCH = {
    id: 'm1',
    competitorA: { id: 'a', name: 'Alice' },
    competitorB: { id: 'b', name: 'Bob' },
    scoreA: 2,
    scoreB: 1,
    winnerId: 'a'
}

describe('OrigamBracketCompetitor — libellés traduits (C8)', () => {
    it('affiche le libellé « à définir » de la locale, pas « TBD » en dur', () => {
        const en = mountCompetitor({ competitor: null })

        expect(en.text()).toContain('TBD')

        const fr = mountCompetitor({ competitor: null }, 'fr')

        // VALEUR ABSOLUE dans l'autre langue : c'est ce qui prouve que la
        // chaîne traverse réellement la locale. Un `t()` qui retomberait sur
        // sa clé rendrait « origam.bracket.tbd » et échouerait ici.
        expect(fr.text()).toContain('À définir')
        expect(fr.text()).not.toContain('TBD')
    })

    it('l\'aria-label du compétiteur indéterminé est traduit', () => {
        const fr = mountCompetitor({ competitor: null }, 'fr')
        const label = fr.find('.origam-bracket-competitor').attributes('aria-label')

        expect(label).toBe('À déterminer')
    })

    it('l\'aria-label d\'un compétiteur vainqueur est traduit, score compris', () => {
        const fr = mountCompetitor(
            { competitor: { id: 'a', name: 'Alice' }, score: 2, isWinner: true, showScore: true },
            'fr'
        )
        const label = fr.find('.origam-bracket-competitor').attributes('aria-label')

        expect(label).toBe('Alice, score 2, vainqueur')
    })
})

describe('OrigamBracketMatch — libellés de statut traduits (C8)', () => {
    it('rend le statut dans la locale active', () => {
        const en = mountMatch({ match: MATCH, status: BRACKET_MATCH_STATUS.COMPLETED })
        expect(en.text()).toContain('Completed')

        const fr = mountMatch({ match: MATCH, status: BRACKET_MATCH_STATUS.COMPLETED }, 'fr')
        expect(fr.text()).toContain('Terminé')
        expect(fr.text()).not.toContain('Completed')
    })

    it('rend le statut LIVE dans la locale active', () => {
        const fr = mountMatch({ match: MATCH, status: BRACKET_MATCH_STATUS.LIVE }, 'fr')

        expect(fr.text()).toContain('EN DIRECT')
    })

    it('l\'aria-label du match est traduit', () => {
        const fr = mountMatch({ match: MATCH }, 'fr')
        const label = fr.find('.origam-bracket-match').attributes('aria-label')

        expect(label).toBe('Match : Alice contre Bob')
    })
})
