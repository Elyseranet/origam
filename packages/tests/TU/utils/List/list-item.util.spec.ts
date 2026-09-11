import { describe, expect, it } from 'vitest'

import { transformListItem, transformListItems } from '@origam/utils/List/list-item.util'

// Minimal IItemProps without `items`
const baseProps = {
    itemTitle: 'title' as any,
    itemValue: 'value' as any,
    itemChildren: 'children' as any,
    itemProps: false as any,
    returnObject: false
}

describe('transformListItem', () => {
    describe('plain string items', () => {
        it('uses the string itself as both title and value when itemTitle/itemValue point to missing keys', () => {
            // For a string item, getPropertyFromItem falls back to the item itself for title,
            // then to title for value
            const result = transformListItem(baseProps, 'hello')
            expect(result.title).toBe('hello')
            expect(result.value).toBe('hello')
            expect(result.raw).toBe('hello')
        })
    })

    describe('plain object items', () => {
        it('extracts title and value using the configured keys', () => {
            const item = { title: 'Alice', value: 42 }
            const result = transformListItem(baseProps, item)
            expect(result.title).toBe('Alice')
            expect(result.value).toBe(42)
            expect(result.raw).toBe(item)
        })

        it('maps deeply-nested paths (dot notation) via getPropertyFromItem', () => {
            const props = { ...baseProps, itemTitle: 'meta.label' as any, itemValue: 'meta.id' as any }
            const item = { meta: { label: 'Deep', id: 99 } }
            const result = transformListItem(props, item)
            expect(result.title).toBe('Deep')
            expect(result.value).toBe(99)
        })

        it('returns children as a transformed array when present', () => {
            const item = {
                title: 'Parent',
                value: 1,
                children: [
                    { title: 'Child A', value: 2 },
                    { title: 'Child B', value: 3 }
                ]
            }
            const result = transformListItem(baseProps, item)
            expect(Array.isArray(result.children)).toBe(true)
            expect(result.children).toHaveLength(2)
            expect(result.children![0].title).toBe('Child A')
        })

        it('sets children to undefined when the item has no children property', () => {
            const item = { title: 'Leaf', value: 7 }
            const result = transformListItem(baseProps, item)
            expect(result.children).toBeUndefined()
        })
    })

    describe('itemProps spreading', () => {
        it('spreads own item props when itemProps is true', () => {
            const props = { ...baseProps, itemProps: true as any }
            const item = { title: 'Bob', value: 5, disabled: true }
            const result = transformListItem(props, item)
            expect((result.props as any).disabled).toBe(true)
        })

        it('omits children from spread props when itemProps is true and children exist', () => {
            const props = { ...baseProps, itemProps: true as any }
            const item = { title: 'Parent', value: 1, children: [{ title: 'C', value: 2 }] }
            const result = transformListItem(props, item)
            expect('children' in result.props!).toBe(false)
        })

        it('does not spread when itemProps is false', () => {
            const item = { title: 'Carol', value: 3, extra: 'should not appear' }
            const result = transformListItem(baseProps, item)
            expect('extra' in result.props!).toBe(false)
        })
    })

    describe('title coercion', () => {
        it('converts numeric title to string', () => {
            const item = { title: 123, value: 1 }
            const result = transformListItem(baseProps, item)
            expect(result.title).toBe('123')
        })

        it('converts null title to empty string', () => {
            const item = { title: null, value: 1 }
            const result = transformListItem(baseProps, item)
            expect(result.title).toBe('')
        })
    })
})

describe('transformListItems', () => {
    it('transforms each item in the array', () => {
        const items = [
            { title: 'X', value: 1 },
            { title: 'Y', value: 2 }
        ]
        const result = transformListItems(baseProps, items)
        expect(result).toHaveLength(2)
        expect(result[0].title).toBe('X')
        expect(result[1].title).toBe('Y')
    })

    it('returns an empty array for an empty input', () => {
        expect(transformListItems(baseProps, [])).toEqual([])
    })

    it('handles a mix of strings and objects', () => {
        const items: (string | object)[] = ['plain string', { title: 'Object', value: 99 }]
        const result = transformListItems(baseProps, items)
        expect(result[0].title).toBe('plain string')
        expect(result[1].title).toBe('Object')
    })
})
