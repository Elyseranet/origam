import { describe, expect, it } from 'vitest'
import OrigamItemGroupItem from '@origam/components/ItemGroup/OrigamItemGroupItem.vue'
import { toKebabCase } from '@origam/utils/Commons/commons.util'

describe('probe', () => {
    it('name fields', () => {
        const def = OrigamItemGroupItem as any
        const resolved = toKebabCase(def.aliasName ?? def.name ?? def.__name)
        console.log('PROBE name=', def.name, '__name=', def.__name, 'resolved=', resolved)
        expect(resolved).toBe('origam-item-group-item')
    })
})
