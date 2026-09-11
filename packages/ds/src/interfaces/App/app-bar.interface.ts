import type { ICommonsComponentEmits, IImgProps, ILayoutItemProps, IScrollProps, IToolbarProps } from '../../interfaces'

import type { TBlock } from "../../types"

/**
 * A docked AppBar's cross-axis size (`width` for a top/bottom bar) is owned by
 * the layout engine — it always spans `calc(100% - reservedLeft - reservedRight)`
 * so `main` / drawers offset correctly. Exposing `width` / `minWidth` /
 * `maxWidth` would be a lie (the layout overrides them), so they're omitted
 * from the surface. `height` stays: it defines the bar's reserved thickness.
 *
 * `floating` is also omitted: it sets `display: inline-flex` on the Toolbar to
 * shrink-wrap its content, but the layout forces the docked bar to full width
 * (`calc(100% - …)`), neutralising it. It only makes sense on a standalone
 * `OrigamToolbar`.
 *
 * `absolute` is omitted too: it only toggles `position: absolute` ↔ `fixed`
 * (both keep the bar pinned at `top: 0`; it does NOT make the bar scroll away —
 * that's `scroll-behavior="hide"`). The difference only shows in a contained /
 * non-full-viewport layout, which is a niche the `OrigamLayout` primitive still
 * covers. `height` stays — it defines the bar's reserved thickness.
 */
export interface IAppBarProps extends Omit<IToolbarProps, 'width' | 'minWidth' | 'maxWidth' | 'floating'>, Omit<ILayoutItemProps, 'absolute'>, IScrollProps {
    location?: TBlock
    image?: IImgProps
}

/** Emits fired by `<OrigamAppBar>` — v-model on the rail/expanded state. */
export interface IAppBarEmits extends ICommonsComponentEmits {}
