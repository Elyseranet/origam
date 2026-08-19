import type {
    IAdjacentEmits,
    IColorProps,
    ICommonsComponentProps,
    IHeaderCellProps,
    IInternalDataTableHeader,
    IInternalListItem
} from '../../interfaces'

/*********************************************************
 * IDataTableHeadersCellMobileProps / emits / slots
 *
 * @description
 * Props/emits/slots for `<OrigamDataTableHeadersCellMobile>` — the
 * only consumer. Split out of `interfaces/DataTable/headers.
 * interface.ts` under issue #364, which used to hold four distinct
 * component surfaces (Headers / HeadersCell / HeaderCell /
 * HeadersCellMobile) in one file.
 *
 * @description
 * Deliberately NOT `extends IAdjacentProps`. This cell has no
 * consumer-facing prepend/append icon prop — the `appendIcon` rendered
 * inside it is a purely internal computed (the multi-select checkbox
 * glyph, see `appendIcon` in `OrigamDataTableHeadersCellMobile.vue`)
 * forwarded to the nested `<OrigamSelect>`'s own `IAdjacentProps.appendIcon`.
 * There is no `prependIcon` counterpart because there is nothing for a
 * consumer to set — adding one would fabricate an API this component
 * doesn't have a use for.
 ********************************************************/
export interface IDataTableHeadersCellMobileProps extends ICommonsComponentProps, IHeaderCellProps, IColorProps {
    columns: Array<IInternalDataTableHeader>
    colspan?: number
}

/** Emits fired by `<OrigamDataTableHeadersCellMobile>` — clear button +
 *  prepend / append slot clicks. */
export interface IDataTableHeadersCellMobileEmits extends IAdjacentEmits {
    (e: 'click:clear', event: MouseEvent): void
}

/** Scope forwarded on the `select.chip` slot — the underlying list item
 *  behind the chip, its index, and the draft props the default chip
 *  render would receive (spread them to keep the built-in click/close
 *  wiring when only restyling the chip). */
export interface IDataTableHeadersCellMobileChipSlot {
    item: IInternalListItem
    index: number
    chipProps: Record<string, unknown>
}

/** Slot signatures for `<OrigamDataTableHeadersCellMobile>` — almost
 *  entirely pass-through onto the internal `<origam-select>` /
 *  `<origam-chip>` it renders (mobile "sort by" picker), so most slots
 *  carry no scope of their own; only `select.chip` exposes one. */
export interface IDataTableHeadersCellMobileSlots {
    'select.prepend'?: () => any
    'select.loader'?: () => any
    'select.prependInner'?: () => any
    'select.floatingLabel'?: () => any
    'select.label'?: () => any
    'select.prefix'?: () => any
    'select.chip'?: (props: IDataTableHeadersCellMobileChipSlot) => any
    'select.selection'?: () => any
    'select.noData'?: () => any
    'select.prependItem'?: () => any
    'select.item'?: () => any
    'select.appendItem'?: () => any
    'select.suffix'?: () => any
    'select.appendInner'?: () => any
    clear?: () => any
    'select.append'?: () => any
    'chip:prepend'?: () => any
    'chip:default'?: () => any
    'chip:append'?: () => any
    'chip:close'?: () => any
    'chip:filter'?: () => any
}
