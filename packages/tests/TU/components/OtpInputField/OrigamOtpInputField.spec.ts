// Unit tests for <OrigamOtpInputField>
//
// The component renders N OrigamField+input cells. The OrigamField stub must
// expose `filterProps` because `fieldProps(index)` calls
// `origamFieldRef.value?.[index]?.filterProps(props, [...])`.

import { mount, type VueWrapper } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import OrigamOtpInputField from '@origam/components/OtpInputField/OrigamOtpInputField.vue'
import { createOrigam } from '@origam/origam'

// ---------------------------------------------------------------------------
// Re-mock jsdom observers
// ---------------------------------------------------------------------------

beforeEach(() => {
    global.ResizeObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() })
    global.IntersectionObserver = vi.fn(class { observe = vi.fn(); unobserve = vi.fn(); disconnect = vi.fn() })
})

// ---------------------------------------------------------------------------
// Stubs
// ---------------------------------------------------------------------------

// Critical: filterProps is exposed so fieldProps(index) call succeeds.
const OrigamFieldStub = {
    name: 'OrigamField',
    inheritAttrs: false,
    props: ['focused', 'id', 'class', 'style', 'label', 'variant', 'error', 'rounded', 'disabled'],
    setup () {
        return { filterProps: (_props: any, _exclude?: string[]) => ({}) }
    },
    template: `<div data-cy="origam-otp-field"><slot /></div>`
}

const OrigamOverlayStub = {
    name: 'OrigamOverlay',
    props: ['modelValue', 'contained', 'contentClass', 'persistent'],
    template: `<div data-cy="origam-otp-overlay"><slot name="loader"/></div>`
}

const OrigamProgressStub = {
    name: 'OrigamProgress',
    props: ['color', 'size', 'type', 'indeterminate', 'width'],
    template: `<div data-cy="origam-otp-progress" />`
}

const OrigamMessagesStub = {
    name: 'OrigamMessages',
    props: ['id', 'active', 'messages'],
    template: `<div data-cy="origam-otp-messages">{{ messages }}</div>`
}

// ---------------------------------------------------------------------------
// Mount helper
// ---------------------------------------------------------------------------

