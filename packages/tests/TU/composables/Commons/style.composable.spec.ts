// Tests for `useStyle` (and `useStyleTag`) composables.
//
// `useStyleTag` injects a <style> element in document.head. jsdom supports
// document.head so most paths are testable headlessly.
//
// `useStyle` wraps a ComputedRef of styles (array or object) into a scoped
// CSS rule `#id { … }` and delegates to useStyleTag.
//
// DOM-dependent tests (load/unload checking DOM mutations) are exercised via
// mount() so tryOnMounted/onMounted hooks fire correctly.

import { computed, defineComponent, h, ref, type MaybeRefOrGetter } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import { useStyle } from '@origam/composables/Commons/style.composable'
import { useStyleTag } from '@origam/composables/Commons/styleTag.composable'

// ---------------------------------------------------------------------------
// useStyleTag — manual mode (no DOM side-effects in setup)
// ---------------------------------------------------------------------------

describe('useStyleTag — manual mode', () => {
    it('returns id, css, load, unload, isLoaded', () => {
        const Host = defineComponent({
            name: 'OrigamStyleTagHost',
            setup () {
                const tag = useStyleTag('body { color: red }', { manual: true })
                return { tag }
            },
            template: '<div />'
        })

        const wrapper = mount(Host)
        const tag = (wrapper.vm as any).tag
        expect(tag).toHaveProperty('id')
        expect(tag).toHaveProperty('css')
        expect(typeof tag.load).toBe('function')
        expect(typeof tag.unload).toBe('function')
        expect(tag).toHaveProperty('isLoaded')
    })

    it('isLoaded starts as false in manual mode', () => {
        let isLoaded!: ReturnType<typeof useStyleTag>['isLoaded']

        const Host = defineComponent({
            name: 'OrigamStyleTagIsLoadedHost',
            setup () {
                const tag = useStyleTag('color: red', { manual: true })
                isLoaded = tag.isLoaded
                return () => h('div')
            }
        })

        mount(Host)
        expect(isLoaded.value).toBe(false)
    })

    it('load() → isLoaded becomes true', () => {
        const Host = defineComponent({
            name: 'OrigamStyleTagLoadHost',
            setup () {
                const tag = useStyleTag('body {}', { manual: true })
                return { tag }
            },
            template: '<div />'
        })

        const wrapper = mount(Host)
        const { tag } = wrapper.vm as any
        tag.load()
        expect(tag.isLoaded.value).toBe(true)
    })

    it('custom id is used', () => {
        const Host = defineComponent({
            name: 'OrigamStyleTagIdHost',
            setup () {
                const tag = useStyleTag('h1 {}', { manual: true, id: 'my-custom-id' })
                return { id: tag.id }
            },
            template: '<div />'
        })

        const wrapper = mount(Host)
        expect((wrapper.vm as any).id).toBe('my-custom-id')
    })

    it('auto-generated id is unique across calls', () => {
        const ids: string[] = []

        const Host = defineComponent({
            name: 'OrigamStyleTagUniqueHost',
            setup () {
                const t1 = useStyleTag('a {}', { manual: true })
                const t2 = useStyleTag('b {}', { manual: true })
                ids.push(t1.id, t2.id)
                return {}
            },
            template: '<div />'
        })

        mount(Host)
        expect(ids[0]).not.toBe(ids[1])
    })

    it('unload() after load() → isLoaded becomes false', () => {
        const Host = defineComponent({
            name: 'OrigamStyleTagUnloadHost',
            setup () {
                const tag = useStyleTag('span {}', { manual: true })
                return { tag }
            },
            template: '<div />'
        })

        const wrapper = mount(Host)
        const { tag } = wrapper.vm as any
        tag.load()
        expect(tag.isLoaded.value).toBe(true)
        tag.unload()
        expect(tag.isLoaded.value).toBe(false)
    })
})

// ---------------------------------------------------------------------------
// useStyle — CSS generation logic (does NOT depend on DOM mutations)
// ---------------------------------------------------------------------------

