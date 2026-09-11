// Unit tests for <OrigamTextField> — `mask` prop, component-level integration.
//
// WHY VITEST AND NOT E2E (read before "fixing" this back to Playwright):
//
// `packages/tests/e2e/textfield-mask.spec.ts` used to carry this coverage
// against the live Histoire story, with 6 scenarios marked `test.fixme` and
// blamed on either "Playwright synthetic input" or "a race condition in
// OrigamTextField". Both diagnoses were wrong. The actual cause, measured
// independently:
//
//   - Histoire double-mounts the story's `<script setup>` (2 Vue
//     `<Suspense> is an experimental feature` warnings logged for a SINGLE
//     `<input>` in the DOM). Two component instances end up sharing one
//     native input element, each with its own `model` ref and its own
//     `maskInputSeq` counter driving a deferred (`nextTick`) DOM write in
//     `handleInput`. Instance A's deferred write can land after instance
//     B's, producing exactly the symptoms the fixmes described: value
//     round-trips ("12" -> "1"), a stale write ~36ms after the correct one,
//     a model stuck on the first keystroke.
//   - Outside Histoire (a minimal Vue app mounting only `OrigamTextField` +
//     `createOrigam()`), the exact adverse scenario — clear the field, then
//     type "1234567890" at 0-50ms delay — formats correctly every time: 1
//     `<input>`, 0 Suspense warning, correct `unmasked`.
//
// So the bug is Histoire's, not the design system's. Vitest + jsdom mounts
// exactly one component instance per test, which is both the realistic
// production topology (a consumer app never double-mounts a field the way
// Histoire's dev-only Suspense wrapper does) AND removes the confound that
// produced the false positives. If this coverage ever gets "promoted" back
// to a live-browser e2e spec against Histoire, the double-mount bug will
// resurface as a flaky/failing test again — don't do that; extend this
// file instead, or fix Histoire's story-mounting first.
//
// Reuses the mount/stub pattern from `OrigamTextField.spec.ts` (see that
// file's header comment for the stub contract).

import { mount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import OrigamTextField from '@origam/components/TextField/OrigamTextField.vue'
import { BUILT_IN_PATTERN } from '@origam/enums'
import { createOrigam } from '@origam/origam'

beforeEach(() => {
    global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() })
    global.IntersectionObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() })
})

// ---------------------------------------------------------------------------
// Stubs — identical contract to OrigamTextField.spec.ts. OrigamField must
// forward `aria-invalid` down to the native input for the Luhn assertions,
// which is why fieldSlotProps propagation matters here: the real component
// binds `:aria-invalid="ariaInvalid"` directly on the `<input>` inside its
// own template (not via the OrigamField stub), so no extra wiring is needed
// on the stub side — it already reaches the DOM through OrigamTextField's
// own markup.
// ---------------------------------------------------------------------------

const OrigamInputStub = {
    name: 'OrigamInput',
    inheritAttrs: false,
    props: ['modelValue', 'focused', 'rules', 'disabled', 'readonly',
        'validationValue', 'name', 'id', 'error', 'errorMessages', 'hideDetails',
        'validateOn', 'maxErrors', 'label', 'hint', 'messages', 'persistentHint',
        'centerAffix', 'direction', 'density'],
    emits: ['update:modelValue', 'click:prepend', 'click:append'],
    setup () {
        return {
            filterProps: (sourceProps: any, _exclude?: string[]) => ({
                disabled: sourceProps.disabled,
                readonly: sourceProps.readonly
            })
        }
    },
    template: `
        <div data-cy="origam-input" v-bind="$attrs">
            <slot :id="id || 'tf-1'" :is-disabled="!!disabled" :is-dirty="false" :is-valid="true" :is-readonly="!!readonly" />
            <slot name="details" />
        </div>
    `
}

const OrigamFieldStub = {
    name: 'OrigamField',
    inheritAttrs: false,
    props: ['id', 'active', 'dirty', 'disabled', 'error', 'focused', 'role', 'class', 'style',
        'label', 'variant', 'color', 'bgColor', 'rounded', 'clearIcon', 'clearable',
        'prependIcon', 'appendIcon', 'prependInnerIcon', 'appendInnerIcon',
        'prefix', 'suffix', 'hint', 'placeholder', 'persistentPlaceholder'],
    emits: ['click', 'mousedown', 'click:clear', 'click:prepend-inner', 'click:append-inner'],
    setup () {
        return { filterProps: (_props: any, _exclude?: string[]) => ({}) }
    },
    template: `
        <div data-cy="origam-field">
            <slot :class="'field-class'" :ref="() => {}" />
        </div>
    `
}

