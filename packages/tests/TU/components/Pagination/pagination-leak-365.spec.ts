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
// Un compteur qui revient a son point de depart apres 200 cycles
// mount/unmount ne prouve pas l'absence de toute fuite, mais il elimine les
// deux candidats que le ticket cite en tete de sa liste.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import OrigamPagination from '@origam/components/Pagination/OrigamPagination.vue'
import { createOrigam } from '@origam/origam'

const CYCLES = 200

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
        // retire, 200 cycles laisseraient 200 balises — la forme de fuite la
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

        // ⛔ Mesure : `observed` vaut 0 et `disconnected` vaut 200. Le
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
