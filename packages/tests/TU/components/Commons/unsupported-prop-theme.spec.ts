/*
 * #1483 — une prop morte posee par un THEME (`theme.components`) doit avertir.
 * Le resolveur ecrit dans `beforeCreate`, apres `setup()` : un predicat evalue
 * a l'immediat dans setup ne voit pas la valeur du theme.
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

describe('#1483 useUnsupportedProp sees theme-set props', () => {
    let warn: ReturnType<typeof vi.spyOn>
    beforeEach(() => { warn = vi.spyOn(console, 'warn').mockImplementation(() => {}) })
    afterEach(() => warn.mockRestore())

    it('Messages: dead "active" set by a theme warns exactly once', async () => {
        vi.resetModules()
        const { createOrigam } = await import('@origam/origam')
        const comp = (await import('@origam/components/Messages/OrigamMessages.vue')).default
        const origam = createOrigam({ themes: [ { name: 'brandx', components: { 'origam-messages': { active: true } }, vars: {} } as never ] })
        origam._defaultsRef.value = origam._activeDefaultsFor('brandx', undefined)
        mount(comp, { props: { messages: [ 'x' ] }, global: { plugins: [ origam ] } })
        mount(comp, { props: { messages: [ 'x' ] }, global: { plugins: [ origam ] } })
        const hits = warn.mock.calls.map(c => String(c[0])).filter(s => s.includes('prop "active" has no effect'))
        expect(hits).toHaveLength(1)
    })
})
