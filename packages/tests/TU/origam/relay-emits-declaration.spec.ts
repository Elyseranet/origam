/*
 * PREUVE D'ÉMISSION — les `update:*` partis d'un composable RELAIS doivent
 * être DÉCLARÉS par le composant hôte.
 *
 * LE DÉFAUT
 * ---------
 * `useVModel(props, 'x')` n'émet que dans son SETTER
 * (vModel.composable.ts:70). Un composant qui confie ses `props` à un
 * composable relais devient donc émetteur de `update:x` — sans qu'aucun
 * `emit('update:x')` n'apparaisse nulle part dans son `.vue`. Si son
 * interface d'emits ne le déclare pas, deux choses cassent :
 *
 *   1. Vue avertit à chaque émission ("neither declared in the emits
 *      option nor as an onUpdate:x prop").
 *   2. Le handler `onUpdate:x` reste dans `$attrs` — donc posé par
 *      `inheritAttrs` sur l'élément racine, où il n'a rien à faire.
 *
 * Premier cas traité : `IFormEmits` (commit 5b8ef33f), épinglé dans
 * `vmodel-relay-props.spec.ts`. Ce fichier-ci couvre les 5 autres
 * composants dont le défaut a été PROUVÉ au runtime.
 *
 * ⚠️ PIÈGE — VUE N'AVERTIT PAS TOUJOURS
 * -------------------------------------
 * L'avertissement Vue ne part QUE si le composant a une option `emits`
 * qui omet l'événement. Un composant SANS AUCUN `defineEmits` a
 * `emitsOptions === null` et Vue reste totalement silencieux, quoi qu'il
 * émette. C'est le cas de `<OrigamRadioGroup>` et `<OrigamSnackbar>` :
 * pour eux la seule observation possible est la pollution de `$attrs`.
 * Un garde qui ne chercherait que l'avertissement les manquerait — et
 * c'est exactement ce qui les a laissés passer.
 *
 * ⚠️ Si un test d'ici ÉCHOUE, la déclaration a disparu — c'est une
 * régression produite, pas un test à ajuster.
 */

import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { createOrigam } from '@origam/origam'

import OrigamBracketCompetitor from '@origam/components/Bracket/OrigamBracketCompetitor.vue'
import OrigamBracketMatch from '@origam/components/Bracket/OrigamBracketMatch.vue'
import OrigamSheet from '@origam/components/Sheet/OrigamSheet.vue'
import OrigamRadioGroup from '@origam/components/Radio/OrigamRadioGroup.vue'
import OrigamSnackbar from '@origam/components/Snackbar/OrigamSnackbar.vue'
import OrigamDialogConfirmation from '@origam/components/Dialog/OrigamDialogConfirmation.vue'

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

/*
 * jsdom n'a pas de moteur de layout : la vraie résolution de
 * `locationStrategy` y jette. On stub `<OrigamOverlay>` comme le font
 * déjà OrigamDialog.spec.ts / OrigamMenu.spec.ts / OrigamSnackbar.spec.ts.
 * Le scope `{isActive}` est OBLIGATOIRE — `<OrigamDialog>` déstructure
 * `#default="{isActive}"` et casse sur un slot appelé sans scope.
 */
const OrigamOverlayStub = defineComponent({
    name: 'OrigamOverlay',
    props: {
        modelValue: { type: Boolean, default: false },
        class: [String, Array, Object],
        style: [String, Array, Object]
    },
    emits: ['update:modelValue'],
    setup (props, { slots, expose }) {
        const contentEl = ref<HTMLElement | null>(null)
        const activatorEl = ref<HTMLElement | null>(null)
        const globalTop = ref(true)

        expose({ filterProps: () => ({}), contentEl, activatorEl, globalTop })

        return () => h('div', { 'data-stub': 'overlay', class: props.class }, [
            props.modelValue ? slots.default?.({ isActive: props.modelValue }) : null
        ])
    }
})

const origam = createOrigam()

interface IObservation {
    /** Avertissements Vue "non déclaré" captés pendant le scénario. */
    warnings: Array<string>
    /** Valeurs reçues par le handler du CONSOMMATEUR. */
    received: Array<unknown>
    /** Clés de `$attrs` — le handler ne doit PAS y figurer. */
    attrs: Array<string>
}

/**
 * Monte le composant avec un handler de consommateur branché, joue le
 * scénario, et rapporte les trois observations qui distinguent un emit
 * déclaré d'un emit clandestin.
 */
const observe = async (
    component: unknown,
    event: string,
    props: Record<string, unknown>,
    act: (wrapper: ReturnType<typeof mount>) => Promise<void>
): Promise<IObservation> => {
    const warnings: Array<string> = []
    const received: Array<unknown> = []
    const original = console.warn

    console.warn = (...args: Array<unknown>) => { warnings.push(String(args[0])) }

    const wrapper = mount(component as never, {
        props: { ...props, [`on${event[0].toUpperCase()}${event.slice(1)}`]: (v: unknown) => received.push(v) } as never,
        attachTo: document.body,
        global: { plugins: [origam], stubs: { OrigamOverlay: OrigamOverlayStub } }
    })

    await nextTick()

    const attrs = Object.keys((wrapper.vm as unknown as { $attrs: object }).$attrs)

    await act(wrapper)

    console.warn = original
    wrapper.unmount()

    return {
        warnings: warnings.filter((w) => w.includes('neither declared in the emits option')),
        received,
        attrs
    }
}

