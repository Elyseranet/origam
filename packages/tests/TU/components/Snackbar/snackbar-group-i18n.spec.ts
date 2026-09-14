// Regression coverage for #469 (bug 2) — `<OrigamSnackbarGroup>` baked two
// English strings in directly:
//   `:aria-label="'Notifications'"` on the root region — never localised.
//   `:dismiss-label="'Dismiss notification'"` forwarded to EVERY rendered
//   `<origam-snackbar-item>` — this one is worse than a missing t() call:
//   `OrigamSnackbarItem` already resolves its own dismiss label through
//   `t('origam.snackbar.dismiss')` when no `dismissLabel` prop is passed,
//   so the group was actively OVERRIDING a working, localised default with
//   a hardcoded English literal on every locale, including `fr`.

import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import OrigamSnackbarGroup from '@origam/components/Snackbar/OrigamSnackbarGroup.vue'
import { createOrigam } from '@origam/origam'
import { useSnackbarGroup } from '@origam/composables/Snackbar/snackbar-group.composable'
import { resetSnackbarGroupForTesting } from '@origam/utils/Snackbar/snackbar-group.util'

function mountWith (locale?: string) {
    resetSnackbarGroupForTesting()

    return mount(OrigamSnackbarGroup, {
        attachTo: document.body,
        global: { plugins: [createOrigam(locale ? { locale: { locale } } : undefined)] }
    })
}

/**
 * Mounts with a CUSTOM override of `origam.snackbar_group.notifications`.
 * This is the discriminating case: the default English message is the
 * literal `'Notifications'` too, so a hardcoded `aria-label="'Notifications'"`
 * and a correctly-resolved `t()` call are indistinguishable under the
 * default locale. Overriding the message content is the only way to prove
 * the label actually goes through the locale layer instead of being baked
 * into the template.
 */
function mountWithCustomMessage (customLabel: string) {
    resetSnackbarGroupForTesting()

    return mount(OrigamSnackbarGroup, {
        attachTo: document.body,
        global: {
            plugins: [createOrigam({
                locale: {
                    messages: {
                        en: { origam: { snackbar_group: { notifications: customLabel } } }
                    }
                }
            })]
        }
    })
}

// `<teleport to="body">` moves the rendered content OUTSIDE `wrapper.element`'s
// own subtree — `wrapper.find` / `wrapper.text()` never see it. Assertions
// below go through `document.body` directly.

describe('OrigamSnackbarGroup — i18n (#469)', () => {
    it('the root region aria-label resolves through the locale layer, not a baked English string', async () => {
        const wrapper = mountWithCustomMessage('Custom notifications label')
        await nextTick()

        const region = document.body.querySelector('[role="region"]')
        expect(region?.getAttribute('aria-label')).toBe('Custom notifications label')
        wrapper.unmount()
    })

    it('the dismiss button on a rendered item follows the active locale instead of a hardcoded English override', async () => {
        const wrapper = mountWith('fr')
        useSnackbarGroup().notify({ message: 'hello' })
        await nextTick()

        const dismissBtn = document.body.querySelector('.origam-snackbar-item__dismiss')
        expect(dismissBtn).not.toBeNull()
        expect(dismissBtn?.getAttribute('aria-label')).toBe('Fermer la notification')
        wrapper.unmount()
    })
})
