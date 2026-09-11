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
 *  FIXED DEFECT — inheritAttrs:false without v-bind="$attrs"
 *
 *  @description ⛔ issue #492
 *  `OrigamThemeProvider.vue` set `defineOptions({ inheritAttrs: false })`
 *  and manually re-applied ONLY `class` via a computed
 *  (`themeProviderClasses`). There was no `v-bind="$attrs"` anywhere on the
 *  root `<component :is="tag">`, so every other attribute a consumer
 *  passed — `id`, `style`, `data-cy`, DOM event listeners — was silently
 *  dropped. Measured as the only component in the catalogue in this shape.
 *
 *  @description
 *  Fix: `v-bind="restAttrs"` on the root, where `restAttrs` is `$attrs`
 *  minus `class` (already merged separately into `themeProviderClasses` to
 *  avoid emitting the class twice).
 *
 *  ⚠️ Kept as a permanent regression probe per the ticket — do not delete.
 ********************************************************/
describe('OrigamThemeProvider — inheritAttrs:false without v-bind="$attrs" (#492)', () => {
    it('id, style, data-cy and a click listener reach the root', async () => {
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