const OrigamCounterStub = {
    name: 'OrigamCounter',
    props: ['active', 'disabled', 'max', 'value'],
    template: `<div data-cy="origam-counter">{{ value }}/{{ max }}</div>`
}

interface IMountOpts {
    props?: Record<string, unknown>
    slots?: Record<string, unknown>
    attrs?: Record<string, unknown>
}

const mountTextField = (opts: IMountOpts = {}): VueWrapper => {
    return mount(OrigamTextField, {
        attachTo: document.body,
        props: opts.props,
        slots: opts.slots,
        attrs: opts.attrs,
        global: {
            plugins: [createOrigam()],
            stubs: {
                OrigamInput: OrigamInputStub,
                OrigamField: OrigamFieldStub,
                OrigamCounter: OrigamCounterStub,
                OrigamIcon: { template: '<i />' }
            }
        }
    })
}

// Fires a native `input` event on the given element without going through
// Vue Test Utils' `setValue()` — `setValue()` awaits a tick internally,
// which serialises events one-by-one and can never reproduce a burst of
// keystrokes landing inside the SAME tick (the scenario `maskInputSeq`
// exists to guard against). Callers batch several `fireRawInput` calls back
// to back with NO `await` between them, then a single `await nextTick()`.
const fireRawInput = (el: HTMLInputElement, value: string): void => {
    el.value = value
    el.dispatchEvent(new Event('input', { bubbles: true }))
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('OrigamTextField — mask: phone:fr formatting', () => {
    it('formats a full sequential type-out and reports the correct unmasked value', async () => {
        const wrapper = mountTextField({ props: { modelValue: '', mask: BUILT_IN_PATTERN.PHONE_FR } })
        const input = wrapper.find('input')

        // Type digit-by-digit, awaiting a tick after each keystroke — the
        // baseline "human typing" path the DS was never actually broken on.
        const digits = '0612345678'
        let typed = ''
        for (const d of digits) {
            typed += d
            await input.setValue(typed)
        }

        expect(input.element.value).toBe('06 12 34 56 78')

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![emitted!.length - 1][0]).toBe('0612345678')
    })

    it('strips pasted separators and applies the mask (dots stripped from "06.12.34.56.78")', async () => {
        const wrapper = mountTextField({ props: { modelValue: '', mask: BUILT_IN_PATTERN.PHONE_FR } })
        const input = wrapper.find('input').element as HTMLInputElement

        const pasteEvent = new Event('paste', { bubbles: true, cancelable: true }) as ClipboardEvent & { clipboardData: DataTransfer }
        Object.defineProperty(pasteEvent, 'clipboardData', {
            value: { getData: () => '06.12.34.56.78' }
        })
        input.dispatchEvent(pasteEvent)
        await nextTick()

        expect(input.value).toBe('06 12 34 56 78')
        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted![emitted!.length - 1][0]).toBe('0612345678')
    })
})

describe('OrigamTextField — mask: partial value stays incomplete', () => {
    it('4 digits into a 10-digit phone:fr mask never emits complete=true', async () => {
        const wrapper = mountTextField({ props: { modelValue: '', mask: BUILT_IN_PATTERN.PHONE_FR } })
        const input = wrapper.find('input')

        await input.setValue('1234')

        const completeEvents = wrapper.emitted('complete')
        // Either no `complete` event fired yet, or every one that did fired
        // with `complete: false` — what must NEVER happen is `true`.
        const sawTrue = (completeEvents ?? []).some((call) => (call[0] as { complete: boolean }).complete === true)
        expect(sawTrue).toBe(false)
    })
})