describe('useStyle — customCss generation', () => {
    it('array of strings → joined into CSS rule', () => {
        let cssValue = ''

        const Host = defineComponent({
            name: 'OrigamStyleHost',
            setup () {
                const styles = computed(() => ['color: red', 'font-size: 16px'])
                const api = useStyle(styles, 'test-style-id')
                cssValue = api.css.value
                return {}
            },
            template: '<div />'
        })

        mount(Host)
        expect(cssValue).toContain('color: red')
        expect(cssValue).toContain('font-size: 16px')
        expect(cssValue).toMatch(/^#test-style-id \{/)
    })

    it('object styles → entries mapped to key: value strings', () => {
        let cssValue = ''

        const Host = defineComponent({
            name: 'OrigamStyleObjHost',
            setup () {
                const styles = computed(() => ({ 'background-color': 'blue', opacity: '0.5' }))
                const api = useStyle(styles, 'test-obj-id')
                cssValue = api.css.value
                return {}
            },
            template: '<div />'
        })

        mount(Host)
        expect(cssValue).toContain('background-color: blue')
        expect(cssValue).toContain('opacity: 0.5')
    })

    it('undefined values in object → filtered out', () => {
        let cssValue = ''

        const Host = defineComponent({
            name: 'OrigamStyleUndefinedHost',
            setup () {
                const styles = computed(() => ({ color: undefined as unknown as string, 'font-size': '14px' }))
                const api = useStyle(styles, 'test-undef-id')
                cssValue = api.css.value
                return {}
            },
            template: '<div />'
        })

        mount(Host)
        expect(cssValue).not.toContain('color:')
        expect(cssValue).toContain('font-size: 14px')
    })

    it('empty array → CSS rule with empty body', () => {
        let cssValue = ''

        const Host = defineComponent({
            name: 'OrigamStyleEmptyHost',
            setup () {
                const styles = computed(() => [])
                const api = useStyle(styles, 'test-empty-id')
                cssValue = api.css.value
                return {}
            },
            template: '<div />'
        })

        mount(Host)
        expect(cssValue).toBe('#test-empty-id {}')
    })

    it('css ref updates when computed styles change', async () => {
        const color = ref('red')
        let api: ReturnType<typeof useStyle>

        const Host = defineComponent({
            name: 'OrigamStyleReactiveHost',
            setup () {
                const styles = computed(() => [`color: ${color.value}`])
                api = useStyle(styles, 'test-reactive-id')
                return {}
            },
            template: '<div />'
        })

        mount(Host)
        expect(api!.css.value).toContain('color: red')
        color.value = 'blue'
        // computed is synchronously reactive
        expect(api!.css.value).toContain('color: blue')
    })

    it('uniq id provided → used as CSS selector id', () => {
        let cssValue = ''

        const Host = defineComponent({
            name: 'OrigamStyleUniqHost',
            setup () {
                const styles = computed(() => ['padding: 8px'])
                const api = useStyle(styles, 'my-uniq-id')
                cssValue = api.css.value
                return {}
            },
            template: '<div />'
        })

        mount(Host)
        expect(cssValue).toMatch(/^#my-uniq-id/)
    })
})

// ---------------------------------------------------------------------------
// useStyle — `uniq` resolution
//
// REGRESSION. `useStyle` returns BOTH the id a component is expected to put on
// its root element AND the selector of the rule it generates for that element.
// The two are the same value on purpose: if a component honours a
// consumer-supplied `id` but the rule keeps targeting the generated one, they
// diverge and the rule matches nothing — the component loses its own styles.
// That is why `uniq` must be a reactive getter (`() => props.id`): an `id` that
// only appears on a later render still has to be picked up.
// ---------------------------------------------------------------------------

function styleHost (uniq: MaybeRefOrGetter<string | undefined>, styles: unknown[] = ['padding: 8px']) {
    let api!: ReturnType<typeof useStyle>

    const Host = defineComponent({
        name: 'OrigamStyleUniqResolutionHost',
        setup () {
            api = useStyle(computed(() => styles) as never, uniq)
            return () => h('div')
        }
    })

    mount(Host)

    return api
}

describe('useStyle — uniq resolution', () => {
    it('no uniq → falls back to a generated `<name>-<uid>` id', () => {
        const api = styleHost(undefined)

        expect(api.id.value).toMatch(/^origam-style-uniq-resolution-host-\d+$/)
        expect(api.css.value).toMatch(/^#origam-style-uniq-resolution-host-\d+ \{/)
    })

    it('a plain string uniq wins over the generated id', () => {
        const api = styleHost('consumer-id')

        expect(api.id.value).toBe('consumer-id')
        expect(api.css.value).toMatch(/^#consumer-id \{/)
    })

    it('a getter uniq wins, and the returned id and the rule selector always agree', () => {
        const api = styleHost(() => 'from-getter')

        expect(api.id.value).toBe('from-getter')
        expect(api.css.value).toBe(`#${api.id.value} {padding: 8px}`)
    })

    it('a ref uniq that fills in on a later render is picked up', () => {
        const uniq = ref<string | undefined>(undefined)
        const api = styleHost(uniq)

        expect(api.id.value).toMatch(/^origam-style-uniq-resolution-host-\d+$/)

        uniq.value = 'late-id'

        expect(api.id.value).toBe('late-id')
        expect(api.css.value).toMatch(/^#late-id \{/)
    })

    it('an empty-string uniq falls back rather than emitting the invalid selector `#`', () => {
        const api = styleHost('')

        expect(api.id.value).not.toBe('')
        expect(api.css.value).not.toMatch(/^# \{/)
    })

    it('escapes a uniq that is not a valid CSS ident, so the rule still matches', () => {
        const api = styleHost('1st.title')

        expect(api.id.value).toBe('1st.title')
        expect(api.css.value).toMatch(/^#\\31 st\\.title \{/)
    })
})

// ---------------------------------------------------------------------------
// useStyle — declaration filtering
//
// REGRESSION. Vue's own `StyleValue` type includes `false`, so every component
// declaring the shared `style` prop compiles to a runtime prop type containing
// `Boolean` — and Vue resolves an unpassed boolean-typed prop to the concrete
// value `false`, never `undefined`. That `false` was reaching the generated
// rule as a bare `#id {false}`, which is not a declaration: jsdom rejects the
// whole sheet ("Could not parse CSS stylesheet") and browsers discard it by
// error recovery. Nothing may leave this composable that is not a
// `prop: value` declaration.
// ---------------------------------------------------------------------------

describe('useStyle — declaration filtering', () => {
    it('drops a boolean — the unpassed `style` prop Vue coerces to false', () => {
        const api = styleHost('bool-id', [{ color: 'red' }, false])

        expect(api.css.value).toBe('#bool-id {color: red}')
        expect(api.css.value).not.toContain('false')
    })

    it('a bag holding nothing but that false produces an empty rule body', () => {
        const api = styleHost('only-false-id', [false])

        expect(api.css.value).toBe('#only-false-id {}')
    })

    it('drops numbers — a bare `0` is not a declaration either', () => {
        const api = styleHost('num-id', [{ opacity: '0.5' }, 0])

        expect(api.css.value).toBe('#num-id {opacity: 0.5}')
    })

    it('drops null, undefined and empty strings', () => {
        const api = styleHost('nullish-id', [null, undefined, '', 'color: red'])

        expect(api.css.value).toBe('#nullish-id {color: red}')
    })

    it('expands an object nested inside an array instead of emitting [object Object]', () => {
        const api = styleHost('nested-id', [['color: red', { 'font-size': '14px' }]])

        expect(api.css.value).not.toContain('[object Object]')
        expect(api.css.value).toContain('color: red')
        expect(api.css.value).toContain('font-size: 14px')
    })

    it('keeps every declaration of a plain object bag', () => {
        const api = styleHost('obj-id', [{ color: 'red', 'font-size': '14px' }])

        expect(api.css.value).toBe('#obj-id {color: red;font-size: 14px}')
    })
})
