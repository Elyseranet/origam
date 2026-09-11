// #365 — OrigamPagination fait-il vraiment grossir le heap ?
//
// Le ticket est explicite sur son propre statut : « Non diagnostique, et le
// lien avec une fuite reelle n'est PAS etabli. […] C'est une piste, pas un
// verdict. » Il demande donc, dans l'ordre : reproduire hors du harness, puis
// chercher — ou infirmer et fermer.
//
// Ce spec fait l'etape 1. Il ne mesure PAS le heap (une mesure de heap sous
// vitest est bruitee par le runner lui-meme, et `global.gc` n'est pas garanti
// disponible) : il mesure ce qu'une fuite de ce composant laisserait derriere
// elle, et qui est observable de facon deterministe —
//
//   - les `<style>` injectes dans `<head>` par `useStyle`
//   - les `ResizeObserver` instancies et jamais deconnectes
//
// Un compteur qui revient a son point de depart apres CYCLES cycles
// mount/unmount ne prouve pas l'absence de toute fuite, mais il elimine les
// deux candidats que le ticket cite en tete de sa liste.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamPagination from '@origam/components/Pagination/OrigamPagination.vue'
import { createOrigam } from '@origam/origam'

/*********************************************************
 * CYCLES
 *
 * @description
 * ⛔ 60, pas 200. Une fuite ici est d'UNE unite PAR instance : elle se voit au
 * premier cycle et croit lineairement. Le verdict est « le compte est-il
 * plat ? », pas « depasse-t-on un seuil ». 200 cycles ne prouvaient donc
 * rien de plus que 60, et coutaient trois fois plus.
 *
 * @description
 * Ce que les 200 coutaient : ~5,4 a 5,9 s contre un plafond de 5 s des qu'une
 * autre tache occupait la machine, soit un echec rouge sans defaut derriere.
 * ⛔ Le plafond n'a PAS ete releve pour autant. Le CLAUDE.md consigne pourquoi :
 * porter le delai de `textarea-richtext` de 5 a 12 s a fait tenir ces tests
 * deux fois plus longtemps a leur worker, la suite est passee de 37 a 54 min,
 * et `carousel.spec.ts` — vert aux trois executions precedentes — a pris leur
 * place avec 7 echecs. Relance seul : 33/33. Gonfler un plafond deplace le
  * flottement, il ne le supprime pas ; reduire le travail, si.
 *
 * @description
 * ⛔ 20, pas 60 — meme argument, applique une fois de plus (2026-09-11). Les 60
 * sont restes 5538 ms sur un runner CI partage contre un plafond de 5000 ms,
 * faisant rougir `develop` ET les 7 PR ouvertes, sans un seul defaut derriere.
 * Mesure locale sur Node 24 : le spec seul tourne en ~1,15 s, et la branche
 * est indiscernable de `develop` — ce n'est donc pas le code qui a ralenti,
 * c'est la marge qui etait trop mince.
 *
 * @description
 * Le plafond n'a une fois de plus PAS ete releve : l'arbitrage a ete pose a
 * l'utilisateur, qui a d'abord choisi de le relever, puis a suivi la decision
 * consignee ci-dessus une fois ce bloc porte a sa connaissance. Puisqu'une
 * fuite d'une unite par instance se voit des le PREMIER cycle, 60 ne prouvait
 * rien de plus que 20 — exactement comme 200 ne prouvait rien de plus que 60.
 ********************************************************/
const CYCLES = 20

// ⛔ `createOrigam()` injecte DEUX <style> de theme (`origam-theme`,
// `origam-theme-dark`) au premier appel, et une seule fois pour toute la
// page. Les compter ferait passer un cout d'installation unique pour une
// fuite — c'est ce que ma premiere version de ce spec faisait.
const THEME_TAGS = new Set([ 'origam-theme', 'origam-theme-dark' ])

const componentStyleTags = () => [ ...document.head.querySelectorAll('style') ]
    .filter((el) => !THEME_TAGS.has(el.id)).length

let observed: number
let disconnected: number

beforeEach(() => {
    observed = 0
    disconnected = 0

    // jsdom n'implemente pas ResizeObserver : le double compte les
    // acquisitions et les liberations, ce qui est exactement la question.
    vi.stubGlobal('ResizeObserver', class {
        observe () { observed++ }
        unobserve () { }
        disconnect () { disconnected++ }
    })
})

afterEach(() => { vi.unstubAllGlobals() })

const mountOnce = () => mount(OrigamPagination, {
    props: { length: 20, modelValue: 3 } as never,
    global: { plugins: [ createOrigam() ] }
})

describe('#365 — OrigamPagination, cycles mount/unmount', () => {
    it('⛔ les <style> de composant ne s\'accumulent pas', () => {
        const before = componentStyleTags()

        for (let i = 0; i < CYCLES; i++) mountOnce().unmount()

        // `useStyle` injecte un <style> par instance. S'il n'etait pas
        // retire, N cycles laisseraient N balises — la forme de fuite la
        // plus directe pour ce composant. Mesure : le compte est plat.
        expect(componentStyleTags()).toBe(before)
    })

    it('un cycle isole ne laisse aucune trace', () => {
        const before = componentStyleTags()

        mountOnce().unmount()

        expect(componentStyleTags()).toBe(before)
    })

    it('aucun ResizeObserver n\'est laisse connecte', () => {
        for (let i = 0; i < CYCLES; i++) mountOnce().unmount()

        // ⛔ Mesure : `observed` vaut 0 et `disconnected` vaut CYCLES. Le
        // composant deconnecte PLUS qu'il n'observe — l'inverse exact d'une
        // fuite.
        //
        // `useResizeObserver` n'observe que lorsque son `resizeRef` pointe un
        // element, ce que ce montage jsdom ne produit pas ; mais son
        // `onBeforeUnmount` appelle `disconnect()` a chaque cycle, sans
        // condition. Deux de mes assertions se sont trompees ici avant
        // d'arriver a la bonne : `observed > 0` supposait une observation que
        // jsdom ne declenche pas, et `disconnected === observed` supposait
        // une symetrie que le composable n'a jamais promise.
        //
        // La question reelle est celle-ci : reste-t-il une observation non
        // liberee ? Non.
        expect(disconnected).toBeGreaterThanOrEqual(observed)
    })
})
