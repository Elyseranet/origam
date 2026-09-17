/*
 * #779 — les 6 sites d'ordonnanceur laisses ouverts par #753.
 *
 * ⛔ CE FICHIER MESURE AVANT DE CONCLURE
 *
 * #753 a nomme ces sites sans les traiter parce que chacun demande une
 * DECISION, pas l'application mecanique du meme garde. Deux d'entre eux
 * sont d'ailleurs ECARTES ici, avec la mesure qui le justifie — un site
 * ecarte vaut autant qu'un site corrige.
 *
 * ⛔ CE QUE CHAQUE BLOC PORTE
 *
 *   1. un CONTROLE POSITIF — la sonde arme bien quelque chose sur ce
 *      site. Sans lui, une sonde qui vise le mauvais element (le piege
 *      `document.scrollingElement === body` de #753) n'arme AUCUNE frame
 *      et conclut « rien ne survit » sur du code totalement nu ;
 *   2. la mesure de survie au demontage — c'est l'A/B contre le parent :
 *      chaque assertion `toBe(0)` ci-dessous ROUGIT sur `origin/develop`.
 *      Releve reel, meme machine, meme commande, code d'avant :
 *
 *        OrigamImg.vue              1 frame  survit
 *        OrigamSelect.vue           3 timers survivent
 *        ripple.util.ts             1 timer  survit
 *        backButton.composable.ts   2 timers survivent
 *        scrolling.composable.ts    1 frame  survit (onListScroll)
 *
 *   3. pour les chaines (rAF qui en arme un autre), la preuve que le
 *      RE-ARMEMENT s'arrete — pas seulement qu'un tour a ete annule.
 *
 * Le harnais d'ordonnanceur est partage avec #719 / #753
 * (`TU/probe/raf-teardown.harness.ts`) — pas une seconde copie.
 *
 * ⚠️ ATTRIBUTION. `pendingXFrom(fichier)` filtre sur la PILE de capture
 * entiere, donc une tache armee dans `ripple.const.ts` depuis
 * `ripple.util.ts` compte pour les deux. C'est voulu : on mesure « ce
 * que ce chemin d'appel a laisse derriere lui », pas « ce que cette
 * ligne precise a arme ».
 */
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref, withDirectives } from 'vue'

import OrigamImg from '@origam/components/Img/OrigamImg.vue'
import OrigamSelect from '@origam/components/Select/OrigamSelect.vue'
import OrigamTextField from '@origam/components/TextField/OrigamTextField.vue'

import { createOrigam } from '@origam/origam'

import Ripple from '@origam/directives/Ripple/ripple.directive'

import type { IRippleHtmlElement } from '@origam/interfaces/Commons/ripple.interface'

import { useBackButton } from '@origam/composables/Commons/backButton.composable'
import { useScrolling } from '@origam/composables/Commons/scrolling.composable'

import {
    flushFramesFrom,
    flushTimersFrom,
    installFakeSchedulers,
    pendingFramesFrom,
    pendingTimersFrom
} from '../probe/raf-teardown.harness'

/** Ce fichier — utilise par les controles positifs fabriques a la main. */
const ICI = 'raf-teardown-779.spec.ts'

beforeEach(() => {
    installFakeSchedulers()
})

afterEach(() => {
    vi.unstubAllGlobals()
})

/*********************************************************
 * CONTROLE POSITIF GLOBAL
 *
 * Une boucle nue, fabriquee a la main, que la sonde DOIT voir. Sans ce
 * bloc, tous les verdicts « 0 tache survivante » de ce fichier
 * pourraient etre des faux verts produits par une sonde aveugle.
 ********************************************************/

describe('#779 — controle positif de la sonde elle-meme', () => {
    it('voit une frame nue armee depuis ce fichier', () => {
        requestAnimationFrame(() => undefined)

        expect(pendingFramesFrom(ICI)).toBe(1)
    })

    it('voit un timer nu arme depuis ce fichier', () => {
        setTimeout(() => undefined)

        expect(pendingTimersFrom(ICI)).toBe(1)
    })

    it('voit une boucle nue REFUSER de s’arreter', () => {
        const boucle = () => {
            requestAnimationFrame(boucle)
        }

        boucle()

        // 6 tours consommes = la boucle se re-arme indefiniment. Un site
        // reellement borne rend 1 (ou 0).
        expect(flushFramesFrom(ICI, 6)).toBe(6)
    })
})

