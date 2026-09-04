/*
 * LOT 2/4 — PREUVE D'ÉMISSION pour Alert / Avatar / AvatarGroup / BottomNav /
 * Card, sur le même modèle que `relay-emits-declaration.spec.ts` (dont ce
 * fichier réutilise l'`observe()` — pas de logique dupliquée).
 *
 * CONTEXTE
 * --------
 * `useStateFlag(props, {state, source})` a REMPLACÉ les anciens
 * `useActive(props)` / `useHover(props)` — mais garde le même mécanisme
 * d'émission : il appelle `useVModel(props, source)` EN INTERNE
 * (vModel.composable.ts), qui émet `update:${source}` depuis SON PROPRE
 * setter au runtime (`vm?.emit(...)`), sans qu'aucun `emit(...)` littéral
 * n'apparaisse dans le `.vue` hôte. Le garde statique `unemitted-declarations`
 * ne reconnaît que l'ancien pattern `useActive(props` / `useHover(props` —
 * il ne voit donc PAS ces émissions, et les classe à tort `neverEmitted`.
 *
 * Ces tests prouvent, composant par composant, que l'émission RÉELLE existe
 * (pas de warning Vue "non déclaré", handler PAS retrouvé dans `$attrs`,
 * valeur BIEN reçue par le consommateur) — donc que la déclaration
 * `update:active` / `update:hover` / `update:modelValue` est justifiée et
 * ne doit PAS être retirée pour ces composants.
 *
 * ⛔ CONTRE-EXEMPLE, PAS COUVERT ICI PAR CE MOTIF : `OrigamBottomNav` sourcait
 * son état "active" depuis `modelValue`, pas depuis `active` — le canal réel
 * ne correspond PAS au nom déclaré, donc `update:active` y est un vrai mort
 * (retiré de `IBottomNavEmits`, voir `bottom-nav.interface.ts`). Seul
 * `update:hover` de BottomNav rejoint ce fichier.
 *
 * ⚠️ Si un test d'ici ÉCHOUE, la déclaration a disparu — c'est une
 * régression produite, pas un test à ajuster.
 */

import { describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createOrigam } from '@origam/origam'

import OrigamAlert from '@origam/components/Alert/OrigamAlert.vue'
import OrigamAvatar from '@origam/components/Avatar/OrigamAvatar.vue'
import OrigamAvatarGroup from '@origam/components/Avatar/OrigamAvatarGroup.vue'
import OrigamBottomNav from '@origam/components/BottomNav/OrigamBottomNav.vue'
import OrigamCard from '@origam/components/Card/OrigamCard.vue'

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

interface IObservation {
    warnings: Array<string>
    received: Array<unknown>
    attrs: Array<string>
}

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
        global: { plugins: [origam] }
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

const hover = async (wrapper: ReturnType<typeof mount>) => {
    await wrapper.trigger('mouseenter')
    await nextTick()
}

const click = async (wrapper: ReturnType<typeof mount>) => {
    await wrapper.trigger('click')
    await nextTick()
}

/*
 * BottomNav's template root is `<origam-transition>`, stubbed by
 * `@vue/test-utils` as a real `<transition-stub>` DOM element — so
 * `wrapper.element` is THAT stub, not the `<nav>` carrying
 * `@mouseenter`/`@mouseleave`. Triggering on the wrapper root never
 * reaches the real listener; the `<nav>` inside it must be targeted
 * explicitly.
 */
const hoverNav = async (wrapper: ReturnType<typeof mount>) => {
    await wrapper.find('nav').trigger('mouseenter')
    await nextTick()
}

