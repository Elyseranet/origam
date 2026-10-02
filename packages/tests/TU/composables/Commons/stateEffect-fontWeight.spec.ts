// L'axe 11 de `useStateEffect` — `fontWeight`, ajoute par ADR-005 lot 4
// (#1027) pour l'etat ACTIF de `variant="tonal"` sur `OrigamBtn`.
//
// WHY A SEPARATE FILE. Meme raison que `stateEffect-opacity-borderColor.spec.ts`
// pour les axes du lot 3 : ces tests assertent le SWAP d'etat, qui est tout
// l'objet de l'ajout. Une cle d'interface que `useStateEffect` ne resout
// jamais est la « surface a moitie implementee » que la regle de reutilisation
// du `CLAUDE.md` nomme comme mode de defaillance n°1. Les garder a part fait
// qu'une regression NOMME son lot.
//
// ⛔ CET AXE EST RESOLU MAIS PAS EMIS, a dessein : emettre une declaration
// typographique demande le prefixe de var du composant
// (`useTypography(props, 'btn')`), que `useStateEffect` ne connait pas. Ces
// tests assertent donc le REF RESOLU, jamais un style — et c'est le contrat,
// pas un contournement de jsdom.

import { computed, defineComponent, h, reactive, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { useStateEffect } from '@origam/composables/Commons/stateEffect.composable'

type StateEffectProps = Parameters<typeof useStateEffect>[0]

function mountStateEffect (
    props: StateEffectProps,
    options: {
        isHover?: boolean
        isActive?: boolean
        hoverState?: Record<string, unknown>
        activeState?: Record<string, unknown>
    } = {}
) {
    const isHover = ref(options.isHover ?? false)
    const isActive = ref(options.isActive ?? false)
    const hoverState = computed(() => options.hoverState as never)
    const activeState = computed(() => options.activeState as never)

    let api!: ReturnType<typeof useStateEffect>

    const Host = defineComponent({
        name: 'OrigamStateEffectFontWeightHost',
        setup () {
            api = useStateEffect(props, isHover, isActive, hoverState, activeState)
            return () => h('div')
        }
    })

    mount(Host)

    return { api: () => api, isHover, isActive }
}

describe('useStateEffect — axe fontWeight', () => {
    it('resolves the RESTING fontWeight when no state is engaged', () => {
        const { api } = mountStateEffect({ fontWeight: 'regular' })

        expect(api().fontWeight.value).toBe('regular')
    })

    it('is undefined when nothing names it — no fabricated default', () => {
        const { api } = mountStateEffect({})

        expect(api().fontWeight.value).toBeUndefined()
    })

    it('swaps to the ACTIVE override while active — the tonal case', () => {
        const { api, isActive } = mountStateEffect(
            { fontWeight: 'regular' },
            { activeState: { fontWeight: 'semibold' } }
        )

        // CONTROLE D'ACTUATION — sans cette lecture au repos, « ca a change »
        // serait vrai par construction.
        expect(api().fontWeight.value).toBe('regular')

        isActive.value = true
        expect(api().fontWeight.value).toBe('semibold')
    })

    it('an active override lands even with NO resting fontWeight', () => {
        const { api, isActive } = mountStateEffect(
            {},
            { activeState: { fontWeight: 'semibold' } }
        )

        expect(api().fontWeight.value).toBeUndefined()

        isActive.value = true
        expect(api().fontWeight.value).toBe('semibold')
    })

    it('HOVER outranks ACTIVE on this axis too — same precedence as every other', () => {
        const { api, isHover, isActive } = mountStateEffect(
            { fontWeight: 'regular' },
            { hoverState: { fontWeight: 'bold' }, activeState: { fontWeight: 'semibold' } }
        )

        isActive.value = true
        expect(api().fontWeight.value).toBe('semibold')

        isHover.value = true
        expect(api().fontWeight.value).toBe('bold')
    })

    it('falls back to the resting value when the engaged state does NOT name the key', () => {
        const { api, isActive } = mountStateEffect(
            { fontWeight: 'medium' },
            { activeState: { bgColor: 'primary' } }
        )

        isActive.value = true
        expect(api().fontWeight.value).toBe('medium')
    })

    it('stays reactive on the RESTING prop (the pickEffective getter contract)', () => {
        const props = reactive({ fontWeight: 'regular' as string | undefined })
        let api!: ReturnType<typeof useStateEffect>

        const Host = defineComponent({
            name: 'OrigamStateEffectFontWeightReactiveHost',
            setup () {
                api = useStateEffect(props as StateEffectProps)
                return () => h('div')
            }
        })

        mount(Host)
        expect(api.fontWeight.value).toBe('regular')

        props.fontWeight = 'bold'
        expect(api.fontWeight.value).toBe('bold')
    })

    it('does NOT emit any style for this axis — the component owns the var prefix', () => {
        const { api, isActive } = mountStateEffect(
            { fontWeight: 'regular' },
            { activeState: { fontWeight: 'semibold' } }
        )

        isActive.value = true

        const everyStyle = [
            ...api().colorStyles.value,
            ...api().borderStyles.value,
            ...api().roundedStyles.value,
            ...api().elevationStyles.value,
            ...api().paddingStyles.value,
            ...api().marginStyles.value,
            ...api().gapStyles.value,
            ...api().opacityStyles.value
        ].join(' ')

        expect(everyStyle).not.toContain('font-weight')
        expect(everyStyle).not.toContain('semibold')
    })
})
