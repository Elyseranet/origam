// Issue #682 — critere C4 (ADR-005), couverture du CHEMIN DE MONTAGE REEL.
//
// ─── Pourquoi ce fichier existe en plus de OrigamInfiniteScrollIntersect.spec.ts
//
// La couverture livree avec le correctif (de1b6ec13) monte
// `OrigamInfiniteScrollIntersect` TOUT SEUL. Or le ticket #682 note lui-meme
// que ce composant est interne et « jamais utilise de facon autonome par un
// consommateur (seul OrigamInfiniteScroll le monte) ». La regression etait
// donc prouvee dans une configuration qui ne se produit JAMAIS en production,
// et laissait ouverte la seule question qui compte pour un consommateur :
// le theme atteint-il l'observateur quand le composant est monte comme il
// l'est reellement ?
//
// La question n'est pas rhetorique. `OrigamInfiniteScroll` lie `:margin="margin"`
// EXPLICITEMENT sur chacune de ses deux sentinelles
// (OrigamInfiniteScroll.vue:54 et :66). Le resolveur ADR-005 refuse de patcher
// un prop deja passe par le consommateur — c'est le contrat « explicit > theme ».
// Une lecture naive de ce contrat conclut que le theme visant l'ENFANT ne peut
// jamais s'appliquer en usage reel, et donc que le correctif de #682 est mort-ne.
//
// Mesure : cette lecture est FAUSSE, et la raison tient a une ligne precise.
// `theme-props-resolver.composable.ts:592` etablit « passe » par
// `passedPropValue(instance.vnode.props, key) !== undefined` — la valeur, pas
// la presence de la cle. Un parent qui lie `:margin="undefined"` (le cas par
// defaut, `margin` n'etant pas renseigne sur le parent) ne compte donc PAS
// comme « passe », et le theme visant l'enfant s'applique normalement.
//
// ─── Ce que chaque cas etablit, et pourquoi il faut les trois
//
// A — le cas du ticket, dans le montage reel. ROUGE avant le correctif
//     (`undefined` au lieu de `'128px'`), VERT apres. C'est l'assertion qui
//     fonde le ticket.
//
// B — LE TEMOIN. Un theme visant le PARENT descend par la liaison explicite
//     `:margin`, chemin qui n'a jamais ete casse : la valeur est resolue sur
//     le parent avant que le `setup()` de l'enfant ne s'execute. Il passe des
//     DEUX cotes du correctif. Sans lui, « le theme arrive » et « ma sonde lit
//     autre chose » seraient indiscernables — B prouve que la sonde sait lire
//     `rootMargin` sur l'appel constructeur.
//
// C — controle negatif : aucun theme ne nomme `margin`, l'observateur ne doit
//     recevoir aucun `rootMargin`. Interdit a un stub complaisant de rendre A
//     vert par accident.
//
// A/B mesure contre le commit parent (de1b6ec13^), vrai `$?` hors pipe :
//     pre-correctif  : A rouge, B vert, C vert   (exit 1)
//     post-correctif : A vert,  B vert, C vert   (exit 0)

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'

import { createOrigam } from '@origam/origam'
import type { IOrigamTheme } from '@origam/interfaces'

import OrigamInfiniteScroll from '@origam/components/InfiniteScroll/OrigamInfiniteScroll.vue'

// ─── stub IntersectionObserver, enregistrant chaque appel constructeur ──────
//
// `rootMargin` / `root` sont des options NATIVES figees a la construction :
// la seule facon de savoir ce que l'observateur a REELLEMENT recu est de
// capturer l'argument `options` du constructeur. On lit `.at(-1)` car le
// correctif RECREE l'observateur quand les options resolues changent — le
// dernier appel est l'observateur effectivement actif.

let constructorCalls: Array<IntersectionObserverInit | undefined>

function installIntersectionObserverStub () {
    constructorCalls = []

    class StubIO {
        constructor (_cb: IntersectionObserverCallback, options?: IntersectionObserverInit) {
            constructorCalls.push(options)
        }
        observe = vi.fn()
        unobserve = vi.fn()
        disconnect = vi.fn()
    }

    vi.stubGlobal('IntersectionObserver', StubIO)
}

const THEME_CHILD: IOrigamTheme = {
    name: 'infinite-scroll-682-child',
    mode: 'light',
    components: { 'origam-infinite-scroll-intersect': { margin: '128px' } },
    vars: {}
}

const THEME_PARENT: IOrigamTheme = {
    name: 'infinite-scroll-682-parent',
    mode: 'light',
    components: { 'origam-infinite-scroll': { margin: '64px' } },
    vars: {}
}

const THEME_NONE: IOrigamTheme = {
    name: 'infinite-scroll-682-none',
    mode: 'light',
    components: {},
    vars: {}
}

// Le plugin est monte meme pour le controle negatif : `OrigamInfiniteScroll`
// consomme une instance de locale injectee, et un montage sans plugin echoue
// sur « Could not find injected locale instance » — un faux rouge qui n'a
// rien a voir avec le theme.
function mountThroughParent (theme: IOrigamTheme) {
    const origam = createOrigam({ themes: [ theme ] })
    origam._defaultsRef.value = origam._activeDefaultsFor(theme.name, 'light')

    return mount(OrigamInfiniteScroll, {
        global: { plugins: [ origam ] },
        props: { side: 'both' }
    })
}

describe('OrigamInfiniteScroll — theme margin reaching the sentinel observer (#682, C4, real mount path)', () => {
    beforeEach(installIntersectionObserverStub)
    afterEach(() => {
        vi.unstubAllGlobals()
        document.querySelectorAll('style[data-origam-theme]').forEach(el => el.remove())
    })

    it('A — a theme naming the CHILD reaches the observer despite the parent binding :margin (the gap, #682)', async () => {
        const wrapper = mountThroughParent(THEME_CHILD)
        await nextTick()
        await nextTick()

        expect(constructorCalls.at(-1)?.rootMargin).toBe('128px')

        wrapper.unmount()
    })

    it('B — witness: a theme naming the PARENT flows down through :margin (passed both sides of the fix)', async () => {
        const wrapper = mountThroughParent(THEME_PARENT)
        await nextTick()
        await nextTick()

        expect(constructorCalls.at(-1)?.rootMargin).toBe('64px')

        wrapper.unmount()
    })

    it('C — negative control: no theme names margin, the observer gets no rootMargin', async () => {
        const wrapper = mountThroughParent(THEME_NONE)
        await nextTick()
        await nextTick()

        expect(constructorCalls.at(-1)?.rootMargin).toBeUndefined()

        wrapper.unmount()
    })
})
