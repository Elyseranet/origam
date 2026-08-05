// SCRATCH — verifies the t(key, ...params) variadic contract directly,
// no browser / no timing dependency. Deleted after verification.
import { describe, expect, it } from 'vitest'
import { computed, ref } from 'vue'
import { createBuiltinAdapter } from '@origam/utils'

describe('SCRATCH — createBuiltinAdapter interpolation contract', () => {
    const messages = computed(() => ({
        en: {
            origam: {
                validation: { max_length: 'Maximum {0} characters' },
                fileField: { counterSize: '{0} files ({1} in total)' }
            }
        }
    }))

    const adapter = createBuiltinAdapter({
        current: ref('en'),
        fallback: ref('en'),
        messages: messages as any
    })

    it('OLD (buggy) call shape: t(key, [limit]) — array as single positional param', () => {
        // params = [[10]] -> params[0] is the array itself, not a primitive
        const result = adapter.t('origam.validation.max_length', [10])
        // eslint-disable-next-line no-console
        console.log('OLD shape result:', JSON.stringify(result))
        expect(result).toBe('Maximum  characters') // {0} resolves to '' — BUG
    })

    it('NEW (fixed) call shape: t(key, limit) — variadic positional param', () => {
        const result = adapter.t('origam.validation.max_length', 10)
        // eslint-disable-next-line no-console
        console.log('NEW shape result:', JSON.stringify(result))
        expect(result).toBe('Maximum 10 characters') // {0} resolves to '10' — CORRECT
    })

    it('OLD (buggy) two-param call shape: t(key, [count, size])', () => {
        const result = adapter.t('origam.fileField.counterSize', [3, '2.4 MB'])
        console.log('OLD 2-param result:', JSON.stringify(result))
        expect(result).toBe(' files ( in total)')
    })

    it('NEW (fixed) two-param call shape: t(key, count, size)', () => {
        const result = adapter.t('origam.fileField.counterSize', 3, '2.4 MB')
        console.log('NEW 2-param result:', JSON.stringify(result))
        expect(result).toBe('3 files (2.4 MB in total)')
    })
})
