import type { IActiveProps } from '../Commons/active.interface'
import type {
    IBgColorProps,
    IColorProps
} from '../Commons/color.interface'
import type { IBorderProps } from '../Commons/border.interface'
import type {
    ICommonsComponentProps,
    ITagProps
} from '../Commons/commons.interface'
import type { IDimensionProps } from '../Commons/dimension.interface'
import type { IElevationProps } from '../Commons/elevation.interface'
import type { IHoverProps } from '../Commons/hover.interface'
import type { ILocationProps } from '../Commons/location.interface'
import type { IMarginProps } from '../Commons/margin.interface'
import type { IPaddingProps } from '../Commons/padding.interface'
import type { IPositionProps } from '../Commons/position.interface'
import type { IRoundedProps } from '../Commons/rounded.interface'

import type { TDirectionBoth } from '../../types/Commons/anchor.type'
import type {
    TSheetSnapId,
    TSheetSnapPoint
} from '../../types/Sheet/sheet.type'

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
    /*********************************************************
     * handleLabel
     *
     * @description
     * Accessible name of the drag handle (its `aria-label`). Carries a
     * LOCALE KEY, not final text — it is resolved through the DS `t()`
     * mechanism, so the announcement follows the active locale with no
     * work from the consumer. Defaults to `'origam.sheet.handle.aria_label'`
     * ("Drag handle" / "Poignée de déplacement").
     * @description
     * A raw string matching no key is returned unchanged, so
     * `handle-label="Resize the panel"` still works for consumers who
     * prefer to translate on their side.
     * @description
     * Only meaningful when the handle renders at all, i.e. when the sheet
     * is both `swipeable` and `side="bottom"`.
     ********************************************************/
    handleLabel?: string
}

// `ISheetEmits` lives in its own file
// (`src/interfaces/Sheet/sheet-emits.interface.ts`) per the project
// convention that interface declarations are split per concern. It is
// re-exported through the `src/interfaces` barrel — consumers should
// `import type { ISheetEmits } from '@/interfaces'`.
