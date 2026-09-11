import type { IInternalListItem, IInternalListItemChildren, IItemProps } from '../../interfaces'

import { getPropertyFromItem, omit } from '../../utils'

/**
 * Transform list items.
 *
 * @param props …
 * @param items …
 */
export function transformListItems (props: IItemProps & { itemType?: string }, items: Array<(string | object)>) {
    const array: Array<IInternalListItemChildren> = []

    for (const item of items) {
        array.push(transformListItem(props, item))
    }

    return array
}

/**
 * Transform list item.
 *
 * @param props …
 * @param item  …
 * @returns …
 *
 * @note When `props.itemValue` is `undefined`, `getPropertyFromItem` returns
 * its fallback, which is `title` (the resolved title value). This is the
 * intentional Vuetify-like behaviour: without an explicit `itemValue` mapping,
 * the item's resolved title becomes both its display label and its selection
 * value. This is NOT a bug — it enables string arrays to work without any
 * additional configuration (e.g. `items: ['Alice', 'Bob']`).
 */
export function transformListItem (props: Omit<IItemProps, 'items'>, item: any): IInternalListItem {
    const title = getPropertyFromItem(item, props.itemTitle, item)
    const value = getPropertyFromItem(item, props.itemValue, title)
    const children = getPropertyFromItem(item, props.itemChildren)
    const itemProps = props.itemProps === true
        ? typeof item === 'object' && item != null && !Array.isArray(item)
            ? 'children' in item
                ? omit(item, ['children'])
                : item
            : undefined
        : getPropertyFromItem(item, props.itemProps)

    const _props = {
        title,
        value,
        ...itemProps
    }

    return {
        title: String(_props.title ?? ''),
        value: _props.value,
        props: _props,
        children: Array.isArray(children) ? transformListItems(props, children) : undefined,
        raw: item
    }
}
