/*
 * LOT 2/4 — `OrigamBottomNav` déclarait `update:active` sans jamais l'émettre.
 *
 * LE DIAGNOSTIC
 * -------------
 * `OrigamBottomNav.vue` source son état interne "actif" (affiché / masqué,
 * pilote le `v-if` racine et la transition de slide-in) depuis `modelValue` :
 *
 *     useStateFlag(props, {state: 'active', source: 'modelValue'})
 *
 * Le CANAL RÉEL du v-model est donc `modelValue`, pas `active` — `set()` /
 * `unset()` / `toggle()` (le composable partagé qui écrit dans le v-model via
 * `useVModel`, voir `guards/lib/dead-emits.mjs`'s `computeStateFlagEmitted()`)
 * n'écrivent JAMAIS dans le prop `active`. Le prop `active` (et
 * `activeClass`, via `IActiveProps` — toujours accepté par `IBottomNavProps`)
 * n'est lu QU'UNE FOIS dans tout le fichier, pour le FORWARDER en tant que
 * défaut aux `<origam-btn>` enfants (`slotDefaults`, ligne ~149) — jamais
 * relu, jamais réécrit par le composant lui-même.
 *
 * `update:active` n'avait donc aucun écrivain réel : ni un `emit(...)`
 * littéral, ni un relais `useStateFlag`/`useVModel` sur le canal `active`.
 * Retiré de `IBottomNavEmits` (bottom-nav.interface.ts) — `update:hover`
 * (relais RÉEL, canal `hover` par défaut) et `update:modelValue`
 * (`ICommonsComponentEmits`) restent déclarés et fonctionnels.
 *
 * ⚠️ Si le test "n'émet JAMAIS update:active" échoue, soit le composant a
 * gagné un vrai écrivain sur le canal `active` (dans ce cas: ré-étendre
 * `IActiveEmits` dans IBottomNavEmits, ce n'est plus mort), soit un test a
 * été cassé par erreur — vérifier lequel avant de "corriger" le test.
 */

import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createOrigam } from '@origam/origam'

import OrigamBottomNav from '@origam/components/BottomNav/OrigamBottomNav.vue'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
    }))
})

const origam = createOrigam()

function mountNav (props: Record<string, unknown> = {}) {
    return mount(OrigamBottomNav as never, {
        props: { items: [{ text: 'Home' }], ...props } as never,
        attachTo: document.body,
        global: { plugins: [origam] }
    })
}

describe('OrigamBottomNav — update:active retiré (canal réel = modelValue)', () => {
    it('ne reçoit JAMAIS update:active — clic sur la nav, sur le bouton enfant, et hover', async () => {
        const receivedActive: Array<unknown> = []
        const wrapper = mountNav({ 'onUpdate:active': (v: unknown) => receivedActive.push(v) })
        await nextTick()

        const nav = wrapper.find('nav')
        await nav.trigger('click')
        await nav.trigger('mouseenter')
        await nav.trigger('mouseleave')
        await nextTick()

        const btn = wrapper.find('button')
        if (btn.exists()) {
            await btn.trigger('click')
            await nextTick()
        }

        expect(receivedActive).toEqual([])
    })

    it('émet toujours update:hover — le relais réel n\'a pas été cassé par le retrait de update:active', async () => {
        const receivedHover: Array<unknown> = []
        const wrapper = mountNav({ 'onUpdate:hover': (v: unknown) => receivedHover.push(v) })
        await nextTick()

        await wrapper.find('nav').trigger('mouseenter')
        await nextTick()

        expect(receivedHover.length).toBeGreaterThan(0)
    })

    /*
     * `update:active` n'étant plus déclaré, Vue ne le retire PLUS de
     * `$attrs` — un `onUpdate:active` passé par un consommateur y reste
     * visible (fallthrough), au lieu d'être capté silencieusement par une
     * option `emits` qui ne l'aurait jamais réémis. Signal direct et
     * observable de la déclaration retirée (miroir des assertions
     * `attrs.not.toContain(...)` de `relay-emits-declaration-lot2.spec.ts`
     * pour les canaux réellement émis).
     */
    it('un onUpdate:active passé par le consommateur reste dans $attrs (fallthrough, pas capté)', async () => {
        const wrapper = mountNav({ 'onUpdate:active': () => {} })
        await nextTick()

        const attrs = Object.keys((wrapper.vm as unknown as { $attrs: object }).$attrs)

        expect(attrs).toContain('onUpdate:active')
    })
})
