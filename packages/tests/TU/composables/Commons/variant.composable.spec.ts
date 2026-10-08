// Tests for `useVariant` composable.
// Covers: class emission per TVariant + TVariantInput values, Ref overload,
// undefined/null → empty, name fallback from component instance.

import { defineComponent, h, reactive, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { useVariant } from '@origam/composables/Commons/variant.composable'

function mountWith (initial: string | undefined, componentName = 'OrigamVariantHost') {
    const props = reactive<{ variant?: string }>({ variant: initial })
    let api!: ReturnType<typeof useVariant>

    const Host = defineComponent({
        name: componentName,
        setup () {
            api = useVariant(props)
            return () => h('div')
        }
    })

    mount(Host)
    return { props, api: () => api }
}

describe('useVariant', () => {
    it('returns variantClasses', () => {
        const { api } = mountWith('text')
        expect(api()).toHaveProperty('variantClasses')
    })

    it('undefined variant → empty classes', () => {
        const { api } = mountWith(undefined)
        expect(api().variantClasses.value).toEqual([])
    })

    it.each(['text', 'flat', 'elevated', 'tonal', 'outlined', 'plain', 'ghost'] as const)(
        'VARIANT "%s" → emits component--variant-%s class',
        (v) => {
            const { api } = mountWith(v, 'OrigamBtn')
            expect(api().variantClasses.value).toContain(`origam-btn--variant-${v}`)
        }
    )

    it.each(['underlined', 'filled', 'solo', 'outlined', 'plain'] as const)(
        'VARIANT_INPUT "%s" → emits component--variant-%s class',
        (v) => {
            const { api } = mountWith(v, 'OrigamTextField')
            expect(api().variantClasses.value).toContain(`origam-text-field--variant-${v}`)
        }
    )

    it('class uses kebab-cased component name', () => {
        const { api } = mountWith('tonal', 'OrigamChip')
        const cls = api().variantClasses.value
        expect(cls.some(c => c.startsWith('origam-chip--variant-'))).toBe(true)
    })

    it('class does NOT contain the raw PascalCase name', () => {
        const { api } = mountWith('tonal', 'OrigamChip')
        const cls = api().variantClasses.value
        expect(cls.some(c => c.includes('OrigamChip'))).toBe(false)
    })

    it('Ref<TVariant> overload — emits class from ref value', () => {
        const variantRef = ref<string | undefined>('outlined')
        let api!: ReturnType<typeof useVariant>

        const Host = defineComponent({
            name: 'OrigamRefHost',
            setup () {
                api = useVariant(variantRef)
                return () => h('div')
            }
        })

        mount(Host)
        expect(api.variantClasses.value).toContain('origam-ref-host--variant-outlined')
    })

    it('Ref<TVariant> overload — reactively updates when ref value changes', () => {
        const variantRef = ref<string | undefined>('outlined')
        let api!: ReturnType<typeof useVariant>

        const Host = defineComponent({
            name: 'OrigamReactiveRefHost',
            setup () {
                api = useVariant(variantRef)
                return () => h('div')
            }
        })

        mount(Host)
        expect(api.variantClasses.value).toContain('origam-reactive-ref-host--variant-outlined')
        variantRef.value = 'tonal'
        expect(api.variantClasses.value).toContain('origam-reactive-ref-host--variant-tonal')
        expect(api.variantClasses.value).not.toContain('origam-reactive-ref-host--variant-outlined')
    })

    it('reactive props.variant change → class updates', () => {
        const { props, api } = mountWith('flat', 'OrigamCard')
        expect(api().variantClasses.value).toContain('origam-card--variant-flat')
        props.variant = 'elevated'
        expect(api().variantClasses.value).toContain('origam-card--variant-elevated')
        expect(api().variantClasses.value).not.toContain('origam-card--variant-flat')
    })

    it('only one class emitted per variant (no duplicates)', () => {
        const { api } = mountWith('tonal', 'OrigamBtn')
        const cls = api().variantClasses.value
        const variantCls = cls.filter(c => c.includes('--variant-'))
        expect(variantCls.length).toBe(1)
    })
})
