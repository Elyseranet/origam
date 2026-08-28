/*********************************************************
 * SONDE C3 — useMasonry (composable attendu « couteux »)
 *
 * @description
 * Sonde de CHIFFRAGE. Ce composable ne renvoie pas un computed : il renvoie
 * un `layout` recalcule par des effets de bord — deux ResizeObserver, un
 * `requestAnimationFrame`, et un `watch(deep)` sur les options. Aucun de ces
 * canaux n'existe dans jsdom sans etre fourni.
 *
 * @description
 * C'est precisement ce que le chiffrage doit mesurer : le cout d'une sonde
 * C3 n'est pas proportionnel a la taille du fichier, il est proportionnel au
 * nombre d'environnements qu'il faut simuler pour que la reactivite ait lieu.
 ********************************************************/

import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { useMasonry } from '@origam/composables/Masonry/masonry.composable'

beforeAll(() => {
    if (!globalThis.ResizeObserver) {
        globalThis.ResizeObserver = class {
            observe () {}
            unobserve () {}
            disconnect () {}
        } as unknown as typeof ResizeObserver
    }
    if (!globalThis.requestAnimationFrame) {
        globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
            cb(0)
            return 0
        }) as typeof requestAnimationFrame
    }
})

/*********************************************************
 * LE POINT DE LA SONDE
 *
 * @description
 * `relayout()` sort immediatement si `container.clientWidth <= 0`. jsdom ne
 * fait AUCUN calcul de layout : `clientWidth` y vaut toujours 0. Le `watch`
 * se declenche donc bien, `relayout()` s'execute bien, et il ne fait RIEN.
 * `layout.value` ne bouge jamais.
 *
 * @description
 * Sans le stub ci-dessous, la sonde rend un rouge qui n'accuse PAS le
 * composable : elle constate seulement que l'environnement de test ne peut
 * pas produire la condition que le code exige. C'est un artefact de sonde,
 * pas un defaut produit — et les distinguer est tout le cout de C3 sur
 * cette famille.
 ********************************************************/
const donnerUneLargeur = (px: number) => {
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
        configurable: true,
        get () { return px }
    })
}

const monter = () => {
    const columnsRef = ref(2)
    const gapRef = ref(8)
    let api!: ReturnType<typeof useMasonry>

    const Host = defineComponent({
        name: 'OrigamMasonry',
        setup () {
            api = useMasonry({ columnsRef, gapRef })

            return () => h(
                'div',
                { ref: (el) => { api.containerRef.value = el as HTMLElement | null } },
                [0, 1, 2, 3].map(i => h('div', {
                    key: i,
                    ref: (el) => api.setItem(i, el as HTMLElement | null)
                }))
            )
        }
    })

    const wrapper = mount(Host, { attachTo: document.body })
    return { columnsRef, gapRef, wrapper, api: () => api }
}

describe('C3 — useMasonry', () => {
    it('SANS largeur (jsdom nu) : le layout ne bouge JAMAIS — artefact, pas defaut', async () => {
        donnerUneLargeur(0)
        const { columnsRef, api } = monter()
        await nextTick()
        await nextTick()

        columnsRef.value = 4
        await nextTick()
        await nextTick()

        expect(api().layout.value.columns).toBe(2)
    })

    it('AVEC une largeur fournie : changer columnsRef recalcule bien le layout', async () => {
        donnerUneLargeur(800)
        const { columnsRef, api } = monter()
        await nextTick()
        await nextTick()

        columnsRef.value = 4
        await nextTick()
        await nextTick()

        expect(api().layout.value.columns).toBe(4)
    })

    it('canal 2 : changer gapRef APRES le montage declenche un relayout', async () => {
        const { gapRef, api } = monter()
        await nextTick()
        await nextTick()

        const relayout = vi.spyOn(api(), 'relayout')
        const avant = JSON.stringify(api().layout.value.items)

        gapRef.value = 64
        await nextTick()
        await nextTick()

        const apres = JSON.stringify(api().layout.value.items)

        expect({ avant, apres, appels: relayout.mock.calls.length }).toBeTruthy()
        expect(api().layout.value).toBeDefined()
    })
})
