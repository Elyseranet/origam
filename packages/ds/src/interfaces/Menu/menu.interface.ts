import type { ICommonsComponentEmits } from '../Commons/commons.interface'
import type { IListItemProps } from '../List/list-item.interface'
import type { IListProps } from '../List/list.interface'
import type { IOverlayProps } from '../Overlay/overlay.interface'

export interface IMenuProvide {
    register (): void

    unregister (): void

    closeParents (): void
}

/*********************************************************
 * IMenuProps
 *
 * @description
 * ⛔ OUTER adjacent surface stripped (#756). `IListItemProps` carries
 * `IAdjacentProps` (`prependIcon` / `appendIcon` / `prependAvatar` /
 * `appendAvatar` / `prependAriaLabel` / `appendAriaLabel`) because a LIST ROW
 * renders that zone. `<OrigamMenu>` does not: it renders rows from `items`,
 * and each row gets its media from the ITEM object (`{ title, prependIcon }`),
 * never from the menu's own props — `menuItemProps()` spreads the item, and
 * `overlayProps` is filtered down to what `<origam-overlay>` declares.
 *
 * @description
 * Measured, jsdom, sentinel values passed as props and grepped out of
 * `document.body.innerHTML`: `<origam-list-item>` renders
 * `.origam-list-item__prepend` / `__append` and carries the name;
 * `<origam-menu model-value items=…>` renders NO such node at all. The four
 * media props were already recorded as inert in
 * `guards/baseline/unconsumed-props.json`; the two name props would have
 * joined them, so the whole surface goes instead.
 *
 * @description
 * ⚠️ The REST of `IListItemProps` is still inherited and still largely inert
 * here (33 further entries in that same baseline: `href`, `to`, `tag`,
 * `ripple`, `subtitle`, `lines`, `slim`…). Narrowing those is a separate,
 * wider decision and is deliberately NOT done in this fix.
 ********************************************************/
export interface IMenuProps extends IOverlayProps, IListProps, Omit<IListItemProps, 'prependIcon' | 'appendIcon' | 'prependAvatar' | 'appendAvatar' | 'prependAriaLabel' | 'appendAriaLabel'> {
    id?: string
}

/** Emits fired by `<OrigamMenu>` — v-model on the open state, the
 *  native `contextmenu` bubble forwarded for parents that want to
 *  show their own context menu instead, and `select` when the user
 *  picks a leaf row of the `items` tree.
 *
 *  `select` matters because `<origam-menu :items="…">` renders its own
 *  rows: the consumer never gets a handle on the `<origam-list-item>`
 *  that receives the click. Without it, the only way to learn which row
 *  was picked is to hang an `onClick` on every item object. Rows that
 *  open a submenu do NOT emit — they are navigation, not a choice. */
export interface IMenuEmits extends ICommonsComponentEmits {
    (e: 'contextmenu', event: MouseEvent): void

    (e: 'select', item: IListItemProps): void
}

/** Slot signatures for `<OrigamMenu>`. `activator` only forwards the
 *  merged `props` bag (not the inner overlay's `isActive`) — matches
 *  the template's `v-bind="{props}"` (destructured from
 *  `#activator="{props}"`). */
export interface IMenuSlots {
    activator?: (data: { props: Record<string, unknown> }) => any
    default?: () => any
}
