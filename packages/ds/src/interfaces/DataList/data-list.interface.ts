import type {
    IAdjacentProps,
    IBorderProps,
    IBgColorProps,
    IColorProps,
    ICommonsComponentProps,
    IDataListKVItem,
    IDataTextProps,
    IDataTitleProps,
    IDensityProps,
    IElevationProps,
    IMarginProps,
    IPaddingProps,
    IRoundedProps,
    ITypographyProps
} from "../../interfaces"

/**
 * Layout mode of `<OrigamDataList>`.
 *
 * - `"avatar"` (default, back-compat) — the historical `<dl>` layout
 *   where each item stacks a `<dt>` (title) above one or more `<dd>`
 *   rows (text). Items conform to {@link IDataItem}. The naming reflects
 *   the most common usage: a `prependAvatar` per title, with a stack of
 *   labels below — the Vuetify `v-list`-flavoured shape.
 *
 * - `"kv"` — the PDF-aligned key/value table where each row renders a
 *   key on the left (muted) and a value on the right (primary text or
 *   an inline component such as `<origam-chip>` / `<origam-avatar>`).
 *   Items conform to {@link IDataListKVItem}.
 */
export type TDataListMode = 'avatar' | 'kv'

export interface IDataListProps extends ICommonsComponentProps, IAdjacentProps, IColorProps, IBgColorProps, IMarginProps, IPaddingProps, IDensityProps, IBorderProps, IRoundedProps, IElevationProps, ITypographyProps {
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
