import type {
    IBgColorProps,
    IBorderProps,
    IColorProps,
    ICommonsComponentProps,
    IDimensionProps,
    IElevationProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps
} from '../../interfaces'

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
