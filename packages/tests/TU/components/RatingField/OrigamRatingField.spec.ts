// Unit tests for <OrigamRatingField>
//
// Strategy: mount with createOrigam() + stubs.
// We exercise:
//   - BEM root class: origam-rating-field
//   - modifier classes: --hover, --readonly
//   - v-model: clicking a star item stub sets modelValue to item value
//   - clearable: clear button appears when modelValue > 0 and not disabled
//   - length prop: renders the correct number of star items
//   - readonly: item click handler is a no-op (no emit)
//   - disabled: clear button absent
//   - halfIncrements: doubles the number of items per range slot
//   - custom label slot

import { describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { computed, defineComponent, nextTick } from 'vue'

import OrigamRatingField from '@origam/components/RatingField/OrigamRatingField.vue'
import { createOrigam } from '@origam/origam'

// ---------------------------------------------------------------------------
// Stubs
// ---------------------------------------------------------------------------

const OrigamInputStub = defineComponent({
    name: 'OrigamInput',
    inheritAttrs: false,
    props: {
        modelValue: {},
        id: String,
        disabled: Boolean,
        readonly: Boolean,
        style: [String, Array, Object]
    },
    emits: ['update:modelValue'],
    setup (props, { expose, attrs }) {
        expose({ filterProps: (_p: any, _e?: string[]) => ({}) })
        return {
            vAttrs: attrs,
            isDisabled: computed(() => !!props.disabled),
            isReadonly: computed(() => !!props.readonly)
        }
    },
    template: `
        <div v-bind="vAttrs" class="origam-input">
            <slot :id="id || 'rf-id'" :messagesId="'rf-msg'" :isDisabled="isDisabled" :isReadonly="isReadonly" :isValid="true"/>
            <slot name="prepend"/>
            <slot name="append"/>
        </div>
    `
})

// OrigamRatingFieldItem: records clicks; passes value as data-value attribute.
// IMPORTANT: must expose filterProps() so the parent's itemState computed
// can call origamRatingFieldItemRef.value.filterProps(props, [...excludes]).
const OrigamRatingFieldItemStub = defineComponent({
    name: 'OrigamRatingFieldItem',
    props: {
        value: [Number, String],
        index: Number,
        length: [Number, String],
        checked: Boolean,
        isFilled: Boolean,
        isHovered: Boolean,
        isHovering: Boolean,
        showStar: { type: Boolean, default: true },
        name: String
    },
    emits: [],
    setup (_, { expose }) {
        // Provide a real filterProps function that returns an empty object.
        // The parent calls this to get forwarded props for each item.
        expose({
            filterProps: (_props: any, _excludes?: string[]) => ({})
        })
        return {}
    },
    template: `
        <span
            class="origam-rating-field-item"
            :data-value="value"
            :data-checked="checked"
            :data-show-star="showStar"
            v-bind="$attrs"
        />
    `
})

const OrigamBtnStub = defineComponent({
    name: 'OrigamBtn',
    props: {
        icon: String,
        variant: String,
        size: String,
        'aria-label': String,
        class: [String, Array, Object]
    },
    emits: ['click'],
    template: `<button class="origam-btn origam-btn--clear" data-cy="rating-field-clear" @click="$emit('click', $event)"><slot/></button>`
})

const OrigamLabelStub = defineComponent({
    name: 'OrigamLabel',
    props: { text: String, required: Boolean },
    template: `<label class="origam-label">{{ text }}<slot/></label>`
})

// ---------------------------------------------------------------------------
// Mount helper
// ---------------------------------------------------------------------------

interface IMountOpts {
    props?: Record<string, unknown>
    slots?: Record<string, unknown>
}

function mountRating (opts: IMountOpts = {}): VueWrapper {
    return mount(OrigamRatingField, {
        attachTo: document.body,
        global: {
            plugins: [createOrigam()],
            stubs: {
                OrigamInput: OrigamInputStub,
                OrigamRatingFieldItem: OrigamRatingFieldItemStub,
                OrigamBtn: OrigamBtnStub,
                OrigamLabel: OrigamLabelStub,
                OrigamIcon: { template: '<i/>' }
            }
        },
        props: opts.props ?? {},
        slots: opts.slots ?? {}
    })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('OrigamRatingField — BEM root class', () => {
    it('renders the origam-rating-field class', () => {
        const wrapper = mountRating()
        expect(wrapper.find('.origam-rating-field').exists()).toBe(true)
    })

    it('adds --hover modifier when hover=true', () => {
        const wrapper = mountRating({ props: { hover: true } })
        expect(wrapper.find('.origam-rating-field--hover').exists()).toBe(true)
    })

    it('does NOT add --hover when hover is absent', () => {
        const wrapper = mountRating()
        expect(wrapper.find('.origam-rating-field--hover').exists()).toBe(false)
    })

    it('adds --readonly modifier when readonly=true', () => {
        const wrapper = mountRating({ props: { readonly: true } })
        expect(wrapper.find('.origam-rating-field--readonly').exists()).toBe(true)
    })
})

describe('OrigamRatingField — star count (length prop)', () => {
    it('renders 5 star items by default (length=5)', async () => {
        const wrapper = mountRating({ props: { modelValue: 0 } })
        await nextTick()
        // Default length=5 → 5 items with showStar=true, plus 1 empty item (showStar=false)
        const stars = wrapper.findAll('.origam-rating-field-item[data-show-star="true"]')
        expect(stars).toHaveLength(5)
    })

    it('renders 3 star items when length=3', async () => {
        const wrapper = mountRating({ props: { modelValue: 0, length: 3 } })
        await nextTick()
        const stars = wrapper.findAll('.origam-rating-field-item[data-show-star="true"]')
        expect(stars).toHaveLength(3)
    })

    it('renders 10 items when length=5 and halfIncrements=true', async () => {
        const wrapper = mountRating({ props: { modelValue: 0, length: 5, halfIncrements: true } })
        await nextTick()
        // halfIncrements doubles the items per position
        const stars = wrapper.findAll('.origam-rating-field-item[data-show-star="true"]')
        expect(stars).toHaveLength(10)
    })
})

describe('OrigamRatingField — v-model via onClick handler', () => {
    it('emits update:modelValue with the clicked star value', async () => {
        const wrapper = mountRating({ props: { modelValue: 0 } })
        await nextTick()
        // The onClick handler is passed as $attrs to the item stub
        // Items get their onClick from eventState — find the 3rd item (value=3)
        const items = wrapper.findAll('.origam-rating-field-item[data-show-star="true"]')
        expect(items.length).toBeGreaterThanOrEqual(3)
        // Trigger click on the 3rd star (index 2 → value=3)
        await items[2].trigger('click')
        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0][0]).toBe(3)
    })

    it('emits update:modelValue with value=1 when the first star is clicked', async () => {
        const wrapper = mountRating({ props: { modelValue: 0 } })
        await nextTick()
        const items = wrapper.findAll('.origam-rating-field-item[data-show-star="true"]')
        await items[0].trigger('click')
        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0][0]).toBe(1)
    })

    it('does NOT emit when disabled=true', async () => {
        const wrapper = mountRating({ props: { modelValue: 0, disabled: true } })
        await nextTick()
        const items = wrapper.findAll('.origam-rating-field-item[data-show-star="true"]')
        if (items.length > 0) {
            await items[0].trigger('click')
        }
        // disabled onClick is a no-op — no emit
        expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })

    it('does NOT emit when readonly=true', async () => {
        const wrapper = mountRating({ props: { modelValue: 0, readonly: true } })
        await nextTick()
        const items = wrapper.findAll('.origam-rating-field-item[data-show-star="true"]')
        if (items.length > 0) {
            await items[0].trigger('click')
        }
        expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })
})

