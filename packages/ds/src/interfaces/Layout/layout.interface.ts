import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { IDimensionProps } from '../Commons/dimension.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'

/*********************************************************
 * ILayoutProps
 *
 * @description
 * Props for `<OrigamLayout>` itself — the only consumer. Issue #364
 * split this out of `interfaces/Commons/layout.interface.ts`, which
 * kept `ILayoutProvide` / `ILayer` / `ILayerItem` / `ILayoutItemProps`:
 * those four are genuinely transverse (consumed by App, BottomNav,
 * Drawer, SystemBar through `useLayoutItem`), this one is not.
 ********************************************************/
export interface ILayoutProps extends ICommonsComponentProps, IDimensionProps, IMarginProps, IPaddingProps, IRoundedProps, IElevationProps, IBgColorProps, IColorProps, IBorderProps {
    overlaps?: Array<string>
    fullHeight?: boolean
}

/** `<OrigamLayout>` registers layout items via `useCreateLayout` (a
 *  provide/inject registry) — nothing is emitted. */
export interface ILayoutEmits {}
