/*
 * #1157 — dev warnings fired by the DS's OWN markup, never by a consumer.
 *
 * - `<OrigamMessages prop "active">`: Input / Form / ConfirmWrapper / OtpInputField
 *   passed `:active="hasMessages"` to a component that declares `active` dead.
 * - `<OrigamToolbar prop "modelValue">`: the predicate was `!== undefined`
 *   while `withDefaults` sets `true`, so it fired on every mount.
 *
 * A consumer who really passes the dead prop must STILL be warned.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
        matches: false, media: query, onchange: null,
        addListener: vi.fn(), removeListener: vi.fn(),
        addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn()
    }))
})

vi.setConfig({ testTimeout: 60000 })

const load = async (loader: () => Promise<any>) => {
    vi.resetModules() // warnUnsupportedProp dedupes in a module-level Set
    const { createOrigam } = await import('@origam/origam')
    return { comp: (await loader()).default, plugins: [createOrigam()] }
}

const noEffect = (spy: ReturnType<typeof vi.spyOn>, component: string, prop: string) =>
    spy.mock.calls.filter(c => String(c[0]).includes(`<${component}> prop "${prop}" has no effect`))

describe('#1157 dev warnings', () => {
    let warn: ReturnType<typeof vi.spyOn>
    beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
    afterEach(() => warn.mockRestore())

    const PARENTS: Array<[string, () => Promise<any>, Record<string, unknown>]> = [
        ['Input', () => import('@origam/components/Input/OrigamInput.vue'), { messages: ['boom'] }],
        ['Form', () => import('@origam/components/Form/OrigamForm.vue'), { errorMessages: ['boom'] }],
        ['ConfirmWrapper', () => import('@origam/components/ConfirmWrapper/OrigamConfirmWrapper.vue'), { messages: ['boom'] }],
        ['OtpInputField', () => import('@origam/components/OtpInputField/OrigamOtpInputField.vue'), { messages: ['boom'] }]
    ]

    for (const [name, loader, props] of PARENTS) {
        it(`${name} renders OrigamMessages without passing the dead "active" prop`, async () => {
            const { comp, plugins } = await load(loader)
            const w = mount(comp, { props, global: { plugins } })
            expect(w.find('.origam-messages').exists()).toBe(true)
            expect(noEffect(warn, 'OrigamMessages', 'active')).toHaveLength(0)
        })
    }

    it('a consumer passing `active` to OrigamMessages is still warned', async () => {
        const { comp, plugins } = await load(() => import('@origam/components/Messages/OrigamMessages.vue'))
        mount(comp, { props: { active: true, messages: ['x'] }, global: { plugins } })
        expect(noEffect(warn, 'OrigamMessages', 'active')).toHaveLength(1)
    })

    it('OrigamToolbar with its default modelValue does not warn', async () => {
        const { comp, plugins } = await load(() => import('@origam/components/Toolbar/OrigamToolbar.vue'))
        mount(comp, { global: { plugins } })
        expect(noEffect(warn, 'OrigamToolbar', 'modelValue')).toHaveLength(0)
    })

    it('OrigamToolbar with modelValue=false is still warned', async () => {
        const { comp, plugins } = await load(() => import('@origam/components/Toolbar/OrigamToolbar.vue'))
        mount(comp, { props: { modelValue: false }, global: { plugins } })
        expect(noEffect(warn, 'OrigamToolbar', 'modelValue')).toHaveLength(1)
    })
})
