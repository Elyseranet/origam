import type { InjectionKey, ShallowRef } from 'vue'
import type { ILayoutProvide } from '../../interfaces/Commons/layout.interface'

export const ORIGAM_LAYOUT_KEY: InjectionKey<ILayoutProvide> = Symbol.for('origam:layout')
export const ORIGAM_LAYOUT_ITEM_KEY: InjectionKey<ShallowRef<{ id: string; }>> = Symbol.for('origam:layout-item')

export const ROOT_ZINDEX = 1000

/*********************************************************
 * LAYOUT_ID_PREFIX
 *
 * @description
 * Prefix of the auto-generated layout id when the consumer does not pass
 * an explicit `id` prop — the uid produced by `getUid()` is appended
 * (`layout-42`). Drawer / Toolbar target it as a CSS selector, so the
 * value is part of the rendered DOM contract.
 ********************************************************/
export const LAYOUT_ID_PREFIX = 'layout-'

/*********************************************************
 * NESTED_LAYOUT_ZINDEX_STEP
 *
 * @description
 * Z-index decrement applied to each NESTED layout relative to its parent
 * layout, so a sub-layout and everything it registers always stack below
 * the items of the layout hosting it.
 ********************************************************/
export const NESTED_LAYOUT_ZINDEX_STEP = 100

/*********************************************************
 * LAYOUT_ITEM_ZINDEX_STEP
 *
 * @description
 * Z-index slots reserved per registered layout item. Two, because each
 * item owns a surface AND the scrim painted directly underneath it
 * (see `LAYOUT_SCRIM_ZINDEX_OFFSET`).
 ********************************************************/
export const LAYOUT_ITEM_ZINDEX_STEP = 2

/*********************************************************
 * LAYOUT_SCRIM_ZINDEX_OFFSET
 *
 * @description
 * Offset between a layout item and its own scrim — the scrim always sits
 * exactly one z-index below the surface it dims.
 ********************************************************/
export const LAYOUT_SCRIM_ZINDEX_OFFSET = 1

/*********************************************************
 * LAYOUT_ITEM_HIDDEN_OFFSET
 *
 * @description
 * Translate percentage applied to an INACTIVE layout item to push it off
 * screen. 110 rather than 100 so a drawer's box-shadow / border is moved
 * out of the viewport too instead of bleeding along the edge.
 ********************************************************/
export const LAYOUT_ITEM_HIDDEN_OFFSET = -110

/*********************************************************
 * LAYOUT_OVERLAP_SEPARATOR
 *
 * @description
 * Separator of an `overlaps` entry — `"<top-id>:<bottom-id>"` declares
 * that the first item is allowed to overlap the second.
 ********************************************************/
export const LAYOUT_OVERLAP_SEPARATOR = ':'

/*********************************************************
 * LAYOUT_DEFAULT_OFFSET
 *
 * @description
 * Fallback reserved-space value emitted when `convertToUnit` cannot
 * resolve a side of the main rect (no item registered on that side).
 ********************************************************/
export const LAYOUT_DEFAULT_OFFSET = '0px'

export const LAYOUT_CLASS = 'origam-layout'
export const LAYOUT_FULL_HEIGHT_CLASS = 'origam-layout--full-height'

/*********************************************************
 * LAYOUT_POSITION_VARS
 *
 * @description
 * CSS custom properties carrying the reserved space (drawer width,
 * toolbar height, …) per side. Emitted BOTH on the layout root (so every
 * descendant inherits them) and on the main rect, and consumed by
 * `OrigamMain` / `OrigamSnackbar` / `OrigamToolbar` via
 * `var(--origam-layout---position-*)`.
 *
 * @description
 * `as const` on purpose: the literal value types keep the computed keys
 * of the style objects exact instead of collapsing them into a string
 * index signature.
 ********************************************************/
export const LAYOUT_POSITION_VARS = {
    left: '--origam-layout---position-left',
    right: '--origam-layout---position-right',
    top: '--origam-layout---position-top',
    bottom: '--origam-layout---position-bottom'
} as const
