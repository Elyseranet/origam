import type {
    IActiveProps,
    IBgColorProps,
    IBorderProps,
    IColorProps,
    ICommonsComponentProps,
    IDimensionProps,
    IElevationProps,
    IHoverProps,
    ILocationProps,
    IMarginProps,
    IPaddingProps,
    IPositionProps,
    IRoundedProps,
    ITagProps
} from '../../interfaces'

import type { TDirectionBoth, TSheetSnapId, TSheetSnapPoint } from '../../types'

export interface ISheetProps extends ITagProps, ICommonsComponentProps, IPaddingProps, IMarginProps, IColorProps, IBgColorProps, IBorderProps, IRoundedProps, IElevationProps, IDimensionProps, ILocationProps, IPositionProps, IActiveProps, IHoverProps {
    /**
     * Edge the sheet is anchored to. Drives the bottom-swipe gesture
     * (only `'bottom'` activates the touch-drag handle today; the other
     * sides reserve the prop for future "side-sheet" patterns).
     *
     * Defaults to `undefined` so existing consumers (Picker, Dialog,
     * ColorPickerField, PasswordField) keep their pre-Phase-3 layout.
     */
    side?: TDirectionBoth

    /**
     * Enable the mobile-style swipe-to-expand / swipe-to-dismiss
     * gesture. When true (and `side === 'bottom'`), the component
     * renders a drag handle and binds `useSheetSwipe`.
     *
     * False by default — every existing consumer of `OrigamSheet`
     * (notably `OrigamDialog`) inherits a no-op gesture layer.
     */
    swipeable?: boolean

    /**
     * Discrete snap-points the sheet can settle on between drags. The
     * height value is either a number (interpreted as px) or a CSS
     * length string (`'120px'`, `'50vh'`, `'90%'`).
     *
     * Defaults to closed/peek/half/full at 0 / 120px / 50vh / 90vh.
     */
    snapPoints?: ReadonlyArray<TSheetSnapPoint>

    /** Initial snap id when the sheet mounts. Defaults to `'half'`. */
    defaultSnap?: TSheetSnapId

    /**
     * v-model:open binding — `false` ⇄ `closed` snap, anything truthy
     * keeps the last non-closed snap (or `defaultSnap` on first mount).
     */
    open?: boolean

    /**
     * Disables the swipe gesture. The sheet stays at `defaultSnap` and
     * pointer events on the handle no-op.
     */
    disabled?: boolean

    /**
     * Persistent sheets cannot be swiped past `closed` — a fast
     * downward flick instead snaps to the next non-zero point (`peek`
     * by default). Mirrors `OrigamDialog`'s `persistent` semantics.
     */
    persistent?: boolean
}

// `ISheetEmits` lives in its own file
// (`src/interfaces/Sheet/sheet-emits.interface.ts`) per the project
// convention that interface declarations are split per concern. It is
// re-exported through the `src/interfaces` barrel — consumers should
// `import type { ISheetEmits } from '@/interfaces'`.