const mountOtpField = (props: Record<string, unknown> = {}): VueWrapper => {
    return mount(OrigamOtpInputField, {
        attachTo: document.body,
        props,
        global: {
            plugins: [createOrigam()],
            stubs: {
                OrigamField: OrigamFieldStub,
                OrigamOverlay: OrigamOverlayStub,
                OrigamProgress: OrigamProgressStub,
                OrigamMessages: OrigamMessagesStub
            }
        }
    })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('OrigamOtpInputField — root class', () => {
    it('carries origam-otp-input-field on the root div', () => {
        const wrapper = mountOtpField()
        expect(wrapper.element.classList.contains('origam-otp-input-field')).toBe(true)
    })

    it('adds origam-otp-input-field--divided when divider is set', () => {
        const wrapper = mountOtpField({ divider: '-' })
        expect(wrapper.element.classList.contains('origam-otp-input-field--divided')).toBe(true)
    })
})

describe('OrigamOtpInputField — cell count', () => {
    it('renders 6 input cells by default (length=6)', () => {
        const wrapper = mountOtpField()
        expect(wrapper.findAll('input[class="origam-otp-input-field__field"]')).toHaveLength(6)
    })

    it('renders 4 input cells when length=4', () => {
        const wrapper = mountOtpField({ length: 4 })
        expect(wrapper.findAll('input[class="origam-otp-input-field__field"]')).toHaveLength(4)
    })

    it('renders 8 input cells when length=8', () => {
        const wrapper = mountOtpField({ length: 8 })
        expect(wrapper.findAll('input[class="origam-otp-input-field__field"]')).toHaveLength(8)
    })
})

describe('OrigamOtpInputField — accessibility', () => {
    it('sets autocomplete="one-time-code" on every cell input', () => {
        const wrapper = mountOtpField({ length: 3 })
        for (const input of wrapper.findAll('input[class="origam-otp-input-field__field"]')) {
            expect(input.attributes('autocomplete')).toBe('one-time-code')
        }
    })

    it('sets aria-label on every cell', () => {
        const wrapper = mountOtpField({ length: 3 })
        for (const input of wrapper.findAll('input[class="origam-otp-input-field__field"]')) {
            expect(input.attributes('aria-label')).toBeTruthy()
        }
    })
})

describe('OrigamOtpInputField — placeholder', () => {
    it('forwards placeholder to all cell inputs', () => {
        const wrapper = mountOtpField({ length: 4, placeholder: '·' })
        for (const input of wrapper.findAll('input[class="origam-otp-input-field__field"]')) {
            expect(input.attributes('placeholder')).toBe('·')
        }
    })
})

describe('OrigamOtpInputField — disabled', () => {
    it('sets disabled on every cell input when disabled=true', () => {
        const wrapper = mountOtpField({ disabled: true })
        const inputs = wrapper.findAll('input[class="origam-otp-input-field__field"]')
        expect(inputs.length).toBeGreaterThan(0)
        for (const input of inputs) {
            expect(input.element.disabled).toBe(true)
        }
    })
})

describe('OrigamOtpInputField — v-model / hidden input', () => {
    it('renders a hidden input with the joined model value', async () => {
        const wrapper = mountOtpField({ modelValue: '123456', length: 6 })
        await nextTick()
        const hidden = wrapper.find('input[type="hidden"]')
        expect(hidden.exists()).toBe(true)
        expect(hidden.element.value).toBe('123456')
    })

    it('hidden input is empty when modelValue is null', async () => {
        const wrapper = mountOtpField({ modelValue: null, length: 6 })
        await nextTick()
        expect(wrapper.find('input[type="hidden"]').element.value).toBe('')
    })
})

describe('OrigamOtpInputField — divider', () => {
    it('renders divider spans between cells when divider is set', () => {
        const wrapper = mountOtpField({ length: 4, divider: '-' })
        const dividers = wrapper.findAll('.origam-otp-input-field__divider')
        expect(dividers).toHaveLength(3) // length-1 dividers
        expect(dividers[0].text()).toBe('-')
    })

    it('does not render divider spans when divider is not set', () => {
        const wrapper = mountOtpField({ length: 4 })
        expect(wrapper.findAll('.origam-otp-input-field__divider')).toHaveLength(0)
    })
})

describe('OrigamOtpInputField — type guard', () => {
    it('uses inputmode="numeric" for number type', () => {
        const wrapper = mountOtpField({ type: 'number' })
        for (const input of wrapper.findAll('input[class="origam-otp-input-field__field"]')) {
            expect(input.attributes('inputmode')).toBe('numeric')
        }
    })

    it('uses inputmode="text" for text type', () => {
        const wrapper = mountOtpField({ type: 'text' })
        for (const input of wrapper.findAll('input[class="origam-otp-input-field__field"]')) {
            expect(input.attributes('inputmode')).toBe('text')
        }
    })
})

describe('OrigamOtpInputField — loading overlay', () => {
    it('renders the overlay with modelValue=true when loading=true', () => {
        const wrapper = mountOtpField({ loading: true })
        expect(wrapper.findComponent({ name: 'OrigamOverlay' }).props('modelValue')).toBe(true)
    })

    it('renders the overlay with modelValue=false when loading=false', () => {
        const wrapper = mountOtpField({ loading: false })
        expect(wrapper.findComponent({ name: 'OrigamOverlay' }).props('modelValue')).toBe(false)
    })
})

describe('OrigamOtpInputField — details / validation messages', () => {
    it('renders the details section by default', () => {
        const wrapper = mountOtpField()
        expect(wrapper.find('.origam-otp-input-field__details').exists()).toBe(true)
    })

    it('hides the details section when hideDetails=true', () => {
        const wrapper = mountOtpField({ hideDetails: true })
        expect(wrapper.find('.origam-otp-input-field__details').exists()).toBe(false)
    })
})

describe('OrigamOtpInputField — expose: reset()', () => {
    it('reset() clears the model (hidden input becomes empty)', async () => {
        const wrapper = mountOtpField({ modelValue: '1234', length: 4 })
        await nextTick()
        expect(wrapper.find('input[type="hidden"]').element.value).toBe('1234')

        // vue-test-utils auto-unwraps refs exposed by defineExpose
        const vm = wrapper.vm as unknown as { reset: () => void }
        vm.reset()
        await nextTick()

        expect(wrapper.find('input[type="hidden"]').element.value).toBe('')
    })
})

// ---------------------------------------------------------------------------
// Typography surface — useTypography(props, 'otp-input-field__cell')
// ---------------------------------------------------------------------------
// The component wires useTypography with varPrefix 'otp-input-field__cell'
// and binds typographyStyles on <input class="origam-otp-input-field__field">.
// Note: the DOM class (__field) and the CSS-var prefix (__cell) differ —
// this is a pre-existing naming inconsistency in the SCSS, not a bug here.
//
// Only fontSize has a real visual effect: the SCSS __field block reads
// --origam-otp-input-field__cell---font-size. The other typography vars
// (fontWeight, lineHeight, letterSpacing, fontFamily) are emitted but inert
// (no matching SCSS rule for those vars) — they are not exercised here.

function cellStyle (props: Record<string, unknown> = {}): string {
    const wrapper = mountOtpField(props)
    return wrapper.find('input[class="origam-otp-input-field__field"]').attributes('style') || ''
}

describe('OrigamOtpInputField — typography (cell input)', () => {
    it('renders at least one cell input', () => {
        const wrapper = mountOtpField()
        expect(wrapper.find('input[class="origam-otp-input-field__field"]').exists()).toBe(true)
    })

    it('emits no typography override when no typo prop is set', () => {
        expect(cellStyle()).not.toContain('--origam-otp-input-field__cell---')
    })

    it('fontSize="xl" sets --origam-otp-input-field__cell---font-size on the cell input', () => {
        expect(cellStyle({ fontSize: 'xl' })).toContain('--origam-otp-input-field__cell---font-size: var(--origam-font__size---xl)')
    })

    it('fontSize="sm" sets --origam-otp-input-field__cell---font-size on the cell input', () => {
        expect(cellStyle({ fontSize: 'sm' })).toContain('--origam-otp-input-field__cell---font-size: var(--origam-font__size---sm)')
    })
})

/********************************************************
 *  KNOWN DEFECT — `label` excluded from the forwarded field props
 *
 *  @description ⛔ issue #491
 *  `fieldProps(index)` calls
 *  `origamFieldRef.value?.[index]?.filterProps(props, ['class', 'style', 'id', 'label'])`
 *  (OrigamOtpInputField.vue ~l.316) — `label` is in the exclude list, so it
 *  never reaches any `origam-field` cell: no rendered label, no aria-label,
 *  even though `label` is the primary usage example in the component's own
 *  doc. `OrigamFieldStub` above always returns `{}` from `filterProps`
 *  regardless of input, so it cannot exercise this — this block uses a
 *  faithful re-implementation of the real `filterProps` semantics
 *  (packages/ds/src/composables/Commons/props.composable.ts:58-70) instead.
 *
 *  @description
 *  `it.fails` here because the CORRECT behaviour (label reaches a cell) is
 *  what's asserted — it currently fails since the real exclude list drops it.
 *
 *  ⚠️ When this turns RED the defect is fixed — delete the `it.fails`
 *  wrapper (keep the assertion) rather than deleting the test.
 ********************************************************/
const OWN_FIELD_PROP_KEYS_491 = ['focused', 'id', 'class', 'style', 'label', 'variant', 'error', 'rounded', 'disabled']

const OrigamFieldFilteringStub = {
    name: 'OrigamField',
    inheritAttrs: false,
    props: OWN_FIELD_PROP_KEYS_491,
    setup () {
        return {
            filterProps: (properties: Record<string, unknown>, excludes: string[] = []) => {
                const picked: Record<string, unknown> = {}
                for (const key of OWN_FIELD_PROP_KEYS_491) {
                    if (!excludes.includes(key) && properties[key] !== undefined) picked[key] = properties[key]
                }
                return picked
            }
        }
    },
    template: `<div data-cy="origam-otp-field" :aria-label="label">{{ label }}<slot /></div>`
}

describe('OrigamOtpInputField — label forwarding (#491)', () => {
    it.fails('label reaches at least one origam-field cell', () => {
        const wrapper = mount(OrigamOtpInputField, {
            attachTo: document.body,
            props: { label: 'One-time passcode', length: 4 },
            global: {
                plugins: [createOrigam()],
                stubs: { OrigamField: OrigamFieldFilteringStub, OrigamOverlay: true, OrigamProgress: true, OrigamMessages: true }
            }
        })

        const cells = wrapper.findAll('[data-cy="origam-otp-field"]')
        expect(cells.length).toBeGreaterThan(0)
        const anyCellHasLabel = cells.some((c) => c.attributes('aria-label') === 'One-time passcode')
        expect(anyCellHasLabel).toBe(true)
    })
})
