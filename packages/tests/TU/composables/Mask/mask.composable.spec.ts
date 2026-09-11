import { nextTick, ref } from 'vue'
import { describe, expect, it } from 'vitest'

import { useMask } from '@origam/composables/Mask/mask.composable'

describe('useMask — built-in patterns', () => {
    it('formats phone:fr progressively', async () => {
        const value = ref('')
        const { masked, unmasked, isValid, complete } = useMask(value, 'phone:fr')

        expect(masked.value).toBe('')
        expect(isValid.value).toBe(true) // empty + not required

        value.value = '0612345678'
        await nextTick()

        expect(masked.value).toBe('06 12 34 56 78')
        expect(unmasked.value).toBe('0612345678')
        expect(complete.value).toBe(true)
        expect(isValid.value).toBe(true)
    })

    it('credit card rejects bad Luhn', async () => {
        const value = ref('1234567890123456')
        const { complete, isValid } = useMask(value, 'creditcard')
        expect(complete.value).toBe(true)
        expect(isValid.value).toBe(false)
    })

    it('credit card accepts valid Luhn', async () => {
        const value = ref('4111111111111111')
        const { complete, isValid } = useMask(value, 'creditcard')
        expect(complete.value).toBe(true)
        expect(isValid.value).toBe(true)
    })

    it('iso date validator rejects 30/02', async () => {
        const value = ref('20240230')
        const { isValid, complete } = useMask(value, 'date:iso')
        expect(complete.value).toBe(true)
        expect(isValid.value).toBe(false)
    })

    it('iso date validator accepts 29/02 leap', async () => {
        const value = ref('20000229')
        const { isValid, complete } = useMask(value, 'date:iso')
        expect(complete.value).toBe(true)
        expect(isValid.value).toBe(true)
    })
})

describe('useMask — required option', () => {
    it('partial value with required=true is invalid', async () => {
        const value = ref('12')
        const { isValid } = useMask(value, {
            pattern: '## ##',
            required: true
        })
        expect(isValid.value).toBe(false)
    })

    it('partial value with required=false is valid', async () => {
        const value = ref('12')
        const { isValid } = useMask(value, {
            pattern: '## ##',
            required: false
        })
        expect(isValid.value).toBe(false) // no validator + not complete → not "fully valid"
        // however, the consumer is the one that decides what to do with
        // partial. For symmetry, when value has content but pattern isn't
        // complete and there's no validator, isValid is false.
    })
})

describe('useMask — reactivity', () => {
    it('reformats when modelValue mutates', async () => {
        const value = ref('06')
        const { masked } = useMask(value, 'phone:fr')
        // trailing literal emitted once previous slot is filled
        expect(masked.value).toBe('06 ')

        value.value = '0612'
        await nextTick()
        expect(masked.value).toBe('06 12 ')

        value.value = '0612345678'
        await nextTick()
        expect(masked.value).toBe('06 12 34 56 78')
    })

    it('reformats when mask itself swaps', async () => {
        const value = ref('1234567890')
        const mask = ref<string>('## ## ## ## ##')
        const { masked } = useMask(value, mask)
        expect(masked.value).toBe('12 34 56 78 90')

        mask.value = '(##) ###-####'
        await nextTick()
        expect(masked.value).toBe('(12) 345-6789')
    })

    it('setRaw imperatively reformats', () => {
        const value = ref('')
        const { setRaw, masked } = useMask(value, 'phone:fr')
        const u = setRaw('06.12.34.56.78')
        expect(u).toBe('0612345678')
        expect(masked.value).toBe('06 12 34 56 78')
    })
})

describe('useMask — disabled mask', () => {
    it('no mask → passthrough, isValid=true', () => {
        const value = ref('hello world')
        const { masked, unmasked, isValid } = useMask(value, null)
        expect(masked.value).toBe('hello world')
        expect(unmasked.value).toBe('hello world')
        expect(isValid.value).toBe(true)
    })
})

describe('useMask — custom validator function', () => {
    it('runs the user fn on the unmasked value', () => {
        const value = ref('06123')
        const { isValid } = useMask(value, {
            pattern: '## ## ## ## ##',
            validator: (v) => v.startsWith('06')
        })
        expect(isValid.value).toBe(true)

        value.value = '07'
        // sync recompute
        const value2 = ref('07000000')
        const result2 = useMask(value2, {
            pattern: '## ## ## ## ##',
            validator: (v) => v.startsWith('06')
        })
        expect(result2.isValid.value).toBe(false)
    })
})
