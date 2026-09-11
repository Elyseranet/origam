// Contract tests for <OrigamDialog> / <OrigamDialogConfirmation> — #412 #416 #413 + a11y.
//
// ⛔ WHAT THIS FILE ADDS, AND WHAT IT DELIBERATELY DOES NOT REPEAT.
//
// Three sibling specs already cover the bulk of these four tickets, and this file
// does NOT duplicate them. Read them first:
//
//   dialog-card-header-slots-412.spec.ts — real <OrigamCard>, asserts the close
//       button renders and each header slot reaches Card under its POINT name,
//       plus that Dialog's own `aria-labelledby` resolves.
//   dialog-click-outside-416.spec.ts     — asserts Dialog relays `click:outside`
//       when the overlay emits it.
//   dialog-confirmation-labels.spec.ts   — asserts the footer labels come from the
//       DS i18n layer and that a consumer key replaces them.
//
// What was still missing is the four gaps below. Each one is a case where the
// existing assertion is true but cannot fail on the defect it names:
//
//   1. #412 — that the built-in close button is PRESENT was covered; that clicking
//      it actually CLOSES the dialog was not, nor that `#header-append` OVERRIDES
//      it rather than rendering beside it.
//   2. #416 — the existing spec stubs <OrigamOverlay> and calls `$emit` by hand.
//      That proves Dialog's handler forwards, not that the real chain
//      (`v-click-outside` → Overlay → Dialog → consumer) fires at all. Here the
//      whole tree is real and the click is a real MouseEvent on a real element.
//   3. a11y — the accessible name was pinned on <OrigamDialog> only.
//      <OrigamDialogConfirmation> delegates its whole render and touches neither
//      `title` nor `dialogTitleId`, so it needs its own assertion: the dialog that
//      asks a user to approve an action is the worst place to have no name.
//   4. #413 — the existing default-label assertion is in ENGLISH, and the literals
//      this ticket removed were themselves `Cancel` / `Validate`. Measured: with
//      the fix reverted to `text="Cancel"`, that assertion stays GREEN. Only a
//      non-English locale distinguishes a translation from a baked-in string.
//
// Everything below targets the NAKED component — no slots, no scaffolding. That
// matters because it is how all four defects survived: the Histoire story supplies
// its OWN Close button in its `#footer`, and the e2e spec matched THAT (a
// `.origam-btn` containing the text "Close"), while the real built-in button is
// icon-only and carries no text at all.

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import OrigamDialog from '@origam/components/Dialog/OrigamDialog.vue'
import OrigamDialogConfirmation from '@origam/components/Dialog/OrigamDialogConfirmation.vue'
import { createOrigam } from '@origam/origam'

beforeEach(() => {
    global.IntersectionObserver = vi.fn(class {
        observe = vi.fn()
        unobserve = vi.fn()
        disconnect = vi.fn()
    }) as any
})

// The click-outside directive defers its binding, and the overlay mounts through a
// Teleport: a single nextTick is not enough for the real tree to settle.
const flush = async () => {
    for (let i = 0; i < 6; i++) await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 30))
    for (let i = 0; i < 3; i++) await nextTick()
}

const mountReal = (component: any, props: Record<string, unknown> = {}, locale?: string) => mount(component, {
    props: { modelValue: true, ...props },
    attachTo: document.body,
    global: { plugins: [locale ? createOrigam({ locale: { locale } }) : createOrigam()] }
})

const footerLabels = () => [...document.querySelectorAll('.origam-card__footer .origam-btn')]
    .map((button) => button.textContent!.trim())

describe('OrigamDialog — built-in close button reaches the real Card (#412)', () => {
    // That the button EXISTS is already pinned in dialog-card-header-slots-412.spec.ts.
    // This one adds the property that made #412 a blocker rather than a cosmetic
    // slip: the button carries no visible text, only an `aria-label`. That is why a
    // story-supplied "Close" button in the footer could stand in for it in the e2e
    // suite and keep the whole thing green while the real button was gone.
    it('the built-in close button is icon-only — named by aria-label, not by text', async () => {
        const wrapper = mountReal(OrigamDialog, { title: 'Naked dialog' })
        await flush()

        const closeButton = document.querySelector('.origam-card-header__append button')
        expect(closeButton).not.toBeNull()
        expect(closeButton!.getAttribute('aria-label')).toBe('Close')
        expect(closeButton!.textContent!.trim()).toBe('')

        wrapper.unmount()
    })

    it('the built-in close button actually closes the dialog', async () => {
        const wrapper = mountReal(OrigamDialog, { title: 'Naked dialog' })
        await flush()

        const closeButton = document.querySelector<HTMLButtonElement>('.origam-card-header__append button')
        closeButton!.click()
        await flush()

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![emitted!.length - 1]).toEqual([false])

        wrapper.unmount()
    })

    it('#header-append overrides the built-in close button rather than sitting beside it', async () => {
        const wrapper = mount(OrigamDialog, {
            props: { modelValue: true, title: 'Overridden' },
            slots: { 'header-append': '<span data-cy="mine">mine</span>' },
            attachTo: document.body,
            global: { plugins: [createOrigam()] }
        })
        await flush()

        const append = document.querySelector('.origam-card-header__append')
        expect(append!.querySelector('[data-cy="mine"]')).not.toBeNull()
        expect(append!.querySelector('button[aria-label="Close"]')).toBeNull()

        wrapper.unmount()
    })
})

