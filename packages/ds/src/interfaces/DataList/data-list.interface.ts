import type { IAdjacentProps } from '../Commons/adjacent.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type { ICommonsComponentProps } from '../Commons/commons.interface'
import type { IDataListKVItem } from './data-list-kv-item.interface'
import type { IDataTextProps } from './data-text.interface'
import type { IDataTitleProps } from './data-title.interface'
import type { IDensityProps } from '../Commons/density.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'
import type { ITypographyProps } from '../Commons/typography.interface'

import type { TDataListMode } from '../../types/DataList/data-list.type'

export type { TDataListMode } from "../../types/DataList/data-list.type"

export interface IDataListProps extends ICommonsComponentProps, IAdjacentProps, IColorProps, IBgColorProps, IMarginProps, IPaddingProps, IDensityProps, IBorderProps, IRoundedProps, IElevationProps, Pick<ITypographyProps, 'fontSize' | 'fontWeight' | 'lineHeight' | 'letterSpacing'> {
    /**
     * Selects the layout. Defaults to `"avatar"` so existing call sites
     * keep their current rendering. Set to `"kv"` for the PDF-aligned
     * key/value rows.
     */
    mode?: TDataListMode
    /**
     * Source list. The runtime shape is gated by `mode`:
     *   • `mode="avatar"` → array (or keyed object) of {@link IDataItem};
     *   • `mode="kv"`     → array (or keyed object) of {@link IDataListKVItem}.
     *
     * The TS union accepts both — the component branches on `mode` to
     * decide which renderer takes over.
     */
    items?:
        | Array<IDataItem>
        | { [key: string]: IDataItem }
        | Array<IDataListKVItem>
        | { [key: string]: IDataListKVItem }
}

export interface IDataItem extends IAdjacentProps {
    title?: IDataTitleProps
    text?: Array<IDataTextProps> | { [key: string]: IDataTextProps }
}

/**
 * Slot signatures for `<OrigamDataList>`.
 *
 * Both layout modes (`avatar` / `kv`) share the same `default` slot name
 * but a different scope shape, so `default` widens to the union of both.
 * Per-row overrides are only known at runtime (`item-{index}` / `item-
 * {index}.key` / …), so they're expressed as template-literal index
 * signatures alongside the un-indexed fallback names (`item`, `key`,
 * `value`, `item.title`, …) the template also checks.
 */
/*********************************************************
 * IDataListEmits
 *
 * @description
 * `<OrigamDataList>` emits nothing of its own — both layout modes
 * (avatar / kv) are purely presentational, driven entirely by the
 * `items` prop. Kept empty (not extending `ICommonsComponentEmits`)
 * to avoid declaring a phantom `update:modelValue`.
 ********************************************************/
export interface IDataListEmits {}

export interface IDataListSlots {
    default?: (data: { items: Array<IDataItem> } | { items: Array<IDataListKVItem> }) => any
    key?: (data: { key: string, item: IDataListKVItem, index: number }) => any
    value?: (data: { key: string, value: IDataListKVItem['value'], item: IDataListKVItem, index: number }) => any
    item?: (data: { item: IDataItem, index: number }) => any
    'item.title'?: (data: Record<string, unknown>) => any
    'item.title.append'?: () => any
    'item.title.prepend'?: () => any
    'item.text'?: () => any
    'item.text.append'?: () => any
    'item.text.prepend'?: () => any
    [key: `item-${number}.key`]: ((data: { key: string, item: IDataListKVItem, index: number }) => any) | undefined
    [key: `item-${number}.value`]: ((data: { key: string, value: IDataListKVItem['value'], item: IDataListKVItem, index: number }) => any) | undefined
    [key: `item-${number}.title.append`]: (() => any) | undefined
    [key: `item-${number}.title.prepend`]: (() => any) | undefined
    [key: `item-${number}.title`]: ((data: Record<string, unknown>) => any) | undefined
    [key: `item-${number}.text.append`]: (() => any) | undefined
    [key: `item-${number}.text.prepend`]: (() => any) | undefined
    [key: `item-${number}.text`]: (() => any) | undefined
    [key: `item-${number}`]: ((data: { item: IDataItem, index: number }) => any) | undefined
}
