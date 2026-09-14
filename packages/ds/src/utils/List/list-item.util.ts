import type { IItemProps } from '../../interfaces/Commons/item.interface'
import type { IInternalListItemChildren } from '../../interfaces/List/list-children.interface'

import { getPropertyFromItem, omit } from '../Commons/commons.util'

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
 *
 * @note (#424) `transformListItem` never read `props.itemType`, so a structural
 * entry (`{ type: 'divider' }`, `{ type: 'subheader', title: '…' }`) never
 * carried a `type` field forward — `OrigamListChildren.hasDivider` /
 * `hasSubheader` only match on `item.type`, so those entries silently fell
 * through to the default `OrigamListItem` branch instead of rendering as a
 * divider/subheader. Compounding it, a divider item has no resolvable
 * `title` key, so the raw-item fallback above (intentional for primitive
 * items) surfaced the whole raw object as `_props.title`; since only the
 * top-level `title` field was ever run through `String()`, the un-stringified
 * object reached the ListItem's `title` prop and Vue's `toDisplayString`
 * rendered it as a literal JSON dump. Both are fixed here: `type` is now
 * read and forwarded, and `_props.title` gets the same `String()` coercion
 * as the top-level field so no raw value can leak through `props`.
 */
export function transformListItem (props: Omit<IItemProps, 'items'> & { itemType?: string }, item: any): IInternalListItemChildren {
    const type = getPropertyFromItem(item, props.itemType)
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

    _props.title = String(_props.title ?? '')

    return {
        title: _props.title,
        value: _props.value,
        type,
        props: _props,
        children: Array.isArray(children) ? transformListItems(props, children) : undefined,
        raw: item
    }
}