describe('OrigamTextField — mask: credit card Luhn validation', () => {
    it('a valid Luhn number (4111111111111111) does not set aria-invalid', async () => {
        const wrapper = mountTextField({ props: { modelValue: '', mask: BUILT_IN_PATTERN.CREDIT_CARD } })
        const input = wrapper.find('input')

        await input.setValue('4111111111111111')
        // aria-invalid is gated on `isFocused.value || model.value` in the
        // component; simulate focus so the invalid/valid branch is live.
        await input.trigger('focus')
        await nextTick()

        expect(input.element.value).toBe('4111 1111 1111 1111')
        expect(input.attributes('aria-invalid')).not.toBe('true')
    })

    it('an invalid Luhn number (1234567890123456) sets aria-invalid="true"', async () => {
        const wrapper = mountTextField({ props: { modelValue: '', mask: BUILT_IN_PATTERN.CREDIT_CARD } })
        const input = wrapper.find('input')

        await input.setValue('1234567890123456')
        await input.trigger('focus')
        await nextTick()

        expect(input.element.value).toBe('1234 5678 9012 3456')
        expect(input.attributes('aria-invalid')).toBe('true')
    })
})

describe('OrigamTextField — mask: backspace preserves unmasked semantics', () => {
    it('deleting the last digit drops it from unmasked, not the trailing literal', async () => {
        const wrapper = mountTextField({ props: { modelValue: '', mask: BUILT_IN_PATTERN.PHONE_FR } })
        const input = wrapper.find('input')

        await input.setValue('0612345678')
        expect(input.element.value).toBe('06 12 34 56 78')

        // Simulate the browser's native backspace behaviour: the raw
        // <input> value shrinks by whatever the caret was sitting on. Since
        // the caret is at the end, the browser drops the trailing literal
        // char first ("06 12 34 56 78" -> "06 12 34 56 7"); applyMask must
        // still resolve to the 9-digit unmasked value, not 8.
        await input.setValue('06 12 34 56 7')

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted![emitted!.length - 1][0]).toBe('061234567')
    })

    it('deleting a middle digit re-flows the remaining digits through the mask', async () => {
        const wrapper = mountTextField({ props: { modelValue: '', mask: BUILT_IN_PATTERN.PHONE_FR } })
        const input = wrapper.find('input')

        await input.setValue('0612345678')
        expect(input.element.value).toBe('06 12 34 56 78')

        // Remove the "1" right after "06 " -> raw sequence becomes
        // "06 2 34 56 78" once the browser deletes one character; applyMask
        // strips literals and re-walks the pattern from scratch, so the
        // digit stream becomes "062345678" (9 digits).
        await input.setValue('06 2 34 56 78')

        expect(input.element.value).toBe('06 23 45 67 8')
        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted![emitted!.length - 1][0]).toBe('062345678')
    })
})

describe('OrigamTextField — mask: @valid / @complete emits', () => {
    it('emits complete:true exactly when the 10th digit lands, and never before', async () => {
        const wrapper = mountTextField({ props: { modelValue: '', mask: BUILT_IN_PATTERN.PHONE_FR } })
        const input = wrapper.find('input')

        const digits = '061234567'
        let typed = ''
        for (const d of digits) {
            typed += d
            await input.setValue(typed)
        }
        // 9 digits in — must not have completed yet.
        let completeEvents = wrapper.emitted('complete') ?? []
        expect(completeEvents.some((c) => (c[0] as { complete: boolean }).complete)).toBe(false)

        await input.setValue('0612345678')
        completeEvents = wrapper.emitted('complete') ?? []
        expect(completeEvents.length).toBeGreaterThan(0)
        const last = completeEvents[completeEvents.length - 1][0] as { complete: boolean, unmasked: string }
        expect(last.complete).toBe(true)
        expect(last.unmasked).toBe('0612345678')
    })

    it('emits valid when validity flips from false to true (credit card Luhn)', async () => {
        const wrapper = mountTextField({ props: { modelValue: '', mask: BUILT_IN_PATTERN.CREDIT_CARD } })
        const input = wrapper.find('input')

        // Invalid Luhn first — isValid starts true (empty+not required) and
        // must flip to false once the invalid number completes.
        await input.setValue('1234567890123456')
        let validEvents = wrapper.emitted('valid') ?? []
        expect(validEvents.some((v) => v[0] === false)).toBe(true)

        // Clear and enter a valid Luhn — must flip back to true.
        await input.setValue('')
        await input.setValue('4111111111111111')
        validEvents = wrapper.emitted('valid') ?? []
        expect(validEvents[validEvents.length - 1][0]).toBe(true)
    })
})

