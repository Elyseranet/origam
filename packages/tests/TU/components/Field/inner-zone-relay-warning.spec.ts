/*
 * #1156 — an internal `@click:append-inner` relay is not a consumer listener.
 *
 * Every field wrapper binds `@click:append-inner` / `@click:prepend-inner` on its
 * inner OrigamField UNCONDITIONALLY (to re-emit), so the Field always saw a
 * listener and dev-warned "click listener but no accessible name" on every
 * field with an inner icon, even when nobody listened. The relay is now bound
 * only when the consumer listens, so the warning keeps its meaning.
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

const WRAPPERS: Array<[string, () => Promise<any>]> = [
    ['TextField', () => import('@origam/components/TextField/OrigamTextField.vue')],
    ['TextareaField', () => import('@origam/components/TextareaField/OrigamTextareaField.vue')],
    ['PasswordField', () => import('@origam/components/PasswordField/OrigamPasswordField.vue')],
    ['NumberField', () => import('@origam/components/NumberField/OrigamNumberField.vue')],
    ['FileField', () => import('@origam/components/FileField/OrigamFileField.vue')],
    ['OtpInputField', () => import('@origam/components/OtpInputField/OrigamOtpInputField.vue')],
    ['Select', () => import('@origam/components/Select/OrigamSelect.vue')]
]

const load = async (loader: () => Promise<any>) => {
    vi.resetModules() // the warning is deduplicated in a module-level Set
    const { createOrigam } = await import('@origam/origam')
    const comp = (await loader()).default
    return { comp, plugins: [createOrigam()] }
}

const innerWarnings = (spy: ReturnType<typeof vi.spyOn>) =>
    spy.mock.calls.filter(c => String(c[0]).includes('click listener but no accessible name'))

vi.setConfig({ testTimeout: 60000 })

describe('#1156 inner zone relay', () => {
    let warn: ReturnType<typeof vi.spyOn>
    beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
    afterEach(() => warn.mockRestore())

    for (const [name, loader] of WRAPPERS) {
        it(`${name}: icons but no consumer listener -> no warning`, async () => {
            const { comp, plugins } = await load(loader)
            mount(comp, { props: { appendInnerIcon: 'mdi-eye', prependInnerIcon: 'mdi-eye' }, global: { plugins } })
            expect(innerWarnings(warn)).toHaveLength(0)
        })
    }

    it('TextField: a real consumer listener without a name still warns (not masked)', async () => {
        const { comp, plugins } = await load(WRAPPERS[0][1])
        mount(comp, { props: { appendInnerIcon: 'mdi-eye', 'onClick:appendInner': () => {} }, global: { plugins } })
        expect(innerWarnings(warn)).toHaveLength(1)
    })

    it('TextField: a real consumer listener is still relayed', async () => {
        const { comp, plugins } = await load(WRAPPERS[0][1])
        const spy = vi.fn()
        const w = mount(comp, {
            props: { appendInnerIcon: 'mdi-eye', appendInnerAriaLabel: 'x', 'onClick:appendInner': spy },
            global: { plugins }
        })
        await w.find('.origam-field__append-inner').trigger('click')
        expect(spy).toHaveBeenCalledTimes(1)
        expect(innerWarnings(warn)).toHaveLength(0)
    })
})