/*********************************************************
 * SITE 1 — OrigamImg:351 / :352 — double rAF de `markBooted`
 *
 * VERDICT : CORRIGE.
 *
 * Handle capture nulle part. Le fichier porte pourtant un
 * `onBeforeUnmount` — pose pour `pollForSize` — d'ou le blanchiment par
 * une heuristique PAR FICHIER.
 ********************************************************/

describe('#779 — OrigamImg, double rAF de markBooted', () => {
    const SOURCE = 'OrigamImg.vue'

    const mountImg = () => mount(OrigamImg, {
        props: {src: {src: 'x.png', aspectRatio: 1}}
    })

    it('CONTROLE POSITIF — arme une frame des le setup quand aspectRatio est deja vrai', () => {
        const wrapper = mountImg()

        expect(pendingFramesFrom(SOURCE)).toBeGreaterThanOrEqual(1)

        wrapper.unmount()
    })

    it('ne laisse plus aucune frame armee apres unmount (1 avant le correctif)', () => {
        const wrapper = mountImg()

        wrapper.unmount()

        expect(pendingFramesFrom(SOURCE)).toBe(0)
    })

    it('le rung INTERNE est couvert aussi, pas seulement l’externe', () => {
        const wrapper = mountImg()

        // On laisse le rung externe s'executer : il arme le rung interne.
        // C'est l'instant ou une correction qui n'aurait suivi qu'un seul
        // handle laisserait l'autre en vol.
        expect(flushFramesFrom(SOURCE, 1)).toBe(1)
        expect(pendingFramesFrom(SOURCE)).toBe(1)

        wrapper.unmount()

        expect(pendingFramesFrom(SOURCE)).toBe(0)
    })
})

/*********************************************************
 * SITE 2 — OrigamSelect:792 / :985 — deux setTimeout nus
 *
 * VERDICT : CORRIGE.
 *
 * Le cas d'ecole du blanchiment PAR FICHIER : `OrigamSelect.vue` porte
 * DEJA un `onBeforeUnmount` et un drapeau `disposed` — poses par #719
 * pour les frames de defilement, jamais pour ces deux macrotaches.
 ********************************************************/

describe('#779 — OrigamSelect, les deux setTimeout nus', () => {
    const SOURCE = 'OrigamSelect.vue'

    const ITEMS = ['un', 'deux', 'trois']

    const mountSelect = () => mount(OrigamSelect, {
        props: {items: ITEMS, autocomplete: true, eager: true},
        global: {plugins: [createOrigam()], stubs: {teleport: true, transition: false}},
        attachTo: document.body
    })

    /** Arme les deux sites : `handleMousedownControl` puis `handleFocusin`. */
    const armer = async (wrapper: ReturnType<typeof mountSelect>) => {
        const tf = wrapper.findComponent(OrigamTextField)

        tf.vm.$emit('update:modelValue', 'de')
        await nextTick()
        tf.vm.$emit('mousedown:control', new MouseEvent('mousedown'))
        await nextTick()

        document.querySelector('.origam-list')?.dispatchEvent(new FocusEvent('focusin', {bubbles: true}))
        await nextTick()
    }

    it('CONTROLE POSITIF — les deux gestes arment bien des macrotaches', async () => {
        const wrapper = mountSelect()

        await armer(wrapper)

        expect(pendingTimersFrom(SOURCE)).toBeGreaterThanOrEqual(2)

        wrapper.unmount()
    })

    it('ne laisse plus aucune macrotache apres unmount (3 avant le correctif)', async () => {
        const wrapper = mountSelect()

        await armer(wrapper)
        wrapper.unmount()

        expect(pendingTimersFrom(SOURCE)).toBe(0)
    })

    it('le drapeau `disposed` neutralise aussi un armement POSTERIEUR au demontage', async () => {
        const wrapper = mountSelect()
        const tf = wrapper.findComponent(OrigamTextField)

        tf.vm.$emit('update:modelValue', 'de')
        await nextTick()
        wrapper.unmount()

        // Un handler encore joignable apres le demontage : le garde doit
        // REFUSER d'armer, pas seulement annuler apres coup.
        tf.vm.$emit('mousedown:control', new MouseEvent('mousedown'))
        await nextTick()

        expect(pendingTimersFrom(SOURCE)).toBe(0)
    })
})

/*********************************************************
 * SITE 3 — ripple.util:213 — le setTimeout de `rippleHide`
 *
 * VERDICT : CORRIGE.
 *
 * Les deux autres `setTimeout` du fichier (:169, :207) rangent leur
 * handle dans `_ripple.showTimer`. Celui-la n'allait nulle part : ni
 * `rippleCancelShow` ni le hook `unmounted` de la directive ne
 * pouvaient l'atteindre. Il rejoint `_ripple.timers`, le registre pose
 * par #753 et purge par `unmounted`.
 ********************************************************/

