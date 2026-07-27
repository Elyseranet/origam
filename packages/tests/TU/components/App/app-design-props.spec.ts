import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { OrigamApp } from '@origam/components'
import { createOrigam } from '@origam/origam'

// The global `afterEach(vi.restoreAllMocks())` wipes the setup's
// `vi.fn()` ResizeObserver implementation after the first test, leaving an
// observer with no `observe`/`disconnect` for the layout composable. Reassign
// a plain class each test (not a spy → survives restoreAllMocks).
beforeEach(() => {
    class ResizeObserverStub {
        observe (): void {}
        unobserve (): void {}
        disconnect (): void {}
    }
    ;(globalThis as unknown as { ResizeObserver: unknown }).ResizeObserver = ResizeObserverStub
})

const mountApp = (props: Record<string, unknown> = {}) =>
    mount(OrigamApp, { props: props as never, global: { plugins: [createOrigam()] } })

describe('OrigamApp — only color/bgColor exposed, forwarded to the layout surface', () => {
    it('bgColor paints the surface + fullHeight (default true) emits --full-height', () => {
        const wrapper = mountApp({ bgColor: 'primary' })
        const root = wrapper.find('.origam-app')
        const cls = root.attributes('class') ?? ''
        const style = root.attributes('style') ?? ''

        expect(root.exists()).toBe(true)
        expect(cls.includes('origam--bg-primary') || /background-color/.test(style)).toBe(true)
        expect(cls).toContain('origam-layout--full-height')

        wrapper.unmount()
    })

    it('color is forwarded to the layout root + fullHeight=false drops --full-height', () => {
        const wrapper = mountApp({ color: 'primary', fullHeight: false })
        const root = wrapper.find('.origam-app')
        const cls = root.attributes('class') ?? ''
        const style = root.attributes('style') ?? ''

        expect(cls.includes('origam--color-primary') || /(^|[^-])color:/.test(style)).toBe(true)
        expect(cls).not.toContain('origam-layout--full-height')

        wrapper.unmount()
    })
})

// ---------------------------------------------------------------------------
// useDefaults wiring (issue #289) — a theme's `components['origam-app']`
// config must resolve on an un-passed prop, mirroring OrigamBtn/OrigamAlert
// (issue #242). Discovered during #285: `bgColor: 'transparent'` set via
// `theme.components['origam-app']` was a silent no-op, forcing a cssVars
// escape hatch instead of the props-first path.
// ---------------------------------------------------------------------------

describe('OrigamApp — useDefaults (theme components wiring)', () => {
    function mountAppThemed(componentDefaults: Record<string, unknown>, props: Record<string, unknown> = {}) {
        const theme = { name: 'brandx', mode: 'light' as const, components: { 'origam-app': componentDefaults }, vars: {} }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor('brandx', 'light')
        return mount(OrigamApp, { props: props as never, global: { plugins: [origam] } })
    }

    it('resolves bgColor="success" from theme.components[\'origam-app\'] when not passed', () => {
        const wrapper = mountAppThemed({ bgColor: 'success' })
        const root = wrapper.find('.origam-app')
        expect(root.attributes('class') ?? '').toContain('origam--bg-success')
        wrapper.unmount()
    })

    it('an explicitly passed bgColor prop overrides the theme default', () => {
        const wrapper = mountAppThemed({ bgColor: 'success' }, { bgColor: 'warning' })
        const root = wrapper.find('.origam-app')
        const cls = root.attributes('class') ?? ''
        expect(cls).toContain('origam--bg-warning')
        expect(cls).not.toContain('origam--bg-success')
        wrapper.unmount()
    })

    it('resolves fullHeight=false from theme.components[\'origam-app\'] when not passed', () => {
        const wrapper = mountAppThemed({ fullHeight: false })
        const root = wrapper.find('.origam-app')
        expect(root.attributes('class') ?? '').not.toContain('origam-layout--full-height')
        wrapper.unmount()
    })

    // Non-regression (blast radius): OrigamApp is the root of every page —
    // a theme that DOESN'T configure 'origam-app' at all, or the plain
    // baseline (no theme), must keep the component's own withDefaults()
    // value (fullHeight=true, no forced bg) exactly as before the wiring.
    it('non-regression — baseline (no theme installed) keeps fullHeight=true and no forced bg class', () => {
        const wrapper = mountApp()
        const root = wrapper.find('.origam-app')
        const cls = root.attributes('class') ?? ''
        expect(cls).toContain('origam-layout--full-height')
        expect(cls).not.toMatch(/origam--bg-/)
        wrapper.unmount()
    })

    it('non-regression — a brand theme that configures OTHER components (not origam-app) leaves App defaults untouched', () => {
        const theme = {
            name: 'brandy',
            mode: 'light' as const,
            components: { 'origam-btn': { variant: 'outlined' } },
            vars: {}
        }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor('brandy', 'light')
        const wrapper = mount(OrigamApp, { global: { plugins: [origam] } })
        const root = wrapper.find('.origam-app')
        const cls = root.attributes('class') ?? ''
        expect(cls).toContain('origam-layout--full-height')
        expect(cls).not.toMatch(/origam--bg-/)
        wrapper.unmount()
    })

    it('non-regression — a second, differently-shaped brand theme also leaves App defaults untouched', () => {
        const theme = {
            name: 'brandz',
            mode: 'dark' as const,
            components: { global: { density: 'compact' } },
            vars: {}
        }
        const origam = createOrigam({ themes: [theme] })
        origam._defaultsRef.value = origam._activeDefaultsFor('brandz', 'dark')
        const wrapper = mount(OrigamApp, { global: { plugins: [origam] } })
        const root = wrapper.find('.origam-app')
        const cls = root.attributes('class') ?? ''
        expect(cls).toContain('origam-layout--full-height')
        expect(cls).not.toMatch(/origam--bg-/)
        wrapper.unmount()
    })
})