describe('update:hover émis via useStateFlag({state:\'hover\'}) — déclaration obligatoire', () => {
    /*
     * Alert force `hover: true` PAR DÉFAUT (styles toujours "survolés" sans
     * interaction) — avec cette valeur, `useStateFlag` verrouille `isOn` à
     * `true` et un `mouseenter` réel n'écrit rien de NOUVEAU (no-op, donc
     * aucune émission : même valeur avant/après). Un consommateur réel
     * utilisant `v-model:hover="isHovering"` part en revanche d'un booléen
     * NON verrouillant (`false`), scénario reproduit ici en passant
     * `hover: false` explicitement — c'est la façon dont l'interaction
     * fonctionne réellement pour quiconque branche le v-model.
     */
    it('OrigamAlert déclare update:hover (hover=false, interaction réelle)', async () => {
        const { warnings, received, attrs } = await observe(
            OrigamAlert,
            'update:hover',
            { hover: false, text: 'hello' },
            hover
        )

        expect(warnings).toEqual([])
        expect(received.length).toBeGreaterThan(0)
        expect(attrs).not.toContain('onUpdate:hover')
    })

    it('OrigamAvatar déclare update:hover', async () => {
        const { warnings, received, attrs } = await observe(
            OrigamAvatar,
            'update:hover',
            { text: 'AP' },
            hover
        )

        expect(warnings).toEqual([])
        expect(received.length).toBeGreaterThan(0)
        expect(attrs).not.toContain('onUpdate:hover')
    })

    it('OrigamAvatarGroup déclare update:hover', async () => {
        const { warnings, received, attrs } = await observe(
            OrigamAvatarGroup,
            'update:hover',
            { items: [{ text: 'A' }, { text: 'B' }] },
            hover
        )

        expect(warnings).toEqual([])
        expect(received.length).toBeGreaterThan(0)
        expect(attrs).not.toContain('onUpdate:hover')
    })

    it('OrigamBottomNav déclare update:hover', async () => {
        const { warnings, received, attrs } = await observe(
            OrigamBottomNav,
            'update:hover',
            { items: [{ text: 'Home' }] },
            hoverNav
        )

        expect(warnings).toEqual([])
        expect(received.length).toBeGreaterThan(0)
        expect(attrs).not.toContain('onUpdate:hover')
    })

    /*
     * The base origam theme defaults every Card to `flat: true`
     * (`theme.components['origam-card'].flat`, see OrigamCard.vue's own
     * `isHoverable` comment) — `isHoverable` gates the mouseenter/mouseleave
     * BINDING itself off entirely for a flat card, by design (a flat card
     * has no hover surface to show). `flat: false` reproduces the realistic
     * override a consumer makes to opt back into hover.
     */
    it('OrigamCard déclare update:hover (flat=false, interaction réelle)', async () => {
        const { warnings, received, attrs } = await observe(
            OrigamCard,
            'update:hover',
            { flat: false },
            hover
        )

        expect(warnings).toEqual([])
        expect(received.length).toBeGreaterThan(0)
        expect(attrs).not.toContain('onUpdate:hover')
    })
})

describe('update:active émis via useStateFlag({state:\'active\'}) — déclaration obligatoire', () => {
    it('OrigamAvatar déclare update:active', async () => {
        const { warnings, received, attrs } = await observe(
            OrigamAvatar,
            'update:active',
            { text: 'AP' },
            click
        )

        expect(warnings).toEqual([])
        expect(received.length).toBeGreaterThan(0)
        expect(attrs).not.toContain('onUpdate:active')
    })

    it('OrigamAvatarGroup déclare update:active', async () => {
        const { warnings, received, attrs } = await observe(
            OrigamAvatarGroup,
            'update:active',
            { items: [{ text: 'A' }, { text: 'B' }] },
            click
        )

        expect(warnings).toEqual([])
        expect(received.length).toBeGreaterThan(0)
        expect(attrs).not.toContain('onUpdate:active')
    })

    it('OrigamCard déclare update:active', async () => {
        const { warnings, received, attrs } = await observe(
            OrigamCard,
            'update:active',
            { href: '#', link: true },
            click
        )

        expect(warnings).toEqual([])
        expect(received.length).toBeGreaterThan(0)
        expect(attrs).not.toContain('onUpdate:active')
    })
})

describe('update:modelValue émis via useStateFlag({state:\'active\', source:\'modelValue\'}) — déclaration obligatoire', () => {
    /*
     * Alert source son état "actif" (affiché/masqué) depuis `modelValue`, pas
     * depuis `active` — c'est pourquoi `IAlertEmits` n'étend PAS
     * `IActiveEmits` : le canal réel est `update:modelValue`
     * (`ICommonsComponentEmits`), câblé via le bouton de fermeture
     * (`handleClose` -> `onActive()` -> `useVModel(props, 'modelValue')`).
     */
    it('OrigamAlert déclare update:modelValue (bouton close)', async () => {
        const { warnings, received, attrs } = await observe(
            OrigamAlert,
            'update:modelValue',
            { modelValue: true, closable: true, text: 'hello' },
            async (wrapper) => {
                await wrapper.find('[data-cy="close"]').trigger('click')
                await nextTick()
            }
        )

        expect(warnings).toEqual([])
        expect(received).toContain(false)
        expect(attrs).not.toContain('onUpdate:modelValue')
    })
})