describe('#779 — ripple.util, le setTimeout non capture de rippleHide', () => {
    const SOURCE = 'ripple.util.ts'

    const mountRipple = () => mount(defineComponent({
        setup: () => () => withDirectives(h('div', {class: 'cible'}), [[Ripple, true]])
    }), {attachTo: document.body})

    const cliquer = async (el: Element) => {
        el.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}))
        await nextTick()
        el.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}))
        await nextTick()
    }

    it('CONTROLE POSITIF — un clic complet arme bien plusieurs macrotaches', async () => {
        const wrapper = mountRipple()

        await cliquer(wrapper.element)

        expect(pendingTimersFrom(SOURCE)).toBeGreaterThanOrEqual(3)

        wrapper.unmount()
    })

    it('ne laisse plus aucune macrotache apres unmount (1 avant le correctif)', async () => {
        const wrapper = mountRipple()

        await cliquer(wrapper.element)
        wrapper.unmount()

        expect(pendingTimersFrom(SOURCE)).toBe(0)
    })

    it('le registre `_ripple.timers` est bien le mecanisme employe, pas un second', async () => {
        const wrapper = mountRipple()
        const el = wrapper.element as IRippleHtmlElement

        await cliquer(el)

        expect(el._ripple?.timers?.size).toBeGreaterThanOrEqual(3)

        wrapper.unmount()

        expect(el._ripple).toBeUndefined()
    })
})

/*********************************************************
 * SITE 4 — backButton — DEUX sites, DEUX verdicts opposes
 *
 * `onPopstate` (:64)         → CORRIGE.
 * garde `beforeEach` (:32)   → ⛔ ECARTE, mesure ci-dessous.
 ********************************************************/

describe('#779 — useBackButton', () => {
    const SOURCE = 'backButton.composable.ts'

    type TGarde = (to: unknown, from: unknown, next: () => void) => void

    /** Routeur minimal : on veut capturer le garde, pas router. */
    const monter = async () => {
        let capture: TGarde | null = null

        const router = {
            beforeEach: (fn: TGarde) => {
                capture = fn

                return () => undefined
            },
            afterEach: () => () => undefined
        }

        const wrapper = mount(defineComponent({
            setup () {
                useBackButton(router as never, () => undefined)

                return () => h('div')
            }
        }))

        await nextTick()

        return {wrapper, garde: capture as TGarde | null}
    }

    it('CONTROLE POSITIF — le garde est enregistre et un popstate arme bien une macrotache', async () => {
        const {wrapper, garde} = await monter()

        expect(garde).toBeTruthy()

        window.dispatchEvent(new PopStateEvent('popstate', {state: null}))

        expect(pendingTimersFrom(SOURCE)).toBe(1)

        wrapper.unmount()
    })

    it('onPopstate — plus aucune macrotache apres unmount (1 avant le correctif)', async () => {
        const {wrapper} = await monter()

        window.dispatchEvent(new PopStateEvent('popstate', {state: null}))
        wrapper.unmount()

        expect(pendingTimersFrom(SOURCE)).toBe(0)
    })

    /*
     * ⛔ MESURE DU SITE ECARTE.
     *
     * La macrotache du garde `beforeEach` DOIT appeler `next()` : c'est
     * ainsi que vue-router apprend que la navigation peut continuer.
     * L'annuler au demontage ne libererait pas une ressource, elle
     * laisserait la navigation suspendue pour toujours.
     *
     * Les deux moities de l'argument sont mesurees :
     *   a) la tache survit bien au demontage — le defaut est reel, on ne
     *      le nie pas ;
     *   b) ce qu'elle porte est `next()` — donc l'annuler le
     *      supprimerait.
     */
    it('garde beforeEach — ECARTE : la tache survit, mais l’annuler etranglerait la navigation', async () => {
        const {wrapper, garde} = await monter()
        let suivantAppele = false

        garde?.({}, {}, () => {
            suivantAppele = true
        })

        expect(pendingTimersFrom(SOURCE)).toBe(1)

        wrapper.unmount()

        // (a) elle survit.
        expect(pendingTimersFrom(SOURCE)).toBe(1)

        // (b) et sa continuation est un CONTRAT, pas un effet differe.
        expect(suivantAppele).toBe(false)
        flushTimersFrom(SOURCE, 1)
        expect(suivantAppele).toBe(true)
    })
})

