// Issue #682 — critere C4 (ADR-005). Les DEUX props thémables de la
// sentinelle (`margin` et `rootRef`), et les DEUX chemins de montage.
//
// ─── Pourquoi ce fichier existe en plus de OrigamInfiniteScrollIntersect.spec.ts
//
// La couverture livree avec le correctif (de1b6ec13) monte
// `OrigamInfiniteScrollIntersect` TOUT SEUL, et ne mesure que `margin`. Or le
// ticket #682 note lui-meme que ce composant est interne et « jamais utilise
// de facon autonome par un consommateur (seul OrigamInfiniteScroll le monte) ».
// La regression etait donc prouvee dans une configuration qui ne se produit
// JAMAIS en production, et le volet `rootRef` — annonce par le message de
// de1b6ec13 (« margin/root ») — n'etait mesure nulle part.
//
// ─── Les deux props ne sont PAS dans la meme situation (mesure, pas deduction)
//
// Elles sont lues dans le MEME `computed`, ce qui rend tentant de conclure que
// ce qui vaut pour l'une vaut pour l'autre. C'est faux, et la difference est
// entierement dans ce que le PARENT lie :
//
//   :margin="margin"      -> `margin` n'est pas renseigne par defaut => undefined
//   :root-ref="rootEl"    -> TOUJOURS un element reel (la sentinelle est rendue
//                            sous `v-if="rootEl && …"`, OrigamInfiniteScroll.vue:51/63)
//
// `theme-props-resolver.composable.ts:592` etablit « passe » par
// `passedPropValue(instance.vnode.props, key) !== undefined` — la VALEUR, pas la
// presence de la cle. Consequence mesuree :
//
//   - `margin`  : le parent lie `undefined` => non « passe » => le theme s'applique.
//   - `rootRef` : le parent lie un element  => « passe »     => le theme est REFUSE,
//                 correctement, par le contrat « explicit > theme ».
//
// Donc le correctif de #682 sur `rootRef` est reel (cas D le prouve par A/B) mais
// INATTEIGNABLE par le seul chemin de montage de production (cas E le prouve).
// Les deux cas sont conserves : D parce qu'il rougit avant le correctif, E parce
// qu'il est la seule chose qui empeche un futur lecteur de croire qu'un theme
// visant `rootRef` agit en production.
//
// ─── A/B mesure contre le commit parent (de1b6ec13^), vrai `$?` hors pipe
//
//   pre-correctif  : A rouge, D rouge, B/C/E verts   (exit 1)
//   post-correctif : les cinq verts                  (exit 0)
//
// A et D sont les contrOles positifs (ils discriminent). B, C et E passent des
// deux cotes — ce sont les temoins : sans eux, « le theme arrive » et « ma sonde
// lit autre chose » seraient indiscernables.

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'

import { createOrigam } from '@origam/origam'
import type { IOrigamTheme } from '@origam/interfaces'

import OrigamInfiniteScroll from '@origam/components/InfiniteScroll/OrigamInfiniteScroll.vue'
import OrigamInfiniteScrollIntersect from '@origam/components/InfiniteScroll/OrigamInfiniteScrollIntersect.vue'

// ─── stub IntersectionObserver, enregistrant chaque appel constructeur ──────
//
// `rootMargin` / `root` sont des options NATIVES figees a la construction : la
// seule facon de savoir ce que l'observateur a REELLEMENT recu est de capturer
// l'argument `options` du constructeur. On lit `.at(-1)` car le correctif RECREE
// l'observateur quand les options resolues changent — le dernier appel est
// l'observateur effectivement actif.

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

const THEME_CHILD_MARGIN: IOrigamTheme = {
    name: 'infinite-scroll-682-child',
    mode: 'light',
    components: { 'origam-infinite-scroll-intersect': { margin: '128px' } },
    vars: {}
}

const THEME_PARENT_MARGIN: IOrigamTheme = {
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

// Element distinct de tout ce que le composant peut fabriquer lui-meme : si
// l'observateur le recoit, il ne peut venir QUE du theme.
const THEMED_ROOT_EL = document.createElement('section')
THEMED_ROOT_EL.id = 'themed-observation-root'

const THEME_CHILD_ROOTREF: IOrigamTheme = {
    name: 'infinite-scroll-682-rootref',
    mode: 'light',
    components: { 'origam-infinite-scroll-intersect': { rootRef: THEMED_ROOT_EL } },
    vars: {}
}

function pluginFor (theme: IOrigamTheme) {
    const origam = createOrigam({ themes: [ theme ] })
    origam._defaultsRef.value = origam._activeDefaultsFor(theme.name, 'light')

    return origam
}

// Le plugin est monte meme pour le controle negatif : `OrigamInfiniteScroll`
// consomme une instance de locale injectee, et un montage sans plugin echoue sur
// « Could not find injected locale instance » — un faux rouge sans rapport.
function mountThroughParent (theme: IOrigamTheme) {
    return mount(OrigamInfiniteScroll, {
        global: { plugins: [ pluginFor(theme) ] },
        props: { side: 'both' },
        attachTo: document.body
    })
}

describe('OrigamInfiniteScroll — themed props reaching the sentinel observer (#682, C4)', () => {
    beforeEach(installIntersectionObserverStub)
    afterEach(() => {
        vi.unstubAllGlobals()
        document.querySelectorAll('style[data-origam-theme]').forEach(el => el.remove())
    })

    // ─── margin, chemin de montage REEL ─────────────────────────────────────

    it('A — margin: a theme naming the CHILD reaches the observer despite the parent binding :margin (the gap, #682)', async () => {
        const wrapper = mountThroughParent(THEME_CHILD_MARGIN)
        await nextTick()
        await nextTick()

        expect(constructorCalls.at(-1)?.rootMargin).toBe('128px')

        wrapper.unmount()
    })

    it('B — witness: a theme naming the PARENT flows down through :margin (passes both sides of the fix)', async () => {
        const wrapper = mountThroughParent(THEME_PARENT_MARGIN)
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

    // ─── rootRef ────────────────────────────────────────────────────────────

    it('D — rootRef: a theme naming rootRef reaches the observer as its native `root` (standalone mount)', async () => {
        const wrapper = mount(OrigamInfiniteScrollIntersect, {
            global: { plugins: [ pluginFor(THEME_CHILD_ROOTREF) ] },
            props: { side: 'bottom' }
        })
        await nextTick()
        await nextTick()

        expect(constructorCalls.at(-1)?.root).toBe(THEMED_ROOT_EL)

        wrapper.unmount()
    })

    it('E — rootRef: through the REAL parent, the explicit :root-ref binding wins over the theme (explicit > theme)', async () => {
        const wrapper = mountThroughParent(THEME_CHILD_ROOTREF)
        await nextTick()
        await nextTick()

        // Le parent passe TOUJOURS un element reel (`v-if="rootEl"` + `:root-ref="rootEl"`),
        // donc le resolveur refuse le theme — correctement. D est donc vrai mais
        // inatteignable par ce chemin : c'est ce que ce cas fige.
        const root = constructorCalls.at(-1)?.root

        expect(root).toBeInstanceOf(HTMLElement)
        expect(root).not.toBe(THEMED_ROOT_EL)

        wrapper.unmount()
    })
})