const clickRoot = async (wrapper: ReturnType<typeof mount>) => {
    await wrapper.trigger('click')
    await nextTick()
}

describe('update:active émis par useActive — déclaration obligatoire', () => {
    /*
     * `useActive(props)` n'écrit dans le v-model que depuis `onActive()`
     * (active.composable.ts:99). Ces trois composants câblent `onActive`
     * sur le clic de leur racine — le chemin d'écriture est donc réel,
     * contrairement aux composants qui ne déstructurent que `isActive` /
     * `activeState` et n'émettent jamais (Btn, Toolbar, Badge, Drawer,
     * BreadcrumbItem, ExpansionPanel…).
     */
    it('OrigamBracketCompetitor déclare update:active', async () => {
        const { warnings, received, attrs } = await observe(
            OrigamBracketCompetitor,
            'update:active',
            { competitor: { id: 'a', name: 'A' } },
            clickRoot
        )

        expect(warnings).toEqual([])
        expect(received.length).toBeGreaterThan(0)
        expect(attrs).not.toContain('onUpdate:active')
    })

    it('OrigamBracketMatch déclare update:active', async () => {
        const { warnings, received, attrs } = await observe(
            OrigamBracketMatch,
            'update:active',
            { match: { id: 'm', competitorA: { id: 'a', name: 'A' }, competitorB: { id: 'b', name: 'B' } } },
            clickRoot
        )

        expect(warnings).toEqual([])
        expect(received.length).toBeGreaterThan(0)
        expect(attrs).not.toContain('onUpdate:active')
    })

    it('OrigamSheet déclare update:active', async () => {
        const { warnings, received, attrs } = await observe(
            OrigamSheet,
            'update:active',
            {},
            clickRoot
        )

        expect(warnings).toEqual([])
        expect(received.length).toBeGreaterThan(0)
        expect(attrs).not.toContain('onUpdate:active')
    })
})

describe('update:modelValue émis via useVModel — déclaration obligatoire', () => {
    /*
     * `handleValidate` / `handleCancel` referment le dialogue en écrivant
     * `isActive.value = false`. Le scénario clique les deux boutons de
     * chrome ; le premier suffit à déclencher l'écriture.
     */
    it('OrigamDialogConfirmation déclare update:modelValue', async () => {
        const { warnings, received, attrs } = await observe(
            OrigamDialogConfirmation,
            'update:modelValue',
            { modelValue: true },
            async (wrapper) => {
                for (const btn of wrapper.findAll('button')) {
                    await btn.trigger('click')
                    await nextTick()
                }
            }
        )

        expect(warnings).toEqual([])
        expect(received).toContain(false)
        expect(attrs).not.toContain('onUpdate:modelValue')
    })

    /*
     * Sans `defineEmits`, Vue ne dit RIEN : on assert donc sur `$attrs`.
     * Le doublon de `received` est la conséquence directe et mesurable de
     * la pollution — le spread `rootAttrs` réinjectait le handler sur
     * `<origam-input>`, qui le rappelait après l'émission de la racine.
     * Une seule sélection doit produire exactement une notification.
     */
    it('OrigamRadioGroup déclare update:modelValue — handler hors de $attrs, appelé une seule fois', async () => {
        const { warnings, received, attrs } = await observe(
            OrigamRadioGroup,
            'update:modelValue',
            {
                modelValue: null,
                items: [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }]
            },
            async (wrapper) => {
                const radios = wrapper.findAll('input[type="radio"]')

                expect(radios.length).toBe(2)
                await radios[0].setValue(true)
                await nextTick()
            }
        )

        expect(warnings).toEqual([])
        expect(attrs).not.toContain('onUpdate:modelValue')
        expect(received).toEqual(['a'])
    })

    /*
     * L'écriture vit dans le callback de `setTimeout` armé par
     * `startTimeout` — il faut donc un `timeout` court ET attendre plus
     * longtemps que lui, sinon le chemin n'est jamais atteint et le test
     * accuse le composant à tort.
     */
    it('OrigamSnackbar déclare update:modelValue — fermeture auto hors de $attrs', async () => {
        const { warnings, received, attrs } = await observe(
            OrigamSnackbar,
            'update:modelValue',
            { modelValue: true, text: 'Notification', timeout: 5 },
            async () => {
                await new Promise((resolve) => setTimeout(resolve, 80))
                await nextTick()
            }
        )

        expect(warnings).toEqual([])
        expect(attrs).not.toContain('onUpdate:modelValue')
        expect(received).toEqual([false])
    })
})