describe('OrigamRatingField — clearable', () => {
    it('renders the clear button when clearable=true and modelValue > 0', async () => {
        const wrapper = mountRating({ props: { clearable: true, modelValue: 3 } })
        await nextTick()
        expect(wrapper.find('[data-cy="rating-field-clear"]').exists()).toBe(true)
    })

    it('does NOT render the clear button when modelValue=0', async () => {
        const wrapper = mountRating({ props: { clearable: true, modelValue: 0 } })
        await nextTick()
        expect(wrapper.find('[data-cy="rating-field-clear"]').exists()).toBe(false)
    })

    it('does NOT render the clear button when disabled=true', async () => {
        const wrapper = mountRating({ props: { clearable: true, modelValue: 3, disabled: true } })
        await nextTick()
        expect(wrapper.find('[data-cy="rating-field-clear"]').exists()).toBe(false)
    })

    it('does NOT render the clear button when readonly=true', async () => {
        const wrapper = mountRating({ props: { clearable: true, modelValue: 3, readonly: true } })
        await nextTick()
        expect(wrapper.find('[data-cy="rating-field-clear"]').exists()).toBe(false)
    })

    it('clicking the clear button emits update:modelValue with 0', async () => {
        const wrapper = mountRating({ props: { clearable: true, modelValue: 3 } })
        await nextTick()
        const clearBtn = wrapper.find('[data-cy="rating-field-clear"]')
        expect(clearBtn.exists()).toBe(true)
        await clearBtn.trigger('click')
        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        expect(emitted![0][0]).toBe(0)
    })
})

describe('OrigamRatingField — checked state', () => {
    it('marks the item as checked when its value equals modelValue', async () => {
        const wrapper = mountRating({ props: { modelValue: 2 } })
        await nextTick()
        const items = wrapper.findAll('.origam-rating-field-item[data-show-star="true"]')
        // Item at index 1 has value=2 → checked=true
        const secondItem = items[1]
        expect(secondItem.attributes('data-checked')).toBe('true')
    })

    it('does NOT mark items as checked when modelValue=0', async () => {
        const wrapper = mountRating({ props: { modelValue: 0 } })
        await nextTick()
        const checkedItems = wrapper.findAll('.origam-rating-field-item[data-checked="true"]')
        expect(checkedItems).toHaveLength(0)
    })
})

describe('OrigamRatingField — clearable toggle (re-click same value)', () => {
    it('clears to 0 when the same value is clicked again with clearable=true', async () => {
        const wrapper = mountRating({ props: { modelValue: 3, clearable: true } })
        await nextTick()
        // Click the already-selected star (3rd item, value=3)
        const items = wrapper.findAll('.origam-rating-field-item[data-show-star="true"]')
        await items[2].trigger('click')
        const emitted = wrapper.emitted('update:modelValue')
        expect(emitted).toBeTruthy()
        // Re-clicking the current value with clearable should emit 0
        expect(emitted![0][0]).toBe(0)
    })
})
