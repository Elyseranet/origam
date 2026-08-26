// Unit tests for <OrigamThemeProvider>
//
// This file currently holds only the characterised defect below — it is
// not full coverage of the component. Add ordinary behavioural tests
// (theme/mode resolution, scoped defaults) here as they're written.

import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import OrigamThemeProvider from '@origam/components/ThemeProvider/OrigamThemeProvider.vue'
import { createOrigam } from '@origam/origam'

/********************************************************
 *  KNOWN DEFECT — inheritAttrs:false without v-bind="$attrs"
 *
 *  @description ⛔ issue #492
 *  `OrigamThemeProvider.vue` sets `defineOptions({ inheritAttrs: false })`
 *  and manually re-applies ONLY `class` via a computed
 *  (`themeProviderClasses`). There is no `v-bind="$attrs"` anywhere on the
 *  root `<component :is="tag">`. Every other attribute a consumer passes —
 *  `id`, `style`, `data-cy`, DOM event listeners — is silently dropped.
 *  Measured as the only component in the catalogue in this shape.
 *
 *  @description
 *  `it.fails` here because the CORRECT behaviour (attrs reach the root) is
 *  what's asserted — it currently fails since only `class` survives.
 *
 *  ⚠️ When this turns RED the defect is fixed — delete the `it.fails`
 *  wrapper (keep the assertions) rather than deleting the test.
 ********************************************************/
describe('OrigamThemeProvider — inheritAttrs:false without v-bind="$attrs" (#492)', () => {
    it.fails('id, style, data-cy and a click listener reach the root', async () => {
        const onClick = vi.fn()

        const wrapper = mount(OrigamThemeProvider, {
            attrs: {
                id: 'brand-scope',
                style: 'padding: 4px;',
                'data-cy': 'theme-provider-root',
                onClick
            },
            global: { plugins: [createOrigam()] }
        })

        await wrapper.find('div').trigger('click')

        expect(wrapper.attributes('id')).toBe('brand-scope')
        expect(wrapper.attributes('style') || '').toContain('padding')
        expect(wrapper.attributes('data-cy')).toBe('theme-provider-root')
        expect(onClick).toHaveBeenCalled()

        wrapper.unmount()
    })
})