describe('OrigamDialog — click:outside reaches the consumer (#416)', () => {
    // `IDialogEmits extends IClickOutsideEmits` puts `click:outside` in Dialog's own
    // `emits` option, which makes Vue strip `onClick:outside` out of `$attrs` before
    // the fallthrough merge onto <origam-overlay>. Declaring the emit without firing
    // it therefore CUT the only channel that used to carry the event (by accident).
    // Dialog must relay it explicitly.
    it('emits click:outside when a click lands outside the content', async () => {
        const wrapper = mountReal(OrigamDialog, { title: 'Outside' })
        await flush()

        const outside = document.createElement('button')
        document.body.appendChild(outside)
        outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 5, clientY: 5 }))
        outside.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 5, clientY: 5 }))
        await flush()

        expect(wrapper.emitted('click:outside')).toBeTruthy()
        expect(wrapper.emitted('click:outside')!.length).toBe(1)
        expect(wrapper.emitted('click:outside')![0][0]).toBeInstanceOf(MouseEvent)

        outside.remove()
        wrapper.unmount()
    })
})

describe('OrigamDialogConfirmation — accessible name resolves (a11y)', () => {
    // `aria-labelledby` is only worth anything if some element carries that id.
    // The <OrigamDialog> side is already pinned in dialog-card-header-slots-412.spec.ts
    // and is NOT repeated here. What that spec cannot see is the wrapper:
    // <OrigamDialogConfirmation> forwards everything to <origam-dialog> and touches
    // neither `title` nor `dialogTitleId`, so its accessible name rides entirely on
    // that forwarding holding up.
    it('accessible name holds on DialogConfirmation, which sets neither prop itself', async () => {
        const wrapper = mountReal(OrigamDialogConfirmation, { title: 'Confirmer ?' })
        await flush()

        const dialog = document.querySelector('[role="dialog"]')
        const labelledBy = dialog!.getAttribute('aria-labelledby')
        expect(labelledBy).toBeTruthy()

        const target = document.getElementById(labelledBy!)
        expect(target).not.toBeNull()
        expect(target!.textContent).toContain('Confirmer ?')

        wrapper.unmount()
    })
})

describe('OrigamDialogConfirmation — footer labels are translated and overridable (#413)', () => {
    // ⛔ Asserting the ENGLISH defaults here would be a test that cannot fail: the
    // hardcoded literals this ticket removed were themselves `Cancel` / `Validate`,
    // so an English-locale assertion stays green on the broken code. Verified: with
    // the fix reverted to `text="Cancel"`, an en-locale assertion still passed while
    // every other test in this file went red. The locale has to be non-English for
    // the assertion to distinguish a translation from a baked-in string.
    it('follows the active locale — proves the label is translated, not hardcoded', async () => {
        const wrapper = mountReal(OrigamDialogConfirmation, { title: 'Supprimer ?' }, 'fr')
        await flush()

        expect(footerLabels()).toContain('Annuler')
        expect(footerLabels()).toContain('Valider')

        wrapper.unmount()
    })

    it('a consumer key replaces the label — the props carry a KEY, never final text', async () => {
        const wrapper = mountReal(OrigamDialogConfirmation, {
            title: 'Supprimer ?',
            cancelTextKey: 'origam.close',
            validateTextKey: 'origam.open'
        })
        await flush()

        expect(footerLabels()).toContain('Close')
        expect(footerLabels()).toContain('Open')
        expect(footerLabels()).not.toContain('Cancel')
        expect(footerLabels()).not.toContain('Validate')

        wrapper.unmount()
    })

    it('cancellable=false drops the Cancel button entirely', async () => {
        const wrapper = mountReal(OrigamDialogConfirmation, { title: 'Supprimer ?', cancellable: false })
        await flush()

        expect(footerLabels()).not.toContain('Cancel')
        expect(footerLabels()).toContain('Validate')

        wrapper.unmount()
    })
})
