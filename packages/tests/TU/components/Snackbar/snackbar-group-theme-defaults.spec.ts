// Regression coverage for #469 — `props.id` was read eagerly, once, at the
// top of `setup()` (`useSnackbarGroupInternal(props.id)`), which calls
// `getStore(id)` synchronously BEFORE the ADR-005 theme-props resolver
// patches `instance.props` in `beforeCreate` (which runs AFTER `setup()`).
// A theme naming `'origam-snackbar-group': { id: 'custom' }` therefore
// could never make the mounted group subscribe to the "custom" stack —
// `rawItems` stayed bound to the SNACKBAR_GROUP_DEFAULT_ID store forever,
// even though the DOM `id` (computed, reads `props.id` lazily) resolved
// correctly. Only the theme channel was broken — an explicit `id` prop
// passed directly by the consumer always worked, because Vue applies
// normal attribute bindings before `setup()` runs.

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createOrigam } from '@origam/origam'
import type { IOrigamTheme } from '@origam/interfaces'

import OrigamSnackbarGroup from '@origam/components/Snackbar/OrigamSnackbarGroup.vue'
import { useSnackbarGroup } from '@origam/composables/Snackbar/snackbar-group.composable'
import { resetSnackbarGroupForTesting } from '@origam/utils/Snackbar/snackbar-group.util'

beforeEach(() => {
    resetSnackbarGroupForTesting()
})

afterEach(() => {
    document.querySelectorAll('style[data-origam-theme]').forEach(el => el.remove())
})

const THEME: IOrigamTheme = {
    name: 'snackbar-group-defaults-theme',
    mode: 'light',
    components: {
        'origam-snackbar-group': { id: 'custom' }
    },
    vars: {}
}

const mountThemedGroup = (props: Record<string, unknown> = {}) => {
    const origam = createOrigam({ themes: [THEME] })
    origam._defaultsRef.value = origam._activeDefaultsFor('snackbar-group-defaults-theme', 'light')

    return mount(OrigamSnackbarGroup, {
        attachTo: document.body,
        global: { plugins: [origam] },
        props
    })
}

describe('OrigamSnackbarGroup — theme.components["origam-snackbar-group"] resolution (#469)', () => {
    it('subscribes to the themed store id when the consumer passes no explicit id prop', async () => {
        // The root is `<teleport to="body">` — the mounted content lives in
        // `document.body`, OUTSIDE `wrapper.element`'s own subtree, so
        // `wrapper.find` / `wrapper.text()` can never see it. Assert
        // against `document.body` directly.
        const wrapper = mountThemedGroup()

        useSnackbarGroup({ id: 'custom' }).notify({ message: 'from the custom stack' })
        await wrapper.vm.$nextTick()

        expect(document.body.textContent).toContain('from the custom stack')
        wrapper.unmount()
    })

    it('an explicit id prop on the consumer still wins over the theme default', async () => {
        const wrapper = mountThemedGroup({ id: 'explicit' })

        useSnackbarGroup({ id: 'custom' }).notify({ message: 'should not appear' })
        useSnackbarGroup({ id: 'explicit' }).notify({ message: 'should appear' })
        await wrapper.vm.$nextTick()

        expect(document.body.textContent).toContain('should appear')
        expect(document.body.textContent).not.toContain('should not appear')
        wrapper.unmount()
    })
})