/*********************************************************
 * SITE 5 — scrolling.composable — DEUX familles, DEUX verdicts
 *
 * `onListScroll` (:23/:24)      → CORRIGE.
 * `finishScrolling` (:30-:32)   → ⛔ ECARTE — ses rAF sont ATTENDUS.
 ********************************************************/

describe('#779 — useScrolling', () => {
    const SOURCE = 'scrolling.composable.ts'

    const monter = () => {
        const el = document.createElement('div')

        document.body.appendChild(el)
        // jsdom n'implemente pas `scrollTo`. Sans ce bouchon,
        // `onListKeydown` jette AVANT d'armer la moindre frame et la
        // sonde conclut « rien ne survit » sur du code totalement nu —
        // exactement le piege `document.scrollingElement` de #753,
        // reproduit ici sur une autre API.
        el.scrollTo = () => undefined

        const api: {value: ReturnType<typeof useScrolling> | null} = {value: null}

        const wrapper = mount(defineComponent({
            setup () {
                api.value = useScrolling(ref({$el: el}) as never, ref(undefined) as never)

                return () => h('div')
            }
        }))

        return {wrapper, api: api.value!, el}
    }

    it('CONTROLE POSITIF — onListScroll arme bien une frame', () => {
        const {wrapper, api} = monter()

        api.onListScroll()

        expect(pendingFramesFrom(SOURCE)).toBe(1)

        wrapper.unmount()
    })

    it('onListScroll — plus aucune frame apres unmount (1 avant le correctif)', () => {
        const {wrapper, api} = monter()

        api.onListScroll()
        wrapper.unmount()

        expect(pendingFramesFrom(SOURCE)).toBe(0)
    })

    it('onListScroll — la CHAINE s’arrete : le rung externe ne re-arme plus', () => {
        const {wrapper, api} = monter()

        api.onListScroll()

        // Le rung externe s'execute AVANT le demontage : il arme le rung
        // interne, donc la chaine est bien en cours au moment ou on
        // demonte.
        expect(flushFramesFrom(SOURCE, 1)).toBe(1)
        expect(pendingFramesFrom(SOURCE)).toBe(1)

        wrapper.unmount()

        expect(pendingFramesFrom(SOURCE)).toBe(0)
        // Et rien ne se re-arme quand on relance le drain.
        expect(flushFramesFrom(SOURCE, 6)).toBe(0)
    })

    /*
     * ⛔ MESURE DU SITE ECARTE — ce que l'`await` promet.
     *
     * `onListKeydown` fait `await finishScrolling()` puis lit le DOM
     * pour deplacer le focus. La promesse ne se resout QUE parce que les
     * trois rAF s'executent.
     */
    it('finishScrolling — ECARTE (a) : la promesse se resout, demontee ou non', async () => {
        const {wrapper, api} = monter()
        let resolu = false

        void api.onListKeydown({key: 'End'} as KeyboardEvent).then(() => {
            resolu = true
        })

        await nextTick()

        expect(pendingFramesFrom(SOURCE)).toBe(1)

        wrapper.unmount()

        for (let i = 0; i < 8; i++) {
            flushFramesFrom(SOURCE, 1)
            await Promise.resolve()
        }

        expect(resolu).toBe(true)
    })

    /*
     * (b) Le meme enchainement, mais avec le garde que la correction
     * « evidente » aurait pose. Reproduction fidele de la forme —
     * `await new Promise(resolve => rAF(resolve))` — avec un
     * `if (disposed) return` dans la continuation.
     *
     * ⚠️ Ce bloc ne teste PAS le DS : il mesure la consequence du
     * correctif qu'on a refuse. C'est la justification du verdict.
     */
    it('finishScrolling — ECARTE (b) : un `if (disposed) return` suspend l’await POUR TOUJOURS', async () => {
        let disposed = false
        let resolu = false
        let continuationAtteinte = false

        const finishScrollingGarde = async () => {
            await new Promise<void>(resolve => {
                requestAnimationFrame(() => {
                    if (disposed) return
                    resolve()
                })
            })

            continuationAtteinte = true
        }

        void finishScrollingGarde().then(() => {
            resolu = true
        })

        // Le « demontage » arrive avant que la frame ne se declenche.
        disposed = true

        for (let i = 0; i < 8; i++) {
            flushFramesFrom(ICI, 1)
            await Promise.resolve()
        }

        // La frame a bien ete consommee…
        expect(pendingFramesFrom(ICI)).toBe(0)
        // …mais la promesse n'est jamais resolue, donc la fonction
        // asynchrone — et toute sa portee — reste en vie indefiniment.
        expect(resolu).toBe(false)
        expect(continuationAtteinte).toBe(false)
    })
})