describe('OrigamTextField — mask: custom pattern', () => {
    it('(##) ###-#### formats a 9-digit sequence and drops the 10th char', async () => {
        const wrapper = mountTextField({ props: { modelValue: '', mask: '(##) ###-####' } })
        const input = wrapper.find('input')

        await input.setValue('1234567890')

        expect(input.element.value).toBe('(12) 345-6789')
        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted![emitted!.length - 1][0]).toBe('123456789')
    })
})

describe('OrigamTextField — mask: adverse scenario, clear then type within the same tick', () => {
    // This is the scenario the e2e fixmes were actually trying (and failing,
    // for the wrong reason — see file header) to cover: a burst of keystrokes
    // with NO delay between them and no delay after a clear, all landing
    // before `handleInput`'s deferred (`nextTick`) DOM write runs.
    //
    // Honesty note on what this DOES and does NOT prove: `handleInput`
    // schedules its DOM write via `nextTick(...)`, and Vue resolves same-tick
    // `nextTick()` calls as `.then()` callbacks chained off one shared
    // resolved promise — which the spec guarantees run in REGISTRATION
    // order. So for a single mounted instance, the last keystroke's callback
    // always runs last and wins regardless of the `maskInputSeq` guard; I
    // verified this directly by commenting out the `seq !== maskInputSeq`
    // check and re-running this file — all 12 tests stayed green. The guard
    // only earns its keep across TWO component instances racing on the same
    // `<input>` (the Histoire double-mount bug described in the file
    // header) — a topology a single well-behaved consumer instance cannot
    // produce, and one Vitest/@vue-test-utils cannot reproduce either (it
    // mounts exactly one instance per `mount()` call). So this test proves
    // the user-visible outcome (final masked value, final unmasked model)
    // is correct under a same-tick keystroke burst; it does NOT exercise the
    // `maskInputSeq` line specifically. That line's necessity is a Histoire
    // artifact, not something coverage here can, or needs to, isolate.
    it('clearing then typing "1234567890" synchronously (no awaits) settles on the correct masked value', async () => {
        const wrapper = mountTextField({ props: { modelValue: '0612345678', mask: BUILT_IN_PATTERN.PHONE_FR } })
        const input = wrapper.find('input').element as HTMLInputElement
        await nextTick()
        expect(input.value).toBe('06 12 34 56 78')

        // Clear, then immediately (same synchronous block, no `await`
        // anywhere) fire 10 keystrokes. Each keystroke mimics the browser's
        // native behaviour of appending the typed char to the CURRENT raw
        // `el.value` before the `input` event fires — since the component's
        // DOM rewrite is deferred, `el.value` still holds whatever this test
        // last wrote to it, not a masked/rewritten value.
        fireRawInput(input, '')
        const digits = '1234567890'
        let raw = ''
        for (const d of digits) {
            raw += d
            fireRawInput(input, raw)
        }

        // Only now let the microtask queue (nextTick) drain.
        await nextTick()
        await nextTick()

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        // The synchronous burst means `model.value` was reassigned on every
        // call; the LAST assignment (from the full 10-digit raw string) must
        // be what survives — phone:fr only has 10 consumer slots.
        expect(emitted![emitted!.length - 1][0]).toBe('1234567890')

        // The deferred DOM write that lands must be the one matching the
        // LATEST processed event, not a stale intermediate one.
        expect(input.value).toBe('12 34 56 78 90')
    })

    it('clearing then typing past the mask capacity within the same tick still drops the overflow char', async () => {
        const wrapper = mountTextField({ props: { modelValue: '', mask: BUILT_IN_PATTERN.PHONE_FR } })
        const input = wrapper.find('input').element as HTMLInputElement

        fireRawInput(input, '')
        const digits = '06123456789' // 11 digits — mask only has 10 slots
        let raw = ''
        for (const d of digits) {
            raw += d
            fireRawInput(input, raw)
        }
        await nextTick()
        await nextTick()

        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted![emitted!.length - 1][0]).toBe('0612345678')
        expect(input.value).toBe('06 12 34 56 78')
    })
})
